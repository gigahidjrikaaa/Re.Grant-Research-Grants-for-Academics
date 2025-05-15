from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Union, Optional, TYPE_CHECKING
import re

from jose import jwt, JWTError
from passlib.context import CryptContext
from app import crud, schemas
from app.models import User
from siwe import SiweMessage # type: ignore

from eth_utils import to_checksum_address

from app.core.config import settings
from sqlalchemy.orm import Session

if TYPE_CHECKING: # This block is only for type checkers, not at runtime
    from app.models.user import User as UserModel # Alias to avoid conflict if needed
    from app.schemas.user import UserCreate as UserCreateSchema

# For traditional password hashing (e.g., for admin users if they don't use wallet auth)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
SECRET_KEY = settings.SECRET_KEY

def create_access_token(
    subject: Union[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)} # 'sub' is typically the user identifier (e.g., wallet_address or user_id)
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# --- SIWE Related Functions ---
#! Store nonces in memory for simplicity in a hackathon.
#! For production, use Redis or a database with TTL.
NONCES: dict[str, datetime] = {}

def generate_nonce(address: str) -> str:
    import secrets
    nonce = secrets.token_hex(16)
    # Store nonce associated with the address and the nonce itself for easier lookup/deletion
    # Keying by address + nonce makes it unique per attempt
    nonce_key = address.lower() + ":" + nonce
    NONCES[nonce_key] = datetime.now(timezone.utc) + timedelta(seconds=settings.SIWE_NONCE_EXPIRY_SECONDS)
    print(f"Generated nonce: {nonce} for address: {address}. Stored key: {nonce_key}") # For debugging
    return nonce

def parse_eip4361_message_to_dict(message_string: str) -> Dict[str, Any]:
    """
    Manually parses an EIP-4361 message string into a dictionary of fields.
    This is a simplified parser; a more robust one would handle all optional fields
    and multi-line resources more carefully.
    """
    parsed = {}
    lines = message_string.strip().split('\n')

    # Line 1: Domain and Address intro
    # Example: "127.0.0.1:3000 wants you to sign in with your Ethereum account:"
    match_domain_intro = re.match(r"^(.*?) wants you to sign in with your Ethereum account:$", lines[0])
    if match_domain_intro:
        parsed["domain"] = match_domain_intro.group(1).strip()
    
    # Line 2: Address
    if len(lines) > 1:
        parsed["address"] = lines[1].strip()

    # Optional Statement can be multi-line, ending before "URI:"
    # This is a simplified way; a robust parser would handle newlines within statement better.
    statement_lines = []
    current_line_index = 2
    while current_line_index < len(lines) and not lines[current_line_index].strip().startswith("URI:"):
        if lines[current_line_index].strip(): # Only add non-empty lines
             statement_lines.append(lines[current_line_index].strip())
        current_line_index += 1
    if statement_lines:
        parsed["statement"] = "\n".join(statement_lines)
    
    # Key-value pairs
    for i in range(current_line_index, len(lines)):
        line = lines[i].strip()
        if line.startswith("URI:"):
            parsed["uri"] = line.split("URI:")[1].strip()
        elif line.startswith("Version:"):
            parsed["version"] = line.split("Version:")[1].strip()
        elif line.startswith("Chain ID:"):
            parsed["chain_id"] = int(line.split("Chain ID:")[1].strip()) # Assuming integer
        elif line.startswith("Nonce:"):
            parsed["nonce"] = line.split("Nonce:")[1].strip()
        elif line.startswith("Issued At:"):
            parsed["issued_at"] = line.split("Issued At:")[1].strip()
        elif line.startswith("Expiration Time:"):
            parsed["expiration_time"] = line.split("Expiration Time:")[1].strip()
        elif line.startswith("Not Before:"):
            parsed["not_before"] = line.split("Not Before:")[1].strip()
        elif line.startswith("Request ID:"):
            parsed["request_id"] = line.split("Request ID:")[1].strip()
        # Resources are trickier (multi-line, optional) - simplified here
        # elif line.startswith("Resources:"):
        #     # Handle resource lines if necessary
        #     pass
            
    # Ensure required fields for SiweMessage Pydantic model are present, even if None
    for req_field in ["domain", "address", "uri", "version", "chain_id", "nonce", "issued_at"]:
        if req_field not in parsed:
            # This indicates a parsing failure for a required field.
            # SiweMessage Pydantic model might require these to be non-None or handle defaults.
            # For simplicity, we can set them to None or raise an error if critical.
            # However, the SiweMessage library *should* have defaults or handle missing optional fields.
            # The Pydantic errors you saw were because *all* these were missing.
            print(f"Warning: Field '{req_field}' not found during manual parsing.")
            # parsed[req_field] = None # Or handle appropriately

    return parsed

def verify_siwe_signature(
    db: Session,
    message: str, # The full EIP-4361 message string
    signature: str,
    provided_address: str, # The address the client claims to be
    provided_nonce: str # Nonce client claims was used
) -> Optional['UserModel']:
    """
    Verifies a SIWE message signature.
    If valid, returns the user associated with the address, creating one if it doesn't exist.
    """
    try:
        print(f"[SIWE Verify] Input: address={provided_address}, nonce={provided_nonce}, sig={signature[:10]}...")
        print(f"[SIWE Verify Backend] Received raw message string for parsing:\n-----\n{message}\n-----")

        # 1. Manually parse the message string into a dictionary of fields
        parsed_fields = parse_eip4361_message_to_dict(message)
        print(f"[SIWE Verify] Manually Parsed Fields: {parsed_fields}")

        # Check if essential fields were parsed, especially those needed by SiweMessage constructor
        # or for our subsequent nonce/address checks.
        if not all(parsed_fields.get(f) for f in ["domain", "address", "uri", "version", "chain_id", "nonce", "issued_at"]):
            print("[SIWE Verify ERROR] Manual parsing failed to extract all required fields.")
            return None

        # 2. Initialize SiweMessage with the dictionary of parsed fields
        # This should now pass Pydantic validation if all required fields are in parsed_fields.
        siwe_message = SiweMessage(**parsed_fields)
        print(f"[SIWE Verify] SiweMessage object created from parsed fields.")
        print(f"SiweMessage internal state: {siwe_message.model_dump_json(indent=2) if hasattr(siwe_message, 'model_dump_json') else vars(siwe_message)}")


        # 3. Nonce Check
        # The nonce from the *parsed message object* must match the *provided_nonce* from the /nonce endpoint.
        if siwe_message.nonce != provided_nonce:
            print(f"Nonce mismatch! Nonce from signed message ('{siwe_message.nonce}') does not match the nonce initially provided to client ('{provided_nonce}').")
            return None

        # Verify the nonce from the message against what was provided and stored
        # The nonce should be part of the message the user signed.
        # The client sends back the nonce it used in the message, which should match the one generated.
        nonce_key = provided_address.lower() + ":" + siwe_message.nonce

        if not (nonce_key in NONCES and NONCES[nonce_key] >= datetime.now(timezone.utc)):
            print(f"Nonce '{siwe_message.nonce}' for address '{provided_address}' is invalid, not found, or expired in server store.")
            if nonce_key in NONCES: del NONCES[nonce_key]
            return None
        print(f"[SIWE Verify] Nonce '{siwe_message.nonce}' is valid.")

        # 4. Signature Verification using the SiweMessage object
        print(f"[SIWE Verify] Calling siwe_message.verify() with sig='{signature[:10]}...'")
        siwe_message.verify(
            signature=signature,
            # domain, nonce, etc., are now part of the siwe_message object itself.
            # The verify method will use these internal values.
            # You might still need to pass timestamp for time-based checks.
            timestamp=datetime.now(timezone.utc)
        )
        print("[SIWE Verify] siwe_message.verify() call successful.")

        # 5. Address Check
        signer_address = to_checksum_address(siwe_message.address) # Address from the parsed and verified message
        if signer_address.lower() != provided_address.lower():
            print(f"Address mismatch after signature verification. Signer: {signer_address}, Provided: {provided_address}")
            del NONCES[nonce_key]
            return None
        print(f"[SIWE Verify] Provided address matches message signer address.")

        # 6. Invalidate Nonce
        del NONCES[nonce_key]
        print(f"[SIWE Verify] Nonce '{siwe_message.nonce}' (key: {nonce_key}) deleted from store.")

        # 7. Get or create user
        user = crud.user.get_user_by_wallet_address(db, wallet_address=signer_address)
        if not user:
            user_create_data = schemas.user.UserCreate(wallet_address=signer_address)
            user = crud.user.create_user(db, user_in=user_create_data)
        
        if not user or not user.is_active:
            return None
            
        return user

    except ValueError as e:
        print(f"[SIWE Verify ERROR - ValueError]: {e}")
        # Clean up nonce based on provided_nonce as siwe_message.nonce might not be available/reliable
        potential_nonce_key = provided_address.lower() + ":" + provided_nonce
        if potential_nonce_key in NONCES: del NONCES[potential_nonce_key]
        return None
    except Exception as e:
        print(f"[SIWE Verify ERROR - General Exception]: {type(e).__name__} - {e}")
        potential_nonce_key = provided_address.lower() + ":" + provided_nonce
        if potential_nonce_key in NONCES: del NONCES[potential_nonce_key]
        return None

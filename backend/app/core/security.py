from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional

from jose import jwt, JWTError
from passlib.context import CryptContext
from siwe import SiweMessage # type: ignore # For SIWE
from eth_account.messages import encode_defunct # For personal_sign style messages
from eth_utils import recover_signature, to_checksum_address

from app.core.config import settings
from app import models, schemas, crud # To interact with User model if needed
from sqlalchemy.orm import Session

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
    # A more robust nonce would be a cryptographically secure random string
    # For SIWE, the nonce is typically a random alphanumeric string.
    import secrets
    nonce = secrets.token_hex(16)
    NONCES[address.lower() + nonce] = datetime.now(timezone.utc) + timedelta(seconds=settings.SIWE_NONCE_EXPIRY_SECONDS)
    return nonce

def verify_siwe_signature(
    db: Session,
    message: str, # The full EIP-4361 message string
    signature: str,
    provided_address: str, # The address the client claims to be
    nonce: str # The nonce that was issued for this session
) -> Optional[models.User]:
    """
    Verifies a SIWE message signature.
    If valid, returns the user associated with the address, creating one if it doesn't exist.
    """
    try:
        # 1. Parse the SIWE message
        siwe_message = SiweMessage(message=message)

        # 2. Check if the nonce is valid and matches the one we expect for this address
        nonce_key = provided_address.lower() + siwe_message.nonce # Use nonce from parsed message
        if nonce_key not in NONCES or NONCES[nonce_key] < datetime.now(timezone.utc) or siwe_message.nonce != nonce:
            print(f"Nonce verification failed. Expected: {nonce}, Got from message: {siwe_message.nonce}, Stored key: {nonce_key}, Expiry: {NONCES.get(nonce_key)}")
            return None
        
        # 3. Verify the signature against the parsed message
        # The SiweMessage object has a verify method that handles EIP-1271 for contract wallets too.
        # It requires the signature as bytes.
        signature_bytes = bytes.fromhex(signature.replace("0x", ""))
        siwe_message.verify(signature_bytes, domain=settings.PROJECT_NAME) # Or your frontend domain, ensure it matches message.domain
                                                                 # nonce is already part of siwe_message object.

        # 4. Signature is valid, address from message is the signer
        signer_address = to_checksum_address(siwe_message.address)

        # 5. Ensure the address in the message matches the address initiating the login
        if signer_address.lower() != provided_address.lower():
            print(f"Address mismatch. Signer: {signer_address}, Provided: {provided_address}")
            return None

        # 6. Invalidate the nonce
        del NONCES[nonce_key]

        # 7. Get or create user
        user = crud.user.get_user_by_wallet_address(db, wallet_address=signer_address)
        if not user:
            user_in = schemas.UserCreate(wallet_address=signer_address, email=None, full_name=None) # Or try to get email from SIWE if provided
            user = crud.user.create_user(db, user_in=user_in)
        
        # Update last login or activity if needed
        # user.last_login = datetime.now(timezone.utc)
        # db.commit()
        
        return user

    except Exception as e: # Catches SiweMessage exceptions (InvalidSignature, ExpiredMessage, etc.) and others
        print(f"SIWE verification error: {e}")
        # You might want to log specific SiweError types differently
        return None
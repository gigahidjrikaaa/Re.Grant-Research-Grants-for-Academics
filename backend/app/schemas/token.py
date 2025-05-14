from pydantic import BaseModel
from typing import Optional

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None # Subject (e.g., user_id or wallet_address)

# For SIWE nonce request/response
class NonceResponse(BaseModel):
    nonce: str
    address: str # The address for which the nonce was generated

class SIWELoginData(BaseModel):
    message: str # The full EIP-4361 message string
    signature: str # The signature from the user's wallet
    address: str # The wallet address performing the login
    nonce: str # The nonce that was part of the message
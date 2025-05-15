from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer # We might use this for expecting JWT later
from sqlalchemy.orm import Session
from typing import Annotated, Any
from datetime import timedelta

from app import crud, models, schemas
from app.core import security
from app.db.session import get_db
from app.core.config import settings

router = APIRouter()

# This is for PROTECTED routes, to get the current user from a JWT
# We will define get_current_user in deps.py later
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/token") # Example if you had a form login

@router.get("/siwe/nonce", response_model=schemas.NonceResponse)
async def get_siwe_nonce(
    wallet_address: Annotated[str, Query(description="The wallet address to generate a nonce for.")]
) -> Any:
    """
    Generate a nonce for SIWE for a given wallet address.
    """
    if not wallet_address:
        raise HTTPException(status_code=400, detail="Wallet address is required")
    
    # Basic validation for address format (can be more robust)
    if not (wallet_address.startswith("0x") and len(wallet_address) == 42):
        raise HTTPException(status_code=400, detail="Invalid wallet address format")

    nonce = security.generate_nonce(address=wallet_address)
    return {"nonce": nonce, "address": wallet_address}


@router.post("/siwe/login", response_model=schemas.Token)
async def login_with_siwe(
    *,
    db: Session = Depends(get_db),
    login_data: schemas.SIWELoginData
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests after SIWE.
    """
    user = security.verify_siwe_signature(
        db=db,
        message=login_data.message,
        signature=login_data.signature,
        provided_address=login_data.address,
        provided_nonce=login_data.nonce
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="SIWE verification failed or invalid signature/nonce.",
            headers={"WWW-Authenticate": "Bearer"}, # Though this is more for OAuth bearer
        )
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.wallet_address, expires_delta=access_token_expires # Use wallet_address as subject
    )
    return {"access_token": access_token, "token_type": "bearer"}

# You might add a /me endpoint here later to test the token
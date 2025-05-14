from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.config import settings
from app.db.session import get_db
from app.core.security import ALGORITHM # SECRET_KEY is already in settings

# Define the OAuth2 scheme. tokenUrl points to your login endpoint
# For SIWE, the "token" is the JWT you issue *after* successful SIWE verification.
# So, clients won't directly post to this tokenUrl with username/password.
# This scheme is primarily for FastAPI to understand how to extract the token from Authorization header.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/siwe/login" # Or a dedicated /token endpoint if you make one
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[ALGORITHM]
        )
        wallet_address: Optional[str] = payload.get("sub")
        if wallet_address is None:
            raise credentials_exception
        # token_data = schemas.TokenPayload(sub=wallet_address) # Pydantic validation if needed
    except (JWTError, ValidationError) as e:
        print(f"JWT Decode/Validation Error: {e}")
        raise credentials_exception
    
    user = crud.user.get_user_by_wallet_address(db, wallet_address=wallet_address)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=403, detail="The user doesn't have enough privileges"
        )
    return current_user
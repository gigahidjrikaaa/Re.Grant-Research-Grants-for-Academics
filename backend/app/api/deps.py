from typing import TYPE_CHECKING, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError # Keep if you plan to use TokenPayload schema
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
# ALGORITHM is used via settings.ALGORITHM

import logging
logger = logging.getLogger(__name__)
# Ensure basicConfig is called once, e.g., in main.py or a central logging setup
# logging.basicConfig(level=logging.INFO) # Can be removed if configured globally

if TYPE_CHECKING:
    from app.models.user import User as UserModel
    # from app.schemas.token import TokenPayload # Uncomment if you use this

# This is mainly for OpenAPI documentation to know where the token can be obtained
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/siwe/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> 'UserModel':
    # Import crud locally within the function if there's any remote possibility of
    # import cycles during initial app load, or if models are extensive.
    # For a well-structured app, top-level imports in deps.py are often fine.
    from app import crud

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", # Keep detail somewhat generic for security
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        wallet_address_from_token: Optional[str] = payload.get("sub")
        if not wallet_address_from_token:
            logger.warning("JWT 'sub' claim (wallet_address) missing from token payload.")
            raise credentials_exception

        # Optional: Validate payload further with a Pydantic schema if desired
        # try:
        #     from app.schemas.token import TokenPayload
        #     token_data = TokenPayload(sub=wallet_address_from_token)
        # except ValidationError as e_val:
        #     logger.warning(f"JWT payload structure invalid: {e_val}")
        #     raise credentials_exception
        # except ImportError: # TokenPayload schema not found
        #     pass


    except JWTError as e_jwt:
        logger.warning(f"JWT decoding/validation error: {e_jwt}")
        raise credentials_exception
    except Exception as e_decode: # Catch any other unexpected error during decode
        logger.error(f"Unexpected error processing token: {type(e_decode).__name__} - {e_decode}", exc_info=True)
        raise credentials_exception # Or a 500 for truly unexpected server errors

    user = crud.user.get_user_by_wallet_address(db, wallet_address=wallet_address_from_token)
    
    if user is None:
        logger.warning(f"User not found in DB for wallet_address from token: {wallet_address_from_token}")
        raise credentials_exception
    
    # logger.info(f"User {user.wallet_address} authenticated via token.") # Optional info log
    return user


def get_current_active_user(
    current_user: 'UserModel' = Depends(get_current_user),
) -> 'UserModel':
    if not current_user.is_active:
        logger.warning(f"Authentication attempt by inactive user: {current_user.wallet_address}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: 'UserModel' = Depends(get_current_active_user),
) -> 'UserModel':
    if not hasattr(current_user, 'is_superuser') or not current_user.is_superuser:
        logger.warning(f"Non-superuser attempt to access superuser route: User {current_user.wallet_address}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="The user doesn't have enough privileges"
        )
    return current_user
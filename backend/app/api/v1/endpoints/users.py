from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, List, Optional
from pydantic import ValidationError # For explicit validation catch

from app import crud, models, schemas
from app.api import deps
from app.db.session import get_db

import logging
logger = logging.getLogger(__name__)
# logging.basicConfig(level=logging.INFO) # Configure globally if not done

router = APIRouter()

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user_endpoint( # Keep synchronous if CRUD ops are sync
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
    # For admin-only creation, uncomment:
    # current_admin: models.User = Depends(deps.get_current_active_superuser)
) -> schemas.User: # Return Pydantic model for consistency and explicit validation
    logger.info(f"Attempting to create user for wallet: {user_in.wallet_address}")
    user = crud.user.get_user_by_wallet_address(db, wallet_address=user_in.wallet_address)
    if user:
        logger.warning(f"User with wallet {user_in.wallet_address} already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, # 400 or 409 Conflict
            detail="A user with this wallet address already exists in the system.",
        )
    if user_in.email:
        user_by_email = crud.user.get_user_by_email(db, email=user_in.email)
        if user_by_email:
            logger.warning(f"User with email {user_in.email} already exists.")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, # 400 or 409 Conflict
                detail="A user with this email already exists in the system.",
            )
    created_user_model = crud.user.create_user(db=db, user_in=user_in)
    logger.info(f"User created successfully: {created_user_model.wallet_address}")
    # Explicitly validate and return the Pydantic schema instance
    return schemas.User.model_validate(created_user_model)


@router.get("/", response_model=schemas.UserList)
def read_users_endpoint( # Keep synchronous
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user: models.User = Depends(deps.get_current_active_user), # Protect if needed
) -> Any: # Or schemas.UserList directly
    # logger.info(f"Fetching users - Skip: {skip}, Limit: {limit}")
    users_db = crud.user.get_users(db, skip=skip, limit=limit)
    total_users = db.query(models.User).count()
    # Explicitly convert each user model to the Pydantic schema for the list
    users_schema = [schemas.User.model_validate(user) for user in users_db]
    return {"users": users_schema, "total": total_users}


@router.get("/me", response_model=schemas.User)
async def read_users_me( # Kept async to match your original, though could be sync
    current_user_model: models.User = Depends(deps.get_current_active_user),
) -> schemas.User: # Explicitly return the Pydantic schema type
    logger.info(f"Fetching details for current user: {current_user_model.wallet_address}")
    try:
        # Validate the SQLAlchemy model instance against the Pydantic response model
        # This ensures the data structure is correct before FastAPI does it implicitly.
        user_response_schema = schemas.User.model_validate(current_user_model)
        return user_response_schema
    except ValidationError as e_val:
        logger.error(f"Pydantic ValidationError during /users/me response serialization for {current_user_model.wallet_address}: {e_val.errors()}")
        # This error should ideally be caught by FastAPI and returned as 422,
        # but raising it explicitly ensures it's handled if FastAPI's implicit handling changes.
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error serializing user data: {e_val.errors()}")
    except Exception as e_serial: # Catch other unexpected serialization errors
        logger.error(f"Unexpected EXCEPTION during /users/me response preparation for {current_user_model.wallet_address}: {type(e_serial).__name__} - {e_serial}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error processing user data.")


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id_endpoint( # Keep synchronous
    user_id: int,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(deps.get_current_active_user), # Protect
) -> schemas.User:
    # logger.info(f"Fetching user by ID: {user_id}")
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        logger.warning(f"User with ID {user_id} not found.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return schemas.User.model_validate(db_user)
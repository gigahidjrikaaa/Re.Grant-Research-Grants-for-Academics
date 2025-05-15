from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any

from app import crud, models, schemas
from app.api import deps # For dependencies like get_current_active_user
from app.db.session import get_db

router = APIRouter()

# This is a placeholder for authentication dependency
# You will need to implement this in app/api/deps.py
# For example, using OAuth2 with JWT, or SIWE verification
# def get_current_active_superuser(current_user: models.User = Depends(deps.get_current_active_user)):
#     if not crud.user.is_superuser(current_user): # Assuming is_superuser is a method or property
#         raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
#     return current_user

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(
    *,
    db: Session = Depends(get_db),
    user_in: schemas.UserCreate,
    # current_user: models.User = Depends(get_current_active_superuser) # Protect this endpoint
) -> Any:
    """
    Create new user.
    (For hackathon, initial user creation might be simpler or tied to first wallet connection)
    """
    user = crud.user.get_user_by_wallet_address(db, wallet_address=user_in.wallet_address)
    if user:
        raise HTTPException(
            status_code=400,
            detail="A user with this wallet address already exists in the system.",
        )
    if user_in.email:
        user_by_email = crud.user.get_user_by_email(db, email=user_in.email)
        if user_by_email:
            raise HTTPException(
                status_code=400,
                detail="A user with this email already exists in the system.",
            )
    user = crud.user.create_user(db=db, user_in=user_in)
    return user


@router.get("/", response_model=schemas.UserList)
def read_users_endpoint(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user: models.User = Depends(deps.get_current_active_user), # Protect
) -> Any:
    """
    Retrieve users.
    """
    users = crud.user.get_users(db, skip=skip, limit=limit)
    total_users = db.query(models.User).count() # Simple count for now
    return {"users": users, "total": total_users}


@router.get("/{user_id}", response_model=schemas.User)
def read_user_by_id_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    # current_user: models.User = Depends(deps.get_current_active_user), # Protect
) -> Any:
    """
    Get a specific user by id.
    """
    user = crud.user.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Add permission check: if not current_user.is_superuser and user.id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user_endpoint(
    *,
    db: Session = Depends(get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    # current_user: models.User = Depends(deps.get_current_active_user), # Protect
) -> Any:
    """
    Update a user.
    """
    db_user = crud.user.get_user(db, user_id=user_id)
    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="The user with this ID does not exist in the system",
        )
    # Add permission check: if not current_user.is_superuser and db_user.id != current_user.id:
    #     raise HTTPException(status_code=403, detail="Not enough permissions")
    user = crud.user.update_user(db=db, db_user=db_user, user_in=user_in)
    return user

@router.get("/me", response_model=schemas.User)
async def read_users_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
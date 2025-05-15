from sqlalchemy.orm import Session
from typing import Optional, List, Union, Dict, Any

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
# from app.core.security import get_password_hash # If you implement password hashing

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def get_user_by_wallet_address(db: Session, wallet_address: str) -> Optional[User]:
    return db.query(User).filter(User.wallet_address == wallet_address).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    return db.query(User).offset(skip).limit(limit).all()

def create_user(db: Session, user_in: UserCreate) -> User:
    # For now, we assume wallet_address is unique and primary identifier
    # If using passwords:
    # hashed_password = get_password_hash(user_in.password)
    # db_user = User(
    #     email=user_in.email,
    #     hashed_password=hashed_password,
    #     full_name=user_in.full_name,
    #     wallet_address=user_in.wallet_address,
    #     role=user_in.role,
    #     is_superuser=user_in.is_superuser
    # )
    db_user = User(
        wallet_address=user_in.wallet_address,
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role, # Ensure role is correctly handled (enum vs string)
        is_active=user_in.is_active if user_in.is_active is not None else True,
        is_superuser=user_in.is_superuser if user_in.is_superuser is not None else False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(
    db: Session,
    db_user: User,
    user_in: Union[UserUpdate, Dict[str, Any]]
) -> User:
    if isinstance(user_in, dict):
        update_data = user_in
    else:
        update_data = user_in.model_dump(exclude_unset=True) # Pydantic v2
        # update_data = user_in.dict(exclude_unset=True) # Pydantic v1

    # if "password" in update_data and update_data["password"]: # If updating password
    #     hashed_password = get_password_hash(update_data["password"])
    #     del update_data["password"]
    #     update_data["hashed_password"] = hashed_password

    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> Optional[User]:
    db_user = db.query(User).get(user_id)
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user
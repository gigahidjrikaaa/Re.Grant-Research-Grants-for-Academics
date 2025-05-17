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
    hashed_password = None
    from app.core.security import get_password_hash # Import here to avoid circular dependency
    if user_in.password: # Check if a password is provided
        hashed_password = get_password_hash(user_in.password)
    
    db_user_data = {
        "wallet_address": user_in.wallet_address,
        "email": user_in.email,
        "full_name": user_in.full_name,
        "role": user_in.role,
        "is_active": user_in.is_active if user_in.is_active is not None else True,
        "is_superuser": user_in.is_superuser if user_in.is_superuser is not None else False,
    }
    if hashed_password:
        db_user_data["hashed_password"] = hashed_password
        
    db_user = User(**db_user_data)
    
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

    # update password if provided
    if "password" in update_data:
        from app.core.security import get_password_hash # Import here to avoid circular dependency
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    # update other fields
    if "email" in update_data:
        existing_user = db.query(User).filter(User.email == update_data["email"]).first()
        if existing_user and existing_user.id != db_user.id:
            raise ValueError("Email already registered to another user.")

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
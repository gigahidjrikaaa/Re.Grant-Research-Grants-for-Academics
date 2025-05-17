from sqlalchemy.orm import Session
from typing import Optional, List, Union, Dict, Any

from app.models.user import User, UserRole # Ensure UserRole is imported if used directly
from app.schemas.user import UserCreate, UserUpdate
# from app.core.security import get_password_hash # Keep local imports if for circular dependency

class CRUDUser:
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def get_user_by_wallet_address(self, db: Session, wallet_address: str) -> Optional[User]:
        return db.query(User).filter(User.wallet_address == wallet_address).first()

    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        hashed_password = None
        # Import here to potentially avoid circular dependency if security module imports crud
        from app.core.security import get_password_hash 
        if user_in.password: 
            hashed_password = get_password_hash(user_in.password)
        
        # Ensure user_in.role is of type UserRole enum if your model expects it,
        # or that SQLAlchemy handles the conversion from string correctly.
        # If user_in.role is already a UserRole enum member from Pydantic validation, it's fine.
        db_user_data = {
            "wallet_address": user_in.wallet_address,
            "email": user_in.email,
            "full_name": user_in.full_name,
            "role": user_in.role, # This should be a UserRole enum member or a string value like "student"
            "is_active": user_in.is_active if user_in.is_active is not None else True,
            "is_superuser": user_in.is_superuser if user_in.is_superuser is not None else False,
        }
        if hashed_password:
            db_user_data["hashed_password"] = hashed_password
            
        db_user_obj = User(**db_user_data)
        
        db.add(db_user_obj)
        db.commit()
        db.refresh(db_user_obj)
        return db_user_obj

    def update_user(
        self,
        db: Session,
        db_user: User, # Renamed from db_user_obj for clarity
        user_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(user_in, dict):
            update_data = user_in
        else:
            update_data = user_in.model_dump(exclude_unset=True) # Pydantic v2

        if "password" in update_data and update_data.get("password"): # Check if password is not None or empty
            from app.core.security import get_password_hash 
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        elif "password" in update_data: # If password key exists but is empty/None, remove it from update_data
             del update_data["password"]


        if "email" in update_data and update_data.get("email") is not None:
            existing_user_with_email = db.query(User).filter(User.email == update_data["email"]).first()
            if existing_user_with_email and existing_user_with_email.id != db_user.id:
                raise ValueError("Email already registered to another user.")

        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def delete_user(self, db: Session, user_id: int) -> Optional[User]:
        db_user_obj = db.query(User).get(user_id) # .get() is simpler for PK lookup
        if db_user_obj:
            db.delete(db_user_obj)
            db.commit()
        return db_user_obj

# This line creates the 'user' object that __init__.py is trying to import
user = CRUDUser()
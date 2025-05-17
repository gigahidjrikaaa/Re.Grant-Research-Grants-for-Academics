from sqlalchemy.orm import Session
from typing import Optional, List, Union, Dict, Any

from app.models.user import User, UserRole # Ensure UserRole is imported if used directly
from app.schemas.user import UserCreate, UserUpdate
from app.crud.base import CRUDBase
# from app.core.security import get_password_hash # Keep local imports if for circular dependency

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def __init__(self):
        """
        CRUD object with default methods to Create, Read, Update, Delete (CRUD).

        **Parameters**

        * `model`: A SQLAlchemy model class. Defaulting to User model.
        """
        super().__init__(model=User)

    """
    CRUD operations for User model.
    Inherits from CRUDBase for common operations.
    """
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
            
        # Using self.model from CRUDBase, set by __init__
        db_user_obj = self.model(**db_user_data) 
        
        db.add(db_user_obj)
        db.commit()
        db.refresh(db_user_obj)
        return db_user_obj

    def update_user(
        self,
        db: Session,
        db_user: User, 
        user_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(user_in, dict):
            update_data = user_in
        else:
            update_data = user_in.model_dump(exclude_unset=True)

        if "password" in update_data and update_data.get("password"): 
            from app.core.security import get_password_hash 
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        elif "password" in update_data: 
             del update_data["password"]


        if "email" in update_data and update_data.get("email") is not None:
            # Using self.model here for querying
            existing_user_with_email = db.query(self.model).filter(self.model.email == update_data["email"]).first()
            if existing_user_with_email and existing_user_with_email.id != db_user.id:
                raise ValueError("Email already registered to another user.")

        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def delete_user(self, db: Session, user_id: int) -> Optional[User]:
        # This implementation is fine. Alternatively, if __init__ is set up,
        # you could use: return super().remove(db, id=user_id)
        # For clarity and consistency with other method names, keeping this custom one is okay.
        db_user_obj = db.query(self.model).get(user_id) 
        if db_user_obj:
            db.delete(db_user_obj)
            db.commit()
        return db_user_obj

# This line creates the 'user' object that __init__.py is trying to import
user = CRUDUser()
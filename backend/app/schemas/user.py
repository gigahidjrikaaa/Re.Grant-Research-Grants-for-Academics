from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from app.models.user import UserRole # Import the enum

# Base properties shared by all user schemas
class UserBase(BaseModel):
    wallet_address: str = Field(..., examples=["0x123...abc"])
    email: Optional[EmailStr] = None # Optional for wallet-based auth
    password: Optional[str] = None # For password-based auth
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    is_active: Optional[bool] = True
    is_superuser: Optional[bool] = False

# Properties to receive on user creation
class UserCreate(UserBase):
    # For wallet-based auth, password might not be needed initially
    # Or, if it's SIWE, the signature serves as a form of "password" for session creation
    pass

# Properties to receive on user update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    # You might not want to allow wallet_address to be updated easily

# Properties stored in DB (includes ID and potentially sensitive data like hashed_password)
class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        # orm_mode = True # For Pydantic v1
        from_attributes = True # For Pydantic v2

# Additional properties to return to client (API response model)
class User(UserInDBBase):
    pass

# For lists of users
class UserList(BaseModel):
    users: List[User]
    total: int
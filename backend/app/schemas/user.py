# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

from app.models.user import UserRole # Import the enum
from .profile import ProfileSchema # Ensure this is ProfileSchema from profile.py

# --- Base Schemas ---
class UserBase(BaseModel):
    # Fields common to creation and potentially reading, but not necessarily all updatable
    email: Optional[EmailStr] = Field(default=None, examples=["user@example.com"])
    full_name: Optional[str] = Field(default=None, examples=["John Doe"])
    role: UserRole = Field(default=UserRole.STUDENT)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    wallet_address: Optional[str] = Field(default=None, examples=["0x123...abc"]) # Make optional if not always present

# --- Schemas for API Input (Request Bodies) ---
class UserCreate(UserBase):
    password: str = Field(..., min_length=8) # Password required for creation
    wallet_address: str = Field(...) # Making wallet address mandatory on creation as per your original UserBase

class UserCreateWallet(BaseModel): # For wallet-only signup, if password is not set initially
    wallet_address: str = Field(...)
    role: UserRole = Field(default=UserRole.STUDENT)
    # Other fields like email, full_name can be added later via update

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    # wallet_address is typically not updated or updated via a special process
    # profile data would be updated via profile endpoints

class UserPasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

# --- Schemas for API Output (Response Models) ---
# This is the primary schema for returning user data to clients
class User(UserBase): # Inherits non-sensitive fields from UserBase
    id: int
    profile: Optional[ProfileSchema] = None # Nested profile information
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Exclude password from responses
    password: Optional[str] = Field(default=None, exclude=True)


    class Config:
        from_attributes = True

# Schema representing user in database (potentially for internal use, includes hashed_password)
class UserInDB(UserBase):
    id: int
    hashed_password: Optional[str] = None # If User model has hashed_password
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# For lists of users - ensure this uses the User schema that's safe for client output
class UserList(BaseModel):
    users: List[User] # Use the client-safe User schema
    total: int
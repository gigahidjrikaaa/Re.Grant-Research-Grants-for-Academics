from typing import Optional, List
from pydantic import BaseModel
import datetime
from app.models.grant import GrantType, GrantApplicationStatus # Assuming these enums are in models.grant
from .user import User # To show funder details

# Properties to receive on item creation
class GrantCreate(BaseModel):
    title: str
    description: str
    funder_id: int # Will be set to current user or specified by admin
    amount_awarded: float # Changed from Numeric for Pydantic
    currency: str = "IDRX" # Default currency
    application_deadline: datetime.datetime
    application_start_date: Optional[datetime.datetime] = None
    eligibility_criteria: Optional[str] = None
    grant_type: GrantType
    website_link: Optional[str] = None

# Properties to receive on item update
class GrantUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount_awarded: Optional[float] = None
    currency: Optional[str] = None
    application_deadline: Optional[datetime.datetime] = None
    application_start_date: Optional[datetime.datetime] = None
    eligibility_criteria: Optional[str] = None
    grant_type: Optional[GrantType] = None
    website_link: Optional[str] = None

# Properties shared by models stored in DB
class GrantInDBBase(BaseModel):
    id: int
    title: str
    description: str
    funder_id: int
    amount_awarded: float
    currency: str
    application_deadline: datetime.datetime
    application_start_date: Optional[datetime.datetime] = None
    eligibility_criteria: Optional[str] = None
    grant_type: GrantType
    website_link: Optional[str] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None # Make sure model has this if used

    class Config:
        from_attributes = True # Pydantic v2 (orm_mode = True for Pydantic v1)

# Properties to return to client (includes relational data)
class Grant(GrantInDBBase):
    funder: Optional[User] = None # Eager load this

# --- Grant Application Schemas ---
class GrantApplicationBase(BaseModel):
    proposal: str

class GrantApplicationCreate(GrantApplicationBase):
    grant_id: int
    # user_id will be from current authenticated user typically

class GrantApplicationUpdate(BaseModel):
    proposal: Optional[str] = None
    status: Optional[GrantApplicationStatus] = None

class GrantApplicationInDBBase(GrantApplicationBase):
    id: int
    grant_id: int
    user_id: int
    status: GrantApplicationStatus
    application_date: datetime.date # Model uses Date

    class Config:
        from_attributes = True

class GrantApplication(GrantApplicationInDBBase):
    applicant: Optional[User] = None
    grant: Optional[Grant] = None # Could be simplified to GrantInDBBase if recursive depth is an issue
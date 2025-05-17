# backend/app/schemas/grant.py
from typing import Optional, List
from pydantic import BaseModel, Field # Added Field
import datetime

# Import the specific enums from your models.grant
from app.models.grant import GrantType, GrantStatus, GrantApplicationStatus
from .user import User # Assuming User is your client-safe user schema

# --- Grant Schemas ---
class GrantBase(BaseModel):
    title: str
    description: str
    grant_type: GrantType
    total_funding_requested: Optional[float] = None # Model uses Numeric(18,2)
    funding_currency: str = "IDRX" # Matches model default
    application_start_date: Optional[datetime.datetime] = None
    application_deadline: Optional[datetime.datetime] = None
    start_date_expected: Optional[datetime.date] = None
    end_date_expected: Optional[datetime.date] = None
    eligibility_criteria: Optional[str] = None
    website_link: Optional[str] = None
    talent_requirements: Optional[dict] = None # Model has JSON

class GrantCreate(GrantBase):
    # proposer_id will be set from current_user in the endpoint
    status: GrantStatus = GrantStatus.DRAFT # Default status on creation

class GrantUpdate(BaseModel): # More flexible update
    title: Optional[str] = None
    description: Optional[str] = None
    grant_type: Optional[GrantType] = None
    status: Optional[GrantStatus] = None
    total_funding_requested: Optional[float] = None
    funding_currency: Optional[str] = None
    application_start_date: Optional[datetime.datetime] = None
    application_deadline: Optional[datetime.datetime] = None
    start_date_expected: Optional[datetime.date] = None
    end_date_expected: Optional[datetime.date] = None
    eligibility_criteria: Optional[str] = None
    website_link: Optional[str] = None
    talent_requirements: Optional[dict] = None
    review_notes: Optional[str] = None

class GrantInDBBase(GrantBase):
    id: int
    proposer_id: int # Matches model
    status: GrantStatus # Matches model
    
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    lisk_transaction_hash_funding: Optional[str] = None # Matches model

    class Config:
        from_attributes = True

class Grant(GrantInDBBase):
    proposer: Optional[User] = None # Changed from funder to proposer
    # applications: List['GrantApplication'] = [] # If you want to show applications directly here
    # milestones: List['GrantMilestoneSchema'] = [] # Need GrantMilestoneSchema

# --- Grant Milestone Schemas (New based on your model) ---
class GrantMilestoneBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime.date] = None
    amount_allocated: float # Model uses Numeric
    order: int = 0

class GrantMilestoneCreate(GrantMilestoneBase):
    grant_id: int # To associate with a grant

class GrantMilestoneUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime.date] = None
    amount_allocated: Optional[float] = None
    is_completed: Optional[bool] = None
    order: Optional[int] = None

class GrantMilestoneSchema(GrantMilestoneBase): # For reading
    id: int
    grant_id: int
    is_completed: bool
    completion_date: Optional[datetime.datetime] = None
    payment_transaction_hash: Optional[str] = None

    class Config:
        from_attributes = True

# Add GrantMilestoneSchema to Grant if needed
class Grant(GrantInDBBase): # Re-declare or modify previous Grant schema
    proposer: Optional[User] = None
    milestones: List[GrantMilestoneSchema] = []
    applications: List['GrantApplication'] = []


# --- Grant Application Schemas ---
class GrantApplicationBase(BaseModel):
    cover_letter: Optional[str] = None # Matches your model's 'cover_letter'

class GrantApplicationCreate(GrantApplicationBase):
    grant_id: int
    # applicant_id from current user

class GrantApplicationUpdate(BaseModel):
    cover_letter: Optional[str] = None
    status: Optional[GrantApplicationStatus] = None
    reviewer_notes: Optional[str] = None


class GrantApplicationInDBBase(GrantApplicationBase):
    id: int
    grant_id: int
    applicant_id: int # Matches your model
    status: GrantApplicationStatus
    submitted_at: datetime.datetime # Matches your model
    reviewed_at: Optional[datetime.datetime] = None # Matches your model

    class Config:
        from_attributes = True

class GrantApplication(GrantApplicationInDBBase):
    applicant: Optional[User] = None
    grant: Optional[GrantInDBBase] = None # Simplified Grant to avoid deep recursion

# Update forward references if you have nested schemas referencing each other
Grant.model_rebuild()
# GrantApplication.model_rebuild() # If GrantApplication also had forward refs to Grant
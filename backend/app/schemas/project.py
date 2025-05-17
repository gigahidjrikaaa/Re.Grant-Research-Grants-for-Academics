from typing import Optional, List
from pydantic import BaseModel
import datetime
from app.models.project import ProjectCategory # Assuming enum is in models.project
from app.models.grant import ApplicationStatus # Reusing for project applications
from .user import UserSchema # For creator and team members

# --- Project Team Member Schemas ---
class ProjectTeamMemberBase(BaseModel):
    user_id: int
    role_in_project: str

class ProjectTeamMemberCreate(ProjectTeamMemberBase):
    project_id: int # Added when creating

class ProjectTeamMemberUpdate(BaseModel):
    role_in_project: Optional[str] = None

class ProjectTeamMemberInDBBase(ProjectTeamMemberBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

class ProjectTeamMember(ProjectTeamMemberInDBBase):
    user: Optional[UserSchema] = None # Eager load this


# --- Project Schemas ---
class ProjectBase(BaseModel):
    title: str
    description: str
    category: ProjectCategory
    status: Optional[str] = "Open" # Default status
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    budget: Optional[float] = None
    required_skills: Optional[str] = None # Comma-separated string, or consider List[str]
    # research_goals: Optional[str] = None

class ProjectCreate(ProjectBase):
    # created_by_user_id will be set from current user
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None # Make all fields optional for update
    description: Optional[str] = None
    category: Optional[ProjectCategory] = None
    # ... make other fields optional


class ProjectInDBBase(ProjectBase):
    id: int
    created_by_user_id: int
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class Project(ProjectInDBBase):
    creator: Optional[UserSchema] = None
    team_members: List[ProjectTeamMember] = [] # List of team members
    # applications: List['ProjectApplication'] # Forward reference if needed for applications list

# --- Project Application Schemas ---
class ProjectApplicationBase(BaseModel):
    cover_letter: Optional[str] = None

class ProjectApplicationCreate(ProjectApplicationBase):
    project_id: int
    # user_id from current user

class ProjectApplicationUpdate(BaseModel):
    cover_letter: Optional[str] = None
    status: Optional[ApplicationStatus] = None

class ProjectApplicationInDBBase(ProjectApplicationBase):
    id: int
    project_id: int
    user_id: int
    status: ApplicationStatus
    application_date: datetime.date

    class Config:
        from_attributes = True

class ProjectApplication(ProjectApplicationInDBBase):
    applicant: Optional[UserSchema] = None
    project: Optional[ProjectInDBBase] = None # Simplified to avoid deep recursion

class ProjectTeamMemberUpdate(BaseModel):
    role_in_project: Optional[str] = None

# To handle forward reference if Project schema includes List[ProjectApplication]
# Project.model_rebuild() # Pydantic v2
# Project.update_forward_refs() # Pydantic v1
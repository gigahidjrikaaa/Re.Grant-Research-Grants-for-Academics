from .user import User, UserCreate, UserUpdate, UserSchema, UserInDB, UserRole # Keep existing
from .token import Token, TokenPayload # Keep existing
from .profile import ( # Keep existing profile schemas
    ProfileSchema, ProfileCreate, ProfileUpdate, 
    ExperienceSchema, ExperienceCreate, ExperienceUpdate,
    EducationSchema, EducationCreate, EducationUpdate,
    PublicationSchema, PublicationCreate, PublicationUpdate
)

# Add Grant schemas
from .grant import (
    Grant, GrantCreate, GrantUpdate,
    GrantApplication, GrantApplicationCreate, GrantApplicationUpdate
)
# Add Project schemas
from .project import (
    Project, ProjectCreate, ProjectUpdate,
    ProjectTeamMember, ProjectTeamMemberCreate, ProjectTeamMemberUpdate,
    ProjectApplication, ProjectApplicationCreate, ProjectApplicationUpdate
)


__all__ = [
    "User", "UserCreate", "UserUpdate", "UserSchema", "UserInDB", "UserRole",
    "Token", "TokenPayload",
    "ProfileSchema", "ProfileCreate", "ProfileUpdate",
    "ExperienceSchema", "ExperienceCreate", "ExperienceUpdate",
    "EducationSchema", "EducationCreate", "EducationUpdate",
    "PublicationSchema", "PublicationCreate", "PublicationUpdate",
    
    "Grant", "GrantCreate", "GrantUpdate",
    "GrantApplication", "GrantApplicationCreate", "GrantApplicationUpdate",
    
    "Project", "ProjectCreate", "ProjectUpdate",
    "ProjectTeamMember", "ProjectTeamMemberCreate", "ProjectTeamMemberUpdate",
    "ProjectApplication", "ProjectApplicationCreate", "ProjectApplicationUpdate",
]
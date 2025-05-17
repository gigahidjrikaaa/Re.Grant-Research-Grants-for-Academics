from .user import ( # Adjust based on the final names in your user.py
    User, # This should be the one for API responses (with profile, without password)
    UserCreate, 
    UserUpdate,
    UserPasswordUpdate, # if you added this
    UserCreateWallet, # if you added this
    UserRole,
    UserList,
    UserInDB # if you need to export the DB representation schema
)
from .token import Token, TokenPayload, NonceResponse, SIWELoginData # Keep existing
from .profile import (
    ProfileSchema, ProfileCreate, ProfileUpdate,
    Experience, ExperienceCreate, ExperienceUpdate,
    Education, EducationCreate, EducationUpdate,
    Publication, PublicationCreate, PublicationUpdate
)

# Add Grant schemas
from .grant import (
    Grant, GrantCreate, GrantUpdate,
    GrantApplication, GrantApplicationCreate, GrantApplicationUpdate,
    GrantMilestoneSchema, GrantMilestoneCreate, GrantMilestoneUpdate,
)
# Add Project schemas
from .project import (
    Project, ProjectCreate, ProjectUpdate,
    ProjectTeamMember, ProjectTeamMemberCreate, ProjectTeamMemberUpdate,
    ProjectApplication, ProjectApplicationCreate, ProjectApplicationUpdate
)


__all__ = [
    "User", "UserCreate", "UserUpdate", "UserPasswordUpdate", "UserCreateWallet", "UserRole", "UserList", "UserInDB",
    "Token", "TokenPayload",
    "ProfileSchema", "ProfileCreate", "ProfileUpdate",
    "Experience", "ExperienceCreate", "ExperienceUpdate",
    "Education", "EducationCreate", "EducationUpdate",
    "Publication", "PublicationCreate", "PublicationUpdate",
    
    "Grant", "GrantCreate", "GrantUpdate",
    "GrantApplication", "GrantApplicationCreate", "GrantApplicationUpdate",
    "GrantMilestoneSchema", "GrantMilestoneCreate", "GrantMilestoneUpdate",
    
    "Project", "ProjectCreate", "ProjectUpdate",
    "ProjectTeamMember", "ProjectTeamMemberCreate", "ProjectTeamMemberUpdate",
    "ProjectApplication", "ProjectApplicationCreate", "ProjectApplicationUpdate",

    "Token", "TokenPayload", "NonceResponse", "SIWELoginData"
]
from .crud_user import user  # Keep existing
# Add new CRUD objects
from .crud_grant import grant, grant_application
from .crud_project import project, project_team_member, project_application
from .crud_profile import profile, experience, education, publication # Assuming these exist for profile updates

# noinspection PyUnresolvedReferences
# For a convenient access point, you can list them here,
# though direct import from their modules is also fine.
__all__ = [
    "user", 
    "grant", "grant_application",
    "project", "project_team_member", "project_application",
    "profile", "experience", "education", "publication"
]
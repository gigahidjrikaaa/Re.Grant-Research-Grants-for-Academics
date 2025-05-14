from fastapi import APIRouter

from app.api.v1.endpoints import users, auth # , grants, profiles, projects

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"]) # Add auth router
api_router.include_router(users.router, prefix="/users", tags=["users"])
# api_router.include_router(grants.router, prefix="/grants", tags=["grants"])
# api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
# api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
# api_router.include_router(auth.router, prefix="/auth", tags=["auth"]) # For login/auth endpoints
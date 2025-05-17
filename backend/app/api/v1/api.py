from fastapi import APIRouter

from app.api.v1.endpoints import users, auth, admin, grant, project

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(grant.router, prefix="/grants", tags=["grants"])
api_router.include_router(project.router, prefix="/projects", tags=["projects"])
api_router.include_router(admin.router, prefix="/admin-data", tags=["admin-data"])

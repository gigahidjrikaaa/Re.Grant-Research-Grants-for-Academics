from fastapi import FastAPI # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore

from app.core.config import settings
from app.api.v1.api import api_router as api_v1_router
# from app.db.database import engine # If using SQLAlchemy and need to create tables on startup
# from app.db import base_class # To create tables

# Create all tables in the database (only for initial setup, use Alembic for migrations)
# This is a simple way for hackathons but not ideal for production evolution.
# def create_tables():
#     base_class.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# @app.on_event("startup")
# async def startup_event():
#     print("Application startup")
#     # create_tables() # Create tables if they don't exist (for SQLAlchemy)
#     # You can add other startup logic here, like connecting to external services

app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
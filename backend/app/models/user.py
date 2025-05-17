from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as DBEnum
from sqlalchemy.sql import func # For default timestamps
from sqlalchemy.orm import relationship

from app.db.base_class import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "student"
    RESEARCHER = "researcher"
    ADMIN = "admin"
    INSTITUTION = "institution" # Added

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String(42), unique=True, index=True, nullable=False) # Wallet address is required
    email = Column(String, unique=True, index=True, nullable=True) # Email is optional
    full_name = Column(String, index=True, nullable=True)
    role = Column(DBEnum(UserRole), default=UserRole.STUDENT, nullable=False)
    
    hashed_password = Column(String, nullable=True) # If using password authentication
    # wallet_address is the primary identifier, but email can be used for notifications
    
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    projects_created = relationship("Project", back_populates="creator", foreign_keys="[Project.created_by_user_id]")
    member_of_projects = relationship("ProjectTeamMember", back_populates="user")
    project_applications = relationship("ProjectApplication", back_populates="applicant")

    # Relationships are defined in other files and will link back here
    # e.g., Profile.user = relationship("User", back_populates="profile")
    # User.profile will be set in profile.py or models/__init__.py
    # User.grants_proposed will be set in grant.py
    # User.grant_applications will be set in grant.py
    # User.projects_created will be set in project.py
    # User.project_participations will be set in project.py
    # User.project_applications is for applications made by the user to projects

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"

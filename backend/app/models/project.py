import datetime
import enum
from sqlalchemy import ARRAY, Column, Integer, String, Text, Boolean, DateTime, Enum as DBEnum, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
# from .user import User # For relationships

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending" # Application submitted, waiting for review
    ACCEPTED = "accepted" # Application accepted, user can join the project
    REJECTED = "rejected" # Application rejected
    WITHDRAWN = "withdrawn" # User withdrew their application
    IN_PROGRESS = "in_progress" # Application is being processed or reviewed
    CANCELLED = "cancelled" # Application was cancelled by the system or admin

class ProjectApplication(Base):
    __tablename__ = "project_applications"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) # The applicant
    
    cover_letter = Column(Text, nullable=True)
    status = Column(DBEnum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    application_date = Column(Date, default=datetime.date.today, nullable=False) # Or DateTime

    # Relationships
    project = relationship("Project", back_populates="applications")
    applicant = relationship("User", back_populates="project_applications")

class ProjectStatus(str, enum.Enum):
    OPEN = "open" # Actively seeking collaborators/applicants
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True) # User who posted the project
    
    status = Column(DBEnum(ProjectStatus), default=ProjectStatus.OPEN, nullable=False, index=True)
    
    # Details about the project
    expected_duration = Column(String, nullable=True) # e.g., "3 months", "Ongoing"
    required_skills = Column(ARRAY(String), nullable=True) # Using PostgreSQL ARRAY type
    # For more complex role definitions, a separate ProjectRole table might be needed
    # Example: {"roles_needed": [{"role_name": "Frontend Dev", "count": 1, "description": "..."}]}
    roles_available = Column(JSON, nullable=True) 
    
    # Can be linked to a Grant if this project is part of a funded grant
    grant_id = Column(Integer, ForeignKey("grants.id"), nullable=True, index=True)
    applications = relationship("ProjectApplication", back_populates="project", cascade="all, delete-orphan")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="projects_created")
    grant = relationship("Grant", back_populates="projects") # If a project can be linked to one grant
    # Members/Applicants for a project might be a many-to-many relationship via an association table
    project_members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project(id={self.id}, title='{self.title}', status='{self.status.value}')>"


class ProjectMember(Base):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_in_project = Column(String, nullable=True) # e.g., "Developer", "Researcher", "Advisor"
    is_applicant = Column(Boolean, default=False) # True if this is an application, False if an accepted member
    application_status = Column(String, nullable=True) # e.g., "pending", "accepted", "rejected" - if is_applicant is True
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="project_members")
    user = relationship("User", back_populates="project_participations")


# Add back-references to User model
from .user import User
User.projects_created = relationship("Project", back_populates="creator", foreign_keys=[Project.creator_id])
User.project_participations = relationship("ProjectMember", back_populates="user", foreign_keys=[ProjectMember.user_id])

# Add back-reference to Grant model if a grant can have multiple projects
from .grant import Grant
Grant.projects = relationship("Project", back_populates="grant")
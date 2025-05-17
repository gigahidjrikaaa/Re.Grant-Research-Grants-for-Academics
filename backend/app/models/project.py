import datetime
import enum
from sqlalchemy import ARRAY, Column, Integer, String, Text, Boolean, DateTime, Enum as DBEnum, ForeignKey, JSON, Date, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
# from .user import User # Import later
# from .grant import Grant # Import later

class ApplicationStatus(str, enum.Enum): # This is for Project Applications
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    IN_PROGRESS = "in_progress" # Review in progress
    CANCELLED = "cancelled"

class ProjectStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"
    CANCELLED = "cancelled"

class ProjectCategory(str, enum.Enum): # Added
    TECHNOLOGY = "technology"
    SCIENCE = "science"
    ARTS = "arts"
    SOCIAL_SCIENCES = "social_sciences"
    HEALTH = "health"
    EDUCATION = "education"
    ENVIRONMENT = "environment"
    OTHER = "other"

class ProjectApplication(Base):
    __tablename__ = "project_applications"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cover_letter = Column(Text, nullable=True)
    status = Column(DBEnum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    application_date = Column(Date, default=datetime.date.today, nullable=False)
    project = relationship("Project", back_populates="project_applications_received") # Renamed back_populates for clarity
    applicant = relationship("User", back_populates="project_applications_made") # Renamed back_populates for clarity

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(DBEnum(ProjectStatus), default=ProjectStatus.OPEN, nullable=False, index=True)
    category = Column(DBEnum(ProjectCategory), default=ProjectCategory.OTHER, nullable=True) # Added
    expected_duration = Column(String, nullable=True)
    required_skills = Column(ARRAY(String), nullable=True)
    roles_available = Column(JSON, nullable=True) 
    budget = Column(Numeric(18,2), nullable=True) # Added
    grant_id = Column(Integer, ForeignKey("grants.id"), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    creator = relationship("User", back_populates="projects_created")
    grant = relationship("Grant", back_populates="projects")
    project_members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    project_applications_received = relationship("ProjectApplication", back_populates="project", cascade="all, delete-orphan") # Renamed

    def __repr__(self):
        return f"<Project(id={self.id}, title='{self.title}', status='{self.status.value}')>"

class ProjectMember(Base):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_in_project = Column(String, nullable=True)
    # is_applicant and application_status are removed, use ProjectApplication for applications
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    project = relationship("Project", back_populates="project_members")
    user = relationship("User", back_populates="project_participations")

# Add back-references to User model
from .user import User
User.projects_created = relationship("Project", back_populates="creator", foreign_keys=[Project.creator_id])
User.project_participations = relationship("ProjectMember", back_populates="user", foreign_keys=[ProjectMember.user_id])
User.project_applications_made = relationship("ProjectApplication", back_populates="applicant", foreign_keys=[ProjectApplication.user_id])


# Add back-reference to Grant model
from .grant import Grant
Grant.projects = relationship("Project", back_populates="grant")
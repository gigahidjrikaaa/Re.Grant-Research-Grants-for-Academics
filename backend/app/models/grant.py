import enum
import datetime
from sqlalchemy import Column, Date, Integer, String, Text, Boolean, DateTime, Enum as DBEnum, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
# from .user import User # Import User later to avoid circularity if needed

class GrantStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class GrantType(str, enum.Enum): # Added
    RESEARCH = "research"
    FELLOWSHIP = "fellowship"
    TRAVEL = "travel"
    EQUIPMENT = "equipment"
    SEED_FUNDING = "seed_funding"
    OTHER = "other"

class GrantApplicationStatus(str, enum.Enum): # Added
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

class Grant(Base):
    __tablename__ = "grants"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    proposer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    status = Column(DBEnum(GrantStatus), default=GrantStatus.DRAFT, nullable=False, index=True)
    grant_type = Column(DBEnum(GrantType), default=GrantType.RESEARCH, nullable=True) # Added
    
    total_funding_requested = Column(Numeric(18, 2), nullable=True)
    funding_currency = Column(String, default="IDRX", nullable=False)
    
    application_start_date = Column(DateTime(timezone=True), nullable=True) # Added
    application_deadline = Column(DateTime(timezone=True), nullable=True)
    start_date_expected = Column(Date, nullable=True)
    end_date_expected = Column(Date, nullable=True)

    eligibility_criteria = Column(Text, nullable=True) # Added
    website_link = Column(String, nullable=True) # Added

    review_notes = Column(Text, nullable=True)
    lisk_transaction_hash_funding = Column(String, nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    talent_requirements = Column(JSON, nullable=True)

    proposer = relationship("User", back_populates="grants_proposed")
    milestones = relationship("GrantMilestone", back_populates="grant", cascade="all, delete-orphan", order_by="GrantMilestone.order")
    applications = relationship("GrantApplication", back_populates="grant", cascade="all, delete-orphan")
    
    # Relationship to Projects (if a grant can fund multiple projects)
    # projects = relationship("Project", back_populates="grant") # Defined in project.py

    def __repr__(self):
        return f"<Grant(id={self.id}, title='{self.title}', status='{self.status.value}')>"

class GrantMilestone(Base):
    __tablename__ = "grant_milestones"
    id = Column(Integer, primary_key=True, index=True)
    grant_id = Column(Integer, ForeignKey("grants.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    amount_allocated = Column(Numeric(18, 2), nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    payment_transaction_hash = Column(String, nullable=True, index=True)
    order = Column(Integer, nullable=False, default=0)
    grant = relationship("Grant", back_populates="milestones")

class GrantApplication(Base):
    __tablename__ = "grant_applications"
    id = Column(Integer, primary_key=True, index=True)
    grant_id = Column(Integer, ForeignKey("grants.id", ondelete="CASCADE"), nullable=False, index=True)
    applicant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cover_letter = Column(Text, nullable=True) # Changed from proposal
    status = Column(DBEnum(GrantApplicationStatus), default=GrantApplicationStatus.SUBMITTED, nullable=False, index=True) # Updated
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    grant = relationship("Grant", back_populates="applications")
    applicant = relationship("User", back_populates="grant_applications")

# Add back-references to User model
from .user import User
User.grants_proposed = relationship("Grant", back_populates="proposer", foreign_keys=[Grant.proposer_id])
User.grant_applications = relationship("GrantApplication", back_populates="applicant", foreign_keys=[GrantApplication.applicant_id])
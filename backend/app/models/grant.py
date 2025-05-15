import enum
from sqlalchemy import Column, Date, Integer, String, Text, Boolean, DateTime, Enum as DBEnum, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base_class import Base
# from .user import User # For relationships

class GrantStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"  # Approved and funded (or ready for first milestone)
    IN_PROGRESS = "in_progress" # Milestones being worked on
    COMPLETED = "completed"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Grant(Base):
    __tablename__ = "grants"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False) # Detailed description of the research
    proposer_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True) # User who proposed/manages the grant (Researcher/Lecturer)
    
    status = Column(DBEnum(GrantStatus), default=GrantStatus.DRAFT, nullable=False, index=True)
    
    # Funding details
    total_funding_requested = Column(Numeric(18, 2), nullable=True) # Example: Up to 2 decimal places for IDRX
    funding_currency = Column(String, default="IDRX", nullable=False) # Could be enum if more are supported
    
    # Dates
    application_deadline = Column(DateTime(timezone=True), nullable=True) # If there's a period for applications
    start_date_expected = Column(Date, nullable=True)
    end_date_expected = Column(Date, nullable=True)

    # Review and Blockchain Info
    review_notes = Column(Text, nullable=True) # Notes from reviewers
    lisk_transaction_hash_funding = Column(String, nullable=True, index=True) # For initial funding or milestone payments

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    proposer = relationship("User", back_populates="grants_proposed")
    milestones = relationship("GrantMilestone", back_populates="grant", cascade="all, delete-orphan", order_by="GrantMilestone.order")
    applications = relationship("GrantApplication", back_populates="grant", cascade="all, delete-orphan")
    
    # For talent/roles sought (could be simple JSON or a related table if complex)
    # Example: {"roles_needed": ["PhD Student in AI", "Frontend Developer (React)"], "skills_required": ["Python", "Machine Learning"]}
    talent_requirements = Column(JSON, nullable=True)


    def __repr__(self):
        return f"<Grant(id={self.id}, title='{self.title}', status='{self.status.value}')>"


class GrantMilestone(Base):
    __tablename__ = "grant_milestones"

    id = Column(Integer, primary_key=True, index=True)
    grant_id = Column(Integer, ForeignKey("grants.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(Date, nullable=True)
    amount_allocated = Column(Numeric(18, 2), nullable=False) # Amount for this milestone
    is_completed = Column(Boolean, default=False, nullable=False)
    completion_date = Column(DateTime(timezone=True), nullable=True)
    payment_transaction_hash = Column(String, nullable=True, index=True) # Tx hash for this milestone payment
    order = Column(Integer, nullable=False, default=0) # To order milestones

    grant = relationship("Grant", back_populates="milestones")

    class Meta:
        ordering = ['order']


class GrantApplication(Base):
    __tablename__ = "grant_applications"

    id = Column(Integer, primary_key=True, index=True)
    grant_id = Column(Integer, ForeignKey("grants.id", ondelete="CASCADE"), nullable=False, index=True)
    applicant_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True) # Student applying
    
    # For student applications
    cover_letter = Column(Text, nullable=True) # Or proposal specific to student's involvement
    # Reference to student's profile snapshot at time of application could be useful (or just link to profile)
    
    status = Column(String, default="submitted", nullable=False, index=True) # e.g., submitted, under_review, accepted, rejected
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewer_notes = Column(Text, nullable=True)

    grant = relationship("Grant", back_populates="applications")
    applicant = relationship("User", back_populates="grant_applications")


# Add back-references to User model
from .user import User # Must be imported after User is fully defined or use string for relationship
User.grants_proposed = relationship("Grant", back_populates="proposer", foreign_keys=[Grant.proposer_id])
User.grant_applications = relationship("GrantApplication", back_populates="applicant", foreign_keys=[GrantApplication.applicant_id])
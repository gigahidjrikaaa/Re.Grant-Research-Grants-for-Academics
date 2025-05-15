from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY # For lists of strings like skills, interests

from app.db.base_class import Base
from .user import User # For the relationship

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True) # One-to-one with User

    # Profile Header Section
    avatar_url = Column(String, nullable=True)
    current_role = Column(String, index=True, nullable=True) # e.g., "PhD Candidate", "Associate Professor"
    headline = Column(String, nullable=True) # Short bio

    # Contact & Links
    # Email is in User model, wallet_address is in User model
    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    orcid_id = Column(String, nullable=True, index=True) # Important for researchers

    # About/Summary
    about = Column(Text, nullable=True)

    # Skills & Interests (Storing as arrays of strings, PostgreSQL specific)
    skills = Column(ARRAY(String), nullable=True)
    research_interests = Column(ARRAY(String), nullable=True)

    # Talent Pool Visibility
    is_visible_in_talent_pool = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="profile") # Define back_populates in User model

    # Experience, Education, Publications will be separate related tables for better structure (one-to-many)
    # Or, for simplicity in a hackathon, could be JSON fields if not heavily queried/structured.
    # For now, let's plan for them as related tables if you anticipate needing to query/filter them.
    # If they are just for display, JSON might be okay for speed.
    # For a hackathon, to keep it simpler initially, we could use JSONB for these lists.
    # However, separate tables are more relational and scalable. Let's define them separately.

    def __repr__(self):
        return f"<Profile(id={self.id}, user_id={self.user_id}, role='{self.current_role}')>"

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True) # Nullable if current position
    description = Column(Text, nullable=True)

    profile = relationship("Profile", back_populates="experiences")

class Education(Base):
    __tablename__ = "educations"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    degree = Column(String, nullable=False)
    institution = Column(String, nullable=False)
    major = Column(String, nullable=True)
    graduation_date = Column(Date, nullable=True) # Or expected graduation
    description = Column(Text, nullable=True) # e.g., thesis title, honors

    profile = relationship("Profile", back_populates="educations")

class Publication(Base):
    __tablename__ = "publications"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    authors = Column(ARRAY(String), nullable=True) # List of authors
    venue = Column(String, nullable=True) # Journal, conference, etc.
    year = Column(Integer, nullable=True)
    link = Column(String, nullable=True) # DOI or URL
    abstract = Column(Text, nullable=True)

    profile = relationship("Profile", back_populates="publications")


# Add back-references to Profile model for the new related tables
Profile.experiences = relationship("Experience", order_by=Experience.id, back_populates="profile", cascade="all, delete-orphan")
Profile.educations = relationship("Education", order_by=Education.id, back_populates="profile", cascade="all, delete-orphan")
Profile.publications = relationship("Publication", order_by=Publication.id, back_populates="profile", cascade="all, delete-orphan")

# Update User model to include profile relationship
# This needs to be done carefully to avoid circular import errors during model definition.
# Usually done after all models are defined or by using string references.
# We'll handle this in the __init__.py or ensure User.profile is defined after Profile.
User.profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
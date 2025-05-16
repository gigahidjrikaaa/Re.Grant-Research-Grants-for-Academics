from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, JSON, Date
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY

from app.db.base_class import Base
from .user import User # For the relationship

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    avatar_url = Column(String, nullable=True)
    current_role = Column(String, index=True, nullable=True)
    headline = Column(String, nullable=True)

    linkedin_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
    orcid_id = Column(String, nullable=True, index=True)

    about = Column(Text, nullable=True)

    skills = Column(ARRAY(String), nullable=True) # Stored as a list of strings
    research_interests = Column(ARRAY(String), nullable=True)

    is_visible_in_talent_pool = Column(Boolean, default=False, nullable=False)
    
    user = relationship("User", back_populates="profile")

    experiences = relationship("Experience", order_by="Experience.start_date.desc()", back_populates="profile", cascade="all, delete-orphan")
    educations = relationship("Education", order_by="Education.graduation_date.desc()", back_populates="profile", cascade="all, delete-orphan")
    publications = relationship("Publication", order_by="Publication.year.desc()", back_populates="profile", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Profile(id={self.id}, user_id={self.user_id}, role='{self.current_role}')>"

class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    institution = Column(String, nullable=False) # Changed from company
    # location = Column(String, nullable=True) # Removed for now to match seeding's focus
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)

    profile = relationship("Profile", back_populates="experiences")

class Education(Base):
    __tablename__ = "educations"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    degree = Column(String, nullable=False)
    institution = Column(String, nullable=False) # Changed from institution_name
    major = Column(String, nullable=True) # Changed from field_of_study
    graduation_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)

    profile = relationship("Profile", back_populates="educations")

class Publication(Base):
    __tablename__ = "publications"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    authors = Column(ARRAY(String), nullable=True)
    venue = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    link = Column(String, nullable=True)
    abstract = Column(Text, nullable=True)

    profile = relationship("Profile", back_populates="publications")

# Establish the one-to-one relationship from User to Profile
User.profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
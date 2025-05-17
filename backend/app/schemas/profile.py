# backend/app/schemas/profile.py
from typing import Optional, List
from pydantic import BaseModel, HttpUrl
import datetime

# --- Experience Schemas ---
class ExperienceBase(BaseModel):
    title: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    description: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(ExperienceBase):
    title: Optional[str] = None # All fields optional for update
    company: Optional[str] = None
    start_date: Optional[datetime.date] = None
    # Make other fields optional as needed for your update logic

class Experience(ExperienceBase): # For reading from DB
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Education Schemas ---
class EducationBase(BaseModel):
    institution_name: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: datetime.date
    end_date: Optional[datetime.date] = None
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationUpdate(EducationBase):
    institution_name: Optional[str] = None # All fields optional
    degree: Optional[str] = None
    start_date: Optional[datetime.date] = None
    # Make other fields optional

class Education(EducationBase): # For reading from DB
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Publication Schemas ---
class PublicationBase(BaseModel):
    title: str
    authors: Optional[List[str]] = None
    venue: Optional[str] = None
    year: Optional[int] = None
    link: Optional[HttpUrl] = None # Use HttpUrl for validation
    abstract: Optional[str] = None

class PublicationCreate(PublicationBase):
    pass

class PublicationUpdate(PublicationBase):
    title: Optional[str] = None # All fields optional
    # Make other fields optional

class Publication(PublicationBase): # For reading from DB
    id: int
    profile_id: int

    class Config:
        from_attributes = True


# --- Profile Schemas ---
class ProfileBase(BaseModel):
    headline: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None # Consider List[str] and handle conversion if needed
    research_interests: Optional[List[str]] = None
    website: Optional[HttpUrl] = None
    linkedin_url: Optional[HttpUrl] = None
    github_url: Optional[HttpUrl] = None
    profile_picture_url: Optional[HttpUrl] = None

class ProfileCreate(ProfileBase):
    # user_id will be set based on the current authenticated user typically
    pass

class ProfileUpdate(ProfileBase):
    pass # All fields are already optional in ProfileBase for PATCH-like updates

# Schema for reading a profile, including its nested items
# This is the main schema that will be nested in UserSchema
class ProfileSchema(ProfileBase):
    id: int
    user_id: int # To know which user this profile belongs to
    experiences: List[Experience] = []
    education_entries: List[Education] = [] # Match model attribute name 'education_entries'
    publications: List[Publication] = []

    class Config:
        from_attributes = True
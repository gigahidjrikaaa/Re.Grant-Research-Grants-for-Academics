# backend/app/crud/crud_profile.py
from typing import Any, Dict, List, Optional, Union
from pydantic import HttpUrl
from sqlalchemy.orm import Session, joinedload, selectinload

from app.crud.base import CRUDBase
from app.models.profile import Profile, Experience, Education, Publication
from app.schemas.profile import (
    ProfileCreate, ProfileUpdate,
    ExperienceCreate, ExperienceUpdate,
    EducationCreate, EducationUpdate,
    PublicationCreate, PublicationUpdate
)

class CRUDExperience(CRUDBase[Experience, ExperienceCreate, ExperienceUpdate]):
    def get_multi_by_profile(self, db: Session, *, profile_id: int, skip: int = 0, limit: int = 100) -> List[Experience]:
        return db.query(self.model).filter(self.model.profile_id == profile_id).offset(skip).limit(limit).all()

class CRUDEducation(CRUDBase[Education, EducationCreate, EducationUpdate]):
    def get_multi_by_profile(self, db: Session, *, profile_id: int, skip: int = 0, limit: int = 100) -> List[Education]:
        return db.query(self.model).filter(self.model.profile_id == profile_id).offset(skip).limit(limit).all()

class CRUDPublication(CRUDBase[Publication, PublicationCreate, PublicationUpdate]):
    def get_multi_by_profile(self, db: Session, *, profile_id: int, skip: int = 0, limit: int = 100) -> List[Publication]:
        return db.query(self.model).filter(self.model.profile_id == profile_id).offset(skip).limit(limit).all()

class CRUDProfile(CRUDBase[Profile, ProfileCreate, ProfileUpdate]):
    def get_by_user_id(self, db: Session, *, user_id: int) -> Optional[Profile]:
        return db.query(self.model).filter(self.model.user_id == user_id).first()
    
    def get_by_user_id_detailed(self, db: Session, *, user_id: int) -> Optional[Profile]:
        """
        Gets a profile by user_id with all its related lists (experiences, education, publications)
        eagerly loaded.
        """
        return (
            db.query(self.model)
            .filter(self.model.user_id == user_id)
            .options(
                selectinload(self.model.experiences),
                selectinload(self.model.educations), # MODIFIED: was education_entries, model uses 'educations'
                selectinload(self.model.publications)
            )
            .first()
        )

    def get_visible_in_talent_pool(self, db: Session, skip: int = 0, limit: int = 100) -> List[Profile]:
        """
        Retrieves profiles that are marked as visible in the talent pool,
        eagerly loading the associated user.
        """
        return (
            db.query(self.model)
            .filter(self.model.is_visible_in_talent_pool == True)
            .options(
                joinedload(self.model.user), # Eager load the user for name, role
                # selectinload(self.model.skills), # Skills are direct columns, not relationships
                # selectinload(self.model.research_interests) # Same for research_interests
             ) # Add other selectinload for experiences, educations if needed by the response schema directly here
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_user(self, db: Session, *, obj_in: ProfileCreate, user_id: int) -> Profile:
        """
        Create a new profile for a specific user.
        """
        # Create a dictionary from the Pydantic model, excluding unset fields if appropriate
        # or all fields if your Profile model requires them or has defaults.
        profile_data = obj_in.model_dump()
        db_obj = Profile(**profile_data, user_id=user_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_by_user_id(
        self, 
        db: Session, 
        *, 
        user_id: int, 
        obj_in: Union[ProfileUpdate, Dict[str, Any]]
    ) -> Optional[Profile]:
        db_obj = self.get_by_user_id(db, user_id=user_id)
        if db_obj:
            update_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                # Convert HttpUrl to string before setting attribute
                if isinstance(value, HttpUrl):
                    setattr(db_obj, field, str(value))
                else:
                    setattr(db_obj, field, value)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj

    # Methods to add/update/remove experiences, education, publications for a profile
    # These would typically take a profile_id and the respective Create/Update schema

    def add_experience_to_profile(self, db: Session, *, profile_id: int, experience_in: ExperienceCreate) -> Experience:
        db_obj = Experience(**experience_in.model_dump(), profile_id=profile_id) # Pydantic v2
        # db_obj = Experience(**experience_in.dict(), profile_id=profile_id) # Pydantic v1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    # Similar methods for add_education_to_profile, add_publication_to_profile
    # And for updating/deleting these sub-entities

profile = CRUDProfile(Profile)
experience = CRUDExperience(Experience)
education = CRUDEducation(Education)
publication = CRUDPublication(Publication)
# backend/app/crud/crud_profile.py
from typing import List, Optional
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
                selectinload(self.model.education_entries), # Match your model's relationship name
                selectinload(self.model.publications)
            )
            .first()
        )

    def create_for_user(self, db: Session, *, obj_in: ProfileCreate, user_id: int) -> Profile:
        db_obj = self.model(**obj_in.model_dump(), user_id=user_id) # Pydantic v2
        # db_obj = self.model(**obj_in.dict(), user_id=user_id) # Pydantic v1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_for_user(self, db: Session, *, user_id: int, obj_in: ProfileUpdate) -> Optional[Profile]:
        db_obj = self.get_by_user_id(db, user_id=user_id)
        if db_obj:
            return self.update(db, db_obj=db_obj, obj_in=obj_in)
        return None

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
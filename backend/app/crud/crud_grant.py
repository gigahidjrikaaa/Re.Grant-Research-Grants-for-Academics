from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from .base import CRUDBase
from app.models.grant import Grant, GrantApplication
from app.models.user import User # For funder type hint
from app.schemas.grant import GrantCreate, GrantUpdate, GrantApplicationCreate, GrantApplicationUpdate

class CRUDGrant(CRUDBase[Grant, GrantCreate, GrantUpdate]):
    def get_multi_with_funder(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Grant]:
        return (
            db.query(self.model)
            .options(joinedload(self.model.funder)) # Eager load Funder
            .order_by(self.model.application_deadline.desc()) # Example: newest deadlines first
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_with_funder(self, db: Session, *, id: int) -> Optional[Grant]:
        return (
            db.query(self.model)
            .options(joinedload(self.model.funder)) # Eager load Funder
            .filter(self.model.id == id)
            .first()
        )
    
    def create_with_funder(self, db: Session, *, obj_in: GrantCreate, funder_id: int) -> Grant:
        db_obj = self.model(**obj_in.model_dump(), funder_id=funder_id) # Pydantic v2
        # db_obj = self.model(**obj_in.dict(), funder_id=funder_id) # Pydantic v1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDGrantApplication(CRUDBase[GrantApplication, GrantApplicationCreate, GrantApplicationUpdate]):
    def create_with_applicant(
        self, db: Session, *, obj_in: GrantApplicationCreate, applicant_id: int
    ) -> GrantApplication:
        db_obj = self.model(**obj_in.model_dump(), user_id=applicant_id) # Pydantic v2
        # db_obj = self.model(**obj_in.dict(), user_id=applicant_id) # Pydantic v1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_grant(
        self, db: Session, *, grant_id: int, skip: int = 0, limit: int = 100
    ) -> List[GrantApplication]:
        return (
            db.query(self.model)
            .filter(self.model.grant_id == grant_id)
            .options(joinedload(self.model.applicant)) # Eager load applicant
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[GrantApplication]:
        return (
            db.query(self.model)
            .filter(self.model.user_id == user_id)
            .options(joinedload(self.model.grant).joinedload(Grant.funder)) # Eager load grant and its funder
            .offset(skip)
            .limit(limit)
            .all()
        )

grant = CRUDGrant(Grant)
grant_application = CRUDGrantApplication(GrantApplication)
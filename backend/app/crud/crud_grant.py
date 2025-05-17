from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from .base import CRUDBase
from app.models.grant import Grant, GrantApplication
from app.models.user import User # For funder type hint
from app.schemas.grant import GrantCreate, GrantUpdate, GrantApplicationCreate, GrantApplicationUpdate

class CRUDGrant(CRUDBase[Grant, GrantCreate, GrantUpdate]):
    def get_multi_with_proposer(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Grant]:
        return (
            db.query(self.model)
            .options(joinedload(self.model.proposer)) # Eager load Funder
            .order_by(self.model.application_deadline.desc()) # Example: newest deadlines first
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_with_proposer(self, db: Session, *, id: int) -> Optional[Grant]:
        return (
            db.query(self.model)
            .options(joinedload(self.model.proposer)) # Eager load Funder
            .filter(self.model.id == id)
            .first()
        )
    
    def create_with_proposer(self, db: Session, *, obj_in: GrantCreate, proposer_id: int) -> Grant:
        db_obj = self.model(**obj_in.model_dump(), proposer_id=proposer_id) # Pydantic v2
        # db_obj = self.model(**obj_in.dict(), funder_id=funder_id) # Pydantic v1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# --- CRUD FOR GRANT APPLICATIONS ---
class CRUDGrantApplication(CRUDBase[GrantApplication, GrantApplicationCreate, GrantApplicationUpdate]):
    def create_with_applicant(
        self, db: Session, *, obj_in: GrantApplicationCreate, applicant_id: int
    ) -> GrantApplication:
        db_obj_data = obj_in.model_dump() # Pydantic v2
        # db_obj_data = obj_in.dict() # Pydantic v1
        db_obj = self.model(**db_obj_data, applicant_id=applicant_id, grant_id=obj_in.grant_id) # applicant_id from param, grant_id from schema
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
            .order_by(self.model.submitted_at.desc()) # Example ordering
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[GrantApplication]:
        return (
            db.query(self.model)
            .filter(self.model.applicant_id == user_id) # Corrected to applicant_id
            .options(
                joinedload(self.model.grant).joinedload(Grant.proposer) # Eager load grant and its proposer
            )
            .order_by(self.model.submitted_at.desc()) # Example order
            .offset(skip)
            .limit(limit)
            .all()
        )

grant = CRUDGrant(Grant)
grant_application = CRUDGrantApplication(GrantApplication)
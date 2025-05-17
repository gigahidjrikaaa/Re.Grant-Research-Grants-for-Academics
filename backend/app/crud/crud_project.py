from typing import List, Optional
from sqlalchemy.orm import Session, joinedload, selectinload
from .base import CRUDBase
from app.models.project import Project, ProjectTeamMember, ProjectApplication
from app.models.user import User # For type hints
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectTeamMemberCreate, ProjectApplicationCreate, ProjectApplicationUpdate

class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    def get_multi_detailed(self, db: Session, *, skip: int = 0, limit: int = 100) -> List[Project]:
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.creator), # Eager load Creator
                selectinload(self.model.team_members).joinedload(ProjectTeamMember.user) # Eager load team members and their user details
            )
            .order_by(self.model.created_at.desc()) # Example ordering
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_detailed(self, db: Session, *, id: int) -> Optional[Project]:
        return (
            db.query(self.model)
            .options(
                joinedload(self.model.creator),
                selectinload(self.model.team_members).joinedload(ProjectTeamMember.user),
                selectinload(self.model.applications).joinedload(ProjectApplication.applicant) # Also load applications and their applicants
            )
            .filter(self.model.id == id)
            .first()
        )

    def create_with_creator(self, db: Session, *, obj_in: ProjectCreate, creator_id: int) -> Project:
        db_obj = self.model(**obj_in.model_dump(), created_by_user_id=creator_id) # Pydantic v2
        # db_obj = self.model(**obj_in.dict(), created_by_user_id=creator_id) # Pydantic v1
        
        # Add creator as a team member by default (optional, based on your logic)
        # team_member_obj = ProjectTeamMember(project=db_obj, user_id=creator_id, role_in_project="Creator/Lead")
        # db.add(team_member_obj) # Add before adding db_obj if project needs team_member on creation, or handle separately
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDProjectTeamMember(CRUDBase[ProjectTeamMember, ProjectTeamMemberCreate, ProjectTeamMemberUpdate]): # Assuming ProjectTeamMemberUpdate schema exists
    def add_team_member(self, db: Session, *, obj_in: ProjectTeamMemberCreate) -> ProjectTeamMember:
        # Check if user is already a member (optional, can be handled by unique constraint too)
        existing_member = db.query(self.model).filter_by(project_id=obj_in.project_id, user_id=obj_in.user_id).first()
        if existing_member:
            return existing_member # Or raise exception
        
        db_obj = self.model(**obj_in.model_dump()) # Pydantic v2
        # db_obj = self.model(**obj_in.dict()) # Pydantic v1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDProjectApplication(CRUDBase[ProjectApplication, ProjectApplicationCreate, ProjectApplicationUpdate]):
    def create_with_applicant(
        self, db: Session, *, obj_in: ProjectApplicationCreate, applicant_id: int
    ) -> ProjectApplication:
        db_obj = self.model(**obj_in.model_dump(), user_id=applicant_id) # Pydantic v2
        # db_obj = self.model(**obj_in.dict(), user_id=applicant_id) # Pydantic v1
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
        
    def get_multi_by_project(
        self, db: Session, *, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[ProjectApplication]:
        return (
            db.query(self.model)
            .filter(self.model.project_id == project_id)
            .options(joinedload(self.model.applicant)) # Eager load applicant
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_user(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[ProjectApplication]:
        return (
            db.query(self.model)
            .filter(self.model.user_id == user_id)
            .options(joinedload(self.model.project).joinedload(Project.creator)) # Eager load project and its creator
            .offset(skip)
            .limit(limit)
            .all()
        )


project = CRUDProject(Project)
project_team_member = CRUDProjectTeamMember(ProjectTeamMember)
project_application = CRUDProjectApplication(ProjectApplication)
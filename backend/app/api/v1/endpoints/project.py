from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Project])
def read_projects(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    # current_user: models.User = Depends(deps.get_current_active_user), # Optional
) -> Any:
    """
    Retrieve all projects with creator and team member information.
    """
    projects = crud.project.get_multi_detailed(db, skip=skip, limit=limit)
    return projects

@router.get("/{project_id}", response_model=schemas.Project)
def read_project_by_id(
    project_id: int,
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get a specific project by its ID.
    """
    project = crud.project.get_detailed(db, id=project_id) # Uses the get_detailed method
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

# TODO: Add POST, PUT, DELETE endpoints for projects, team members, applications later
# Example:
# @router.post("/", response_model=schemas.Project, status_code=201)
# def create_project(
#     *,
#     db: Session = Depends(deps.get_db),
#     project_in: schemas.ProjectCreate,
#     current_user: models.User = Depends(deps.get_current_active_user),
# ) -> Any:
#     project = crud.project.create_with_creator(db=db, obj_in=project_in, creator_id=current_user.id)
#     return project
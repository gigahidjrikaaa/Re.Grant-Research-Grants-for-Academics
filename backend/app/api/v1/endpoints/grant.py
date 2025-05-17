# backend/app/api/v1/endpoints/grant.py
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models, schemas # Ensure schemas.Grant is defined
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Grant])
def read_grants(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user: models.User = Depends(deps.get_current_active_user), # Uncomment if auth is needed
) -> Any:
    """
    Retrieve grants. Public access or requires standard user auth.
    """
    grants = crud.grant.get_multi_with_funder(db, skip=skip, limit=limit) # Assuming this CRUD method exists and fetches funder info
    return grants

@router.get("/{grant_id}", response_model=schemas.Grant)
def read_grant(
    *,
    db: Session = Depends(deps.get_db),
    grant_id: int,
    # current_user: models.User = Depends(deps.get_current_active_user), # Uncomment if auth is needed
) -> Any:
    """
    Get grant by ID.
    """
    grant = crud.grant.get_with_funder(db, id=grant_id) # Assuming this CRUD method exists
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    return grant

# Add other grant-related endpoints as needed (create, update, delete - likely protected)
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Grant])
def read_grants(
    db: Session = Depends(deps.get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    # current_user: models.User = Depends(deps.get_current_active_user), # Optional: if listings need auth
) -> Any:
        """
        Retrieve all grants with funder information.
        Publicly accessible or requires standard user authentication.
        """
        grants = crud.grant.get_multi_with_funder(db, skip=skip, limit=limit)
        return grants

@router.get("/{grant_id}", response_model=schemas.Grant)
def read_grant(
*,
db: Session = Depends(deps.get_db),
grant_id: int,
# current_user: models.User = Depends(deps.get_current_active_user), # Optional
) -> Any:
        """
        Get a specific grant by ID with funder information.
        """
        grant = crud.grant.get_with_funder(db, id=grant_id)
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        return grant

# TODO: Add POST, PUT, DELETE endpoints for grants later (will require authentication and authorization)
# Example:
# @router.post("/", response_model=schemas.Grant, status_code=201)
# def create_grant(
# *,
# db: Session = Depends(deps.get_db),
# grant_in: schemas.GrantCreate,
# current_user: models.User = Depends(deps.get_current_active_funder_or_admin), # Custom dependency
# ) -> Any:
#         grant = crud.grant.create_with_funder(db=db, obj_in=grant_in, funder_id=current_user.id)
#         return grant
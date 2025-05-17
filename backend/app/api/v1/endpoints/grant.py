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
        grants = crud.grant.get_multi_with_proposer(db, skip=skip, limit=limit)
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
        grant = crud.grant.get_with_proposer(db, id=grant_id)
        if not grant:
            raise HTTPException(status_code=404, detail="Grant not found")
        return grant

# TODO: Add POST, PUT, DELETE endpoints for grants later (will require authentication and authorization)
@router.post("/", response_model=schemas.Grant, status_code=201)
def create_grant_endpoint( # Renamed for clarity
    *,
    db: Session = Depends(deps.get_db),
    grant_in: schemas.GrantCreate, # GrantCreate now doesn't have proposer_id
    current_user: models.User = Depends(deps.get_current_active_user), # Assuming creator is the logged-in user
) -> Any:
    """
    Create new grant. The proposer is the currently authenticated user.
    """
    # If GrantCreate schema was updated to include proposer_id, then you'd pass it from grant_in.
    # If, as per your schema, GrantCreate does NOT have proposer_id, then:
    # We assume current_user is the proposer.
    # The schema GrantCreate also does not have proposer_id
    # So, we pass current_user.id to the CRUD method.
    # The GrantCreate schema you provided does NOT have proposer_id.
    # The GrantBase it inherits from also does not.
    # So, it's correct to pass proposer_id from current_user.
    
    # However, your GrantCreate schema DOES NOT include proposer_id.
    # My previous version of GrantCreate in schemas/grant.py had:
    # class GrantCreate(GrantBase):
    #     proposer_id: int 
    # If you intend the API client to set the proposer_id, then it should be in GrantCreate.
    # If the API assumes the *currently authenticated user* is the proposer, then the current GrantCreate
    # (without proposer_id) is fine, and you pass current_user.id to the CRUD method.

    # Your provided GrantCreate in the prompt:
    # class GrantCreate(GrantBase):
    # # proposer_id will be set from current_user in the endpoint
    # status: GrantStatus = GrantStatus.DRAFT
    # This implies proposer_id is NOT in the payload.
    
    grant = crud.grant.create_with_proposer(db=db, obj_in=grant_in, proposer_id=current_user.id)
    # Eager load proposer for the response
    db.refresh(grant, ["proposer"]) # Pydantic v1 style refresh with relationships
    # For Pydantic v2, if schema has Config from_attributes=True, direct return should work if proposer was loaded in CRUD.
    # The create_with_proposer doesn't eager load, so we might need to fetch it again or adjust CRUD.
    # Simplest for now: fetch again with proposer details for the response.
    return crud.grant.get_with_proposer(db, id=grant.id)


# Example for creating a grant application:
@router.post("/{grant_id}/apply", response_model=schemas.GrantApplication, status_code=201)
def create_grant_application_endpoint( # Renamed for clarity
    *,
    grant_id: int,
    db: Session = Depends(deps.get_db),
    application_in: schemas.GrantApplicationCreate, # This schema should only contain cover_letter, grant_id is from path
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Apply for a grant. Applicant is the current user.
    """
    # Check if grant exists
    grant_obj = crud.grant.get(db=db, id=grant_id)
    if not grant_obj:
        raise HTTPException(status_code=404, detail="Grant not found")

    # The GrantApplicationCreate schema already has grant_id.
    # We need to ensure it matches the path parameter or remove it from schema if path is authoritative.
    # For now, assuming schema's grant_id is used. Or better, make GrantApplicationCreate NOT have grant_id.
    
    # Let's modify GrantApplicationCreate in schemas/grant.py to not have grant_id
    # class GrantApplicationCreate(GrantApplicationBase):
    #     # grant_id: int <-- REMOVE, take from path
    
    # Then, create a temporary schema or dict for the CRUD
    application_data_to_create = schemas.GrantApplicationCreate(
        **application_in.model_dump(), 
        grant_id=grant_id # Add grant_id from path
    )

    application = crud.grant_application.create_with_applicant(
        db=db, obj_in=application_data_to_create, applicant_id=current_user.id
    )
    # Eager load for response
    db.refresh(application, ["applicant", "grant"])
    return application

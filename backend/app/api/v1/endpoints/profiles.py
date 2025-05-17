from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/talent-pool/", response_model=List[schemas.User])
def read_talent_pool_profiles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    # current_user: models.User = Depends(deps.get_current_active_user), # Uncomment to protect endpoint
) -> Any:
    """
    Retrieve users whose profiles are visible in the talent pool.
    Returns a list of User objects, each containing their profile information.
    """
    db_profiles = crud.profile.get_visible_in_talent_pool(db, skip=skip, limit=limit)
    
    users_in_talent_pool: List[models.User] = []
    for profile_obj in db_profiles:
        if profile_obj.user:
            # The schemas.User response model will automatically pick up the profile
            # data due to the relationship and orm_mode/from_attributes.
            users_in_talent_pool.append(profile_obj.user) 
            # No need for schemas.User.model_validate here, FastAPI handles it for response_model
            
    if not users_in_talent_pool and skip == 0: # Optional: return 404 if pool is empty
        # raise HTTPException(status_code=404, detail="Talent pool is currently empty.")
        pass

    return users_in_talent_pool
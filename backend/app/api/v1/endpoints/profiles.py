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


@router.get("/me", response_model=schemas.ProfileSchema)
def read_profile_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user's profile.
    """
    profile = crud.profile.get_by_user_id(db, user_id=current_user.id)
    if not profile:
        # Option 1: Return 404 if profile must exist
        # raise HTTPException(status_code=404, detail="Profile not found for current user")
        # Option 2: Create a default profile if it doesn't exist (or handle in frontend)
        # For now, let's assume it might not exist and frontend handles it or user creates it.
        # If you want to auto-create, you'd call crud.profile.create_with_user here.
        # For simplicity, we'll return null or an empty-like profile if allowed by schema.
        # However, schemas.Profile likely expects a full profile.
        # Let's stick to 404 if not found, or ensure one is created upon user registration.
        # For now, if user has no profile, this will be an issue if schema expects one.
        # A better approach is to ensure a profile is created for a user upon registration or first login.
        # If crud.profile.get_by_user_id returns None, and response_model=schemas.Profile,
        # FastAPI will try to validate None against Profile, which will fail.
        # So, we must ensure a profile object is returned or raise HTTP 404.
        raise HTTPException(status_code=404, detail="Profile not found. Please create one.")
    return profile


@router.put("/me", response_model=schemas.ProfileSchema)
def update_profile_me(
    *,
    db: Session = Depends(deps.get_db),
    profile_in: schemas.ProfileUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user's profile.
    """
    profile = crud.profile.get_by_user_id(db, user_id=current_user.id)
    if not profile:
        # If profile doesn't exist, you might want to create it instead of erroring,
        # or ensure it's created upon user registration.
        # For a PUT, typically it means "replace or create".
        # However, if ID is implicit (from current_user), "update or error if not exists" is also common.
        # Let's assume for now we update if exists, error if not.
        # A more robust solution would be create if not profile: crud.profile.create_with_user(...)
        # then proceed to update. Or, simply use an "upsert" like logic in CRUD.
        
        # For now, let's try to create if it doesn't exist, then update.
        # This makes the PUT behave more like an upsert for the /me endpoint.
        profile_create_data = schemas.ProfileCreate(**profile_in.model_dump(exclude_unset=True)) # Convert ProfileUpdate to ProfileCreate
        
        profile = crud.profile.create_with_user(db=db, obj_in=profile_create_data, user_id=current_user.id)
        # After creation, if profile_in (ProfileUpdate) has fields that were not part of ProfileCreate
        # or if you want to ensure all fields from profile_in are applied, you might update again.
        # However, if ProfileCreate is comprehensive, this second update might be redundant.
        # For simplicity, if create_with_user uses ProfileCreate which is based on ProfileUpdate fields,
        # the created profile should already reflect profile_in.
        # If there's a significant difference, you might need:
        # profile = crud.profile.update_by_user_id(db=db, user_id=current_user.id, obj_in=profile_in)

    else: # Profile exists, so update it
        profile = crud.profile.update_by_user_id(db=db, user_id=current_user.id, obj_in=profile_in)

    if not profile: # Should not happen if create/update logic is correct
        raise HTTPException(status_code=500, detail="Could not create or update profile.")
        
    return profile
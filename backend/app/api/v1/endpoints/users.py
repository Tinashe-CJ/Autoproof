from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from supabase.client import create_client, Client
from backend.app.core.supabase import get_supabase
from backend.app.core.auth import get_current_user
from backend.app.models.user import UserResponse, UserUpdate
from config.database import get_db
from models.user import User as SAUser
from models.team import Team as SATeam
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get all users (admin only for now)
    """
    try:
        response = supabase.table("users").select("*").execute()
        return [UserResponse(**user) for user in response.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get or create the current user and team from Clerk JWT claims
    """
    # Extract Clerk claims
    clerk_user_id = current_user.get("sub")
    email = current_user.get("email")
    org_id = current_user.get("org_id")
    org_name = current_user.get("org_name", "Team")
    first_name = current_user.get("first_name", "")
    last_name = current_user.get("last_name", "")

    # Look up or create team
    team = db.query(SATeam).filter(SATeam.id == org_id).first()
    if not team:
        team = SATeam(id=org_id, name=org_name)
        db.add(team)
        db.commit()
        db.refresh(team)

    # Look up or create user
    user = db.query(SAUser).filter(SAUser.id == clerk_user_id).first()
    if not user:
        user = SAUser(
            id=clerk_user_id,
            clerk_id=clerk_user_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            team_id=org_id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Return user info in API response model
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=f"{user.first_name} {user.last_name}".strip(),
        is_active=user.is_active,
        created_at=user.created_at
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get user by ID
    """
    try:
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(**response.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Update user profile
    """
    # Only allow users to update their own profile for now
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this user"
        )
    
    try:
        update_data = user_update.model_dump(exclude_unset=True)
        
        if update_data:
            response = supabase.table("users").update(update_data).eq("id", user_id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return UserResponse(**response.data[0])
        
        # If no updates, return current user
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        return UserResponse(**response.data[0])
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
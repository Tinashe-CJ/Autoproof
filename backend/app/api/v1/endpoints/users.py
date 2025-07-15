from typing import List
from fastapi import APIRouter, HTTPException, status, Depends
from supabase import Client
from app.core.supabase import get_supabase
from app.core.auth import get_current_user
from app.models.user import UserResponse, UserUpdate

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
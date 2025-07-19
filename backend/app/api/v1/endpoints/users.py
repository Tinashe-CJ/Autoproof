from fastapi import APIRouter, HTTPException, status, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

from backend.app.core.supabase import get_supabase
from backend.app.core.auth import (
    get_current_user_with_role, 
    require_admin, 
    require_manage_users,
    log_auth_event
)
from models.user import UserRole

router = APIRouter()

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    clerk_id: str
    email: str
    first_name: str
    last_name: str
    team_id: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]

class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    role: UserRole = UserRole.MEMBER
    team_id: str

@router.get("/users", response_model=List[UserResponse])
async def get_users(
    request: Request,
    current_user: dict = Depends(require_manage_users),
    supabase = Depends(get_supabase)
):
    """Get all users in the current user's team"""
    try:
        result = supabase.table("users").select("*").eq("team_id", current_user["team_id"]).execute()
        
        users = []
        for user_data in result.data:
            users.append(UserResponse(
                id=user_data["id"],
                clerk_id=user_data["clerk_id"],
                email=user_data["email"],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                team_id=user_data["team_id"],
                role=user_data.get("role", "member"),
                is_active=user_data.get("is_active", True),
                created_at=datetime.fromisoformat(user_data["created_at"]),
                updated_at=datetime.fromisoformat(user_data["updated_at"]) if user_data.get("updated_at") else None
            ))
        
        return users
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/me", response_model=UserResponse)
async def get_current_user_profile(
    request: Request,
    current_user: dict = Depends(get_current_user_with_role),
    supabase = Depends(get_supabase)
):
    """Get current user profile"""
    try:
        result = supabase.table("users").select("*").eq("id", current_user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        user_data = result.data[0]
        
        return UserResponse(
            id=user_data["id"],
            clerk_id=user_data["clerk_id"],
            email=user_data["email"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            team_id=user_data["team_id"],
            role=user_data.get("role", "member"),
            is_active=user_data.get("is_active", True),
            created_at=datetime.fromisoformat(user_data["created_at"]),
            updated_at=datetime.fromisoformat(user_data["updated_at"]) if user_data.get("updated_at") else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    request: Request,
    current_user: dict = Depends(require_manage_users),
    supabase = Depends(get_supabase)
):
    """Get a specific user by ID (must be in same team)"""
    try:
        result = supabase.table("users").select("*").eq("id", user_id).eq("team_id", current_user["team_id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = result.data[0]
        
        return UserResponse(
            id=user_data["id"],
            clerk_id=user_data["clerk_id"],
            email=user_data["email"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            team_id=user_data["team_id"],
            role=user_data.get("role", "member"),
            is_active=user_data.get("is_active", True),
            created_at=datetime.fromisoformat(user_data["created_at"]),
            updated_at=datetime.fromisoformat(user_data["updated_at"]) if user_data.get("updated_at") else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/me", response_model=UserResponse)
async def update_current_user_profile(
    request: Request,
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user_with_role),
    supabase = Depends(get_supabase)
):
    """Update current user profile (cannot change role or team)"""
    try:
        # Only allow updating personal information
        update_data = {}
        if user_update.first_name is not None:
            update_data["first_name"] = user_update.first_name
        if user_update.last_name is not None:
            update_data["last_name"] = user_update.last_name
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        result = supabase.table("users").update(update_data).eq("id", current_user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = result.data[0]
        
        # Log profile update
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "profile_updated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"updated_fields": list(update_data.keys())}
        )
        
        return UserResponse(
            id=updated_user["id"],
            clerk_id=updated_user["clerk_id"],
            email=updated_user["email"],
            first_name=updated_user["first_name"],
            last_name=updated_user["last_name"],
            team_id=updated_user["team_id"],
            role=updated_user.get("role", "member"),
            is_active=updated_user.get("is_active", True),
            created_at=datetime.fromisoformat(updated_user["created_at"]),
            updated_at=datetime.fromisoformat(updated_user["updated_at"]) if updated_user.get("updated_at") else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    request: Request,
    user_update: UserUpdate,
    current_user: dict = Depends(require_admin),
    supabase = Depends(get_supabase)
):
    """Update user profile (admin only, can change role and status)"""
    try:
        # Check if user exists and is in same team
        result = supabase.table("users").select("*").eq("id", user_id).eq("team_id", current_user["team_id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        existing_user = result.data[0]
        
        # Build update data
        update_data = {}
        if user_update.first_name is not None:
            update_data["first_name"] = user_update.first_name
        if user_update.last_name is not None:
            update_data["last_name"] = user_update.last_name
        if user_update.role is not None:
            update_data["role"] = user_update.role.value
        if user_update.is_active is not None:
            update_data["is_active"] = user_update.is_active
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        update_data["updated_at"] = datetime.now().isoformat()
        
        # Update user
        result = supabase.table("users").update(update_data).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to update user")
        
        updated_user = result.data[0]
        
        # Log user update
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "user_updated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {
                "target_user_id": user_id,
                "updated_fields": list(update_data.keys()),
                "role_changed": "role" in update_data
            }
        )
        
        return UserResponse(
            id=updated_user["id"],
            clerk_id=updated_user["clerk_id"],
            email=updated_user["email"],
            first_name=updated_user["first_name"],
            last_name=updated_user["last_name"],
            team_id=updated_user["team_id"],
            role=updated_user.get("role", "member"),
            is_active=updated_user.get("is_active", True),
            created_at=datetime.fromisoformat(updated_user["created_at"]),
            updated_at=datetime.fromisoformat(updated_user["updated_at"]) if updated_user.get("updated_at") else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: str,
    request: Request,
    current_user: dict = Depends(require_admin),
    supabase = Depends(get_supabase)
):
    """Deactivate a user (admin only)"""
    try:
        # Check if user exists and is in same team
        result = supabase.table("users").select("*").eq("id", user_id).eq("team_id", current_user["team_id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        target_user = result.data[0]
        
        # Prevent deactivating yourself
        if user_id == current_user["id"]:
            raise HTTPException(status_code=400, detail="Cannot deactivate your own account")
        
        # Deactivate user
        supabase.table("users").update({
            "is_active": False,
            "updated_at": datetime.now().isoformat()
        }).eq("id", user_id).execute()
        
        # Log user deactivation
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "user_deactivated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"target_user_id": user_id, "target_email": target_user["email"]}
        )
        
        return {"message": "User deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/{user_id}/reactivate")
async def reactivate_user(
    user_id: str,
    request: Request,
    current_user: dict = Depends(require_admin),
    supabase = Depends(get_supabase)
):
    """Reactivate a deactivated user (admin only)"""
    try:
        # Check if user exists and is in same team
        result = supabase.table("users").select("*").eq("id", user_id).eq("team_id", current_user["team_id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        target_user = result.data[0]
        
        # Reactivate user
        supabase.table("users").update({
            "is_active": True,
            "updated_at": datetime.now().isoformat()
        }).eq("id", user_id).execute()
        
        # Log user reactivation
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "user_reactivated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"target_user_id": user_id, "target_email": target_user["email"]}
        )
        
        return {"message": "User reactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/me/permissions")
async def get_current_user_permissions(
    request: Request,
    current_user: dict = Depends(get_current_user_with_role)
):
    """Get current user's permissions based on their role"""
    try:
        role = current_user.get("role", "member")
        permissions = {
            "admin": [
                "read", "write", "delete", "manage_users", "manage_team", 
                "manage_policies", "manage_violations", "view_analytics", "manage_billing"
            ],
            "member": [
                "read", "write", "manage_policies", "manage_violations", "view_analytics"
            ],
            "viewer": [
                "read", "view_analytics"
            ]
        }
        
        return {
            "user_id": current_user["id"],
            "role": role,
            "permissions": permissions.get(role, []),
            "team_id": current_user["team_id"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import APIRouter, HTTPException, status, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
import secrets
import hashlib
from datetime import datetime, timedelta
import json

from backend.app.core.supabase import get_supabase
from backend.app.core.auth import (
    get_current_user_with_role, 
    require_admin, 
    log_auth_event,
    authenticate_api_key
)

router = APIRouter()

class APIKeyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    expires_in_days: Optional[int] = 365  # Default to 1 year
    permissions: List[str] = ["read"]  # Default permissions

class APIKeyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    key_prefix: str
    permissions: List[str]
    is_active: bool
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]

class APIKeyCreateResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    api_key: str  # Only returned once on creation
    permissions: List[str]
    expires_at: Optional[datetime]

@router.post("/api-keys", response_model=APIKeyCreateResponse)
async def create_api_key(
    request: Request,
    api_key_data: APIKeyCreate,
    current_user: dict = Depends(require_admin),
    supabase = Depends(get_supabase)
):
    """Create a new API key for the current user"""
    try:
        # Generate a secure API key
        api_key = f"ak_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(api_key.encode()).hexdigest()
        
        # Calculate expiration
        expires_at = None
        if api_key_data.expires_in_days:
            expires_at = datetime.now() + timedelta(days=api_key_data.expires_in_days)
        
        # Create API key record
        api_key_record = {
            "id": f"key_{secrets.token_urlsafe(16)}",
            "user_id": current_user["id"],
            "team_id": current_user["team_id"],
            "name": api_key_data.name,
            "description": api_key_data.description,
            "key_hash": key_hash,
            "key_prefix": api_key[:8],
            "permissions": api_key_data.permissions,
            "is_active": True,
            "expires_at": expires_at.isoformat() if expires_at else None,
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase.table("api_keys").insert(api_key_record).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create API key")
        
        # Log API key creation
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "api_key_created",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"api_key_id": api_key_record["id"], "key_name": api_key_data.name}
        )
        
        return APIKeyCreateResponse(
            id=api_key_record["id"],
            name=api_key_record["name"],
            description=api_key_record["description"],
            api_key=api_key,  # Only returned once
            permissions=api_key_record["permissions"],
            expires_at=expires_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api-keys", response_model=List[APIKeyResponse])
async def list_api_keys(
    request: Request,
    current_user: dict = Depends(get_current_user_with_role),
    supabase = Depends(get_supabase)
):
    """List all API keys for the current user"""
    try:
        result = supabase.table("api_keys").select("*").eq("user_id", current_user["id"]).execute()
        
        api_keys = []
        for key_data in result.data:
            api_keys.append(APIKeyResponse(
                id=key_data["id"],
                name=key_data["name"],
                description=key_data["description"],
                key_prefix=key_data["key_prefix"],
                permissions=key_data["permissions"],
                is_active=key_data["is_active"],
                created_at=datetime.fromisoformat(key_data["created_at"]),
                expires_at=datetime.fromisoformat(key_data["expires_at"]) if key_data.get("expires_at") else None,
                last_used_at=datetime.fromisoformat(key_data["last_used_at"]) if key_data.get("last_used_at") else None
            ))
        
        return api_keys
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api-keys/{key_id}", response_model=APIKeyResponse)
async def get_api_key(
    key_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user_with_role),
    supabase = Depends(get_supabase)
):
    """Get a specific API key by ID"""
    try:
        result = supabase.table("api_keys").select("*").eq("id", key_id).eq("user_id", current_user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="API key not found")
        
        key_data = result.data[0]
        
        return APIKeyResponse(
            id=key_data["id"],
            name=key_data["name"],
            description=key_data["description"],
            key_prefix=key_data["key_prefix"],
            permissions=key_data["permissions"],
            is_active=key_data["is_active"],
            created_at=datetime.fromisoformat(key_data["created_at"]),
            expires_at=datetime.fromisoformat(key_data["expires_at"]) if key_data.get("expires_at") else None,
            last_used_at=datetime.fromisoformat(key_data["last_used_at"]) if key_data.get("last_used_at") else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user_with_role),
    supabase = Depends(get_supabase)
):
    """Revoke an API key"""
    try:
        # Check if API key exists and belongs to user
        result = supabase.table("api_keys").select("*").eq("id", key_id).eq("user_id", current_user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="API key not found")
        
        # Revoke the API key
        supabase.table("api_keys").update({"is_active": False}).eq("id", key_id).execute()
        
        # Log API key revocation
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "api_key_revoked",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"api_key_id": key_id}
        )
        
        return {"message": "API key revoked successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api-keys/{key_id}/rotate")
async def rotate_api_key(
    key_id: str,
    request: Request,
    current_user: dict = Depends(require_admin),
    supabase = Depends(get_supabase)
):
    """Rotate an API key (create new one and revoke old one)"""
    try:
        # Check if API key exists and belongs to user
        result = supabase.table("api_keys").select("*").eq("id", key_id).eq("user_id", current_user["id"]).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="API key not found")
        
        old_key_data = result.data[0]
        
        # Generate new API key
        new_api_key = f"ak_{secrets.token_urlsafe(32)}"
        new_key_hash = hashlib.sha256(new_api_key.encode()).hexdigest()
        
        # Update the API key record
        supabase.table("api_keys").update({
            "key_hash": new_key_hash,
            "key_prefix": new_api_key[:8],
            "updated_at": datetime.now().isoformat()
        }).eq("id", key_id).execute()
        
        # Log API key rotation
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "api_key_rotated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"api_key_id": key_id}
        )
        
        return {
            "message": "API key rotated successfully",
            "new_api_key": new_api_key
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api-keys/validate")
async def validate_api_key(
    request: Request,
    current_user: dict = Depends(authenticate_api_key),
    supabase = Depends(get_supabase)
):
    """Validate an API key and return user information"""
    try:
        return {
            "valid": True,
            "user": {
                "id": current_user["id"],
                "email": current_user["email"],
                "first_name": current_user["first_name"],
                "last_name": current_user["last_name"],
                "role": current_user.get("role", "member"),
                "team_id": current_user["team_id"]
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid API key") 
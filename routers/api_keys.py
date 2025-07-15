from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.database import get_db
from auth import get_current_user
from models.user import User
from models.api_key import APIKey
import secrets
import hashlib
import uuid

router = APIRouter()


class APIKeyCreate(BaseModel):
    name: str


class APIKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    last_used_at: str = None
    created_at: str


class APIKeyCreateResponse(APIKeyResponse):
    api_key: str  # Only returned on creation


@router.get("/api-keys", response_model=List[APIKeyResponse])
async def get_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all API keys for the current user's team"""
    
    api_keys = db.query(APIKey).filter(
        APIKey.team_id == current_user.team_id,
        APIKey.is_active == True
    ).all()
    
    return [
        APIKeyResponse(
            id=key.id,
            name=key.name,
            key_prefix=key.key_prefix,
            is_active=key.is_active,
            last_used_at=key.last_used_at.isoformat() if key.last_used_at else None,
            created_at=key.created_at.isoformat()
        )
        for key in api_keys
    ]


@router.post("/api-keys", response_model=APIKeyCreateResponse)
async def create_api_key(
    key_request: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new API key for the team"""
    
    # Check if user already has too many API keys (limit to 10)
    existing_keys = db.query(APIKey).filter(
        APIKey.team_id == current_user.team_id,
        APIKey.is_active == True
    ).count()
    
    if existing_keys >= 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum number of API keys reached (10)"
        )
    
    # Generate a secure API key
    api_key = f"ap_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    key_prefix = api_key[:12] + "..."
    
    # Create API key record
    new_api_key = APIKey(
        id=str(uuid.uuid4()),
        name=key_request.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        user_id=current_user.id,
        team_id=current_user.team_id,
        is_active=True
    )
    
    db.add(new_api_key)
    db.commit()
    db.refresh(new_api_key)
    
    return APIKeyCreateResponse(
        id=new_api_key.id,
        name=new_api_key.name,
        key_prefix=new_api_key.key_prefix,
        is_active=new_api_key.is_active,
        created_at=new_api_key.created_at.isoformat(),
        api_key=api_key  # Only returned on creation
    )


@router.delete("/api-keys/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete (deactivate) an API key"""
    
    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.team_id == current_user.team_id,
        APIKey.is_active == True
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    # Soft delete by marking as inactive
    api_key.is_active = False
    db.commit()
    
    return {"message": "API key deleted successfully"}


@router.put("/api-keys/{key_id}")
async def update_api_key(
    key_id: str,
    key_update: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an API key (currently only name can be updated)"""
    
    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.team_id == current_user.team_id,
        APIKey.is_active == True
    ).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="API key not found"
        )
    
    api_key.name = key_update.name
    db.commit()
    
    return APIKeyResponse(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at.isoformat() if api_key.last_used_at else None,
        created_at=api_key.created_at.isoformat()
    )
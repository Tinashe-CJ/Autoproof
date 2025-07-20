"""
Development authentication middleware for testing purposes
This should only be used in development environments
"""

import os
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.app.core.supabase import get_supabase

security = HTTPBearer(auto_error=False)

async def get_dev_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase = Depends(get_supabase)
) -> Optional[Dict[str, Any]]:
    """
    Development authentication that bypasses Clerk for testing
    Use header: Authorization: Bearer dev-test@autoproof.com
    """
    
    # Only enable in development
    if os.getenv("ENVIRONMENT", "development") != "development":
        return None
    
    if not credentials or not credentials.credentials:
        return None
    
    # Check if this is a dev token
    if not credentials.credentials.startswith("dev-"):
        return None
    
    # Extract email from dev token
    email = credentials.credentials[4:]  # Remove "dev-" prefix
    
    try:
        # Get user from database by email
        result = supabase.table("users").select("*").eq("email", email).execute()
        
        if not result.data:
            print(f"Dev auth: User not found for email {email}")
            return None
        
        user_data = result.data[0]
        
        if not user_data.get("is_active", True):
            print(f"Dev auth: User {email} is inactive")
            return None
        
        print(f"Dev auth: Authenticated as {email}")
        return user_data
        
    except Exception as e:
        print(f"Dev auth error: {e}")
        return None

async def get_current_user_dev(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    supabase = Depends(get_supabase)
) -> Dict[str, Any]:
    """
    Get current user with dev authentication fallback
    """
    
    # Try dev authentication first
    dev_user = await get_dev_user(request, credentials, supabase)
    if dev_user:
        return dev_user
    
    # If no dev auth, return a mock user for testing
    if os.getenv("ENVIRONMENT", "development") == "development":
        print("Dev auth: Using mock user for testing")
        return {
            "id": "test-user-id",
            "email": "test@autoproof.com",
            "team_id": "824a14fc-c4c6-4268-8d49-d01f686af393",
            "role": "admin",
            "is_active": True
        }
    
    # In production, this would raise an authentication error
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    ) 
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import Settings
import jwt

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """
    Get current authenticated user from Clerk JWT token
    """
    try:
        settings = Settings()
        # Validate Clerk JWT using the secret key from .env
        payload = jwt.decode(
            credentials.credentials,
            settings.CLERK_JWT_KEY,
            algorithms=["HS256"]
        )
        # You may want to check for required claims here (e.g., sub, org_id, etc.)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    """
    Get current user if authenticated, otherwise return None
    """
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
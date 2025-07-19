from typing import Optional
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx
from sqlalchemy.orm import Session
from config.settings import settings
from config.database import get_db
from models.user import User
from models.team import Team
import uuid

security = HTTPBearer()


async def verify_clerk_token(token: str) -> dict:
    """Verify Clerk JWT token and return user data"""
    try:
        # Get Clerk's public keys for JWT verification
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.dev/v1/jwks",
                headers={"Authorization": f"Bearer {settings.CLERK_SECRET_KEY}"}
            )
            jwks = response.json()
        
        # Decode and verify the JWT
        # Note: In production, you should cache the JWKS and implement proper key rotation
        header = jwt.get_unverified_header(token)
        key = None
        for jwk in jwks["keys"]:
            if jwk["kid"] == header["kid"]:
                key = jwk
                break
        
        if not key:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Verify token (simplified - in production use proper JWT verification)
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.CLERK_PUBLISHABLE_KEY
        )
        
        return payload
    
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from Clerk token"""
    
    token_data = await verify_clerk_token(credentials.credentials)
    clerk_user_id = token_data.get("sub")
    
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Get or create user in our database
    user = db.query(User).filter(User.clerk_id == clerk_user_id).first()
    
    if not user:
        # Create new user from Clerk data
        user_data = {
            "id": str(uuid.uuid4()),
            "clerk_id": clerk_user_id,
            "email": token_data.get("email", f"user_{clerk_user_id}@example.com"),
            "first_name": token_data.get("given_name", "User"),
            "last_name": token_data.get("family_name", "Name"),
        }
        
        # Create default team for new user
        team = Team(
            id=str(uuid.uuid4()),
            name=f"{user_data['first_name']}'s Team"
        )
        db.add(team)
        db.flush()
        
        user_data["team_id"] = team.id
        user = User(**user_data)
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user


async def verify_api_key(
    request: Request,
    db: Session = Depends(get_db)
) -> tuple[User, Team]:
    """Verify API key for analyze endpoint"""
    
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required"
        )
    
    # Hash the provided key and look it up
    import hashlib
    key_hash = hashlib.sha256(api_key.encode()).hexdigest()
    
    from models.api_key import APIKey
    api_key_obj = db.query(APIKey).filter(
        APIKey.key_hash == key_hash,
        APIKey.is_active == True
    ).first()
    
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key"
        )
    
    # Update last used timestamp
    from sqlalchemy.sql import func
    api_key_obj.last_used_at = func.now()
    db.commit()
    
    return api_key_obj.user, api_key_obj.team
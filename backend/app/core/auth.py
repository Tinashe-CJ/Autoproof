from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import requests
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json

from backend.app.core.supabase import get_supabase
from models.user import User, UserRole

security = HTTPBearer()

CLERK_ISSUER = "https://immortal-buck-40.clerk.accounts.dev"
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"

_jwks_cache = None

def get_clerk_public_keys():
    global _jwks_cache
    if _jwks_cache is None:
        jwks = requests.get(JWKS_URL).json()
        _jwks_cache = jwks["keys"]
    return _jwks_cache

def get_public_key_for_kid(kid, keys):
    for key in keys:
        if key["kid"] == kid:
            return key
    return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user from JWT token"""
    try:
        token = credentials.credentials
        headers = jwt.get_unverified_header(token)
        keys = get_clerk_public_keys()
        key = get_public_key_for_kid(headers["kid"], keys)
        if not key:
            print("JWT validation error: Public key not found for kid", headers.get("kid"))
            raise HTTPException(status_code=401, detail="Public key not found")
        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=None,  # Set if you use audience
            issuer=CLERK_ISSUER
        )
        return payload
    except Exception as e:
        print("JWT validation error:", e)
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

async def get_user_from_db(clerk_id: str, supabase) -> Optional[Dict[str, Any]]:
    """Get user from database by Clerk ID"""
    try:
        result = supabase.table("users").select("*").eq("clerk_id", clerk_id).execute()
        if result.data:
            return result.data[0]
        return None
    except Exception as e:
        print(f"Error fetching user from database: {e}")
        return None

async def get_current_user_with_role(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase = Depends(get_supabase)
) -> Dict[str, Any]:
    """Get current authenticated user with role information"""
    try:
        # Get JWT payload
        jwt_payload = await get_current_user(credentials)
        clerk_id = jwt_payload.get("sub")
        
        if not clerk_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user from database
        user_data = await get_user_from_db(clerk_id, supabase)
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user_data.get("is_active", True):
            raise HTTPException(status_code=403, detail="User account is inactive")
        
        # Log successful authentication
        await log_auth_event(
            supabase, 
            user_data["id"], 
            user_data["team_id"], 
            "login", 
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"clerk_id": clerk_id}
        )
        
        return user_data
        
    except HTTPException:
        # Log failed authentication
        await log_auth_event(
            supabase,
            None,
            None,
            "login_failed",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"error": "Invalid credentials"}
        )
        raise

def has_permission(user_data: Dict[str, Any], permission: str) -> bool:
    """Check if user has a specific permission based on their role"""
    role = user_data.get("role", "member")
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
    return permission in permissions.get(role, [])

def require_permission(permission: str):
    """Decorator to require specific permission"""
    async def permission_checker(
        request: Request,
        current_user: Dict[str, Any] = Depends(get_current_user_with_role),
        supabase = Depends(get_supabase)
    ):
        if not has_permission(current_user, permission):
            # Log permission denied
            await log_auth_event(
                supabase,
                current_user["id"],
                current_user["team_id"],
                "permission_denied",
                request.client.host if request.client else None,
                request.headers.get("user-agent"),
                {"required_permission": permission, "user_role": current_user.get("role", "member")}
            )
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required: {permission}"
            )
        return current_user
    return permission_checker

def require_role(role: UserRole):
    """Decorator to require specific role"""
    async def role_checker(
        request: Request,
        current_user: Dict[str, Any] = Depends(get_current_user_with_role),
        supabase = Depends(get_supabase)
    ):
        if current_user.get("role", "member") != role.value:
            # Log permission denied
            await log_auth_event(
                supabase,
                current_user["id"],
                current_user["team_id"],
                "permission_denied",
                request.client.host if request.client else None,
                request.headers.get("user-agent"),
                {"required_role": role.value, "user_role": current_user.get("role", "member")}
            )
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required role: {role.value}"
            )
        return current_user
    return role_checker

# Convenience functions for common role requirements
require_admin = require_role(UserRole.ADMIN)
require_member = require_role(UserRole.MEMBER)
require_viewer = require_role(UserRole.VIEWER)

# Convenience functions for common permission requirements
require_read = require_permission("read")
require_write = require_permission("write")
require_manage_policies = require_permission("manage_policies")
require_manage_violations = require_permission("manage_violations")
require_view_analytics = require_permission("view_analytics")
require_manage_users = require_permission("manage_users")
require_manage_team = require_permission("manage_team")
require_manage_billing = require_permission("manage_billing")

async def log_auth_event(
    supabase,
    user_id: Optional[str],
    team_id: Optional[str],
    event_type: str,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
):
    """Log authentication and authorization events"""
    try:
        audit_data = {
            "user_id": user_id,
            "team_id": team_id,
            "event_type": event_type,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "details": details or {}
        }
        
        supabase.table("auth_audit_logs").insert(audit_data).execute()
    except Exception as e:
        print(f"Error logging auth event: {e}")

# API Key Authentication
async def get_user_from_api_key(
    api_key: str,
    supabase = Depends(get_supabase)
) -> Optional[Dict[str, Any]]:
    """Get user from API key"""
    try:
        # Get API key from database
        result = supabase.table("api_keys").select("*").eq("key_hash", api_key).eq("is_active", True).execute()
        
        if not result.data:
            return None
        
        api_key_data = result.data[0]
        
        # Check if API key is expired
        if api_key_data.get("expires_at") and datetime.fromisoformat(api_key_data["expires_at"]) < datetime.now():
            return None
        
        # Get user
        user_result = supabase.table("users").select("*").eq("id", api_key_data["user_id"]).execute()
        
        if not user_result.data:
            return None
        
        return user_result.data[0]
        
    except Exception as e:
        print(f"Error validating API key: {e}")
        return None

async def authenticate_api_key(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    supabase = Depends(get_supabase)
) -> Dict[str, Any]:
    """Authenticate user via API key"""
    try:
        api_key = credentials.credentials
        user_data = await get_user_from_api_key(api_key, supabase)
        
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid API key")
        
        if not user_data.get("is_active", True):
            raise HTTPException(status_code=403, detail="User account is inactive")
        
        # Log API key authentication
        await log_auth_event(
            supabase,
            user_data["id"],
            user_data["team_id"],
            "api_key_used",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"api_key_id": api_key[:8] + "..."}  # Log partial key for security
        )
        
        return user_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"API key authentication error: {e}")
        raise HTTPException(status_code=401, detail="Invalid API key")

# Session Management
class SessionManager:
    """Manage user sessions with timeout and refresh"""
    
    def __init__(self):
        self.sessions = {}  # In production, use Redis or similar
    
    def create_session(self, user_id: str, expires_in: int = 3600) -> str:
        """Create a new session for user"""
        session_id = f"session_{user_id}_{datetime.now().timestamp()}"
        expires_at = datetime.now() + timedelta(seconds=expires_in)
        
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.now(),
            "expires_at": expires_at,
            "last_activity": datetime.now()
        }
        
        return session_id
    
    def validate_session(self, session_id: str) -> Optional[str]:
        """Validate session and return user_id if valid"""
        if session_id not in self.sessions:
            return None
        
        session = self.sessions[session_id]
        
        # Check if session is expired
        if session["expires_at"] < datetime.now():
            del self.sessions[session_id]
            return None
        
        # Update last activity
        session["last_activity"] = datetime.now()
        
        return session["user_id"]
    
    def refresh_session(self, session_id: str, expires_in: int = 3600) -> bool:
        """Refresh session expiration"""
        if session_id not in self.sessions:
            return False
        
        session = self.sessions[session_id]
        session["expires_at"] = datetime.now() + timedelta(seconds=expires_in)
        session["last_activity"] = datetime.now()
        
        return True
    
    def revoke_session(self, session_id: str) -> bool:
        """Revoke a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False

# Global session manager instance
session_manager = SessionManager()
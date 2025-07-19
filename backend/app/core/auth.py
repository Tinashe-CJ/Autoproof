from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
import requests

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
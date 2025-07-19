from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, users, compliance, billing, api_keys, policies, analyze, integrations

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(api_keys.router, prefix="/api-keys", tags=["api-keys"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
api_router.include_router(analyze.router, prefix="/analyze", tags=["analysis"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
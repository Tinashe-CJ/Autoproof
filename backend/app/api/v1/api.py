from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, users, compliance, billing

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["compliance"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
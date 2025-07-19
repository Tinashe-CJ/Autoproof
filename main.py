from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config.settings import settings
from config.database import engine, Base
from routers import analyze, billing, api_keys, usage, team


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    Base.metadata.create_all(bind=engine)
    print("🚀 AutoProof API starting up...")
    yield
    print("🛑 AutoProof API shutting down...")


app = FastAPI(
    title="AutoProof API",
    version="1.0.0",
    description="AI-Powered Compliance Automation API",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analyze, prefix="/api", tags=["Analysis"])
app.include_router(billing, prefix="/api", tags=["Billing"])
app.include_router(api_keys, prefix="/api", tags=["API Keys"])
app.include_router(usage, prefix="/api", tags=["Usage"])
app.include_router(team, prefix="/api", tags=["Team"])


@app.get("/")
async def root():
    return {
        "message": "AutoProof API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "autoproof-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
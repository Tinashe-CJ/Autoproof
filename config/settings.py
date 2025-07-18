from typing import List
from pydantic_settings import BaseSettings
from pydantic import validator


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Clerk Authentication
    CLERK_PUBLISHABLE_KEY: str
    CLERK_SECRET_KEY: str
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # App Settings
    SECRET_KEY: str  # <-- Make sure this is set in your .env
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    # Plan configurations
    STARTER_PLAN_PRICE_ID: str = "price_starter"
    GROWTH_PLAN_PRICE_ID: str = "price_growth"
    BUSINESS_PLAN_PRICE_ID: str = "price_business"
    
    # Usage limits per plan (monthly)
    STARTER_REQUESTS_LIMIT: int = 1000
    STARTER_TOKENS_LIMIT: int = 100000
    
    GROWTH_REQUESTS_LIMIT: int = 5000
    GROWTH_TOKENS_LIMIT: int = 500000
    
    BUSINESS_REQUESTS_LIMIT: int = 50000
    BUSINESS_TOKENS_LIMIT: int = 5000000
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


settings = Settings()

# Database connection pooling configuration
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 30
DATABASE_POOL_TIMEOUT = 30
DATABASE_POOL_RECYCLE = 3600


# Stripe API caching configuration
STRIPE_CACHE_TTL = 300  # 5 minutes
STRIPE_CACHE_ENABLED = True

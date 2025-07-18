import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# Get the path to the SSL certificate
ssl_cert_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'certs', 'autoproofSSL.crt')

# Try connection pooling first, fallback to direct connection
def create_database_engine():
    try:
        # First, try with session pooler (more reliable)
        pool_url = settings.DATABASE_URL.replace(
            "postgres:TakanomeRoronoa4683%23@db.jwwdunhhmbqqfbotnzvm.supabase.co:5432",
            "postgres.jwwdunhhmbqqfbotnzvm:TakanomeRoronoa4683%23@aws-0-eu-west-1.pooler.supabase.com:5432"
        )
        
        return create_engine(
            pool_url,
            connect_args={
                "sslmode": "require",  # Use require for pooling
            },
            pool_size=5,
            max_overflow=10,
            pool_pre_ping=True,
            pool_recycle=300,
        )
    except Exception as e:
        print(f"Session pooler failed: {e}")
        # Fallback to direct connection with SSL
        return create_engine(
            settings.DATABASE_URL,
            connect_args={
                "sslmode": "verify-full",
                "sslrootcert": ssl_cert_path,
            }
        )

engine = create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
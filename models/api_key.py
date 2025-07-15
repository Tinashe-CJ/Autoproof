from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    key_hash = Column(String, nullable=False)  # Hashed API key
    key_prefix = Column(String, nullable=False)  # First 8 chars for display
    user_id = Column(String, ForeignKey("users.id"))
    team_id = Column(String, ForeignKey("teams.id"))
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="api_keys")
    team = relationship("Team", back_populates="api_keys")
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class UsageLog(Base):
    __tablename__ = "usage_logs"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"))
    team_id = Column(String, ForeignKey("teams.id"))
    api_key_id = Column(String, ForeignKey("api_keys.id"))
    
    # Request details
    endpoint = Column(String, nullable=False)
    method = Column(String, nullable=False)
    
    # Usage metrics
    tokens_used = Column(Integer, default=0)
    request_size = Column(Integer)  # bytes
    response_size = Column(Integer)  # bytes
    processing_time = Column(Integer)  # milliseconds
    
    # Analysis details
    analysis_type = Column(String)  # "compliance", "security", etc.
    input_text = Column(Text)
    analysis_result = Column(JSON)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="usage_logs")
    team = relationship("Team", back_populates="usage_logs")
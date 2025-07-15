from sqlalchemy import Column, String, DateTime, Integer, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
import enum


class PlanType(enum.Enum):
    STARTER = "starter"
    GROWTH = "growth"
    BUSINESS = "business"


class Team(Base):
    __tablename__ = "teams"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    plan = Column(Enum(PlanType), default=PlanType.STARTER)
    stripe_customer_id = Column(String, unique=True)
    stripe_subscription_id = Column(String)
    
    # Usage tracking (monthly)
    current_requests = Column(Integer, default=0)
    current_tokens = Column(Integer, default=0)
    usage_reset_date = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="team")
    api_keys = relationship("APIKey", back_populates="team")
    usage_logs = relationship("UsageLog", back_populates="team")
    billing_info = relationship("BillingInfo", back_populates="team", uselist=False)
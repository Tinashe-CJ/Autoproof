from sqlalchemy import Column, String, DateTime, Integer, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base


class BillingInfo(Base):
    __tablename__ = "billing_info"
    
    id = Column(String, primary_key=True)
    team_id = Column(String, ForeignKey("teams.id"), unique=True)
    
    # Stripe details
    stripe_customer_id = Column(String, unique=True)
    stripe_subscription_id = Column(String)
    stripe_payment_method_id = Column(String)
    
    # Billing status
    is_active = Column(Boolean, default=True)
    trial_ends_at = Column(DateTime(timezone=True))
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    
    # Usage overage tracking
    overage_requests = Column(Integer, default=0)
    overage_tokens = Column(Integer, default=0)
    overage_amount = Column(Numeric(10, 2), default=0.00)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="billing_info")
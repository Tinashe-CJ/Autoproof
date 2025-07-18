from sqlalchemy import String, DateTime, Integer, Boolean, ForeignKey, Numeric
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from config.database import Base
from typing import Optional


class BillingInfo(Base):
    __tablename__ = "billing_info"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), unique=True)
    
    # Stripe details
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String, unique=True)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String)
    stripe_payment_method_id: Mapped[Optional[str]] = mapped_column(String)
    
    # Billing status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    trial_ends_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True))
    current_period_start: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True))
    current_period_end: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True))
    
    # Usage overage tracking
    overage_requests: Mapped[int] = mapped_column(Integer, default=0)
    overage_tokens: Mapped[int] = mapped_column(Integer, default=0)
    overage_amount: Mapped[Optional[float]] = mapped_column(Numeric(10, 2), default=0.00)
    
    created_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[DateTime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    team: Mapped["Team"] = relationship("Team", back_populates="billing_info")
from sqlalchemy import String, DateTime, Integer, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from config.database import Base
import enum
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from models.user import User
    from models.api_key import APIKey
    from models.usage_log import UsageLog
    from models.policy_rule import PolicyRule
    from models.violation_log import ViolationLog
    from models.billing import BillingInfo


class PlanType(enum.Enum):
    STARTER = "starter"
    GROWTH = "growth"
    BUSINESS = "business"


class Team(Base):
    __tablename__ = "teams"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    plan: Mapped[PlanType] = mapped_column(Enum(PlanType), default=PlanType.STARTER)
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String, unique=True)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String)
    
    # Usage tracking (monthly)
    current_requests: Mapped[int] = mapped_column(Integer, default=0)
    current_tokens: Mapped[int] = mapped_column(Integer, default=0)
    usage_reset_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users: Mapped[List['User']] = relationship("User", back_populates="team")
    api_keys: Mapped[List['APIKey']] = relationship("APIKey", back_populates="team")
    usage_logs: Mapped[List['UsageLog']] = relationship("UsageLog", back_populates="team")
    policy_rules: Mapped[List['PolicyRule']] = relationship("PolicyRule", back_populates="team")
    violation_logs: Mapped[List['ViolationLog']] = relationship("ViolationLog", back_populates="team")
    billing_info: Mapped[Optional['BillingInfo']] = relationship("BillingInfo", back_populates="team", uselist=False)
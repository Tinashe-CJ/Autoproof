from sqlalchemy import String, DateTime, Boolean, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from config.database import Base
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
import enum

if TYPE_CHECKING:
    from models.team import Team
    from models.violation_log import ViolationLog


class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RuleType(str, enum.Enum):
    CUSTOM = "custom"
    GDPR = "gdpr"
    SOC2 = "soc2"
    HIPAA = "hipaa"
    SLACK = "slack"
    GITHUB = "github"


class PolicyRule(Base):
    __tablename__ = "policy_rules"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    keywords: Mapped[Optional[List[str]]] = mapped_column(JSON)  # Array of keywords
    conditions: Mapped[Optional[dict]] = mapped_column(JSON)  # JSONB conditions
    severity: Mapped[SeverityLevel] = mapped_column(Enum(SeverityLevel))
    rule_type: Mapped[RuleType] = mapped_column(Enum(RuleType), default=RuleType.CUSTOM)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    team: Mapped["Team"] = relationship("Team", back_populates="policy_rules")
    violation_logs: Mapped[List["ViolationLog"]] = relationship("ViolationLog", back_populates="policy_rule") 
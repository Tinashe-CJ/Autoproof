from sqlalchemy import String, DateTime, Boolean, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.sql import func
from config.database import Base
from typing import Optional, TYPE_CHECKING
from datetime import datetime
import enum

if TYPE_CHECKING:
    from models.team import Team
    from models.user import User
    from models.policy_rule import PolicyRule


class ViolationSource(str, enum.Enum):
    SLACK = "slack"
    GITHUB = "github"
    API = "api"
    MANUAL = "manual"


class ViolationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"


class SeverityLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ViolationType(str, enum.Enum):
    POLICY_VIOLATION = "policy_violation"
    SECURITY_BREACH = "security_breach"
    COMPLIANCE_ISSUE = "compliance_issue"
    DATA_LEAK = "data_leak"


class ViolationLog(Base):
    __tablename__ = "violation_logs"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    team_id: Mapped[str] = mapped_column(String, ForeignKey("teams.id"), nullable=False)
    policy_rule_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("policy_rules.id"), nullable=True)
    source: Mapped[ViolationSource] = mapped_column(Enum(ViolationSource), nullable=False)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    severity: Mapped[SeverityLevel] = mapped_column(Enum(SeverityLevel), nullable=False)
    status: Mapped[ViolationStatus] = mapped_column(Enum(ViolationStatus), default=ViolationStatus.PENDING)
    violation_type: Mapped[ViolationType] = mapped_column(Enum(ViolationType), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_reference: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    violation_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_by: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    assigned_to: Mapped[Optional[str]] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    resolution_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    team: Mapped["Team"] = relationship("Team", back_populates="violation_logs")
    policy_rule: Mapped[Optional["PolicyRule"]] = relationship("PolicyRule", back_populates="violation_logs")
    creator: Mapped[Optional["User"]] = relationship("User", foreign_keys=[created_by])
    assignee: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_to])

    def __repr__(self):
        return f"<ViolationLog(id={self.id}, team_id={self.team_id}, source={self.source}, severity={self.severity})>" 
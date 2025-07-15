from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


class ComplianceStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"


class ViolationType(str, Enum):
    POLICY = "policy"
    SECURITY = "security"
    DATA_PRIVACY = "data_privacy"
    COMMUNICATION = "communication"
    CODE_QUALITY = "code_quality"


class ComplianceViolationBase(BaseModel):
    title: str
    description: str
    violation_type: ViolationType
    severity: str  # "low", "medium", "high", "critical"
    source_platform: str  # "slack", "github", "manual"
    source_reference: Optional[str] = None  # URL or reference to source
    metadata: Optional[Dict[str, Any]] = None


class ComplianceViolationCreate(ComplianceViolationBase):
    pass


class ComplianceViolationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ComplianceStatus] = None
    severity: Optional[str] = None
    resolution_notes: Optional[str] = None


class ComplianceViolation(ComplianceViolationBase):
    id: str
    status: ComplianceStatus
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: str  # user_id
    assigned_to: Optional[str] = None  # user_id
    resolution_notes: Optional[str] = None


class ComplianceReport(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    violations: List[ComplianceViolation]
    compliance_score: float
    created_at: datetime
    created_by: str
    period_start: datetime
    period_end: datetime


class ComplianceMetrics(BaseModel):
    total_violations: int
    violations_by_severity: Dict[str, int]
    violations_by_type: Dict[str, int]
    compliance_score: float
    resolved_violations: int
    pending_violations: int
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from fastapi import status as http_status
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
import hashlib
import json
import re

from backend.app.core.supabase import get_supabase
from backend.app.core.auth import (
    get_current_user_with_role,
    require_read,
    log_auth_event
)

router = APIRouter()

class AnalysisSource(str, Enum):
    SLACK = "slack"
    GITHUB = "github"
    API = "api"
    MANUAL = "manual"

class ViolationSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ViolationStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"

class ViolationType(str, Enum):
    POLICY_VIOLATION = "policy_violation"
    SECURITY_BREACH = "security_breach"
    COMPLIANCE_ISSUE = "compliance_issue"
    DATA_LEAK = "data_leak"

class AnalysisRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=50000)
    source: AnalysisSource
    source_reference: Optional[str] = None  # URL or reference to source
    metadata: Optional[Dict[str, Any]] = None

class DetectedViolation(BaseModel):
    policy_rule_id: Optional[str] = None
    policy_rule_name: str
    violation_type: ViolationType
    severity: ViolationSeverity
    title: str
    description: str
    matched_content: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    line_number: Optional[int] = None
    character_range: Optional[Dict[str, int]] = None

class AnalysisResponse(BaseModel):
    violations: List[DetectedViolation]
    total_violations: int
    analysis_summary: Dict[str, Any]
    processing_time_ms: int

class ViolationResponse(BaseModel):
    id: str
    team_id: str
    policy_rule_id: Optional[str]
    source: str
    content_hash: str
    severity: str
    status: str
    violation_type: str
    title: str
    description: str
    source_reference: Optional[str]
    violation_metadata: Optional[Dict[str, Any]]
    created_by: Optional[str]
    assigned_to: Optional[str]
    resolution_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

class PaginatedViolationResponse(BaseModel):
    items: List[ViolationResponse]
    total: int
    page: int
    size: int
    pages: int

@router.post("/", response_model=AnalysisResponse)
async def analyze_content(
    request: Request,
    analysis_request: AnalysisRequest,
    current_user: dict = Depends(require_read),
    supabase = Depends(get_supabase)
):
    """
    Analyze content against policy rules and detect violations
    """
    import time
    start_time = time.time()
    
    try:
        # Get active policy rules for the team
        policy_rules_result = supabase.table("policy_rules").select("*").eq("team_id", current_user["team_id"]).eq("is_active", True).execute()
        
        if not policy_rules_result.data:
            return AnalysisResponse(
                violations=[],
                total_violations=0,
                analysis_summary={"message": "No active policy rules found"},
                processing_time_ms=int((time.time() - start_time) * 1000)
            )

        violations = []
        content_lower = analysis_request.content.lower()
        lines = analysis_request.content.split('\n')
        
        # Analyze content against each policy rule
        for rule in policy_rules_result.data:
            rule_violations = analyze_rule_against_content(rule, content_lower, lines, analysis_request)
            violations.extend(rule_violations)

        # Create violation records in database
        created_violations = []
        for violation in violations:
            violation_data = {
                "id": f"violation_{datetime.now().timestamp()}_{len(created_violations)}",
                "team_id": current_user["team_id"],
                "policy_rule_id": violation.policy_rule_id,
                "source": analysis_request.source.value,
                "content_hash": hashlib.sha256(analysis_request.content.encode()).hexdigest(),
                "severity": violation.severity.value,
                "status": ViolationStatus.PENDING.value,
                "violation_type": violation.violation_type.value,
                "title": violation.title,
                "description": violation.description,
                "source_reference": analysis_request.source_reference,
                "violation_metadata": {
                    "matched_content": violation.matched_content,
                    "confidence_score": violation.confidence_score,
                    "line_number": violation.line_number,
                    "character_range": violation.character_range,
                    "analysis_metadata": analysis_request.metadata
                },
                "created_by": current_user["id"],
                "created_at": datetime.now().isoformat()
            }
            
            # Insert violation into database
            result = supabase.table("violation_logs").insert(violation_data).execute()
            if result.data:
                created_violations.append(result.data[0])

        # Log analysis event
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "content_analyzed",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {
                "source": analysis_request.source.value,
                "content_length": len(analysis_request.content),
                "violations_detected": len(violations),
                "policy_rules_checked": len(policy_rules_result.data)
            }
        )

        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return AnalysisResponse(
            violations=violations,
            total_violations=len(violations),
            analysis_summary={
                "source": analysis_request.source.value,
                "content_length": len(analysis_request.content),
                "policy_rules_checked": len(policy_rules_result.data),
                "violations_by_severity": count_violations_by_severity(violations)
            },
            processing_time_ms=processing_time_ms
        )

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze content: {str(e)}"
        )

def analyze_rule_against_content(rule: Dict[str, Any], content_lower: str, lines: List[str], analysis_request: AnalysisRequest) -> List[DetectedViolation]:
    """Analyze a single policy rule against content"""
    violations = []
    
    # Check keywords
    keywords = rule.get("keywords", [])
    for keyword in keywords:
        if keyword.lower() in content_lower:
            # Find the line where keyword appears
            line_number = None
            matched_content = keyword
            character_range = None
            
            for i, line in enumerate(lines):
                if keyword.lower() in line.lower():
                    line_number = i + 1
                    start_pos = line.lower().find(keyword.lower())
                    end_pos = start_pos + len(keyword)
                    character_range = {"start": start_pos, "end": end_pos}
                    matched_content = line.strip()
                    break
            
            # Calculate confidence score based on keyword match
            confidence_score = calculate_confidence_score(keyword, content_lower, rule)
            
            if confidence_score > 0.3:  # Minimum confidence threshold
                violations.append(DetectedViolation(
                    policy_rule_id=rule["id"],
                    policy_rule_name=rule["name"],
                    violation_type=ViolationType.POLICY_VIOLATION,
                    severity=ViolationSeverity(rule["severity"]),
                    title=f"Policy violation: {rule['name']}",
                    description=f"Keyword '{keyword}' found in content, violating policy rule '{rule['name']}'",
                    matched_content=matched_content,
                    confidence_score=confidence_score,
                    line_number=line_number,
                    character_range=character_range
                ))
    
    # Check conditions (if any)
    conditions = rule.get("conditions", [])
    for condition in conditions:
        if isinstance(condition, dict):
            field = condition.get("field", "")
            operator = condition.get("operator", "")
            value = condition.get("value", "")
            case_sensitive = condition.get("case_sensitive", False)
            
            if check_condition(content_lower, field, operator, value, case_sensitive):
                violations.append(DetectedViolation(
                    policy_rule_id=rule["id"],
                    policy_rule_name=rule["name"],
                    violation_type=ViolationType.POLICY_VIOLATION,
                    severity=ViolationSeverity(rule["severity"]),
                    title=f"Condition violation: {rule['name']}",
                    description=f"Content matches condition '{field} {operator} {value}' for policy rule '{rule['name']}'",
                    matched_content=content_lower[:200] + "..." if len(content_lower) > 200 else content_lower,
                    confidence_score=0.8,  # High confidence for condition matches
                    line_number=None,
                    character_range=None
                ))
    
    return violations

def calculate_confidence_score(keyword: str, content: str, rule: Dict[str, Any]) -> float:
    """Calculate confidence score for a keyword match"""
    # Simple confidence calculation based on keyword frequency and context
    keyword_count = content.count(keyword.lower())
    content_length = len(content)
    
    # Base confidence from frequency
    frequency_score = min(keyword_count / 10.0, 1.0)  # Normalize to 0-1
    
    # Context score based on rule severity
    severity_multiplier = {
        "low": 0.5,
        "medium": 0.7,
        "high": 0.9,
        "critical": 1.0
    }.get(rule.get("severity", "medium"), 0.7)
    
    # Final confidence score
    confidence = frequency_score * severity_multiplier
    
    return min(confidence, 1.0)

def check_condition(content: str, field: str, operator: str, value: str, case_sensitive: bool) -> bool:
    """Check if content matches a condition"""
    if not case_sensitive:
        content = content.lower()
        value = value.lower()
    
    if operator == "contains":
        return value in content
    elif operator == "equals":
        return content == value
    elif operator == "regex":
        try:
            return bool(re.search(value, content))
        except re.error:
            return False
    elif operator == "not_contains":
        return value not in content
    
    return False

def count_violations_by_severity(violations: List[DetectedViolation]) -> Dict[str, int]:
    """Count violations by severity"""
    counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for violation in violations:
        counts[violation.severity.value] += 1
    return counts

@router.get("/violations", response_model=PaginatedViolationResponse)
async def get_violations(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    status: Optional[ViolationStatus] = Query(None, description="Filter by status"),
    severity: Optional[ViolationSeverity] = Query(None, description="Filter by severity"),
    violation_type: Optional[ViolationType] = Query(None, description="Filter by violation type"),
    source: Optional[AnalysisSource] = Query(None, description="Filter by source"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$", description="Sort order"),
    current_user: dict = Depends(require_read),
    supabase = Depends(get_supabase)
):
    """
    Get violations with pagination, filtering, and sorting
    """
    try:
        # Build query
        query = supabase.table("violation_logs").select("*").eq("team_id", current_user["team_id"])

        # Apply filters
        if status:
            query = query.eq("status", status.value)
        
        if severity:
            query = query.eq("severity", severity.value)
        
        if violation_type:
            query = query.eq("violation_type", violation_type.value)
        
        if source:
            query = query.eq("source", source.value)
        
        if search:
            query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")

        # Get total count
        count_result = query.execute()
        total = len(count_result.data)

        # Apply sorting
        if sort_order == "desc":
            query = query.order(sort_by, desc=True)
        else:
            query = query.order(sort_by, desc=False)

        # Apply pagination
        offset = (page - 1) * size
        query = query.range(offset, offset + size - 1)

        # Execute query
        result = query.execute()

        # Convert to response models
        items = []
        for violation_data in result.data:
            items.append(ViolationResponse(
                id=violation_data["id"],
                team_id=violation_data["team_id"],
                policy_rule_id=violation_data.get("policy_rule_id"),
                source=violation_data["source"],
                content_hash=violation_data["content_hash"],
                severity=violation_data["severity"],
                status=violation_data["status"],
                violation_type=violation_data["violation_type"],
                title=violation_data["title"],
                description=violation_data["description"],
                source_reference=violation_data.get("source_reference"),
                violation_metadata=violation_data.get("violation_metadata"),
                created_by=violation_data.get("created_by"),
                assigned_to=violation_data.get("assigned_to"),
                resolution_notes=violation_data.get("resolution_notes"),
                created_at=datetime.fromisoformat(violation_data["created_at"]),
                updated_at=datetime.fromisoformat(violation_data["updated_at"]) if violation_data.get("updated_at") else None
            ))

        # Calculate pagination info
        pages = (total + size - 1) // size

        return PaginatedViolationResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve violations: {str(e)}"
        )

@router.get("/violations/{violation_id}", response_model=ViolationResponse)
async def get_violation(
    request: Request,
    violation_id: str,
    current_user: dict = Depends(require_read),
    supabase = Depends(get_supabase)
):
    """
    Get a specific violation by ID
    """
    try:
        result = supabase.table("violation_logs").select("*").eq("id", violation_id).eq("team_id", current_user["team_id"]).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Violation not found"
            )

        violation_data = result.data[0]

        return ViolationResponse(
            id=violation_data["id"],
            team_id=violation_data["team_id"],
            policy_rule_id=violation_data.get("policy_rule_id"),
            source=violation_data["source"],
            content_hash=violation_data["content_hash"],
            severity=violation_data["severity"],
            status=violation_data["status"],
            violation_type=violation_data["violation_type"],
            title=violation_data["title"],
            description=violation_data["description"],
            source_reference=violation_data.get("source_reference"),
            violation_metadata=violation_data.get("violation_metadata"),
            created_by=violation_data.get("created_by"),
            assigned_to=violation_data.get("assigned_to"),
            resolution_notes=violation_data.get("resolution_notes"),
            created_at=datetime.fromisoformat(violation_data["created_at"]),
            updated_at=datetime.fromisoformat(violation_data["updated_at"]) if violation_data.get("updated_at") else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve violation: {str(e)}"
        )

@router.put("/violations/{violation_id}")
async def update_violation(
    request: Request,
    violation_id: str,
    status: ViolationStatus,
    resolution_notes: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: dict = Depends(require_read),
    supabase = Depends(get_supabase)
):
    """
    Update violation status and resolution notes
    """
    try:
        # Check if violation exists and belongs to team
        existing = supabase.table("violation_logs").select("*").eq("id", violation_id).eq("team_id", current_user["team_id"]).execute()

        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Violation not found"
            )

        # Build update data
        update_data = {
            "status": status.value,
            "updated_at": datetime.now().isoformat()
        }
        
        if resolution_notes is not None:
            update_data["resolution_notes"] = resolution_notes
        
        if assigned_to is not None:
            update_data["assigned_to"] = assigned_to

        # Update violation
        result = supabase.table("violation_logs").update(update_data).eq("id", violation_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update violation"
            )

        # Log violation update
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "violation_updated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {
                "violation_id": violation_id,
                "new_status": status.value,
                "updated_by": current_user["id"]
            }
        )

        return {"message": "Violation updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update violation: {str(e)}"
        ) 
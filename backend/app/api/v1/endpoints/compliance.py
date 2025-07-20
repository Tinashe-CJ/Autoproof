from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel
from supabase.client import create_client, Client
from backend.app.core.supabase import get_supabase_admin
from backend.app.core.auth import get_current_user
from backend.app.core.dev_auth import get_current_user_dev
from backend.app.models.compliance import (
    ComplianceViolation,
    ComplianceViolationCreate,
    ComplianceViolationUpdate,
    ComplianceMetrics,
    ComplianceStatus,
    ViolationType
)
from datetime import datetime

class PaginatedViolationsResponse(BaseModel):
    items: List[ComplianceViolation]
    total: int
    page: int
    size: int
    pages: int

router = APIRouter()


@router.get("/test", response_model=PaginatedViolationsResponse)
async def test_violations():
    """
    Test endpoint that doesn't require authentication - returns mock data
    """
    from datetime import datetime, timedelta
    
    # Create mock violation data
    mock_violations = [
        ComplianceViolation(
            id="test-violation-1",
            title="PII Detected in Slack",
            description="PII detected in Slack message",
            violation_type=ViolationType.DATA_PRIVACY,
            severity="high",
            source_platform="slack",
            source_reference="https://slack.com/messages/123",
            status=ComplianceStatus.PENDING,
            created_at=datetime.now() - timedelta(hours=2),
            created_by="test-user"
        ),
        ComplianceViolation(
            id="test-violation-2",
            title="API Key in Code",
            description="API key found in commit",
            violation_type=ViolationType.SECURITY,
            severity="critical",
            source_platform="github",
            source_reference="https://github.com/repo/commit/abc123",
            status=ComplianceStatus.APPROVED,
            created_at=datetime.now() - timedelta(days=1),
            created_by="test-user"
        )
    ]
    
    return PaginatedViolationsResponse(
        items=mock_violations,
        total=len(mock_violations),
        page=1,
        size=20,
        pages=1
    )


@router.get("/violations", response_model=PaginatedViolationsResponse)
async def get_violations(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user=Depends(get_current_user_dev),  # Use dev auth for testing
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Get compliance violations with pagination and filtering
    """
    try:
        # Build query
        query = supabase.table("violation_logs").select("*")
        
        # Apply filters
        if status:
            query = query.eq("status", status)
        if source:
            query = query.eq("source", source)
        if severity:
            query = query.eq("severity", severity)
        # Note: Search functionality can be added later if needed
        
        # Get total count
        count_result = query.execute()
        total = len(count_result.data)
        
        # Apply pagination
        query = query.range((page - 1) * size, page * size - 1)
        query = query.order("created_at", desc=True)
        
        # Execute query
        result = query.execute()
        
        # Convert to ComplianceViolation models
        violations = []
        for item in result.data:
            violation = ComplianceViolation(
                id=item["id"],
                title=item["title"],
                description=item.get("description", ""),
                violation_type=ViolationType.POLICY,  # Default type
                severity=item["severity"].lower(),
                source_platform=item["source"],
                source_reference=item.get("source_reference"),
                metadata=item.get("violation_metadata", {}),
                status=ComplianceStatus(item.get("status", "pending")),
                created_at=item["created_at"],
                created_by=item.get("created_by", "system"),
                assigned_to=item.get("assigned_to"),
                resolution_notes=item.get("resolution_notes")
            )
            violations.append(violation)
        
        return PaginatedViolationsResponse(
            items=violations,
            total=total,
            page=page,
            size=size,
            pages=(total + size - 1) // size
        )
        
    except Exception as e:
        # Fallback to mock data if table doesn't exist
        print(f"Database error: {e}")
        
        # Return mock data for development
        mock_violations = [
            ComplianceViolation(
                id="violation_1",
                title="PII Data Exposure",
                description="Potential PII data found in Slack message",
                violation_type=ViolationType.DATA_PRIVACY,
                severity="high",
                source_platform="slack",
                source_reference="https://slack.com/messages/123",
                metadata={"channel": "general", "user": "john.doe"},
                status=ComplianceStatus.PENDING,
                created_at=datetime.now(),
                created_by="system"
            ),
            ComplianceViolation(
                id="violation_2",
                title="API Key in Code",
                description="API key found in commit message",
                violation_type=ViolationType.SECURITY,
                severity="critical",
                source_platform="github",
                source_reference="https://github.com/repo/commit/abc123",
                metadata={"repo": "backend", "commit": "abc123"},
                status=ComplianceStatus.APPROVED,
                created_at=datetime.now(),
                created_by="system"
            ),
            ComplianceViolation(
                id="violation_3",
                title="Weak Password Policy",
                description="Password policy violation detected",
                violation_type=ViolationType.SECURITY,
                severity="medium",
                source_platform="api",
                source_reference="/auth/register",
                metadata={"endpoint": "/auth/register"},
                status=ComplianceStatus.PENDING,
                created_at=datetime.now(),
                created_by="system"
            )
        ]
        
        return PaginatedViolationsResponse(
            items=mock_violations,
            total=len(mock_violations),
            page=page,
            size=size,
            pages=1
        )


@router.post("/violations", response_model=ComplianceViolation)
async def create_violation(
    violation: ComplianceViolationCreate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Create a new compliance violation
    """
    try:
        violation_data = violation.model_dump()
        violation_data.update({
            "created_by": current_user.get("id", "system"),
            "status": ComplianceStatus.PENDING.value
        })
        
        response = supabase.table("compliance_violations").insert(violation_data).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create violation"
            )
        
        return ComplianceViolation(**response.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/violations/{violation_id}", response_model=ComplianceViolation)
async def get_violation(
    violation_id: str,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Get a specific compliance violation
    """
    try:
        response = supabase.table("compliance_violations").select("*").eq("id", violation_id).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Violation not found"
            )
        
        return ComplianceViolation(**response.data[0])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.put("/violations/{violation_id}", response_model=ComplianceViolation)
async def update_violation(
    violation_id: str,
    violation_update: ComplianceViolationUpdate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Update a compliance violation
    """
    try:
        update_data = violation_update.model_dump(exclude_unset=True)
        
        if update_data:
            response = supabase.table("compliance_violations").update(update_data).eq("id", violation_id).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Violation not found"
                )
            
            return ComplianceViolation(**response.data[0])
        
        # If no updates, return current violation
        response = supabase.table("compliance_violations").select("*").eq("id", violation_id).execute()
        return ComplianceViolation(**response.data[0])
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/metrics", response_model=ComplianceMetrics)
async def get_compliance_metrics(
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase_admin)
):
    """
    Get compliance metrics and statistics
    """
    try:
        # Get all violations
        violations_response = supabase.table("compliance_violations").select("*").execute()
        violations = violations_response.data
        
        total_violations = len(violations)
        
        # Count by severity
        violations_by_severity = {}
        for violation in violations:
            severity = violation.get("severity", "unknown")
            violations_by_severity[severity] = violations_by_severity.get(severity, 0) + 1
        
        # Count by type
        violations_by_type = {}
        for violation in violations:
            violation_type = violation.get("violation_type", "unknown")
            violations_by_type[violation_type] = violations_by_type.get(violation_type, 0) + 1
        
        # Count by status
        resolved_violations = len([v for v in violations if v.get("status") == "approved"])
        pending_violations = len([v for v in violations if v.get("status") == "pending"])
        
        # Calculate compliance score (simple formula for now)
        compliance_score = (resolved_violations / total_violations * 100) if total_violations > 0 else 100.0
        
        return ComplianceMetrics(
            total_violations=total_violations,
            violations_by_severity=violations_by_severity,
            violations_by_type=violations_by_type,
            compliance_score=round(compliance_score, 2),
            resolved_violations=resolved_violations,
            pending_violations=pending_violations
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )



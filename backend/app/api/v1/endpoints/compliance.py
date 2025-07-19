from typing import List, Optional
from fastapi import APIRouter, HTTPException, status, Depends, Query
from supabase.client import create_client, Client
from backend.app.core.supabase import get_supabase
from backend.app.core.auth import get_current_user
from backend.app.models.compliance import (
    ComplianceViolation,
    ComplianceViolationCreate,
    ComplianceViolationUpdate,
    ComplianceMetrics,
    ComplianceStatus,
    ViolationType
)

router = APIRouter()


@router.get("/violations", response_model=List[ComplianceViolation])
async def get_violations(
    status: Optional[ComplianceStatus] = Query(None),
    violation_type: Optional[ViolationType] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Get compliance violations with optional filtering
    """
    try:
        query = supabase.table("compliance_violations").select("*")
        
        if status:
            query = query.eq("status", status.value)
        if violation_type:
            query = query.eq("violation_type", violation_type.value)
        if severity:
            query = query.eq("severity", severity)
        
        response = query.range(offset, offset + limit - 1).order("created_at", desc=True).execute()
        
        return [ComplianceViolation(**violation) for violation in response.data]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/violations", response_model=ComplianceViolation)
async def create_violation(
    violation: ComplianceViolationCreate,
    current_user=Depends(get_current_user),
    supabase: Client = Depends(get_supabase)
):
    """
    Create a new compliance violation
    """
    try:
        violation_data = violation.model_dump()
        violation_data.update({
            "created_by": current_user.id,
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
    supabase: Client = Depends(get_supabase)
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
    supabase: Client = Depends(get_supabase)
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
    supabase: Client = Depends(get_supabase)
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
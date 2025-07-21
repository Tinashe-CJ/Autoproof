from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Query, Request, File, UploadFile, Form
from fastapi import status as http_status
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
import hashlib
import json
import re
import time
import logging
import uuid
from pathlib import Path

from backend.app.core.supabase import get_supabase
from backend.app.core.auth import (
    get_current_user_with_role,
    require_read,
    log_auth_event
)
from backend.app.core.dev_auth import get_current_user_dev
from backend.app.services.openai_service import (
    analyze_text,
    log_analysis_event,
    OpenAIError,
    RateLimitError,
    TokenLimitError
)
from backend.app.services.policy_parser import PolicyParser

router = APIRouter()
logger = logging.getLogger(__name__)

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
    current_user: dict = Depends(get_current_user_dev),
    supabase = Depends(get_supabase)
):
    """
    Analyze content against policy rules and detect violations using OpenAI
    """
    start_time = time.time()
    
    try:
        # Use OpenAI for analysis
        openai_violations, token_usage = await analyze_text(
            analysis_request.content,
            analysis_request.source.value,
            "compliance",
            use_cache=True
        )
        
        # Convert OpenAI violations to DetectedViolation format
        violations = []
        for openai_violation in openai_violations:
            # Map OpenAI violation to DetectedViolation
            severity_map = {
                "low": ViolationSeverity.LOW,
                "medium": ViolationSeverity.MEDIUM,
                "high": ViolationSeverity.HIGH,
                "critical": ViolationSeverity.CRITICAL
            }
            
            violation = DetectedViolation(
                policy_rule_id=None,  # OpenAI doesn't provide rule IDs
                policy_rule_name=openai_violation.get("type", "AI Detected"),
                violation_type=ViolationType.COMPLIANCE_ISSUE,
                severity=severity_map.get(openai_violation.get("severity", "medium").lower(), ViolationSeverity.MEDIUM),
                title=f"AI Detected: {openai_violation.get('type', 'Compliance Issue')}",
                description=openai_violation.get("issue", ""),
                matched_content=analysis_request.content[:200] + "..." if len(analysis_request.content) > 200 else analysis_request.content,
                confidence_score=0.8,  # Default confidence for AI detection
                line_number=None,
                character_range=None
            )
            violations.append(violation)

        # Debug: Print current_user structure
        print(f"Debug: current_user keys: {list(current_user.keys())}")
        print(f"Debug: current_user team_id: {current_user.get('team_id')}")
        
        # Create violation records in database
        created_violations = []
        for violation in violations:
            violation_data = {
                "id": str(uuid.uuid4()),
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
                    "analysis_metadata": analysis_request.metadata,
                    "ai_analysis": True,
                    "token_usage": token_usage
                },
                "created_by": current_user["id"],
                "created_at": datetime.now().isoformat()
            }
            
            # Insert violation into database
            try:
                result = supabase.table("violation_logs").insert(violation_data).execute()
                if result.data:
                    created_violations.append(result.data[0])
            except Exception as e:
                # Log the error but don't fail the analysis
                print(f"Warning: Failed to log violation to database: {e}")
                # Continue with analysis even if logging fails

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
                "ai_analysis": True,
                "token_usage": token_usage
            }
        )

        # Log OpenAI analysis event
        processing_time_ms = int((time.time() - start_time) * 1000)
        log_analysis_event(
            source=analysis_request.source.value,
            text_length=len(analysis_request.content),
            violations_count=len(violations),
            token_usage=token_usage,
            model_used="gpt-4o-mini",
            processing_time_ms=processing_time_ms
        )
        
        return AnalysisResponse(
            violations=violations,
            total_violations=len(violations),
            analysis_summary={
                "source": analysis_request.source.value,
                "content_length": len(analysis_request.content),
                "ai_analysis": True,
                "token_usage": token_usage,
                "violations_by_severity": count_violations_by_severity(violations)
            },
            processing_time_ms=processing_time_ms
        )

    except RateLimitError as e:
        raise HTTPException(
            status_code=http_status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {str(e)}"
        )
    except TokenLimitError as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Content too long for analysis: {str(e)}"
        )
    except OpenAIError as e:
        raise HTTPException(
            status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI analysis service unavailable: {str(e)}"
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
    current_user: dict = Depends(get_current_user_dev),
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
    current_user: dict = Depends(get_current_user_dev),
    supabase = Depends(get_supabase)
):
    """
    Get a specific violation by ID
    """
    try:
        result = supabase.table("violation_logs").select("*").eq("id", violation_id).eq("team_id", current_user["team_id"]).execute()

        if not result.data:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
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
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve violation: {str(e)}"
        )

@router.put("/violations/{violation_id}")
async def update_violation(
    request: Request,
    violation_id: str,
    status: ViolationStatus,
    resolution_notes: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: dict = Depends(get_current_user_dev),
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
                status_code=http_status.HTTP_404_NOT_FOUND,
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
                status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
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
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update violation: {str(e)}"
        )

# Policy Document Parsing Models
class PolicyDocumentRequest(BaseModel):
    document_text: str = Field(..., min_length=1, max_length=50000)
    document_name: Optional[str] = None
    document_type: Optional[str] = None

class PolicyRule(BaseModel):
    name: str
    description: str
    keywords: List[str] = []
    severity: str = "medium"
    conditions: List[Dict[str, Any]] = []

class PolicyDocumentResponse(BaseModel):
    rules: List[PolicyRule]
    metadata: Dict[str, Any]
    confidence: float
    token_usage: int
    processing_time_ms: int

@router.post("/parse-policy", response_model=PolicyDocumentResponse)
async def parse_policy_document_endpoint(
    request: Request,
    policy_request: PolicyDocumentRequest,
    current_user: dict = Depends(get_current_user_dev),
    supabase = Depends(get_supabase)
):
    """
    Parse a policy document to extract structured rules using OpenAI
    """
    start_time = time.time()
    
    try:
        # Use OpenAI for policy document parsing
        from backend.app.services.openai_service import parse_policy_document
        
        result = await parse_policy_document(policy_request.document_text)
        
        # Convert parsed rules to PolicyRule format
        rules = []
        for rule_data in result.get("rules", []):
            rule = PolicyRule(
                name=rule_data.get("name", "Unnamed Rule"),
                description=rule_data.get("description", ""),
                keywords=rule_data.get("keywords", []),
                severity=rule_data.get("severity", "medium"),
                conditions=rule_data.get("conditions", [])
            )
            rules.append(rule)
        
        # Log policy parsing event
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "policy_document_parsed",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {
                "document_name": policy_request.document_name,
                "document_type": policy_request.document_type,
                "document_length": len(policy_request.document_text),
                "rules_extracted": len(rules),
                "confidence": result.get("confidence", 0.0),
                "token_usage": result.get("token_usage", 0)
            }
        )
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return PolicyDocumentResponse(
            rules=rules,
            metadata={
                "document_name": policy_request.document_name,
                "document_type": policy_request.document_type,
                "document_length": len(policy_request.document_text),
                "parsing_confidence": result.get("confidence", 0.0)
            },
            confidence=result.get("confidence", 0.0),
            token_usage=result.get("token_usage", 0),
            processing_time_ms=processing_time_ms
        )
        
    except RateLimitError as e:
        raise HTTPException(
            status_code=http_status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {str(e)}"
        )
    except TokenLimitError as e:
        raise HTTPException(
            status_code=http_status.HTTP_400_BAD_REQUEST,
            detail=f"Document too long for parsing: {str(e)}"
        )
    except OpenAIError as e:
        raise HTTPException(
            status_code=http_status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI parsing service unavailable: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse policy document: {str(e)}"
        )

# Document Upload and Parsing Models
class DocumentUploadRequest(BaseModel):
    document_name: Optional[str] = None
    document_type: Optional[str] = None
    compliance_framework: Optional[str] = "general"

class DocumentUploadResponse(BaseModel):
    success: bool
    document_info: Optional[Dict[str, Any]] = None
    text_analysis: Optional[Dict[str, Any]] = None
    extracted_rules: Optional[List[Dict[str, Any]]] = None
    compliance_analysis: Optional[Dict[str, Any]] = None
    processing_metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    stage: Optional[str] = None

@router.post("/upload-document", response_model=DocumentUploadResponse)
async def upload_and_parse_document(
    request: Request,
    file: UploadFile = File(...),
    document_name: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    compliance_framework: Optional[str] = Form("general"),
    current_user: dict = Depends(get_current_user_dev),
    supabase = Depends(get_supabase)
):
    """
    Upload and parse a policy document file (PDF, DOCX, TXT)
    """
    start_time = time.time()
    
    try:
        # Validate file
        if not file or not file.filename:
            return DocumentUploadResponse(
                success=False,
                error="No file provided",
                stage="validation"
            )
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > 10 * 1024 * 1024:  # 10MB limit
            return DocumentUploadResponse(
                success=False,
                error="File size exceeds 10MB limit",
                stage="validation"
            )
        
        # Check file type
        allowed_types = ['.pdf', '.docx', '.txt', '.md', '.json']
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in allowed_types:
            return DocumentUploadResponse(
                success=False,
                error=f"Unsupported file type: {file_ext}. Supported types: {allowed_types}",
                stage="validation"
            )
        
        logger.info(f"Processing file: {file.filename}, size: {len(file_content)} bytes, type: {file_ext}")
        
        # Initialize policy parser
        policy_parser = PolicyParser()
        
        # Ensure filename is not None
        filename = file.filename or "unknown_file"
        
        # Parse document
        result = await policy_parser.parse_policy_document_file(
            file_content,
            filename,
            document_name,
            document_type
        )
        
        # If parsing failed, return error
        if not result['success']:
            logger.error(f"Document parsing failed: {result['error']}")
            return DocumentUploadResponse(
                success=False,
                error=result['error'],
                stage=result.get('stage', 'unknown')
            )
        
        # If compliance framework is specified, perform compliance analysis
        if compliance_framework and compliance_framework != "general":
            compliance_result = await policy_parser.analyze_document_compliance(
                file_content,
                filename,
                compliance_framework
            )
            
            if compliance_result['success']:
                result = compliance_result
        
        # Log document upload and parsing event
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "document_uploaded_and_parsed",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {
                "filename": file.filename,
                "document_name": document_name,
                "document_type": document_type,
                "file_size": len(file_content),
                "compliance_framework": compliance_framework,
                "rules_extracted": len(result.get('extracted_rules', [])),
                "processing_time_ms": int((time.time() - start_time) * 1000)
            }
        )
        
        logger.info(f"Document processing completed successfully: {file.filename}")
        
        return DocumentUploadResponse(
            success=True,
            document_info=result.get('document_info'),
            text_analysis=result.get('text_analysis'),
            extracted_rules=result.get('extracted_rules'),
            compliance_analysis=result.get('compliance_analysis'),
            processing_metadata=result.get('processing_metadata')
        )
        
    except Exception as e:
        logger.error(f"Document upload error: {e}", exc_info=True)
        return DocumentUploadResponse(
            success=False,
            error=str(e),
            stage="upload_processing"
        ) 
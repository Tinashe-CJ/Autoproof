from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, status, Depends, Query, Request
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
import json
import re

from backend.app.core.supabase import get_supabase
from backend.app.core.auth import (
    get_current_user_with_role,
    require_manage_policies,
    require_read,
    log_auth_event
)

router = APIRouter()

class PolicySeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PolicyRuleType(str, Enum):
    CUSTOM = "custom"
    TEMPLATE = "template"
    REGULATORY = "regulatory"

class PolicyCondition(BaseModel):
    field: str
    operator: str  # "contains", "equals", "regex", "not_contains"
    value: Any
    case_sensitive: bool = False

class PolicyRule(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    keywords: List[str] = Field(default_factory=list)
    conditions: List[PolicyCondition] = Field(default_factory=list)
    severity: PolicySeverity = PolicySeverity.MEDIUM
    rule_type: PolicyRuleType = PolicyRuleType.CUSTOM
    is_active: bool = True

    @validator('keywords')
    def validate_keywords(cls, v):
        if len(v) > 50:
            raise ValueError("Maximum 50 keywords allowed")
        return v

    @validator('conditions')
    def validate_conditions(cls, v):
        if len(v) > 20:
            raise ValueError("Maximum 20 conditions allowed")
        return v

class PolicyRuleCreate(PolicyRule):
    pass

class PolicyRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    keywords: Optional[List[str]] = None
    conditions: Optional[List[PolicyCondition]] = None
    severity: Optional[PolicySeverity] = None
    rule_type: Optional[PolicyRuleType] = None
    is_active: Optional[bool] = None

    @validator('keywords')
    def validate_keywords(cls, v):
        if v is not None and len(v) > 50:
            raise ValueError("Maximum 50 keywords allowed")
        return v

    @validator('conditions')
    def validate_conditions(cls, v):
        if v is not None and len(v) > 20:
            raise ValueError("Maximum 20 conditions allowed")
        return v

class PolicyRuleResponse(PolicyRule):
    id: str
    team_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

class PolicyParseRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)
    source_platform: str = Field(..., pattern="^(slack|github|api|manual)$")
    metadata: Optional[Dict[str, Any]] = None

class PolicyParseResponse(BaseModel):
    parsed_rules: List[PolicyRule]
    validation_errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class PaginatedPolicyResponse(BaseModel):
    items: List[PolicyRuleResponse]
    total: int
    page: int
    size: int
    pages: int

@router.post("/parse", response_model=PolicyParseResponse)
async def parse_policies(
    request: Request,
    parse_request: PolicyParseRequest,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Parse policy definitions from text content and validate them
    """
    try:
        parsed_rules = []
        validation_errors = []
        warnings = []

        # Simple policy parsing logic (can be enhanced with AI)
        content = parse_request.content.lower()
        
        # Extract potential policy rules based on patterns
        lines = content.split('\n')
        current_rule = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Look for policy rule indicators
            if any(keyword in line for keyword in ['policy:', 'rule:', 'compliance:', 'security:']):
                if current_rule:
                    parsed_rules.append(current_rule)
                
                # Extract rule name
                rule_name = line.split(':', 1)[1].strip() if ':' in line else line
                current_rule = PolicyRule(
                    name=rule_name,
                    description="",
                    keywords=[],
                    conditions=[],
                    severity=PolicySeverity.MEDIUM
                )
            
            elif current_rule:
                # Extract keywords
                if any(keyword in line for keyword in ['keywords:', 'terms:', 'patterns:']):
                    keywords_text = line.split(':', 1)[1].strip() if ':' in line else line
                    current_rule.keywords = [k.strip() for k in keywords_text.split(',') if k.strip()]
                
                # Extract severity
                elif any(severity in line for severity in ['low', 'medium', 'high', 'critical']):
                    for severity in PolicySeverity:
                        if severity.value in line:
                            current_rule.severity = severity
                            break
                
                # Extract description
                elif line and not any(marker in line for marker in ['keywords:', 'terms:', 'patterns:', 'severity:']):
                    if not current_rule.description:
                        current_rule.description = line
                    else:
                        current_rule.description += " " + line

        # Add the last rule if exists
        if current_rule:
            parsed_rules.append(current_rule)

        # Validate parsed rules
        for i, rule in enumerate(parsed_rules):
            if not rule.name:
                validation_errors.append(f"Rule {i+1}: Missing name")
            
            if len(rule.name) > 255:
                validation_errors.append(f"Rule {i+1}: Name too long (max 255 characters)")
            
            if not rule.description:
                warnings.append(f"Rule {i+1}: No description provided")

        # Log policy parsing event
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "policy_parsed",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {
                "source_platform": parse_request.source_platform,
                "rules_parsed": len(parsed_rules),
                "validation_errors": len(validation_errors),
                "warnings": len(warnings)
            }
        )

        return PolicyParseResponse(
            parsed_rules=parsed_rules,
            validation_errors=validation_errors,
            warnings=warnings
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse policies: {str(e)}"
        )

@router.post("/", response_model=PolicyRuleResponse)
async def create_policy_rule(
    request: Request,
    policy_rule: PolicyRuleCreate,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Create a new policy rule
    """
    try:
        # Check if policy with same name exists
        existing = supabase.table("policy_rules").select("id").eq("name", policy_rule.name).eq("team_id", current_user["team_id"]).execute()
        
        if existing.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Policy rule with this name already exists"
            )

        # Create policy rule
        policy_data = {
            "id": f"rule_{datetime.now().timestamp()}",
            "team_id": current_user["team_id"],
            "name": policy_rule.name,
            "description": policy_rule.description,
            "keywords": policy_rule.keywords,
            "conditions": [condition.dict() for condition in policy_rule.conditions],
            "severity": policy_rule.severity.value,
            "rule_type": policy_rule.rule_type.value,
            "is_active": policy_rule.is_active,
            "created_at": datetime.now().isoformat()
        }

        result = supabase.table("policy_rules").insert(policy_data).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create policy rule"
            )

        created_rule = result.data[0]

        # Log policy creation
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "policy_created",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"policy_id": created_rule["id"], "policy_name": policy_rule.name}
        )

        return PolicyRuleResponse(
            id=created_rule["id"],
            team_id=created_rule["team_id"],
            name=created_rule["name"],
            description=created_rule["description"],
            keywords=created_rule["keywords"],
            conditions=[PolicyCondition(**c) for c in created_rule["conditions"]],
            severity=PolicySeverity(created_rule["severity"]),
            rule_type=PolicyRuleType(created_rule["rule_type"]),
            is_active=created_rule["is_active"],
            created_at=datetime.fromisoformat(created_rule["created_at"]),
            updated_at=datetime.fromisoformat(created_rule["updated_at"]) if created_rule.get("updated_at") else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create policy rule: {str(e)}"
        )

@router.get("/", response_model=PaginatedPolicyResponse)
async def get_policy_rules(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    severity: Optional[PolicySeverity] = Query(None, description="Filter by severity"),
    rule_type: Optional[PolicyRuleType] = Query(None, description="Filter by rule type"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    current_user: dict = Depends(require_read),
    supabase = Depends(get_supabase)
):
    """
    Get policy rules with pagination, filtering, and sorting
    """
    try:
        # Build query
        query = supabase.table("policy_rules").select("*").eq("team_id", current_user["team_id"])

        # Apply filters
        if search:
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")
        
        if severity:
            query = query.eq("severity", severity.value)
        
        if rule_type:
            query = query.eq("rule_type", rule_type.value)
        
        if is_active is not None:
            query = query.eq("is_active", is_active)

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
        for rule_data in result.data:
            items.append(PolicyRuleResponse(
                id=rule_data["id"],
                team_id=rule_data["team_id"],
                name=rule_data["name"],
                description=rule_data["description"],
                keywords=rule_data["keywords"],
                conditions=[PolicyCondition(**c) for c in rule_data["conditions"]],
                severity=PolicySeverity(rule_data["severity"]),
                rule_type=PolicyRuleType(rule_data["rule_type"]),
                is_active=rule_data["is_active"],
                created_at=datetime.fromisoformat(rule_data["created_at"]),
                updated_at=datetime.fromisoformat(rule_data["updated_at"]) if rule_data.get("updated_at") else None
            ))

        # Calculate pagination info
        pages = (total + size - 1) // size

        return PaginatedPolicyResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve policy rules: {str(e)}"
        )

@router.get("/{policy_id}", response_model=PolicyRuleResponse)
async def get_policy_rule(
    request: Request,
    policy_id: str,
    current_user: dict = Depends(require_read),
    supabase = Depends(get_supabase)
):
    """
    Get a specific policy rule by ID
    """
    try:
        result = supabase.table("policy_rules").select("*").eq("id", policy_id).eq("team_id", current_user["team_id"]).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policy rule not found"
            )

        rule_data = result.data[0]

        return PolicyRuleResponse(
            id=rule_data["id"],
            team_id=rule_data["team_id"],
            name=rule_data["name"],
            description=rule_data["description"],
            keywords=rule_data["keywords"],
            conditions=[PolicyCondition(**c) for c in rule_data["conditions"]],
            severity=PolicySeverity(rule_data["severity"]),
            rule_type=PolicyRuleType(rule_data["rule_type"]),
            is_active=rule_data["is_active"],
            created_at=datetime.fromisoformat(rule_data["created_at"]),
            updated_at=datetime.fromisoformat(rule_data["updated_at"]) if rule_data.get("updated_at") else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve policy rule: {str(e)}"
        )

@router.put("/{policy_id}", response_model=PolicyRuleResponse)
async def update_policy_rule(
    request: Request,
    policy_id: str,
    policy_update: PolicyRuleUpdate,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Update a policy rule
    """
    try:
        # Check if policy exists and belongs to team
        existing = supabase.table("policy_rules").select("*").eq("id", policy_id).eq("team_id", current_user["team_id"]).execute()

        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policy rule not found"
            )

        # Check for name conflicts if name is being updated
        if policy_update.name:
            name_conflict = supabase.table("policy_rules").select("id").eq("name", policy_update.name).eq("team_id", current_user["team_id"]).neq("id", policy_id).execute()
            
            if name_conflict.data:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Policy rule with this name already exists"
                )

        # Build update data
        update_data = {}
        if policy_update.name is not None:
            update_data["name"] = policy_update.name
        if policy_update.description is not None:
            update_data["description"] = policy_update.description
        if policy_update.keywords is not None:
            update_data["keywords"] = policy_update.keywords
        if policy_update.conditions is not None:
            update_data["conditions"] = [condition.dict() for condition in policy_update.conditions]
        if policy_update.severity is not None:
            update_data["severity"] = policy_update.severity.value
        if policy_update.rule_type is not None:
            update_data["rule_type"] = policy_update.rule_type.value
        if policy_update.is_active is not None:
            update_data["is_active"] = policy_update.is_active

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )

        update_data["updated_at"] = datetime.now().isoformat()

        # Update policy rule
        result = supabase.table("policy_rules").update(update_data).eq("id", policy_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update policy rule"
            )

        updated_rule = result.data[0]

        # Log policy update
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "policy_updated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"policy_id": policy_id, "updated_fields": list(update_data.keys())}
        )

        return PolicyRuleResponse(
            id=updated_rule["id"],
            team_id=updated_rule["team_id"],
            name=updated_rule["name"],
            description=updated_rule["description"],
            keywords=updated_rule["keywords"],
            conditions=[PolicyCondition(**c) for c in updated_rule["conditions"]],
            severity=PolicySeverity(updated_rule["severity"]),
            rule_type=PolicyRuleType(updated_rule["rule_type"]),
            is_active=updated_rule["is_active"],
            created_at=datetime.fromisoformat(updated_rule["created_at"]),
            updated_at=datetime.fromisoformat(updated_rule["updated_at"]) if updated_rule.get("updated_at") else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update policy rule: {str(e)}"
        )

@router.delete("/{policy_id}")
async def delete_policy_rule(
    request: Request,
    policy_id: str,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Delete a policy rule
    """
    try:
        # Check if policy exists and belongs to team
        existing = supabase.table("policy_rules").select("*").eq("id", policy_id).eq("team_id", current_user["team_id"]).execute()

        if not existing.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Policy rule not found"
            )

        # Delete policy rule
        supabase.table("policy_rules").delete().eq("id", policy_id).execute()

        # Log policy deletion
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "policy_deleted",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"policy_id": policy_id, "policy_name": existing.data[0]["name"]}
        )

        return {"message": "Policy rule deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete policy rule: {str(e)}"
        ) 
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request, Query
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
import json

from backend.app.core.supabase import get_supabase
from backend.app.core.auth import (
    get_current_user_with_role,
    require_manage_policies,
    log_auth_event
)

router = APIRouter()

class IntegrationType(str, Enum):
    SLACK = "slack"
    GITHUB = "github"

class IntegrationStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    PENDING = "pending"

class SlackIntegrationConfig(BaseModel):
    bot_token: str = Field(..., min_length=1, description="Slack bot token")
    signing_secret: str = Field(..., min_length=1, description="Slack signing secret")
    app_id: str = Field(..., min_length=1, description="Slack app ID")
    channels: List[str] = Field(default_factory=list, description="Channels to monitor")
    events: List[str] = Field(default_factory=list, description="Events to listen to")

    @validator('channels')
    def validate_channels(cls, v):
        if len(v) > 50:
            raise ValueError("Maximum 50 channels allowed")
        return v

    @validator('events')
    def validate_events(cls, v):
        valid_events = ['message', 'file_shared', 'file_created', 'channel_created']
        for event in v:
            if event not in valid_events:
                raise ValueError(f"Invalid event: {event}. Valid events: {valid_events}")
        return v

class GitHubIntegrationConfig(BaseModel):
    access_token: str = Field(..., min_length=1, description="GitHub access token")
    webhook_secret: str = Field(..., min_length=1, description="GitHub webhook secret")
    repositories: List[str] = Field(default_factory=list, description="Repositories to monitor")
    events: List[str] = Field(default_factory=list, description="Events to listen to")

    @validator('repositories')
    def validate_repositories(cls, v):
        if len(v) > 100:
            raise ValueError("Maximum 100 repositories allowed")
        return v

    @validator('events')
    def validate_events(cls, v):
        valid_events = ['push', 'pull_request', 'issues', 'commits', 'code_scanning_alert']
        for event in v:
            if event not in valid_events:
                raise ValueError(f"Invalid event: {event}. Valid events: {valid_events}")
        return v

class IntegrationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    integration_type: IntegrationType
    config: Dict[str, Any]
    description: Optional[str] = None
    is_active: bool = True

class IntegrationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    config: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class IntegrationResponse(BaseModel):
    id: str
    team_id: str
    name: str
    integration_type: str
    config: Dict[str, Any]
    description: Optional[str]
    status: str
    is_active: bool
    last_sync_at: Optional[datetime]
    error_message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

class IntegrationTestResponse(BaseModel):
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None

class SlackIntegrationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    config: SlackIntegrationConfig
    description: Optional[str] = None

# Temporarily disabled due to FastAPI compatibility issues
# @router.post("/slack", response_model=IntegrationResponse)
# async def create_slack_integration(
#     request: Request,
#     integration_data: SlackIntegrationCreate,
#     current_user: dict = Depends(require_manage_policies),
#     supabase = Depends(get_supabase)
# ):
    """
    Create a new Slack integration
    """
    pass  # Temporarily disabled due to FastAPI compatibility issues

# Temporarily disabled due to FastAPI compatibility issues
# @router.post("/github", response_model=IntegrationResponse)
# async def create_github_integration(
#     request: Request,
#     name: str = Field(..., min_length=1, max_length=255),
#     config: GitHubIntegrationConfig = Depends(),
#     description: Optional[str] = None,
#     current_user: dict = Depends(require_manage_policies),
#     supabase = Depends(get_supabase)
# ):
    """
    Create a new GitHub integration
    """
    pass  # Temporarily disabled due to FastAPI compatibility issues

@router.get("/", response_model=List[IntegrationResponse])
async def get_integrations(
    request: Request,
    integration_type: Optional[IntegrationType] = Query(None, description="Filter by integration type"),
    status: Optional[IntegrationStatus] = Query(None, description="Filter by status"),
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Get all integrations for the team
    """
    try:
        query = supabase.table("integrations").select("*").eq("team_id", current_user["team_id"])

        if integration_type:
            query = query.eq("integration_type", integration_type.value)
        
        if status:
            query = query.eq("status", status.value)

        result = query.execute()

        integrations = []
        for integration_data in result.data:
            integrations.append(IntegrationResponse(
                id=integration_data["id"],
                team_id=integration_data["team_id"],
                name=integration_data["name"],
                integration_type=integration_data["integration_type"],
                config=integration_data["config"],
                description=integration_data["description"],
                status=integration_data["status"],
                is_active=integration_data["is_active"],
                last_sync_at=datetime.fromisoformat(integration_data["last_sync_at"]) if integration_data.get("last_sync_at") else None,
                error_message=integration_data.get("error_message"),
                created_at=datetime.fromisoformat(integration_data["created_at"]),
                updated_at=datetime.fromisoformat(integration_data["updated_at"]) if integration_data.get("updated_at") else None
            ))

        return integrations

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve integrations: {str(e)}"
        )

@router.get("/{integration_id}", response_model=IntegrationResponse)
async def get_integration(
    request: Request,
    integration_id: str,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Get a specific integration by ID
    """
    try:
        result = supabase.table("integrations").select("*").eq("id", integration_id).eq("team_id", current_user["team_id"]).execute()

        if not result.data:
            raise HTTPException(
                status_code=404,
                detail="Integration not found"
            )

        integration_data = result.data[0]

        return IntegrationResponse(
            id=integration_data["id"],
            team_id=integration_data["team_id"],
            name=integration_data["name"],
            integration_type=integration_data["integration_type"],
            config=integration_data["config"],
            description=integration_data["description"],
            status=integration_data["status"],
            is_active=integration_data["is_active"],
            last_sync_at=datetime.fromisoformat(integration_data["last_sync_at"]) if integration_data.get("last_sync_at") else None,
            error_message=integration_data.get("error_message"),
            created_at=datetime.fromisoformat(integration_data["created_at"]),
            updated_at=datetime.fromisoformat(integration_data["updated_at"]) if integration_data.get("updated_at") else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve integration: {str(e)}"
        )

@router.put("/{integration_id}", response_model=IntegrationResponse)
async def update_integration(
    request: Request,
    integration_id: str,
    integration_update: IntegrationUpdate,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Update an integration
    """
    try:
        # Check if integration exists and belongs to team
        existing = supabase.table("integrations").select("*").eq("id", integration_id).eq("team_id", current_user["team_id"]).execute()

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="Integration not found"
            )

        # Check for name conflicts if name is being updated
        if integration_update.name:
            name_conflict = supabase.table("integrations").select("id").eq("name", integration_update.name).eq("team_id", current_user["team_id"]).neq("id", integration_id).execute()
            
            if name_conflict.data:
                raise HTTPException(
                    status_code=409,
                    detail="Integration with this name already exists"
                )

        # Build update data
        update_data = {}
        if integration_update.name is not None:
            update_data["name"] = integration_update.name
        if integration_update.config is not None:
            update_data["config"] = integration_update.config
        if integration_update.description is not None:
            update_data["description"] = integration_update.description
        if integration_update.is_active is not None:
            update_data["is_active"] = integration_update.is_active

        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="No valid fields to update"
            )

        update_data["updated_at"] = datetime.now().isoformat()

        # Update integration
        result = supabase.table("integrations").update(update_data).eq("id", integration_id).execute()

        if not result.data:
            raise HTTPException(
                status_code=500,
                detail="Failed to update integration"
            )

        updated_integration = result.data[0]

        # Log integration update
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "integration_updated",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"integration_id": integration_id, "updated_fields": list(update_data.keys())}
        )

        return IntegrationResponse(
            id=updated_integration["id"],
            team_id=updated_integration["team_id"],
            name=updated_integration["name"],
            integration_type=updated_integration["integration_type"],
            config=updated_integration["config"],
            description=updated_integration["description"],
            status=updated_integration["status"],
            is_active=updated_integration["is_active"],
            last_sync_at=datetime.fromisoformat(updated_integration["last_sync_at"]) if updated_integration.get("last_sync_at") else None,
            error_message=updated_integration.get("error_message"),
            created_at=datetime.fromisoformat(updated_integration["created_at"]),
            updated_at=datetime.fromisoformat(updated_integration["updated_at"]) if updated_integration.get("updated_at") else None
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update integration: {str(e)}"
        )

@router.delete("/{integration_id}")
async def delete_integration(
    request: Request,
    integration_id: str,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Delete an integration
    """
    try:
        # Check if integration exists and belongs to team
        existing = supabase.table("integrations").select("*").eq("id", integration_id).eq("team_id", current_user["team_id"]).execute()

        if not existing.data:
            raise HTTPException(
                status_code=404,
                detail="Integration not found"
            )

        # Delete integration
        supabase.table("integrations").delete().eq("id", integration_id).execute()

        # Log integration deletion
        await log_auth_event(
            supabase,
            current_user["id"],
            current_user["team_id"],
            "integration_deleted",
            request.client.host if request.client else None,
            request.headers.get("user-agent"),
            {"integration_id": integration_id, "integration_name": existing.data[0]["name"]}
        )

        return {"message": "Integration deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete integration: {str(e)}"
        )

@router.post("/{integration_id}/test", response_model=IntegrationTestResponse)
async def test_integration(
    request: Request,
    integration_id: str,
    current_user: dict = Depends(require_manage_policies),
    supabase = Depends(get_supabase)
):
    """
    Test an integration connection
    """
    try:
        # Get integration
        result = supabase.table("integrations").select("*").eq("id", integration_id).eq("team_id", current_user["team_id"]).execute()

        if not result.data:
            raise HTTPException(
                status_code=404,
                detail="Integration not found"
            )

        integration_data = result.data[0]
        integration_type = integration_data["integration_type"]
        config = integration_data["config"]

        # Test based on integration type
        if integration_type == IntegrationType.SLACK.value:
            success, message, details = await test_slack_integration(config)
        elif integration_type == IntegrationType.GITHUB.value:
            success, message, details = await test_github_integration(config)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported integration type"
            )

        # Update integration status
        status = IntegrationStatus.ACTIVE.value if success else IntegrationStatus.ERROR.value
        error_message = None if success else message
        
        supabase.table("integrations").update({
            "status": status,
            "error_message": error_message,
            "updated_at": datetime.now().isoformat()
        }).eq("id", integration_id).execute()

        return IntegrationTestResponse(
            success=success,
            message=message,
            details=details
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to test integration: {str(e)}"
        )

async def test_slack_integration(config: Dict[str, Any]) -> tuple[bool, str, Optional[Dict[str, Any]]]:
    """Test Slack integration connection"""
    try:
        import httpx
        
        # Test bot token by calling auth.test
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://slack.com/api/auth.test",
                headers={"Authorization": f"Bearer {config.get('bot_token')}"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok"):
                    return True, "Slack integration test successful", {
                        "team_name": data.get("team"),
                        "bot_user_id": data.get("user_id")
                    }
                else:
                    return False, f"Slack API error: {data.get('error')}", None
            else:
                return False, f"HTTP error: {response.status_code}", None
                
    except Exception as e:
        return False, f"Connection test failed: {str(e)}", None

async def test_github_integration(config: Dict[str, Any]) -> tuple[bool, str, Optional[Dict[str, Any]]]:
    """Test GitHub integration connection"""
    try:
        import httpx
        
        # Test access token by calling user endpoint
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"token {config.get('access_token')}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return True, "GitHub integration test successful", {
                    "username": data.get("login"),
                    "name": data.get("name"),
                    "email": data.get("email")
                }
            else:
                return False, f"GitHub API error: {response.status_code}", None
                
    except Exception as e:
        return False, f"Connection test failed: {str(e)}", None 
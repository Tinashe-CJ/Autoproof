from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.database import get_db
from auth import get_current_user
from models.user import User as SAUser
from models.team import Team as SATeam
from fastapi import HTTPException
from services.usage_service import UsageService

router = APIRouter()


class UsageResponse(BaseModel):
    current_period: dict
    limits: dict
    overage: dict
    analytics: dict


@router.get("/usage", response_model=UsageResponse)
async def get_usage_info(
    days: int = Query(30, description="Number of days for analytics"),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive usage information for the user's team"""
    # Extract Clerk claims
    clerk_user_id = current_user.get("sub")
    email = current_user.get("email")
    org_id = current_user.get("org_id")
    org_name = current_user.get("org_name", "Team")
    first_name = current_user.get("first_name", "")
    last_name = current_user.get("last_name", "")

    # Look up or create team
    team = db.query(SATeam).filter(SATeam.id == org_id).first()
    if not team:
        team = SATeam(id=org_id, name=org_name)
        db.add(team)
        db.commit()
        db.refresh(team)

    # Look up or create user
    user = db.query(SAUser).filter(SAUser.id == clerk_user_id).first()
    if not user:
        user = SAUser(
            id=clerk_user_id,
            clerk_id=clerk_user_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            team_id=org_id,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    usage_service = UsageService()
    usage_limits = await usage_service.check_usage_limits(team)
    overage_info = await usage_service.calculate_current_overage(db, team)
    analytics = await usage_service.get_usage_analytics(db, team.id, days)

    return UsageResponse(
        current_period={
            "requests_used": usage_limits["requests_used"],
            "requests_limit": usage_limits["requests_limit"],
            "requests_remaining": usage_limits["requests_remaining"],
            "tokens_used": usage_limits["tokens_used"],
            "tokens_limit": usage_limits["tokens_limit"],
            "tokens_remaining": usage_limits["tokens_remaining"],
            "usage_reset_date": usage_limits["usage_reset_date"],
            "can_make_request": usage_limits["can_make_request"]
        },
        limits={
            "plan": team.plan.value,
            "monthly_requests": usage_limits["requests_limit"],
            "monthly_tokens": usage_limits["tokens_limit"]
        },
        overage={
            "has_overage": overage_info["has_overage"],
            "overage_amount": overage_info["overage_amount"],
            "overage_requests": overage_info["overage_requests"],
            "overage_tokens": overage_info["overage_tokens"]
        },
        analytics={
            "period_days": analytics["period_days"],
            "total_requests": analytics["total_requests"],
            "total_tokens": analytics["total_tokens"],
            "daily_usage": analytics["daily_usage"],
            "endpoint_breakdown": analytics["endpoint_breakdown"]
        }
    )


@router.get("/usage/summary")
async def get_usage_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a quick usage summary for dashboard display"""
    
    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    usage_service = UsageService()
    
    usage_limits = await usage_service.check_usage_limits(team)
    overage_info = await usage_service.calculate_current_overage(db, team)
    
    # Calculate usage percentages
    requests_percentage = (usage_limits["requests_used"] / usage_limits["requests_limit"]) * 100
    tokens_percentage = (usage_limits["tokens_used"] / usage_limits["tokens_limit"]) * 100
    
    return {
        "plan": team.plan.value,
        "requests": {
            "used": usage_limits["requests_used"],
            "limit": usage_limits["requests_limit"],
            "percentage": round(requests_percentage, 1)
        },
        "tokens": {
            "used": usage_limits["tokens_used"],
            "limit": usage_limits["tokens_limit"],
            "percentage": round(tokens_percentage, 1)
        },
        "overage_amount": overage_info["overage_amount"],
        "status": "over_limit" if not usage_limits["can_make_request"] else "normal"
    }
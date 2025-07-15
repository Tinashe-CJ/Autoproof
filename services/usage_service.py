from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models.team import Team, PlanType
from models.usage_log import UsageLog
from models.billing import BillingInfo
from services.stripe_service import StripeService


class UsageService:
    """Service for tracking and managing usage limits"""
    
    def __init__(self):
        self.stripe_service = StripeService()
    
    async def check_usage_limits(self, team: Team) -> Dict[str, Any]:
        """Check if team has exceeded usage limits"""
        plan_config = self.stripe_service.PLAN_CONFIGS[team.plan]
        
        # Check if usage reset is needed (monthly reset)
        now = datetime.utcnow()
        if not team.usage_reset_date or now >= team.usage_reset_date:
            await self.reset_monthly_usage(team)
        
        requests_remaining = max(0, plan_config["requests_limit"] - team.current_requests)
        tokens_remaining = max(0, plan_config["tokens_limit"] - team.current_tokens)
        
        return {
            "requests_used": team.current_requests,
            "requests_limit": plan_config["requests_limit"],
            "requests_remaining": requests_remaining,
            "tokens_used": team.current_tokens,
            "tokens_limit": plan_config["tokens_limit"],
            "tokens_remaining": tokens_remaining,
            "can_make_request": requests_remaining > 0 and tokens_remaining > 0,
            "usage_reset_date": team.usage_reset_date.isoformat() if team.usage_reset_date else None
        }
    
    async def record_usage(
        self, 
        db: Session,
        team: Team, 
        user_id: str,
        api_key_id: Optional[str],
        endpoint: str,
        tokens_used: int,
        analysis_data: Optional[Dict[str, Any]] = None
    ) -> UsageLog:
        """Record usage for billing and limits tracking"""
        
        # Create usage log entry
        usage_log = UsageLog(
            id=str(__import__('uuid').uuid4()),
            user_id=user_id,
            team_id=team.id,
            api_key_id=api_key_id,
            endpoint=endpoint,
            method="POST",
            tokens_used=tokens_used,
            analysis_type="compliance",
            analysis_result=analysis_data
        )
        
        db.add(usage_log)
        
        # Update team usage counters
        team.current_requests += 1
        team.current_tokens += tokens_used
        
        db.commit()
        db.refresh(usage_log)
        
        return usage_log
    
    async def reset_monthly_usage(self, team: Team) -> None:
        """Reset monthly usage counters"""
        team.current_requests = 0
        team.current_tokens = 0
        
        # Set next reset date to first day of next month
        now = datetime.utcnow()
        if now.month == 12:
            next_month = now.replace(year=now.year + 1, month=1, day=1)
        else:
            next_month = now.replace(month=now.month + 1, day=1)
        
        team.usage_reset_date = next_month
    
    async def get_usage_analytics(
        self, 
        db: Session, 
        team_id: str, 
        days: int = 30
    ) -> Dict[str, Any]:
        """Get detailed usage analytics for a team"""
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Query usage logs for the period
        usage_query = db.query(UsageLog).filter(
            UsageLog.team_id == team_id,
            UsageLog.created_at >= start_date
        )
        
        # Daily usage aggregation
        daily_usage = db.query(
            func.date(UsageLog.created_at).label('date'),
            func.count(UsageLog.id).label('requests'),
            func.sum(UsageLog.tokens_used).label('tokens')
        ).filter(
            UsageLog.team_id == team_id,
            UsageLog.created_at >= start_date
        ).group_by(func.date(UsageLog.created_at)).all()
        
        # Endpoint usage breakdown
        endpoint_usage = db.query(
            UsageLog.endpoint,
            func.count(UsageLog.id).label('requests'),
            func.sum(UsageLog.tokens_used).label('tokens')
        ).filter(
            UsageLog.team_id == team_id,
            UsageLog.created_at >= start_date
        ).group_by(UsageLog.endpoint).all()
        
        # Total usage for the period
        total_requests = usage_query.count()
        total_tokens = db.query(func.sum(UsageLog.tokens_used)).filter(
            UsageLog.team_id == team_id,
            UsageLog.created_at >= start_date
        ).scalar() or 0
        
        return {
            "period_days": days,
            "total_requests": total_requests,
            "total_tokens": int(total_tokens),
            "daily_usage": [
                {
                    "date": day.date.isoformat(),
                    "requests": day.requests,
                    "tokens": int(day.tokens or 0)
                }
                for day in daily_usage
            ],
            "endpoint_breakdown": [
                {
                    "endpoint": endpoint.endpoint,
                    "requests": endpoint.requests,
                    "tokens": int(endpoint.tokens or 0)
                }
                for endpoint in endpoint_usage
            ]
        }
    
    async def calculate_current_overage(
        self, 
        db: Session, 
        team: Team
    ) -> Dict[str, Any]:
        """Calculate current month's overage charges"""
        
        usage_limits = await self.check_usage_limits(team)
        
        if usage_limits["can_make_request"]:
            return {
                "has_overage": False,
                "overage_amount": 0.0,
                "overage_requests": 0,
                "overage_tokens": 0
            }
        
        overage_data = await self.stripe_service.calculate_overage_charges(
            team.plan,
            team.current_requests,
            team.current_tokens
        )
        
        return {
            "has_overage": overage_data["total_overage_cost"] > 0,
            "overage_amount": overage_data["total_overage_cost"],
            "overage_requests": overage_data["overage_requests"],
            "overage_tokens": overage_data["overage_tokens"],
            "breakdown": overage_data
        }
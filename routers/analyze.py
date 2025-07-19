from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.schemas.analyze import AnalyzeRequest, AnalyzeResponse
from services.openai_service import ComplianceAnalyzer
from services.usage_service import UsageService
from config.database import get_db
from typing import Any
from backend.app.core.auth import get_current_user
from models.team import Team

router = APIRouter()

async def get_current_team(
    db: Session = Depends(get_db),
    user_payload: dict = Depends(get_current_user)
) -> Team:
    """
    Extract team (org) from Clerk JWT payload and fetch or create Team in DB.
    Supports both 'org_id' at top level and 'o.id' (Clerk org context).
    """
    org_id = user_payload.get("org_id") or (user_payload.get("o", {}) or {}).get("id")
    org_name = (user_payload.get("o", {}) or {}).get("slg", "Unknown Org")
    if not org_id:
        raise HTTPException(status_code=401, detail="No org_id in Clerk JWT (check 'org_id' or 'o.id')")
    team = db.query(Team).filter(Team.id == org_id).first()
    if not team:
        # Auto-create the team if it doesn't exist
        team = Team(id=org_id, name=org_name)
        db.add(team)
        db.commit()
        db.refresh(team)
    return team

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_endpoint(
    request: Request,
    analyze_request: AnalyzeRequest,
    db: Session = Depends(get_db),
    team: Any = Depends(get_current_team),  # Replace Any with actual Team model
    user_payload: dict = Depends(get_current_user)
):
    """
    Analyze text for compliance violations using OpenAI GPT-4.
    Enforces quota, logs usage, and returns structured response.
    """
    usage_service = UsageService()
    analyzer = ComplianceAnalyzer()

    # 1. Enforce quota
    await usage_service.check_quota(team)

    # 2. Run analysis
    try:
        result = await analyzer.analyze_compliance(
            analyze_request.text,
            analyze_request.source
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OpenAI analysis failed: {e}"
        )

    # 3. Log usage
    user_id = user_payload.get("sub")  # Clerk user ID from JWT
    api_key_id = request.headers.get("X-API-Key-ID") if request else None
    if user_id is not None:
        await usage_service.record_usage(
            db=db,
            team=team,
            user_id=user_id,
            api_key_id=api_key_id,
            endpoint="/api/analyze",
            tokens_used=result["token_usage"],
            analysis_data=result["violations"]
        )
    else:
        # Should not happen with valid Clerk JWT
        pass

    # 4. Return response
    return AnalyzeResponse(
        violations=result["violations"],
        token_usage=result["token_usage"]
    )
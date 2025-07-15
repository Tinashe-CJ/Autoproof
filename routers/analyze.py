from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.database import get_db
from auth import verify_api_key
from services.openai_service import ComplianceAnalyzer
from services.usage_service import UsageService

router = APIRouter()


class AnalyzeRequest(BaseModel):
    content: str
    content_type: Optional[str] = "text"  # "text", "code", "message"
    analysis_types: Optional[List[str]] = ["compliance"]  # Future: ["compliance", "security", "privacy"]


class AnalyzeResponse(BaseModel):
    analysis_id: str
    violations: List[dict]
    compliance_score: int
    summary: str
    tokens_used: int
    usage_remaining: dict


class BatchAnalyzeRequest(BaseModel):
    items: List[dict]  # [{"id": "1", "content": "...", "type": "text"}]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_content(
    request: Request,
    analyze_request: AnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze content for compliance violations using AI
    Requires API key authentication
    """
    # Verify API key and get user/team
    user, team = await verify_api_key(request, db)
    
    # Check usage limits
    usage_service = UsageService()
    usage_status = await usage_service.check_usage_limits(team)
    
    if not usage_status["can_make_request"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Usage limit exceeded",
                "usage": usage_status,
                "message": "Upgrade your plan or wait for monthly reset"
            }
        )
    
    try:
        # Perform AI analysis
        analyzer = ComplianceAnalyzer()
        result = await analyzer.analyze_compliance(
            analyze_request.content,
            analyze_request.content_type
        )
        
        # Record usage
        api_key_id = request.headers.get("X-API-Key-ID")  # Optional header for tracking
        usage_log = await usage_service.record_usage(
            db=db,
            team=team,
            user_id=user.id,
            api_key_id=api_key_id,
            endpoint="/api/analyze",
            tokens_used=result["tokens_used"],
            analysis_data=result["analysis"]
        )
        
        # Get updated usage status
        updated_usage = await usage_service.check_usage_limits(team)
        
        return AnalyzeResponse(
            analysis_id=usage_log.id,
            violations=result["analysis"].get("violations", []),
            compliance_score=result["analysis"].get("compliance_score", 0),
            summary=result["analysis"].get("summary", ""),
            tokens_used=result["tokens_used"],
            usage_remaining={
                "requests_remaining": updated_usage["requests_remaining"],
                "tokens_remaining": updated_usage["tokens_remaining"]
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


@router.post("/analyze/batch")
async def analyze_batch(
    request: Request,
    batch_request: BatchAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Analyze multiple pieces of content in batch
    More efficient for processing multiple items
    """
    user, team = await verify_api_key(request, db)
    
    # Check if team can handle the batch size
    usage_service = UsageService()
    usage_status = await usage_service.check_usage_limits(team)
    
    if usage_status["requests_remaining"] < len(batch_request.items):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Insufficient requests remaining for batch",
                "requested": len(batch_request.items),
                "available": usage_status["requests_remaining"]
            }
        )
    
    try:
        analyzer = ComplianceAnalyzer()
        batch_result = await analyzer.analyze_batch(batch_request.items)
        
        # Record usage for the batch
        api_key_id = request.headers.get("X-API-Key-ID")
        usage_log = await usage_service.record_usage(
            db=db,
            team=team,
            user_id=user.id,
            api_key_id=api_key_id,
            endpoint="/api/analyze/batch",
            tokens_used=batch_result["total_tokens"],
            analysis_data={
                "batch_size": len(batch_request.items),
                "processed_count": batch_result["processed_count"]
            }
        )
        
        return {
            "batch_id": usage_log.id,
            "results": batch_result["results"],
            "total_tokens": batch_result["total_tokens"],
            "processed_count": batch_result["processed_count"]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch analysis failed: {str(e)}"
        )
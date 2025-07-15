from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.database import get_db
from auth import get_current_user
from models.user import User
from models.team import Team

router = APIRouter()


class TeamResponse(BaseModel):
    id: str
    name: str
    plan: str
    member_count: int
    created_at: str


class TeamUpdateRequest(BaseModel):
    name: str


@router.get("/team", response_model=TeamResponse)
async def get_team_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's team information"""
    
    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Count team members
    member_count = db.query(User).filter(User.team_id == team.id).count()
    
    return TeamResponse(
        id=team.id,
        name=team.name,
        plan=team.plan.value,
        member_count=member_count,
        created_at=team.created_at.isoformat()
    )


@router.put("/team")
async def update_team(
    team_update: TeamUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update team information"""
    
    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    team.name = team_update.name
    db.commit()
    
    return {"message": "Team updated successfully"}


@router.get("/team/members")
async def get_team_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all team members"""
    
    members = db.query(User).filter(
        User.team_id == current_user.team_id,
        User.is_active == True
    ).all()
    
    return [
        {
            "id": member.id,
            "email": member.email,
            "first_name": member.first_name,
            "last_name": member.last_name,
            "created_at": member.created_at.isoformat()
        }
        for member in members
    ]
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from config.database import get_db
from config.settings import settings
from auth import get_current_user
from models.user import User
from models.team import Team, PlanType
from models.billing import BillingInfo
from services.stripe_service import StripeService
from services.usage_service import UsageService
import stripe
import json

router = APIRouter()


class PlanUpgradeRequest(BaseModel):
    plan: PlanType


class BillingResponse(BaseModel):
    customer_id: str
    subscription_id: str
    current_plan: PlanType
    status: str
    trial_end: str = None
    current_period_end: str
    overage_amount: float = 0.0


@router.get("/billing", response_model=BillingResponse)
async def get_billing_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current billing information for user's team"""
    
    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    billing_info = db.query(BillingInfo).filter(BillingInfo.team_id == team.id).first()
    
    if not billing_info:
        # Create billing info if it doesn't exist
        stripe_service = StripeService()
        customer_id = await stripe_service.create_customer(
            email=current_user.email,
            name=f"{current_user.first_name} {current_user.last_name}",
            team_id=team.id
        )
        
        billing_info = BillingInfo(
            id=str(__import__('uuid').uuid4()),
            team_id=team.id,
            stripe_customer_id=customer_id,
            is_active=True
        )
        db.add(billing_info)
        db.commit()
        db.refresh(billing_info)
    
    # Calculate current overage
    usage_service = UsageService()
    overage_info = await usage_service.calculate_current_overage(db, team)
    
    return BillingResponse(
        customer_id=billing_info.stripe_customer_id,
        subscription_id=billing_info.stripe_subscription_id or "",
        current_plan=team.plan,
        status="active" if billing_info.is_active else "inactive",
        trial_end=billing_info.trial_ends_at.isoformat() if billing_info.trial_ends_at else None,
        current_period_end=billing_info.current_period_end.isoformat() if billing_info.current_period_end else "",
        overage_amount=overage_info["overage_amount"]
    )


@router.post("/billing/upgrade")
async def upgrade_plan(
    upgrade_request: PlanUpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upgrade or downgrade team plan"""
    
    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    billing_info = db.query(BillingInfo).filter(BillingInfo.team_id == team.id).first()
    
    if not billing_info:
        raise HTTPException(status_code=404, detail="Billing info not found")
    
    stripe_service = StripeService()
    
    try:
        if billing_info.stripe_subscription_id:
            # Update existing subscription
            result = await stripe_service.update_subscription(
                billing_info.stripe_subscription_id,
                upgrade_request.plan
            )
        else:
            # Create new subscription
            result = await stripe_service.create_subscription(
                billing_info.stripe_customer_id,
                upgrade_request.plan
            )
            billing_info.stripe_subscription_id = result["subscription_id"]
        
        # Update team plan
        team.plan = upgrade_request.plan
        
        # Update billing info
        billing_info.current_period_start = result["current_period_start"]
        billing_info.current_period_end = result["current_period_end"]
        
        db.commit()
        
        return {"message": f"Plan upgraded to {upgrade_request.plan.value}", "status": "success"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upgrade plan: {str(e)}"
        )


@router.post("/billing/portal")
async def create_billing_portal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Stripe billing portal session for self-service"""
    
    team = db.query(Team).filter(Team.id == current_user.team_id).first()
    billing_info = db.query(BillingInfo).filter(BillingInfo.team_id == team.id).first()
    
    if not billing_info:
        raise HTTPException(status_code=404, detail="Billing info not found")
    
    stripe_service = StripeService()
    
    try:
        portal_url = await stripe_service.create_billing_portal_session(
            billing_info.stripe_customer_id,
            return_url="https://autoproof.com/dashboard"  # Update with your frontend URL
        )
        
        return {"portal_url": portal_url}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create billing portal: {str(e)}"
        )


@router.post("/stripe/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """Handle Stripe webhook events"""
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        await handle_subscription_updated(db, subscription)
    
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        await handle_subscription_cancelled(db, subscription)
    
    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        await handle_payment_succeeded(db, invoice)
    
    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        await handle_payment_failed(db, invoice)
    
    return {"status": "success"}


async def handle_subscription_updated(db: Session, subscription: dict):
    """Handle subscription update webhook"""
    customer_id = subscription["customer"]
    
    billing_info = db.query(BillingInfo).filter(
        BillingInfo.stripe_customer_id == customer_id
    ).first()
    
    if billing_info:
        billing_info.current_period_start = subscription["current_period_start"]
        billing_info.current_period_end = subscription["current_period_end"]
        billing_info.is_active = subscription["status"] == "active"
        
        # Update team plan based on subscription metadata
        if "plan" in subscription.get("metadata", {}):
            team = db.query(Team).filter(Team.id == billing_info.team_id).first()
            if team:
                team.plan = PlanType(subscription["metadata"]["plan"])
        
        db.commit()


async def handle_subscription_cancelled(db: Session, subscription: dict):
    """Handle subscription cancellation webhook"""
    customer_id = subscription["customer"]
    
    billing_info = db.query(BillingInfo).filter(
        BillingInfo.stripe_customer_id == customer_id
    ).first()
    
    if billing_info:
        billing_info.is_active = False
        
        # Downgrade team to starter plan
        team = db.query(Team).filter(Team.id == billing_info.team_id).first()
        if team:
            team.plan = PlanType.STARTER
        
        db.commit()


async def handle_payment_succeeded(db: Session, invoice: dict):
    """Handle successful payment webhook"""
    customer_id = invoice["customer"]
    
    billing_info = db.query(BillingInfo).filter(
        BillingInfo.stripe_customer_id == customer_id
    ).first()
    
    if billing_info:
        billing_info.is_active = True
        db.commit()


async def handle_payment_failed(db: Session, invoice: dict):
    """Handle failed payment webhook"""
    customer_id = invoice["customer"]
    
    billing_info = db.query(BillingInfo).filter(
        BillingInfo.stripe_customer_id == customer_id
    ).first()
    
    if billing_info:
        # Could implement grace period logic here
        # For now, just mark as inactive
        billing_info.is_active = False
        db.commit()
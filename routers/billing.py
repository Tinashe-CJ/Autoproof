from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool
from config.database import get_db
from config.settings import settings
from auth import get_current_user
from models.user import User
from models.team import Team, PlanType
from models.billing import BillingInfo
from services.stripe_service import StripeService
from services.usage_service import UsageService
from typing import Optional
from datetime import datetime
import stripe
import json
import httpx

router = APIRouter()


class PlanUpgradeRequest(BaseModel):
    plan: PlanType

class BillingResponse(BaseModel):
    customer_id: str
    subscription_id: str
    current_plan: PlanType
    status: str
    trial_end: Optional[str] = None
    current_period_end: str
    overage_amount: float = 0.0


class CheckoutSessionRequest(BaseModel):
    plan: PlanType


@router.get("/", response_model=BillingResponse)
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
    else:
        # Update customer info if it exists but might be outdated
        stripe_service = StripeService()
        try:
            await stripe_service.update_customer(
                billing_info.stripe_customer_id,
                email=current_user.email,
                name=f"{current_user.first_name} {current_user.last_name}"
            )
        except Exception as e:
            print(f"Warning: Could not update Stripe customer: {e}")
    
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


@router.post("/upgrade")
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
        
        # Update billing info - convert Unix timestamps to datetime
        billing_info.current_period_start = datetime.fromtimestamp(result["current_period_start"])
        billing_info.current_period_end = datetime.fromtimestamp(result["current_period_end"])
        
        db.commit()
        
        return {"message": f"Plan upgraded to {upgrade_request.plan.value}", "status": "success"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to upgrade plan: {str(e)}"
        )


@router.post("/portal")
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


@router.post("/start-trial")
async def start_free_trial(
    request: Request,
    checkout_request: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a free trial or subscription by calling the Supabase stripe-checkout Edge Function."""
    user_id = current_user.id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get team and billing info
    team = db.query(Team).filter(Team.id == user.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    billing_info = db.query(BillingInfo).filter(BillingInfo.team_id == team.id).first()
    if not billing_info:
        # Create billing info if it doesn't exist
        stripe_service = StripeService()
        customer_id = await stripe_service.create_customer(
            email=user.email,
            name=f"{user.first_name} {user.last_name}",
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

    # Prepare data for the Edge Function
    price_id = StripeService().PLAN_CONFIGS[checkout_request.plan]["price_id"]
    success_url = "https://yourdomain.com/billing/success"  # Update to your frontend
    cancel_url = "https://yourdomain.com/billing/cancel"    # Update to your frontend
    edge_url = "https://jwwdunhhmbqqfbotnzvm.functions.supabase.co/stripe-checkout"  # Your project ref

    payload = {
        "price_id": price_id,
        "customer_id": billing_info.stripe_customer_id,
        "success_url": success_url,
        "cancel_url": cancel_url,
        "user_id": user_id
    }

    async with httpx.AsyncClient() as client:
        edge_response = await client.post(edge_url, json=payload)
        if edge_response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Stripe checkout failed: {edge_response.text}")
        data = edge_response.json()
        checkout_url = data.get("url")
        if not checkout_url:
            raise HTTPException(status_code=502, detail="No checkout URL returned from Stripe.")

    return {"checkout_url": checkout_url}


@router.post("/checkout-session-direct")
async def create_checkout_session_direct(
    request: Request,
    checkout_request: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe Checkout session directly from the backend and return the session URL."""
    import time
    start_time = time.time()
    user_id = current_user.id
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get team and billing info
    team = db.query(Team).filter(Team.id == user.team_id).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    billing_info = db.query(BillingInfo).filter(BillingInfo.team_id == team.id).first()
    if not billing_info:
        # Create billing info if it doesn't exist
        stripe_service = StripeService()
        customer_id = await stripe_service.create_customer(
            email=user.email,
            name=f"{user.first_name} {user.last_name}",
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

    # Prepare data for Stripe Checkout
    price_id = StripeService().PLAN_CONFIGS[checkout_request.plan]["price_id"]
    
    # Get the request origin for dynamic URLs
    request_origin = request.headers.get("origin", "http://localhost:3000")
    success_url = f"{request_origin}/success"
    cancel_url = f"{request_origin}/pricing"

    try:
        session = stripe.checkout.Session.create(
            customer=billing_info.stripe_customer_id,
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={"plan": checkout_request.plan.value, "team_id": str(team.id)},
        )
        duration = time.time() - start_time
        print(f"Checkout session created in {duration:.2f}s")
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Stripe checkout failed: {str(e)}")


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
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await handle_checkout_session_completed(db, session)
    
    elif event["type"] == "customer.subscription.updated":
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


async def handle_checkout_session_completed(db: Session, session: dict):
    """Handle checkout session completion webhook"""
    customer_id = session["customer"]
    metadata = session.get("metadata", {})
    plan_value = metadata.get("plan")
    team_id = metadata.get("team_id")
    
    if not plan_value or not team_id:
        print(f"Missing metadata in checkout session: {session}")
        return
    
    try:
        plan = PlanType(plan_value)
    except ValueError:
        print(f"Invalid plan value in checkout session: {plan_value}")
        return
    
    # Update team plan
    team = db.query(Team).filter(Team.id == team_id).first()
    if team:
        team.plan = plan
        print(f"Updated team {team_id} plan to {plan.value}")
    
    # Update billing info
    billing_info = db.query(BillingInfo).filter(
        BillingInfo.stripe_customer_id == customer_id
    ).first()
    
    if billing_info:
        billing_info.is_active = True
        if session.get("subscription"):
            billing_info.stripe_subscription_id = session["subscription"]
        print(f"Updated billing info for customer {customer_id}")
    
    db.commit()


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
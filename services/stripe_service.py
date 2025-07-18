import stripe
from typing import Dict, Any, Optional
from config.settings import settings
from models.team import Team, PlanType
from models.billing import BillingInfo

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service for handling Stripe billing operations"""
    
    PLAN_CONFIGS = {
        PlanType.STARTER: {
            "price_id": settings.STARTER_PLAN_PRICE_ID,
            "amount": 3000,  # $30.00 in cents
            "requests_limit": settings.STARTER_REQUESTS_LIMIT,
            "tokens_limit": settings.STARTER_TOKENS_LIMIT
        },
        PlanType.GROWTH: {
            "price_id": settings.GROWTH_PLAN_PRICE_ID,
            "amount": 7500,  # $75.00 in cents
            "requests_limit": settings.GROWTH_REQUESTS_LIMIT,
            "tokens_limit": settings.GROWTH_TOKENS_LIMIT
        },
        PlanType.BUSINESS: {
            "price_id": settings.BUSINESS_PLAN_PRICE_ID,
            "amount": 30000,  # $300.00 in cents
            "requests_limit": settings.BUSINESS_REQUESTS_LIMIT,
            "tokens_limit": settings.BUSINESS_TOKENS_LIMIT
        }
    }
    
    async def create_customer(self, email: str, name: str, team_id: str) -> str:
        """Create a new Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={"team_id": team_id}
            )
            return customer.id
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create Stripe customer: {str(e)}")
    
    async def update_customer(self, customer_id: str, email: str, name: str) -> bool:
        """Update an existing Stripe customer"""
        try:
            stripe.Customer.modify(
                customer_id,
                email=email,
                name=name
            )
            return True
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to update Stripe customer: {str(e)}")
    
    async def create_subscription(
        self, 
        customer_id: str, 
        plan: PlanType,
        trial_days: int = 14
    ) -> Dict[str, Any]:
        """Create a subscription for a customer"""
        try:
            plan_config = self.PLAN_CONFIGS[plan]
            
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": plan_config["price_id"]}],
                trial_period_days=trial_days,
                metadata={"plan": plan.value}
            )
            
            return {
                "subscription_id": subscription.id,
                "status": subscription.status,
                "current_period_start": subscription.current_period_start,
                "current_period_end": subscription.current_period_end,
                "trial_end": subscription.trial_end
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create subscription: {str(e)}")
    
    async def update_subscription(
        self, 
        subscription_id: str, 
        new_plan: PlanType
    ) -> Dict[str, Any]:
        """Update subscription to a new plan"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            plan_config = self.PLAN_CONFIGS[new_plan]
            
            # Update the subscription
            updated_subscription = stripe.Subscription.modify(
                subscription_id,
                items=[{
                    "id": subscription["items"]["data"][0]["id"],
                    "price": plan_config["price_id"]
                }],
                metadata={"plan": new_plan.value}
            )
            
            return {
                "subscription_id": updated_subscription.id,
                "status": updated_subscription.status,
                "current_period_start": updated_subscription.current_period_start,
                "current_period_end": updated_subscription.current_period_end
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to update subscription: {str(e)}")
    
    async def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel a subscription"""
        try:
            stripe.Subscription.delete(subscription_id)
            return True
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to cancel subscription: {str(e)}")
    
    async def create_billing_portal_session(
        self, 
        customer_id: str, 
        return_url: str
    ) -> str:
        """Create a billing portal session for customer self-service"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            return session.url
        except stripe.error.StripeError as e:
            raise Exception(f"Failed to create billing portal session: {str(e)}")
    
    async def calculate_overage_charges(
        self, 
        plan: PlanType, 
        requests_used: int, 
        tokens_used: int
    ) -> Dict[str, Any]:
        """Calculate overage charges based on usage"""
        plan_config = self.PLAN_CONFIGS[plan]
        
        overage_requests = max(0, requests_used - plan_config["requests_limit"])
        overage_tokens = max(0, tokens_used - plan_config["tokens_limit"])
        
        # Pricing: $0.01 per extra request, $0.001 per 1000 extra tokens
        request_overage_cost = overage_requests * 0.01
        token_overage_cost = (overage_tokens / 1000) * 0.001
        
        total_overage = request_overage_cost + token_overage_cost
        
        return {
            "overage_requests": overage_requests,
            "overage_tokens": overage_tokens,
            "request_overage_cost": round(request_overage_cost, 2),
            "token_overage_cost": round(token_overage_cost, 2),
            "total_overage_cost": round(total_overage, 2)
        }
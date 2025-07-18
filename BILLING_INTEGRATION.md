# Billing Integration Guide

## Overview

AutoProof now has a complete billing system integrated with Stripe, including:

- ✅ **Direct Checkout Sessions** - Create Stripe checkout for any plan
- ✅ **Billing Portal** - Customer self-service portal
- ✅ **Plan Management** - Upgrade/downgrade plans
- ✅ **Frontend Integration** - React components for billing management

## Backend Endpoints

### 1. Get Billing Info
```http
GET {{base_url}}/api/v1/billing/
Authorization: Bearer <clerk-jwt-token>
```

### 2. Create Checkout Session
```http
POST {{base_url}}/api/v1/billing/checkout-session-direct
Authorization: Bearer <clerk-jwt-token>
Content-Type: application/json

{
  "plan": "starter" | "growth" | "business"
}
```

### 3. Open Billing Portal
```http
POST {{base_url}}/api/v1/billing/portal
Authorization: Bearer <clerk-jwt-token>
```

### 4. Upgrade Plan
```http
POST {{base_url}}/api/v1/billing/upgrade
Authorization: Bearer <clerk-jwt-token>
Content-Type: application/json

{
  "plan": "starter" | "growth" | "business"
}
```

## Frontend Components

### BillingManager Component
Located at: `src/components/billing/BillingManager.tsx`

Features:
- Display current plan and billing status
- Show trial information and renewal dates
- Display overage charges
- Plan comparison and upgrade options
- Direct checkout integration
- Billing portal access

### Usage
```tsx
import { BillingManager } from '@/components/billing';

// In your route
<Route path="/billing" element={<BillingManager />} />
```

## Environment Variables

### Backend (.env)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STARTER_PLAN_PRICE_ID=price_...
GROWTH_PLAN_PRICE_ID=price_...
BUSINESS_PLAN_PRICE_ID=price_...
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Testing

### Test All Plans
All checkout endpoints have been tested and are working:
- ✅ Starter Plan ($30/month)
- ✅ Growth Plan ($75/month) 
- ✅ Business Plan ($300/month)

### Test Billing Portal
The Stripe Customer Portal is configured and working:
- ✅ Portal sessions can be created
- ✅ Customers can manage subscriptions
- ✅ Payment method updates
- ✅ Invoice history

## Next Steps

1. **Stripe Webhooks** - Set up webhook endpoints for subscription events
2. **Usage Tracking** - Implement API usage monitoring and overage billing
3. **Email Notifications** - Send billing-related emails
4. **Analytics** - Track subscription metrics and revenue

## Troubleshooting

### Common Issues

1. **"No configuration provided" error**
   - Solution: Configure Customer Portal in Stripe Dashboard
   - URL: https://dashboard.stripe.com/test/settings/billing/portal

2. **Authentication errors**
   - Ensure Clerk JWT token is valid
   - Check token expiration (24 hours)

3. **CORS errors**
   - Verify backend CORS settings
   - Check frontend API URL configuration 
# AutoProof Backend API

AI-Powered Compliance Automation Backend built with FastAPI, PostgreSQL, Clerk, Stripe, and OpenAI.

## Features

- **Clerk Authentication**: Secure JWT-based authentication
- **Stripe Billing**: Subscription management with usage-based billing
- **OpenAI Integration**: AI-powered compliance analysis
- **Usage Tracking**: Monitor API usage and enforce limits
- **API Key Management**: Secure team-scoped API keys
- **PostgreSQL Database**: Robust data storage with SQLAlchemy

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Clerk account (for authentication)
- Stripe account (for billing)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase, Clerk, and Stripe credentials
   ```

3. **Configure Services:**
   ```bash
   # Set up Supabase project and get your URL and keys
   # Set up Clerk authentication
   # Set up Stripe billing with your products and prices
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Features

### Authentication
- Secure user authentication with Clerk
- User profile management
- Protected routes and dashboard

### Billing & Subscriptions
- Stripe integration for subscription management
- Multiple pricing tiers (Starter, Growth, Business)
- Secure checkout process
- Subscription status tracking

### Database
- Supabase for data storage
- Row Level Security (RLS) policies
- Real-time subscriptions

## Pricing Plans

| Plan | Monthly Price | Features |
|------|---------------|----------|
| Starter | $30.00 | Up to 3 team members, basic features |
| Growth | $75.00 | Up to 10 team members, advanced features |
| Business | $300.00 | Unlimited members, enterprise features |

## Authentication

The application uses Clerk for authentication, providing:
- Email/password authentication
- Social login options
- User profile management
- Session management

## Stripe Integration

The app includes full Stripe integration:
- Subscription management
- Secure checkout sessions
- Webhook handling for real-time updates
- Customer and subscription tracking

### Setting up Stripe

1. Create products in your Stripe dashboard
2. Update the price IDs in `src/stripe-config.ts`
3. Set up webhook endpoints for subscription updates
4. Add your Stripe keys to the `.env` file

## Development

### Project Structure
- `src/components/` - React components
- `src/lib/` - Utility functions and configurations
- `supabase/` - Database migrations and edge functions
- `src/stripe-config.ts` - Stripe product configuration

### Key Components
- Authentication with Clerk
- Pricing page with Stripe integration
- Dashboard for user management
- Supabase for data persistence

## Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## Support

For issues and questions, please check the documentation or contact support.
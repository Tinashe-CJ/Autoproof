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

- Python 3.11+
- PostgreSQL
- Clerk account
- Stripe account
- OpenAI API key

### Installation

1. **Clone and setup virtual environment:**
   ```bash
   git clone <repository>
   cd autoproof-backend
   
   # Create virtual environment (required for macOS due to PEP 668)
   python3 -m venv .venv
   source .venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Environment Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Database Setup:**
   ```bash
   # Create PostgreSQL database
   createdb autoproof
   
   # Run migrations
   alembic upgrade head
   ```

4. **Start the server:**
   ```bash
   uvicorn main:app --reload
   ```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## API Endpoints

### Analysis
- `POST /api/analyze` - Analyze content for compliance violations
- `POST /api/analyze/batch` - Batch analysis for multiple items

### Usage & Billing
- `GET /api/usage` - Get usage statistics and limits
- `GET /api/billing` - Get billing information
- `POST /api/billing/upgrade` - Upgrade/downgrade plan
- `POST /api/stripe/webhook` - Stripe webhook handler

### API Keys
- `GET /api/api-keys` - List team API keys
- `POST /api/api-keys` - Create new API key
- `DELETE /api/api-keys/{id}` - Delete API key

### Team Management
- `GET /api/team` - Get team information
- `PUT /api/team` - Update team settings

## Plan Limits

| Plan | Monthly Price | Requests | Tokens |
|------|---------------|----------|---------|
| Starter | $30 | 1,000 | 100,000 |
| Growth | $100 | 5,000 | 500,000 |
| Business | $300 | 50,000 | 5,000,000 |

## Authentication

### Clerk JWT (Web App)
Include Clerk session token in Authorization header:
```
Authorization: Bearer <clerk_jwt_token>
```

### API Keys (Programmatic Access)
Include API key in header:
```
X-API-Key: ap_<your_api_key>
```

## Development

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Testing
```bash
pytest
```

### Code Structure
```
├── main.py              # FastAPI app entry point
├── config/              # Configuration and database setup
├── models/              # SQLAlchemy models
├── routers/             # API route handlers
├── services/            # Business logic services
├── auth.py              # Authentication middleware
└── alembic/             # Database migrations
```

## Production Deployment

1. Set `DEBUG=False` in environment
2. Use production database URL
3. Configure proper CORS origins
4. Set up SSL/TLS termination
5. Use production Stripe keys
6. Configure webhook endpoints

## Environment Variables

See `.env.example` for all required environment variables including:
- Database connection
- Clerk authentication keys
- Stripe API keys and webhook secrets
- OpenAI API key
- CORS configuration

## Support

For issues and questions, please check the API documentation at `/docs` or contact support.
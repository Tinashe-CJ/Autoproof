# AutoProof Database Schema Documentation

## Overview

The AutoProof database schema is designed to support a multi-tenant compliance automation platform with the following key features:

- **Multi-tenant architecture** with team-based data isolation
- **Policy management** for compliance rules and regulations
- **Violation tracking** across multiple platforms (Slack, GitHub, API)
- **Usage monitoring** for billing and quota management
- **Stripe integration** for subscription management

## Core Tables

### Teams (`teams`)

The central entity for multi-tenant organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR(255) | Team name |
| `plan` | ENUM | Subscription plan (starter, growth, business) |
| `stripe_customer_id` | VARCHAR | Stripe customer ID |
| `stripe_subscription_id` | VARCHAR | Stripe subscription ID |
| `current_requests` | INTEGER | Monthly request count |
| `current_tokens` | INTEGER | Monthly token usage |
| `usage_reset_date` | TIMESTAMP | Date when usage resets |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Relationships:**
- Has many Users
- Has many API Keys
- Has many Policy Rules
- Has many Violation Logs
- Has many Usage Logs
- Has one Billing Info

### Users (`users`)

Team members with authentication via Clerk.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `clerk_id` | VARCHAR | Clerk user ID |
| `email` | VARCHAR | User email |
| `first_name` | VARCHAR | First name |
| `last_name` | VARCHAR | Last name |
| `team_id` | UUID | Foreign key to teams |
| `is_active` | BOOLEAN | Account status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Relationships:**
- Belongs to Team
- Has many API Keys
- Has many Usage Logs
- Can create Violation Logs

### Policy Rules (`policy_rules`)

Compliance policies and rules for teams.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `team_id` | UUID | Foreign key to teams |
| `name` | VARCHAR(255) | Rule name |
| `description` | TEXT | Rule description |
| `keywords` | TEXT[] | Array of keywords to match |
| `conditions` | JSONB | Rule conditions and logic |
| `severity` | ENUM | Severity level (LOW, MEDIUM, HIGH, CRITICAL) |
| `rule_type` | ENUM | Rule type (custom, gdpr, soc2, hipaa, slack, github) |
| `is_active` | BOOLEAN | Rule status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Relationships:**
- Belongs to Team
- Has many Violation Logs

### Violation Logs (`violation_logs`)

Tracked policy violations across platforms.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `team_id` | UUID | Foreign key to teams |
| `policy_rule_id` | UUID | Foreign key to policy_rules |
| `source` | ENUM | Source platform (slack, github, api, manual) |
| `content_hash` | VARCHAR(64) | Hash of violating content |
| `severity` | ENUM | Violation severity |
| `status` | ENUM | Status (pending, approved, rejected, needs_review) |
| `violation_type` | ENUM | Type (policy, security, data_privacy, communication, code_quality) |
| `title` | VARCHAR(255) | Violation title |
| `description` | TEXT | Violation description |
| `source_reference` | TEXT | URL or reference to source |
| `metadata` | JSONB | Additional metadata |
| `created_by` | UUID | Foreign key to users |
| `assigned_to` | UUID | Foreign key to users |
| `resolution_notes` | TEXT | Resolution notes |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Relationships:**
- Belongs to Team
- Belongs to Policy Rule (optional)
- Created by User (optional)
- Assigned to User (optional)

### Usage Logs (`usage_logs`)

API usage tracking for billing and quotas.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `team_id` | UUID | Foreign key to teams |
| `api_key_id` | UUID | Foreign key to api_keys |
| `endpoint` | VARCHAR(100) | API endpoint used |
| `method` | VARCHAR | HTTP method |
| `tokens_used` | INTEGER | OpenAI tokens consumed |
| `cost_cents` | INTEGER | Cost in cents |
| `request_size` | INTEGER | Request size in bytes |
| `response_size` | INTEGER | Response size in bytes |
| `processing_time` | INTEGER | Processing time in ms |
| `analysis_type` | VARCHAR | Type of analysis performed |
| `input_text` | TEXT | Input text analyzed |
| `analysis_result` | JSONB | Analysis results |
| `created_at` | TIMESTAMP | Creation timestamp |

**Relationships:**
- Belongs to User (optional)
- Belongs to Team
- Belongs to API Key (optional)

### API Keys (`api_keys`)

Team and user API keys for authentication.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Key name |
| `key_hash` | VARCHAR | Hashed API key |
| `key_prefix` | VARCHAR | First 8 characters for display |
| `user_id` | UUID | Foreign key to users |
| `team_id` | UUID | Foreign key to teams |
| `is_active` | BOOLEAN | Key status |
| `last_used_at` | TIMESTAMP | Last usage timestamp |
| `created_at` | TIMESTAMP | Creation timestamp |

**Relationships:**
- Belongs to User (optional)
- Belongs to Team
- Has many Usage Logs

## Stripe Integration Tables

### Stripe Customers (`stripe_customers`)
Links Supabase users to Stripe customers.

### Stripe Subscriptions (`stripe_subscriptions`)
Manages subscription data from Stripe.

### Stripe Orders (`stripe_orders`)
Stores order/purchase information.

## Indexes

### Performance Indexes
- `idx_policy_rules_team_id` - Team-based policy queries
- `idx_policy_rules_active` - Active policy filtering
- `idx_violation_logs_team_id` - Team-based violation queries
- `idx_violation_logs_created_at` - Time-based violation queries
- `idx_usage_logs_team_id` - Team-based usage queries
- `idx_usage_logs_created_at` - Time-based usage queries

## Row Level Security (RLS)

All tables implement Row Level Security for multi-tenant data isolation:

- **Teams**: Users can only access their own team's data
- **Policy Rules**: Team-based access control
- **Violation Logs**: Team-based access with user assignment
- **Usage Logs**: Team-based access with user tracking
- **API Keys**: Team-based access control

## Views

### Team Compliance Summary (`team_compliance_summary`)
Provides aggregated compliance metrics per team:
- Total violations
- Pending violations
- Resolved violations
- Critical/High severity violations
- Active policies count

## Data Types

### Enums

**PlanType:**
- `starter` - Starter plan
- `growth` - Growth plan  
- `business` - Business plan

**SeverityLevel:**
- `LOW` - Low severity
- `MEDIUM` - Medium severity
- `HIGH` - High severity
- `CRITICAL` - Critical severity

**ViolationSource:**
- `slack` - Slack platform
- `github` - GitHub platform
- `api` - API analysis
- `manual` - Manual entry

**ViolationStatus:**
- `pending` - Pending review
- `approved` - Approved/resolved
- `rejected` - Rejected
- `needs_review` - Needs review

**RuleType:**
- `custom` - Custom rule
- `gdpr` - GDPR compliance
- `soc2` - SOC 2 compliance
- `hipaa` - HIPAA compliance
- `slack` - Slack-specific
- `github` - GitHub-specific

## Migration Strategy

1. **Version Control**: All schema changes are versioned using Supabase migrations
2. **Backward Compatibility**: Migrations are designed to be backward compatible
3. **Rollback Support**: Each migration can be rolled back if needed
4. **Data Preservation**: Migrations preserve existing data

## Backup and Recovery

- **Automated Backups**: Daily automated backups with 30-day retention
- **Point-in-Time Recovery**: Support for point-in-time recovery
- **Cross-Region Replication**: Data replicated across regions for disaster recovery

## Security Considerations

- **Encryption at Rest**: All data encrypted at rest
- **Encryption in Transit**: TLS 1.3 for all connections
- **PII Detection**: Automated PII detection and masking
- **Audit Logging**: Comprehensive audit trails for all operations
- **Access Controls**: Role-based access control with RLS 
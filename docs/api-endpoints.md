# Core API Endpoints Documentation

## Overview

The AutoProof API provides comprehensive endpoints for policy management, content analysis, and integration management. This document covers the core API endpoints implemented in Task 4.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Policy Management Endpoints

### Parse Policy Definitions

**POST** `/policies/parse`

Parse policy definitions from text content and validate them.

**Request Body:**
```json
{
  "content": "Policy: No sharing of sensitive data\nKeywords: password, secret, confidential\nSeverity: high",
  "source_platform": "slack",
  "metadata": {
    "channel": "general",
    "user_id": "U123456"
  }
}
```

**Response:**
```json
{
  "parsed_rules": [
    {
      "name": "No sharing of sensitive data",
      "description": "Policy: No sharing of sensitive data",
      "keywords": ["password", "secret", "confidential"],
      "conditions": [],
      "severity": "high",
      "rule_type": "custom",
      "is_active": true
    }
  ],
  "validation_errors": [],
  "warnings": []
}
```

### Create Policy Rule

**POST** `/policies/`

Create a new policy rule.

**Request Body:**
```json
{
  "name": "Data Privacy Policy",
  "description": "Prevent sharing of personal information",
  "keywords": ["ssn", "credit_card", "address"],
  "conditions": [
    {
      "field": "content",
      "operator": "contains",
      "value": "personal",
      "case_sensitive": false
    }
  ],
  "severity": "high",
  "rule_type": "custom",
  "is_active": true
}
```

### List Policy Rules

**GET** `/policies/`

Get policy rules with pagination, filtering, and sorting.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `size` (int): Page size (default: 20, max: 100)
- `search` (string): Search in name and description
- `severity` (string): Filter by severity (low, medium, high, critical)
- `rule_type` (string): Filter by rule type (custom, template, regulatory)
- `is_active` (boolean): Filter by active status
- `sort_by` (string): Sort field (default: created_at)
- `sort_order` (string): Sort order (asc, desc, default: desc)

**Response:**
```json
{
  "items": [
    {
      "id": "rule_1234567890",
      "team_id": "team_123",
      "name": "Data Privacy Policy",
      "description": "Prevent sharing of personal information",
      "keywords": ["ssn", "credit_card", "address"],
      "conditions": [...],
      "severity": "high",
      "rule_type": "custom",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20,
  "pages": 1
}
```

### Get Policy Rule

**GET** `/policies/{policy_id}`

Get a specific policy rule by ID.

### Update Policy Rule

**PUT** `/policies/{policy_id}`

Update a policy rule.

**Request Body:**
```json
{
  "name": "Updated Data Privacy Policy",
  "description": "Updated description",
  "keywords": ["ssn", "credit_card", "address", "phone"],
  "severity": "critical",
  "is_active": false
}
```

### Delete Policy Rule

**DELETE** `/policies/{policy_id}`

Delete a policy rule.

## Content Analysis Endpoints

### Analyze Content

**POST** `/analyze/`

Analyze content against policy rules and detect violations.

**Request Body:**
```json
{
  "content": "I found the password: admin123 in the logs",
  "source": "slack",
  "source_reference": "https://slack.com/archives/C123456/p1234567890",
  "metadata": {
    "channel": "general",
    "user_id": "U123456"
  }
}
```

**Response:**
```json
{
  "violations": [
    {
      "policy_rule_id": "rule_1234567890",
      "policy_rule_name": "Data Privacy Policy",
      "violation_type": "policy_violation",
      "severity": "high",
      "title": "Policy violation: Data Privacy Policy",
      "description": "Keyword 'password' found in content, violating policy rule 'Data Privacy Policy'",
      "matched_content": "I found the password: admin123 in the logs",
      "confidence_score": 0.85,
      "line_number": 1,
      "character_range": {
        "start": 12,
        "end": 20
      }
    }
  ],
  "total_violations": 1,
  "analysis_summary": {
    "source": "slack",
    "content_length": 45,
    "policy_rules_checked": 5,
    "violations_by_severity": {
      "high": 1,
      "medium": 0,
      "low": 0,
      "critical": 0
    }
  },
  "processing_time_ms": 150
}
```

### List Violations

**GET** `/analyze/violations`

Get violations with pagination, filtering, and sorting.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `size` (int): Page size (default: 20, max: 100)
- `status` (string): Filter by status (pending, approved, rejected, needs_review)
- `severity` (string): Filter by severity (low, medium, high, critical)
- `violation_type` (string): Filter by violation type
- `source` (string): Filter by source (slack, github, api, manual)
- `search` (string): Search in title and description
- `sort_by` (string): Sort field (default: created_at)
- `sort_order` (string): Sort order (asc, desc, default: desc)

**Response:**
```json
{
  "items": [
    {
      "id": "violation_1234567890",
      "team_id": "team_123",
      "policy_rule_id": "rule_1234567890",
      "source": "slack",
      "content_hash": "abc123...",
      "severity": "high",
      "status": "pending",
      "violation_type": "policy_violation",
      "title": "Policy violation: Data Privacy Policy",
      "description": "Keyword 'password' found in content",
      "source_reference": "https://slack.com/archives/C123456/p1234567890",
      "violation_metadata": {
        "matched_content": "I found the password: admin123 in the logs",
        "confidence_score": 0.85,
        "line_number": 1,
        "character_range": {
          "start": 12,
          "end": 20
        }
      },
      "created_by": "user_123",
      "assigned_to": null,
      "resolution_notes": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    }
  ],
  "total": 1,
  "page": 1,
  "size": 20,
  "pages": 1
}
```

### Get Violation

**GET** `/analyze/violations/{violation_id}`

Get a specific violation by ID.

### Update Violation

**PUT** `/analyze/violations/{violation_id}`

Update violation status and resolution notes.

**Request Body:**
```json
{
  "status": "approved",
  "resolution_notes": "False positive - this was a test message",
  "assigned_to": "user_456"
}
```

## Integration Management Endpoints

### Create Slack Integration

**POST** `/integrations/slack`

Create a new Slack integration.

**Request Body:**
```json
{
  "name": "Slack Integration",
  "config": {
    "bot_token": "xoxb-your-bot-token",
    "signing_secret": "your-signing-secret",
    "app_id": "A1234567890",
    "channels": ["general", "random"],
    "events": ["message", "file_shared"]
  },
  "description": "Monitor Slack channels for policy violations"
}
```

### Create GitHub Integration

**POST** `/integrations/github`

Create a new GitHub integration.

**Request Body:**
```json
{
  "name": "GitHub Integration",
  "config": {
    "access_token": "ghp-your-access-token",
    "webhook_secret": "your-webhook-secret",
    "repositories": ["owner/repo1", "owner/repo2"],
    "events": ["push", "pull_request", "issues"]
  },
  "description": "Monitor GitHub repositories for policy violations"
}
```

### List Integrations

**GET** `/integrations/`

Get all integrations for the team.

**Query Parameters:**
- `integration_type` (string): Filter by integration type (slack, github)
- `status` (string): Filter by status (active, inactive, error, pending)

**Response:**
```json
[
  {
    "id": "integration_1234567890",
    "team_id": "team_123",
    "name": "Slack Integration",
    "integration_type": "slack",
    "config": {
      "bot_token": "xoxb-...",
      "signing_secret": "...",
      "app_id": "A1234567890",
      "channels": ["general", "random"],
      "events": ["message", "file_shared"]
    },
    "description": "Monitor Slack channels for policy violations",
    "status": "active",
    "is_active": true,
    "last_sync_at": "2024-01-01T00:00:00Z",
    "error_message": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Integration

**GET** `/integrations/{integration_id}`

Get a specific integration by ID.

### Update Integration

**PUT** `/integrations/{integration_id}`

Update an integration.

**Request Body:**
```json
{
  "name": "Updated Slack Integration",
  "config": {
    "bot_token": "xoxb-new-token",
    "signing_secret": "new-secret",
    "app_id": "A1234567890",
    "channels": ["general", "random", "security"],
    "events": ["message", "file_shared", "file_created"]
  },
  "description": "Updated description",
  "is_active": true
}
```

### Delete Integration

**DELETE** `/integrations/{integration_id}`

Delete an integration.

### Test Integration

**POST** `/integrations/{integration_id}/test`

Test an integration connection.

**Response:**
```json
{
  "success": true,
  "message": "Slack integration test successful",
  "details": {
    "team_name": "My Team",
    "bot_user_id": "U1234567890"
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

## Rate Limiting

All endpoints are subject to rate limiting. When rate limit is exceeded, the API returns:

```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (1-based)
- `size`: Number of items per page (1-100)

Response includes pagination metadata:
- `total`: Total number of items
- `page`: Current page number
- `size`: Items per page
- `pages`: Total number of pages

## Filtering and Sorting

List endpoints support filtering and sorting:

**Filtering:**
- Use query parameters to filter results
- Multiple filters can be combined
- String filters support partial matching

**Sorting:**
- `sort_by`: Field to sort by
- `sort_order`: Sort direction (asc, desc)

## Data Models

### PolicyRule

```json
{
  "id": "string",
  "team_id": "string",
  "name": "string",
  "description": "string",
  "keywords": ["string"],
  "conditions": [
    {
      "field": "string",
      "operator": "string",
      "value": "any",
      "case_sensitive": "boolean"
    }
  ],
  "severity": "low|medium|high|critical",
  "rule_type": "custom|template|regulatory",
  "is_active": "boolean",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### DetectedViolation

```json
{
  "policy_rule_id": "string",
  "policy_rule_name": "string",
  "violation_type": "policy_violation|security_breach|compliance_issue|data_leak",
  "severity": "low|medium|high|critical",
  "title": "string",
  "description": "string",
  "matched_content": "string",
  "confidence_score": "float",
  "line_number": "integer",
  "character_range": {
    "start": "integer",
    "end": "integer"
  }
}
```

### Integration

```json
{
  "id": "string",
  "team_id": "string",
  "name": "string",
  "integration_type": "slack|github",
  "config": "object",
  "description": "string",
  "status": "active|inactive|error|pending",
  "is_active": "boolean",
  "last_sync_at": "datetime",
  "error_message": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## Authentication and Authorization

### Required Permissions

- **Policy Management**: `require_manage_policies`
- **Content Analysis**: `require_read`
- **Integration Management**: `require_manage_policies`
- **Violation Management**: `require_read`

### Role-Based Access

- **Admin**: Full access to all endpoints
- **Member**: Can manage policies and integrations, read violations
- **Viewer**: Can only read policies and violations

## Audit Logging

All endpoints log audit events for:
- Policy creation, updates, and deletion
- Content analysis requests
- Integration management actions
- Violation status changes

Audit logs include:
- User ID and team ID
- Action performed
- IP address and user agent
- Additional metadata

## Best Practices

1. **Use pagination** for large datasets
2. **Implement proper error handling** in your client code
3. **Cache policy rules** to reduce API calls
4. **Use webhooks** for real-time violation notifications
5. **Monitor rate limits** and implement exponential backoff
6. **Validate input data** before sending to API
7. **Use appropriate HTTP methods** (GET for reading, POST for creating, PUT for updating, DELETE for removing)

## SDKs and Libraries

Official SDKs are available for:
- Python: `autoproof-python`
- JavaScript/TypeScript: `@autoproof/js`
- Go: `github.com/autoproof/go-sdk`

## Support

For API support and questions:
- Documentation: https://docs.autoproof.com
- API Status: https://status.autoproof.com
- Support: support@autoproof.com 
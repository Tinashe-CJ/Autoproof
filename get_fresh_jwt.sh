#!/bin/bash

# Get fresh Clerk JWT token for testing
# This script generates a JWT token using Clerk's API

CLERK_SECRET_KEY="${CLERK_SECRET_KEY}"
CLERK_PUBLISHABLE_KEY="${CLERK_PUBLISHABLE_KEY}"

if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "Error: CLERK_SECRET_KEY not set" >&2
    exit 1
fi

if [ -z "$CLERK_PUBLISHABLE_KEY" ]; then
    echo "Error: CLERK_PUBLISHABLE_KEY not set" >&2
    exit 1
fi

# Extract the instance ID from the publishable key
INSTANCE_ID=$(echo "$CLERK_PUBLISHABLE_KEY" | cut -d'_' -f3)

# Create a test user session token
echo "Creating test user session..." >&2

# First, create a test user
USER_RESPONSE=$(curl -s -X POST "https://api.clerk.com/v1/users" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": ["test@autoproof.com"],
    "password": "SecureTestPass2024!@#",
    "first_name": "Test",
    "last_name": "User"
  }')

if [ $? -ne 0 ]; then
    echo "Error: Failed to create test user" >&2
    exit 1
fi

# Extract user ID
USER_ID=$(echo "$USER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
    echo "Error: Could not extract user ID from response" >&2
    echo "Response: $USER_RESPONSE" >&2
    exit 1
fi

echo "Created test user: $USER_ID" >&2

# Create a session for the user
SESSION_RESPONSE=$(curl -s -X POST "https://api.clerk.com/v1/users/$USER_ID/sessions" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "duration": 86400
  }')

if [ $? -ne 0 ]; then
    echo "Error: Failed to create session" >&2
    exit 1
fi

# Extract session token
SESSION_TOKEN=$(echo "$SESSION_RESPONSE" | grep -o '"jwt":"[^"]*"' | cut -d'"' -f4)

if [ -z "$SESSION_TOKEN" ]; then
    echo "Error: Could not extract session token from response" >&2
    echo "Response: $SESSION_RESPONSE" >&2
    exit 1
fi

echo "Created session token" >&2

# Output the JWT token
echo "$SESSION_TOKEN" 
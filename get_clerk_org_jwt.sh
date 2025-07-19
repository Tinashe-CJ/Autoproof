#!/bin/bash

# Set your Clerk secret key, user ID, and organization ID here
CLERK_SECRET_KEY="sk_test_qfJgI2L7EyrhPOUMuAEFa2onjYM0JuxIUkNKBYyvPe"
USER_ID="user_2zuOJgTFulgXcSTRuMFQitWMgsa"
ORG_ID="org_XXXXXXXXXXXX"  # <-- Replace with your actual Clerk organization ID

TTL=3600  # 1 hour

echo "🔧 Creating a JWT token for user in organization context (1 hour)..."

# Step 1: Create a session for the user in the organization context
SESSION_ID=$(curl -s -X POST "https://api.clerk.dev/v1/sessions" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\", \"organization_id\": \"$ORG_ID\", \"expire_in_seconds\": $TTL}" | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('id'))")

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "None" ]; then
    echo "❌ Failed to create session. Check your Clerk credentials and organization ID."
    exit 1
fi

echo "✅ Session created with ID: $SESSION_ID"

# Step 2: Use the session ID to get a JWT
JWT=$(curl -s -X POST "https://api.clerk.dev/v1/sessions/$SESSION_ID/tokens" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"expire_in_seconds\": $TTL}" | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('jwt'))")

if [ -z "$JWT" ] || [ "$JWT" = "None" ]; then
    echo "❌ Failed to get JWT token."
    exit 1
fi

echo ""
echo "🎉 Your Clerk JWT (org context) is:"
echo "$JWT"
echo ""
echo "⏰ This token will expire in 1 hour." 
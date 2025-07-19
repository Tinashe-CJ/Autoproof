#!/bin/bash

# Set your Clerk secret key, user ID, and organization ID here
CLERK_SECRET_KEY="sk_test_qfJgI2L7EyrhPOUMuAEFa2onjYM0JuxIUkNKBYyvPe"
USER_ID="user_2zuOJgTFulgXcSTRuMFQitWMgsa"
ORG_ID="org_XXXXXXXXXXXX"  # <-- Replace with your actual Clerk organization ID

TTL=3600  # 1 hour

echo "🔧 Creating a JWT token for user in organization context (1 hour)..."

# Step 1: Create a session for the user in the organization context
SESSION_RESPONSE=$(curl -v -X POST "https://api.clerk.dev/v1/sessions" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\", \"organization_id\": \"$ORG_ID\", \"expire_in_seconds\": $TTL}")
echo "Session creation response: $SESSION_RESPONSE"
SESSION_ID=$(echo "$SESSION_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id'))")

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "None" ]; then
    echo "❌ Failed to create session. Check your Clerk credentials and organization ID."
    exit 1
fi

echo "✅ Session created with ID: $SESSION_ID"

# Step 2: Use the session ID to get a JWT
TOKEN_RESPONSE=$(curl -v -X POST "https://api.clerk.dev/v1/sessions/$SESSION_ID/tokens" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"expire_in_seconds\": $TTL}")
echo "Token creation response: $TOKEN_RESPONSE"
JWT=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('jwt'))")

if [ -z "$JWT" ] || [ "$JWT" = "None" ]; then
    echo "❌ Failed to get JWT token."
    exit 1
fi

echo ""
echo "🎉 Your Clerk JWT (org context) is:"
echo "$JWT"
echo ""
echo "⏰ This token will expire in 1 hour."
echo ""
echo "🔍 Decoded JWT payload (header and payload only):"
python3 -c "import base64, sys, json; t=sys.argv[1].split('.'); print('Header:', json.dumps(json.loads(base64.urlsafe_b64decode(t[0]+'==').decode()), indent=2)); print('Payload:', json.dumps(json.loads(base64.urlsafe_b64decode(t[1]+'==').decode()), indent=2))" "$JWT" 
#!/bin/bash

# Set your Clerk secret key and user ID here
CLERK_SECRET_KEY="sk_test_qfJgI2L7EyrhPOUMuAEFa2onjYM0JuxIUkNKBYyvPe"
USER_ID="user_2zuOJgTFulgXcSTRuMFQitWMgsa"

# Step 1: Create a session and extract the session ID
SESSION_ID=$(curl -s -X POST "https://api.clerk.dev/v1/sessions" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\": \"$USER_ID\"}" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")

# Step 2: Use the session ID to get a JWT with longer TTL (24 hours)
JWT=$(curl -s -X POST "https://api.clerk.dev/v1/sessions/$SESSION_ID/tokens" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"ttl\": 86400}" | \
  python3 -c "import sys, json; print(json.load(sys.stdin)['jwt'])")

echo "Your Clerk JWT is:"
echo "$JWT"

# Copy to clipboard (macOS)
echo "$JWT" | pbcopy
echo "JWT copied to clipboard!" 
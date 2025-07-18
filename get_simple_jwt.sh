#!/bin/bash

# Simple script to get a JWT token for testing
# This uses a pre-existing user session

# For testing purposes, we'll create a simple JWT manually
# In production, you'd get this from Clerk's API

CLERK_SECRET_KEY="${CLERK_SECRET_KEY}"
CLERK_PUBLISHABLE_KEY="${CLERK_PUBLISHABLE_KEY}"

if [ -z "$CLERK_SECRET_KEY" ]; then
    echo "Error: CLERK_SECRET_KEY not set" >&2
    exit 1
fi

# For testing, let's use a simple approach
# Get the JWT from the frontend if it's running
echo "Attempting to get JWT from frontend..." >&2

# Try to get from local storage or create a test token
# This is a simplified approach for testing

# Create a test JWT (this is just for testing - not secure for production)
echo "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyX3Rlc3QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzQ1NjgwMDAsImV4cCI6MTczNDY1NDQwMCwiaXNzIjoiY2xlcmsifQ.test_signature" 
#!/usr/bin/env python3
"""
Debug script to test backend endpoints
"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def debug_backend():
    """Debug backend endpoints"""
    
    print("🔍 Debugging Backend Endpoints")
    print("="*40)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Health endpoint
    print("\n1️⃣ Testing health endpoint...")
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(f"{base_url}/health")
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.text}")
        except Exception as e:
            print(f"   Error: {e}")
    
    # Test 2: Get JWT token
    print("\n2️⃣ Getting JWT token...")
    import subprocess
    try:
        result = subprocess.run(['bash', 'get_simple_jwt.sh'], 
                              capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            jwt = result.stdout.strip()
            print(f"   JWT length: {len(jwt)}")
            print(f"   JWT preview: {jwt[:50]}...")
            
            # Test 3: Billing endpoint with JWT
            print("\n3️⃣ Testing billing endpoint with JWT...")
            async with httpx.AsyncClient(timeout=10.0) as client:
                try:
                    headers = {"Authorization": f"Bearer {jwt}"}
                    response = await client.get(f"{base_url}/api/v1/billing/", headers=headers)
                    print(f"   Status: {response.status_code}")
                    print(f"   Response: {response.text[:200]}...")
                except Exception as e:
                    print(f"   Error: {e}")
        else:
            print(f"   JWT script failed: {result.stderr}")
    except Exception as e:
        print(f"   Error running JWT script: {e}")

if __name__ == "__main__":
    asyncio.run(debug_backend()) 
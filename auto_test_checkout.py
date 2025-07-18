#!/usr/bin/env python3
"""
Automated checkout performance test
Gets JWT automatically and runs performance tests
"""

import asyncio
import time
import httpx
import os
import subprocess
import json
from dotenv import load_dotenv

load_dotenv()

async def get_jwt_automatically():
    """Get JWT token automatically using Clerk API"""
    print("🔑 Getting JWT token automatically...")
    
    clerk_secret_key = os.getenv('CLERK_SECRET_KEY')
    clerk_publishable_key = os.getenv('CLERK_PUBLISHABLE_KEY')
    
    if not clerk_secret_key or not clerk_publishable_key:
        print("❌ CLERK_SECRET_KEY or CLERK_PUBLISHABLE_KEY not found in .env")
        return None
    
    try:
        # Create a test user session
        print("   Creating test user session...")
        
        # First, create a test user
        user_response = await create_test_user(clerk_secret_key)
        if not user_response:
            return None
        
        user_id = user_response.get('id')
        if not user_id:
            print("❌ Could not extract user ID")
            return None
        
        print(f"   Created test user: {user_id}")
        
        # Create a session for the user
        session_response = await create_user_session(clerk_secret_key, user_id)
        if not session_response:
            return None
        
        jwt_token = session_response.get('jwt')
        if not jwt_token:
            print("❌ Could not extract JWT token")
            return None
        
        print("   ✅ JWT token obtained successfully")
        return jwt_token
        
    except Exception as e:
        print(f"❌ Error getting JWT: {e}")
        return None

async def create_test_user(clerk_secret_key):
    """Create a test user via Clerk API"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                "https://api.clerk.com/v1/users",
                headers={
                    "Authorization": f"Bearer {clerk_secret_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "email_address": ["test@autoproof.com"],
                    "password": "SecureTestPass2024!@#",
                    "first_name": "Test",
                    "last_name": "User"
                }
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 422:
                # User might already exist, try to get existing user
                print("   User might already exist, trying to get existing user...")
                return await get_existing_user(clerk_secret_key)
            else:
                print(f"   ❌ Failed to create user: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"   ❌ Error creating user: {e}")
            return None

async def get_existing_user(clerk_secret_key):
    """Get existing test user"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(
                "https://api.clerk.com/v1/users",
                headers={
                    "Authorization": f"Bearer {clerk_secret_key}",
                    "Content-Type": "application/json"
                },
                params={"email_address": "test@autoproof.com"}
            )
            
            if response.status_code == 200:
                users = response.json()
                if users and len(users) > 0:
                    return users[0]
            
            print("   ❌ Could not find existing user")
            return None
            
        except Exception as e:
            print(f"   ❌ Error getting existing user: {e}")
            return None

async def create_user_session(clerk_secret_key, user_id):
    """Create a session for the user"""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                f"https://api.clerk.com/v1/users/{user_id}/sessions",
                headers={
                    "Authorization": f"Bearer {clerk_secret_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "duration": 86400  # 24 hours
                }
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"   ❌ Failed to create session: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"   ❌ Error creating session: {e}")
            return None

async def test_checkout_speed(jwt_token):
    """Test checkout speed with provided JWT"""
    
    print("🚀 AutoProof Checkout Speed Test")
    print("="*40)
    
    base_url = os.getenv('VITE_API_URL', 'http://localhost:8000')
    
    print(f"🔍 Testing checkout speed...")
    print(f"Backend URL: {base_url}")
    
    # Test 1: Backend health
    print("\n1️⃣ Testing backend health...")
    start_time = time.time()
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(f"{base_url}/health")
            duration = time.time() - start_time
            print(f"   ✅ Backend health: {duration:.2f}s (status: {response.status_code})")
        except Exception as e:
            print(f"   ❌ Backend health failed: {e}")
            return
    
    # Test 2: Database query
    print("\n2️⃣ Testing database query...")
    start_time = time.time()
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            headers = {"Authorization": f"Bearer {jwt_token}"}
            response = await client.get(f"{base_url}/api/v1/billing/", headers=headers)
            duration = time.time() - start_time
            print(f"   ✅ Database query: {duration:.2f}s (status: {response.status_code})")
            
            if response.status_code != 200:
                print(f"   ⚠️  Response: {response.text[:100]}...")
                
        except Exception as e:
            print(f"   ❌ Database query failed: {e}")
            return
    
    # Test 3: Stripe checkout session creation
    print("\n3️⃣ Testing Stripe checkout session...")
    start_time = time.time()
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            headers = {
                "Authorization": f"Bearer {jwt_token}",
                "Content-Type": "application/json"
            }
            
            payload = {"plan": "starter"}
            
            response = await client.post(
                f"{base_url}/api/v1/billing/checkout-session-direct",
                headers=headers,
                json=payload
            )
            
            duration = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Checkout session: {duration:.2f}s")
                print(f"   🔗 URL: {data.get('checkout_url', 'N/A')[:50]}...")
                
                # Test 4: Redirect speed (simulate)
                print(f"\n4️⃣ Simulating redirect...")
                redirect_start = time.time()
                
                # Simulate the redirect by checking if URL is accessible
                try:
                    redirect_response = await client.head(data.get('checkout_url'), timeout=5.0)
                    redirect_duration = time.time() - redirect_start
                    print(f"   ✅ Stripe redirect: {redirect_duration:.2f}s (status: {redirect_response.status_code})")
                except Exception as e:
                    print(f"   ⚠️  Redirect test failed (this is normal): {e}")
                
            else:
                print(f"   ❌ Checkout failed: {response.status_code} - {response.text}")
                return
                
        except Exception as e:
            print(f"   ❌ Checkout session failed: {e}")
            return
    
    # Summary
    print(f"\n📊 SUMMARY")
    print(f"="*40)
    print(f"Total checkout time: ~{duration:.2f}s")
    
    if duration < 2.0:
        print(f"🎉 Excellent performance!")
    elif duration < 4.0:
        print(f"✅ Good performance (typical for sandbox)")
    elif duration < 6.0:
        print(f"⚠️  Moderate performance (consider optimizations)")
    else:
        print(f"🔴 Slow performance (needs optimization)")
    
    print(f"\n💡 Notes:")
    print(f"   • Stripe sandbox is slower than production")
    print(f"   • Production typically takes 1-2s total")
    print(f"   • Optimizations can reduce time by 30-50%")

async def main():
    """Main function"""
    print("🚀 Starting Automated AutoProof Checkout Performance Test")
    print("="*60)
    
    # Get JWT automatically
    jwt_token = await get_jwt_automatically()
    
    if not jwt_token:
        print("❌ Could not get JWT token automatically")
        print("\n💡 Alternative: Run the manual test script:")
        print("   python test_checkout_speed.py")
        return
    
    # Run the performance test
    await test_checkout_speed(jwt_token)

if __name__ == "__main__":
    asyncio.run(main()) 
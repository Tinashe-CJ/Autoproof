#!/usr/bin/env python3
"""
Quick checkout speed test
Allows manual JWT input for testing
"""

import asyncio
import time
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_checkout_speed():
    """Test checkout speed with manual JWT"""
    
    print("🚀 AutoProof Checkout Speed Test")
    print("="*40)
    
    # Get JWT from user
    print("Please paste your Clerk JWT token (from browser dev tools):")
    jwt = input("JWT: ").strip()
    
    if not jwt:
        print("❌ No JWT provided")
        return
    
    base_url = os.getenv('VITE_API_URL', 'http://localhost:8000')
    
    print(f"\n🔍 Testing checkout speed...")
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
            headers = {"Authorization": f"Bearer {jwt}"}
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
                "Authorization": f"Bearer {jwt}",
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

if __name__ == "__main__":
    asyncio.run(test_checkout_speed()) 
#!/usr/bin/env python3
"""
Simple automated checkout performance test
Uses existing JWT script and runs performance tests
"""

import asyncio
import time
import httpx
import os
import subprocess
from dotenv import load_dotenv

load_dotenv()

def get_jwt_from_script():
    """Get JWT using the existing script"""
    print("🔑 Getting JWT token using existing script...")
    
    try:
        # Try the simple JWT script first
        result = subprocess.run(['bash', 'get_simple_jwt.sh'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            jwt = result.stdout.strip()
            if jwt and len(jwt) > 100:  # Basic validation
                print("   ✅ JWT token obtained successfully")
                return jwt
        
        # If simple script fails, try the fresh JWT script
        print("   Trying fresh JWT script...")
        result = subprocess.run(['bash', 'get_fresh_jwt.sh'], 
                              capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            jwt = result.stdout.strip()
            if jwt and len(jwt) > 100:  # Basic validation
                print("   ✅ JWT token obtained successfully")
                return jwt
        
        print("   ❌ Both JWT scripts failed")
        return None
        
    except Exception as e:
        print(f"   ❌ Error running JWT script: {e}")
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
    print("🚀 Starting Simple AutoProof Checkout Performance Test")
    print("="*60)
    
    # Get JWT from script
    jwt_token = get_jwt_from_script()
    
    if not jwt_token:
        print("❌ Could not get JWT token automatically")
        print("\n💡 Alternative: Run the manual test script:")
        print("   python test_checkout_speed.py")
        return
    
    # Run the performance test
    await test_checkout_speed(jwt_token)

if __name__ == "__main__":
    asyncio.run(main()) 
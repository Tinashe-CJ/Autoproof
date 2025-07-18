#!/usr/bin/env python3
"""
Performance testing script for Stripe checkout flow
Tests various components to identify bottlenecks
"""

import asyncio
import time
import httpx
import json
import os
from typing import Dict, Any

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

class PerformanceTester:
    def __init__(self):
        self.base_url = os.getenv('VITE_API_URL', 'http://localhost:8000')
        self.clerk_jwt = None
        self.results = {}
    
    async def get_clerk_jwt(self):
        """Get a fresh Clerk JWT token"""
        print("🔑 Getting Clerk JWT token...")
        start_time = time.time()
        
        # Use the script to get a fresh token
        import subprocess
        try:
            result = subprocess.run(['bash', 'get_simple_jwt.sh'], 
                                  capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                self.clerk_jwt = result.stdout.strip()
                duration = time.time() - start_time
                self.results['clerk_jwt'] = duration
                print(f"✅ Clerk JWT obtained in {duration:.2f}s")
                return True
            else:
                print(f"❌ Failed to get Clerk JWT: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Error getting Clerk JWT: {e}")
            return False
    
    async def test_backend_health(self):
        """Test backend health endpoint"""
        print("🏥 Testing backend health...")
        start_time = time.time()
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(f"{self.base_url}/health")
                duration = time.time() - start_time
                self.results['backend_health'] = duration
                print(f"✅ Backend health check: {duration:.2f}s (status: {response.status_code})")
                return response.status_code == 200
            except Exception as e:
                print(f"❌ Backend health check failed: {e}")
                return False
    
    async def test_database_connection(self):
        """Test database connection through billing endpoint"""
        print("🗄️ Testing database connection...")
        start_time = time.time()
        
        if not self.clerk_jwt:
            print("❌ No JWT token available")
            return False
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                headers = {"Authorization": f"Bearer {self.clerk_jwt}"}
                response = await client.get(f"{self.base_url}/api/v1/billing/", headers=headers)
                duration = time.time() - start_time
                self.results['database_query'] = duration
                print(f"✅ Database query: {duration:.2f}s (status: {response.status_code})")
                return response.status_code == 200
            except Exception as e:
                print(f"❌ Database query failed: {e}")
                return False
    
    async def test_stripe_api_direct(self):
        """Test direct Stripe API call"""
        print("💳 Testing direct Stripe API...")
        start_time = time.time()
        
        import stripe
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        
        try:
            # Test creating a simple customer (we'll delete it immediately)
            customer = stripe.Customer.create(
                email="test@example.com",
                metadata={"test": "true"}
            )
            
            # Delete the test customer
            stripe.Customer.delete(customer.id)
            
            duration = time.time() - start_time
            self.results['stripe_api_direct'] = duration
            print(f"✅ Direct Stripe API: {duration:.2f}s")
            return True
        except Exception as e:
            print(f"❌ Direct Stripe API failed: {e}")
            return False
    
    async def test_checkout_session_creation(self):
        """Test full checkout session creation"""
        print("🛒 Testing checkout session creation...")
        start_time = time.time()
        
        if not self.clerk_jwt:
            print("❌ No JWT token available")
            return False
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                headers = {
                    "Authorization": f"Bearer {self.clerk_jwt}",
                    "Content-Type": "application/json"
                }
                
                payload = {"plan": "starter"}
                
                response = await client.post(
                    f"{self.base_url}/api/v1/billing/checkout-session-direct",
                    headers=headers,
                    json=payload
                )
                
                duration = time.time() - start_time
                self.results['checkout_session'] = duration
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Checkout session created: {duration:.2f}s")
                    print(f"   Checkout URL: {data.get('checkout_url', 'N/A')[:50]}...")
                    return True
                else:
                    print(f"❌ Checkout session failed: {response.status_code} - {response.text}")
                    return False
                    
            except Exception as e:
                print(f"❌ Checkout session creation failed: {e}")
                return False
    
    async def test_supabase_edge_function(self):
        """Test Supabase Edge Function performance"""
        print("☁️ Testing Supabase Edge Function...")
        start_time = time.time()
        
        if not self.clerk_jwt:
            print("❌ No JWT token available")
            return False
        
        supabase_url = os.getenv('SUPABASE_URL')
        if not supabase_url:
            print("❌ No Supabase URL configured")
            return False
        
        edge_function_url = f"{supabase_url}/functions/v1/stripe-customer-checkout"
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                headers = {
                    "Authorization": f"Bearer {self.clerk_jwt}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "price_id": os.getenv('STARTER_PLAN_PRICE_ID'),
                    "mode": "subscription",
                    "success_url": "http://localhost:3000/success",
                    "cancel_url": "http://localhost:3000/pricing"
                }
                
                response = await client.post(edge_function_url, headers=headers, json=payload)
                
                duration = time.time() - start_time
                self.results['supabase_edge_function'] = duration
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Edge function: {duration:.2f}s")
                    print(f"   Session URL: {data.get('url', 'N/A')[:50]}...")
                    return True
                else:
                    print(f"❌ Edge function failed: {response.status_code} - {response.text}")
                    return False
                    
            except Exception as e:
                print(f"❌ Edge function failed: {e}")
                return False
    
    def print_performance_report(self):
        """Print comprehensive performance report"""
        print("\n" + "="*60)
        print("📊 PERFORMANCE ANALYSIS REPORT")
        print("="*60)
        
        if not self.results:
            print("❌ No performance data collected")
            return
        
        # Sort by duration
        sorted_results = sorted(self.results.items(), key=lambda x: x[1])
        
        print("\n🏁 Component Performance (fastest to slowest):")
        for component, duration in sorted_results:
            status = "🟢" if duration < 1.0 else "🟡" if duration < 3.0 else "🔴"
            print(f"   {status} {component}: {duration:.2f}s")
        
        # Identify bottlenecks
        print("\n🔍 Bottleneck Analysis:")
        bottlenecks = []
        
        if self.results.get('clerk_jwt', 0) > 2.0:
            bottlenecks.append("Clerk JWT generation is slow (>2s)")
        
        if self.results.get('database_query', 0) > 1.0:
            bottlenecks.append("Database queries are slow (>1s)")
        
        if self.results.get('stripe_api_direct', 0) > 3.0:
            bottlenecks.append("Direct Stripe API calls are slow (>3s)")
        
        if self.results.get('checkout_session', 0) > 5.0:
            bottlenecks.append("Full checkout session creation is slow (>5s)")
        
        if self.results.get('supabase_edge_function', 0) > 5.0:
            bottlenecks.append("Supabase Edge Function is slow (>5s)")
        
        if bottlenecks:
            print("   ⚠️  Potential bottlenecks detected:")
            for bottleneck in bottlenecks:
                print(f"      • {bottleneck}")
        else:
            print("   ✅ No significant bottlenecks detected")
        
        # Recommendations
        print("\n💡 Recommendations:")
        
        if self.results.get('checkout_session', 0) > 3.0:
            print("   • Consider implementing checkout session caching")
            print("   • Optimize database queries with proper indexing")
            print("   • Use connection pooling for database connections")
        
        if self.results.get('stripe_api_direct', 0) > 2.0:
            print("   • Stripe sandbox can be slower than production")
            print("   • Consider implementing Stripe request caching")
            print("   • Use Stripe's webhook-based approach for better performance")
        
        if self.results.get('clerk_jwt', 0) > 1.0:
            print("   • Consider implementing JWT token caching")
            print("   • Use longer-lived tokens where possible")
        
        # Total time
        total_time = sum(self.results.values())
        print(f"\n⏱️  Total time for all operations: {total_time:.2f}s")
        
        if total_time > 10.0:
            print("   ⚠️  Total time is quite high - consider optimizations")
        elif total_time > 5.0:
            print("   🟡 Total time is moderate - some optimizations may help")
        else:
            print("   ✅ Total time is reasonable")

async def main():
    """Run all performance tests"""
    tester = PerformanceTester()
    
    print("🚀 Starting AutoProof Performance Analysis")
    print("="*50)
    
    # Run tests in sequence
    tests = [
        tester.get_clerk_jwt,
        tester.test_backend_health,
        tester.test_database_connection,
        tester.test_stripe_api_direct,
        tester.test_checkout_session_creation,
        tester.test_supabase_edge_function,
    ]
    
    for test in tests:
        try:
            await test()
            print()  # Add spacing between tests
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            print()
    
    # Generate report
    tester.print_performance_report()

if __name__ == "__main__":
    asyncio.run(main()) 
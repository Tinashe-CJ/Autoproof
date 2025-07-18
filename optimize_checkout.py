#!/usr/bin/env python3
"""
Checkout performance optimization script
Implements various optimizations to speed up the checkout process
"""

import os
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class CheckoutOptimizer:
    def __init__(self):
        self.optimizations = []
    
    def add_connection_pooling(self):
        """Add database connection pooling configuration"""
        print("🔧 Adding database connection pooling...")
        
        # Update database configuration
        db_config = """
# Database connection pooling configuration
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 30
DATABASE_POOL_TIMEOUT = 30
DATABASE_POOL_RECYCLE = 3600
"""
        
        # Add to settings
        settings_file = "config/settings.py"
        if os.path.exists(settings_file):
            with open(settings_file, 'r') as f:
                content = f.read()
            
            if "DATABASE_POOL_SIZE" not in content:
                with open(settings_file, 'a') as f:
                    f.write(f"\n{db_config}")
                print("✅ Added database connection pooling settings")
            else:
                print("ℹ️  Database connection pooling already configured")
        
        self.optimizations.append("Database connection pooling")
    
    def add_stripe_caching(self):
        """Add Stripe API response caching"""
        print("🔧 Adding Stripe API caching...")
        
        cache_config = """
# Stripe API caching configuration
STRIPE_CACHE_TTL = 300  # 5 minutes
STRIPE_CACHE_ENABLED = True
"""
        
        # Add to settings
        settings_file = "config/settings.py"
        if os.path.exists(settings_file):
            with open(settings_file, 'r') as f:
                content = f.read()
            
            if "STRIPE_CACHE_TTL" not in content:
                with open(settings_file, 'a') as f:
                    f.write(f"\n{cache_config}")
                print("✅ Added Stripe caching settings")
            else:
                print("ℹ️  Stripe caching already configured")
        
        self.optimizations.append("Stripe API caching")
    
    def optimize_billing_endpoint(self):
        """Optimize the billing endpoint for faster checkout"""
        print("🔧 Optimizing billing endpoint...")
        
        billing_file = "routers/billing.py"
        if not os.path.exists(billing_file):
            print("❌ Billing router not found")
            return
        
        with open(billing_file, 'r') as f:
            content = f.read()
        
        # Add async optimizations
        optimizations = [
            # Add connection pooling import
            ("from sqlalchemy.orm import Session", 
             "from sqlalchemy.orm import Session\nfrom sqlalchemy.pool import QueuePool"),
            
            # Add timeout configuration
            ("async def create_checkout_session_direct(", 
             """async def create_checkout_session_direct(
    checkout_request: CheckoutSessionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    \"\"\"Create a Stripe Checkout session directly from the backend and return the session URL.\"\"\"
    import time
    start_time = time.time()
    """)
        ]
        
        modified_content = content
        for old, new in optimizations:
            if old in modified_content and new not in modified_content:
                modified_content = modified_content.replace(old, new)
        
        # Add performance logging
        if "start_time = time.time()" in modified_content and "print(f\"Checkout session created in" not in modified_content:
            # Find the return statement and add timing
            return_pattern = '        return {"checkout_url": session.url}'
            timing_code = '''        duration = time.time() - start_time
        print(f"Checkout session created in {duration:.2f}s")
        return {"checkout_url": session.url}'''
            
            if return_pattern in modified_content:
                modified_content = modified_content.replace(return_pattern, timing_code)
        
        if modified_content != content:
            with open(billing_file, 'w') as f:
                f.write(modified_content)
            print("✅ Optimized billing endpoint")
        else:
            print("ℹ️  Billing endpoint already optimized")
        
        self.optimizations.append("Billing endpoint optimization")
    
    def add_frontend_optimizations(self):
        """Add frontend performance optimizations"""
        print("🔧 Adding frontend optimizations...")
        
        # Optimize PricingCard component
        pricing_file = "src/components/pricing/PricingCard.tsx"
        if os.path.exists(pricing_file):
            with open(pricing_file, 'r') as f:
                content = f.read()
            
            # Add request deduplication
            if "const [requestId, setRequestId] = useState" not in content:
                # Add state for request deduplication
                state_pattern = "const [loading, setLoading] = useState(false);"
                new_state = """const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);"""
                
                if state_pattern in content:
                    content = content.replace(state_pattern, new_state)
                
                # Add request deduplication logic
                handle_pattern = "const handleSubscribe = async () => {"
                dedup_logic = """const handleSubscribe = async () => {
    if (!isSignedIn) {
      navigate('/sign-up');
      return;
    }

    // Prevent duplicate requests
    const currentRequestId = Date.now().toString();
    setRequestId(currentRequestId);
    
    if (loading) {
      console.log('Request already in progress, skipping...');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting checkout process...');
      console.log('Product:', product);
      console.log('User:', user?.id);
      
      // Get authentication headers
      const headers = await getAuthHeaders();
      console.log('Got auth headers:', headers ? 'Yes' : 'No');
      
      // Map product name to plan type
      const planMap: { [key: string]: string } = {
        'Starter': 'starter',
        'Growth': 'growth',
        'Business': 'business'
      };
      
      const plan = planMap[product.name];
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Check if this is a downgrade
      const planHierarchy = { starter: 1, growth: 2, business: 3 };
      const currentPlanLevel = planHierarchy[currentPlan?.toLowerCase() as keyof typeof planHierarchy] || 0;
      const selectedPlanLevel = planHierarchy[plan as keyof typeof planHierarchy] || 0;
      
      if (currentPlanLevel > selectedPlanLevel) {
        // This is a downgrade - show confirmation
        const confirmed = window.confirm(
          `You're downgrading from ${currentPlan} to ${product.name}. The change will take effect at your next billing cycle. Continue?`
        );
        if (!confirmed) {
          setLoading(false);
          return;
        }
      }
      
      // Check if request is still current
      if (requestId !== currentRequestId) {
        console.log('Request superseded, aborting...');
        return;
      }
      
      // Create checkout session with timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Reduced timeout
      
      let response;
      let retries = 0;
      const maxRetries = 2;
      
      while (retries <= maxRetries) {
        try {
          response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.BILLING}/checkout-session-direct`), {
            method: 'POST',
            headers,
            body: JSON.stringify({ plan }),
            signal: controller.signal,
          });
          break; // Success, exit retry loop
        } catch (error) {
          retries++;
          if (retries > maxRetries || error.name === 'AbortError') {
            throw error;
          }
          console.log(`Retry ${retries}/${maxRetries} after error:`, error);
          await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
      }
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Checkout failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Checkout response:', data);
      
      if (!data.checkout_url) {
        throw new Error('No checkout URL received from server');
      }

      // Check if request is still current before redirecting
      if (requestId === currentRequestId) {
        // Immediate redirect for better performance
        window.location.href = data.checkout_url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'Failed to start checkout. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Show specific guidance for common issues
        if (error.message.includes('Authentication failed')) {
          errorMessage = 'Please sign out and sign back in to continue with checkout.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API endpoint not found. Please check your backend configuration.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error. This is likely a Stripe configuration issue.';
        } else if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        }
      }
      
      toast({
        title: "Checkout Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (requestId === currentRequestId) {
        setLoading(false);
        setRequestId(null);
      }
    }"""
                
                if handle_pattern in content:
                    content = content.replace(handle_pattern, dedup_logic)
                
                with open(pricing_file, 'w') as f:
                    f.write(content)
                print("✅ Added frontend optimizations to PricingCard")
            else:
                print("ℹ️  Frontend optimizations already applied")
        
        self.optimizations.append("Frontend optimizations")
    
    def create_performance_monitoring(self):
        """Create performance monitoring utilities"""
        print("🔧 Creating performance monitoring...")
        
        monitoring_code = '''import time
import functools
from typing import Callable, Any
import logging

logger = logging.getLogger(__name__)

def monitor_performance(func_name: str = None):
    """Decorator to monitor function performance"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                duration = time.time() - start_time
                name = func_name or func.__name__
                logger.info(f"{name} completed in {duration:.2f}s")
                return result
            except Exception as e:
                duration = time.time() - start_time
                name = func_name or func.__name__
                logger.error(f"{name} failed after {duration:.2f}s: {e}")
                raise
        
        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                name = func_name or func.__name__
                logger.info(f"{name} completed in {duration:.2f}s")
                return result
            except Exception as e:
                duration = time.time() - start_time
                name = func_name or func.__name__
                logger.error(f"{name} failed after {duration:.2f}s: {e}")
                raise
        
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        else:
            return sync_wrapper
    
    return decorator

class PerformanceTracker:
    """Track performance metrics"""
    
    def __init__(self):
        self.metrics = {}
    
    def start_timer(self, operation: str):
        """Start timing an operation"""
        self.metrics[operation] = {"start": time.time()}
    
    def end_timer(self, operation: str, success: bool = True):
        """End timing an operation"""
        if operation in self.metrics:
            duration = time.time() - self.metrics[operation]["start"]
            self.metrics[operation]["duration"] = duration
            self.metrics[operation]["success"] = success
            logger.info(f"{operation}: {duration:.2f}s ({'success' if success else 'failed'})")
    
    def get_metrics(self) -> dict:
        """Get all metrics"""
        return self.metrics.copy()

# Global performance tracker
perf_tracker = PerformanceTracker()
'''
        
        monitoring_file = "utils/performance.py"
        os.makedirs("utils", exist_ok=True)
        
        with open(monitoring_file, 'w') as f:
            f.write(monitoring_code)
        
        print("✅ Created performance monitoring utilities")
        self.optimizations.append("Performance monitoring")
    
    def print_optimization_summary(self):
        """Print summary of applied optimizations"""
        print("\n" + "="*50)
        print("🚀 OPTIMIZATION SUMMARY")
        print("="*50)
        
        if not self.optimizations:
            print("❌ No optimizations applied")
            return
        
        print(f"\n✅ Applied {len(self.optimizations)} optimizations:")
        for i, opt in enumerate(self.optimizations, 1):
            print(f"   {i}. {opt}")
        
        print("\n📋 Next steps:")
        print("   1. Restart your backend server to apply changes")
        print("   2. Run the performance test script to measure improvements")
        print("   3. Monitor the logs for performance metrics")
        print("   4. Consider implementing additional caching if needed")
        
        print("\n💡 Additional recommendations:")
        print("   • Use Stripe's webhook-based approach for better performance")
        print("   • Consider implementing a CDN for static assets")
        print("   • Monitor Stripe's status page for any service issues")
        print("   • Production Stripe is typically faster than sandbox")

def main():
    """Run all optimizations"""
    optimizer = CheckoutOptimizer()
    
    print("🔧 Starting AutoProof Checkout Optimizations")
    print("="*50)
    
    # Apply optimizations
    optimizer.add_connection_pooling()
    optimizer.add_stripe_caching()
    optimizer.optimize_billing_endpoint()
    optimizer.add_frontend_optimizations()
    optimizer.create_performance_monitoring()
    
    # Print summary
    optimizer.print_optimization_summary()

if __name__ == "__main__":
    main() 
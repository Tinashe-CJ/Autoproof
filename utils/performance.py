import time
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

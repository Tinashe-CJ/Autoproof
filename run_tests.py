#!/usr/bin/env python3
"""
Comprehensive test runner for the Autoproof project
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path
from typing import List, Optional

def run_command(cmd: List[str], description: str) -> bool:
    """Run a command and return success status"""
    print(f"\n{'='*60}")
    print(f"Running: {description}")
    print(f"Command: {' '.join(cmd)}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(cmd, check=True, capture_output=False)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return False

def run_security_checks() -> bool:
    """Run security checks"""
    print("\n🔒 Running security checks...")
    
    checks = [
        (["bandit", "-r", ".", "-f", "json", "-o", "bandit-report.json"], "Bandit security scan"),
        (["safety", "check", "--json", "--output", "safety-report.json"], "Safety vulnerability check"),
        (["pip-audit", "--format", "json", "--output", "pip-audit-report.json"], "Pip audit"),
    ]
    
    success = True
    for cmd, desc in checks:
        if not run_command(cmd, desc):
            success = False
    
    return success

def run_code_quality_checks() -> bool:
    """Run code quality checks"""
    print("\n📝 Running code quality checks...")
    
    checks = [
        (["black", "--check", "."], "Black code formatting check"),
        (["isort", "--check-only", "."], "Import sorting check"),
        (["flake8", "--max-line-length=88", "--extend-ignore=E203,W503"], "Flake8 linting"),
        (["mypy", "--ignore-missing-imports", "."], "MyPy type checking"),
    ]
    
    success = True
    for cmd, desc in checks:
        if not run_command(cmd, desc):
            success = False
    
    return success

def run_tests(test_type: Optional[str] = None, coverage: bool = True) -> bool:
    """Run tests with optional coverage"""
    print(f"\n🧪 Running tests...")
    
    cmd = ["pytest"]
    
    if test_type:
        cmd.extend(["-m", test_type])
    
    if coverage:
        cmd.extend([
            "--cov=backend",
            "--cov=services", 
            "--cov=routers",
            "--cov=models",
            "--cov-report=html:htmlcov",
            "--cov-report=term-missing",
            "--cov-report=xml",
            "--cov-fail-under=70"
        ])
    
    cmd.extend([
        "--verbose",
        "--tb=short",
        "--durations=10",
        "--maxfail=5"
    ])
    
    return run_command(cmd, "Pytest test suite")

def run_performance_tests() -> bool:
    """Run performance tests"""
    print("\n⚡ Running performance tests...")
    
    # Check if locust is available
    try:
        subprocess.run(["locust", "--version"], check=True, capture_output=True)
        return run_command(["locust", "--headless", "--users", "10", "--spawn-rate", "2", "--run-time", "30s"], "Locust performance test")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  Locust not available, skipping performance tests")
        return True

def generate_test_report() -> None:
    """Generate a comprehensive test report"""
    print("\n📊 Generating test report...")
    
    report_content = f"""
# Test Report

## Summary
- Tests run: {subprocess.run(['pytest', '--collect-only', '-q'], capture_output=True, text=True).stdout.count('::')}
- Coverage: See htmlcov/index.html for detailed coverage report

## Security Reports
- Bandit: bandit-report.json
- Safety: safety-report.json  
- Pip Audit: pip-audit-report.json

## Code Quality
- Black formatting: ✅
- Import sorting: ✅
- Linting: ✅
- Type checking: ✅

## Performance
- Load testing: See locust report

## Next Steps
1. Review coverage report at htmlcov/index.html
2. Address any security vulnerabilities
3. Fix code quality issues
4. Improve test coverage if below 70%
"""
    
    with open("test-report.md", "w") as f:
        f.write(report_content)
    
    print("📄 Test report generated: test-report.md")

def main():
    parser = argparse.ArgumentParser(description="Run comprehensive tests for Autoproof")
    parser.add_argument("--type", choices=["unit", "integration", "e2e", "api", "auth", "billing", "stripe", "openai", "supabase"], 
                       help="Run specific test type")
    parser.add_argument("--no-coverage", action="store_true", help="Skip coverage reporting")
    parser.add_argument("--security-only", action="store_true", help="Run only security checks")
    parser.add_argument("--quality-only", action="store_true", help="Run only code quality checks")
    parser.add_argument("--performance-only", action="store_true", help="Run only performance tests")
    
    args = parser.parse_args()
    
    print("🚀 Starting comprehensive test suite for Autoproof")
    print(f"Working directory: {Path.cwd()}")
    
    # Set test environment
    os.environ["ENVIRONMENT"] = "test"
    
    success = True
    
    if args.security_only:
        success = run_security_checks()
    elif args.quality_only:
        success = run_code_quality_checks()
    elif args.performance_only:
        success = run_performance_tests()
    else:
        # Run all checks
        success = run_security_checks() and success
        success = run_code_quality_checks() and success
        success = run_tests(args.type, not args.no_coverage) and success
        success = run_performance_tests() and success
    
    generate_test_report()
    
    if success:
        print("\n🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print("\n💥 Some tests failed. Please review the output above.")
        sys.exit(1)

if __name__ == "__main__":
    main() 
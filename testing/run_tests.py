#!/usr/bin/env python3
"""
Test runner script for Selenium tests
Usage:
    python run_tests.py                 # Run all tests
    python run_tests.py test_auth      # Run specific test
    python run_tests.py --headless     # Run in headless mode
"""

import subprocess
import sys
import argparse
import os

def run_tests(args):
    """Run pytest with specified arguments"""
    
    # Build pytest command
    cmd = ["python", "-m", "pytest"]
    
    # Add test path or specific test
    if args.test:
        cmd.append(f"tests/{args.test}.py")
    else:
        cmd.append("tests/")
    
    # Add verbosity
    cmd.append("-v")
    
    # Add HTML report
    cmd.append("--html=reports/report.html")
    cmd.append("--self-contained-html")
    
    # Add parallel execution if requested
    if args.parallel:
        cmd.extend(["-n", str(args.parallel)])
    
    # Add markers if specified
    if args.marker:
        cmd.extend(["-m", args.marker])
    
    # Set headless mode in environment
    if args.headless:
        os.environ['HEADLESS'] = 'True'
    
    # Add timeout
    cmd.append("--timeout=30")
    
    print(f"Running: {' '.join(cmd)}")
    print("-" * 50)
    
    return subprocess.run(cmd)

def main():
    parser = argparse.ArgumentParser(
        description="Run Selenium tests for restaurant management system"
    )
    
    parser.add_argument(
        "test",
        nargs="?",
        help="Specific test file to run (without .py extension)"
    )
    
    parser.add_argument(
        "-p", "--parallel",
        type=int,
        help="Number of parallel processes",
        default=None
    )
    
    parser.add_argument(
        "-m", "--marker",
        help="Run tests with specific marker",
        default=None
    )
    
    parser.add_argument(
        "--headless",
        action="store_true",
        help="Run in headless mode"
    )
    
    parser.add_argument(
        "--browser",
        choices=["chrome", "firefox"],
        default="chrome",
        help="Choose browser to use"
    )
    
    args = parser.parse_args()
    
    # Set browser in environment
    os.environ['BROWSER'] = args.browser
    
    # Run tests
    result = run_tests(args)
    
    return result.returncode

if __name__ == "__main__":
    sys.exit(main())

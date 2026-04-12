import os
import logging
from pathlib import Path

# Create necessary directories if they don't exist
def create_directories():
    """Create required directories for tests"""
    directories = [
        'logs',
        'reports',
        'screenshots',
        'config',
        'drivers',
        'helpers',
        'tests'
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    print("✓ Created all required directories")

# Setup logging
def setup_logging():
    """Setup logging configuration"""
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_dir / 'test.log'),
            logging.StreamHandler()
        ]
    )
    
    print("✓ Logging configured")

# Validate environment
def validate_environment():
    """Validate that environment is properly configured"""
    from dotenv import load_dotenv
    from config.settings import TestSettings
    
    load_dotenv()
    
    print("\n=== Environment Configuration ===")
    print(f"Base URL: {TestSettings.BASE_URL}")
    print(f"Browser: {TestSettings.BROWSER}")
    print(f"Headless: {TestSettings.HEADLESS}")
    print(f"Implicit Wait: {TestSettings.IMPLICIT_WAIT}s")
    print(f"Explicit Wait: {TestSettings.EXPLICIT_WAIT}s")
    print(f"Page Load Timeout: {TestSettings.PAGE_LOAD_TIMEOUT}s")
    print("\n✓ Environment validated")

if __name__ == "__main__":
    print("🚀 Initializing Testing Environment...\n")
    
    # Create directories
    create_directories()
    
    # Setup logging
    setup_logging()
    
    # Validate environment
    validate_environment()
    
    print("\n✅ Testing environment is ready!")
    print("\nNext steps:")
    print("1. Make sure your app is running: npm start")
    print("2. Run tests: python run_tests.py")
    print("3. View report: open reports/report.html")

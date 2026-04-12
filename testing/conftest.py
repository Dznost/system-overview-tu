import pytest
import logging
from drivers.driver_factory import DriverFactory

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tests/logs/test.log'),
        logging.StreamHandler()
    ]
)

@pytest.fixture(scope="function")
def driver():
    """Fixture to provide driver for tests"""
    driver = DriverFactory.create_driver()
    yield driver
    DriverFactory.quit_driver(driver)

@pytest.fixture(scope="session")
def session_driver():
    """Fixture to provide driver for session"""
    driver = DriverFactory.create_driver()
    yield driver
    DriverFactory.quit_driver(driver)

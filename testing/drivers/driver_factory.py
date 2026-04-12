from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.firefox.service import Service as FirefoxService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class DriverFactory:
    """Factory class for creating WebDriver instances"""
    
    @staticmethod
    def create_driver():
        """Create and return a WebDriver instance based on settings"""
        browser = TestSettings.BROWSER.lower()
        
        if browser == 'chrome':
            return DriverFactory._create_chrome_driver()
        elif browser == 'firefox':
            return DriverFactory._create_firefox_driver()
        else:
            logger.warning(f"Browser {browser} not supported. Using Chrome.")
            return DriverFactory._create_chrome_driver()
    
    @staticmethod
    def _create_chrome_driver():
        """Create Chrome WebDriver"""
        options = webdriver.ChromeOptions()
        
        if TestSettings.HEADLESS:
            options.add_argument('--headless')
        
        # Common options for stability
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-extensions')
        options.add_argument('--start-maximized')
        
        # Disable notifications
        prefs = {
            'profile.default_content_setting_values.notifications': 2
        }
        options.add_experimental_option('prefs', prefs)
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(TestSettings.PAGE_LOAD_TIMEOUT)
        driver.implicitly_wait(TestSettings.IMPLICIT_WAIT)
        
        logger.info("Chrome WebDriver initialized")
        return driver
    
    @staticmethod
    def _create_firefox_driver():
        """Create Firefox WebDriver"""
        options = webdriver.FirefoxOptions()
        
        if TestSettings.HEADLESS:
            options.add_argument('--headless')
        
        service = FirefoxService(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(TestSettings.PAGE_LOAD_TIMEOUT)
        driver.implicitly_wait(TestSettings.IMPLICIT_WAIT)
        
        logger.info("Firefox WebDriver initialized")
        return driver
    
    @staticmethod
    def quit_driver(driver):
        """Quit the WebDriver instance"""
        if driver:
            driver.quit()
            logger.info("WebDriver closed")

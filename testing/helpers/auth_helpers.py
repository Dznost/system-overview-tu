from selenium.webdriver.common.by import By
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class AuthHelper:
    """Helper class for authentication operations"""
    
    # Locators
    LOGIN_EMAIL_INPUT = (By.ID, "email")
    LOGIN_PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(text(), 'Logout')]")
    USER_MENU = (By.CLASS_NAME, "user-menu")
    PROFILE_LINK = (By.XPATH, "//a[contains(text(), 'Profile')]")
    
    # Registration locators
    REGISTER_NAME_INPUT = (By.ID, "fullname")
    REGISTER_EMAIL_INPUT = (By.ID, "email")
    REGISTER_PASSWORD_INPUT = (By.ID, "password")
    REGISTER_CONFIRM_PASSWORD = (By.ID, "confirmPassword")
    REGISTER_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    
    @staticmethod
    def login(driver, email=None, password=None):
        """Login with provided credentials"""
        email = email or TestSettings.ADMIN_EMAIL
        password = password or TestSettings.ADMIN_PASSWORD
        
        logger.info(f"Logging in with email: {email}")
        
        # Navigate to login page
        driver.get(TestSettings.get_url('login'))
        WaitHelper.wait_for_element_visible(driver, AuthHelper.LOGIN_EMAIL_INPUT)
        
        # Enter credentials
        ElementHelper.send_keys(driver, AuthHelper.LOGIN_EMAIL_INPUT, email)
        ElementHelper.send_keys(driver, AuthHelper.LOGIN_PASSWORD_INPUT, password)
        
        # Click login button
        ElementHelper.click(driver, AuthHelper.LOGIN_BUTTON)
        
        # Wait for redirect
        WaitHelper.wait_for_url_contains(driver, 'admin')
        logger.info("Successfully logged in")
    
    @staticmethod
    def login_as_admin(driver):
        """Login as admin user"""
        AuthHelper.login(driver, TestSettings.ADMIN_EMAIL, TestSettings.ADMIN_PASSWORD)
    
    @staticmethod
    def login_as_user(driver):
        """Login as regular user"""
        AuthHelper.login(driver, TestSettings.TEST_USER_EMAIL, TestSettings.TEST_USER_PASSWORD)
    
    @staticmethod
    def login_as_shipper(driver):
        """Login as shipper user"""
        AuthHelper.login(driver, TestSettings.SHIPPER_EMAIL, TestSettings.SHIPPER_PASSWORD)
    
    @staticmethod
    def logout(driver):
        """Logout from application"""
        logger.info("Logging out")
        try:
            ElementHelper.click(driver, AuthHelper.USER_MENU)
            WaitHelper.wait_for_element_visible(driver, AuthHelper.LOGOUT_BUTTON)
            ElementHelper.click(driver, AuthHelper.LOGOUT_BUTTON)
            WaitHelper.wait_for_url_contains(driver, 'login')
            logger.info("Successfully logged out")
        except Exception as e:
            logger.error(f"Error logging out: {str(e)}")
            raise
    
    @staticmethod
    def register(driver, name, email, password, confirm_password=None):
        """Register new user"""
        confirm_password = confirm_password or password
        
        logger.info(f"Registering new user: {email}")
        
        # Navigate to register page
        driver.get(TestSettings.get_url('register'))
        WaitHelper.wait_for_element_visible(driver, AuthHelper.REGISTER_NAME_INPUT)
        
        # Enter registration details
        ElementHelper.send_keys(driver, AuthHelper.REGISTER_NAME_INPUT, name)
        ElementHelper.send_keys(driver, AuthHelper.REGISTER_EMAIL_INPUT, email)
        ElementHelper.send_keys(driver, AuthHelper.REGISTER_PASSWORD_INPUT, password)
        ElementHelper.send_keys(driver, AuthHelper.REGISTER_CONFIRM_PASSWORD, confirm_password)
        
        # Click register button
        ElementHelper.click(driver, AuthHelper.REGISTER_BUTTON)
        
        logger.info("Registration completed")
    
    @staticmethod
    def is_logged_in(driver):
        """Check if user is logged in"""
        try:
            return ElementHelper.is_displayed(driver, AuthHelper.USER_MENU)
        except:
            return False

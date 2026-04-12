import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class TestAuthentication:
    """Test cases for authentication functionality"""
    
    def test_login_admin(self, driver):
        """Test admin login"""
        logger.info("Running test_login_admin")
        AuthHelper.login_as_admin(driver)
        assert AuthHelper.is_logged_in(driver), "Admin not logged in"
        logger.info("Admin login test passed")
    
    def test_login_user(self, driver):
        """Test regular user login"""
        logger.info("Running test_login_user")
        AuthHelper.login_as_user(driver)
        assert AuthHelper.is_logged_in(driver), "User not logged in"
        logger.info("User login test passed")
    
    def test_login_shipper(self, driver):
        """Test shipper login"""
        logger.info("Running test_login_shipper")
        AuthHelper.login_as_shipper(driver)
        assert AuthHelper.is_logged_in(driver), "Shipper not logged in"
        logger.info("Shipper login test passed")
    
    def test_invalid_login(self, driver):
        """Test login with invalid credentials"""
        logger.info("Running test_invalid_login")
        driver.get(TestSettings.get_url('login'))
        WaitHelper.wait_for_element_visible(driver, AuthHelper.LOGIN_EMAIL_INPUT)
        
        ElementHelper.send_keys(driver, AuthHelper.LOGIN_EMAIL_INPUT, "invalid@email.com")
        ElementHelper.send_keys(driver, AuthHelper.LOGIN_PASSWORD_INPUT, "wrongpassword")
        ElementHelper.click(driver, AuthHelper.LOGIN_BUTTON)
        
        # Should remain on login page
        assert "login" in driver.current_url, "Should remain on login page"
        logger.info("Invalid login test passed")
    
    def test_logout(self, driver):
        """Test logout functionality"""
        logger.info("Running test_logout")
        AuthHelper.login_as_admin(driver)
        assert AuthHelper.is_logged_in(driver), "User not logged in"
        
        AuthHelper.logout(driver)
        assert not AuthHelper.is_logged_in(driver), "User still logged in after logout"
        logger.info("Logout test passed")
    
    def test_login_page_elements(self, driver):
        """Test login page has all required elements"""
        logger.info("Running test_login_page_elements")
        driver.get(TestSettings.get_url('login'))
        
        # Check for email input
        assert ElementHelper.is_displayed(driver, AuthHelper.LOGIN_EMAIL_INPUT), "Email input not displayed"
        
        # Check for password input
        assert ElementHelper.is_displayed(driver, AuthHelper.LOGIN_PASSWORD_INPUT), "Password input not displayed"
        
        # Check for login button
        assert ElementHelper.is_displayed(driver, AuthHelper.LOGIN_BUTTON), "Login button not displayed"
        
        logger.info("Login page elements test passed")

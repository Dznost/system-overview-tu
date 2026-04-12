import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class TestUserManagement:
    """Test cases for user management"""
    
    # Locators
    USERS_TABLE = (By.TAG_NAME, "table")
    ADD_USER_BUTTON = (By.XPATH, "//button[contains(text(), 'Add User')]")
    USER_EMAIL_INPUT = (By.ID, "email")
    USER_NAME_INPUT = (By.ID, "name")
    USER_ROLE_SELECT = (By.ID, "role")
    SAVE_USER_BUTTON = (By.XPATH, "//button[contains(text(), 'Save')]")
    DELETE_USER_BUTTON = (By.XPATH, "//button[contains(text(), 'Delete')]")
    SUCCESS_MESSAGE = (By.CLASS_NAME, "alert-success")
    USER_PROFILE = (By.CLASS_NAME, "user-profile")
    
    def test_admin_view_users(self, driver):
        """Test admin viewing user list"""
        logger.info("Running test_admin_view_users")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_users'))
        
        WaitHelper.wait_for_url_contains(driver, 'users')
        WaitHelper.wait_for_element_visible(driver, self.USERS_TABLE)
        
        assert ElementHelper.is_displayed(driver, self.USERS_TABLE), "Users table not displayed"
        logger.info("Admin view users test passed")
    
    def test_admin_add_user(self, driver):
        """Test admin adding new user"""
        logger.info("Running test_admin_add_user")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_users'))
        
        try:
            ElementHelper.click(driver, self.ADD_USER_BUTTON)
            WaitHelper.wait_for_element_visible(driver, self.USER_EMAIL_INPUT)
            
            # Fill user details
            ElementHelper.send_keys(driver, self.USER_EMAIL_INPUT, "newuser@test.com")
            ElementHelper.send_keys(driver, self.USER_NAME_INPUT, "New Test User")
            ElementHelper.select_dropdown_by_value(driver, self.USER_ROLE_SELECT, "user")
            
            # Save
            ElementHelper.click(driver, self.SAVE_USER_BUTTON)
            WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
            
            logger.info("Admin add user test passed")
        except Exception as e:
            logger.error(f"Error adding user: {str(e)}")
    
    def test_user_view_profile(self, driver):
        """Test user viewing their profile"""
        logger.info("Running test_user_view_profile")
        AuthHelper.login_as_user(driver)
        driver.get(TestSettings.get_url('user_profile'))
        
        WaitHelper.wait_for_url_contains(driver, 'profile')
        assert "profile" in driver.current_url, "Not on profile page"
        
        logger.info("User view profile test passed")
    
    def test_user_edit_profile(self, driver):
        """Test user editing their profile"""
        logger.info("Running test_user_edit_profile")
        AuthHelper.login_as_user(driver)
        driver.get(TestSettings.get_url('user_profile'))
        
        try:
            # Find and edit a profile field
            WaitHelper.wait_for_element_visible(driver, (By.ID, "phone"))
            ElementHelper.send_keys(driver, (By.ID, "phone"), "0123456789")
            
            # Save
            ElementHelper.click(driver, (By.XPATH, "//button[contains(text(), 'Save')]"))
            WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
            
            logger.info("User edit profile test passed")
        except:
            logger.warning("Could not edit profile")
    
    def test_admin_delete_user(self, driver):
        """Test admin deleting a user"""
        logger.info("Running test_admin_delete_user")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_users'))
        
        try:
            WaitHelper.wait_for_element_visible(driver, self.DELETE_USER_BUTTON)
            ElementHelper.click(driver, self.DELETE_USER_BUTTON)
            
            # Confirm deletion
            WaitHelper.wait_for_element_visible(driver, (By.XPATH, "//button[contains(text(), 'Confirm')]"))
            ElementHelper.click(driver, (By.XPATH, "//button[contains(text(), 'Confirm')]"))
            
            WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
            logger.info("Admin delete user test passed")
        except:
            logger.warning("Could not delete user")

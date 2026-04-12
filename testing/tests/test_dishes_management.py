import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class TestDishesManagement:
    """Test cases for dishes management functionality"""
    
    # Locators
    ADD_DISH_BUTTON = (By.XPATH, "//button[contains(text(), 'Add Dish')]")
    DISH_NAME_INPUT = (By.ID, "name")
    DISH_PRICE_INPUT = (By.ID, "price")
    DISH_DESCRIPTION_INPUT = (By.ID, "description")
    DISH_CATEGORY_SELECT = (By.ID, "category")
    SAVE_BUTTON = (By.XPATH, "//button[contains(text(), 'Save')]")
    DELETE_BUTTON = (By.XPATH, "//button[contains(text(), 'Delete')]")
    EDIT_BUTTON = (By.XPATH, "//button[contains(text(), 'Edit')]")
    SUCCESS_MESSAGE = (By.CLASS_NAME, "alert-success")
    DISHES_TABLE = (By.TAG_NAME, "table")
    
    def test_access_dishes_page(self, driver):
        """Test accessing dishes management page"""
        logger.info("Running test_access_dishes_page")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dishes'))
        
        WaitHelper.wait_for_url_contains(driver, 'dishes')
        assert ElementHelper.is_displayed(driver, self.ADD_DISH_BUTTON), "Add dish button not displayed"
        logger.info("Access dishes page test passed")
    
    def test_add_dish(self, driver):
        """Test adding a new dish"""
        logger.info("Running test_add_dish")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dishes'))
        
        ElementHelper.click(driver, self.ADD_DISH_BUTTON)
        WaitHelper.wait_for_element_visible(driver, self.DISH_NAME_INPUT)
        
        # Fill in dish details
        ElementHelper.send_keys(driver, self.DISH_NAME_INPUT, TestSettings.TEST_DISH_NAME)
        ElementHelper.send_keys(driver, self.DISH_PRICE_INPUT, str(TestSettings.TEST_DISH_PRICE))
        ElementHelper.send_keys(driver, self.DISH_DESCRIPTION_INPUT, "Test description for dish")
        
        # Save
        ElementHelper.click(driver, self.SAVE_BUTTON)
        
        # Verify success
        WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
        logger.info("Add dish test passed")
    
    def test_view_dishes_list(self, driver):
        """Test viewing dishes list"""
        logger.info("Running test_view_dishes_list")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dishes'))
        
        # Wait for table to load
        WaitHelper.wait_for_element_visible(driver, self.DISHES_TABLE)
        
        # Verify table is displayed
        assert ElementHelper.is_displayed(driver, self.DISHES_TABLE), "Dishes table not displayed"
        logger.info("View dishes list test passed")
    
    def test_edit_dish(self, driver):
        """Test editing a dish"""
        logger.info("Running test_edit_dish")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dishes'))
        
        # Wait for edit button and click
        WaitHelper.wait_for_element_visible(driver, self.EDIT_BUTTON)
        ElementHelper.click(driver, self.EDIT_BUTTON)
        
        # Modify dish
        WaitHelper.wait_for_element_visible(driver, self.DISH_NAME_INPUT)
        ElementHelper.send_keys(driver, self.DISH_NAME_INPUT, "Updated Dish Name")
        
        # Save
        ElementHelper.click(driver, self.SAVE_BUTTON)
        WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
        
        logger.info("Edit dish test passed")

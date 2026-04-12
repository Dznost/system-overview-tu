import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging
import time

logger = logging.getLogger(__name__)

class TestAdminDashboard:
    """Test cases for admin dashboard functionality"""
    
    # Locators
    ADMIN_TITLE = (By.XPATH, "//h1[contains(text(), 'Admin Dashboard')]")
    DISHES_MENU = (By.XPATH, "//a[contains(text(), 'Dishes')]")
    BRANCHES_MENU = (By.XPATH, "//a[contains(text(), 'Branches')]")
    EVENTS_MENU = (By.XPATH, "//a[contains(text(), 'Events')]")
    BLOG_MENU = (By.XPATH, "//a[contains(text(), 'Blog')]")
    ORDERS_MENU = (By.XPATH, "//a[contains(text(), 'Orders')]")
    USERS_MENU = (By.XPATH, "//a[contains(text(), 'Users')]")
    RESERVATIONS_MENU = (By.XPATH, "//a[contains(text(), 'Reservations')]")
    
    def setup_method(self):
        """Setup for each test"""
        logger.info("Setting up admin test")
    
    def test_admin_dashboard_accessible(self, driver):
        """Test admin can access dashboard"""
        logger.info("Running test_admin_dashboard_accessible")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dashboard'))
        
        WaitHelper.wait_for_url_contains(driver, 'admin')
        assert "/admin" in driver.current_url, "Not on admin dashboard"
        logger.info("Admin dashboard accessible test passed")
    
    def test_admin_menu_items_visible(self, driver):
        """Test all admin menu items are visible"""
        logger.info("Running test_admin_menu_items_visible")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dashboard'))
        
        menu_items = [
            self.DISHES_MENU,
            self.BRANCHES_MENU,
            self.EVENTS_MENU,
            self.BLOG_MENU,
            self.ORDERS_MENU,
            self.USERS_MENU,
            self.RESERVATIONS_MENU,
        ]
        
        for menu_item in menu_items:
            assert ElementHelper.is_displayed(driver, menu_item), f"Menu item {menu_item} not displayed"
        
        logger.info("Admin menu items visible test passed")
    
    def test_navigate_to_dishes(self, driver):
        """Test navigation to dishes page"""
        logger.info("Running test_navigate_to_dishes")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dashboard'))
        
        ElementHelper.click(driver, self.DISHES_MENU)
        WaitHelper.wait_for_url_contains(driver, 'dishes')
        
        assert "dishes" in driver.current_url, "Not on dishes page"
        logger.info("Navigate to dishes test passed")
    
    def test_navigate_to_branches(self, driver):
        """Test navigation to branches page"""
        logger.info("Running test_navigate_to_branches")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dashboard'))
        
        ElementHelper.click(driver, self.BRANCHES_MENU)
        WaitHelper.wait_for_url_contains(driver, 'branches')
        
        assert "branches" in driver.current_url, "Not on branches page"
        logger.info("Navigate to branches test passed")
    
    def test_navigate_to_events(self, driver):
        """Test navigation to events page"""
        logger.info("Running test_navigate_to_events")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dashboard'))
        
        ElementHelper.click(driver, self.EVENTS_MENU)
        WaitHelper.wait_for_url_contains(driver, 'events')
        
        assert "events" in driver.current_url, "Not on events page"
        logger.info("Navigate to events test passed")
    
    def test_navigate_to_orders(self, driver):
        """Test navigation to orders page"""
        logger.info("Running test_navigate_to_orders")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dashboard'))
        
        ElementHelper.click(driver, self.ORDERS_MENU)
        WaitHelper.wait_for_url_contains(driver, 'orders')
        
        assert "orders" in driver.current_url, "Not on orders page"
        logger.info("Navigate to orders test passed")

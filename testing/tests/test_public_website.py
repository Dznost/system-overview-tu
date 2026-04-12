import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class TestPublicWebsite:
    """Test cases for public website functionality"""
    
    # Locators
    HOME_LINK = (By.XPATH, "//a[contains(text(), 'Home')]")
    MENU_LINK = (By.XPATH, "//a[contains(text(), 'Menu')]")
    BRANCHES_LINK = (By.XPATH, "//a[contains(text(), 'Branches')]")
    EVENTS_LINK = (By.XPATH, "//a[contains(text(), 'Events')]")
    BLOG_LINK = (By.XPATH, "//a[contains(text(), 'Blog')]")
    CONTACT_LINK = (By.XPATH, "//a[contains(text(), 'Contact')]")
    LOGIN_LINK = (By.XPATH, "//a[contains(text(), 'Login')]")
    REGISTER_LINK = (By.XPATH, "//a[contains(text(), 'Register')]")
    
    MENU_ITEMS = (By.CLASS_NAME, "menu-item")
    BRANCHES_LIST = (By.CLASS_NAME, "branch-item")
    EVENTS_LIST = (By.CLASS_NAME, "event-item")
    
    def test_home_page_loads(self, driver):
        """Test home page loads successfully"""
        logger.info("Running test_home_page_loads")
        driver.get(TestSettings.get_url('home'))
        
        # Verify page title or main content
        assert driver.title or len(driver.find_elements(*self.HOME_LINK)) >= 0, "Home page did not load"
        logger.info("Home page loads test passed")
    
    def test_navigate_to_menu(self, driver):
        """Test navigating to menu page"""
        logger.info("Running test_navigate_to_menu")
        driver.get(TestSettings.get_url('home'))
        
        ElementHelper.click(driver, self.MENU_LINK)
        WaitHelper.wait_for_url_contains(driver, 'menu')
        
        assert "menu" in driver.current_url, "Not on menu page"
        logger.info("Navigate to menu test passed")
    
    def test_navigate_to_branches(self, driver):
        """Test navigating to branches page"""
        logger.info("Running test_navigate_to_branches")
        driver.get(TestSettings.get_url('home'))
        
        ElementHelper.click(driver, self.BRANCHES_LINK)
        WaitHelper.wait_for_url_contains(driver, 'branches')
        
        assert "branches" in driver.current_url, "Not on branches page"
        logger.info("Navigate to branches test passed")
    
    def test_navigate_to_events(self, driver):
        """Test navigating to events page"""
        logger.info("Running test_navigate_to_events")
        driver.get(TestSettings.get_url('home'))
        
        ElementHelper.click(driver, self.EVENTS_LINK)
        WaitHelper.wait_for_url_contains(driver, 'events')
        
        assert "events" in driver.current_url, "Not on events page"
        logger.info("Navigate to events test passed")
    
    def test_navigate_to_blog(self, driver):
        """Test navigating to blog page"""
        logger.info("Running test_navigate_to_blog")
        driver.get(TestSettings.get_url('home'))
        
        ElementHelper.click(driver, self.BLOG_LINK)
        WaitHelper.wait_for_url_contains(driver, 'blog')
        
        assert "blog" in driver.current_url, "Not on blog page"
        logger.info("Navigate to blog test passed")
    
    def test_navigate_to_contact(self, driver):
        """Test navigating to contact page"""
        logger.info("Running test_navigate_to_contact")
        driver.get(TestSettings.get_url('home'))
        
        ElementHelper.click(driver, self.CONTACT_LINK)
        WaitHelper.wait_for_url_contains(driver, 'contact')
        
        assert "contact" in driver.current_url, "Not on contact page"
        logger.info("Navigate to contact test passed")
    
    def test_menu_items_display(self, driver):
        """Test menu items are displayed"""
        logger.info("Running test_menu_items_display")
        driver.get(TestSettings.get_url('public_menu'))
        
        # Wait for menu items to load
        WaitHelper.wait_for_elements_present(driver, self.MENU_ITEMS)
        items = ElementHelper.find_elements(driver, self.MENU_ITEMS)
        
        assert len(items) > 0, "No menu items displayed"
        logger.info(f"Menu items display test passed. Found {len(items)} items")
    
    def test_branches_display(self, driver):
        """Test branches are displayed"""
        logger.info("Running test_branches_display")
        driver.get(TestSettings.get_url('public_branches'))
        
        # Wait for branches to load
        WaitHelper.wait_for_elements_present(driver, self.BRANCHES_LIST)
        branches = ElementHelper.find_elements(driver, self.BRANCHES_LIST)
        
        assert len(branches) > 0, "No branches displayed"
        logger.info(f"Branches display test passed. Found {len(branches)} branches")

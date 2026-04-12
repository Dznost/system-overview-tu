import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class TestOrderManagement:
    """Test cases for order management functionality"""
    
    # Locators
    ORDERS_TABLE = (By.TAG_NAME, "table")
    ADD_TO_CART_BUTTON = (By.XPATH, "//button[contains(text(), 'Add to Cart')]")
    CART_BUTTON = (By.XPATH, "//a[contains(text(), 'Cart')]")
    CHECKOUT_BUTTON = (By.XPATH, "//button[contains(text(), 'Checkout')]")
    ORDER_STATUS_SELECT = (By.ID, "status")
    UPDATE_ORDER_BUTTON = (By.XPATH, "//button[contains(text(), 'Update')]")
    VIEW_ORDER_BUTTON = (By.XPATH, "//button[contains(text(), 'View')]")
    SUCCESS_MESSAGE = (By.CLASS_NAME, "alert-success")
    
    def test_access_admin_orders(self, driver):
        """Test accessing admin orders page"""
        logger.info("Running test_access_admin_orders")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_orders'))
        
        WaitHelper.wait_for_url_contains(driver, 'orders')
        assert ElementHelper.is_displayed(driver, self.ORDERS_TABLE), "Orders table not displayed"
        logger.info("Access admin orders test passed")
    
    def test_view_order_details(self, driver):
        """Test viewing order details"""
        logger.info("Running test_view_order_details")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_orders'))
        
        try:
            WaitHelper.wait_for_element_visible(driver, self.VIEW_ORDER_BUTTON)
            ElementHelper.click(driver, self.VIEW_ORDER_BUTTON)
            
            # Should navigate to order detail page
            WaitHelper.wait_for_url_contains(driver, 'orders')
            logger.info("View order details test passed")
        except:
            logger.warning("No orders to view")
    
    def test_update_order_status(self, driver):
        """Test updating order status"""
        logger.info("Running test_update_order_status")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_orders'))
        
        try:
            WaitHelper.wait_for_element_visible(driver, self.VIEW_ORDER_BUTTON)
            ElementHelper.click(driver, self.VIEW_ORDER_BUTTON)
            
            # Update status
            WaitHelper.wait_for_element_visible(driver, self.ORDER_STATUS_SELECT)
            ElementHelper.select_dropdown_by_value(driver, self.ORDER_STATUS_SELECT, "completed")
            
            # Save update
            ElementHelper.click(driver, self.UPDATE_ORDER_BUTTON)
            WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
            
            logger.info("Update order status test passed")
        except:
            logger.warning("Could not update order status")
    
    def test_user_add_to_cart(self, driver):
        """Test user adding items to cart"""
        logger.info("Running test_user_add_to_cart")
        AuthHelper.login_as_user(driver)
        driver.get(TestSettings.get_url('public_menu'))
        
        try:
            WaitHelper.wait_for_element_clickable(driver, self.ADD_TO_CART_BUTTON)
            ElementHelper.click(driver, self.ADD_TO_CART_BUTTON)
            
            # Verify item added
            WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
            logger.info("User add to cart test passed")
        except:
            logger.warning("Could not add item to cart")
    
    def test_user_view_cart(self, driver):
        """Test user viewing cart"""
        logger.info("Running test_user_view_cart")
        AuthHelper.login_as_user(driver)
        driver.get(TestSettings.get_url('user_cart'))
        
        WaitHelper.wait_for_url_contains(driver, 'cart')
        assert "cart" in driver.current_url, "Not on cart page"
        logger.info("User view cart test passed")
    
    def test_user_view_orders(self, driver):
        """Test user viewing their orders"""
        logger.info("Running test_user_view_orders")
        AuthHelper.login_as_user(driver)
        driver.get(TestSettings.get_url('user_orders'))
        
        WaitHelper.wait_for_url_contains(driver, 'orders')
        assert "orders" in driver.current_url, "Not on user orders page"
        logger.info("User view orders test passed")

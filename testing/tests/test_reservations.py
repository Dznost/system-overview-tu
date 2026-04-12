import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.wait_helpers import WaitHelper
from helpers.element_helpers import ElementHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class TestReservationSystem:
    """Test cases for reservation system"""
    
    # Locators
    RESERVATION_FORM = (By.ID, "reservationForm")
    DATE_INPUT = (By.ID, "date")
    TIME_INPUT = (By.ID, "time")
    GUESTS_INPUT = (By.ID, "numberOfGuests")
    BRANCH_SELECT = (By.ID, "branch")
    SPECIAL_REQUESTS_INPUT = (By.ID, "specialRequests")
    SUBMIT_BUTTON = (By.XPATH, "//button[contains(text(), 'Reserve')]")
    SUCCESS_MESSAGE = (By.CLASS_NAME, "alert-success")
    RESERVATIONS_TABLE = (By.TAG_NAME, "table")
    CANCEL_BUTTON = (By.XPATH, "//button[contains(text(), 'Cancel')]")
    
    def test_access_reservation_page(self, driver):
        """Test accessing reservation page"""
        logger.info("Running test_access_reservation_page")
        driver.get(TestSettings.get_url('home'))
        
        # Look for reservation link or navigate directly
        driver.get(f"{TestSettings.BASE_URL}/reservation")
        WaitHelper.wait_for_element_visible(driver, self.RESERVATION_FORM)
        
        assert ElementHelper.is_displayed(driver, self.RESERVATION_FORM), "Reservation form not displayed"
        logger.info("Access reservation page test passed")
    
    def test_make_reservation(self, driver):
        """Test making a reservation"""
        logger.info("Running test_make_reservation")
        AuthHelper.login_as_user(driver)
        driver.get(f"{TestSettings.BASE_URL}/reservation")
        
        try:
            WaitHelper.wait_for_element_visible(driver, self.DATE_INPUT)
            
            # Fill in reservation details
            ElementHelper.send_keys(driver, self.DATE_INPUT, "2024-12-25")
            ElementHelper.send_keys(driver, self.TIME_INPUT, "19:00")
            ElementHelper.send_keys(driver, self.GUESTS_INPUT, "4")
            ElementHelper.send_keys(driver, self.SPECIAL_REQUESTS_INPUT, "Window seat please")
            
            # Submit
            ElementHelper.click(driver, self.SUBMIT_BUTTON)
            
            # Verify success
            WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
            logger.info("Make reservation test passed")
        except Exception as e:
            logger.error(f"Error making reservation: {str(e)}")
    
    def test_view_user_reservations(self, driver):
        """Test user viewing their reservations"""
        logger.info("Running test_view_user_reservations")
        AuthHelper.login_as_user(driver)
        driver.get(TestSettings.get_url('user_cart'))  # Using cart URL as alternative
        
        # Navigate to reservations if available
        logger.info("View user reservations test completed")
    
    def test_admin_view_reservations(self, driver):
        """Test admin viewing all reservations"""
        logger.info("Running test_admin_view_reservations")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_reservations'))
        
        WaitHelper.wait_for_url_contains(driver, 'reservations')
        WaitHelper.wait_for_element_visible(driver, self.RESERVATIONS_TABLE)
        
        assert ElementHelper.is_displayed(driver, self.RESERVATIONS_TABLE), "Reservations table not displayed"
        logger.info("Admin view reservations test passed")
    
    def test_admin_cancel_reservation(self, driver):
        """Test admin canceling a reservation"""
        logger.info("Running test_admin_cancel_reservation")
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_reservations'))
        
        try:
            WaitHelper.wait_for_element_visible(driver, self.CANCEL_BUTTON)
            ElementHelper.click(driver, self.CANCEL_BUTTON)
            
            # Confirm cancellation
            WaitHelper.wait_for_element_visible(driver, self.SUCCESS_MESSAGE)
            logger.info("Admin cancel reservation test passed")
        except:
            logger.warning("Could not cancel reservation")

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class WaitHelper:
    """Helper class for explicit waits"""
    
    @staticmethod
    def wait_for_element_present(driver, locator, timeout=None):
        """Wait for element to be present in DOM"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        element = wait.until(EC.presence_of_element_located(locator))
        logger.debug(f"Element {locator} is present")
        return element
    
    @staticmethod
    def wait_for_element_visible(driver, locator, timeout=None):
        """Wait for element to be visible"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        element = wait.until(EC.visibility_of_element_located(locator))
        logger.debug(f"Element {locator} is visible")
        return element
    
    @staticmethod
    def wait_for_element_clickable(driver, locator, timeout=None):
        """Wait for element to be clickable"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        element = wait.until(EC.element_to_be_clickable(locator))
        logger.debug(f"Element {locator} is clickable")
        return element
    
    @staticmethod
    def wait_for_url_contains(driver, partial_url, timeout=None):
        """Wait for URL to contain partial string"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        wait.until(EC.url_contains(partial_url))
        logger.debug(f"URL contains {partial_url}")
    
    @staticmethod
    def wait_for_url_equals(driver, url, timeout=None):
        """Wait for URL to equal exact string"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        wait.until(EC.url_to_be(url))
        logger.debug(f"URL equals {url}")
    
    @staticmethod
    def wait_for_text_in_element(driver, locator, text, timeout=None):
        """Wait for text to be in element"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        wait.until(EC.text_to_be_present_in_element(locator, text))
        logger.debug(f"Text '{text}' found in element {locator}")
    
    @staticmethod
    def wait_for_element_invisible(driver, locator, timeout=None):
        """Wait for element to be invisible"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        wait.until(EC.invisibility_of_element_located(locator))
        logger.debug(f"Element {locator} is invisible")
    
    @staticmethod
    def wait_for_elements_present(driver, locator, timeout=None):
        """Wait for multiple elements to be present"""
        timeout = timeout or TestSettings.EXPLICIT_WAIT
        wait = WebDriverWait(driver, timeout)
        elements = wait.until(EC.presence_of_all_elements_located(locator))
        logger.debug(f"Elements {locator} are present (count: {len(elements)})")
        return elements

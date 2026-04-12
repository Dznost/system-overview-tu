from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.select import Select
import logging

logger = logging.getLogger(__name__)

class ElementHelper:
    """Helper class for element interactions"""
    
    @staticmethod
    def find_element(driver, locator):
        """Find single element"""
        return driver.find_element(*locator)
    
    @staticmethod
    def find_elements(driver, locator):
        """Find multiple elements"""
        return driver.find_elements(*locator)
    
    @staticmethod
    def click(driver, locator):
        """Click on element"""
        element = ElementHelper.find_element(driver, locator)
        element.click()
        logger.debug(f"Clicked on element {locator}")
    
    @staticmethod
    def send_keys(driver, locator, text):
        """Send text to element"""
        element = ElementHelper.find_element(driver, locator)
        element.clear()
        element.send_keys(text)
        logger.debug(f"Sent keys '{text}' to element {locator}")
    
    @staticmethod
    def get_text(driver, locator):
        """Get text from element"""
        element = ElementHelper.find_element(driver, locator)
        text = element.text
        logger.debug(f"Got text '{text}' from element {locator}")
        return text
    
    @staticmethod
    def get_attribute(driver, locator, attribute):
        """Get attribute value from element"""
        element = ElementHelper.find_element(driver, locator)
        value = element.get_attribute(attribute)
        logger.debug(f"Got attribute '{attribute}' = '{value}' from element {locator}")
        return value
    
    @staticmethod
    def is_displayed(driver, locator):
        """Check if element is displayed"""
        try:
            element = ElementHelper.find_element(driver, locator)
            return element.is_displayed()
        except:
            return False
    
    @staticmethod
    def is_enabled(driver, locator):
        """Check if element is enabled"""
        try:
            element = ElementHelper.find_element(driver, locator)
            return element.is_enabled()
        except:
            return False
    
    @staticmethod
    def select_dropdown_by_value(driver, locator, value):
        """Select dropdown option by value"""
        element = ElementHelper.find_element(driver, locator)
        select = Select(element)
        select.select_by_value(value)
        logger.debug(f"Selected dropdown option '{value}' for element {locator}")
    
    @staticmethod
    def select_dropdown_by_text(driver, locator, text):
        """Select dropdown option by visible text"""
        element = ElementHelper.find_element(driver, locator)
        select = Select(element)
        select.select_by_visible_text(text)
        logger.debug(f"Selected dropdown option '{text}' for element {locator}")
    
    @staticmethod
    def hover_over_element(driver, locator):
        """Hover over element"""
        element = ElementHelper.find_element(driver, locator)
        actions = ActionChains(driver)
        actions.move_to_element(element).perform()
        logger.debug(f"Hovered over element {locator}")
    
    @staticmethod
    def scroll_to_element(driver, locator):
        """Scroll to element"""
        element = ElementHelper.find_element(driver, locator)
        driver.execute_script("arguments[0].scrollIntoView(true);", element)
        logger.debug(f"Scrolled to element {locator}")
    
    @staticmethod
    def switch_to_frame(driver, locator):
        """Switch to iframe"""
        frame = ElementHelper.find_element(driver, locator)
        driver.switch_to.frame(frame)
        logger.debug(f"Switched to frame {locator}")
    
    @staticmethod
    def switch_to_default_content(driver):
        """Switch back to default content"""
        driver.switch_to.default_content()
        logger.debug("Switched to default content")

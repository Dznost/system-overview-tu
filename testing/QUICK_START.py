"""
Quick Start Guide for Testing Suite
"""

# 1. INSTALLATION
# ===============

# Step 1: Setup environment
cd testing
bash setup.sh

# Step 2: Configure .env
# Edit .env and set your credentials:
# - TEST_ADMIN_EMAIL=admin@restaurant.com
# - TEST_ADMIN_PASSWORD=admin123
# - TEST_USER_EMAIL=user@test.com  
# - TEST_USER_PASSWORD=user123

# Step 3: Make sure app is running
cd ..
npm install
npm start  # App runs on http://localhost:3001

# 2. RUNNING TESTS
# ================

cd testing

# All tests
python run_tests.py

# Specific test
python run_tests.py test_authentication

# Headless mode
python run_tests.py --headless

# Parallel execution
python run_tests.py --parallel 4

# Firefox instead of Chrome
python run_tests.py --browser firefox

# 3. VIEW RESULTS
# ===============

# HTML Report
open reports/report.html

# Test Logs
tail -f logs/test.log

# Failed Screenshots
ls -la screenshots/

# 4. TROUBLESHOOTING
# ==================

# If tests fail:
1. Check logs/test.log for details
2. Review screenshots/ for failed states
3. Verify app is running on localhost:3001
4. Check .env credentials match test users
5. Ensure MongoDB is running

# 5. ADDING NEW TESTS
# ===================

# Create new test file in tests/
# Follow existing patterns:

from helpers.auth_helpers import AuthHelper
from helpers.element_helpers import ElementHelper
from helpers.wait_helpers import WaitHelper
from config.settings import TestSettings

class TestNewFeature:
    def test_something(self, driver):
        AuthHelper.login_as_admin(driver)
        driver.get(TestSettings.get_url('admin_dashboard'))
        WaitHelper.wait_for_element_visible(driver, (By.ID, "element_id"))
        ElementHelper.click(driver, (By.ID, "element_id"))
        assert True, "Test passed"

# 6. CI/CD INTEGRATION
# ====================

# Copy workflow to your repo:
mkdir -p .github/workflows
cp testing/.github_workflows_tests.yml .github/workflows/tests.yml

# Push to repo, tests run automatically on push and PR
"""

# EXAMPLE TEST FUNCTIONS
# =======================

# Example 1: Simple login test
def test_admin_login():
    """
    from drivers.driver_factory import DriverFactory
    from helpers.auth_helpers import AuthHelper
    
    driver = DriverFactory.create_driver()
    AuthHelper.login_as_admin(driver)
    assert AuthHelper.is_logged_in(driver)
    DriverFactory.quit_driver(driver)
    """
    pass

# Example 2: Navigate and verify
def test_navigate_to_menu():
    """
    from drivers.driver_factory import DriverFactory
    from helpers.element_helpers import ElementHelper
    from helpers.wait_helpers import WaitHelper
    from selenium.webdriver.common.by import By
    
    driver = DriverFactory.create_driver()
    driver.get('http://localhost:3001/')
    
    menu_link = (By.XPATH, "//a[contains(text(), 'Menu')]")
    ElementHelper.click(driver, menu_link)
    
    WaitHelper.wait_for_url_contains(driver, 'menu')
    assert 'menu' in driver.current_url
    
    DriverFactory.quit_driver(driver)
    """
    pass

# Example 3: Form submission
def test_create_dish():
    """
    from drivers.driver_factory import DriverFactory
    from helpers.auth_helpers import AuthHelper
    from helpers.element_helpers import ElementHelper
    from helpers.wait_helpers import WaitHelper
    from config.settings import TestSettings
    from selenium.webdriver.common.by import By
    
    driver = DriverFactory.create_driver()
    AuthHelper.login_as_admin(driver)
    
    driver.get(TestSettings.get_url('admin_dishes'))
    
    add_btn = (By.XPATH, "//button[contains(text(), 'Add Dish')]")
    ElementHelper.click(driver, add_btn)
    
    WaitHelper.wait_for_element_visible(driver, (By.ID, 'name'))
    ElementHelper.send_keys(driver, (By.ID, 'name'), 'Test Dish')
    ElementHelper.send_keys(driver, (By.ID, 'price'), '100000')
    
    save_btn = (By.XPATH, "//button[contains(text(), 'Save')]")
    ElementHelper.click(driver, save_btn)
    
    success = (By.CLASS_NAME, 'alert-success')
    WaitHelper.wait_for_element_visible(driver, success)
    
    DriverFactory.quit_driver(driver)
    """
    pass

# Example 4: Error handling
def test_invalid_login_with_retry():
    """
    from drivers.driver_factory import DriverFactory
    from helpers.auth_helpers import AuthHelper
    from selenium.common.exceptions import TimeoutException
    
    driver = DriverFactory.create_driver()
    
    try:
        AuthHelper.login(driver, 'invalid@email.com', 'wrongpass')
    except TimeoutException:
        print("Login failed as expected")
    
    DriverFactory.quit_driver(driver)
    """
    pass

# TEST NAMING CONVENTIONS
# =======================

"""
✅ Good test names:
- test_admin_can_login
- test_user_can_add_item_to_cart
- test_dishes_page_displays_correctly
- test_invalid_email_shows_error

❌ Avoid:
- test1, test2, test_foo
- test_something_happens
- test_bug_fix
"""

# LOCATOR STRATEGIES
# ==================

"""
✅ Best practices:
- ID: (By.ID, "element_id") - Most stable
- CSS: (By.CSS_SELECTOR, ".class-name") - Good
- XPath: (By.XPATH, "//button[contains(text(), 'Click')]") - For complex

❌ Avoid:
- Full XPath: //div/div/div/button - Too fragile
- Classes/attributes that change: "dynamic-123"
"""

# DEBUG COMMANDS
# ==============

"""
# Run with maximum verbosity
python run_tests.py -vv -s

# Stop on first failure
python run_tests.py -x

# Show local variables on failure
python run_tests.py -l

# Run specific test with output
python run_tests.py test_authentication::TestAuthentication::test_login_admin -s

# Generate detailed HTML report
python run_tests.py --html=reports/detailed.html --self-contained-html

# Parallel with detailed output
python run_tests.py --parallel 4 -v --tb=short
"""

# ENVIRONMENT VARIABLES
# ======================

"""
# Override via command line:
BASE_URL=http://localhost:3002 python run_tests.py
HEADLESS=True python run_tests.py
BROWSER=firefox python run_tests.py

# Or edit .env file directly
"""

# INTEGRATION WITH CI/CD
# ======================

"""
# GitHub Actions: Automatically run tests
# - On every push to main/develop
# - On every pull request
# - Daily at 2 AM

# Jenkins: Add to Jenkinsfile
stage('Test') {
    steps {
        sh '''
            cd testing
            python run_tests.py --headless
        '''
    }
    post {
        always {
            publishHTML([
                reportDir: 'testing/reports',
                reportFiles: 'report.html',
                reportName: 'Selenium Tests'
            ])
        }
    }
}
"""

print("Testing setup complete! Start with: python run_tests.py")

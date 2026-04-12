# Selenium Testing Framework - Installation & Quick Start Summary

## 📦 Bạn Đã Nhận Được

```
✅ 40+ Automated Tests
✅ Python Selenium Framework
✅ CI/CD Ready (GitHub Actions)
✅ Logging & Reporting
✅ Helper Classes & Utilities
✅ Setup Scripts
✅ Complete Documentation
```

## 🚀 Quick Start (5 Minutes)

### 1. Install (1 min)
```bash
cd testing
bash setup.sh
```

### 2. Configure (1 min)
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start App (1 min)
```bash
npm start
# Runs on http://localhost:3001
```

### 4. Run Tests (2 min)
```bash
cd testing
python run_tests.py
```

### 5. View Results
```bash
open testing/reports/report.html
```

## 📁 Test Suite Organization

```
AUTHENTICATION (6 tests)
├── Admin Login
├── User Login
├── Shipper Login
├── Invalid Login
├── Logout
└── Login Page Elements

ADMIN DASHBOARD (6 tests)
├── Dashboard Accessible
├── Menu Items Visible
├── Navigate to Dishes
├── Navigate to Branches
├── Navigate to Events
└── Navigate to Orders

DISHES MANAGEMENT (4 tests)
├── Access Dishes Page
├── Add Dish
├── View Dishes List
└── Edit Dish

PUBLIC WEBSITE (8 tests)
├── Home Page Loads
├── Navigate to Menu
├── Navigate to Branches
├── Navigate to Events
├── Navigate to Blog
├── Navigate to Contact
├── Menu Items Display
└── Branches Display

ORDERS (6 tests)
├── Access Admin Orders
├── View Order Details
├── Update Order Status
├── User Add to Cart
├── User View Cart
└── User View Orders

RESERVATIONS (5 tests)
├── Access Reservation Page
├── Make Reservation
├── View User Reservations
├── Admin View Reservations
└── Admin Cancel Reservation

USER MANAGEMENT (5 tests)
├── Admin View Users
├── Admin Add User
├── User View Profile
├── User Edit Profile
└── Admin Delete User

TOTAL: 40+ Tests ✅
```

## 🎯 Common Commands

```bash
# All tests
python run_tests.py

# Specific test file
python run_tests.py test_authentication

# Headless mode
python run_tests.py --headless

# Parallel (4 processes)
python run_tests.py --parallel 4

# Firefox instead of Chrome
python run_tests.py --browser firefox

# Stop on first failure
python run_tests.py -x

# Show output
python run_tests.py -s

# Generate custom report
python run_tests.py --html=reports/custom.html
```

## 📊 File Structure

```
testing/
├── config/                      # Configuration
│   ├── settings.py
│   └── __init__.py
├── drivers/                     # WebDriver factory
│   ├── driver_factory.py
│   └── __init__.py
├── helpers/                     # Helper utilities
│   ├── auth_helpers.py
│   ├── element_helpers.py
│   ├── wait_helpers.py
│   └── __init__.py
├── tests/                       # Test files
│   ├── test_authentication.py
│   ├── test_admin_dashboard.py
│   ├── test_dishes_management.py
│   ├── test_public_website.py
│   ├── test_order_management.py
│   ├── test_reservations.py
│   ├── test_user_management.py
│   └── __init__.py
├── logs/                        # Generated logs
├── reports/                     # Generated reports (HTML)
├── screenshots/                 # Failed screenshots
├── conftest.py                  # Pytest config
├── run_tests.py                 # Test runner
├── init_tests.py                # Initialize environment
├── setup.sh                     # Setup script
├── requirements.txt             # Dependencies
├── pyproject.toml               # Project config
├── .env.example                 # Environment template
├── README.md                    # Full documentation
└── .gitignore                   # Git ignore
```

## 🔐 Required Test Users

Make sure these exist in your database:

```
1. Admin
   Email: admin@restaurant.com
   Password: admin123
   Role: admin

2. Regular User
   Email: user@test.com
   Password: user123
   Role: user

3. Shipper
   Email: shipper@test.com
   Password: shipper123
   Role: shipper
```

Create via Node.js script or MongoDB:

```bash
npm run seed
```

## 🧪 Helper Classes

### AuthHelper
```python
from helpers.auth_helpers import AuthHelper

AuthHelper.login_as_admin(driver)
AuthHelper.login_as_user(driver)
AuthHelper.logout(driver)
AuthHelper.is_logged_in(driver)
```

### ElementHelper
```python
from helpers.element_helpers import ElementHelper

ElementHelper.click(driver, locator)
ElementHelper.send_keys(driver, locator, "text")
ElementHelper.get_text(driver, locator)
ElementHelper.select_dropdown_by_value(driver, locator, value)
ElementHelper.is_displayed(driver, locator)
```

### WaitHelper
```python
from helpers.wait_helpers import WaitHelper

WaitHelper.wait_for_element_visible(driver, locator)
WaitHelper.wait_for_element_clickable(driver, locator)
WaitHelper.wait_for_url_contains(driver, "admin")
WaitHelper.wait_for_text_in_element(driver, locator, "text")
```

## 📋 Environment Variables (.env)

```
# Base URL
BASE_URL=http://localhost:3001

# Browser
BROWSER=chrome
HEADLESS=False

# Timeouts (seconds)
IMPLICIT_WAIT=10
EXPLICIT_WAIT=15
PAGE_LOAD_TIMEOUT=20

# Test Credentials
TEST_ADMIN_EMAIL=admin@restaurant.com
TEST_ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=user123
TEST_SHIPPER_EMAIL=shipper@test.com
TEST_SHIPPER_PASSWORD=shipper123

# Database
MONGO_URI=mongodb://localhost:27017/restaurant_test
```

## 🔍 View Results

```bash
# HTML Report
open testing/reports/report.html

# Logs
tail -f testing/logs/test.log

# Failed Screenshots
ls testing/screenshots/
```

## ✅ Setup Checklist

- [ ] Python 3.9+ installed
- [ ] `pip install -r requirements.txt`
- [ ] `.env` configured
- [ ] Test users created in DB
- [ ] App running on localhost:3001
- [ ] `python run_tests.py` runs
- [ ] Report generated successfully

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | App auto-switches to 3002 |
| WebDriver not found | Run: `python -m webdriver_manager.chrome` |
| Test timeout | Increase `EXPLICIT_WAIT` in .env |
| Element not found | Verify locator in DevTools |
| MongoDB connection | Ensure MongoDB running |

## 🚀 CI/CD Setup

```bash
# Copy GitHub Actions workflow
mkdir -p .github/workflows
cp testing/.github_workflows_tests.yml .github/workflows/tests.yml

# Tests run automatically on:
# - Push to main/develop
# - Pull requests
# - Daily at 2 AM
```

## 📈 Performance

```bash
# Run tests in parallel for faster execution
python run_tests.py --parallel 4

# View test execution times
python run_tests.py -v --durations=10
```

## 🎓 Adding New Tests

1. Create `testing/tests/test_your_feature.py`
2. Import helpers:
   ```python
   from helpers.auth_helpers import AuthHelper
   from helpers.element_helpers import ElementHelper
   from helpers.wait_helpers import WaitHelper
   from selenium.webdriver.common.by import By
   ```
3. Define locators:
   ```python
   YOUR_BUTTON = (By.ID, "button_id")
   ```
4. Write test:
   ```python
   def test_your_feature(self, driver):
       AuthHelper.login_as_admin(driver)
       ElementHelper.click(driver, self.YOUR_BUTTON)
       assert True
   ```

## 📚 Full Documentation

See `TESTING_INTEGRATION_GUIDE.md` for complete details.

## 🎉 You're Ready!

Everything is set up and integrated. Just run:

```bash
cd testing
python run_tests.py
```

Enjoy automated testing! 🧪✨

---

**Happy Testing!**

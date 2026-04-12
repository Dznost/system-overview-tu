# 🚀 SELENIUM TESTING - START HERE

## Bạn Vừa Nhận Được Cái Gì?

Một **bộ kiểm thử tự động hoàn chỉnh** cho hệ thống nhà hàng của bạn:

```
📦 Framework hoàn chỉnh
✅ 40+ tests cho tất cả chức năng
🔧 Helper classes & utilities
📊 HTML reports & logging
🚀 CI/CD ready (GitHub Actions)
📝 Đầy đủ documentation
```

## ⚡ 5 Phút Để Bắt Đầu

### 1️⃣ Cài Đặt Dependencies

```bash
cd testing
bash setup.sh
```

**Hoặc thủ công:**
```bash
pip install -r requirements.txt
```

### 2️⃣ Cấu Hình Environment

```bash
cp .env.example .env
```

**Chỉnh sửa `.env`:**
- `BASE_URL` = http://localhost:3001
- Credentials cho test users

### 3️⃣ Tạo Test Users

Trong Node.js/MongoDB:
```bash
npm run seed
```

Hoặc thêm thủ công 3 users:
- admin@restaurant.com / admin123 (admin)
- user@test.com / user123 (user)
- shipper@test.com / shipper123 (shipper)

### 4️⃣ Chạy Application

```bash
npm start  # localhost:3001
```

### 5️⃣ Chạy Tests

```bash
cd testing
python run_tests.py
```

## 📊 Xem Kết Quả

```bash
# Open HTML report
open testing/reports/report.html

# View logs
tail -f testing/logs/test.log

# Screenshots of failures
ls testing/screenshots/
```

## 🎯 Các Command Chính

```bash
# Everything
python run_tests.py

# Specific test
python run_tests.py test_authentication

# Headless (no GUI)
python run_tests.py --headless

# Parallel (faster)
python run_tests.py --parallel 4

# Firefox instead of Chrome
python run_tests.py --browser firefox

# Stop on first failure
python run_tests.py -x

# With output
python run_tests.py -s
```

## 📁 Project Structure

```
testing/
├── config/          → Settings & configuration
├── drivers/         → WebDriver factory
├── helpers/         → Reusable helper functions
├── tests/           → All test files (40+ tests)
├── logs/            → Test logs (generated)
├── reports/         → HTML reports (generated)
├── screenshots/     → Failed screenshots (generated)
├── conftest.py      → Pytest configuration
├── run_tests.py     → Test runner script
├── requirements.txt → Python dependencies
└── README.md        → Full documentation
```

## 🧪 Test Coverage

| Feature | Tests | Status |
|---------|-------|--------|
| Authentication | 6 | ✅ |
| Admin Dashboard | 6 | ✅ |
| Dishes | 4 | ✅ |
| Public Website | 8 | ✅ |
| Orders | 6 | ✅ |
| Reservations | 5 | ✅ |
| Users | 5 | ✅ |

## 🔧 Helper Classes (Siêu Hữu Ích!)

### AuthHelper - Login/Logout
```python
from helpers.auth_helpers import AuthHelper

AuthHelper.login_as_admin(driver)
AuthHelper.login_as_user(driver)
AuthHelper.logout(driver)
```

### ElementHelper - Interact with Elements
```python
from helpers.element_helpers import ElementHelper

ElementHelper.click(driver, locator)
ElementHelper.send_keys(driver, locator, "text")
ElementHelper.get_text(driver, locator)
ElementHelper.is_displayed(driver, locator)
```

### WaitHelper - Smart Waits
```python
from helpers.wait_helpers import WaitHelper

WaitHelper.wait_for_element_visible(driver, locator)
WaitHelper.wait_for_element_clickable(driver, locator)
WaitHelper.wait_for_url_contains(driver, "admin")
```

## 💡 Quick Examples

### Example 1: Login & Click
```python
def test_admin_login(self, driver):
    AuthHelper.login_as_admin(driver)
    assert AuthHelper.is_logged_in(driver)
```

### Example 2: Fill Form
```python
def test_add_dish(self, driver):
    AuthHelper.login_as_admin(driver)
    driver.get("http://localhost:3001/admin/dishes")
    
    ElementHelper.click(driver, (By.XPATH, "//button[text()='Add']"))
    ElementHelper.send_keys(driver, (By.ID, "name"), "New Dish")
    ElementHelper.send_keys(driver, (By.ID, "price"), "99999")
    ElementHelper.click(driver, (By.XPATH, "//button[text()='Save']"))
```

### Example 3: Navigate & Verify
```python
def test_menu_page(self, driver):
    driver.get("http://localhost:3001")
    ElementHelper.click(driver, (By.XPATH, "//a[text()='Menu']"))
    WaitHelper.wait_for_url_contains(driver, 'menu')
    assert "menu" in driver.current_url
```

## 📝 Thêm Test Mới

1. Create `testing/tests/test_your_feature.py`
2. Copy example structure from existing tests
3. Run: `python run_tests.py test_your_feature`

## 🚀 CI/CD - Auto Run Tests

```bash
# Copy workflow
mkdir -p .github/workflows
cp testing/.github_workflows_tests.yml .github/workflows/tests.yml

# Push to GitHub
git push

# ✅ Tests run automatically!
```

Tests chạy trên:
- ✅ Push to main/develop
- ✅ Pull requests
- ✅ Daily schedule

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Module not found | Run: `pip install -r requirements.txt` |
| WebDriver error | Run: `python -m webdriver_manager.chrome` |
| Connection refused | Check app running on localhost:3001 |
| Timeout | Increase `EXPLICIT_WAIT` in `.env` |
| Element not found | Verify locator with browser DevTools |

## 📚 More Info

- **Full Guide**: `TESTING_INTEGRATION_GUIDE.md`
- **Quick Reference**: `testing/QUICK_REFERENCE.md`
- **Complete README**: `testing/README.md`
- **Examples**: `testing/QUICK_START.py`

## ✅ Checklist

- [ ] `pip install -r requirements.txt`
- [ ] `.env` configured
- [ ] Test users created
- [ ] App running
- [ ] `python run_tests.py` works
- [ ] Report generated
- [ ] Tests passing ✅

## 🎉 Success!

Once tests pass:

```
✅ 40+ Automated Tests Running
✅ HTML Reports Generated
✅ Logging Configured
✅ CI/CD Ready
✅ All Features Tested
```

## 🚀 Next Steps

1. **Review test results**: `open testing/reports/report.html`
2. **Add more tests**: Create new test files
3. **Setup CI/CD**: Copy GitHub Actions workflow
4. **Integrate**: Run before deployment

---

## 🔥 Pro Tips

```bash
# Run tests super fast (parallel)
python run_tests.py --parallel 8

# Headless + Parallel + Custom report
python run_tests.py --headless --parallel 4 --html=reports/ci-report.html

# Debug failing test
python run_tests.py test_authentication::TestAuthentication::test_login_admin -s -vv

# Only run failed tests from last run
python run_tests.py --lf

# Run failed tests first, then all
python run_tests.py --ff
```

## 📞 Need Help?

1. Check `testing/logs/test.log` for errors
2. View screenshots in `testing/screenshots/`
3. Read full docs in `TESTING_INTEGRATION_GUIDE.md`

---

**Bây giờ hãy chạy:** 
```bash
python run_tests.py
```

**Happy Testing! 🧪✨**

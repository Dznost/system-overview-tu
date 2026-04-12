# Selenium Testing Integration Guide - Restaurant Management System

## 📋 Tổng Quan

Bạn vừa nhận được một **bộ kiểm thử tự động hoàn chỉnh** cho hệ thống quản lý nhà hàng của mình, viết bằng **Selenium + Python**.

## 🎯 Cấu Trúc Project Testing

```
testing/
├── config/
│   ├── settings.py          # ⚙️ Tất cả cấu hình test
│   └── __init__.py
├── drivers/
│   ├── driver_factory.py    # 🔧 Tạo WebDriver (Chrome/Firefox)
│   └── __init__.py
├── helpers/
│   ├── auth_helpers.py      # 🔐 Login/Logout helpers
│   ├── element_helpers.py   # 🖱️ Click, send_keys, etc
│   ├── wait_helpers.py      # ⏳ Explicit waits
│   └── __init__.py
├── tests/                    # 📝 Tất cả test files
│   ├── test_authentication.py
│   ├── test_admin_dashboard.py
│   ├── test_dishes_management.py
│   ├── test_public_website.py
│   ├── test_order_management.py
│   ├── test_reservations.py
│   ├── test_user_management.py
│   └── __init__.py
├── conftest.py              # 🧪 Pytest configuration
├── run_tests.py             # 🚀 Test runner script
├── init_tests.py            # 🎬 Initialize environment
├── setup.sh                 # 📦 Setup script
├── requirements.txt         # 📚 Python dependencies
├── pyproject.toml           # 🏗️ Project config
├── .env.example             # 📄 Environment template
└── README.md                # 📖 Chi tiết documentation
```

## 🚀 Bước 1: Cài Đặt (3 phút)

### Terminal:
```bash
cd testing
bash setup.sh
```

Hoặc thủ công:
```bash
cd testing
pip install -r requirements.txt
```

## ⚙️ Bước 2: Cấu Hình (2 phút)

### Tạo file `.env` từ template:
```bash
cp .env.example .env
```

### Chỉnh sửa `.env` với credentials:
```
BASE_URL=http://localhost:3001
BROWSER=chrome
HEADLESS=False

# Test user credentials
TEST_ADMIN_EMAIL=admin@restaurant.com
TEST_ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=user123
TEST_SHIPPER_EMAIL=shipper@test.com
TEST_SHIPPER_PASSWORD=shipper123
```

## 👥 Bước 3: Tạo Test Users

Đảm bảo các test user này tồn tại trong database MongoDB của bạn:

**Cách 1: Chạy script seed data**
```bash
npm run seed  # Chạy từ thư mục gốc
```

**Cách 2: Tạo thủ công (Node.js)**
```javascript
// Trong scripts/seed-data.js hoặc terminal
const User = require('./models/User');
const bcrypt = require('bcryptjs');

User.create({
  name: 'Admin User',
  email: 'admin@restaurant.com',
  password: bcrypt.hashSync('admin123', 10),
  role: 'admin'
});

User.create({
  name: 'Test User',
  email: 'user@test.com',
  password: bcrypt.hashSync('user123', 10),
  role: 'user'
});
```

## ▶️ Bước 4: Chạy Application

```bash
# Từ thư mục gốc của project
npm install
npm start
# App sẽ chạy trên http://localhost:3001
```

## 🧪 Bước 5: Chạy Tests

### 5.1 Chạy TẤT CẢ tests:
```bash
cd testing
python run_tests.py
```

### 5.2 Chạy test NHẤT ĐỊNH:
```bash
# Chỉ test authentication
python run_tests.py test_authentication

# Chỉ test admin dashboard
python run_tests.py test_admin_dashboard

# Chỉ test dishes management
python run_tests.py test_dishes_management
```

### 5.3 Chế độ HEADLESS (không mở browser):
```bash
python run_tests.py --headless
```

### 5.4 Chạy SONG SONG (nhanh hơn):
```bash
python run_tests.py --parallel 4
```

### 5.5 Chọn BROWSER khác:
```bash
python run_tests.py --browser firefox
```

### 5.6 KẾT HỢP các tuỳ chọn:
```bash
# Headless + Firefox + Parallel
python run_tests.py --headless --browser firefox --parallel 4
```

## 📊 Xem Kết Quả

### 1. HTML Report:
```bash
open testing/reports/report.html
# Hoặc trên Windows: start testing/reports/report.html
```

### 2. Logs chi tiết:
```bash
tail -f testing/logs/test.log
```

### 3. Screenshots của failures:
```bash
ls -la testing/screenshots/
```

## 📝 Test Coverage

| Chức Năng | Tests | Status |
|-----------|-------|--------|
| Authentication | 6 | ✅ |
| Admin Dashboard | 6 | ✅ |
| Dishes Management | 4 | ✅ |
| Public Website | 8 | ✅ |
| Orders Management | 6 | ✅ |
| Reservations | 5 | ✅ |
| User Management | 5 | ✅ |
| **TỔNG CỘNG** | **40+ tests** | ✅ |

## 🏗️ Cách Thêm Test Mới

### Tạo file `testing/tests/test_your_feature.py`:

```python
import pytest
from selenium.webdriver.common.by import By
from helpers.auth_helpers import AuthHelper
from helpers.element_helpers import ElementHelper
from helpers.wait_helpers import WaitHelper
from config.settings import TestSettings
import logging

logger = logging.getLogger(__name__)

class TestYourFeature:
    """Test cases for your feature"""
    
    # Định nghĩa locators
    YOUR_BUTTON = (By.ID, "your_button_id")
    YOUR_INPUT = (By.CSS_SELECTOR, ".your-input-class")
    
    def test_your_functionality(self, driver):
        """Test your functionality"""
        logger.info("Running test_your_functionality")
        
        # 1. Login
        AuthHelper.login_as_admin(driver)
        
        # 2. Navigate
        driver.get(TestSettings.get_url('admin_dashboard'))
        
        # 3. Wait for element
        WaitHelper.wait_for_element_visible(driver, self.YOUR_BUTTON)
        
        # 4. Interact
        ElementHelper.click(driver, self.YOUR_BUTTON)
        ElementHelper.send_keys(driver, self.YOUR_INPUT, "test data")
        
        # 5. Assert
        assert ElementHelper.is_displayed(driver, self.YOUR_BUTTON)
        logger.info("Test passed")
```

## 🔧 Customization

### Thay đổi Explicit Wait timeout:
```python
# Trong testing/.env
EXPLICIT_WAIT=20
```

### Thay đổi timeouts:
```python
# Trong testing/.env
PAGE_LOAD_TIMEOUT=30
IMPLICIT_WAIT=15
```

### Thay đổi log level:
```python
# Trong testing/conftest.py
logging.basicConfig(level=logging.DEBUG)  # More verbose
```

## 🐛 Tìm Lỗi (Debugging)

### 1. Test thất bại? Kiểm tra:
```bash
# Xem logs chi tiết
tail -f testing/logs/test.log

# Xem screenshots
ls testing/screenshots/
```

### 2. Element không tìm thấy?
```python
# Thêm debug logging
ElementHelper.scroll_to_element(driver, locator)
print(f"Element text: {ElementHelper.get_text(driver, locator)}")
```

### 3. Timeout?
Tăng timeout trong `.env`:
```
EXPLICIT_WAIT=30
```

## 🚀 CI/CD Integration

### GitHub Actions (Tự động):

Tạo file `.github/workflows/tests.yml`:
```bash
mkdir -p .github/workflows
cp testing/.github_workflows_tests.yml .github/workflows/tests.yml
```

**Khi push code, tests tự động chạy:**
- ✅ Push → Tests chạy
- ✅ Pull Request → Tests chạy
- ✅ Daily schedule → Tests chạy lúc 2 AM

## 📊 Lệnh Thường Dùng

```bash
# Start dev server
npm run dev

# Run all tests
python run_tests.py

# Run specific test with output
python run_tests.py test_authentication -s

# Stop on first failure
python run_tests.py -x

# Run with max verbosity
python run_tests.py -vv

# Generate report
python run_tests.py --html=reports/custom.html --self-contained-html

# Parallel execution
python run_tests.py -n 4

# Run only failed tests
python run_tests.py --lf

# Run failed then all
python run_tests.py --ff
```

## ✅ Checklist

- [ ] Python 3.9+ cài đặt
- [ ] Dependencies cài: `pip install -r requirements.txt`
- [ ] `.env` configured với credentials
- [ ] Test users tạo trong database
- [ ] Application chạy trên http://localhost:3001
- [ ] Tests chạy: `python run_tests.py`
- [ ] Report generated: `reports/report.html`

## 📞 Hỗ Trợ & Khắc Phục Sự Cố

### "Port 3001 already in use"
→ App sẽ tự động chuyển sang port 3002

### "WebDriver not found"
```bash
python -m webdriver_manager.chrome
```

### "Test timeout"
→ Tăng `EXPLICIT_WAIT` trong `.env`

### "Element not found"
→ Kiểm tra locator trong DevTools (F12)

## 🎓 Tài Liệu Thêm

- **Selenium Docs**: https://selenium.dev/documentation/
- **Pytest Docs**: https://docs.pytest.org/
- **WebDriver Manager**: https://github.com/SergeyPirogov/webdriver_manager

## 📈 Metrics & Performance

```bash
# View test execution time
python run_tests.py -v

# Generate performance report
python run_tests.py --durations=10
```

## 🎉 Kết Quả

Sau khi setup thành công, bạn có:

✅ **40+ automated tests** kiểm tra toàn bộ chức năng
✅ **HTML reports** chi tiết kết quả
✅ **Screenshots** lỗi tự động lưu
✅ **Logging** đầy đủ
✅ **CI/CD ready** với GitHub Actions
✅ **Extensible** dễ thêm test mới
✅ **Best practices** đã triển khai

---

**Chúc mừng! Bạn đã có bộ testing framework hoàn chỉnh. Happy Testing! 🧪**

## Liên hệ Hỗ Trợ

Nếu có vấn đề gì:
1. Kiểm tra `testing/logs/test.log`
2. Xem `testing/reports/report.html`
3. Xem `testing/screenshots/` cho failed states
4. Đọc `testing/README.md` chi tiết

# Restaurant Management System - Selenium Testing Suite

Bộ kiểm thử tự động Selenium cho hệ thống quản lý nhà hàng.

## Tính năng

- ✅ Kiểm thử tự động cho tất cả chức năng chính
- ✅ Hỗ trợ Chrome và Firefox
- ✅ Chế độ Headless
- ✅ Báo cáo HTML chi tiết
- ✅ Quản lý WebDriver tự động
- ✅ Hỗ trợ chạy song song
- ✅ Logging chi tiết
- ✅ Xử lý lỗi mạnh mẽ

## Cấu trúc dự án

```
testing/
├── config/              # Cấu hình test
│   ├── settings.py     # Settings chính
│   └── __init__.py
├── drivers/            # WebDriver factory
│   ├── driver_factory.py
│   └── __init__.py
├── helpers/            # Helper functions
│   ├── auth_helpers.py
│   ├── element_helpers.py
│   ├── wait_helpers.py
│   └── __init__.py
├── tests/              # Test suites
│   ├── test_authentication.py
│   ├── test_admin_dashboard.py
│   ├── test_dishes_management.py
│   ├── test_public_website.py
│   ├── test_order_management.py
│   ├── test_reservations.py
│   ├── test_user_management.py
│   └── __init__.py
├── logs/               # Test logs (tự tạo)
├── reports/            # HTML reports (tự tạo)
├── screenshots/        # Failed screenshots (tự tạo)
├── conftest.py         # Pytest configuration
├── run_tests.py        # Test runner
├── setup.sh            # Setup script
├── requirements.txt    # Python dependencies
├── pyproject.toml      # Project configuration
└── .env.example        # Environment template
```

## Cài đặt

### 1. Cài đặt Dependencies

```bash
cd testing
bash setup.sh
```

Hoặc thủ công:

```bash
pip install -r requirements.txt
```

### 2. Cấu hình Environment

Copy `.env.example` thành `.env` và cập nhật:

```bash
cp .env.example .env
```

Chỉnh sửa `.env`:

```
BASE_URL=http://localhost:3001
BROWSER=chrome
HEADLESS=False
TEST_ADMIN_EMAIL=admin@restaurant.com
TEST_ADMIN_PASSWORD=admin123
TEST_USER_EMAIL=user@test.com
TEST_USER_PASSWORD=user123
```

### 3. Tạo test users

Chắc chắn các tài khoản test đã được tạo trong ứng dụng:
- Admin: admin@restaurant.com / admin123
- User: user@test.com / user123
- Shipper: shipper@test.com / shipper123

## Chạy Tests

### Chạy tất cả tests

```bash
python run_tests.py
```

### Chạy test cụ thể

```bash
# Chạy test authentication
python run_tests.py test_authentication

# Chạy test admin dashboard
python run_tests.py test_admin_dashboard

# Chạy test dishes
python run_tests.py test_dishes_management
```

### Chế độ Headless

```bash
python run_tests.py --headless
```

### Chạy song song

```bash
# Chạy 4 test cùng lúc
python run_tests.py --parallel 4
```

### Chọn browser

```bash
python run_tests.py --browser firefox
```

### Kết hợp các tuỳ chọn

```bash
python run_tests.py test_authentication --headless --browser chrome
```

## Test Suites

### 1. Authentication Tests (`test_authentication.py`)
- ✅ Admin login
- ✅ User login
- ✅ Shipper login
- ✅ Invalid login
- ✅ Logout
- ✅ Login page elements

### 2. Admin Dashboard Tests (`test_admin_dashboard.py`)
- ✅ Access dashboard
- ✅ Menu items visible
- ✅ Navigate to dishes
- ✅ Navigate to branches
- ✅ Navigate to events
- ✅ Navigate to orders

### 3. Dishes Management Tests (`test_dishes_management.py`)
- ✅ Access dishes page
- ✅ Add dish
- ✅ View dishes list
- ✅ Edit dish

### 4. Public Website Tests (`test_public_website.py`)
- ✅ Home page loads
- ✅ Navigate to menu
- ✅ Navigate to branches
- ✅ Navigate to events
- ✅ Navigate to blog
- ✅ Navigate to contact
- ✅ Menu items display
- ✅ Branches display

### 5. Order Management Tests (`test_order_management.py`)
- ✅ Access admin orders
- ✅ View order details
- ✅ Update order status
- ✅ User add to cart
- ✅ User view cart
- ✅ User view orders

### 6. Reservations Tests (`test_reservations.py`)
- ✅ Access reservation page
- ✅ Make reservation
- ✅ View user reservations
- ✅ Admin view reservations
- ✅ Admin cancel reservation

### 7. User Management Tests (`test_user_management.py`)
- ✅ Admin view users
- ✅ Admin add user
- ✅ User view profile
- ✅ User edit profile
- ✅ Admin delete user

## Helper Classes

### WaitHelper
Xử lý tất cả explicit waits:

```python
from helpers.wait_helpers import WaitHelper

WaitHelper.wait_for_element_visible(driver, locator)
WaitHelper.wait_for_element_clickable(driver, locator)
WaitHelper.wait_for_url_contains(driver, 'admin')
```

### ElementHelper
Tương tác với elements:

```python
from helpers.element_helpers import ElementHelper

ElementHelper.click(driver, locator)
ElementHelper.send_keys(driver, locator, "text")
ElementHelper.get_text(driver, locator)
ElementHelper.is_displayed(driver, locator)
```

### AuthHelper
Xử lý authentication:

```python
from helpers.auth_helpers import AuthHelper

AuthHelper.login_as_admin(driver)
AuthHelper.login_as_user(driver)
AuthHelper.logout(driver)
AuthHelper.is_logged_in(driver)
```

## Tìm lỗi (Debugging)

### Chế độ verbose

```bash
python run_tests.py -vv
```

### Xem logs

```bash
tail -f logs/test.log
```

### Screenshots

Failed tests tự động lưu screenshots trong `screenshots/` folder.

### Stop on first failure

```bash
python run_tests.py -x
```

## CI/CD Integration

### GitHub Actions

Tạo `.github/workflows/tests.yml`:

```yaml
name: Selenium Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          cd testing
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd testing
          python run_tests.py --headless
```

## Tạo user test (Node.js)

```javascript
// Trong script setup của bạn
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createTestUsers() {
  // Admin
  await User.create({
    name: 'Admin User',
    email: 'admin@restaurant.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  });
  
  // Regular user
  await User.create({
    name: 'Test User',
    email: 'user@test.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user'
  });
  
  // Shipper
  await User.create({
    name: 'Test Shipper',
    email: 'shipper@test.com',
    password: bcrypt.hashSync('shipper123', 10),
    role: 'shipper'
  });
}
```

## Khắc phục sự cố

### Port đã được sử dụng
```
Error: Port 3001 already in use
Solution: npm run dev sẽ tự động chuyển sang port 3002
```

### WebDriver không khớp
```bash
python -m webdriver_manager.chrome
python -m webdriver_manager.firefox
```

### Timeout errors
Tăng timeout trong `.env`:
```
EXPLICIT_WAIT=20
PAGE_LOAD_TIMEOUT=30
```

### Không tìm thấy elements
- Kiểm tra locators trong file test
- Đảm bảo application đã load
- Sử dụng browser devtools để verify selectors

## Best Practices

1. **Waits**: Luôn sử dụng explicit waits thay vì sleep
2. **Locators**: Sử dụng CSS selectors hoặc XPath stable
3. **Page Objects**: Chia sẻ locators trong helpers
4. **Logging**: Thêm logger.info() cho tracking
5. **Error Handling**: Sử dụng try-except cho optional elements

## Liên kết hữu ích

- [Selenium Documentation](https://selenium.dev/documentation/)
- [Pytest Documentation](https://docs.pytest.org/)
- [WebDriver Manager](https://github.com/SergeyPirogov/webdriver_manager)

## Support

Nếu có vấn đề, kiểm tra:
1. `logs/test.log` cho chi tiết
2. `reports/report.html` cho kết quả test
3. `screenshots/` cho failed screenshots

---

**Happy Testing! 🧪**

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class TestSettings:
    """Test configuration settings"""
    
    # Base URL
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:3001')
    
    # Browser settings
    BROWSER = os.getenv('BROWSER', 'chrome').lower()
    HEADLESS = os.getenv('HEADLESS', 'False').lower() == 'true'
    
    # Timeouts (in seconds)
    IMPLICIT_WAIT = int(os.getenv('IMPLICIT_WAIT', 10))
    EXPLICIT_WAIT = int(os.getenv('EXPLICIT_WAIT', 15))
    PAGE_LOAD_TIMEOUT = int(os.getenv('PAGE_LOAD_TIMEOUT', 20))
    
    # Test credentials
    ADMIN_EMAIL = os.getenv('TEST_ADMIN_EMAIL', 'admin@restaurant.com')
    ADMIN_PASSWORD = os.getenv('TEST_ADMIN_PASSWORD', 'admin123')
    TEST_USER_EMAIL = os.getenv('TEST_USER_EMAIL', 'user@test.com')
    TEST_USER_PASSWORD = os.getenv('TEST_USER_PASSWORD', 'user123')
    SHIPPER_EMAIL = os.getenv('TEST_SHIPPER_EMAIL', 'shipper@test.com')
    SHIPPER_PASSWORD = os.getenv('TEST_SHIPPER_PASSWORD', 'shipper123')
    
    # Database
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/restaurant_test')
    
    # Test data
    TEST_DISH_NAME = "Test Dish"
    TEST_DISH_PRICE = 150000
    TEST_BRANCH_NAME = "Test Branch"
    TEST_EVENT_NAME = "Test Event"
    TEST_BLOG_TITLE = "Test Blog Post"
    
    # Page URLs
    URLs = {
        'home': f'{BASE_URL}/',
        'login': f'{BASE_URL}/auth/login',
        'register': f'{BASE_URL}/auth/register',
        'admin_dashboard': f'{BASE_URL}/admin',
        'admin_dishes': f'{BASE_URL}/admin/dishes',
        'admin_branches': f'{BASE_URL}/admin/branches',
        'admin_events': f'{BASE_URL}/admin/events',
        'admin_blogs': f'{BASE_URL}/admin/blogs',
        'admin_orders': f'{BASE_URL}/admin/orders',
        'admin_users': f'{BASE_URL}/admin/users',
        'admin_reservations': f'{BASE_URL}/admin/reservations',
        'user_cart': f'{BASE_URL}/user/cart',
        'user_orders': f'{BASE_URL}/user/orders',
        'user_profile': f'{BASE_URL}/user/profile',
        'public_menu': f'{BASE_URL}/menu',
        'public_branches': f'{BASE_URL}/branches',
        'public_events': f'{BASE_URL}/events',
        'public_blog': f'{BASE_URL}/blog',
        'public_contact': f'{BASE_URL}/contact',
    }
    
    @classmethod
    def get_url(cls, key):
        """Get URL by key"""
        return cls.URLs.get(key, cls.BASE_URL)

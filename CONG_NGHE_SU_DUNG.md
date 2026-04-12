# PHẠM VI CÔNG NGHỆ SỬ DỤNG TRONG ĐỒ ÁN

## 1. TỔNG QUAN KIẾN TRÚC

### Mô hình kiến trúc: MVC (Model - View - Controller)
- **Model**: Mongoose schemas cho MongoDB
- **View**: EJS (Embedded JavaScript Templates)
- **Controller**: Express.js route handlers

### Kiểu ứng dụng: Server-Side Rendering (SSR)
Website được render hoàn toàn phía server, gửi HTML đầy đủ về client.

---

## 2. BACKEND TECHNOLOGIES

### 2.1 Runtime Environment
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **Node.js** | >= 18.x | JavaScript runtime cho server-side |

### 2.2 Web Framework
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **Express.js** | 4.18.2 | Web framework chính cho Node.js |
| **express-ejs-layouts** | 2.5.1 | Hỗ trợ layout template cho EJS |
| **express-session** | 1.17.3 | Quản lý session người dùng |

### 2.3 Database
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **MongoDB** | Cloud (Atlas) | NoSQL database lưu trữ dữ liệu |
| **Mongoose** | 7.0.0 | ODM (Object Data Modeling) cho MongoDB |

### 2.4 Authentication & Security
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **bcryptjs** | 2.4.3 | Mã hóa password với bcrypt algorithm |
| **express-session** | 1.17.3 | Session-based authentication |

### 2.5 Utilities
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **dotenv** | 16.0.3 | Quản lý biến môi trường (.env files) |
| **path** | 0.12.7 | Xử lý đường dẫn file system |

---

## 3. FRONTEND TECHNOLOGIES

### 3.1 Template Engine
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **EJS** | 3.1.8 | Embedded JavaScript Templates |

### 3.2 Styling
| Công nghệ | Mô tả |
|-----------|-------|
| **CSS3** | Pure CSS với custom properties (variables) |
| **Responsive Design** | Media queries cho mobile/tablet/desktop |
| **Flexbox & Grid** | Modern CSS layout techniques |

### 3.3 Client-side JavaScript
| Công nghệ | Mô tả |
|-----------|-------|
| **Vanilla JavaScript** | ES6+ syntax |
| **DOM Manipulation** | Native DOM APIs |
| **Fetch API** | AJAX requests |

---

## 4. DEVELOPMENT TOOLS

### 4.1 Development Dependencies
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| **nodemon** | 2.0.20 | Auto-restart server khi code thay đổi |

### 4.2 Scripts
```json
{
  "start": "node server.js",      // Production
  "dev": "nodemon server.js",     // Development với auto-reload
  "seed": "node scripts/seed-data.js"  // Seed dữ liệu mẫu
}
```

---

## 5. CẤU TRÚC THƯ MỤC

```
restaurant-website/
├── config/                 # Cấu hình database
│   └── database.js
├── controllers/            # Business logic
│   ├── blogController.js
│   ├── branchController.js
│   ├── contactController.js
│   ├── dishController.js
│   ├── eventController.js
│   ├── orderController.js
│   ├── reservationController.js
│   ├── revenueController.js
│   └── userController.js
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Dish.js
│   ├── Branch.js
│   ├── Order.js
│   ├── Reservation.js
│   ├── Event.js
│   ├── Blog.js
│   ├── Contact.js
│   ├── Payment.js
│   └── Notification.js
├── routes/                 # Express routes
│   ├── public.js          # Public routes (guest)
│   ├── user.js            # User authenticated routes
│   ├── auth.js            # Authentication routes
│   └── admin/             # Admin routes
│       ├── index.js
│       ├── dishes.js
│       ├── branches.js
│       ├── events.js
│       ├── blog.js
│       ├── orders.js
│       ├── reservations.js
│       ├── users.js
│       ├── contacts.js
│       └── revenue.js
├── views/                  # EJS templates
│   ├── layout.ejs         # Master layout
│   ├── 404.ejs
│   ├── error.ejs
│   ├── public/            # Public pages
│   ├── user/              # User pages
│   └── admin/             # Admin pages
├── public/                 # Static files
│   ├── css/
│   │   └── style.css
│   └── images/
├── scripts/                # Utility scripts
│   └── seed-data.js
├── server.js              # Entry point
└── package.json
```

---

## 6. DATABASE SCHEMA

### 6.1 Collections (10 collections)

| Collection | Mô tả | Quan hệ |
|------------|-------|---------|
| **users** | Người dùng hệ thống | - |
| **dishes** | Món ăn | Belongs to branches |
| **branches** | Chi nhánh nhà hàng | Has many dishes |
| **orders** | Đơn đặt hàng | Belongs to user, branch |
| **reservations** | Đặt bàn | Belongs to user, branch |
| **events** | Sự kiện khuyến mãi | References branches, dishes |
| **blogs** | Bài viết tin tức | - |
| **contacts** | Liên hệ phản hồi | - |
| **payments** | Thanh toán | Belongs to order |
| **notifications** | Thông báo admin | References order, user |

### 6.2 Relationships

```
User (1) -----> (N) Order
User (1) -----> (N) Reservation
Branch (1) -----> (N) Dish
Branch (1) -----> (N) Order
Branch (1) -----> (N) Reservation
Order (1) -----> (1) Payment
Event (N) <----> (N) Branch
Event (N) <----> (N) Dish
```

---

## 7. AUTHENTICATION & AUTHORIZATION

### 7.1 Authentication Method
- **Session-based Authentication**
- Sử dụng `express-session` với cookie
- Password được hash bằng `bcryptjs`

### 7.2 Authorization Roles

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| **Guest** | Khách chưa đăng nhập | Xem menu, blog, chi nhánh, sự kiện |
| **User** | Người dùng đã đăng nhập | Đặt món, đặt bàn, thanh toán, xem lịch sử |
| **Admin** | Quản trị viên | Toàn quyền quản lý hệ thống |

### 7.3 Session Configuration
```javascript
{
  secret: "restaurant-secret-key-2024",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7 days }
}
```

---

## 8. API ROUTES STRUCTURE

### 8.1 Public Routes (`/`)
| Method | Route | Mô tả |
|--------|-------|-------|
| GET | `/` | Trang chủ |
| GET | `/menu` | Danh sách món ăn |
| GET | `/menu/:id` | Chi tiết món ăn |
| GET | `/branches` | Danh sách chi nhánh |
| GET | `/branches/:id` | Chi tiết chi nhánh |
| GET | `/events` | Danh sách sự kiện |
| GET | `/events/:id` | Chi tiết sự kiện |
| GET | `/blog` | Danh sách tin tức |
| GET | `/blog/:id` | Chi tiết bài viết |
| GET | `/about` | Giới thiệu |
| GET | `/contact` | Trang liên hệ |
| POST | `/contact` | Gửi phản hồi |

### 8.2 Auth Routes (`/auth`)
| Method | Route | Mô tả |
|--------|-------|-------|
| GET | `/login` | Form đăng nhập |
| POST | `/login` | Xử lý đăng nhập |
| GET | `/register` | Form đăng ký |
| POST | `/register` | Xử lý đăng ký |
| GET | `/logout` | Đăng xuất |

### 8.3 User Routes (`/user`)
| Method | Route | Mô tả |
|--------|-------|-------|
| GET | `/profile` | Trang cá nhân |
| POST | `/profile` | Cập nhật thông tin |
| GET | `/cart` | Giỏ hàng |
| POST | `/cart/add/:id` | Thêm vào giỏ |
| POST | `/cart/remove/:id` | Xóa khỏi giỏ |
| GET | `/checkout` | Trang thanh toán |
| POST | `/checkout` | Xử lý đặt hàng |
| GET | `/orders` | Lịch sử đơn hàng |
| GET | `/reservation` | Form đặt bàn |
| POST | `/reservation` | Xử lý đặt bàn |
| GET | `/payment/:id` | Trang thanh toán |
| POST | `/payment/:id` | Xử lý thanh toán |

### 8.4 Admin Routes (`/admin`)
| Method | Route | Mô tả |
|--------|-------|-------|
| GET | `/` | Dashboard |
| CRUD | `/dishes/*` | Quản lý món ăn |
| CRUD | `/branches/*` | Quản lý chi nhánh |
| CRUD | `/events/*` | Quản lý sự kiện |
| CRUD | `/blogs/*` | Quản lý blog |
| CRUD | `/orders/*` | Quản lý đơn hàng |
| CRUD | `/reservations/*` | Quản lý đặt bàn |
| CRUD | `/users/*` | Quản lý người dùng |
| GET | `/contacts` | Quản lý liên hệ |
| GET | `/revenue` | Thống kê doanh thu |

---

## 9. SECURITY MEASURES

### 9.1 Implemented Security
| Biện pháp | Mô tả |
|-----------|-------|
| **Password Hashing** | bcryptjs với salt rounds |
| **Session Management** | HTTP-only cookies |
| **Input Validation** | Server-side validation |
| **Role-based Access** | Middleware kiểm tra quyền |
| **Rate Limiting** | Giới hạn 3 contact/giờ |

### 9.2 Middleware Protection
```javascript
// Check Admin Role
const checkAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/auth/login');
  }
  next();
};

// Check User Login
const checkUser = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};
```

---

## 10. BUSINESS RULES

### 10.1 Quy tắc thanh toán
| Giá trị đơn hàng | Phương thức cho phép |
|------------------|---------------------|
| < 10,000,000 VND | COD hoặc QR Banking |
| >= 10,000,000 VND | Chỉ QR Banking |
| >= 100,000,000 VND | QR Banking + Thông báo Admin |

### 10.2 Quy tắc đặt bàn
- Chỉ đặt bàn tại chi nhánh còn bàn trống
- Tự động giảm số bàn khi đặt thành công
- Cho phép đặt món kèm theo khi đặt bàn

### 10.3 Quy tắc giảm giá
- Giảm giá theo sự kiện (event-based)
- Giảm giá theo chi nhánh hoặc toàn hệ thống
- Giảm giá theo món ăn cụ thể

---

## 11. RESPONSIVE DESIGN

### 11.1 Breakpoints
```css
/* Mobile First */
/* Default: Mobile (< 768px) */

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Large Desktop */
@media (min-width: 1200px) { }
```

### 11.2 Layout Techniques
- **Flexbox**: Navigation, cards, forms
- **CSS Grid**: Menu grid, dashboard stats
- **Media Queries**: Responsive adjustments

---

## 12. DEPLOYMENT

### 12.1 Requirements
- Node.js >= 18.x
- MongoDB (Local hoặc Atlas)
- Environment variables

### 12.2 Environment Variables
```env
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your-secret-key
PORT=3000
NODE_ENV=production
```

### 12.3 Deployment Platforms
- **Vercel** (Serverless)
- **Heroku** (PaaS)
- **VPS** (Traditional hosting)

---

## 13. TỔNG KẾT CÔNG NGHỆ

### Backend Stack
```
Node.js + Express.js + MongoDB + Mongoose
```

### Frontend Stack
```
EJS + CSS3 + Vanilla JavaScript
```

### Architecture Pattern
```
MVC (Model-View-Controller)
```

### Authentication
```
Session-based với bcrypt password hashing
```

### Deployment Ready
```
Vercel Serverless / Traditional VPS
```

---

**Tài liệu được tạo tự động từ codebase**  
**Phiên bản**: 1.0.0  
**Ngày cập nhật**: 2024

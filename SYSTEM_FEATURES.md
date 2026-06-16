# Hệ Thống Quản Lý Nhà Hàng - Tài Liệu Chức Năng

## Tổng Quan Hệ Thống

Đây là một nền tảng quản lý nhà hàng toàn diện với các module cho khách hàng, nhân viên, và quản trị viên. Hệ thống hỗ trợ đặt hàng trực tuyến, quản lý chi nhánh, quản lý nhân viên, theo dõi doanh thu, và nhiều tính năng khác.

---

## 1. QUẢN LÝ NGƯỜI DÙNG (User Management)

### Chức Năng Khách Hàng
- **Đăng Ký / Đăng Nhập**: Tạo tài khoản, xác thực email, reset mật khẩu
- **Hồ Sơ Người Dùng**: 
  - Xem/chỉnh sửa thông tin cá nhân
  - Quản lý địa chỉ giao hàng
  - Lịch sử đơn hàng
  - Yêu thích (Favorites)

### Chức Năng Quản Trị (Admin)
- Quản lý tất cả người dùng
- Xem lịch sử hoạt động
- Kiểm soát quyền truy cập

---

## 2. QUẢN LÝ MENU (Dishes Management)

### Tính Năng
- **Thêm/Sửa/Xóa Món Ăn**: Quản lý tên, mô tả, giá, hình ảnh
- **Phân Loại**: Khai vị, Món chính, Tráng miệng, Đồ uống
- **Quản Lý Số Lượng**: Theo dõi tồn kho, tự động ẩn khi hết
- **Giảm Giá**: Thiết lập % giảm giá cho từng món
- **Thống Kê Đơn Hàng**: Theo dõi số lần đặt hàng, xác định món nổi bật
- **Hiển Thị Trang Chủ**: Hình ảnh, giá, số lượng con, nút thêm vào giỏ

---

## 3. QUẢN LÝ SẢN PHẨM (Product Management)

### Tính Năng
- **Thêm/Sửa/Xóa Sản Phẩm**: Quản lý sản phẩm kinh doanh (không bán tại chi nhánh)
- **Số Lượng & Tồn Kho**: 
  - Theo dõi số lượng có sẵn
  - Khi hết hàng sẽ hiển thị "Cháy Hàng" (không bị ẩn)
- **Sản Phẩm HOT**:
  - Đánh dấu sản phẩm là HOT thủ công
  - Tự động trở thành HOT nếu đạt 100+ đơn hàng
  - Hiển thị ở section riêng trên trang chủ
  - Badge đỏ/cam HOT ở góc hình ảnh
- **Giảm Giá**: Áp dụng % giảm giá chung cho toàn hệ thống
- **Hiển Thị**:
  - Section sản phẩm thường trên trang chủ
  - Section sản phẩm HOT riêng biệt
  - Trang /products để xem toàn bộ

---

## 4. QUẢN LÝ CHI NHÁNH (Branch Management)

### Tính Năng
- **Thêm/Sửa/Xóa Chi Nhánh**: Thông tin chi nhánh
- **Thông Tin Chi Nhánh**:
  - Tên, địa chỉ, số điện thoại, email
  - Ảnh và thư viện ảnh
  - Giờ mở cửa
  - Số bàn có sẵn
  - Mô tả chi nhánh
- **Mục Đích**: Quảng bá chi nhánh, không quản lý menu riêng
- **Tính Năng Quản Lý Nhân Viên**: Quản lý nhân viên per chi nhánh
- **Đặt Bàn**: Hỗ trợ đặt bàn ăn tại chi nhánh

---

## 5. QUẢN LÝ ĐƠN HÀNG (Order Management)

### Loại Đơn Hàng
- **Giao Hàng (Delivery)**: Ship COD, chuyển khoản, QR code
- **Dine-In (Ăn Tại Chỗ)**: Đặt bàn tại chi nhánh
- **Đơn Khách Vãng Lai**: Nhân viên tạo đơn cho khách không đăng ký

### Chức Năng Giỏ Hàng
- Thêm/xóa/cập nhật số lượng món ăn và sản phẩm
- Xác thực tồn kho khi thêm/cập nhật
- Tính tổng tiền, chiết khấu
- Thanh toán tại checkout

### Phương Thức Thanh Toán
- **COD (Tiền Mặt)**: Thanh toán khi nhận hàng
- **Chuyển Khoản**: Bằng số IBAN
- **QR Code**: Thanh toán qua mã QR (Momo, ZaloPay, v.v.)
- **Tiền Mặt Tại Quầy**: Cho đơn dine-in

### Quy Trình Đơn Hàng
1. Tạo giỏ hàng
2. Checkout (xác thực tồn kho)
3. Chọn phương thức thanh toán
4. Xác nhận thanh toán
5. Trạng thái: Pending → Paid → Completed/Delivered
6. Tự động cập nhật số lần đặt hàng cho sản phẩm

### Admin Xem Đơn Hàng
- Danh sách tất cả đơn hàng
- Lọc theo trạng thái, ngày, loại đơn
- Chi tiết đơn hàng (items, khách hàng, thanh toán)

---

## 6. QUẢN LÝ THANH TOÁN (Payment Management)

### Tính Năng
- Ghi nhận thanh toán hoàn tất
- Lưu lịch sử giao dịch (Transaction ID)
- Phân loại doanh thu:
  - **Delivery**: Giao hàng
  - **Reception**: Đơn dine-in tại quầy
  - **Guest Order**: Đơn khách vãng lai
- Thông tin người nhận tiền (Shipper) hoặc nhân viên
- Lưu deposit nếu có

---

## 7. QUẢN LÝ ĐẶT BÀN (Reservation Management)

### Chức Năng
- **Đặt Bàn Online**: Khách chọn chi nhánh, ngày, giờ, số bàn
- **Xác Thực Bàn**: Kiểm tra bàn có sẵn
- **Yêu Cầu Đặc Biệt**: Ghi chú thêm
- **Thanh Toán Deposit** (tùy chọn)
- **Admin Xem Booking**:
  - Danh sách đặt bàn
  - Lọc theo chi nhánh, ngày, trạng thái
  - Xác nhận/hủy booking
  - Theo dõi số bàn

---

## 8. QUẢN LÝ DOANH THU (Revenue Management)

### Tính Năng
- Thống kê doanh thu theo:
  - Loại đơn hàng (Delivery, Dine-in, Guest)
  - Chi nhánh
  - Ngày/Tháng/Năm
  - Phương thức thanh toán
- Biểu đồ doanh thu (có thể thêm vào sau)
- Xuất báo cáo

---

## 9. QUẢN LÝ NHÂN VIÊN (Staff Management)

### Loại Nhân Viên
- **Nhân Viên Tiếp Tân (Reception)**: Tạo đơn, quản lý bàn
- **Nhân Viên Giao Hàng (Shipper)**: Giao đơn
- **Nhân Viên Khác**: Dành cho tương lai

### Chức Năng
- **Thêm/Sửa/Xóa Nhân Viên**: 
  - Tên, email, phone, ảnh đại diện
  - Chọn chi nhánh
  - Gán quyền
- **Đăng Nhập Nhân Viên**: Tài khoản riêng
- **Dashboard Nhân Viên**: Xem đơn hàng, tạo đơn
- **Theo Dõi Hoạt Động**: Ai tạo đơn, giao hàng

---

## 10. QUẢN LÝ BLOG (Blog Management)

### Tính Năng
- **Thêm/Sửa/Xóa Bài Viết**: Tên, mô tả, nội dung, ảnh
- **Phân Loại Blog**: Tin tức, chia sẻ công thức, v.v.
- **Hiển Thị Công Khai**: Trang blog công cộng
- **Admin**: Xem danh sách bài viết

---

## 11. QUẢN LÝ SỰ KIỆN (Event Management)

### Tính Năng
- **Thêm/Sửa/Xóa Sự Kiện**: Tên, mô tả, ngày, ảnh
- **Liên Kết Chi Nhánh**: Sự kiện tại chi nhánh nào
- **Hiển Thị Công Khai**: Trang sự kiện
- **Admin**: Quản lý danh sách sự kiện

---

## 12. QUẢN LÝ LIÊN HỆ (Contact Management)

### Tính Năng
- **Biểu Mẫu Liên Hệ**: Khách gửi tin nhắn
- **Admin Xem Tin Nhắn**: Danh sách liên hệ, chi tiết
- **Trả Lời**: Gửi email trả lời (có thể thêm)

---

## 13. QUẢN LÝ THÔNG BÁO (Notification Management)

### Tính Năng
- Gửi thông báo cho người dùng
- Theo dõi trạng thái đơn hàng
- Nhắc nhở đặt bàn
- Quảng cáo sản phẩm/sự kiện mới

---

## 14. TRANG CÔNG KHAI (Public Pages)

### Trang Chính (Home)
- Hiển thị:
  - Lời chào, thông tin quán
  - Danh sách đặc sắc (Featured Dishes)
  - Section sản phẩm thường
  - Section sản phẩm HOT với badge đỏ
  - Danh sách chi nhánh
  - Blog bài viết mới
  - Sự kiện sắp tới
  - CTA: Đặt hàng, Đặt bàn, Liên hệ

### Trang Menu (/menu)
- Hiển thị tất cả món ăn
- Lọc theo loại (Khai vi, Món chính, v.v.)
- Tìm kiếm
- Hiển thị giá, ảnh, số lượng còn, nút thêm giỏ
- Nếu hết hàng: Ẩn khỏi menu

### Trang Sản Phẩm (/products)
- Hiển thị tất cả sản phẩm
- Lọc, tìm kiếm
- Giá, ảnh, số lượng còn
- Nếu hết hàng: Vẫn hiển thị nhưng kèm "Cháy Hàng"

### Trang Chi Tiết Sản Phẩm (/product/:id)
- Ảnh lớn, ảnh thêm
- Tên, mô tả, giá
- Nếu hết: "Cháy Hàng - Tạm không thể đặt"
- Nếu đủ: Chọn số lượng, thêm giỏ
- Rating, review (có thể thêm)

### Trang Chi Nhánh (/branches)
- Danh sách chi nhánh
- Ảnh, tên, địa chỉ, phone
- Giờ mở cửa
- CTA: Đặt bàn, Gọi, Liên hệ

### Trang Chi Tiết Chi Nhánh
- Thông tin chi tiết
- Thư viện ảnh
- Bàn có sẵn
- Nút đặt bàn

### Trang Blog (/blog)
- Danh sách bài viết
- Ảnh, tiêu đề, ngày đăng
- Link xem chi tiết

### Trang Sự Kiện (/events)
- Danh sách sự kiện
- Ảnh, tên, ngày, mô tả
- Liên kết chi nhánh

### Trang Liên Hệ (/contact)
- Biểu mẫu gửi tin nhắn
- Thông tin quán (phone, email, address)
- Google Maps (nếu có)

---

## 15. TÍNH NĂNG KHÁCH HÀNG (Customer Features)

### Giỏ Hàng & Thanh Toán
- Session-based cart
- Xác thực tồn kho thời gian thực
- Tính giảm giá tự động
- Checkout an toàn

### Lịch Sử Đơn Hàng
- Xem tất cả đơn đã đặt
- Chi tiết đơn (items, giá, trạng thái)
- Hủy đơn nếu chưa xác nhận

### Đặt Bàn
- Chọn chi nhánh
- Chọn ngày, giờ, số bàn
- Ghi chú đặc biệt
- Xác nhận booking

---

## 16. TÍNH NĂNG QUẢN TRỊ (Admin Dashboard)

### Bảng Điều Khiển (Dashboard)
- Tóm tắt doanh thu hôm nay
- Đơn hàng mới
- Booking mới
- Thông báo quan trọng

### Quản Lý Chính
- **Đơn Hàng**: Xem, lọc, chi tiết, in hóa đơn
- **Thanh Toán**: Lịch sử giao dịch, thống kê
- **Sản Phẩm & Món Ăn**: CRUD, quản lý số lượng
- **Chi Nhánh**: CRUD, quản lý nhân viên
- **Booking**: Xem, xác nhận, hủy
- **Nhân Viên**: Thêm, sửa, xóa, gán quyền
- **Doanh Thu**: Biểu đồ, báo cáo
- **Blog & Sự Kiện**: Quản lý nội dung

### Quản Lý Người Dùng
- Danh sách tất cả user
- Xem thông tin user
- Xóa tài khoản nếu cần

### Cài Đặt
- Thông tin quán (tên, logo, phone, email)
- Giờ mở cửa mặc định
- Chính sách vận chuyển
- Thông tin thanh toán

---

## 17. TÍNH NĂNG NHÂN VIÊN TIẾP TÀN (Reception Features)

### Tạo Đơn Cho Khách
- Chọn khách từ danh sách hoặc tạo mới
- Chọn món ăn, sản phẩm
- Tính giá tự động
- Chọn phương thức thanh toán
- Xác nhận đơn

### Quản Lý Bàn
- Xem bàn đã đặt
- Dánh dấu bàn sẵn sàng
- Dánh dấu bàn thanh toán xong
- Xóa bàn

### Xem Đơn Hàng
- Danh sách đơn hôm nay
- Chi tiết từng đơn
- In hóa đơn

---

## 18. TÍNH NĂNG SHIPPER (Delivery Features)

### Quản Lý Giao Hàng
- Danh sách đơn cần giao
- Chi tiết địa chỉ, phone khách
- Lịch sử giao hàng
- Cập nhật trạng thái giao hàng
- Nhận tiền COD

---

## 19. TÍNH NĂNG BẢO MẬT (Security)

### Xác Thực
- Đăng ký/Đăng nhập
- Session quản lý
- Reset mật khẩu qua email
- Kiểm soát quyền truy cập theo vai trò

### Bảo Vệ Dữ Liệu
- Mật khẩu hashed
- Kiểm tra quyền trên mỗi route
- SQL injection prevention (Parameterized queries)
- CSRF protection

---

## 20. TÍNH NĂNG KHÁC

### Tìm Kiếm
- Tìm kiếm món ăn, sản phẩm
- Tìm kiếm blog, sự kiện

### Lọc & Sắp Xếp
- Lọc theo loại, giá, chi nhánh
- Sắp xếp theo tên, giá, ngày

### Hình Ảnh
- Upload ảnh cho sản phẩm, chi nhánh, blog, sự kiện
- Lưu trữ URL
- Hiển thị responsive

### Email
- Thông báo đơn hàng (nếu thêm)
- Reset mật khẩu
- Liên lạc khách hàng (nếu thêm)

---

## CÔNG NGHỆ SỬ DỤNG

### Backend
- **Node.js + Express.js**: Server web
- **MongoDB**: Database NoSQL
- **Session**: Quản lý session người dùng

### Frontend
- **EJS**: Templating engine
- **CSS3 + Flexbox/Grid**: Styling responsive
- **JavaScript**: Tương tác, validation

### Kiến Trúc
- **MVC Pattern**: Models, Controllers, Routes, Views
- **RESTful API**: GET, POST, PUT, DELETE
- **Session-based**: Lưu giỏ hàng trong session

---

## CẤU TRÚC THƯ MỤC

```
project/
├── models/           # Database schemas
├── controllers/      # Business logic
├── routes/          # API endpoints
├── views/           # HTML templates
│   ├── admin/       # Admin pages
│   ├── public/      # Customer pages
│   ├── user/        # User pages
│   ├── reception/   # Reception staff pages
│   └── shipper/     # Shipper pages
├── public/          # Static assets (images, CSS, JS)
├── utils/           # Helper functions
└── app.js           # Main server file
```

---

## TRANG THÁI PHÁT TRIỂN

**Hoàn Thành:**
- Quản lý người dùng, món ăn, sản phẩm, chi nhánh
- Giỏ hàng, thanh toán, đơn hàng
- Đặt bàn, quản lý nhân viên
- Blog, sự kiện, liên hệ
- Dashboard admin

**Có Thể Thêm:**
- Review/Rating sản phẩm
- Gợi ý dựa trên AI
- Chat với nhân viên
- Loyalty program
- Integration thanh toán (Momo, ZaloPay)
- Mobile app
- Real-time notification
- Analytics dashboard

---

**Cập nhật lần cuối**: 2024
**Phiên bản**: 1.0

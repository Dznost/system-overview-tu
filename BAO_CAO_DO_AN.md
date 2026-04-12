## CHUONG 2: CO SO LY THUYET VA CONG NGHE CSDL

### 2.0 Mo hinh Kien truc He Thong Quan Ly Nha Hang

#### 2.0.1 So do phan cap chuc nang he thong

He thong quan ly nha hang "La Maison" duoc thiet ke theo mo hinh phan cap voi cac module chinh sau:

```
                                    ┌─────────────────────────────────────────────────────────────────┐
                                    │         HE THONG QUAN LY NHA HANG "LA MAISON"                 │
                                    └──────────────────┬──────────────────────────────────────────────┘
                                                       │
                ┌──────────────────┬───────────────────┼───────────────────┬──────────────────┐
                │                  │                   │                   │                  │
          ┌─────▼─────┐      ┌────▼─────┐      ┌────▼─────┐      ┌────▼─────┐      ┌─────▼─────┐
          │  Quan Ly  │      │  Quan Ly │      │  Quan Ly │      │  Quan Ly │      │  Quan Ly  │
          │ Nhan Su   │      │  Thuc Don│      │ Chi Nhanh│      │  Dat Ban │      │ Don Hang  │
          │  & Tai    │      │          │      │          │      │          │      │           │
          │  Khoan    │      │          │      │          │      │          │      │           │
          └─────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘      └─────┬─────┘
                │                 │                 │                 │                   │
        ┌───────┴──────┐      ┌───┴────┐      ┌───┴────┐      ┌──────┴──────┐      ┌────┴─────┐
        │              │      │        │      │        │      │             │      │          │
  ┌─────▼────┐   ┌────▼───┐   │ Thuc   │      │Thong   │  ┌───▼───┐   ┌───▼───┐ ┌──▼──┐ ┌──▼──┐
  │  Quan Ly │   │ Quan Ly│   │ Don    │      │Tin     │  │ Mo    │   │ Huy   │ │Tao  │ │ Cap │
  │  Giao    │   │ Tai    │   │ Va Danh│      │Nha     │  │ Lop   │   │ Lop   │ │Don  │ │Nhat │
  │  Vien    │   │Khoan   │   │ Gia    │      │Hang    │  └───┬───┘   └───┬───┘ │Hang │ │Don  │
  │          │   │Nhan    │   │        │      │        │      │           │     └─────┘ └─────┘
  └──────────┘   │Vien    │   └────────┘      └────────┘      └───────────┴────────┐
                 └────────┘                                                         │
                                                                              ┌──────▼──────┐
                                                                              │Xem Chi Tiet  │
                                                                              │ Don Hang     │
                                                                              └──────────────┘
                │                  │                   │                   │
          ┌─────▼─────────────┐   │           ┌──────▼───────┐          │
          │                   │   │           │              │          │
          │ Quan Ly Khach     │   │      ┌────▼────┐    ┌───▼───┐   ┌──▼──┐
          │ Hang & Danh Gia   │   │      │ Hoa Don │    │ Thanh │   │ Danh │
          │                   │   │      │ Chi Phi │    │ Toan  │   │ Gia  │
          └─────┬─────────────┘   │      │ Khac    │    │ Tien  │   │ & NX │
                │                  │      └────┬────┘    └───┬───┘   └──┬───┘
        ┌───────┴────────────┐     │           │            │          │
        │                    │     │      ┌────┴────┐   ┌───┴────┐  ┌──┴────┐
        │                    │     │      │ Tien    │   │ Xem Chi│  │ Rate & │
  ┌─────▼────┐         ┌────▼───┐ │      │ Mat     │   │ Tiet   │  │ Comment│
  │  Ghi     │         │ Theo   │ │      │ Khac    │   │ Don    │  │        │
  │ Danh &   │         │ Doi Co │ │      │         │   │ Hang   │  │        │
  │Quan Ly   │         │ So Yeu │ │      └─────────┘   └────────┘  └────────┘
  │ Tai      │         │ Cau    │ │
  │ Khoan    │         │        │ │
  └──────────┘         └────────┘ │
                                  │
                           ┌──────▼──────────┐
                           │ Quan Ly Danh    │
                           │ Gia & Nhan Xet  │
                           │ (Rating & Review)
                           └─────────────────┘
```

#### 2.0.2 Mo ta chi tiet Kien truc Phan Cap He Thong Quan Ly Nha Hang

**Mo ta tong the kien truc:**

He thong quan ly nha hang "La Maison" duoc thiet ke theo mo hinh phan cap 3 level:
- **Level 0 (Nhip tim):** He thong chinh - Diem ket noi tap trung
- **Level 1 (Cac Module Chinh):** 5 module chinh (nhan su, thuc don, chi nhanh, dat ban, don hang)
- **Level 2 (Chuc nang Phu):** Nhieu tac vu chi tiet thuoc tung module
- **Level 3 (Tac vu Chi tiet):** Cac thao tac cu the hang ngay

**I. NHIP TIM HE THONG (Central Hub) - "LA MAISON RESTAURANT MANAGEMENT SYSTEM"**

Toan bo he thong duoc co ti dieu khien boi mot nhip tim trung tam:
- Quan ly xac thuc nguoi dung (login, logout, OAuth)
- Kiem soat phan quyen truy cap (authentication & authorization)
- Ket noi den tat ca 5 module chinh
- Luu tru va quan ly tat ca du lieu trong MongoDB

**II. MODULE 1: QUAN LY NHAN SU & TAI KHOAN (Human Resources & Account Management)**

Dieu chinh: Nhan vien quan ly, hoc vien, tai khoan va phan quyen

*Chuc nang phu 1a: Quan Ly Giao Vien (Staff Management)*
- **Them giao vien moi:** Admin nhap thong tin (ten, sdt, email, vi tri, tien luong, ngay bat dau)
- **Cap nhat thong tin giao vien:** Chinh sua thong tin nhan su, cap nhat vi tri, gan chi nhanh
- **Xoa giao vien:** Xoa tai khoan giao vien khoi he thong
- **Gan chi nhanh:** Phan cong giao vien vao chi nhanh (1 giao vien co the phu trach 1 hoac nhieu chi nhanh)
- **Quan ly luong:** Tinh toan luong thang, thuong, phat dung cac quy dinh
- **Theo doi trang thai:** Xem nhan vien hoat dong, khong hoat dong, nghi phep

*Chuc nang phu 1b: Quan Ly Tai Khoan Nhan Vien (Employee Account Management)*
- **Tao tai khoan Shipper (Nhan vien Giao hang):** Dang ky account voi email/password, assign vi tri shipper
- **Tao tai khoan Staff (Nhan vien Nha bep/Phuc vu):** Dang ky account cho nhan vien bep hoac phuc vu
- **Tao tai khoan Reception (Nhan vien Tiep tan):** Dang ky account cho reception, phu trach dat ban & don hang
- **Tao tai khoan Admin:** Dang ky account quan ly toi cao (co quyen chinh sua tat ca)
- **Cap nhat quyen han:** Thay doi quyen han truy cap (read, write, delete) cho tung tai khoan
- **Reset mat khau:** Dat lai mat khau neu nhan vien quen
- **Lock/Unlock account:** Khoa tai khoan neu co hanh vi dieu thi hoac khi nhan vien roi viec

**III. MODULE 2: QUAN LY THUC DON (Menu Management)**

Dieu chinh: Mon an, gia tien, anh thuc don, danh gia va nhan xet

*Chuc nang phu 2a: Quan Ly Mon An (Dish Management)*
- **Them mon an moi:** Nhap thong tin (ten mon, mo ta, thanh phan, gia goc, anh, loai mon)
- **Cap nhat thong tin mon:** Thay doi gia, anh, mo ta chi tiet, thanh phan
- **Xoa mon an:** Xoa mon khong kinh doanh nua (man hoac san sang - soft delete)
- **Sap xep thuc don:** Sap xep mon an theo loai (khai vi, chinh, trang mieng, nuoc uong)
- **Kiem tra ton kho:** Xem so luong mon con trong kho, canh bao khi het hang
- **Quan ly gia tien:** Cap nhat gia, them khuyến mai (discount %) cho tung mon
- **Upload anh:** Upload anh mon an voi kich thuoc toi uu cho trang web

*Chuc nang phu 2b: Quan Ly Danh Gia & Nhan Xet (Rating & Review Management - Menu)*
- **Xem danh gia mon an:** Hien thi tat ca danh gia (1-5 sao) tu khach hang
- **Sap xep danh gia:** Sap xep theo so sao (cao den thap hoac thap den cao), thoi gian (moi nhat truoc)
- **Loc danh gia:** Loc danh gia theo so sao hoac khoang thoi gian (tuan, thang, nam)
- **Xoa danh gia pham nhan:** Admin co quyen xoa danh gia khong hop le (spam, loi lech)
- **Xem chi tiet nhan xet:** Xem full comment va danh sach mon an duoc danh gia

**IV. MODULE 3: QUAN LY CHI NHANH (Branch Management)**

Dieu chinh: Dia diem, tai nguyen, ban an, nhan vien, doanh thu theo chi nhanh

*Chuc nang phu 3a: Quan Ly Thong Tin Chi Nhanh (Branch Information)*
- **Them chi nhanh moi:** Nhap ten chi nhanh, dia chi, sdt, email, gio hoat dong, so ban tong cong
- **Cap nhat thong tin chi nhanh:** Thay doi dia chi, gio hoat dong, sdt, email, anh
- **Xoa chi nhanh:** Xoa chi nhanh khong con hoat dong (luu lai trang thai cu)
- **Xem danh sach chi nhanh:** Hien thi tat ca chi nhanh voi thong tin co ban

*Chuc nang phu 3b: Quan Ly Tai Nguyen Chi Nhanh (Branch Resources)*
- **So luong ban:** Ghi nhan tong so ban, so ban trong, so ban dang su dung
- **So luong nhan vien:** Xem so nhan vien dang lam viec (staff, shipper, reception)
- **Trang thai ban:** Theo doi trang thai real-time (trong, co khach, sap kem, bao tri)
- **Thong tin tai chinh:** Xem doanh thu, chi phi theo chi nhanh, so sanh giua cac chi nhanh
- **Hang hang:** Theo doi tinh trang hang (sap het mon, can bo sung kho)

**V. MODULE 4: QUAN LY DAT BAN (Reservation Management)**

Dieu chinh: Dat ban, kiem tra san sang, xac nhan, huy, cap nhat, danh gia

*Chuc nang phu 4a: Tao Dat Ban (Create Reservation)*
- **Khach hang dat ban:** Khach hang hoac reception tao dat ban voi thong tin (ho ten, sdt, ngay, gio, so nguoi)
- **Kiem tra san san:** He thong tu dong kiem tra ban trong, ghi nhan trang thai ban
- **Gan nhan vien phu trach:** Tuy chon giao vien (staff hoac reception) phu trach ban
- **Them ghi chu dac biet:** Thong tin yeu cau (ban cao cap, an chay, an vang, v.v)
- **Xac nhan dat ban:** Cap nhat trang thai sang "confirmed", luu notification

*Chuc nang phu 4b: Huy Dat Ban (Cancel Reservation)*
- **Huy dat ban:** Khach hang or nhan vien yeu cau huy dat ban
- **Cap nhat trang thai:** Chuyen trang thai thanh "cancelled", tang lai so ban trong
- **Tinh hoan tien:** Ap dung chinh sach hoan tien (neu co)
- **Ghi chu:** Luu ly do huy (khach yeu cau, nhan vien huy, het han, v.v)

*Chuc nang phu 4c: Cap Nhat Dat Ban (Update Reservation)*
- **Thay doi thoi gian:** Dui hoac som lich dat ban neu khach yeu cau
- **Thay doi so luong:** Tang/giam so luong khach se den (neu con ban trong)
- **Thay doi nhan vien:** Gan lai nhan vien phu trach neu can
- **Them mon an truoc:** Khach hang chon mon an truoc de nha bep chuan bi san

**VI. MODULE 5: QUAN LY DON HANG (Order Management)**

Dieu chinh: Tao don, mon an, trang thai don hang, thanh toan, giao hang, danh gia

*Chuc nang phu 5a: Tao Don Hang (Create Order)*
- **Khach hang dat hang truc tuyen:** Khach dang nhap vao web/app, chon mon an, them vao gio hang
- **Nhan vien reception tao don:** Reception tao don hang cho khach dat tai quay
- **Chon mon an:** Hien thi danh sach mon an, khach chon + so luong, he thong tinh tien
- **Them yeu cau:** Them ghi chu dac biet (cay/ko cay, ko muoi, khong duong, v.v)
- **Xac nhan don hang:** Gui don ve kho/bep, cap nhat trang thai sang "pending"

*Chuc nang phu 5b: Theo Doi Trang Thai Don Hang (Order Status)*
- **Pending:** Don vua tao, chu xac nhan
- **Confirmed:** Nhan vien xac nhan, bep tiem huan bi
- **Preparing:** Dang chuan bi mon an
- **Ready:** Mon an san sang, tuy agent don
- **Shipping:** Dang giao hang (neu la delivery)
- **Completed:** Don hang hoan thanh, khach hang nhan hang
- **Cancelled:** Don hang bi huy

*Chuc nang phu 5c: Hoa Don & Chi Phi (Billing)*
- **Tinh tong tien:** Cong tien tat ca mon an (don gia x so luong)
- **Tinh giam gia:** Cong tien giam gia cho tung mon (neu co)
- **Tinh thue:** Tinh VAT (neu co) = 10% tong tien
- **Them chi phi khac:** Ship, bao bi, phuc vu, v.v
- **Tong tien cuoi:** Tong tien + thue + chi phi - giam gia
- **In hoa don:** In chi tiet don hang va hoa don tieu chuan

*Chuc nang phu 5d: Thanh Toan (Payment)*
- **Chon hinh thuc thanh toan:** COD, chuyen khoan, Momo, the tin dung
- **Chuyen khoan:** Hien thi ma QR + so tai khoan nha hang
- **Momo:** Hien thi link thanh toan Momo
- **COD:** Ghi nhan se thanh toan khi nhan hang
- **Cap nhat trang thai:** Unpaid -> Paid (khi nhan duoc tien)
- **Ghi nhan:** Luu transaction ID, thoi gian thanh toan, hinh thuc

*Chuc nang phu 5e: Xem Chi Tiet Don Hang (Order Details)*
- **Hien thi danh sach mon:** Tat ca mon an trong don voi gia don vi, so luong, thanh tien
- **Hien thi trang thai:** Trang thai hien tai + thoi gian cap nhat
- **Hien thi nhan vien phu trach:** Shipper hoac staff dang xu ly don
- **Hien thi thong tin giao hang:** Dia chi, thoi gian du kien giao, lien he shipper

**VII. MODULE 6: QUAN LY KHACH HANG (Customer Management)**

Dieu chinh: Dang ky, dang nhap, thong tin ca nhan, lich su dat hang/dat ban

*Chuc nang phu 6a: Dang Ky & Dang Nhap (Registration & Login)*
- **Dang ky tai khoan:** Khach nhap email, password, ten, sdt de tao account
- **Xac thuc OAuth:** Dang nhap qua Google (dang nhap = mot click)
- **Xac thuc OAuth:** Dang nhap qua Facebook (dang nhap = mot click)
- **Dat lai mat khau:** Khach quen mat khau, click "quen mat khau", nhan email reset
- **Cap nhat thong tin:** Sau dang ky, khach cap nhat ten, sdt, dia chi, anh dai dien

*Chuc nang phu 6b: Quan Ly Tai Khoan (Account Management)*
- **Xem thong tin ca nhan:** Hien thi ten, email, sdt, dia chi, anh dai dien
- **Cap nhat thong tin:** Thay doi ten, sdt, dia chi, anh dai dien
- **Dat lai mat khau:** Doi mat khau me bao mat
- **Xem lich su dang nhap:** Xem device, IP da dang nhap

*Chuc nang phu 6c: Theo Doi Don Hang (Order History)*
- **Xem danh sach don hang:** Hien thi tat ca don hang da dat (10 don gan day)
- **Xem chi tiet don hang:** Click vao don, hien thi danh sach mon, gia tien, trang thai
- **Theo doi don hien tai:** Xem don dang giao, thoi gian du kien
- **Tat lich:** Xem tat ca don hang (co paging)
- **Loc theo trang thai:** Completed, pending, cancelled
- **Loc theo thoi gian:** Nam, thang, tuan, hom nay

*Chuc nang phu 6d: Theo Doi Dat Ban (Reservation History)*
- **Xem danh sach dat ban:** Hien thi tat ca dat ban da tao (10 dat ban gan day)
- **Xem chi tiet dat ban:** Click vao dat ban, hien thi ngay gio, so nguoi, nhan vien phu trach
- **Theo doi dat ban sap toi:** Xem dat ban trong 7 ngay toi
- **Tat lich:** Xem tat ca dat ban (co paging)
- **Loc theo trang thai:** Confirmed, completed, cancelled

**VIII. MODULE 7: QUAN LY DANH GIA & NHAN XET (Rating & Review System)**

Dieu chinh: Danh gia, nhan xet, quan ly danh gia admin, thong ke

*Chuc nang phu 7a: Danh Gia Don Hang/Dat Ban (Customer Rating)*
- **Danh gia (Rating):** Sau khi don hang hoan thanh, khach hang co the danh gia 1-5 sao
- **Danh gia cho dat ban:** Sau khi dat ban hoan thanh, khach hang co the danh gia
- **Danh gia cho nhan vien:** Neu khach hang muon, co the danh gia nhan vien phu trach (staff/shipper)
- **Nhan xet chi tiet:** Khach hang viet phan hoi, nhan xet (text, toi da 500 ky tu)
- **Gia thiet:** Khach hang chi co the danh gia 1 lan cho 1 don hang/dat ban

*Chuc nang phu 7b: Quan Ly Danh Gia (Admin Review Dashboard)*
- **Xem tat ca danh gia:** Admin xem danh sach danh gia, sap xep theo thoi gian, so sao
- **Thong ke danh gia:** Tong so danh gia, diem trung binh (VD: 4.5 sao), phan bo theo sao
- **Thong ke theo nhan vien:** Xem danh gia cua tung nhan vien (staff/shipper), trung binh diem
- **Thong ke theo don hang:** Xem danh gia cua tung don hang, mon an, thoi diem
- **Loc danh gia:** Theo loai (order/reservation), so sao (1 sao, 2 sao, ..., 5 sao), thoi gian (tuan, thang, nam)
- **Xoa danh gia pham nhan:** Xoa danh gia spam, danh gia khong hop le
- **Thong bao cho nhan vien:** Day thong bao neu co danh gia thap (1-2 sao) tu khach hang

*Chuc nang phu 7c: Nhan Xet Danh Gia (Review Comments)*
- **Them nhan xet:** Khach hang viet phan hoi chi tiet ve trn nghiem
- **Luu tru:** Luu vao database voi timestamp
- **Hien thi:** Admin, nhan vien, khach hang khac co the xem nhan xet
- **Xoa nhan xet:** Admin co quyen xoa nhan xet khong hop le

**IX. CAC KET NOI VA MIEN LIEN KET CHINH GIUA CAC MODULE**

1. **Staff Module <-> Order Module:** Nhan vien staff xu ly don hang, xem trang thai don, cap nhat trang thai mon an
2. **Staff Module <-> Reservation Module:** Nhan vien phu trach ban, xac nhan dat ban, theo doi khach toi
3. **Branch Module <-> Staff Module:** Gan nhan vien vao chi nhanh (1 nhan vien co the o 1 chi nhanh)
4. **Branch Module <-> Reservation Module:** Kiem tra ban trong tai chi nhanh, cap nhat trang thai ban
5. **Menu Module <-> Order Module:** Khach hang chon mon an tu thuc don de tao don hang
6. **Menu Module <-> Reservation Module:** Khach hang chon mon an truoc khi dat ban
7. **Order Module <-> Payment Module:** Moi don hang phai co thong tin thanh toan lien ket
8. **Reservation Module <-> Payment Module:** Moi dat ban phai co thong tin thanh toan tien coc lien ket
9. **Order Module <-> Rating Module:** Sau khi don hang hoan thanh, khach hang co the danh gia don
10. **Reservation Module <-> Rating Module:** Sau khi dat ban hoan thanh, khach hang co the danh gia dat ban
11. **Staff Module <-> Rating Module:** Danh gia ghi nhan nhan vien (staff/shipper) phu trach don/dat ban
12. **Rating Module <-> Admin Dashboard:** Admin xem tong hop danh gia, thong ke chi tiet

**X. DONG VAO HE THONG (System User Flows & Entry Points)**

*Flow 1: Khach Hang Binh Thuong (Regular Customer Flow)*
1. Dang ky/Dang nhap (su dung email/password hoac OAuth)
2. Xem thuc don (browse menu by category)
3. Lua chon mon an (select dishes, add to cart)
4. Dat hang (place order, them ghi chu)
5. Chon hinh thuc thanh toan (select payment method)
6. Thanh toan (pay va xac nhan)
7. Theo doi trang thai (track order status real-time)
8. Nhan hang (receive order, provide feedback)
9. Danh gia don hang (rate 1-5 stars, write comment)
10. Xem lich su (view order history anytime)

*Flow 2: Khach Hang Dat Ban (Customer Reservation Flow)*
1. Dang ky/Dang nhap
2. Chon "Dat ban"
3. Chon chi nhanh, ngay, gio, so nguoi
4. Xem ban co san, tinh tien coc
5. Them yeu cau dac biet (if any)
6. Xac nhan dat ban, thanh toan tien coc
7. Nhan xac nhan qua email/SMS
8. Den nha hang, phu trach tiep don
9. Danh gia dich vu, nhan vien, mon an
10. Xem lich su dat ban

*Flow 3: Nhan Vien Reception (Reception Staff Flow)*
1. Dang nhap (login reception account)
2. Xem danh sach dat ban trong ngay
3. Tao dat ban moi cho khach den (if customer booking on-site)
4. Tao don hang cho khach dat tai quay
5. Cap nhat trang thai dat ban (confirmed -> completed)
6. Cap nhat trang thai don hang
7. Theo doi bang ban trong
8. Lap hoa don, tieu xu thanh toan
9. Ghi nhan feedback tu khach hang

*Flow 4: Nhan Vien Nha Bep (Kitchen Staff Flow)*
1. Dang nhap (login staff account)
2. Xem danh sach don hang can chuan bi (pending, confirmed orders)
3. Chon mon an, bat dau chuan bi
4. Cap nhat trang thai mon (preparing -> ready)
5. Goi reception khi mon san sang
6. Theo doi don hang khong het
7. Xem danh gia tu khach hang ve mon an (feedback loop)

*Flow 5: Nhan Vien Giao Hang (Shipper Flow)*
1. Dang nhap (login shipper account)
2. Xem danh sach don hang can giao (ready orders)
3. Nhan don hang tu nha bep
4. Cap nhat trang thai sang "shipping"
5. Den nha khach hang, xac nhan giao
6. Nhan phuong thuc thanh toan (COD)
7. Cap nhat trang thai sang "delivered"
8. Nhan danh gia tu khach hang (rating shipper)

*Flow 6: Quan Ly Admin (Administrator Flow)*
1. Dang nhap (login admin account)
2. Xem dashboard (statistics, revenue, orders, bookings)
3. Quan ly nhan vien (add, edit, delete staff)
4. Quan ly thuc don (add, edit, delete dishes)
5. Quan ly chi nhanh (add, edit, delete branches)
6. Xem tat ca don hang va dat ban (all transactions)
7. Xem danh gia va nhan xet tu khach hang
8. Thong ke doanh thu, khach hang, mon an ban chay
9. Thay doi gia tien, giam gia, chuong trinh khuyến mai
10. Ghi danh gia xau, spam, pham nhan

**XI. CAC DAC DIEM TONG HOP CUA KIE TRUC**

1. **Tinh toan thuc (Real-time):** Don hang, trang thai ban, so ban trong cap nhat lien tuc
2. **Bao mat cao (Security):** Password hash (bcrypt), OAuth 2.0, session-based authentication
3. **Sap khang (Scalability):** MongoDB support sharding, replica set cho nhieu chi nhanh
4. **Luong thong (User-friendly):** Interface don gian, dang ky gon, OAuth support (Google/Facebook)
5. **Danh gia va phan hoi (Feedback Loop):** Khach hang danh gia, admin theo doi, nhan vien tien bowen
6. **Thong bao (Notifications):** Email/SMS cho don hang, dat ban, danh gia moi


### 2.1 Tong quan ve MongoDB va NoSQL


#### 2.1.1 Khai niem NoSQL va MongoDB

MongoDB la mot CSDL huong tai lieu (document-oriented database) thuoc phe NoSQL, khac biet co ban so voi cac CSDL quan he truyen thong nhu SQL Server, Oracle, PostgreSQL. Thay vi luu du lieu theo dang bang (table), MongoDB luu du lieu theo dang JSON-like documents, cho phep luu tru cac cau truc du lieu phuc tap, lang thang va co phan tap.

Dac diem chinh cua MongoDB:
- **Tai lieu huong (Document-based):** Du lieu duoc luu theo dang BSON (Binary JSON), cho phep cau truc du lieu linh hoat
- **Khong kem lich (Schema-less):** Moi tai lieu trong mot collection co the co cau truc khac nhau, thuận tien cho phat trien nhanh chong
- **Phan tan du lieu (Distributed):** Ho tro replica set va sharding cho khả nang scale ngang
- **Query dac da (Rich Queries):** Ho tro tuy van phuc tap, truy van vai/nhieu collection

#### 2.1.2 Ly do chon MongoDB cho de tai

De tai quan ly nha hang sang trong chon MongoDB thay vi SQL Server hoac PostgreSQL vi cac ly do sau:

1. **Tinh linh hoat cua cau truc du lieu:** Nha hang co nhieu loai dich vu:
   - Dat hang (orders) co the co them cac mon an, khuyến mai
   - Dat ban (reservations) co the co them yeu cau dac biet, menu an truoc
   - Khach hang co the co anh dai dien tu mang xa
   
   MongoDB cho phep them field moi ma khong can chinh sua schema co so dung du, giup qua trinh phat trien nhanh hon.

2. **Luu tru anh va du lieu phuc tap:** MongoDB cho phep luu tru anh truc tiep trong BSON (qua embedding hoac tham chieu), thuận tien cho quan ly anh thuc don, anh chi nhanh ma khong can he thong file rieng.

3. **Quy mo va khả nang mo rong:** MongoDB co tinh nang sharding tren nhieu server, phu hop voi mo hinh chuoi nha hang voi nhieu chi nhanh.

4. **Hoc hoi va phat trien nhanh:** MongoDB su dung JavaScript-like syntax (trong Node.js), giup cac nha phat trien full-stack JavaScript nhanh chong, khong can thay doi ngon ngu.

5. **Chi phi:** MongoDB co ban Community Edition mien phi va co the deploy tren cloud (MongoDB Atlas) voi chi phi thap.

### 2.2 Phan tich du lieu va mo hinh CSDL

#### 2.2.1 Mo hinh thuc the - ket hop (ERD)

He thong quan ly nha hang co nhung thuc the chinh:

- **User:** Dai dien cho nguoi dung he thong (Khach hang, Admin, Shipper, Staff, Reception)
- **Dish:** Dai dien cho cac mon an trong thuc don
- **Branch:** Chi nhanh cua nha hang
- **Order:** Don hang dat cua khach hang
- **Reservation:** Dat ban tai nha hang
- **Payment:** Thong tin thanh toan don hang hoac dat ban
- **Notification:** Thong bao he thong
- **Review:** Danh gia va nhan xet tu khach hang ve cac mon an, dich vu

Cac lien ket chinh:
```
User ---(tao)---> Order
User ---(dat)---> Reservation
User ---(danh gia)---> Review
Order ---(thanh toan)---> Payment
Reservation ---(thanh toan)---> Payment
Dish ---(nam trong)---> Branch
Order ---(chon)---> Dish
Reservation ---(chon)---> Dish
Review ---(lien quan)---> Order/Reservation
```

#### 2.2.2 Mo hinh collection trong MongoDB

MongoDB khong su dung tu "bang" ma thay vao do la "collection". De tai quan ly nha hang su dung cac collection sau:

##### 2.2.2.1 Collection "users"

Luu tru thong tin tai khoan va chi tiet nguoi dung:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hash),
  phone: String,
  role: String (enum: "admin", "shipper", "staff", "reception", "user"),
  avatar: String (URL),
  address: String,
  // OAuth fields
  googleId: String,
  facebookId: String,
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

##### 2.2.2.2 Collection "dishes"

Luu tru thong tin mon an:

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String (enum: "appetizer", "main", "dessert", "beverage"),
  image: String (URL),
  available: Boolean,
  branch: ObjectId (ref: branches),
  discount: {
    percent: Number,
    startDate: Date,
    endDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

##### 2.2.2.3 Collection "branches"

Luu tru thong tin chi nhanh nha hang:

```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  phone: String,
  email: String,
  description: String,
  image: String,
  openTime: String,
  closeTime: String,
  totalTables: Number,
  availableTables: Number,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  createdAt: Date,
  updatedAt: Date
}
```

##### 2.2.2.4 Collection "orders"

Luu tru thong tin don hang:

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  orderNumber: String (unique, auto-generated),
  status: String (enum: "pending", "confirmed", "shipping", "completed", "cancelled"),
  orderType: String (enum: "dine-in", "takeaway"),
  branch: ObjectId (ref: branches),
  items: [
    {
      dishId: ObjectId,
      quantity: Number,
      price: Number,
      discount: Number
    }
  ],
  totalAmount: Number,
  discount: Number,
  finalAmount: Number,
  deliveryAddress: String,
  notes: String,
  shipperId: ObjectId (ref: users),
  payment: ObjectId (ref: payments),
  createdAt: Date,
  completedAt: Date,
  expectedDelivery: Date
}
```

##### 2.2.2.5 Collection "reservations"

Luu tru thong tin dat ban:

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  reservationNumber: String (unique),
  branch: ObjectId (ref: branches),
  guestCount: Number,
  reservationDate: Date,
  reservationTime: String,
  specialRequests: String,
  items: [
    {
      dishId: ObjectId,
      quantity: Number,
      price: Number
    }
  ],
  depositAmount: Number (100,000 VND),
  totalAmount: Number,
  discountAmount: Number,
  finalAmount: Number,
  status: String (enum: "pending", "confirmed", "completed", "cancelled"),
  payment: ObjectId (ref: payments),
  staffId: ObjectId (ref: users),
  rating: Number (1-5),
  ratingComment: String,
  ratedAt: Date,
  createdAt: Date
}
```

##### 2.2.2.6 Collection "payments"

Luu tru thong tin thanh toan:

```javascript
{
  _id: ObjectId,
  orderId: ObjectId (ref: orders),
  reservationId: ObjectId (ref: reservations),
  amount: Number,
  method: String (enum: "bank_transfer", "momo", "cod"),
  transactionId: String (unique),
  status: String (enum: "pending", "completed", "failed"),
  paymentDate: Date,
  qrCode: String (cho bank transfer),
  momoLink: String,
  createdAt: Date,
  updatedAt: Date
}
```

##### 2.2.2.7 Collection "reviews"

Luu tru danh gia va nhan xet:

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  orderId: ObjectId (ref: orders),
  reservationId: ObjectId (ref: reservations),
  staffId: ObjectId (ref: users, optional),
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

##### 2.2.2.8 Collection "notifications"

Luu tru thong bao he thong:

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  type: String (enum: "new_order", "order_completed", "reservation_review", ...),
  message: String,
  read: Boolean,
  details: Object,
  createdAt: Date
}
```

### 2.3 Tinh chat va Rang buoc Toan ven (Integrity Constraints)

#### 2.3.1 Rang buoc duy nhat (Unique Constraint)

MongoDB ho tro chi muc unique de dam bao tinh duy nhat:

```javascript
// Email khong bi trung lap
db.users.createIndex({ email: 1 }, { unique: true })

// Order number duy nhat
db.orders.createIndex({ orderNumber: 1 }, { unique: true })

// Reservation number duy nhat
db.reservations.createIndex({ reservationNumber: 1 }, { unique: true })

// Transaction ID duy nhat
db.payments.createIndex({ transactionId: 1 }, { unique: true })
```

#### 2.3.2 Rang buoc tham chieu (Foreign Key Constraint)

MongoDB khong co khai niem "foreign key" nhu SQL, nhung su dung:

**Phuong phap 1: Tham chieu bang ObjectId**
```javascript
// Order co tham chieu den User
db.orders.updateOne(
  { _id: orderId },
  { $set: { userId: ObjectId("...") } }
)
```

**Phuong phap 2: Embedding du lieu lien quan**
```javascript
// Nhung thong tin user trong order de tranh multi-query
{
  _id: ObjectId,
  userInfo: {
    userId: ObjectId,
    userName: String,
    email: String
  },
  items: [...]
}
```

#### 2.3.3 Rang buoc toan ve du lieu (Data Validation)

Dung MongoDB Schema Validation:

```javascript
// Tao chi muc validate cho collection "orders"
db.orders.insert([
  {
    $jsonSchema: {
      bsonType: "object",
      required: ["orderNumber", "userId", "status", "totalAmount"],
      properties: {
        orderNumber: { bsonType: "string" },
        status: { 
          enum: ["pending", "confirmed", "shipping", "completed", "cancelled"]
        },
        totalAmount: { 
          bsonType: "number",
          minimum: 0
        },
        discount: {
          bsonType: "number",
          minimum: 0
        }
      }
    }
  }
])
```

#### 2.3.4 Rang buoc kinh doanh chinh

1. **Don hang >= 10,000,000 VND phai bang chuyen khoan:** Check trong ung dung
2. **Don hang >= 100,000,000 VND gui thong bao admin:** Trigger trong ung dung
3. **Dat ban phai thanh toan tien coc 100,000 VND:** Validate trong ung dung
4. **So ban trong <= tong so ban:** Check truoc khi xac nhan dat ban
5. **Danh gia chi cho don hang/dat ban hoan thanh:** Validate status

### 2.4 Giao tac va Tinh nhat quan (Transaction & Atomicity)

#### 2.4.1 Khai niem Giao tac trong MongoDB

MongoDB tu version 4.0 tro len ho tro ACID transactions, cho phep tieu hanh nhieu operation tren mot hoac nhieu document sao cho toan bo thanh cong hoac that bai deu.

Dieu nay rat quan trong cho he thong nha hang:

**Ket hop thanh toan va cap nhat trang thai:**
```javascript
session = db.getMongo().startSession()
session.startTransaction()

try {
  // Tao payment
  db.payments.insertOne({ 
    orderId, 
    amount, 
    status: "completed" 
  }, { session })
  
  // Cap nhat order
  db.orders.updateOne(
    { _id: orderId },
    { $set: { status: "confirmed", payment: paymentId } },
    { session }
  )
  
  // Cap nhat notification
  db.notifications.insertOne({
    userId,
    type: "order_confirmed",
    message: "Don hang da duoc xac nhan"
  }, { session })
  
  session.commitTransaction()
} catch (error) {
  session.abortTransaction()
  throw error
} finally {
  session.endSession()
}
```

#### 2.4.2 Tac dung cua Transaction trong De tai

Trong he thong quan ly nha hang, transaction dam bao:

1. **Tinh nhat quan cua thanh toan:** Khong co tinh huong payment thanh cong nhung order khong duoc cap nhat
2. **Tinh nhat quan cua bang an:** Khi khach dat ban, so ban khong giam 1 con trang thai dat ban khong chuyen sang "confirmed"
3. **Tinh nhat quan cua danh gia:** Danh gia phai co order hoac dat ban lien ket, khong co danh gia mo coi

### 2.5 Kiem soat Dong thoi (Concurrency Control)

#### 2.5.1 Cac van de dong thoi

Trong he thong co hang tram, hang ngan nguoi dung truy cap dong thoi:
- Nhieu khach hang dat hang cung luc
- Nhieu nhan vien tao dat ban cung luc
- Nhieu nguoi xem thuc don cung luc

Neu khong kiem soat dong thoi, co the xay ra:

1. **Overbooking:** 2 khach dat ban cung luc, he thong cap phat 2 ban tuy nhien chi con 1 ban trong
2. **Double Payment:** Khach nhan "thanh toan that bai", nhan lai va thanh toan 2 lan
3. **Lost Update:** 2 nhan vien cap nhat mon an cung luc, cap nhat cua 1 nguoi bi mat

#### 2.5.2 Tac dung Optimistic Locking

MongoDB su dung "version" field de implement optimistic locking:

```javascript
// Khi lay ra dat ban
const reservation = db.reservations.findOne({ _id: reservationId })
// reservation co { _id, ..., __v: 1 }

// Khi cap nhat, kiem tra version
const result = db.reservations.updateOne(
  { _id: reservationId, __v: 1 },
  { 
    $set: { status: "confirmed" },
    $inc: { __v: 1 }
  }
)

if (result.modifiedCount === 0) {
  // Version ko khop, du lieu da thay doi
  throw new Error("Reservation was modified by another process")
}
```

#### 2.5.3 Kiem soat So Ban Trong (Atomic Counter)

De tranh overbooking ban an, su dung atomic increment:

```javascript
// Dat ban: giam so ban trong
const updateResult = db.branches.findOneAndUpdate(
  { 
    _id: branchId,
    availableTables: { $gt: 0 }
  },
  { $inc: { availableTables: -1 } },
  { returnDocument: "after" }
)

if (!updateResult.value) {
  throw new Error("Khong con ban trong")
}

// Huy dat ban hoac hoan thanh: tang so ban trong
db.branches.updateOne(
  { _id: branchId },
  { $inc: { availableTables: 1 } }
)
```

### 2.6 Phuc hoi du Lieu sau Su co (Backup & Recovery)

#### 2.6.1 Chien luoc Backup

De bao ve du lieu nha hang, su dung:

1. **Automated Backup tren Cloud (MongoDB Atlas):**
   - MongoDB Atlas tu dong sao luu du lieu hang ngay
   - Luu tru snapshot len S3 hoac cloud provider khac
   - Co the restore ve bat ky thoi diem nao trong 35 ngay gan day

2. **Periodic Snapshots:**
```bash
# Dump du lieu MongoDB
mongodump --uri="mongodb+srv://..." --out=./backup-$(date +%Y%m%d)

# Restore du lieu
mongorestore --uri="mongodb+srv://..." ./backup-20240312
```

3. **Replication Set:**
   - MongoDB replica set voi 3 node (1 primary, 2 secondary)
   - Neu primary giu, 1 secondary tu dong duoc len thanh primary
   - Du lieu duoc sao chep tu dong den tat ca secondary

#### 2.6.2 Chien luoc Recovery

**Truong hop 1: Mat mat toan bo du lieu**
- Restore tu snapshot cu nhat, chi mat du lieu trong 24h
- Thong bao khach hang ve su co

**Truong hop 2: Lam sai du lieu**
- Dung point-in-time recovery de quay lui toi thoi diem truoc loi
- Validate lai du lieu sau khi restore

**Truong hop 3: Hack hoac Ransomware**
- Replica set khong bi anh huong (du lieu tuoc tam nhat vao day)
- Restore tu isolated backup
- Thay doi tat ca password va security keys

#### 2.6.3 Cac chuan bi phong tranh

1. **Monitoring & Alerting:**
   - Kiem tra size CSDL, canh bao khi can 80%
   - Kiem tra CPU, Memory usage
   - Alert neu co operation chay qua lau

2. **Redundancy:**
   - Deploy tren nhieu Region (vi du: Asia-Southeast tro
- Replica set tren nhieu server vat ly khac nhau
   - Backup on-premise + cloud

3. **Testing Recovery:**
   - Hang tuan test restore tu backup
   - Ghi lai time recovery objetivo (RTO) va data loss objective (RPO)

### 2.7 Cac Dac Diem MongoDB Phu Hop voi De Tai

1. **Indexing tuy bien:** Tao index tren email, orderNumber, status de query nhanh
2. **Aggregation Pipeline:** Su dung de thong ke doanh thu, thong ke danh gia
3. **Full Text Search:** Ho tro tim kiem mon an theo ten, mo ta
4. **Geospatial Queries:** Tim chi nhanh gan nhat voi vi tri khach hang
5. **Change Streams:** Ho tro real-time notification khi co order, dat ban moi

---

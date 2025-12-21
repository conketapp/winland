# USER GUIDE
## Hệ thống Quản lý Bán Căn Hộ Dự Án - Winland

**Document ID:** UG-WINLAND-001  
**Version:** 1.0  
**Date:** January 2025  
**Đối tượng:** End Users (CTV, Admin)

---

## TABLE OF CONTENTS

1. [Giới thiệu](#1-giới-thiệu)
2. [CTV Portal - Hướng dẫn sử dụng](#2-ctv-portal)
3. [Admin Portal - Hướng dẫn sử dụng](#3-admin-portal)
4. [FAQ - Câu hỏi thường gặp](#4-faq)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. GIỚI THIỆU

Winland là hệ thống quản lý và bán căn hộ dự án, giúp:
- CTV (Cộng tác viên) bán căn hộ hiệu quả
- Admin quản lý dự án và giao dịch tập trung
- Theo dõi thanh toán và hoa hồng minh bạch

**2 Trang quản lý:**
- **Trang CTV:** Dành cho CTV bán hàng
- **Trang Admin:** Dành cho Admin quản lý

---

## 2. CTV PORTAL

### 2.1 Đăng ký và Đăng nhập

#### Bước 1: Đăng ký tài khoản

1. Truy cập: `http://ctv.winland.com`
2. Click **"Đăng ký"**
3. Nhập số điện thoại (VD: `0912345678`)
4. Click **"Gửi OTP"**
5. Nhập mã OTP nhận được qua SMS (6 số)
6. Nhập thông tin:
   - Họ tên
   - Mật khẩu (tối thiểu 6 ký tự)
7. Click **"Xác nhận"**
8. ✅ Đăng ký thành công! Tự động chuyển đến Dashboard

**Lưu ý:**
- OTP có hiệu lực 5 phút
- Nếu không nhận được OTP, click **"Gửi lại"** sau 60 giây
- Tối đa 3 lần thử OTP

#### Bước 2: Đăng nhập

1. Truy cập: `http://ctv.winland.com`
2. Nhập số điện thoại
3. Click **"Gửi OTP"**
4. Nhập OTP và mật khẩu
5. Click **"Đăng nhập"**
6. ✅ Đăng nhập thành công!

**Quên mật khẩu:**
1. Click **"Quên mật khẩu?"**
2. Nhập số điện thoại
3. Nhận OTP và reset mật khẩu mới

---

### 2.2 Dashboard

Sau khi đăng nhập, bạn sẽ thấy Dashboard với:

**Thống kê:**
- 📊 Tổng số giao dịch (reservations, bookings, deposits)
- 💰 Tổng hoa hồng đã kiếm
- 📈 Hoa hồng chờ duyệt, đã duyệt, đã thanh toán

**Quick Actions:**
- ➕ Tạo phiếu mới (Giữ chỗ, Booking, Cọc)
- 📋 Xem phiếu của tôi
- 💵 Xem hoa hồng

---

### 2.3 Xem Căn Hộ

#### Danh sách Căn Hộ

1. Vào menu **"Căn hộ"**
2. Bạn sẽ thấy danh sách căn còn trống
3. Có thể tìm kiếm và lọc theo:
   - Dự án (chọn dự án cụ thể)
   - Tòa (chọn tòa cụ thể)
   - Tầng (chọn tầng cụ thể)
   - Giá (từ bao nhiêu - đến bao nhiêu)
   - Diện tích (từ bao nhiêu m² - đến bao nhiêu m²)
   - Số phòng ngủ (1PN, 2PN, 3PN...)

**Màu sắc trạng thái:**
- 🟢 Xanh lá: Còn trống (AVAILABLE)
- 🟡 Vàng: Đã được giữ/book (RESERVED_BOOKING)
- 🔵 Xanh dương: Đã đặt cọc (DEPOSITED)
- ⚫ Xám: Đã bán (SOLD)

#### Chi tiết Căn Hộ

Click vào căn để xem:
- Mã căn (VD: A1-08-05)
- Giá bán
- Diện tích, số phòng
- Hướng, View
- Hình ảnh
- Sơ đồ căn
- Trạng thái hiện tại

---

### 2.4 Giữ Chỗ (Reservation)

**Khi nào giữ chỗ?**
- Dự án ở giai đoạn **Sắp mở bán**
- Căn còn trống

**Cách thực hiện:**

1. Vào **"Căn hộ"** → Tìm căn muốn giữ
2. Click **"Giữ chỗ"**
3. Điền form:
   ```
   Tên khách hàng: [Nhập tên]
   SĐT khách hàng: [Nhập SĐT]
   Email khách hàng: [Tùy chọn]
   Ghi chú: [Tùy chọn]
   ```
4. Click **"Xác nhận Giữ Chỗ"**
5. ✅ Thành công! Bạn sẽ nhận thông báo vị trí trong queue

**Lưu ý quan trọng:**
- ⚠️ **Nhiều CTV có thể giữ chỗ cùng 1 căn**
- 📍 Bạn được xếp hàng theo thứ tự (first-come-first-served)
- 🔔 Khi dự án mở bán, bạn sẽ được thông báo khi đến lượt
- ⏰ Bạn có 48 giờ (configurable) để đặt cọc khi đến lượt

**Xem phiếu giữ chỗ:**
- Vào **"Giữ chỗ của tôi"** để xem danh sách tất cả phiếu giữ chỗ
- Có thể tìm kiếm và lọc theo tình trạng: Đang giữ chỗ, Đến lượt, Hoàn thành, Bỏ lỡ, Đã hủy
- Có thể hủy giữ chỗ bất cứ lúc nào (không mất phí, không bị phạt)

---

### 2.5 Tạo Booking

**Khi nào tạo Đặt chỗ?**
- Dự án đã **mở bán chính thức**
- Căn còn trống hoặc bạn đã giữ chỗ căn đó

**Cách thực hiện:**

1. Vào **"Căn hộ"** → Chọn căn
2. Click **"Tạo Booking"** (hoặc upgrade từ Reservation)
3. Điền form:
   ```
   === Thông tin khách hàng ===
   Họ tên: [Nhập tên]
   SĐT: [Nhập SĐT]
   Email: [Nhập email]
   CMND/CCCD: [Nhập số CMND]
   Địa chỉ: [Nhập địa chỉ]
   
   === Thanh toán ===
   Số tiền booking: 10,000,000 VNĐ (tự động)
   Upload chứng từ: [Chọn file ảnh hoặc PDF]
   ```
4. Click **"Xác nhận"**
5. ✅ Thành công! Phiếu đang chờ Admin duyệt

**Lưu ý:**
- ⚠️ Phiếu đặt chỗ yêu cầu thanh toán 10 triệu VNĐ
- 📤 Phải tải lên chứng từ thanh toán
- ⏰ Phiếu đặt chỗ hết hạn sau 48 giờ nếu chưa được duyệt
- 🔒 Căn sẽ bị khóa khi bạn tạo phiếu đặt chỗ

**Theo dõi Phiếu đặt chỗ:**
- Vào **"Đặt chỗ của tôi"** để xem
- Tình trạng: Chờ duyệt → Đã duyệt → (có thể nâng cấp lên Đặt cọc)

---

### 2.6 Tạo Cọc (Deposit)

**Khi nào tạo Cọc?**
- Có booking đã được duyệt, HOẶC
- Dự án đã OPEN và căn còn trống

**Cách thực hiện:**

1. Vào **"Căn hộ"** → Chọn căn
2. Click **"Đặt cọc"** (hoặc upgrade từ Booking)
3. Điền form:
   ```
   === Thông tin khách hàng ===
   Họ tên: [Nhập tên]
   SĐT: [Nhập SĐT]
   Email: [Nhập email]
   CMND/CCCD: [Nhập số CMND] ⚠️ Bắt buộc
   Địa chỉ: [Nhập địa chỉ] ⚠️ Bắt buộc
   
   === Thanh toán ===
   Số tiền cọc: [Nhập số tiền]
   (Tối thiểu: 5% giá căn)
   Upload chứng từ: [Chọn file]
   ```
4. Click **"Xác nhận"**
5. ✅ Thành công! Phiếu đang chờ Admin duyệt

**Lưu ý:**
- ⚠️ Số tiền cọc tối thiểu: **5% giá căn**
- 💰 Ví dụ: Căn 2.5 tỷ → Cọc tối thiểu 125 triệu
- 🔒 Căn sẽ bị khóa khi phiếu cọc được duyệt
- 📅 Sau khi duyệt, hệ thống tự động tạo lịch trả góp 4 đợt

**Xem lịch trả góp:**
- Vào **"Cọc của tôi"** → Click vào phiếu cọc
- Xem chi tiết 4 đợt thanh toán:
  - Đợt 1 (Cọc): Đã thanh toán ✅
  - Đợt 2: 30% - Hạn: [Ngày]
  - Đợt 3: 30% - Hạn: [Ngày]
  - Đợt 4: 35% - Hạn: [Ngày]

---

### 2.7 Ghi Nhận Thanh Toán

**Khi nào ghi nhận?**
- Khi khách hàng đã chuyển khoản thanh toán một đợt trong lịch trả góp
- Bạn có chứng từ thanh toán (ảnh chụp màn hình hoặc file PDF từ ngân hàng)

**Cách thực hiện:**

1. Vào **"Cọc của tôi"** → Chọn phiếu cọc
2. Xem lịch trả góp → Chọn đợt cần thanh toán
3. Click **"Ghi nhận thanh toán"**
4. Điền thông tin:
   ```
   Số tiền: [Nhập số tiền khách hàng đã chuyển]
   Ngày thanh toán: [Chọn ngày khách hàng chuyển khoản]
   Mã tham chiếu: [Nhập mã giao dịch từ ngân hàng, nếu có]
   Tải lên chứng từ: [Chọn file ảnh chụp màn hình hoặc PDF]
   Ghi chú: [Tùy chọn - ghi chú thêm nếu cần]
   ```
5. Click **"Xác nhận"**
6. ✅ Thành công! Admin sẽ xem và xác nhận

**Lưu ý:**
- ⚠️ Giao dịch thanh toán cần Admin xác nhận mới được tính vào lịch trả góp
- 🔔 Bạn sẽ nhận thông báo khi Admin xác nhận
- ✅ Khi tất cả 4 đợt đã được xác nhận → Căn hộ = Đã bán, Hoa hồng tự động được tạo

---

### 2.8 Hoa Hồng (Commissions)

#### Xem Hoa Hồng

1. Vào menu **"Hoa hồng"**
2. Bạn sẽ thấy:
   - **Summary:**
     - Tổng hoa hồng đã kiếm
     - Chờ duyệt (PENDING)
     - Đã duyệt (APPROVED)
     - Đã thanh toán (PAID)
   - **Danh sách:** Tất cả commissions với filters

#### Chi Tiết Hoa Hồng

Mỗi hoa hồng hiển thị:
- Mã căn (VD: A1-08-05)
- Tên dự án
- Số tiền hoa hồng
- Tỷ lệ (%)
- Cơ sở tính (giá thực tế hoặc giá niêm yết)
- Tình trạng: Chờ xử lý / Đã duyệt / Đã thanh toán
- Ngày tạo
- Ngày thanh toán (nếu đã thanh toán)

---

### 2.9 Yêu Cầu Rút Hoa Hồng (Payment Request)

**Khi nào yêu cầu rút?**
- Bạn có hoa hồng ở tình trạng **Chờ xử lý**
- Số tiền >= 10 triệu VNĐ (có thể tùy chỉnh)

**Cách thực hiện:**

1. Vào **"Hoa hồng"**
2. Chọn commission(s) muốn rút
3. Click **"Yêu cầu rút tiền"**
4. Điền thông tin ngân hàng:
   ```
   Tên ngân hàng: [VD: Vietcombank]
   Số tài khoản: [Nhập số TK]
   Tên chủ tài khoản: [Nhập tên đúng như trên TK]
   ```
5. Click **"Gửi yêu cầu"**
6. ✅ Thành công! Yêu cầu đang chờ Admin duyệt

**Theo dõi Yêu cầu Rút Hoa hồng:**
- Tình trạng: Chờ duyệt → Đã duyệt → Đã thanh toán
- Bạn sẽ nhận thông báo khi tình trạng thay đổi

---

### 2.10 Hủy Phiếu

#### Hủy Reservation (Giữ chỗ)

1. Vào **"Giữ chỗ của tôi"**
2. Chọn phiếu muốn hủy
3. Click **"Hủy giữ chỗ"**
4. Nhập lý do (tùy chọn)
5. Xác nhận
6. ✅ Hủy thành công! **Không mất phí**

#### Hủy Phiếu đặt chỗ

1. Vào **"Đặt chỗ của tôi"**
2. Chọn phiếu muốn hủy
3. Click **"Hủy đặt chỗ"**
4. ⚠️ Lưu ý: Nếu phiếu đặt chỗ đã được duyệt, bạn sẽ mất **50% phí**
5. Nhập lý do
6. Xác nhận
7. ✅ Hủy thành công!

#### Hủy Deposit

1. Vào **"Cọc của tôi"**
2. Chọn phiếu muốn hủy
3. Click **"Hủy cọc"**
4. ⚠️ Lưu ý: Nếu cọc đã được duyệt, bạn sẽ mất **50% phí cọc**
5. Nhập lý do
6. Xác nhận
7. ✅ Hủy thành công!

---

## 3. ADMIN PORTAL

### 3.1 Đăng Nhập

1. Truy cập: `http://admin.winland.com`
2. Nhập Email và Password
3. Click **"Đăng nhập"**
4. ✅ Đăng nhập thành công!

---

### 3.2 Quản lý Dự Án

#### Tạo Dự Án Mới

1. Vào **"Dự án"** → Click **"Tạo dự án mới"**
2. Điền form:
   ```
   Tên dự án: [VD: Vinhomes Grand Park]
   Mã dự án: [VD: VGP] ⚠️ Phải unique
   Chủ đầu tư: [VD: Vinhomes]
   Địa chỉ: [Địa chỉ chi tiết]
   Quận/Huyện: [VD: Quận 9]
   Thành phố: [VD: TP.HCM]
   Giá từ - Giá đến: [VD: 2 tỷ - 5 tỷ]
   Tỷ lệ hoa hồng mặc định: [VD: 2.5%]
   Ngày mở bán: [Chọn ngày]
   ```
3. Upload hình ảnh, sơ đồ tổng thể
4. Click **"Lưu"**
5. ✅ Dự án đã được tạo với giai đoạn = "Sắp mở bán"

#### Thay Đổi Giai Đoạn Dự Án

1. Vào **"Dự án"** → Chọn dự án
2. Click **"Chỉnh sửa"**
3. Thay đổi giai đoạn dự án:
   - **Sắp mở bán** → **Đang mở bán**: Khi bắt đầu mở bán chính thức
   - **Đang mở bán** → **Đã đóng bán**: Khi kết thúc giai đoạn bán hàng
4. Lưu ý: Khi chuyển từ "Sắp mở bán" sang "Đang mở bán", hệ thống tự động xử lý hàng đợi giữ chỗ và thông báo cho các CTV theo thứ tự

---

### 3.3 Quản lý Căn Hộ

#### Import Hàng Loạt Căn Hộ

1. Vào **"Căn hộ"** → Click **"Nhập từ Excel"**
2. Tải xuống file mẫu Excel có sẵn
3. Điền thông tin căn hộ vào file Excel:
   ```
   Tòa | Tầng | Số căn | Diện tích | Số phòng ngủ | Số phòng tắm | Giá | Hướng | View
   A1   | 8    | 01     | 75        | 2            | 2            | 2500000000 | Đông Nam | Sông
   ```
4. Tải file Excel đã điền lên hệ thống
5. Hệ thống hiển thị xem trước dữ liệu trước khi nhập
6. Kiểm tra và sửa lỗi (nếu có)
7. Click **"Xác nhận Nhập"**
8. ✅ Nhập thành công! Hệ thống tự động tạo mã căn (VD: A1-08-01)

#### Tạo Căn Hộ Thủ Công

1. Vào **"Căn hộ"** → Click **"Tạo căn mới"**
2. Chọn: Dự án → Tòa → Tầng
3. Điền thông tin: Số căn, Diện tích, Giá, Số phòng...
4. Click **"Lưu"**

---

### 3.4 Duyệt Phiếu

#### Duyệt Phiếu Đặt Chỗ

1. Vào **"Đặt chỗ"** → Tìm kiếm: Tình trạng = Chờ duyệt
2. Click vào phiếu đặt chỗ để xem chi tiết:
   - Thông tin khách hàng (tên, SĐT, email, CMND, địa chỉ)
   - Chứng từ thanh toán (ảnh chụp màn hình hoặc file PDF từ ngân hàng)
   - Số tiền đã thanh toán (10 triệu VNĐ)
3. Kiểm tra kỹ chứng từ thanh toán có khớp với số tiền không
4. Chọn hành động:
   - **Duyệt** → Phiếu đặt chỗ chuyển sang "Đã duyệt", căn hộ bị khóa
   - **Từ chối** → Nhập lý do từ chối, phiếu đặt chỗ = "Đã hủy", căn hộ trở về "Còn trống"
5. Click **"Xác nhận"**
6. ✅ CTV và khách hàng sẽ nhận thông báo về kết quả duyệt

#### Duyệt Phiếu Đặt Cọc

1. Vào **"Cọc"** → Tìm kiếm: Tình trạng = Chờ duyệt
2. Click vào phiếu đặt cọc để xem chi tiết
3. Kiểm tra kỹ:
   - Thông tin khách hàng (đầy đủ, chính xác)
   - Số tiền cọc (phải >= 5% giá căn hộ)
   - Chứng từ thanh toán (ảnh hoặc PDF từ ngân hàng)
4. **Duyệt** → Hệ thống tự động:
   - Phiếu đặt cọc chuyển sang "Đã duyệt"
   - Tạo lịch trả góp 4 đợt tự động
   - Khóa căn hộ (chuyển sang "Đã đặt cọc", không ai có thể đặt nữa)
5. ✅ CTV nhận thông báo và có thể xem lịch trả góp trong phiếu đặt cọc

---

### 3.5 Xác Nhận Giao Dịch Thanh Toán

1. Vào **"Giao dịch"** → Tìm kiếm: Tình trạng = Chờ xác nhận
2. Click vào giao dịch để xem chi tiết:
   - Số tiền khách hàng đã chuyển
   - Ngày thanh toán
   - Chứng từ (ảnh chụp màn hình hoặc file PDF)
   - Mã tham chiếu từ ngân hàng
   - Link đến đợt thanh toán tương ứng
3. Kiểm tra kỹ: Chứng từ có khớp với số tiền không, mã tham chiếu có đúng không
4. **Xác nhận** → Hệ thống tự động:
   - Giao dịch chuyển sang "Đã xác nhận"
   - Cập nhật lịch trả góp: Số tiền đã thanh toán += Số tiền vừa xác nhận
   - Nếu đợt đã thanh toán đủ tiền → Đợt chuyển sang "Đã thanh toán"
   - Nếu tất cả 4 đợt đã thanh toán đủ → Phiếu cọc = "Đã hoàn thành", Căn hộ = "Đã bán", Hoa hồng được tạo tự động
5. ✅ CTV nhận thông báo về việc xác nhận

---

### 3.6 Quản lý Hoa Hồng

#### Xem Tất Cả Hoa Hồng

1. Vào **"Hoa hồng"**
2. Xem danh sách tất cả hoa hồng với bộ lọc:
   - CTV
   - Tình trạng (Chờ xử lý, Đã duyệt, Đã thanh toán)
   - Khoảng thời gian
3. Click vào hoa hồng để xem chi tiết

#### Tính Lại Hoa Hồng

**Khi nào tính lại?**
- Giá thực tế của phiếu cọc thay đổi
- Hoa hồng ở tình trạng "Chờ xử lý"

**Cách thực hiện:**
1. Vào **"Hoa hồng"** → Chọn hoa hồng
2. Click **"Tính lại"**
3. Hệ thống tự động tính lại dựa trên giá thực tế mới
4. ✅ CTV nhận thông báo

---

### 3.7 Duyệt Yêu Cầu Rút Hoa Hồng

1. Vào **"Yêu cầu thanh toán"** → Tìm kiếm: Tình trạng = Chờ duyệt
2. Xem chi tiết:
   - Thông tin hoa hồng
   - Số tiền yêu cầu
   - Thông tin tài khoản ngân hàng
3. Chọn hành động:
   - **Duyệt** → Yêu cầu = "Đã duyệt", Hoa hồng = "Đã duyệt"
   - **Từ chối** → Nhập lý do, Tình trạng = "Đã từ chối"
4. Sau khi duyệt, Admin đánh dấu đã thanh toán khi đã chuyển tiền:
   - Click **"Đánh dấu đã thanh toán"**
   - Tình trạng hoa hồng = "Đã thanh toán"
5. ✅ CTV nhận thông báo

---

### 3.8 Dashboard & Báo Cáo

#### Dashboard Tổng Quan

1. Vào **"Dashboard"**
2. Xem:
   - Tổng số căn, Còn trống, Đã bán
   - Doanh thu theo tháng
   - Top CTVs (số căn, commission)
   - Biểu đồ trạng thái căn
3. Chọn dự án để xem báo cáo (nếu cần)

#### Xuất Báo Cáo

1. Click **"Xuất Excel"** hoặc **"Xuất PDF"**
2. Chọn loại báo cáo:
   - Danh sách căn hộ
   - Giao dịch thanh toán theo tháng
   - Hoa hồng theo CTV
   - Tổng hợp dự án
3. Tải file về máy

---

## 4. FAQ - CÂU HỎI THƯỜNG GẶP

### 4.1 CTV

**Q: Tôi có thể giữ chỗ bao nhiêu căn?**  
A: Không giới hạn số lượng căn có thể giữ chỗ. Tuy nhiên, bạn chỉ được xếp hàng theo thứ tự khi dự án mở bán.

**Q: Nếu tôi giữ chỗ nhưng không đặt cọc khi đến lượt thì sao?**  
A: Tình trạng sẽ chuyển thành "Bỏ lỡ cơ hội", và CTV tiếp theo trong hàng đợi sẽ được thông báo.

**Q: Hoa hồng được tính như thế nào?**  
A: Hoa hồng = Giá căn × Tỷ lệ / 100. Tỷ lệ được lấy theo thứ tự ưu tiên: Tỷ lệ căn (nếu có) > Tỷ lệ dự án (nếu có) > Tỷ lệ mặc định (2%)

**Q: Khi nào tôi có thể yêu cầu rút hoa hồng?**  
A: Khi commission ở status = PENDING và số tiền >= 10 triệu VNĐ.

**Q: Tôi có thể hủy booking/deposit không?**  
A: Có, nhưng nếu đã được duyệt, bạn sẽ mất 50% phí.

---

### 4.2 Admin

**Q: Làm sao để nhập nhiều căn hộ nhanh?**  
A: Sử dụng tính năng "Nhập từ Excel" với file Excel. Tải xuống file mẫu, điền thông tin căn hộ vào, và tải lên hệ thống.

**Q: Hệ thống tự động tạo lịch trả góp như thế nào?**  
A: Khi duyệt phiếu đặt cọc, hệ thống tự động tạo 4 đợt: Cọc (5%), Đợt 2 (30%), Đợt 3 (30%), Đợt 4 (35%).

**Q: Khi nào hoa hồng được tạo?**  
A: Tự động khi tất cả đợt thanh toán đã được xác nhận → Căn hộ = "Đã bán".

**Q: Tôi có thể sửa thông tin căn hộ sau khi đã tạo?**  
A: Có, nhưng cần cẩn thận vì có thể ảnh hưởng đến các giao dịch đang xử lý (đặt chỗ, đặt cọc) liên quan đến căn đó.

---

## 5. TROUBLESHOOTING

### 5.1 Không nhận được OTP

**Nguyên nhân:**
- SĐT không đúng
- SMS service tạm thời gián đoạn
- Đã vượt quá rate limit (3 OTP/giờ)

**Giải pháp:**
- Kiểm tra lại số điện thoại
- Đợi 60 giây rồi click "Gửi lại"
- Nếu vẫn không được, liên hệ Admin

---

### 5.2 Upload file thất bại

**Nguyên nhân:**
- File quá lớn (> 5MB)
- Định dạng không đúng (chỉ chấp nhận: JPG, PNG, PDF)
- Kết nối internet không ổn định

**Giải pháp:**
- Nén ảnh trước khi upload
- Chuyển đổi sang định dạng được hỗ trợ
- Kiểm tra kết nối internet

---

### 5.3 Không thấy căn hộ trong danh sách

**Nguyên nhân:**
- Bộ lọc (filter) đang bật và loại bỏ căn đó
- Căn không còn trống (đã có người đặt chỗ, đặt cọc, hoặc đã bán)
- CTV chỉ thấy căn của dự án đang ở giai đoạn "Đang mở bán" hoặc "Sắp mở bán"

**Giải pháp:**
- Xóa bộ lọc hoặc điều chỉnh bộ lọc (ví dụ: bỏ chọn tình trạng, giá, diện tích...)
- Kiểm tra tình trạng của căn (có thể căn đã bị đặt cọc hoặc đã bán)
- Kiểm tra giai đoạn của dự án (dự án có đang mở bán không)

---

## 6. LIÊN HỆ HỖ TRỢ

**Technical Support:**
- Email: support@winland.com
- Phone: 1900-xxxx
- Giờ làm việc: 8:00 - 17:00 (T2-T6)

**Business Inquiries:**
- Email: business@winland.com
- Phone: 1900-yyyy

---

**Document End**

**Last Updated:** January 2025

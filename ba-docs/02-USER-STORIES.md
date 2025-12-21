# USER STORIES & USE CASES
## Hệ thống Quản lý Bán Căn Hộ Dự Án - Winland

**Document ID:** US-WINLAND-001  
**Version:** 1.0  
**Date:** January 2025

---

## TABLE OF CONTENTS

1. [User Stories Overview](#1-user-stories-overview)
2. [Epic 1: Authentication & User Management](#2-epic-1-authentication--user-management)
3. [Epic 2: Projects & Units Management](#3-epic-2-projects--units-management)
4. [Epic 3: Sales Process (Reservations, Bookings, Deposits)](#4-epic-3-sales-process)
5. [Epic 4: Payments & Transactions](#5-epic-4-payments--transactions)
6. [Epic 5: Commissions & Payment Requests](#6-epic-5-commissions--payment-requests)
7. [Epic 6: Reports & Analytics](#7-epic-6-reports--analytics)

---

## 1. USER STORIES OVERVIEW

### Story Format

Mỗi user story theo format chuẩn:
```
As a [role]
I want to [action]
So that [benefit]

Acceptance Criteria:
- [ ] Criteria 1
- [ ] Criteria 2
```

---

## 2. EPIC 1: Authentication & User Management

### US-001: CTV Registration

**As a** CTV (Cộng tác viên)  
**I want to** đăng ký tài khoản bằng SĐT và OTP  
**So that** tôi có thể sử dụng hệ thống để bán căn hộ

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] User có thể nhập SĐT và nhận OTP
- [ ] OTP gửi qua SMS trong vòng 30 giây
- [ ] OTP có hiệu lực 5 phút
- [ ] User có thể verify OTP và tạo password
- [ ] System tạo account với role = CTV
- [ ] User được redirect đến dashboard sau khi đăng ký thành công

**Technical Details:**
- Endpoint: `POST /api/auth/register-ctv`
- OTP: 6 số, expires 5 phút
- Password: Min 6 chars

---

### US-002: CTV Login

**As a** CTV  
**I want to** đăng nhập bằng SĐT, OTP và password  
**So that** tôi có thể truy cập hệ thống

**Priority:** High  
**Story Points:** 3

**Acceptance Criteria:**
- [ ] User nhập SĐT và request OTP
- [ ] User nhập OTP và password
- [ ] System verify và tạo JWT token
- [ ] User được redirect đến dashboard
- [ ] Token có hiệu lực 24 giờ

---

### US-003: Admin Login

**As an** Admin  
**I want to** đăng nhập bằng email và password  
**So that** tôi có thể quản lý hệ thống

**Priority:** High  
**Story Points:** 2

**Acceptance Criteria:**
- [ ] Admin nhập email và password
- [ ] System verify credentials
- [ ] System tạo JWT token
- [ ] Admin được redirect đến admin dashboard
- [ ] Không yêu cầu OTP (traditional login)

---

### US-004: Password Reset

**As a** CTV  
**I want to** reset password qua OTP  
**So that** tôi có thể lấy lại quyền truy cập khi quên mật khẩu

**Priority:** Medium  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] User nhập SĐT và request OTP
- [ ] User verify OTP
- [ ] User nhập password mới (2 lần để confirm)
- [ ] System update password và invalidate all existing tokens
- [ ] User phải login lại với password mới

---

## 3. EPIC 2: Projects & Units Management

### US-005: View Available Units

**As a** CTV  
**I want to** xem danh sách căn hộ còn trống  
**So that** tôi có thể tư vấn và bán cho khách hàng

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] CTV xem danh sách units với status = AVAILABLE
- [ ] Có thể filter theo: Project, Building, Floor, Price range
- [ ] Có thể search theo unit code (A1-08-05)
- [ ] Hiển thị đầy đủ thông tin: Code, Price, Area, Bedrooms, Direction
- [ ] Click vào unit để xem chi tiết

**Technical Details:**
- Endpoint: `GET /api/units?status=AVAILABLE&projectId=xxx`
- Pagination: 20 items/page
- Response time: < 500ms

---

### US-006: Bulk Import Units

**As an** Admin  
**I want to** import hàng loạt căn hộ từ Excel  
**So that** tôi có thể tạo nhanh nhiều căn mà không cần nhập từng căn

**Priority:** High  
**Story Points:** 8

**Acceptance Criteria:**
- [ ] Admin upload Excel file (.xlsx)
- [ ] System parse và validate data
- [ ] System hiển thị preview trước khi import
- [ ] Admin có thể sửa data trong preview
- [ ] Admin confirm → System tạo tất cả units
- [ ] System generate unit codes tự động
- [ ] Report: X thành công, Y lỗi (với lý do)

**Excel Format:**
| Building | Floor | Unit | Area | Bedrooms | Price | Direction | View |
|----------|-------|------|------|----------|-------|-----------|------|
| A1 | 8 | 01 | 75 | 2 | 2500000000 | Đông Nam | Sông |

---

### US-007: Create Project

**As an** Admin  
**I want to** tạo dự án mới với thông tin đầy đủ  
**So that** tôi có thể quản lý căn hộ trong dự án đó

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] Admin nhập: Tên, Code, Developer, Location, Address
- [ ] Admin upload: Images, Master plan, Floor plan
- [ ] Admin config: Commission rate default, Open date
- [ ] System validate: Code phải unique
- [ ] System tạo project với status = UPCOMING
- [ ] Admin có thể edit project sau khi tạo

---

## 4. EPIC 3: Sales Process

### US-008: Create Reservation (Giữ chỗ)

**As a** CTV  
**I want to** giữ chỗ cho căn hộ  
**So that** khách hàng của tôi có cơ hội sở hữu căn khi dự án mở bán

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] CTV chọn căn có project status = UPCOMING
- [ ] CTV nhập thông tin khách hàng (name, phone, email)
- [ ] System tạo reservation và xếp vào queue
- [ ] CTV nhận thông báo vị trí trong queue (VD: "Bạn đang ở vị trí #3")
- [ ] Nhiều CTV có thể giữ chỗ cùng 1 căn
- [ ] Unit status vẫn = AVAILABLE (không lock)

**Business Rules:**
- Reservation không yêu cầu thanh toán
- Không có penalty khi hủy
- Queue: First-come-first-served

---

### US-009: Queue Processing - Notification khi đến lượt

**As a** CTV  
**I want to** nhận thông báo khi đến lượt tôi đặt cọc  
**So that** tôi không bỏ lỡ cơ hội bán căn

**Priority:** High  
**Story Points:** 8

**Acceptance Criteria:**
- [ ] Khi project chuyển sang OPEN, system notify CTV đầu tiên trong queue
- [ ] Notification qua: In-app, SMS, Email
- [ ] CTV có X giờ (config, default 48h) để đặt cọc
- [ ] Nếu CTV không đặt cọc → Status = MISSED → Next CTV được notify
- [ ] CTV có thể xem countdown timer

---

### US-010: Create Booking

**As a** CTV  
**I want to** tạo phiếu booking với thanh toán 10 triệu  
**So that** khách hàng có thể đặt chỗ chính thức

**Priority:** High  
**Story Points:** 8

**Acceptance Criteria:**
- [ ] CTV chọn căn (project = OPEN)
- [ ] CTV nhập đầy đủ thông tin khách hàng
- [ ] CTV upload chứng từ thanh toán (10 triệu)
- [ ] System tạo booking với status = PENDING_APPROVAL
- [ ] System lock unit (status = RESERVED_BOOKING)
- [ ] System generate QR code động cho giao dịch
- [ ] Admin nhận notification để duyệt

---

### US-011: Admin Approve Booking

**As an** Admin  
**I want to** duyệt booking sau khi kiểm tra chứng từ  
**So that** booking được xác nhận và căn chính thức được giữ

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] Admin xem danh sách booking chờ duyệt
- [ ] Admin xem chi tiết: Thông tin khách, chứng từ, số tiền
- [ ] Admin approve → Booking status = CONFIRMED
- [ ] System gửi notification cho CTV và khách hàng
- [ ] Admin có thể reject với lý do

---

### US-012: Create Deposit (Đặt cọc)

**As a** CTV  
**I want to** tạo phiếu cọc với thanh toán 5%+ giá căn  
**So that** khách hàng có thể đặt cọc và bắt đầu trả góp

**Priority:** High  
**Story Points:** 8

**Acceptance Criteria:**
- [ ] CTV chọn căn (từ booking hoặc trực tiếp)
- [ ] CTV nhập thông tin khách hàng đầy đủ
- [ ] CTV nhập số tiền cọc (min 5% giá căn)
- [ ] CTV upload chứng từ thanh toán
- [ ] System validate: Số tiền >= 5% giá căn
- [ ] System tạo deposit với status = PENDING_APPROVAL
- [ ] Admin nhận notification để duyệt

---

### US-013: Admin Approve Deposit & Create Payment Schedule

**As an** Admin  
**I want to** duyệt deposit và hệ thống tự động tạo lịch trả góp  
**So that** khách hàng có lịch thanh toán rõ ràng

**Priority:** High  
**Story Points:** 8

**Acceptance Criteria:**
- [ ] Admin duyệt deposit → Status = CONFIRMED
- [ ] System tự động tạo 4 đợt thanh toán:
  - Đợt 1 (Cọc): 5% - Đã thanh toán
  - Đợt 2: 30% (sau 30 ngày)
  - Đợt 3: 30% (sau 60 ngày)
  - Đợt 4: 35% (bàn giao)
- [ ] System lock unit (status = DEPOSITED)
- [ ] System gửi notification cho CTV
- [ ] CTV có thể xem lịch trả góp

---

### US-014: Cancel Reservation/Booking/Deposit

**As a** CTV  
**I want to** hủy phiếu của mình  
**So that** tôi có thể giải phóng căn hoặc hủy deal không thành

**Priority:** Medium  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] CTV chỉ hủy được phiếu của mình
- [ ] Admin hủy được tất cả phiếu
- [ ] System hỏi lý do hủy (optional)
- [ ] Nếu có penalty → System tính và hiển thị
- [ ] Unit trở về AVAILABLE (nếu không còn booking/deposit khác)
- [ ] System gửi notification

**Penalty Rules:**
- Reservation: No penalty (free cancel)
- Booking CONFIRMED: 50% penalty (configurable)
- Deposit CONFIRMED: 50% penalty (configurable)

---

## 5. EPIC 4: Payments & Transactions

### US-015: Record Transaction

**As a** CTV  
**I want to** ghi nhận thanh toán với chứng từ  
**So that** admin có thể xác nhận và update lịch trả góp

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] CTV chọn deposit và payment schedule (đợt nào)
- [ ] CTV nhập: Số tiền, Ngày thanh toán, Mã tham chiếu
- [ ] CTV upload chứng từ (ảnh hoặc PDF)
- [ ] System tạo transaction với status = PENDING_CONFIRMATION
- [ ] Admin nhận notification để confirm
- [ ] CTV có thể xem lịch sử transactions

---

### US-016: Admin Confirm Transaction

**As an** Admin  
**I want to** xác nhận thanh toán sau khi kiểm tra chứng từ  
**So that** lịch trả góp được update và căn được bán khi đủ tiền

**Priority:** High  
**Story Points:** 8

**Acceptance Criteria:**
- [ ] Admin xem danh sách transactions chờ xác nhận
- [ ] Admin xem chi tiết: Amount, Date, Proof, Reference
- [ ] Admin confirm → Transaction status = CONFIRMED
- [ ] System update payment schedule: paidAmount += amount
- [ ] Nếu đợt đủ tiền → Schedule status = PAID
- [ ] Nếu tất cả đợt đã paid → Deposit status = COMPLETED, Unit = SOLD
- [ ] System tự động tạo commission khi unit = SOLD

**Business Rules:**
- Tất cả updates phải atomic (transaction)
- Commission chỉ được tạo khi unit = SOLD
- Notification được gửi cho CTV

---

## 6. EPIC 5: Commissions & Payment Requests

### US-017: View My Commissions

**As a** CTV  
**I want to** xem tất cả hoa hồng của mình  
**So that** tôi biết mình đã kiếm được bao nhiêu và còn bao nhiêu chưa được thanh toán

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] CTV xem danh sách commissions với filters: Status, Date
- [ ] Summary hiển thị:
  - Total earned
  - Pending
  - Approved
  - Paid
- [ ] Mỗi commission hiển thị: Unit code, Amount, Rate, Status, Date
- [ ] CTV có thể xem chi tiết từng commission

---

### US-018: Create Payment Request (Rút hoa hồng)

**As a** CTV  
**I want to** yêu cầu rút hoa hồng  
**So that** tôi có thể nhận tiền từ công ty

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] CTV chọn commission(s) có status = PENDING
- [ ] CTV nhập thông tin ngân hàng: Bank name, Account number, Account name
- [ ] System validate: Commission phải của CTV này
- [ ] System tạo payment request với status = PENDING
- [ ] Admin nhận notification để duyệt
- [ ] CTV có thể track status của request

---

### US-019: Admin Approve Payment Request

**As an** Admin  
**I want to** duyệt yêu cầu rút hoa hồng  
**So that** CTV được thanh toán đúng hạn

**Priority:** High  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] Admin xem danh sách payment requests chờ duyệt
- [ ] Admin xem chi tiết: Commission info, Bank info, Amount
- [ ] Admin approve → Payment request status = APPROVED, Commission status = APPROVED
- [ ] System gửi notification cho CTV
- [ ] Admin có thể reject với lý do

---

### US-020: Admin Mark Payment as Paid

**As an** Admin  
**I want to** đánh dấu payment request đã thanh toán  
**So that** commission được cập nhật status = PAID và CTV biết đã nhận tiền

**Priority:** High  
**Story Points:** 3

**Acceptance Criteria:**
- [ ] Admin xem payment requests đã approve
- [ ] Admin mark as PAID → Commission status = PAID
- [ ] System set commission.paidAt = now()
- [ ] System gửi notification cho CTV
- [ ] CTV có thể xem lịch sử payment requests

---

## 7. EPIC 6: Reports & Analytics

### US-021: View Dashboard (Admin)

**As an** Admin  
**I want to** xem dashboard tổng quan  
**So that** tôi có cái nhìn tổng thể về tình hình bán hàng

**Priority:** High  
**Story Points:** 8

**Acceptance Criteria:**
- [ ] Dashboard hiển thị:
  - Tổng số căn, Còn trống, Đã giữ/book, Đã bán
  - Doanh thu theo tháng
  - Top CTVs (số căn, commission)
  - Biểu đồ trạng thái căn
- [ ] Có thể filter theo project
- [ ] Có thể export báo cáo Excel/PDF

---

### US-022: View My Dashboard (CTV)

**As a** CTV  
**I want to** xem dashboard cá nhân  
**So that** tôi biết hiệu suất bán hàng của mình

**Priority:** Medium  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] Dashboard hiển thị:
  - Số deals đang xử lý (reservations, bookings, deposits)
  - Tổng commission earned
  - Commission pending/approved/paid
  - Thống kê theo tháng
- [ ] Có thể xem chi tiết từng số liệu

---

### US-023: View Audit Logs

**As an** Admin  
**I want to** xem lịch sử thay đổi trong hệ thống  
**So that** tôi có thể audit và troubleshoot issues

**Priority:** Medium  
**Story Points:** 5

**Acceptance Criteria:**
- [ ] Admin xem audit logs với filters: User, Action, Entity type, Date
- [ ] Mỗi log hiển thị: Who, What, When, Old value, New value
- [ ] Có thể search theo keywords
- [ ] Có thể export logs

---

## 8. USER STORIES SUMMARY

### By Priority

**High Priority (Must Have):**
- US-001 to US-020 (Core features)

**Medium Priority (Should Have):**
- US-021 to US-023 (Reports & Analytics)

**Low Priority (Nice to Have):**
- Advanced search
- Export to multiple formats
- Mobile app

### By Story Points

| Story Points | Count | Total |
|--------------|-------|-------|
| 2 | 1 | 2 |
| 3 | 3 | 9 |
| 5 | 15 | 75 |
| 8 | 6 | 48 |
| **Total** | **25** | **134** |

**Estimated Timeline:** 4-6 months (with team of 3-5 developers)

---

**Document End**

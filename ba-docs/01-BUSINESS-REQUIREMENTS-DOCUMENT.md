# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## Hệ thống Quản lý Bán Căn Hộ Dự Án - Winland

**Document ID:** BRD-WINLAND-001  
**Version:** 1.0  
**Date:** January 2025  
**Status:** Approved  
**Prepared by:** Business Analyst Team  
**Approved by:** [Khách hàng]

---

## TABLE OF CONTENTS

1. [Document Control](#1-document-control)
2. [Executive Summary](#2-executive-summary)
3. [Business Objectives](#3-business-objectives)
4. [Stakeholders](#4-stakeholders)
5. [Business Rules](#5-business-rules)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Assumptions and Constraints](#8-assumptions-and-constraints)
9. [Success Criteria](#9-success-criteria)

---

## 1. DOCUMENT CONTROL

| Item | Details |
|------|---------|
| **Document Title** | Business Requirements Document - Winland System |
| **Document Version** | 1.0 |
| **Date Created** | January 2025 |
| **Last Updated** | January 2025 |
| **Document Owner** | Business Analyst Team |
| **Reviewers** | Project Manager, Technical Lead, Business Owner |
| **Approvers** | [Khách hàng] |
| **Status** | Approved |

### 1.1 Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | BA Team | Initial release |

---

## 2. EXECUTIVE SUMMARY

### 2.1 Purpose

Tài liệu này mô tả các yêu cầu nghiệp vụ (Business Requirements) cho hệ thống **Winland** - một nền tảng quản lý và bán căn hộ dự án bất động sản.

### 2.2 Scope

**Trong phạm vi:**
- ✅ Quản lý dự án, căn hộ (Projects, Buildings, Floors, Units)
- ✅ Quy trình bán hàng: Giữ chỗ → Booking → Cọc → Bán
- ✅ Quản lý thanh toán và lịch trả góp
- ✅ Tính toán và quản lý hoa hồng cho CTV
- ✅ Quản lý người dùng và phân quyền
- ✅ Báo cáo và analytics

**Ngoài phạm vi (tương lai):**
- ⏳ Mobile app native (iOS/Android)
- ⏳ Integration với CRM bên thứ 3
- ⏳ Marketing automation
- ⏳ E-contract ký số

### 2.3 Business Context

**Vấn đề hiện tại:**
- Quản lý thủ công bằng Excel gây sai sót, chậm trễ
- Nhiều CTV cùng bán một căn → Xung đột, mất niềm tin khách hàng
- Không tracking được tiến độ thanh toán → Khó quản lý dòng tiền
- Tính hoa hồng thủ công → Thiếu minh bạch, dễ nhầm lẫn
- Thiếu báo cáo real-time → Khó ra quyết định chiến lược

**Giải pháp:**
- Hệ thống tự động hóa toàn bộ quy trình
- Smart lock mechanism tránh xung đột
- Real-time tracking thanh toán và commission
- Dashboard và báo cáo đầy đủ

---

## 3. BUSINESS OBJECTIVES

### 3.1 Mục tiêu Chính

| # | Mục tiêu | Mô tả | KPI |
|---|----------|-------|-----|
| 1 | **Tăng hiệu quả bán hàng** | Giảm thời gian xử lý từ giờ xuống phút | Tăng 50% số deals/tháng |
| 2 | **Giảm sai sót** | Tự động hóa thay vì thủ công | Giảm 90% lỗi dữ liệu |
| 3 | **Minh bạch hoa hồng** | CTV xem được chi tiết commission | 100% CTV hài lòng |
| 4 | **Quản lý tập trung** | Tất cả data ở một nơi | Admin xử lý 500+ căn/ngày |
| 5 | **Real-time tracking** | Cập nhật trạng thái tức thì | Dashboard update < 1 giây |

### 3.2 Expected Benefits

**ROI dự kiến:**
- **Tăng doanh số:** 30-50% nhờ quy trình nhanh hơn
- **Giảm chi phí:** 40% nhờ tự động hóa
- **Tăng sự hài lòng:** 80% CTV hài lòng với hệ thống
- **Giảm thời gian xử lý:** Từ 2 giờ → 10 phút cho mỗi deal

---

## 4. STAKEHOLDERS

### 4.1 Stakeholder Matrix

| Stakeholder | Role | Interest | Influence | Engagement Level |
|-------------|------|----------|-----------|------------------|
| **Chủ đầu tư** | Business Owner | Cao | Cao | Rất cao |
| **SUPER_ADMIN** | System Administrator | Cao | Cao | Cao |
| **ADMIN** | Operations Manager | Cao | Trung bình | Cao |
| **CTV** | Sales Agent | Cao | Thấp | Cao |
| **Khách hàng** | End User | Trung bình | Thấp | Trung bình |
| **Developer Team** | Implementation | Cao | Trung bình | Cao |

### 4.2 User Personas

#### Persona 1: Nguyễn Văn A - CTV (Cộng tác viên)

**Background:**
- Tuổi: 28-45
- Kinh nghiệm: 2-5 năm bán BĐS
- Tech-savvy: Trung bình (sử dụng smartphone tốt)

**Goals:**
- Bán được nhiều căn để tăng thu nhập
- Xem được hoa hồng minh bạch
- Làm việc nhanh, không cần chờ admin
- Nhận thông báo kịp thời

**Pain Points:**
- Phải gọi admin nhiều lần để check status
- Không biết căn nào còn trống
- Tính hoa hồng không rõ ràng

**Needs:**
- ✅ Xem real-time căn còn trống
- ✅ Tự tạo phiếu không cần chờ
- ✅ Xem hoa hồng chi tiết
- ✅ Làm việc trên mobile

#### Persona 2: Trần Thị B - ADMIN (Quản lý vận hành)

**Background:**
- Tuổi: 30-50
- Kinh nghiệm: 3-10 năm quản lý BĐS
- Tech-savvy: Tốt (sử dụng Excel, email tốt)

**Goals:**
- Quản lý nhiều dự án hiệu quả
- Kiểm soát được tất cả giao dịch
- Báo cáo nhanh cho lãnh đạo
- Giảm sai sót

**Pain Points:**
- Quản lý Excel dễ sai sót
- Không biết CTV nào đang làm gì
- Tính hoa hồng mất nhiều thời gian

**Needs:**
- ✅ Dashboard tổng quan
- ✅ Duyệt phiếu nhanh
- ✅ Báo cáo tự động
- ✅ Track từng giao dịch

#### Persona 3: Lê Văn C - SUPER_ADMIN (Giám đốc)

**Background:**
- Tuổi: 40-60
- Vai trò: Quản lý toàn bộ hệ thống
- Tech-savvy: Trung bình

**Goals:**
- Xem báo cáo tổng quan
- Cấu hình hệ thống
- Quản lý users

**Needs:**
- ✅ Báo cáo real-time
- ✅ Config system settings
- ✅ User management

---

## 5. BUSINESS RULES

### 5.1 Quy tắc Quản lý Căn hộ

**BR-001: Quy trình Thay đổi Tình trạng Căn hộ**
- Tình trạng căn hộ phải tuân theo thứ tự: `Còn trống → Đã đặt chỗ → Đã đặt cọc → Đã bán`
- Không thể bỏ qua bước (ví dụ: từ "Còn trống" → "Đã bán")
- Khi phiếu đặt chỗ/đặt cọc bị hủy → Căn hộ trở về "Còn trống" (tự động đồng bộ)

**BR-002: Lock Mechanism**
- Một căn chỉ có thể có 1 booking hoặc 1 deposit active tại một thời điểm
- Nhiều reservations có thể cùng tồn tại cho 1 căn (queue system)

**BR-003: Unit Code Format**
- Format: `{BuildingCode}-{FloorNumber}-{UnitNumber}`
- Ví dụ: `A1-08-05` = Tòa A1, Tầng 8, Căn 05
- Code phải unique trong hệ thống

### 5.2 Quy tắc Giữ chỗ (Reservation)

**BR-004: Điều kiện Giữ chỗ**
- Chỉ có thể giữ chỗ cho dự án ở giai đoạn "Sắp mở bán"
- Nhiều CTV có thể giữ chỗ cùng 1 căn
- Giữ chỗ không yêu cầu thanh toán

**BR-005: Hệ thống Xếp hàng**
- Các phiếu giữ chỗ được xếp theo thứ tự: Ưu tiên → Thời gian tạo (ai đến trước được phục vụ trước)
- Khi dự án chuyển sang "Đang mở bán": CTV đầu tiên được thông báo và có X giờ để đặt cọc
- Nếu CTV không đặt cọc → Tình trạng = "Bỏ lỡ cơ hội" → CTV tiếp theo được thông báo

**BR-006: Thời Gian Giữ Chỗ**
- Mặc định: 24 giờ (có thể tùy chỉnh)
- Có thể gia hạn 1 lần (có thể tùy chỉnh)
- Tự động hết hạn sau khi quá thời gian

### 5.3 Quy tắc Booking

**BR-007: Booking Requirements**
- Có thể tạo từ reservation hoặc trực tiếp (nếu project = `OPEN`)
- Yêu cầu thanh toán: 10 triệu VNĐ (fixed) hoặc 0.5% giá căn (percentage) - configurable
- Yêu cầu Admin approval

**BR-008: Booking Duration**
- Default: 48 giờ (configurable)
- Auto-expire sau khi hết hạn
- Có thể upgrade thành Deposit

**BR-009: Cancellation Policy**
- CTV cancel: Mất 50% phí (configurable)
- Admin cancel: Hoàn 100% (no penalty)

### 5.4 Quy tắc Cọc (Deposit)

**BR-010: Deposit Requirements**
- Minimum: 5% giá căn (configurable: 3%, 5%, 10%...)
- Maximum: 100% (full payment)
- Yêu cầu Admin approval

**BR-011: Payment Schedule**
- Tự động tạo 4 đợt thanh toán khi approve deposit:
  - Đợt 1 (Cọc): 5%
  - Đợt 2: 30% (sau 30 ngày)
  - Đợt 3: 30% (sau 60 ngày)
  - Đợt 4: 35% (bàn giao)
- Template có thể config

**BR-012: Từ Đặt cọc đến Đã bán**
- Khi tất cả đợt thanh toán được xác nhận → Tình trạng căn hộ = "Đã bán"
- Tự động tạo hoa hồng cho CTV

### 5.5 Quy tắc Hoa hồng (Commission)

**BR-013: Tính toán Hoa hồng**
- Tự động tính khi căn hộ đã bán
- Formula: `Commission = BasePrice × Rate / 100`
- Base Price: `final_price` (ưu tiên) hoặc `list_price` (configurable)
- Rate Priority: `Unit.commissionRate` > `Project.commissionRate` > `Default (2%)`

**BR-014: Tình trạng Hoa hồng**
- `Chờ xử lý`: Vừa tạo, chưa có yêu cầu rút tiền
- `Đã duyệt`: Yêu cầu rút tiền đã được admin duyệt
- `Đã thanh toán`: Đã chuyển tiền cho CTV

**BR-015: Tính lại Hoa hồng**
- Chỉ có thể tính lại khi ở tình trạng "Chờ xử lý"
- Khi giá thực tế của phiếu cọc thay đổi → Tự động tính lại (nếu đang "Chờ xử lý")

### 5.6 Quy tắc Payment Request

**BR-016: Điều kiện Yêu cầu Rút Hoa hồng**
- CTV chỉ có thể yêu cầu rút hoa hồng của mình
- Hoa hồng phải ở tình trạng "Chờ xử lý"
- Số tiền tối thiểu: 10 triệu VNĐ (có thể tùy chỉnh)

**BR-017: Tình trạng Yêu cầu Rút Hoa hồng**
- `Chờ duyệt`: Vừa tạo, chờ admin duyệt
- `Đã duyệt`: Admin đã duyệt, đang xử lý thanh toán
- `Từ chối`: Admin từ chối (có lý do)
- `Đã thanh toán`: Đã chuyển tiền xong

**BR-018: Cập nhật Tình trạng Hoa hồng**
- Khi yêu cầu rút tiền được duyệt → Tình trạng hoa hồng = "Đã duyệt"
- Khi yêu cầu rút tiền được đánh dấu đã thanh toán → Tình trạng hoa hồng = "Đã thanh toán"

### 5.7 Quy tắc Authentication

**BR-019: CTV Registration**
- Đăng ký bằng SĐT + OTP (6 số, expires 5 phút)
- OTP max attempts: 3 lần
- OTP rate limit: 3 OTP/giờ/SĐT

**BR-020: CTV Login**
- Đăng nhập: SĐT + OTP + Password
- OTP verification required

**BR-021: Admin Login**
- Đăng nhập: Email + Password
- Không yêu cầu OTP

### 5.8 Quy tắc Quyền hạn

**BR-022: Quyền truy cập của CTV**
- CTV chỉ xem và thao tác trên thông tin của mình
- Không thể xem thông tin của CTV khác
- Không thể xem toàn bộ căn hộ (chỉ căn còn trống)

**BR-023: Quyền truy cập của Admin**
- Admin xem tất cả thông tin trong hệ thống
- Admin có thể tạo/hủy phiếu thay mặt CTV
- Admin có thể chỉnh sửa căn hộ, dự án

**BR-024: Quyền truy cập của SUPER_ADMIN**
- Quyền truy cập đầy đủ toàn hệ thống
- Cấu hình các thông số hệ thống
- Quản lý tất cả người dùng

---

## 6. FUNCTIONAL REQUIREMENTS

### 6.1 Module: Authentication & Authorization

**FR-001: CTV Đăng Ký**
- Người dùng nhập số điện thoại
- Hệ thống gửi mã OTP qua tin nhắn SMS
- Người dùng xác minh mã OTP
- Người dùng nhập thông tin (họ tên, mật khẩu)
- Hệ thống tạo tài khoản với vai trò = CTV

**FR-002: CTV Đăng Nhập**
- Người dùng nhập số điện thoại
- Hệ thống gửi mã OTP
- Người dùng nhập mã OTP + Mật khẩu
- Hệ thống xác minh và tạo mã xác thực (token)

**FR-003: Admin Đăng Nhập**
- Admin nhập Email + Mật khẩu
- Hệ thống xác minh và tạo mã xác thực (token)

**FR-004: Đặt Lại Mật khẩu**
- Người dùng yêu cầu đặt lại mật khẩu qua OTP
- Hệ thống gửi mã OTP
- Người dùng xác minh mã OTP
- Người dùng nhập mật khẩu mới
- Hệ thống cập nhật mật khẩu và yêu cầu đăng nhập lại trên tất cả thiết bị

### 6.2 Module: Projects & Units Management

**FR-005: Tạo Dự Án**
- Admin nhập thông tin dự án
- Hệ thống kiểm tra và tạo dự án
- Giai đoạn mặc định = "Sắp mở bán"

**FR-006: Nhập Hàng Loạt Căn Hộ**
- Admin tải lên file Excel
- Hệ thống đọc và kiểm tra dữ liệu
- Hệ thống hiển thị xem trước trước khi nhập
- Admin xác nhận → Hệ thống tạo tất cả căn hộ

**FR-007: Cập Nhật Tình Trạng Căn Hộ**
- Tự động cập nhật khi có đặt chỗ/đặt cọc/hủy
- Admin có thể thay đổi thủ công (với lý do)
- Hệ thống ghi lại mọi thay đổi tình trạng

### 6.3 Module: Reservations (Giữ chỗ)

**FR-008: Create Reservation**
- CTV chọn căn (status = AVAILABLE, project = UPCOMING)
- CTV nhập thông tin khách hàng
- System tạo reservation với status = `ACTIVE`
- System thêm vào queue (nếu có nhiều reservations)

**FR-009: Queue Processing**
- Khi project chuyển sang `OPEN`: System notify CTV đầu tiên
- CTV có X giờ để đặt cọc
- Nếu không đặt cọc → Status = `MISSED` → Next CTV

**FR-010: Cancel Reservation**
- CTV có thể cancel reservation của mình
- Admin có thể cancel bất kỳ reservation nào
- Khi cancel → Unit trở về AVAILABLE (nếu không còn booking/deposit)

### 6.4 Module: Bookings

**FR-011: Tạo Phiếu Đặt Chỗ**
- Từ giữ chỗ: CTV nâng cấp giữ chỗ → Đặt chỗ
- Trực tiếp: CTV tạo phiếu đặt chỗ mới (nếu dự án = "Đang mở bán")
- Hệ thống yêu cầu thanh toán 10 triệu
- Hệ thống tạo phiếu đặt chỗ với tình trạng = "Chờ duyệt"

**FR-012: Admin Duyệt Phiếu Đặt Chỗ**
- Admin xem chi tiết phiếu đặt chỗ
- Admin duyệt → Tình trạng = "Đã duyệt"
- Hệ thống khóa căn (tình trạng = "Đã đặt chỗ")

**FR-013: Booking Expiry**
- Booking auto-expire sau 48 giờ (configurable)
- System notify CTV trước khi expire
- Khi expire → Status = `EXPIRED` → Unit trở về AVAILABLE

### 6.5 Module: Deposits (Cọc)

**FR-014: Create Deposit**
- CTV chọn căn (từ booking hoặc trực tiếp)
- CTV nhập thông tin khách, số tiền cọc (min 5%)
- System validate amount
- System tạo deposit với status = `PENDING_APPROVAL`

**FR-015: Admin Approve Deposit**
- Admin approve → Status = `CONFIRMED`
- System tự động tạo 4 đợt thanh toán (payment schedule)
- System lock unit (status = `DEPOSITED`)

**FR-016: Lịch Trả Góp**
- Đợt 1 (Cọc): 5% - Đã thanh toán khi duyệt
- Đợt 2-4: Hệ thống tự động tạo với ngày đến hạn
- CTV tải lên chứng từ cho từng đợt
- Admin xác nhận → Hệ thống cập nhật tình trạng lịch trả góp

### 6.6 Module: Transactions

**FR-017: Record Transaction**
- CTV tạo transaction với amount, proof image
- System tạo transaction với status = `PENDING_CONFIRMATION`
- Link đến payment schedule (nếu có)

**FR-018: Admin Confirm Transaction**
- Admin xem transaction detail và proof
- Admin confirm → Status = `CONFIRMED`
- System update payment schedule (paidAmount += amount)
- System check: Nếu tất cả đợt đã paid → Deposit status = `COMPLETED`, Unit = `SOLD`

### 6.7 Module: Commissions

**FR-019: Tự Động Tính Hoa hồng**
- Tự động kích hoạt: Khi căn hộ = "Đã bán"
- Hệ thống tìm phiếu cọc liên quan
- Hệ thống tính hoa hồng theo công thức
- Hệ thống tạo hoa hồng với tình trạng = "Chờ xử lý"

**FR-020: Xem Hoa hồng**
- CTV xem tất cả hoa hồng của mình
- Tìm kiếm và lọc theo tình trạng: Chờ xử lý, Đã duyệt, Đã thanh toán
- Tổng hợp: Tổng đã kiếm, chờ xử lý, đã duyệt, đã thanh toán

**FR-021: Tính Lại Hoa hồng**
- Admin có thể tính lại hoa hồng (nếu ở tình trạng "Chờ xử lý")
- Tự động kích hoạt: Khi giá thực tế của phiếu cọc thay đổi
- Hệ thống cập nhật số tiền hoa hồng

### 6.8 Module: Payment Requests

**FR-022: Tạo Yêu cầu Rút Hoa hồng**
- CTV chọn hoa hồng (tình trạng = "Chờ xử lý")
- CTV nhập thông tin tài khoản ngân hàng
- Hệ thống tạo yêu cầu với tình trạng = "Chờ duyệt"

**FR-023: Admin Duyệt Yêu cầu Rút Hoa hồng**
- Admin xem chi tiết yêu cầu
- Admin duyệt → Tình trạng yêu cầu = "Đã duyệt", Tình trạng hoa hồng = "Đã duyệt"

**FR-024: Admin Đánh Dấu Đã Thanh Toán**
- Admin đánh dấu yêu cầu đã thanh toán
- Hệ thống cập nhật tình trạng hoa hồng = "Đã thanh toán"
- Hệ thống ghi nhận ngày thanh toán

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance

| Requirement | Target |
|-------------|--------|
| **Page Load Time** | < 2 giây |
| **API Response Time** | < 500ms (95th percentile) |
| **Database Query** | < 100ms (simple queries) |
| **Concurrent Users** | Support 100+ users đồng thời |
| **Data Export** | < 10 giây cho 1000 records |

### 7.2 Khả Năng Mở Rộng

- Hệ thống có thể mở rộng để quản lý 10,000+ căn hộ
- Hỗ trợ 500+ CTV
- Hỗ trợ 50+ dự án đồng thời

### 7.3 Tính Sẵn Sàng

- Thời gian hoạt động: 99.5% (thời gian ngừng hoạt động < 4 giờ/tháng)
- Sao lưu: Tự động sao lưu hàng ngày
- Khôi phục: Có thể khôi phục về một thời điểm cụ thể trong quá khứ

### 7.4 Security

- ✅ Password encryption (bcrypt)
- ✅ JWT token expiration (24 giờ)
- ✅ HTTPS required
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Role-based access control

### 7.5 Usability

- Responsive design (mobile, tablet, desktop)
- Intuitive UI/UX
- Multi-language support (Vietnamese, English)
- Accessibility: WCAG 2.1 Level AA

### 7.6 Compatibility

**Browsers:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Mobile:**
- iOS Safari (iOS 13+)
- Chrome Mobile (Android 8+)

---

## 8. ASSUMPTIONS AND CONSTRAINTS

### 8.1 Assumptions

1. ✅ Users có internet connection ổn định
2. ✅ CTV có smartphone để nhận OTP
3. ✅ Admin có quyền truy cập email
4. ✅ Database được backup đều đặn
5. ✅ SMS provider hoạt động ổn định

### 8.2 Constraints

**Kỹ thuật:**
- ⚠️ Phụ thuộc vào dịch vụ tin nhắn SMS cho mã OTP
- ⚠️ Phụ thuộc vào hiệu suất máy chủ cơ sở dữ liệu
- ⚠️ Phụ thuộc vào kết nối internet

**Nghiệp vụ:**
- ⚠️ Phải có admin để duyệt phiếu đặt chỗ/đặt cọc
- ⚠️ Tỷ lệ hoa hồng phải được cấu hình trước
- ⚠️ Mẫu lịch trả góp phải được thiết lập

**Legal:**
- ⚠️ Tuân thủ quy định về bảo vệ dữ liệu cá nhân
- ⚠️ Cần consent từ user để xử lý dữ liệu

---

## 9. SUCCESS CRITERIA

### 9.1 Key Performance Indicators (KPIs)

| KPI | Target | Measurement |
|-----|--------|-------------|
| **User Adoption** | 80% CTV active trong 30 ngày đầu | Analytics |
| **System Uptime** | 99.5% | Monitoring |
| **Processing Time** | < 10 phút cho mỗi deal | Metrics |
| **Error Rate** | < 1% | Error logs |
| **User Satisfaction** | 4.5/5 | Survey |

### 9.2 Acceptance Criteria

**System được coi là thành công nếu:**
1. ✅ 100% functional requirements được implement
2. ✅ Pass tất cả test cases
3. ✅ Performance đạt target
4. ✅ 80%+ users hài lòng
5. ✅ Zero critical bugs trong 30 ngày đầu

---

## APPENDIX

### A. Glossary

| Term | Definition |
|------|------------|
| **CTV** | Cộng tác viên - Sales agent |
| **Reservation** | Phiếu giữ chỗ - Không ràng buộc, nhiều CTV có thể cùng giữ |
| **Booking** | Phiếu đặt - Ràng buộc hơn, yêu cầu thanh toán 10 triệu |
| **Deposit** | Phiếu cọc - Ràng buộc cao, yêu cầu thanh toán 5%+ giá căn |
| **Commission** | Hoa hồng - Số tiền CTV nhận được khi bán căn |
| **Payment Request** | Yêu cầu rút hoa hồng - CTV yêu cầu thanh toán commission |
| **Payment Schedule** | Lịch trả góp - 4 đợt thanh toán cho deposit |
| **Unit Status** | Trạng thái căn: AVAILABLE, RESERVED_BOOKING, DEPOSITED, SOLD |
| **Queue** | Hàng đợi - Thứ tự ưu tiên cho reservations |

### B. References

- Technical Architecture Document
- Database Schema Document
- API Documentation
- User Guides

---

**Document End**

**Prepared by:** Business Analyst Team  
**Date:** January 2025  
**Status:** ✅ Approved

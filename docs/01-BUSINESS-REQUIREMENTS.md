# Business Requirements Document (BRD)

## 📋 Thông tin tài liệu

**Dự án:** Batdongsan - Hệ thống Quản lý Bán Căn Hộ Dự Án  
**Phiên bản:** 3.0  
**Ngày tạo:** October 2025  
**Trạng thái:** Final Draft

---

## 1. Executive Summary

### 1.1 Bối cảnh

Các doanh nghiệp phát triển dự án BĐS (chủ đầu tư) cần hệ thống quản lý:
- **Hàng trăm/ngàn căn hộ** trong dự án (cấu trúc: Dự án → Block → Tầng → Căn)
- **Quy trình giao dịch:** Giữ chỗ → Booking → Cọc → Thanh toán → Bán
- **Đội ngũ CTV** bán hàng với hoa hồng minh bạch
- **Tracking real-time:** Trạng thái căn, thanh toán, commission

**Vấn đề hiện tại:**
- Quản lý thủ công (Excel) → Sai sót, chậm trễ
- Conflict: Nhiều CTV bán cùng 1 căn
- Không tracking được tiến độ thanh toán
- Tính hoa hồng thủ công, không minh bạch
- Thiếu báo cáo real-time

### 1.2 Giải pháp

**Hệ thống quản lý & bán căn hộ dự án**, chia 2 phần:

**Trang CTV (Cộng tác viên):**
- Xem dự án, căn hộ còn trống
- **3 loại phiếu:** Giữ chỗ → Booking → Cọc
- Tracking thanh toán, nhận thông báo
- Xem hoa hồng, yêu cầu thanh toán

**Trang Admin (Quản trị):**
- Quản lý dự án (import bulk units)
- Duyệt booking/cọc
- Xác nhận giao dịch
- Tính hoa hồng tự động
- Báo cáo, sơ đồ quy hoạch interactive

---

## 2. Business Objectives

### 2.1 Mục tiêu chính

1. **Giảm sai sót:** Lock căn khi giữ chỗ → Không conflict
2. **Tăng tốc chốt:** Quy trình nhanh, CTV tự phục vụ
3. **Minh bạch:** Tracking đầy đủ, commission tự động
4. **Real-time:** Trạng thái căn cập nhật tức thì
5. **Quản lý tập trung:** Admin control toàn bộ

### 2.2 Success Metrics

**Phase 1 (3 tháng):**
- 1-2 dự án pilot (200-500 căn)
- 20-50 CTVs active
- 100+ reservations
- 50+ deposits
- 20+ sold units
- 100,000,000+ VNĐ commission paid

---

## 3. Stakeholders

### 3.1 SUPER_ADMIN
- Quản lý tất cả users, projects
- Config hệ thống
- Full permissions

### 3.2 ADMIN
- CRUD projects, units (bulk import)
- Duyệt booking/cọc
- Xác nhận payments
- Tính commission
- Duyệt payment requests
- View reports

### 3.3 CTV (Cộng tác viên)
- Xem units available
- Tạo: Giữ chỗ, Booking, Cọc
- Upload chứng từ thanh toán
- View commissions
- Create payment requests

### 3.4 USER/GUEST (Optional)
- Xem dự án công khai
- Contact form

---

## 4. Core Business Model

### 4.1 Cấu trúc Dự án

```
Project (Dự án)
 ├─ Buildings (Block/Tòa)
 │   ├─ Floors (Tầng)
 │   │   └─ Units (Căn hộ)
 │   │       ├─ Code: A1-08-05
 │   │       ├─ Status: AVAILABLE/RESERVED.../SOLD
 │   │       ├─ Price, Area, Bedrooms...
 │   │       └─ Transactions
 │   └─ Floor Plans
 └─ Master Plan (sơ đồ tổng thể)
```

### 4.2 3 Loại Phiếu

| Loại | Ràng buộc | Thanh toán | Admin duyệt | Hủy | Đặc điểm |
|------|-----------|------------|-------------|-----|----------|
| **Giữ chỗ** | Thấp | Không | Không | Free (no penalty) | **NHIỀU CTV có thể giữ chỗ CÙNG 1 căn** |
| **Booking** | Trung bình | Có (10tr) | Có | Mất 50% | Độc quyền 1 CTV |
| **Cọc** | Cao | Có (5%+) | Có | Mất 50% | Độc quyền 1 CTV |

**Reservation Logic (Quan trọng):**
- ✅ Giữ chỗ chỉ dành cho căn **UPCOMING** (sắp mở bán)
- ✅ **NHIỀU CTV có thể giữ chỗ CÙNG 1 căn** (không lock độc quyền)
- ✅ Có **queue/priority system** (first-come-first-served)
- ✅ Khi project chuyển sang **OPEN**:
  - CTV thứ 1 trong queue được thông báo và có X giờ để đặt cọc
  - Nếu CTV 1 không đặt cọc → Status = MISSED
  - CTV thứ 2 được thông báo và có X giờ
  - Cứ tiếp tục cho đến khi có CTV đặt cọc hoặc hết queue

**Flow:**
```
[UPCOMING] Giữ chỗ (nhiều CTV) → [OPEN] Queue processing → Booking/Cọc → SOLD
              ↓
         CTV 1, 2, 3, 4... (theo thứ tự)
              ↓
         Khi OPEN: Notify CTV 1
              ↓
         CTV 1 đặt cọc? YES → SOLD | NO → Notify CTV 2
              ↓
         CTV 2 đặt cọc? YES → SOLD | NO → Notify CTV 3
```

### 4.3 Authentication Model

**CTV/User:**
- Đăng ký: SĐT + OTP (6 số, 5 phút)
- Đăng nhập: SĐT + OTP + Mật khẩu
- Quên MK: OTP reset

**Admin:**
- Email + Password (traditional)

**OTP Rules:**
- Timeout: 5 phút
- Retry: 3 lần/giờ/SĐT
- Resend: 60s cooldown
- Anti-spam

### 4.4 Payment Configuration

**Thông tin từ System Config:**
- Số TK ngân hàng
- Tên chủ TK
- Tên ngân hàng
- QR Code (static)
- Nội dung chuyển khoản template

**Mỗi phiếu:**
- Sinh mã giao dịch unique (BOK-xxx, DEP-xxx)
- QR động với nội dung: `{MaPhieu} {TenKhach} {SoTien}`
- CTV download QR → Gửi khách
- Khách chuyển khoản → Upload chứng từ → Admin confirm

---

## 5. Admin Management Features

### 5.1 Quản lý User

**Danh sách users:**
- Filter: Role, Status, Ngày đăng ký
- Search: Tên, SĐT, Email
- Actions: Edit, Activate/Deactivate, Reset password

**View user detail:**
- Profile info
- Login history
- Transaction history (nếu CTV)
- Commission earned

### 5.2 Quản lý Dự án

**CRUD Projects:**
- Tạo, Edit, Xóa (check constraint)
- Upload: Images, Master plan
- Set status: UPCOMING → OPEN → CLOSED
- Config commission rate default

**Bulk import Units:**
```
Upload Excel file:
Building | Floor | Unit | Area | Bedrooms | Price | Direction | ...
A1       | 8     | 01   | 75   | 2        | 2.5tỷ | Đông Nam  | ...

Preview → Confirm → Auto create với codes
```

### 5.3 Quản lý Căn hộ

**List units:**
- Filter: Project, Building, Floor, Status
- Search: Code (A1-08-05)
- Color code theo status
- Click → View detail

**Unit detail:**
- Info đầy đủ
- Transaction history
- Change status (manual override)
- Edit price, info

**Import/Export:**
- Import: Excel template
- Export: Current units Excel

### 5.4 Quản lý Loại Căn

**Unit Types:**
- Studio, 1PN, 2PN, 3PN, Penthouse, ...
- CRUD với check constraint (không xóa nếu đang dùng)

### 5.5 Quản lý Cấu hình (Admin Customize)

**System Configs - TẤT CẢ có thể customize:**

```yaml
General:
  logo_url: "https://..."
  company_name: "Công ty ABC"
  company_address: "..."
  contact_phone: "1900..."
  contact_email: "info@..."

Bank Info:
  bank_account_number: "1234567890"
  bank_account_name: "CONG TY ABC"
  bank_name: "Vietcombank"
  bank_branch: "Chi nhánh HN"
  bank_qr_code_url: "https://..."

Reservation (Giữ Chỗ):
  duration_hours: 24                    # Admin custom: 12, 24, 48, 72...
  max_extends: 1                        # 0, 1, 2, unlimited
  extend_before_hours: 2                # Gia hạn khi còn < X giờ
  require_approval: false               # true/false
  allow_cancel: true                    # CTV có được hủy?

Booking:
  amount_type: "fixed"                  # "fixed" hoặc "percentage"
  amount_value: 10000000                # Nếu fixed: số tiền
  amount_percentage: 0.5                # Nếu percentage: 0.5%
  duration_hours: 48                    # 24, 48, 72...
  require_approval: true                # true/false
  refund_on_cancel_percentage: 50       # 0-100%
  allow_upgrade_to_deposit: true

Deposit:
  min_percentage: 5                     # 3%, 5%, 10%...
  payment_deadline_days: 30             # 15, 30, 45, 60...
  penalty_customer_cancel_percentage: 50 # Khách hủy
  penalty_company_cancel_percentage: 0   # Công ty hủy (0 = hoàn 100%)
  require_approval: true
  auto_generate_contract: true          # Generate PDF tự động
  payment_schedule_template: "default"  # Có thể có nhiều template

Payment Schedule Templates:
  default:
    - installment_1: 5%    # Cọc
    - installment_2: 30%   # +30 days
    - installment_3: 30%   # +60 days
    - installment_4: 35%   # Bàn giao
  
  fast_track:                           # Template nhanh
    - installment_1: 10%   # Cọc
    - installment_2: 40%   # +15 days
    - installment_3: 50%   # +30 days
  
  flexible:                             # Template linh hoạt
    - installment_1: 5%    # Cọc
    - installment_2: 20%   # +30 days
    - installment_3: 25%   # +60 days
    - installment_4: 25%   # +90 days
    - installment_5: 25%   # Bàn giao

OTP:
  length: 6                             # 4, 6, 8
  expiry_minutes: 5                     # 3, 5, 10
  retry_limit_per_hour: 3               # 3, 5, unlimited
  resend_cooldown_seconds: 60           # 30, 60, 120
  sms_provider: "twilio"                # twilio, aws_sns

Commission:
  default_rate_percentage: 2.0          # Admin custom default
  calculation_base: "final_price"       # final_price or list_price
  payment_cycle: "per_deal"             # per_deal or monthly
  min_amount_for_request: 10000000      # Min 10tr mới được rút
  auto_calculate: true                  # Tự động khi sold

Overdue Warnings:
  first_warning_days: 3                 # Warning sau 3 ngày quá hạn
  second_warning_days: 7
  critical_warning_days: 15
  auto_cancel_days: 30                  # Tự động hủy sau 30 ngày

CTV Limits:
  max_active_reservations: 10           # Limit giữ chỗ cùng lúc
  max_active_bookings: 5
  max_active_deposits: 10
```

**Database:**
```sql
CREATE TABLE system_configs (
  id UUID PRIMARY KEY,
  key VARCHAR(100) UNIQUE,
  value TEXT,                    -- JSON string cho complex values
  type VARCHAR(20),              -- number, string, boolean, json, array
  label VARCHAR(255),            -- Hiển thị trên UI
  category VARCHAR(50),          -- Group configs
  description TEXT,
  editable_by VARCHAR(20),       -- SUPER_ADMIN only or ADMIN
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 5.6 Quản lý Phiếu

**3 tabs:**
- Giữ chỗ (Reservations)
- Booking
- Cọc (Deposits)

**Mỗi tab:**
- List với filter: Status, Date, CTV, Project
- Actions: View, Approve, Cancel
- Export PDF phiếu

**Admin có thể:**
- Tạo phiếu thay mặt CTV
- Edit phiếu
- Cancel với lý do
- Approve/Reject

### 5.7 Quản lý Giao dịch

**Transaction List:**
- Tất cả payments
- Link đến phiếu gốc (Booking/Deposit)
- Filter: Date, Project, CTV, Status
- Search: Mã phiếu, Tên khách

**Actions:**
- View detail
- Edit (amount, date, proof)
- Confirm payment
- Cancel transaction (with log)

### 5.8 Báo cáo

**Dashboard:**
```
╔════════════════════════════════════════╗
║ TỔNG QUAN DỰ ÁN                        ║
╠════════════════════════════════════════╣
║ [Chọn dự án: Vinhomes SC ▼]           ║
║                                        ║
║ ┌────────┬────────┬────────┬────────┐ ║
║ │Tổng căn│ Còn    │ Giữ/   │ Đã bán │ ║
║ │  1000  │  650   │ Book:  │  250   │ ║
║ │        │        │  100   │        │ ║
║ └────────┴────────┴────────┴────────┘ ║
║                                        ║
║ [Biểu đồ tròn: Tỷ lệ trạng thái]      ║
║ [Biểu đồ cột: Doanh thu theo tháng]   ║
║                                        ║
║ Top CTVs:                              ║
║ 1. Nguyen Van A - 10 căn - 500tr HH   ║
║ 2. Tran Thi B   - 8 căn  - 400tr HH   ║
║                                        ║
║ [Xuất Excel] [Xuất PDF]                ║
╚════════════════════════════════════════╝
```

**Reports:**
- Tổng quan dự án
- Chi tiết từng block
- Conversion rate (Giữ chỗ → Booking → Cọc → Sold)
- CTV performance ranking
- Revenue by month/quarter
- Commission summary

---

## 6. Detailed Business Rules

### 6.1 Unit Lock Mechanism

**Nguyên tắc:** 1 căn chỉ thuộc 1 transaction tại 1 thời điểm

**Priority (conflict resolution):**
```
1. SOLD (highest priority - permanent)
2. DEPOSITED (có hợp đồng)
3. BOOKING CONFIRMED (đã thanh toán booking)
4. RESERVATION ACTIVE (giữ chỗ)
5. AVAILABLE (lowest - anyone can take)
```

**Khi 2 CTV cùng action:**
- Database lock (row-level locking)
- First transaction commits → Success
- Second transaction → Error: "Căn đã được giữ"

### 6.2 Auto-Expiry System

**Cronjob chạy mỗi 15 phút:**

```typescript
Check Reservations:
- WHERE status = ACTIVE AND reservedUntil < NOW()
- UPDATE status = EXPIRED
- UPDATE unit status = AVAILABLE
- Send notification to CTV

Check Bookings:
- WHERE status = PENDING_PAYMENT AND expiresAt < NOW()
- UPDATE status = EXPIRED
- UPDATE unit status = AVAILABLE
- Send notification

Check Deposits:
- WHERE status = CONFIRMED AND dueDate < NOW()
- Mark as OVERDUE
- Send warning notification
```

### 6.3 Audit Requirements

**Log tất cả actions:**
- Who: userId, userName, role
- What: action (CREATE, UPDATE, DELETE, APPROVE, CANCEL)
- When: timestamp
- Where: IP, device
- Entity: entityType (PROJECT, UNIT, RESERVATION, BOOKING, DEPOSIT)
- Changes: oldValue → newValue (JSON)

**Critical actions (bắt buộc log):**
- Create/Cancel Reservation, Booking, Deposit
- Approve/Reject payments
- Change unit status manually
- Calculate commission
- Approve payment request
- Change system config

### 6.4 PDF Generation

**Các loại PDF cần generate:**

**1. Phiếu Giữ Chỗ:**
- Header: Logo, thông tin công ty
- Mã phiếu: RSV-20251020-001
- Thông tin: Dự án, căn, giá
- Khách hàng: Tên, SĐT
- Thời hạn: Đến HH:MM DD/MM/YYYY
- Footer: Điều khoản

**2. Phiếu Booking:**
- Similar + Số tiền booking
- QR code thanh toán
- Thông tin TK nhận tiền

**3. Hợp đồng Đặt Cọc:**
- Template pháp lý
- Điền tự động: Tên, CMND, địa chỉ
- Điều khoản thanh toán
- Lịch thanh toán (schedule)
- Chữ ký số vị trí (future)

---

## 7. Success Criteria

### MVP Launch:
- ✅ 3 loại phiếu hoạt động
- ✅ Import được 500 căn
- ✅ 10 CTVs test successfully
- ✅ 20 transactions hoàn tất
- ✅ Commission tính đúng 100%
- ✅ PDF generate correctly
- ✅ No critical bugs

---

**Chi tiết use cases, validation rules, activity diagrams → Xem [02-FUNCTIONAL-REQUIREMENTS.md](./02-FUNCTIONAL-REQUIREMENTS.md)**

**Sơ đồ hệ thống → Xem [DIAGRAMS.md](./DIAGRAMS.md)**

**Database design → Xem [04-DATABASE-DESIGN.md](./04-DATABASE-DESIGN.md)**

**API specs → Xem [05-API-SPECIFICATIONS.md](./05-API-SPECIFICATIONS.md)**

---

**Document Version:** 3.0  
**Status:** Ready for Review  
**Last Updated:** October 2025

# Danh Mục Diagrams

## 📊 Tổng quan

**Total:** 25 diagrams (PlantUML generated)  
**Location:** `docs/diagrams/`  
**Format:** PNG images

---

## 🎨 Danh sách Diagrams

### Architecture & Overview

| File | Type | Description | Used in |
|------|------|-------------|---------|
| system-architecture.png | Component | System architecture tổng thể | 00-Overview, 07-Tech |
| project-hierarchy.png | Object | Cấu trúc Project → Building → Floor → Unit | 00-Overview, 04-DB |
| database-erd.png | ERD | Entity Relationship Diagram (14 tables) | 04-DB |
| role-permissions.png | Component | RBAC permissions matrix | 02-FR, 07-Tech |

### Authentication & User

| File | Type | Description | Used in |
|------|------|-------------|---------|
| auth-register-otp.png | Sequence | Đăng ký SĐT + OTP flow | 02-FR (AUTH-001) |
| otp-validation.png | Activity | OTP validation logic chi tiết | 02-FR (AUTH-001) |

### Reservation (Giữ Chỗ)

| File | Type | Description | Used in |
|------|------|-------------|---------|
| reservation-flow.png | Sequence | Tạo reservation sequence | 02-FR (RSV-001) |
| bpmn-reservation-process.png | BPMN | Quy trình giữ chỗ đầy đủ | 02-FR (RSV-001) |
| race-condition-lock.png | Sequence | Database lock ngăn conflict | 02-FR (RSV-001) |

### Booking & Deposit

| File | Type | Description | Used in |
|------|------|-------------|---------|
| booking-flow.png | Sequence | Tạo booking + admin approve | 02-FR (BOK-001) |
| admin-approve-deposit.png | Sequence | Admin duyệt deposit | 02-FR (DEP-002) |
| deposit-to-sold.png | Sequence | Complete flow: Deposit → Payment → Sold | 02-FR (DEP-001) |
| bpmn-booking-to-deposit.png | BPMN | Complete BPMN: Booking → Cọc → Bán | 02-FR (BOK-001, DEP-001) |
| pdf-generation.png | Sequence | Generate PDF contract & QR | 02-FR (BOK-004) |

### Payment & Commission

| File | Type | Description | Used in |
|------|------|-------------|---------|
| payment-schedule.png | Sequence | Tạo & track payment schedule | 02-FR (PAY-001) |
| commission-calculation.png | Activity | Auto calculate commission | 02-FR (COMM-001) |
| payment-request-flow.png | Sequence | CTV request payment → Admin approve | 02-FR (COMM-003) |

### Admin & System

| File | Type | Description | Used in |
|------|------|-------------|---------|
| bulk-import-units.png | Sequence | Import Excel units | 02-FR (UNIT-001) |
| bpmn-admin-manage-units.png | BPMN | Admin manage units process | 02-FR (UNIT-001) |
| cronjob-auto-expire.png | Sequence | Cronjob expire reservations/bookings | 02-FR (RSV-004) |
| bpmn-exception-handling.png | BPMN | Xử lý ngoại lệ & edge cases | 02-FR (Module 10) |

### State Machines

| File | Type | Description | Used in |
|------|------|-------------|---------|
| unit-status-state.png | State | Unit status transitions | 02-FR, 04-DB |

---

## 🔄 Regenerate Diagrams

Khi cần update diagrams:

```bash
cd docs/diagrams

# Edit PlantUML file
vi reservation-flow.puml

# Regenerate PNG
plantuml -tpng reservation-flow.puml

# Or regenerate tất cả
plantuml -tpng *.puml
```

---

## 📝 PlantUML Files

**Source files:** `docs/diagrams/*.puml`

- Auth: auth-register-otp.puml, otp-validation.puml
- Reservation: reservation-flow.puml, bpmn-reservation-process.puml
- Booking: booking-flow.puml, admin-approve-deposit.puml
- Deposit: deposit-to-sold.puml, bpmn-booking-to-deposit.puml
- Payment: payment-schedule.puml, commission-calculation.puml
- Admin: bulk-import-units.puml, bpmn-admin-manage-units.puml
- System: system-architecture.puml, database-erd.puml
- Others: role-permissions.puml, unit-status-state.puml, etc.

---

**Version:** 3.0  
**Last Updated:** October 2025


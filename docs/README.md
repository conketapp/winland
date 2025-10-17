# Batdongsan Platform - Documentation

## 📚 Tài liệu dự án

**Hệ thống:** Quản lý Bán Căn Hộ Dự Án BĐS  
**Version:** 3.0  
**Last Updated:** October 2025

---

## 📋 DANH SÁCH TÀI LIỆU CHÍNH

### 1. Business Documents

| File | Nội dung | Đối tượng đọc |
|------|----------|---------------|
| [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md) | Tổng quan: Model, Tech stack, Timeline, Diagrams hệ thống | All |
| [01-BUSINESS-REQUIREMENTS.md](./01-BUSINESS-REQUIREMENTS.md) | Business model, Rules, 3 loại phiếu, Commission, Roles | BA, PM, Dev |

### 2. Technical Documents

| File | Nội dung | Đối tượng đọc |
|------|----------|---------------|
| [02-FUNCTIONAL-REQUIREMENTS.md](./02-FUNCTIONAL-REQUIREMENTS.md) | **⭐ CHI TIẾT từng tính năng:** Use cases, Validation, Flows, Diagrams | Developers |
| [03-USER-STORIES.md](./03-USER-STORIES.md) | User stories, Acceptance criteria, Story points | BA, QA |
| [04-DATABASE-DESIGN.md](./04-DATABASE-DESIGN.md) | ERD, Tables (14 tables), Indexes, Queries | Backend Dev |
| [05-API-SPECIFICATIONS.md](./05-API-SPECIFICATIONS.md) | API endpoints (70+), Request/Response | Frontend + Backend |
| [06-UI-UX-REQUIREMENTS.md](./06-UI-UX-REQUIREMENTS.md) | Design system, Components, Layouts | Frontend Dev |
| [CTV-MOBILE-UX.md](./CTV-MOBILE-UX.md) | ⭐ **Mobile-First UX cho CTV Portal** | Frontend Dev |
| [07-TECHNICAL-ARCHITECTURE.md](./07-TECHNICAL-ARCHITECTURE.md) | Architecture, Security, Deployment | Tech Lead |
| [08-TESTING-STRATEGY.md](./08-TESTING-STRATEGY.md) | Testing approach, Coverage | QA |

### 3. Diagrams

**Tất cả diagrams đã được embed vào đúng vị trí trong documents.**

Location: `docs/diagrams/` (18 PNG images)

| Diagram | Trong document | Mô tả |
|---------|---------------|--------|
| auth-register-otp.png | 02-FR | Đăng ký OTP flow |
| otp-validation.png | 02-FR | OTP validation logic |
| reservation-flow.png | 02-FR | Giữ chỗ sequence |
| booking-flow.png | 02-FR | Booking sequence |
| deposit-to-sold.png | 02-FR | Cọc → Thanh toán → Bán |
| payment-schedule.png | 02-FR | Payment schedule |
| admin-approve-deposit.png | 02-FR | Admin duyệt cọc |
| commission-calculation.png | 02-FR | Tính hoa hồng |
| payment-request-flow.png | 02-FR | CTV rút hoa hồng |
| bulk-import-units.png | 02-FR | Import Excel |
| cronjob-auto-expire.png | 02-FR | Auto expire |
| race-condition-lock.png | 02-FR | Prevent conflict |
| unit-status-state.png | 02-FR | Unit status state machine |
| role-permissions.png | 02-FR | RBAC permissions |
| database-erd.png | 04-DB | Database ERD |
| system-architecture.png | 00-Overview | System architecture |
| project-hierarchy.png | 00-Overview | Project structure |
| pdf-generation.png | 02-FR | PDF generation |

---

## 🎯 HƯỚNG DẪN SỬ DỤNG

### Cho Business Analyst / PM
1. **Bắt đầu:** [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md)
2. **Business rules:** [01-BUSINESS-REQUIREMENTS.md](./01-BUSINESS-REQUIREMENTS.md)
3. **User stories:** [03-USER-STORIES.md](./03-USER-STORIES.md)

### Cho Backend Developer
1. **Functional requirements:** [02-FUNCTIONAL-REQUIREMENTS.md](./02-FUNCTIONAL-REQUIREMENTS.md) ⭐
2. **Database design:** [04-DATABASE-DESIGN.md](./04-DATABASE-DESIGN.md)
3. **API specs:** [05-API-SPECIFICATIONS.md](./05-API-SPECIFICATIONS.md)
4. **Implementation:** Follow use cases in FR document

### Cho Frontend Developer
1. **UI/UX requirements:** [06-UI-UX-REQUIREMENTS.md](./06-UI-UX-REQUIREMENTS.md)
2. **API specs:** [05-API-SPECIFICATIONS.md](./05-API-SPECIFICATIONS.md)
3. **Functional flows:** Xem diagrams trong 02-FR

### Cho QA/Tester
1. **Test cases từ:** [03-USER-STORIES.md](./03-USER-STORIES.md)
2. **Validation rules từ:** [02-FUNCTIONAL-REQUIREMENTS.md](./02-FUNCTIONAL-REQUIREMENTS.md)
3. **Testing strategy:** [08-TESTING-STRATEGY.md](./08-TESTING-STRATEGY.md)

---

## 📊 THỐNG KÊ

- **Total documents:** 9 markdown files
- **Total diagrams:** 18 PNG images (PlantUML generated)
- **Database tables:** 14 tables
- **API endpoints:** 70+ endpoints
- **Modules:** 11 modules
- **User roles:** 4 roles
- **Transaction types:** 3 types (Giữ chỗ, Booking, Cọc)

---

## ✅ NGUYÊN TẮC TỔ CHỨC

### Không duplicate content
- ✅ Mỗi thông tin chỉ nằm ở 1 nơi
- ✅ Documents khác reference bằng links
- ✅ Diagrams embed vào đúng use case

### Phân cấp rõ ràng
- **Business docs (00, 01, 03):** Cho BA, PM, stakeholders
- **Technical docs (02, 04, 05, 07):** Cho developers
- **Support docs (06, 08):** Cho UI/QA

### Chi tiết ở đúng chỗ
- **Use cases, validation:** 02-FUNCTIONAL-REQUIREMENTS.md
- **Database schema:** 04-DATABASE-DESIGN.md
- **API contracts:** 05-API-SPECIFICATIONS.md
- **Diagrams:** Embed trong documents (không file riêng)

---

## 🔄 CẬP NHẬT TÀI LIỆU

Khi cần update diagrams:

```bash
cd docs/diagrams

# Edit .puml files
vi auth-register-otp.puml

# Re-render
plantuml -tpng *.puml

# Images tự động update trong documents
```

---

## 📞 Liên hệ

**Project Manager:** TBD  
**Tech Lead:** TBD  
**Business Analyst:** TBD

---

**Document Version:** 3.0  
**Status:** ✅ Complete  
**Ready for:** Implementation

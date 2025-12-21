# TÀI LIỆU BUSINESS ANALYST
## Hệ thống Quản lý Bán Căn Hộ Dự Án - Winland

**Version:** 1.0  
**Date:** January 2025  
**Prepared by:** Business Analyst Team  
**For:** Khách hàng / Stakeholders

---

## 📚 DANH SÁCH TÀI LIỆU

Bộ tài liệu này gồm các document sau:

### 1. [Executive Summary](./00-EXECUTIVE-SUMMARY.md)
**Mục đích:** Tổng quan về hệ thống cho lãnh đạo  
**Đối tượng:** CEO, Business Owners, Decision Makers

**Nội dung:**
- Bối cảnh và vấn đề
- Giải pháp và giá trị mang lại
- Tổng quan hệ thống
- Quy trình nghiệp vụ chính
- Technology stack
- Roadmap

---

### 2. [Business Requirements Document (BRD)](./01-BUSINESS-REQUIREMENTS-DOCUMENT.md)
**Mục đích:** Mô tả chi tiết yêu cầu nghiệp vụ  
**Đối tượng:** Business Analysts, Project Managers, Developers

**Nội dung:**
- Business objectives và success criteria
- Stakeholders và user personas
- Business rules chi tiết
- Functional requirements
- Non-functional requirements
- Assumptions và constraints

---

### 3. [User Stories & Use Cases](./02-USER-STORIES.md)
**Mục đích:** Mô tả các use cases từ góc độ người dùng  
**Đối tượng:** Developers, QA, Product Owners

**Nội dung:**
- User stories theo format chuẩn
- Acceptance criteria
- Epic breakdown
- Priority và story points

---

### 4. [Data Dictionary](./03-DATA-DICTIONARY.md)
**Mục đích:** Mô tả chi tiết database schema  
**Đối tượng:** Database Administrators, Backend Developers

**Nội dung:**
- Tất cả entities và fields
- Data types và constraints
- Relationships
- Business rules cho từng field
- Status enums

---

### 5. [API Documentation Summary](./04-API-DOCUMENTATION-SUMMARY.md)
**Mục đích:** Tổng quan về API endpoints  
**Đối tượng:** Frontend Developers, Integration Teams

**Nội dung:**
- API endpoints by module
- Request/Response examples
- Authentication flow
- Error handling
- Common patterns

---

### 6. [User Guide](./05-USER-GUIDE.md)
**Mục đích:** Hướng dẫn sử dụng cho end users  
**Đối tượng:** CTV, Admin

**Nội dung:**
- Hướng dẫn đăng ký/đăng nhập
- Hướng dẫn sử dụng từng tính năng
- Step-by-step guides
- FAQ
- Troubleshooting

---

### 7. [Business Process Flows](./06-BUSINESS-PROCESS-FLOWS.md)
**Mục đích:** Mô tả quy trình nghiệp vụ chi tiết  
**Đối tượng:** Business Analysts, Process Owners

**Nội dung:**
- Flow từ giữ chỗ đến bán
- Queue processing logic
- Approval workflows
- Commission & payment request flow
- Status transitions

---

### 8. [System Architecture Overview](./07-SYSTEM-ARCHITECTURE-OVERVIEW.md)
**Mục đích:** Mô tả kiến trúc hệ thống  
**Đối tượng:** Technical Leads, Architects, DevOps

**Nội dung:**
- High-level architecture
- Technology stack
- Database architecture
- Security architecture
- Deployment architecture

---

### 9. [Glossary - Thuật ngữ](./08-GLOSSARY.md)
**Mục đích:** Thuật ngữ và định nghĩa  
**Đối tượng:** Tất cả stakeholders

**Nội dung:**
- A-Z glossary
- Business terms
- Technical terms
- Abbreviations

---

### 10. [Đề xuất PDF, Hợp đồng và Tài liệu](./09-PDF-AND-DOCUMENT-FEATURES.md)
**Mục đích:** Đề xuất các tính năng PDF, hợp đồng và tài liệu pháp lý  
**Đối tượng:** Product Owner, Business Analyst, Legal Team

**Nội dung:**
- Tổng quan hiện trạng PDF
- Đề xuất tính năng PDF mới
- Đề xuất hợp đồng và tài liệu pháp lý
- Quy trình và workflow
- Yêu cầu kỹ thuật
- Lộ trình triển khai (4 phases)

---

## 📊 SƠ ĐỒ & HÌNH ẢNH

Tất cả sơ đồ được tạo từ PlantUML và được lưu trong thư mục `diagrams/`.

**Để generate hình ảnh:**

```bash
cd ba-docs/diagrams
./generate-images.sh
```

Hoặc sử dụng PlantUML trực tiếp:
```bash
plantuml -tpng *.puml
```

Xem chi tiết trong [diagrams/README.md](./diagrams/README.md)

---

## 🎯 HƯỚNG DẪN SỬ DỤNG

### Cho Business Owners / Lãnh đạo:
👉 Đọc: **00-EXECUTIVE-SUMMARY.md**  
Để hiểu tổng quan về hệ thống, giá trị mang lại, và roadmap.

### Cho Business Analysts:
👉 Đọc: **01-BUSINESS-REQUIREMENTS-DOCUMENT.md** và **06-BUSINESS-PROCESS-FLOWS.md**  
Để hiểu chi tiết requirements và business processes.

### Cho Developers (Lập trình viên):
👉 Đọc: **02-USER-STORIES.md**, **03-DATA-DICTIONARY.md**, **04-API-DOCUMENTATION-SUMMARY.md**, **07-SYSTEM-ARCHITECTURE-OVERVIEW.md**  
Để hiểu yêu cầu kỹ thuật và chi tiết triển khai.

### Cho End Users (CTV, Admin):
👉 Đọc: **05-USER-GUIDE.md**  
Để học cách sử dụng hệ thống.

### Cho Tất cả:
👉 Tham khảo: **08-GLOSSARY.md**  
Khi gặp thuật ngữ không quen.

### Cho Product Owner / Legal Team:
👉 Đọc: **09-PDF-AND-DOCUMENT-FEATURES.md**  
Để xem đề xuất tính năng PDF, hợp đồng và tài liệu pháp lý.

---

## 📋 DOCUMENT STATUS

| Document | Status | Version | Last Updated |
|----------|--------|---------|--------------|
| Executive Summary | ✅ Complete | 1.0 | Jan 2025 |
| BRD | ✅ Complete | 1.0 | Jan 2025 |
| User Stories | ✅ Complete | 1.0 | Jan 2025 |
| Data Dictionary | ✅ Complete | 1.0 | Jan 2025 |
| API Summary | ✅ Complete | 1.0 | Jan 2025 |
| User Guide | ✅ Complete | 1.0 | Jan 2025 |
| Process Flows | ✅ Complete | 1.0 | Jan 2025 |
| Architecture | ✅ Complete | 1.0 | Jan 2025 |
| Glossary | ✅ Complete | 1.0 | Jan 2025 |
| PDF & Document Features | ✅ Complete | 1.0 | Jan 2025 |

---

## 📞 LIÊN HỆ

**Questions about Business Requirements:**
- Email: ba@winland.com

**Technical Questions:**
- Email: tech@winland.com

**General Inquiries:**
- Email: info@winland.com

---

## 📝 DOCUMENT CONTROL

**Document Owner:** Business Analyst Team  
**Review Cycle:** Monthly  
**Next Review:** February 2025

**Version History:**
- v1.0 (Jan 2025): Initial release

---

**© 2025 Winland. All rights reserved.**

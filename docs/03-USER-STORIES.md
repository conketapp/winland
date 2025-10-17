# User Stories & Use Cases

## 📋 Thông tin tài liệu

**Dự án:** Batdongsan Platform  
**Phiên bản:** 1.0  
**Ngày tạo:** October 2025

## Epic 1: Authentication & User Management

### US-001: Đăng ký tài khoản
**As a** Guest  
**I want to** tạo tài khoản mới  
**So that** tôi có thể sử dụng đầy đủ tính năng của hệ thống

**Acceptance Criteria:**
- [ ] Form đăng ký hiển thị với fields: email, password, full name, phone (optional)
- [ ] Validate email format và unique
- [ ] Validate password >= 6 ký tự
- [ ] Hiển thị error messages rõ ràng
- [ ] Sau khi đăng ký thành công, tự động login
- [ ] Redirect về trang trước đó hoặc dashboard

**Priority:** High  
**Story Points:** 3

---

### US-002: Đăng nhập
**As a** registered user  
**I want to** đăng nhập vào hệ thống  
**So that** tôi có thể truy cập các tính năng dành riêng cho user

**Acceptance Criteria:**
- [ ] Form login với email và password
- [ ] Remember me checkbox (optional)
- [ ] "Forgot password" link (future)
- [ ] Error message khi sai thông tin
- [ ] Redirect về trang trước đó
- [ ] Token được lưu vào localStorage

**Priority:** High  
**Story Points:** 2

---

### US-003: Xem profile
**As a** logged-in user  
**I want to** xem thông tin profile của mình  
**So that** tôi có thể kiểm tra và cập nhật thông tin

**Acceptance Criteria:**
- [ ] Hiển thị: avatar, full name, email, phone, role
- [ ] Hiển thị ngày tạo tài khoản
- [ ] Button "Edit Profile"

**Priority:** Medium  
**Story Points:** 1

---

### US-004: Cập nhật profile
**As a** logged-in user  
**I want to** cập nhật thông tin cá nhân  
**So that** thông tin của tôi luôn chính xác

**Acceptance Criteria:**
- [ ] Form edit với fields: full name, phone, avatar
- [ ] Validate input
- [ ] Upload avatar (future: image upload)
- [ ] Save button với loading state
- [ ] Success message sau khi save

**Priority:** Medium  
**Story Points:** 3

---

## Epic 2: Property Browsing (Client)

### US-101: Xem trang chủ
**As a** visitor  
**I want to** xem trang chủ với các bất động sản nổi bật  
**So that** tôi có cái nhìn tổng quan về platform

**Acceptance Criteria:**
- [ ] Hero section với search bar
- [ ] Featured properties section (6 items)
- [ ] Categories section
- [ ] Stats section
- [ ] Responsive trên mobile

**Priority:** High  
**Story Points:** 5

---

### US-102: Tìm kiếm bất động sản
**As a** user  
**I want to** tìm kiếm bất động sản theo từ khóa  
**So that** tôi có thể nhanh chóng tìm thấy những gì mình cần

**Acceptance Criteria:**
- [ ] Search bar prominent ở header
- [ ] Autocomplete suggestions (future)
- [ ] Search theo title, description, address
- [ ] Hiển thị số lượng kết quả
- [ ] Loading state khi search

**Priority:** High  
**Story Points:** 5

---

### US-103: Lọc bất động sản
**As a** user  
**I want to** lọc bất động sản theo nhiều tiêu chí  
**So that** tôi chỉ xem những bất động sản phù hợp với nhu cầu

**Acceptance Criteria:**
- [ ] Filter sidebar/panel:
  - [ ] Type (Bán/Cho thuê)
  - [ ] City, District (dropdown/select)
  - [ ] Price range (slider)
  - [ ] Area range (slider)
  - [ ] Bedrooms, Bathrooms (number)
  - [ ] Category (select)
  - [ ] Amenities (multi-select)
  - [ ] Direction (select)
- [ ] Apply filters button
- [ ] Clear all filters
- [ ] Show filter count badge
- [ ] Responsive: collapsible filters on mobile

**Priority:** High  
**Story Points:** 8

---

### US-104: Sắp xếp kết quả
**As a** user  
**I want to** sắp xếp kết quả tìm kiếm  
**So that** tôi xem được những bất động sản theo thứ tự mong muốn

**Acceptance Criteria:**
- [ ] Sort dropdown với options:
  - Mới nhất (default)
  - Giá: Cao → Thấp
  - Giá: Thấp → Cao
  - Diện tích: Lớn → Nhỏ
  - Diện tích: Nhỏ → Lớn
  - Xem nhiều nhất
- [ ] Sort được persist khi pagination

**Priority:** Medium  
**Story Points:** 2

---

### US-105: Xem danh sách bất động sản
**As a** user  
**I want to** xem danh sách bất động sản dưới dạng grid/list  
**So that** tôi có thể duyệt qua nhiều options

**Acceptance Criteria:**
- [ ] Grid view (default): 3 columns desktop, 2 tablet, 1 mobile
- [ ] List view (optional)
- [ ] Property card hiển thị:
  - Thumbnail image
  - Title
  - Price (formatted)
  - Area
  - Location (district, city)
  - Bedrooms, Bathrooms
  - Type badge (Bán/Cho thuê)
  - Featured badge (if featured)
- [ ] Hover effect
- [ ] Click vào card → property detail

**Priority:** High  
**Story Points:** 5

---

### US-106: Phân trang
**As a** user  
**I want to** navigate qua các trang kết quả  
**So that** tôi có thể xem tất cả bất động sản

**Acceptance Criteria:**
- [ ] Pagination component ở cuối list
- [ ] Show: Previous, Next, Page numbers
- [ ] Current page highlighted
- [ ] Show total pages, total results
- [ ] Items per page selector: 10, 20, 50
- [ ] URL reflect pagination (query params)

**Priority:** Medium  
**Story Points:** 3

---

### US-107: Xem chi tiết bất động sản
**As a** user  
**I want to** xem thông tin đầy đủ của 1 bất động sản  
**So that** tôi có thể quyết định có phù hợp không

**Acceptance Criteria:**
- [ ] Image gallery (carousel, lightbox)
- [ ] Property info:
  - Title, Description
  - Price (highlighted)
  - Area, Bedrooms, Bathrooms, Floors
  - Direction, Legal doc
  - Location (address, ward, district, city)
  - Type, Status
  - Category
  - Amenities (with icons)
- [ ] Map location (future: Google Maps)
- [ ] Agent info: name, phone, email
- [ ] Contact button
- [ ] Share button (future)
- [ ] Report button (future)
- [ ] View count
- [ ] Breadcrumb navigation
- [ ] Related properties section

**Priority:** High  
**Story Points:** 8

---

### US-108: Lưu yêu thích
**As a** logged-in user  
**I want to** lưu bất động sản vào danh sách yêu thích  
**So that** tôi có thể xem lại sau

**Acceptance Criteria:**
- [ ] Heart icon trên property card
- [ ] Heart icon trên property detail
- [ ] Toggle on/off
- [ ] Visual feedback (filled/unfilled heart)
- [ ] Toast notification "Đã thêm/xóa yêu thích"
- [ ] Require login (redirect to login nếu chưa login)

**Priority:** Medium  
**Story Points:** 3

---

### US-109: Xem danh sách yêu thích
**As a** logged-in user  
**I want to** xem tất cả bất động sản đã lưu  
**So that** tôi có thể quay lại xem hoặc so sánh

**Acceptance Criteria:**
- [ ] Favorites page `/favorites`
- [ ] Grid view similar to property list
- [ ] Remove from favorites button
- [ ] Empty state nếu chưa có yêu thích nào
- [ ] Sort by date added

**Priority:** Medium  
**Story Points:** 3

---

## Epic 3: Property Management (Agent/Admin)

### US-201: Đăng tin bất động sản
**As an** Agent  
**I want to** đăng tin bất động sản mới  
**So that** khách hàng có thể xem và liên hệ

**Acceptance Criteria:**
- [ ] Multi-step form:
  - **Step 1:** Basic info (title, description, type, category)
  - **Step 2:** Details (price, area, bedrooms, bathrooms, etc.)
  - **Step 3:** Location (city, district, ward, address)
  - **Step 4:** Images (upload multiple, drag & drop)
  - **Step 5:** Amenities (multi-select)
  - **Step 6:** Review & Submit
- [ ] Validation mỗi step
- [ ] Save as draft (future)
- [ ] Preview before submit
- [ ] Auto-generate slug từ title
- [ ] Success message + redirect to property detail

**Priority:** High  
**Story Points:** 13

---

### US-202: Quản lý tin đăng của mình
**As an** Agent  
**I want to** xem danh sách tin đăng của mình  
**So that** tôi có thể quản lý và cập nhật

**Acceptance Criteria:**
- [ ] "My Properties" page
- [ ] List/Grid view với các tin của mình
- [ ] Filter by status (AVAILABLE, SOLD, etc.)
- [ ] Sort by date, views
- [ ] Quick actions: Edit, Delete, View
- [ ] Pagination

**Priority:** High  
**Story Points:** 5

---

### US-203: Cập nhật tin đăng
**As an** Agent  
**I want to** cập nhật tin đã đăng  
**So that** thông tin luôn chính xác và cập nhật

**Acceptance Criteria:**
- [ ] Edit form tương tự Create form
- [ ] Pre-filled với data hiện tại
- [ ] Update images (add/remove)
- [ ] Update amenities
- [ ] Change status (AVAILABLE → SOLD/RENTED)
- [ ] Save button với loading state

**Priority:** High  
**Story Points:** 8

---

### US-204: Xóa tin đăng
**As an** Agent  
**I want to** xóa tin đã đăng  
**So that** tôi có thể dọn dẹp những tin không còn hiệu lực

**Acceptance Criteria:**
- [ ] Delete button trên property card/detail
- [ ] Confirmation dialog: "Bạn có chắc muốn xóa?"
- [ ] Soft delete hoặc hard delete
- [ ] Success message
- [ ] Remove from list sau khi xóa

**Priority:** Medium  
**Story Points:** 2

---

### US-205: Xem thống kê tin đăng
**As an** Agent  
**I want to** xem thống kê về tin đăng của mình  
**So that** tôi biết hiệu quả và điều chỉnh

**Acceptance Criteria:**
- [ ] Dashboard page hiển thị:
  - Total properties
  - Total views
  - Properties by status (chart)
  - Recent properties (table)
  - Top viewed properties
- [ ] Date range filter (future)

**Priority:** Medium  
**Story Points:** 5

---

## Epic 4: Admin Management

### US-301: Admin Dashboard
**As an** Admin  
**I want to** xem tổng quan hệ thống  
**So that** tôi nắm được tình hình

**Acceptance Criteria:**
- [ ] Stats cards:
  - Total properties
  - Total users
  - Total categories
  - Total views
- [ ] Charts:
  - Properties by type (pie chart)
  - Properties by status (bar chart)
  - Users by role (donut chart)
- [ ] Tables:
  - Recent properties
  - Recent users
  - Top viewed properties

**Priority:** High  
**Story Points:** 8

---

### US-302: Quản lý tất cả bất động sản
**As an** Admin  
**I want to** xem và quản lý tất cả bất động sản  
**So that** tôi kiểm soát nội dung trên platform

**Acceptance Criteria:**
- [ ] List all properties (không giới hạn user)
- [ ] Filter by: user, status, type, category
- [ ] Search by title, description
- [ ] Quick actions: View, Edit, Delete, Set Featured
- [ ] Bulk actions (future)

**Priority:** High  
**Story Points:** 5

---

### US-303: Duyệt tin đăng
**As an** Admin  
**I want to** duyệt tin mới đăng  
**So that** đảm bảo chất lượng nội dung

**Acceptance Criteria:**
- [ ] Pending properties queue
- [ ] Preview property detail
- [ ] Approve button → change status to AVAILABLE
- [ ] Reject button → notify agent (future)
- [ ] Bulk approve

**Priority:** Medium  
**Story Points:** 5

*(Note: Phase 1 không có moderation, tất cả tin tự động AVAILABLE)*

---

### US-304: Quản lý Categories
**As an** Admin  
**I want to** CRUD categories  
**So that** tôi có thể tổ chức bất động sản theo loại

**Acceptance Criteria:**
- [ ] List categories với order, icon
- [ ] Create new category form
- [ ] Edit category (inline hoặc modal)
- [ ] Delete category (với confirmation)
- [ ] Cannot delete category có properties
- [ ] Drag & drop reorder

**Priority:** High  
**Story Points:** 5

---

### US-305: Quản lý Amenities
**As an** Admin  
**I want to** CRUD amenities  
**So that** agent có thể chọn khi đăng tin

**Acceptance Criteria:**
- Similar to US-304 Categories

**Priority:** High  
**Story Points:** 5

---

### US-306: Quản lý Users
**As an** Admin  
**I want to** xem và quản lý users  
**So that** tôi kiểm soát ai có quyền gì

**Acceptance Criteria:**
- [ ] List users với filter by role
- [ ] Search by email, name
- [ ] View user detail (profile + statistics)
- [ ] Edit user (change role, activate/deactivate)
- [ ] Delete user
- [ ] Cannot delete own account

**Priority:** Medium  
**Story Points:** 5

---

## Epic 5: Additional Features (Future)

### US-401: Review & Rating
**As a** user  
**I want to** đánh giá và review bất động sản  
**So that** người khác có thêm thông tin

---

### US-402: Messaging/Chat
**As a** user  
**I want to** nhắn tin trực tiếp với agent  
**So that** tôi có thể hỏi thêm thông tin

---

### US-403: Notifications
**As a** user  
**I want to** nhận thông báo khi có bất động sản mới phù hợp  
**So that** tôi không bỏ lỡ cơ hội

---

### US-404: Advanced Analytics
**As an** Admin/Agent  
**I want to** xem báo cáo chi tiết  
**So that** tôi có insights để tối ưu

---

## Use Case Diagrams

### Use Case: Property Search & View

```
┌─────────────────────────────────────────────────┐
│              Property Search & View              │
├─────────────────────────────────────────────────┤
│                                                  │
│  Actor: User (Guest/Logged-in)                   │
│                                                  │
│  1. User truy cập trang danh sách bất động sản   │
│  2. User nhập từ khóa tìm kiếm (optional)        │
│  3. System hiển thị kết quả                      │
│  4. User apply filters                           │
│  5. System cập nhật kết quả                      │
│  6. User click vào 1 property                    │
│  7. System hiển thị chi tiết                     │
│  8. System tăng view count                       │
│  9. User xem thông tin, images, location         │
│  10. [Optional] User lưu yêu thích               │
│  11. [Optional] User liên hệ agent               │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Use Case: Agent Post Property

```
┌─────────────────────────────────────────────────┐
│              Agent Post Property                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  Actor: Agent                                    │
│                                                  │
│  Preconditions:                                  │
│  - Agent đã đăng nhập                            │
│  - Agent có role AGENT hoặc ADMIN                │
│                                                  │
│  Main Flow:                                      │
│  1. Agent click "Đăng tin"                       │
│  2. System hiển thị form multi-step              │
│  3. Agent điền thông tin cơ bản                  │
│  4. System validate & next step                  │
│  5. Agent điền thông tin chi tiết                │
│  6. Agent chọn location                          │
│  7. Agent upload images                          │
│  8. Agent chọn amenities                         │
│  9. Agent review thông tin                       │
│  10. Agent click "Đăng tin"                      │
│  11. System validate toàn bộ                     │
│  12. System save property                        │
│  13. System redirect to property detail          │
│  14. System hiển thị success message             │
│                                                  │
│  Alternative Flow:                               │
│  - Validation failed → hiển thị error, quay step │
│  - Agent cancel → confirm dialog → discard       │
│                                                  │
│  Postconditions:                                 │
│  - Property được tạo với status AVAILABLE        │
│  - Agent có thể thấy trong "My Properties"       │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Estimation Summary

| Epic | Total Story Points |
|------|-------------------|
| Authentication & User Management | 9 |
| Property Browsing (Client) | 42 |
| Property Management (Agent) | 33 |
| Admin Management | 33 |
| **Total MVP** | **117** |

**Team Velocity:** ~20 story points/sprint (estimate)  
**Estimated Sprints:** 6 sprints (12 weeks)

---

**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** October 2025


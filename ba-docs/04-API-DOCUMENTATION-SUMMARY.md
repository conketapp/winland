# API DOCUMENTATION SUMMARY
## Hệ thống Quản lý Bán Căn Hộ Dự Án - Winland

**Document ID:** API-WINLAND-001  
**Version:** 1.0  
**Date:** January 2025

---

## TABLE OF CONTENTS

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Endpoints by Module](#3-endpoints-by-module)
4. [Common Patterns](#4-common-patterns)
5. [Error Handling](#5-error-handling)

---

## 1. API OVERVIEW

### 1.1 Base URL

```
Production: https://api.winland.com/api
Development: http://localhost:3002/api
```

### 1.2 Authentication

**JWT Token-based:**
- Header: `Authorization: Bearer {token}`
- Token expires: 24 giờ
- Refresh: Re-login required

### 1.3 Response Format

**Success Response:**
```json
{
  "data": {...},
  "message": "Success",
  "statusCode": 200
}
```

**Paginated Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Bad Request"
}
```

---

## 2. AUTHENTICATION

### 2.1 CTV Registration

**POST** `/auth/register-ctv`

**Request:**
```json
{
  "phone": "0912345678",
  "otp": "123456",
  "fullName": "Nguyễn Văn A",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "phone": "0912345678",
    "fullName": "Nguyễn Văn A",
    "role": "CTV"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 2.2 CTV Login

**POST** `/auth/login-ctv`

**Request:**
```json
{
  "phone": "0912345678",
  "otp": "123456",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {...},
  "accessToken": "..."
}
```

---

### 2.3 Admin Login

**POST** `/auth/login-admin`

**Request:**
```json
{
  "email": "admin@winland.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {...},
  "accessToken": "..."
}
```

---

### 2.4 Send OTP

**POST** `/auth/send-otp`

**Request:**
```json
{
  "phone": "0912345678",
  "purpose": "REGISTER"
}
```

**Response:**
```json
{
  "message": "OTP đã được gửi",
  "expiresIn": 300
}
```

---

## 3. ENDPOINTS BY MODULE

### 3.1 Projects

#### List Projects
**GET** `/projects`

**Query Params:**
- `status`: `UPCOMING`, `OPEN`, `CLOSED`
- `city`: Tên thành phố
- `page`: Số trang
- `limit`: Số items/trang

**Response:**
```json
{
  "items": [
    {
      "id": "...",
      "name": "Vinhomes Grand Park",
      "code": "VGP",
      "status": "OPEN",
      "totalUnits": 500,
      "availableUnits": 350
    }
  ],
  "total": 10,
  "page": 1,
  "pageSize": 20
}
```

#### Get Project Detail
**GET** `/projects/:id`

**Response:**
```json
{
  "id": "...",
  "name": "Vinhomes Grand Park",
  "code": "VGP",
  "buildings": [...],
  "units": [...],
  "statistics": {
    "total": 500,
    "available": 350,
    "sold": 150
  }
}
```

#### Create Project
**POST** `/projects` (Admin only)

**Request:**
```json
{
  "name": "Vinhomes Grand Park",
  "code": "VGP",
  "developer": "Vinhomes",
  "location": "Quận 9, TP.HCM",
  "address": "123 Đường ABC",
  "commissionRate": 2.5,
  "openDate": "2025-03-01"
}
```

---

### 3.2 Units

#### List Units
**GET** `/units`

**Query Params:**
- `projectId`: Filter theo dự án
- `status`: `AVAILABLE`, `RESERVED_BOOKING`, `DEPOSITED`, `SOLD`
- `priceMin`, `priceMax`: Filter giá
- `areaMin`, `areaMax`: Filter diện tích
- `bedrooms`: Số phòng ngủ
- `page`, `limit`: Pagination

**Response:**
```json
{
  "items": [
    {
      "id": "...",
      "code": "A1-08-05",
      "price": 2500000000,
      "area": 75.5,
      "bedrooms": 2,
      "status": "AVAILABLE",
      "project": {
        "name": "Vinhomes Grand Park"
      }
    }
  ],
  "total": 500
}
```

#### Get Unit Detail
**GET** `/units/:id`

**Response:**
```json
{
  "id": "...",
  "code": "A1-08-05",
  "status": "AVAILABLE",
  "price": 2500000000,
  "reservations": [...],
  "bookings": [...],
  "deposits": [...]
}
```

#### Bulk Import Units
**POST** `/units/bulk-import` (Admin only)

**Request:** Form-data
- `projectId`: UUID
- `file`: Excel file

**Response:**
```json
{
  "success": 480,
  "failed": 20,
  "errors": [
    {
      "row": 5,
      "error": "Invalid price format"
    }
  ]
}
```

---

### 3.3 Reservations

#### Create Reservation
**POST** `/reservations` (CTV only)

**Request:**
```json
{
  "unitId": "...",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0912345678",
  "customerEmail": "customer@email.com",
  "notes": "..."
}
```

**Response:**
```json
{
  "id": "...",
  "code": "RSV-20250115-001",
  "status": "ACTIVE",
  "priority": 3,
  "unit": {...}
}
```

#### List My Reservations
**GET** `/reservations/my-reservations` (CTV only)

**Query Params:**
- `status`: Filter theo status
- `page`, `limit`: Pagination

#### Cancel Reservation
**POST** `/reservations/:id/cancel`

**Request:**
```json
{
  "reason": "Khách hàng không còn quan tâm"
}
```

---

### 3.4 Bookings

#### Create Booking
**POST** `/bookings` (CTV only)

**Request:**
```json
{
  "unitId": "...",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0912345678",
  "customerIdCard": "123456789012",
  "customerAddress": "123 Đường ABC",
  "paymentProof": ["url1", "url2"]
}
```

#### List Bookings
**GET** `/bookings`

**Query Params:**
- `status`: `PENDING_APPROVAL`, `CONFIRMED`, `CANCELLED`
- `ctvId`: Filter theo CTV (Admin only)
- `page`, `limit`: Pagination

#### Approve Booking
**POST** `/bookings/:id/approve` (Admin only)

**Request:**
```json
{
  "notes": "Đã kiểm tra chứng từ"
}
```

---

### 3.5 Deposits

#### Create Deposit
**POST** `/deposits` (CTV only)

**Request:**
```json
{
  "unitId": "...",
  "customerName": "Nguyễn Văn A",
  "customerPhone": "0912345678",
  "customerIdCard": "123456789012",
  "customerAddress": "123 Đường ABC",
  "depositAmount": 125000000,
  "depositPercentage": 5.0,
  "paymentProof": ["url1"]
}
```

#### List Deposits
**GET** `/deposits`

**Query Params:**
- `status`: Filter theo status
- `ctvId`: Filter theo CTV (Admin only)
- `page`, `limit`: Pagination

#### Approve Deposit
**POST** `/deposits/:id/approve` (Admin only)

**Response:**
```json
{
  "deposit": {...},
  "paymentSchedules": [
    {
      "installment": 1,
      "name": "Đợt 1 - Cọc",
      "amount": 125000000,
      "status": "PAID"
    },
    {
      "installment": 2,
      "name": "Đợt 2",
      "amount": 750000000,
      "dueDate": "2025-02-15",
      "status": "PENDING"
    }
  ]
}
```

---

### 3.6 Transactions

#### Create Transaction
**POST** `/transactions` (CTV only)

**Request:**
```json
{
  "depositId": "...",
  "paymentScheduleId": "...",
  "amount": 375000000,
  "paymentDate": "2025-01-15",
  "paymentMethod": "BANK_TRANSFER",
  "paymentProof": ["url1"],
  "transactionRef": "FT240115001"
}
```

#### List Transactions
**GET** `/transactions`

**Query Params:**
- `depositId`: Filter theo deposit
- `status`: `PENDING_CONFIRMATION`, `CONFIRMED`
- `page`, `limit`: Pagination

#### Confirm Transaction
**POST** `/transactions/:id/confirm` (Admin only)

**Request:**
```json
{
  "notes": "Đã kiểm tra chứng từ"
}
```

**Response:**
```json
{
  "transaction": {...},
  "deposit": {
    "status": "COMPLETED"
  },
  "unit": {
    "status": "SOLD"
  },
  "commission": {
    "id": "...",
    "amount": 50000000
  }
}
```

---

### 3.7 Commissions

#### List My Commissions
**GET** `/commissions/my-commissions` (CTV only)

**Query Params:**
- `status`: `PENDING`, `APPROVED`, `PAID`
- `page`, `limit`: Pagination

**Response:**
```json
{
  "items": [
    {
      "id": "...",
      "amount": 50000000,
      "rate": 2.0,
      "status": "PENDING",
      "unit": {
        "code": "A1-08-05"
      },
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "total": 25
}
```

#### Get My Commission Summary
**GET** `/commissions/my-summary` (CTV only)

**Response:**
```json
{
  "totalEarned": 125000000,
  "pending": 50000000,
  "approved": 50000000,
  "paid": 25000000,
  "count": {
    "total": 5,
    "pending": 2,
    "approved": 2,
    "paid": 1
  }
}
```

#### List All Commissions (Admin)
**GET** `/commissions` (Admin only)

**Query Params:**
- `ctvId`: Filter theo CTV
- `status`: Filter theo status
- `page`, `limit`: Pagination

---

### 3.8 Payment Requests

#### Create Payment Request
**POST** `/payment-requests` (CTV only)

**Request:**
```json
{
  "commissionId": "...",
  "amount": 50000000,
  "bankName": "Vietcombank",
  "bankAccount": "1234567890",
  "bankAccountName": "NGUYEN VAN A"
}
```

#### List Payment Requests
**GET** `/payment-requests`

**Query Params:**
- `status`: `PENDING`, `APPROVED`, `REJECTED`, `PAID`
- `ctvId`: Filter theo CTV (Admin only)
- `page`, `limit`: Pagination

#### Approve Payment Request
**POST** `/payment-requests/:id/approve` (Admin only)

**Request:**
```json
{
  "notes": "Đã kiểm tra và duyệt"
}
```

#### Mark as Paid
**POST** `/payment-requests/:id/mark-paid` (Admin only)

**Request:**
```json
{
  "paidProof": "Link chứng từ thanh toán"
}
```

---

### 3.9 Users

#### List Users
**GET** `/users` (Admin only)

**Query Params:**
- `role`: `CTV`, `ADMIN`, `SUPER_ADMIN`
- `status`: `active`, `inactive`
- `page`, `limit`: Pagination

#### Search Users
**GET** `/users/search` (Admin only)

**Query Params:**
- `q`: Search query (name, email, phone)
- `role`: Filter theo role
- `status`: Filter theo status

**Response:**
```json
[
  {
    "id": "...",
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678",
    "role": "CTV",
    "totalDeals": 25
  }
]
```

#### Activate/Deactivate User
**PATCH** `/users/:id/activate` (Admin only)  
**PATCH** `/users/:id/deactivate` (Admin only)

#### Sync User Total Deals
**PATCH** `/users/:id/sync-total-deals` (Admin only)

---

## 4. COMMON PATTERNS

### 4.1 Pagination

Tất cả list endpoints hỗ trợ pagination:

**Query Params:**
- `page`: Số trang (default: 1)
- `limit`: Số items/trang (default: 20, max: 100)

**Response:**
```json
{
  "items": [...],
  "total": 500,
  "page": 1,
  "pageSize": 20,
  "totalPages": 25,
  "hasNext": true,
  "hasPrev": false
}
```

### 4.2 Filtering

Hầu hết endpoints hỗ trợ filtering qua query params:

**Example:**
```
GET /units?projectId=xxx&status=AVAILABLE&priceMin=2000000000&priceMax=3000000000
```

### 4.3 Sorting

Sorting qua query params:
- `sortBy`: Field để sort
- `sortOrder`: `asc` hoặc `desc`

**Example:**
```
GET /units?sortBy=price&sortOrder=asc
```

---

## 5. ERROR HANDLING

### 5.1 HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request thành công |
| 201 | Created | POST tạo mới thành công |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Chưa login hoặc token hết hạn |
| 403 | Forbidden | Không có quyền |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Duplicate data |
| 500 | Internal Server Error | Server error |

### 5.2 Error Response Format

```json
{
  "statusCode": 400,
  "message": "Căn hộ không tồn tại",
  "error": "Bad Request"
}
```

### 5.3 Common Error Messages

| Error Code | Message | Meaning |
|------------|---------|---------|
| `UNIT.NOT_FOUND` | "Căn hộ không tồn tại" | Unit ID không hợp lệ |
| `DEPOSIT.ALREADY_EXISTS` | "Căn hộ đã có phiếu đặt cọc đang hoạt động" | Unit đã có deposit active |
| `COMMISSION.NOT_FOUND` | "Hoa hồng không tồn tại" | Commission ID không hợp lệ |
| `FORBIDDEN` | "Bạn không có quyền truy cập" | User không có quyền |
| `UNAUTHORIZED` | "Bạn chưa đăng nhập" | Token không hợp lệ |

---

## 6. RATE LIMITING

- **Default:** 100 requests/phút/IP
- **Auth endpoints:** 10 requests/phút/IP
- **Heavy operations:** 20 requests/phút/user

---

## 7. WEBHOOKS & NOTIFICATIONS

### 7.1 Real-time Notifications

Hệ thống gửi notifications tự động khi:
- Booking được approve
- Deposit được approve
- Transaction được confirm
- Commission được tạo
- Payment request được approve/paid

**Notification Format:**
```json
{
  "id": "...",
  "type": "COMMISSION_CREATED",
  "title": "Ghi nhận hoa hồng mới",
  "message": "Bạn vừa được ghi nhận hoa hồng mới cho căn A1-08-05.",
  "entityType": "COMMISSION",
  "entityId": "...",
  "metadata": {
    "amount": 50000000,
    "unitCode": "A1-08-05"
  },
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

## APPENDIX

### A. API Endpoints Summary

**Authentication:**
- `POST /auth/register-ctv`
- `POST /auth/login-ctv`
- `POST /auth/login-admin`
- `POST /auth/send-otp`
- `POST /auth/verify-otp`

**Projects:**
- `GET /projects`
- `GET /projects/:id`
- `POST /projects`
- `PATCH /projects/:id`
- `DELETE /projects/:id`

**Units:**
- `GET /units`
- `GET /units/:id`
- `POST /units`
- `POST /units/bulk-import`
- `PATCH /units/:id`
- `DELETE /units/:id`

**Reservations:**
- `POST /reservations`
- `GET /reservations/my-reservations`
- `POST /reservations/:id/cancel`

**Bookings:**
- `POST /bookings`
- `GET /bookings`
- `GET /bookings/:id`
- `POST /bookings/:id/approve`
- `POST /bookings/:id/reject`

**Deposits:**
- `POST /deposits`
- `GET /deposits`
- `GET /deposits/:id`
- `POST /deposits/:id/approve`
- `POST /deposits/:id/reject`

**Transactions:**
- `POST /transactions`
- `GET /transactions`
- `POST /transactions/:id/confirm`
- `POST /transactions/:id/reject`

**Commissions:**
- `GET /commissions`
- `GET /commissions/my-commissions`
- `GET /commissions/my-summary`
- `GET /commissions/:id`
- `PATCH /commissions/:id/recalculate`

**Payment Requests:**
- `POST /payment-requests`
- `GET /payment-requests`
- `GET /payment-requests/my-summary`
- `POST /payment-requests/:id/approve`
- `POST /payment-requests/:id/reject`
- `POST /payment-requests/:id/mark-paid`

**Users:**
- `GET /users`
- `GET /users/search`
- `GET /users/:id`
- `PATCH /users/:id/activate`
- `PATCH /users/:id/deactivate`
- `PATCH /users/:id/sync-total-deals`

---

**Document End**

**For detailed API documentation, see:** Technical API Documentation

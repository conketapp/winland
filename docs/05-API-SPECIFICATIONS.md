# API Specifications

## 📋 Thông tin tài liệu

**Dự án:** Batdongsan Platform  
**API Version:** v1  
**Base URL:** `http://localhost:3001/api`  
**Authentication:** JWT Bearer Token

## 1. API Overview

### 1.1 Base Information
- **Protocol:** HTTP/HTTPS
- **Format:** JSON
- **Authentication:** JWT Token in Authorization header
- **Rate Limiting:** 100 requests/minute (future)

### 1.2 Common Headers
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

### 1.3 Standard Response Format

**Success Response:**
```json
{
  "data": { /* response data */ },
  "message": "Success message (optional)"
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "message": "Error message" | ["Error 1", "Error 2"],
  "error": "Bad Request"
}
```

### 1.4 HTTP Status Codes
- `200` OK - Request successful
- `201` Created - Resource created
- `400` Bad Request - Validation error
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `409` Conflict - Duplicate resource
- `500` Internal Server Error - Server error

---

## 2. Authentication Endpoints

### POST /api/auth/register

Đăng ký tài khoản mới

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyen Van A",
  "phone": "0912345678" // optional
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyen Van A",
    "phone": "0912345678",
    "role": "USER",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

---

### POST /api/auth/login

Đăng nhập

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):** Same as register

**Errors:**
- `401` - Invalid credentials

---

## 3. User Endpoints

### GET /api/users/me

Xem profile của user hiện tại

**Authentication:** Required

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "fullName": "Nguyen Van A",
  "phone": "0912345678",
  "avatar": "https://...",
  "role": "USER",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

---

### PATCH /api/users/me

Cập nhật profile

**Authentication:** Required

**Request Body:**
```json
{
  "fullName": "New Name",
  "phone": "0987654321",
  "avatar": "https://..."
}
```

**Response (200):** Updated user object

---

## 4. Property Endpoints

### GET /api/properties

Lấy danh sách bất động sản

**Authentication:** Optional

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10, max: 100)
- `type` (SALE | RENT)
- `status` (AVAILABLE | PENDING | SOLD | RENTED)
- `city` (string)
- `district` (string)
- `categoryId` (uuid)
- `priceMin` (number)
- `priceMax` (number)
- `areaMin` (number)
- `areaMax` (number)
- `bedrooms` (number)
- `bathrooms` (number)
- `sortBy` (createdAt | price | area | views)
- `sortOrder` (ASC | DESC, default: DESC)

**Example:**
```
GET /api/properties?page=1&limit=10&type=SALE&city=Hà Nội&priceMin=2000000000&priceMax=5000000000
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Căn hộ 2PN tại Cầu Giấy",
      "description": "Mô tả...",
      "slug": "can-ho-2pn-tai-cau-giay",
      "type": "SALE",
      "status": "AVAILABLE",
      "price": 2500000000,
      "area": 75,
      "address": "123 Đường ABC",
      "ward": "Dịch Vọng",
      "district": "Cầu Giấy",
      "city": "Hà Nội",
      "bedrooms": 2,
      "bathrooms": 2,
      "featured": false,
      "views": 100,
      "createdAt": "2025-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "fullName": "Agent Name",
        "phone": "0912345678"
      },
      "category": {
        "id": "uuid",
        "name": "Căn hộ/Chung cư"
      },
      "images": [
        {
          "id": "uuid",
          "url": "https://...",
          "caption": "Phòng khách",
          "order": 0
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### GET /api/properties/:id

Xem chi tiết bất động sản

**Authentication:** Optional

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Căn hộ 2PN tại Cầu Giấy",
  "description": "Mô tả chi tiết...",
  "slug": "can-ho-2pn-tai-cau-giay",
  "type": "SALE",
  "status": "AVAILABLE",
  "price": 2500000000,
  "area": 75,
  "address": "123 Đường ABC",
  "ward": "Dịch Vọng",
  "district": "Cầu Giấy",
  "city": "Hà Nội",
  "latitude": 21.028,
  "longitude": 105.804,
  "bedrooms": 2,
  "bathrooms": 2,
  "floors": 1,
  "direction": "Đông Nam",
  "legalDoc": "Sổ đỏ",
  "featured": false,
  "views": 101,
  "userId": "uuid",
  "categoryId": "uuid",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "user": {
    "id": "uuid",
    "fullName": "Agent Name",
    "email": "agent@example.com",
    "phone": "0912345678"
  },
  "category": {
    "id": "uuid",
    "name": "Căn hộ/Chung cư",
    "slug": "can-ho-chung-cu"
  },
  "images": [
    {
      "id": "uuid",
      "url": "https://...",
      "caption": "Phòng khách",
      "order": 0
    }
  ],
  "amenities": [
    {
      "propertyId": "uuid",
      "amenityId": "uuid",
      "amenity": {
        "id": "uuid",
        "name": "Điều hòa",
        "slug": "dieu-hoa",
        "icon": "snowflake"
      }
    }
  ]
}
```

**Side Effect:** Views counter +1

**Errors:**
- `404` - Property not found

---

### POST /api/properties

Tạo bất động sản mới

**Authentication:** Required (AGENT or ADMIN)

**Request Body:**
```json
{
  "title": "Căn hộ 2PN tại Cầu Giấy",
  "description": "Mô tả chi tiết...",
  "slug": "can-ho-2pn-tai-cau-giay",
  "type": "SALE",
  "status": "AVAILABLE",
  "price": 2500000000,
  "area": 75,
  "address": "123 Đường ABC",
  "ward": "Dịch Vọng",
  "district": "Cầu Giấy",
  "city": "Hà Nội",
  "latitude": 21.028,
  "longitude": 105.804,
  "bedrooms": 2,
  "bathrooms": 2,
  "floors": 1,
  "direction": "Đông Nam",
  "legalDoc": "Sổ đỏ",
  "categoryId": "uuid",
  "images": [
    {
      "url": "https://...",
      "caption": "Phòng khách"
    }
  ],
  "amenityIds": ["uuid1", "uuid2"]
}
```

**Response (201):** Created property object

**Errors:**
- `400` - Validation error
- `401` - Authentication required
- `403` - Insufficient permissions

---

### PATCH /api/properties/:id

Cập nhật bất động sản

**Authentication:** Required (Owner or ADMIN)

**Request Body:** Partial property object

**Response (200):** Updated property object

---

### DELETE /api/properties/:id

Xóa bất động sản

**Authentication:** Required (Owner or ADMIN)

**Response (200):**
```json
{
  "message": "Property deleted successfully"
}
```

---

## 5. Category Endpoints

### GET /api/categories

Lấy danh sách categories

**Authentication:** Optional

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Căn hộ/Chung cư",
    "slug": "can-ho-chung-cu",
    "description": "...",
    "icon": "building",
    "order": 1,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

---

### POST /api/categories

Tạo category mới

**Authentication:** Required (ADMIN only)

**Request Body:**
```json
{
  "name": "Văn phòng",
  "slug": "van-phong",
  "description": "...",
  "icon": "briefcase",
  "order": 3
}
```

**Response (201):** Created category object

---

### GET /api/categories/:id
### PATCH /api/categories/:id
### DELETE /api/categories/:id

Similar patterns as above

---

## 6. Amenity Endpoints

Similar structure to Categories:
- `GET /api/amenities`
- `POST /api/amenities` (ADMIN)
- `GET /api/amenities/:id`
- `PATCH /api/amenities/:id` (ADMIN)
- `DELETE /api/amenities/:id` (ADMIN)

---

## 7. Favorite Endpoints

### POST /api/favorites

Thêm yêu thích

**Authentication:** Required

**Request Body:**
```json
{
  "propertyId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "propertyId": "uuid",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### GET /api/favorites

Xem danh sách yêu thích

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "property": { /* full property object */ },
    "createdAt": "2025-01-01T00:00:00Z"
  }
]
```

---

### DELETE /api/favorites/:id

Xóa yêu thích

**Authentication:** Required

---

## 8. Admin Endpoints (Future)

### GET /api/admin/dashboard

Dashboard statistics

**Authentication:** Required (ADMIN)

**Response (200):**
```json
{
  "totalProperties": 1000,
  "totalUsers": 500,
  "totalCategories": 10,
  "totalViews": 50000,
  "propertiesByType": {
    "SALE": 600,
    "RENT": 400
  },
  "propertiesByStatus": {
    "AVAILABLE": 800,
    "SOLD": 150,
    "RENTED": 50
  },
  "recentProperties": [/* ... */],
  "topViewedProperties": [/* ... */]
}
```

---

## 9. Error Examples

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": [
    "email must be a valid email",
    "password must be at least 6 characters"
  ],
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Forbidden (403)
```json
{
  "statusCode": 403,
  "message": "You do not have permission to access this resource",
  "error": "Forbidden"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Property not found",
  "error": "Not Found"
}
```

---

## 10. API Testing

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Get Properties:**
```bash
curl -X GET "http://localhost:3001/api/properties?page=1&limit=10&type=SALE&city=Hà Nội"
```

**Create Property (with auth):**
```bash
curl -X POST http://localhost:3001/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Test Property",
    "description": "Description...",
    "slug": "test-property-123",
    "type": "SALE",
    "price": 2500000000,
    "area": 75,
    "address": "123 Test St",
    "ward": "Test Ward",
    "district": "Test District",
    "city": "Hà Nội",
    "categoryId": "<category-uuid>"
  }'
```

---

## 9. Assignment Endpoints

### POST /api/assignments

Admin gán property cho CTV

**Authentication:** Required (ADMIN, SUPER_ADMIN)

**Request Body:**
```json
{
  "propertyId": "uuid",
  "ctvId": "uuid",
  "notes": "Căn này phù hợp với khu vực của bạn"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "ctvId": "uuid",
  "assignedBy": "admin-uuid",
  "status": "ACTIVE",
  "assignedAt": "2025-10-20T10:00:00Z",
  "notes": "...",
  "createdAt": "2025-10-20T10:00:00Z"
}
```

---

### GET /api/assignments/my-assignments

CTV xem assignments của mình

**Authentication:** Required (CTV)

**Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "ACTIVE",
    "assignedAt": "2025-10-20T10:00:00Z",
    "property": {
      "id": "uuid",
      "title": "Căn hộ 2PN...",
      "price": 2500000000,
      "commissionRate": 2.0,
      "address": "...",
      "images": [...]
    }
  }
]
```

---

### GET /api/assignments/available-properties

CTV xem properties có thể đăng ký nhận

**Authentication:** Required (CTV)

**Response (200):** Array of properties chưa được assign hoặc chưa hold

---

### POST /api/assignments/register

CTV đăng ký nhận property

**Authentication:** Required (CTV)

**Request Body:**
```json
{
  "propertyId": "uuid"
}
```

---

## 10. Lead Endpoints

### POST /api/leads

Tạo lead mới

**Authentication:** Required (CTV)

**Request Body:**
```json
{
  "propertyId": "uuid",
  "customerName": "Nguyen Van A",
  "customerPhone": "0912345678",
  "customerEmail": "customer@example.com",
  "source": "WEBSITE_FORM",
  "notes": "Khách muốn xem vào cuối tuần"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "ctvId": "uuid",
  "customerName": "Nguyen Van A",
  "customerPhone": "0912345678",
  "customerEmail": "customer@example.com",
  "status": "NEW",
  "source": "WEBSITE_FORM",
  "notes": "...",
  "createdAt": "2025-10-20T10:00:00Z"
}
```

---

### GET /api/leads/my-leads

CTV xem leads của mình

**Authentication:** Required (CTV)

**Query:** `?status=NEW&page=1&limit=10`

**Response (200):** Paginated leads with property info

---

### PATCH /api/leads/:id

Cập nhật lead status

**Authentication:** Required (CTV own lead, ADMIN all)

**Request Body:**
```json
{
  "status": "CONTACTED",
  "notes": "Đã gọi điện, khách hẹn xem thứ 7"
}
```

---

### POST /api/leads/:id/close

CTV đánh dấu lead closed (chờ admin confirm)

**Authentication:** Required (CTV)

**Request Body:**
```json
{
  "notes": "Khách đã đồng ý mua, chờ ký hợp đồng"
}
```

---

### POST /api/leads/:id/confirm

Admin xác nhận deal closed

**Authentication:** Required (ADMIN, SUPER_ADMIN)

**Response:** Auto creates Commission record

---

## 11. Commission Endpoints

### GET /api/commissions/my-commissions

CTV xem commissions của mình

**Authentication:** Required (CTV)

**Query:** `?status=PENDING&page=1`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 50000000,
      "status": "PENDING",
      "property": {
        "title": "Căn hộ ABC",
        "price": 2500000000
      },
      "lead": {
        "customerName": "Nguyen Van A"
      },
      "createdAt": "2025-10-20T10:00:00Z"
    }
  ],
  "meta": { "total": 10, "pending": 5, "paid": 5 }
}
```

---

### GET /api/commissions/summary

CTV xem tổng hợp commission

**Response (200):**
```json
{
  "totalEarned": 150000000,
  "pending": 50000000,
  "paid": 100000000,
  "count": {
    "total": 10,
    "pending": 3,
    "paid": 7
  }
}
```

---

## 12. Payment Request Endpoints

### POST /api/payment-requests

CTV tạo yêu cầu thanh toán

**Authentication:** Required (CTV)

**Request Body:**
```json
{
  "commissionId": "uuid",
  "amount": 50000000
}
```

**Response (201):** Payment request object

---

### GET /api/payment-requests/my-requests

CTV xem payment requests của mình

---

### POST /api/payment-requests/:id/approve

Admin duyệt payment request

**Authentication:** Required (ADMIN, SUPER_ADMIN)

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Side Effect:** Commission.status = APPROVED

---

### POST /api/payment-requests/:id/reject

Admin từ chối payment request

**Request Body:**
```json
{
  "reason": "Thiếu chứng từ giao dịch"
}
```

---

## 13. Property Hold Endpoints

### POST /api/property-holds

CTV giữ căn (manual button)

**Authentication:** Required (CTV)

**Request Body:**
```json
{
  "propertyId": "uuid",
  "reason": "Khách đang đàm phán, hẹn ký HĐ thứ 7"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "propertyId": "uuid",
  "ctvId": "uuid",
  "status": "ACTIVE",
  "holdUntil": "2025-10-22T15:30:00Z",
  "reason": "Khách đang đàm phán...",
  "extendCount": 0,
  "createdAt": "2025-10-20T15:30:00Z"
}
```

**Errors:**
- `409` - Property đang bị hold bởi CTV khác
- `403` - CTV chưa có assignment
- `400` - Property không còn available

---

### GET /api/property-holds/check/:propertyId

Check if property đang bị hold

**Authentication:** Optional

**Response (200):**
```json
{
  "isHeld": true,
  "holdBy": {
    "id": "uuid",
    "fullName": "CTV Nguyen Van A"
  },
  "holdUntil": "2025-10-22T15:30:00Z",
  "canIHold": false,
  "myActiveHold": null
}
```

---

### GET /api/property-holds/my-holds

CTV xem holds của mình

**Authentication:** Required (CTV)

**Query:** `?status=ACTIVE`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "status": "ACTIVE",
    "holdUntil": "2025-10-22T15:30:00Z",
    "extendCount": 1,
    "property": {
      "title": "Căn hộ ABC",
      "price": 2500000000
    },
    "timeRemaining": "23 giờ 15 phút"
  }
]
```

---

### POST /api/property-holds/:id/extend

Gia hạn hold

**Authentication:** Required (CTV own hold, ADMIN all)

**Response (200):** Updated hold object

**Errors:**
- `403` - Đã hết lượt gia hạn
- `400` - Chưa đến thời điểm được gia hạn

---

### POST /api/property-holds/:id/cancel

Hủy hold

**Authentication:** Required (CTV own hold)

**Response (200):** Success message

---

### [Admin] POST /api/admin/property-holds/:id/cancel

Admin hủy hold của CTV

**Request Body:**
```json
{
  "reason": "CTV vi phạm quy định"
}
```

---

## 14. System Config Endpoints

### GET /api/system-configs

Lấy tất cả configs

**Authentication:** Required (CTV xem, ADMIN edit)

**Query:** `?category=hold`

**Response (200):**
```json
[
  {
    "key": "hold_duration_hours",
    "value": "48",
    "type": "number",
    "label": "Thời gian giữ căn mặc định (giờ)",
    "category": "hold"
  }
]
```

---

### PATCH /api/system-configs/:key

Admin cập nhật config

**Authentication:** Required (ADMIN, SUPER_ADMIN)

**Request Body:**
```json
{
  "value": "72"
}
```

---

## 15. Postman Collection

Import this JSON into Postman for quick testing:

```json
{
  "info": {
    "name": "Batdongsan API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\",\n  \"fullName\": \"Test User\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login"
          }
        }
      ]
    }
  ]
}
```

---

**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** October 2025


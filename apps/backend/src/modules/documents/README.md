# Documents Management Module

Module quản lý tài liệu đính kèm cho hệ thống Winland.

## 📋 Tính Năng

### 1. Upload Tài Liệu

**Các loại tài liệu được hỗ trợ:**
- `CMND_FRONT` - CMND/CCCD mặt trước
- `CMND_BACK` - CMND/CCCD mặt sau
- `PASSPORT` - Hộ chiếu
- `MARRIAGE_CERT` - Giấy chứng nhận đăng ký kết hôn
- `AUTHORIZATION` - Giấy ủy quyền
- `CONTRACT_SIGNED` - Bản sao hợp đồng đã ký (scan)
- `PAYMENT_PROOF` - Chứng từ thanh toán
- `HANDOVER_REPORT` - Biên bản nghiệm thu
- `UNIT_IMAGE` - Ảnh căn hộ
- `OTHER` - Khác

### 2. Entity Types

Tài liệu có thể được đính kèm với:
- `deposit` - Hợp đồng đặt cọc
- `booking` - Phiếu đặt chỗ
- `reservation` - Phiếu giữ chỗ
- `unit` - Căn hộ
- `transaction` - Giao dịch
- `user` - Người dùng

### 3. Version Management

- Mỗi document có version number
- Có thể xem tất cả versions của cùng một document type
- Status: `DRAFT`, `FINAL`, `ARCHIVED`

### 4. File Validation

- **File types:** JPEG, PNG, WebP, PDF
- **Max size:** 10MB per file (configurable)
- **MIME type validation**
- **Virus scan:** (planned)

---

## 🚀 API Endpoints

### Base URL: `/api/documents`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/` | Upload single file và tạo document |
| POST | `/bulk` | Upload multiple files (max 10) |
| GET | `/` | Get all documents với filters |
| GET | `/entity/:entityType/:entityId` | Get documents by entity |
| GET | `/:id` | Get document by ID |
| GET | `/:entityType/:entityId/:documentType/versions` | Get document versions |
| PUT | `/:id` | Update document |
| DELETE | `/:id` | Delete document (soft delete) |

---

## 📝 Usage Examples

### 1. Upload Single Document

```bash
POST /api/documents
Content-Type: multipart/form-data

{
  "entityType": "deposit",
  "entityId": "uuid-here",
  "documentType": "CMND_FRONT",
  "description": "CMND mặt trước của khách hàng",
  "file": <file>
}
```

**Response:**
```json
{
  "document": {
    "id": "uuid",
    "entityType": "deposit",
    "entityId": "uuid",
    "documentType": "CMND_FRONT",
    "fileName": "cmnd_front_1234567890_abc123.jpg",
    "fileUrl": "/storage/uploads/deposit/cmnd_front_1234567890_abc123.jpg",
    "fileSize": "245678",
    "mimeType": "image/jpeg",
    "version": 1,
    "status": "DRAFT",
    "uploadedBy": "user-uuid",
    "uploadedAt": "2025-12-21T...",
    "uploader": {
      "id": "user-uuid",
      "fullName": "CTV Name",
      "email": "ctv@example.com"
    }
  },
  "message": "Document uploaded successfully"
}
```

### 2. Upload Multiple Documents

```bash
POST /api/documents/bulk
Content-Type: multipart/form-data

{
  "entityType": "deposit",
  "entityId": "uuid-here",
  "documentType": "PAYMENT_PROOF",
  "description": "Chứng từ thanh toán",
  "files": [<file1>, <file2>, <file3>]
}
```

### 3. Get Documents by Entity

```bash
GET /api/documents/entity/deposit/uuid-here
```

**Response:**
```json
{
  "documents": [
    {
      "id": "uuid",
      "documentType": "CMND_FRONT",
      "fileName": "...",
      "fileUrl": "...",
      "status": "FINAL",
      ...
    },
    {
      "id": "uuid",
      "documentType": "PAYMENT_PROOF",
      "fileName": "...",
      "fileUrl": "...",
      "status": "DRAFT",
      ...
    }
  ],
  "count": 2
}
```

### 4. Get Document Versions

```bash
GET /api/documents/deposit/uuid-here/CMND_FRONT/versions
```

**Response:**
```json
{
  "versions": [
    {
      "id": "uuid-v2",
      "version": 2,
      "status": "FINAL",
      "uploadedAt": "2025-12-21T...",
      ...
    },
    {
      "id": "uuid-v1",
      "version": 1,
      "status": "ARCHIVED",
      "uploadedAt": "2025-12-20T...",
      ...
    }
  ],
  "count": 2
}
```

### 5. Update Document Status

```bash
PUT /api/documents/uuid-here
Content-Type: application/json

{
  "status": "FINAL",
  "description": "Updated description"
}
```

### 6. Delete Document

```bash
DELETE /api/documents/uuid-here
```

---

## 🔒 Access Control

- **Authentication:** Tất cả endpoints yêu cầu JWT token
- **Authorization:**
  - CTV chỉ có thể upload/update/delete documents cho entities của mình
  - Admin có thể xem tất cả documents
  - Users chỉ xem được documents của entities họ có quyền truy cập

---

## 📁 File Storage

### Local Storage (Development)

```
storage/
└── uploads/
    ├── deposit/
    │   ├── cmnd_front_1234567890_abc123.jpg
    │   └── payment_proof_1234567890_def456.pdf
    ├── booking/
    ├── reservation/
    ├── unit/
    ├── transaction/
    └── user/
```

### Cloud Storage (Production - Planned)

- AWS S3
- Google Cloud Storage
- Azure Blob Storage

---

## ⚙️ Configuration

### Environment Variables

```env
# Upload Directory
UPLOAD_DIR=./storage/uploads

# Upload Base URL (for public access)
UPLOAD_BASE_URL=https://api.example.com/uploads

# Max File Size (bytes, default 10MB)
MAX_FILE_SIZE=10485760
```

---

## 🗄️ Database Schema

```prisma
model Document {
  id            String         @id @default(uuid())
  entityType    String         // 'deposit', 'booking', etc.
  entityId      String         // ID của entity
  documentType  DocumentType   // 'CMND_FRONT', 'PAYMENT_PROOF', etc.
  fileName      String
  fileUrl       String
  fileSize      BigInt
  mimeType      String
  version       Int            @default(1)
  status        DocumentStatus @default(DRAFT)
  description   String?
  uploadedBy    String
  uploadedAt    DateTime       @default(now())
  metadata      Json?
  deletedAt     DateTime?      // Soft delete
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  
  uploader      User           @relation("DocumentUploader")
}
```

---

## 🔧 Integration

### With Deposits

```typescript
// Upload CMND khi tạo deposit
const documents = await documentsService.createMultiple(
  'deposit',
  depositId,
  'CMND_FRONT',
  [cmndFrontFile, cmndBackFile],
  userId,
);

// Get all documents của deposit
const allDocs = await documentsService.findByEntity('deposit', depositId);
```

### With Bookings

```typescript
// Upload payment proof
const paymentProof = await documentsService.createMultiple(
  'booking',
  bookingId,
  'PAYMENT_PROOF',
  [proofFile1, proofFile2],
  userId,
);
```

---

## 🚧 Future Enhancements

1. **Cloud Storage Integration**
   - AWS S3 adapter
   - Google Cloud Storage adapter
   - Signed URLs với expiration

2. **Advanced Features**
   - OCR để extract text từ CMND
   - Virus scanning
   - Image optimization
   - Thumbnail generation

3. **Version Management**
   - Diff view giữa versions
   - Restore version cũ
   - Version comparison

4. **Access Control**
   - Role-based permissions
   - Share documents với specific users
   - Public/private documents

---

## 📚 Related Modules

- **PDF Module:** Generate PDF contracts
- **Deposits Module:** Deposit management
- **Bookings Module:** Booking management
- **Units Module:** Unit management

---

**Last Updated:** December 21, 2025

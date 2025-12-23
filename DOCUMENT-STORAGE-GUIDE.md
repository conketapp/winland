# 📄 Hướng Dẫn Quản Lý Tài Liệu Hợp Đồng

**Date:** December 21, 2025  
**Status:** Current Implementation Guide

---

## 📊 Tổng Quan

Tài liệu hợp đồng và các file liên quan được quản lý qua nhiều cách khác nhau tùy theo loại tài liệu.

---

## 🗂️ Các Loại Tài Liệu Được Quản Lý

### 1. Hợp Đồng PDF (Generated)

**Loại:** PDF được generate tự động từ templates  
**Vị trí lưu trữ:** 
- **Local:** `storage/pdfs/` (development)
- **Cloud:** AWS S3 / Google Cloud Storage (production - planned)

**Cách lưu trữ:**
- URL được lưu trong database (field `contractUrl` trong bảng `deposits`)
- File PDF được lưu trong file system hoặc cloud storage

**Ví dụ:**
- Deposit Contract: `storage/pdfs/deposits/deposit_DEP-001_1234567890.pdf`
- Booking Receipt: `storage/pdfs/bookings/booking_BOOK-001_1234567890.pdf`
- Reservation PDF: `storage/pdfs/reservations/reservation_RES-001_1234567890.pdf`

---

### 2. Chứng Từ Thanh Toán (Payment Proof)

**Loại:** Images/PDF được upload bởi CTV  
**Vị trí lưu trữ:**
- **Hiện tại:** Lưu dưới dạng JSON string trong database (field `paymentProof`)
- **Format:** Array of URLs hoặc base64 strings

**Database Fields:**
```sql
-- Deposits table
payment_proof TEXT  -- JSON array of file URLs

-- Bookings table  
payment_proof TEXT  -- JSON array of file URLs
```

**Cách sử dụng:**
- CTV upload images khi tạo deposit/booking
- URLs được lưu dưới dạng JSON array
- Admin có thể xem trong approval flow

---

### 3. Tài Liệu Đính Kèm Khác (Planned)

Theo document `09-PDF-AND-DOCUMENT-FEATURES.md`, các loại tài liệu sau được đề xuất:

- CMND/CCCD (mặt trước, mặt sau)
- Hộ chiếu
- Giấy chứng nhận đăng ký kết hôn
- Giấy ủy quyền (nếu có)
- Bản sao hợp đồng đã ký (scan)
- Biên bản nghiệm thu
- Ảnh căn hộ

**Status:** ⚠️ Chưa có module riêng để quản lý - cần implement

---

## 📁 Cấu Trúc Storage Hiện Tại

### Local File System (Development)

```
storage/
└── pdfs/
    ├── reservations/
    │   └── reservation_RES-001_1234567890.pdf
    ├── deposits/
    │   └── deposit_DEP-001_1234567890.pdf
    ├── bookings/
    │   └── booking_BOOK-001_1234567890.pdf
    ├── transactions/
    │   └── transaction_TXN-001_1234567890.pdf
    └── commissions/
        └── commission-report_CTV001_2025-12.pdf
```

### Configuration

**Environment Variables:**
```env
# PDF Storage Path (optional - defaults to storage/pdfs)
PDF_STORAGE_PATH=./storage/pdfs

# PDF Base URL (for public access)
PDF_BASE_URL=https://api.example.com/pdfs

# Upload Directory (for other files)
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

---

## 💾 Database Storage

### Deposits Table

```sql
CREATE TABLE deposits (
  id UUID PRIMARY KEY,
  code VARCHAR UNIQUE,
  -- ... other fields ...
  contract_url TEXT,        -- URL của PDF hợp đồng đã generate
  payment_proof TEXT,       -- JSON array của chứng từ thanh toán
  -- ... other fields ...
);
```

**Cách sử dụng:**

1. **Generate Contract PDF:**
   ```typescript
   // API: GET /api/pdf/deposits/:depositId
   // Service tự động:
   // 1. Generate PDF từ template
   // 2. Lưu vào storage/pdfs/deposits/
   // 3. Update deposit.contractUrl = URL
   ```

2. **Upload Payment Proof:**
   ```typescript
   // API: POST /api/deposits
   // Body: {
   //   ...other fields,
   //   paymentProof: ["url1", "url2"]  // Array of file URLs
   // }
   // Service lưu: paymentProof = JSON.stringify(["url1", "url2"])
   ```

### Bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  code VARCHAR UNIQUE,
  -- ... other fields ...
  payment_proof TEXT,       -- JSON array của chứng từ thanh toán
  -- ... other fields ...
  -- Note: Bookings không có contractUrl (chỉ có receipt PDF)
);
```

---

## 🔧 Implementation Details

### PDF Storage Utility

**File:** `apps/backend/src/modules/pdf/utils/storage.util.ts`

**Chức năng:**
- `save(buffer, filename, subfolder)`: Lưu PDF buffer vào storage
- `delete(filepath)`: Xóa file
- `getFilePathFromUrl(url)`: Convert URL về file path

**Ví dụ sử dụng:**
```typescript
// Generate và lưu PDF
const pdfBuffer = await PdfGenerator.generateFromHtml(html);
const filename = `deposit_${deposit.code}_${Date.now()}.pdf`;
const storageResult = await PdfStorage.save(pdfBuffer, filename, 'deposits');

// Update database
await prisma.deposit.update({
  where: { id: depositId },
  data: { contractUrl: storageResult.url }
});
```

---

## 🚀 Cloud Storage Migration (Future)

### Planned: AWS S3 / Google Cloud Storage

**Tại sao cần:**
- Scalability: Hỗ trợ nhiều file lớn
- Reliability: Redundancy và backup tự động
- Performance: CDN integration
- Security: Access control và encryption

**Implementation Plan:**

1. **Update Storage Utility:**
   ```typescript
   // storage.util.ts
   class PdfStorage {
     static async save(buffer: Buffer, filename: string): Promise<StorageResult> {
       if (process.env.STORAGE_TYPE === 's3') {
         return await S3Storage.save(buffer, filename);
       }
       // Default: local file system
       return await LocalStorage.save(buffer, filename);
     }
   }
   ```

2. **Environment Variables:**
   ```env
   STORAGE_TYPE=s3  # or 'local', 'gcs'
   AWS_S3_BUCKET=winland-documents
   AWS_S3_REGION=ap-southeast-1
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   ```

3. **URL Format:**
   - Local: `file:///path/to/storage/pdfs/deposits/file.pdf`
   - S3: `https://winland-documents.s3.amazonaws.com/pdfs/deposits/file.pdf`
   - GCS: `https://storage.googleapis.com/winland-documents/pdfs/deposits/file.pdf`

---

## 📋 Document Management Module (Proposed)

Theo document `09-PDF-AND-DOCUMENT-FEATURES.md`, cần có module quản lý tài liệu với:

### Features:

1. **Upload Tài Liệu:**
   - Multiple file upload
   - Format validation (PDF, JPG, PNG)
   - Size limit (max 10MB/file)
   - Virus scan (future)

2. **Version Management:**
   - Lưu tất cả versions
   - So sánh versions
   - Restore version cũ
   - Tag versions (draft, final, archived)

3. **Document Types:**
   - CMND/CCCD
   - Hộ chiếu
   - Giấy chứng nhận đăng ký kết hôn
   - Giấy ủy quyền
   - Bản sao hợp đồng đã ký
   - Chứng từ thanh toán
   - Biên bản nghiệm thu
   - Ảnh căn hộ

### Proposed Database Schema:

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  entity_type VARCHAR,      -- 'deposit', 'booking', 'unit', etc.
  entity_id UUID,           -- ID của entity liên quan
  document_type VARCHAR,    -- 'cmnd_front', 'cmnd_back', 'contract_signed', etc.
  file_url TEXT,
  file_name VARCHAR,
  file_size BIGINT,
  mime_type VARCHAR,
  version INTEGER DEFAULT 1,
  status VARCHAR,           -- 'draft', 'final', 'archived'
  uploaded_by UUID,         -- User ID
  uploaded_at TIMESTAMP,
  metadata JSONB,           -- Additional metadata
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_type ON documents(document_type);
```

---

## 🔍 Cách Truy Cập Tài Liệu

### 1. Hợp Đồng PDF (Generated)

**API Endpoints:**
```
GET /api/pdf/deposits/:depositId
GET /api/pdf/bookings/:bookingId
GET /api/pdf/reservations/:reservationId
```

**Response:**
```json
{
  "depositId": "uuid",
  "pdfUrl": "https://api.example.com/pdfs/deposits/deposit_DEP-001_1234567890.pdf",
  "message": "Deposit PDF generated successfully",
  "generatedAt": "2025-12-21T..."
}
```

**Database Query:**
```typescript
const deposit = await prisma.deposit.findUnique({
  where: { id: depositId },
  select: { contractUrl: true }
});
// deposit.contractUrl contains the PDF URL
```

### 2. Payment Proof (Uploaded)

**API Endpoints:**
```
GET /api/deposits/:id
GET /api/bookings/:id
```

**Response includes:**
```json
{
  "id": "uuid",
  "paymentProof": "[\"url1\", \"url2\"]",  // JSON string
  // ... other fields
}
```

**Parse in frontend:**
```typescript
const deposit = await depositsApi.getById(id);
const proofUrls = JSON.parse(deposit.paymentProof || '[]');
// proofUrls = ["url1", "url2"]
```

---

## 📝 Best Practices

### 1. File Naming Convention

**PDF Files:**
```
{type}_{code}_{timestamp}.pdf

Examples:
- deposit_DEP-001_1703148123456.pdf
- booking_BOOK-001_1703148123456.pdf
- reservation_RES-001_1703148123456.pdf
```

### 2. Storage Organization

**Folder Structure:**
```
storage/
├── pdfs/
│   ├── reservations/
│   ├── deposits/
│   ├── bookings/
│   ├── transactions/
│   └── commissions/
└── uploads/
    ├── payment-proofs/
    ├── documents/
    └── images/
```

### 3. Access Control

- PDF URLs cần authentication (JWT)
- Admin có thể xem tất cả documents
- CTV chỉ xem documents của mình
- Customer chỉ xem documents liên quan đến họ

---

## 🔐 Security Considerations

1. **File Upload Validation:**
   - Validate file type (whitelist)
   - Validate file size
   - Scan for viruses (future)
   - Sanitize file names

2. **Access Control:**
   - Authenticate requests
   - Authorize based on user role
   - Check entity ownership

3. **Storage Security:**
   - Encrypt files at rest (cloud storage)
   - Use signed URLs với expiration (cloud storage)
   - Set proper file permissions (local storage)

---

## 🚧 TODO / Improvements

1. **Immediate:**
   - ✅ PDF generation và storage (done)
   - ⚠️ Payment proof upload (basic - needs improvement)
   - ❌ Document management module (not implemented)

2. **Short-term:**
   - Implement file upload API endpoint
   - Add file validation
   - Create document management module
   - Add version control

3. **Long-term:**
   - Cloud storage integration (S3/GCS)
   - OCR for CMND extraction
   - Virus scanning
   - E-signature integration
   - Document versioning với diff view

---

## 📚 Related Documentation

- `ba-docs/09-PDF-AND-DOCUMENT-FEATURES.md` - Full PDF features specification
- `apps/backend/src/modules/pdf/README.md` - PDF module documentation
- `apps/backend/src/modules/pdf/utils/storage.util.ts` - Storage implementation

---

## 💡 Quick Reference

### Generate và Lưu PDF Contract

```typescript
// 1. Generate PDF
const pdfUrl = await pdfService.generateDepositContract(depositId);
// Service tự động:
//   - Generate PDF từ template
//   - Lưu vào storage/pdfs/deposits/
//   - Update deposit.contractUrl = pdfUrl
//   - Return URL

// 2. Retrieve Contract URL
const deposit = await prisma.deposit.findUnique({
  where: { id: depositId },
  select: { contractUrl: true }
});
const contractUrl = deposit.contractUrl; // URL của PDF
```

### Upload Payment Proof

```typescript
// 1. Upload files (cần implement upload endpoint)
const fileUrls = await uploadFiles(files); // ["url1", "url2"]

// 2. Save URLs to deposit
await prisma.deposit.update({
  where: { id: depositId },
  data: {
    paymentProof: JSON.stringify(fileUrls)
  }
});

// 3. Retrieve Payment Proof
const deposit = await prisma.deposit.findUnique({
  where: { id: depositId },
  select: { paymentProof: true }
});
const proofUrls = JSON.parse(deposit.paymentProof || '[]');
```

---

**Last Updated:** December 21, 2025
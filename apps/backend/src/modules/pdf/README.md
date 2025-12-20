# PDF Generation Module

Module tạo PDF documents cho hệ thống Winland sử dụng Puppeteer và Handlebars templates.

## Tính năng

### PDF Types được hỗ trợ:

1. **Reservation PDF** (`reservation.hbs`)
   - Phiếu giữ chỗ
   - Thông tin dự án, căn hộ, khách hàng
   - Thời hạn hiệu lực
   - Watermark: "CHƯA THANH TOÁN", "ĐÃ XÁC NHẬN", "HẾT HẠN"

2. **Deposit Contract** (`deposit-contract.hbs`)
   - Hợp đồng đặt cọc
   - Thông tin đầy đủ các bên
   - Lịch thanh toán
   - QR Code thanh toán
   - Watermark: "CHỜ DUYỆT", "ĐÃ DUYỆT"

3. **Booking Receipt** (`booking-receipt.hbs`)
   - Phiếu đặt chỗ
   - Số tiền đặt chỗ
   - QR Code thanh toán
   - Watermark: "CHỜ DUYỆT", "ĐÃ DUYỆT"

4. **Transaction Receipt** (`transaction-receipt.hbs`)
   - Phiếu nhận tiền
   - Chi tiết giao dịch
   - Thông tin thanh toán
   - Watermark: "ĐÃ XÁC NHẬN"

5. **Payment Schedule** (`payment-schedule.hbs`)
   - Lịch trả góp chi tiết
   - Trạng thái từng đợt (Đã thanh toán, Quá hạn, Chờ thanh toán)
   - Tổng hợp số tiền

6. **Commission Report** (`commission-report.hbs`)
   - Báo cáo hoa hồng CTV
   - Summary statistics
   - Chi tiết từng commission
   - Lịch sử thanh toán

## API Endpoints

### Base URL: `/api/pdf`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/reservations/:reservationId` | Tạo PDF Phiếu Giữ chỗ |
| GET | `/deposits/:depositId` | Tạo PDF Hợp đồng Đặt cọc |
| GET | `/deposit/:depositId/contract` | Legacy: Tạo hợp đồng |
| GET | `/deposit/:depositId/contract-data` | Lấy data hợp đồng (preview) |
| GET | `/deposit/:depositId/payment-schedule` | Tạo PDF Lịch Trả góp |
| GET | `/bookings/:bookingId` | Tạo PDF Phiếu Đặt chỗ |
| GET | `/booking/:bookingId/receipt` | Legacy: Tạo receipt |
| GET | `/transaction/:transactionId/receipt` | Tạo PDF Phiếu Nhận Tiền |
| GET | `/commission-report/:ctvId?from=YYYY-MM-DD&to=YYYY-MM-DD` | Tạo PDF Báo cáo Hoa hồng |

## Cấu trúc

```
pdf/
├── templates/              # Handlebars templates
│   ├── reservation.hbs
│   ├── deposit-contract.hbs
│   ├── booking-receipt.hbs
│   ├── transaction-receipt.hbs
│   ├── payment-schedule.hbs
│   └── commission-report.hbs
├── utils/                  # Utility classes
│   ├── pdf-generator.util.ts      # Puppeteer PDF generator
│   ├── template-renderer.util.ts  # Handlebars renderer
│   ├── handlebars-helpers.ts      # Custom helpers
│   ├── storage.util.ts            # File storage
│   ├── qrcode-embedder.util.ts    # QR code integration
│   └── watermark.util.ts          # Watermark utility
├── types/
│   └── pdf.types.ts
├── pdf.service.ts          # Main service
├── pdf.controller.ts       # API endpoints
└── pdf.module.ts           # NestJS module
```

## Utilities

### PdfGenerator
- Sử dụng Puppeteer để convert HTML → PDF
- Singleton browser instance
- Customizable margins, format, options

### TemplateRenderer
- Handlebars template engine
- Template caching
- Custom helpers support

### Custom Handlebars Helpers
- `formatCurrency` - Format VND currency
- `formatCurrencyText` - Số tiền bằng chữ (Việt Nam)
- `formatDate` - Format date
- `formatDateFull` - Full date format (Ngày DD tháng MM năm YYYY)
- `eq`, `ne`, `gt`, `lt` - Comparison helpers
- `default` - Default value helper
- `uppercase`, `lowercase` - Text transformation

### WatermarkUtil
- Thêm watermark vào PDF
- Tự động chọn watermark text dựa trên type và status
- Customizable opacity, color, rotation

### PdfStorage
- Local file system storage (development)
- Ready for cloud storage (S3/GCS) integration
- Auto-create directories

## Configuration

### Environment Variables

```env
# PDF Storage
PDF_STORAGE_PATH=/path/to/storage/pdfs
PDF_BASE_URL=http://localhost:3000/pdfs

# System Configs (stored in database)
company_name
company_address
company_tax_code
company_phone
company_email
company_logo_url
company_representative
bank_name
bank_account_number
bank_account_name
```

## Error Handling

- Tất cả methods có try-catch với detailed logging
- HTTP exceptions với proper status codes
- Error messages rõ ràng
- Stack traces logged cho debugging

## Logging

Sử dụng NestJS Logger:
- Log mỗi lần generate PDF (success/failure)
- Log errors với stack traces
- Log performance metrics (nếu cần)

## Dependencies

- `puppeteer` - HTML to PDF conversion
- `handlebars` - Template engine
- `moment` - Date formatting
- `qrcode` - QR code generation (via QrcodeService)

## Development Notes

1. Templates được cache sau lần load đầu tiên
2. Browser instance được reuse để tối ưu performance
3. PDF files được lưu vào `storage/pdfs/` (local) hoặc cloud storage
4. Watermarks được thêm vào HTML trước khi generate PDF

## Future Enhancements

- [ ] Cloud storage integration (S3/GCS)
- [ ] E-Signature integration
- [ ] Template management UI
- [ ] PDF preview functionality
- [ ] Email automation
- [ ] PDF optimization (compression)
- [ ] Batch PDF generation
- [ ] PDF versioning

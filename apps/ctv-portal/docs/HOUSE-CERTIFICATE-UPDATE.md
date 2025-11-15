# House Certificate Implementation

## Overview
Added `houseCertificate` field to the Unit model to track legal documentation for each property unit.

## Database Changes

### Schema Update
- **Field**: `houseCertificate` (String, nullable)
- **Location**: `Unit` model in `prisma/schema.prisma`
- **Mapped to**: `house_certificate` column in database

### Certificate Types
The system supports three types of house certificates:
1. **Sổ đỏ** (Red Book/Property Certificate)
2. **Hợp đồng mua bán nhà ở** (House Purchase Contract)
3. **Biên bản nghiệm thu** (Acceptance Certificate)

## Data Population

### Current Status
- **Total Units**: 5,245
- **Units with Certificate**: 5,245 (100%)
- **Distribution**:
  - Biên bản nghiệm thu: 1,755 units (33.5%)
  - Hợp đồng mua bán nhà ở: 1,820 units (34.7%)
  - Sổ đỏ: 1,670 units (31.8%)

### Scripts
- **Update Script**: `scripts/update-house-certificates.js`
  - Populates random certificate data for all units
  - Shows progress every 100 units
  - Displays distribution summary

- **Verification Script**: `scripts/verify-house-certificates.js`
  - Shows sample units with certificates
  - Displays certificate distribution
  - Checks for null values

## UI Implementation

### Display Location
The certificate information is displayed in the "Chứng từ" section of:
- **UnitModal**: Main unit details modal
- **BookingModal**: Booking form modal
- **DepositModal**: Deposit form modal
- **ReservedModal**: Reservation form modal

### Display Logic
- Shows certificate type if available
- Shows warning icon (BadgeAlert) if certificate is missing
- Displays fallback message: "Căn hộ này chưa có thông tin chứng từ"

## API Integration
The `houseCertificate` field is automatically included in API responses through Prisma's include mechanism:
- `/api/projects` - Returns all units with certificate data
- All unit queries include the certificate field

## Usage Example

```javascript
// Sample unit data
{
  code: "G2-1508",
  houseCertificate: "Biên bản nghiệm thu",
  // ... other fields
}
```

## Future Enhancements
- Add certificate upload functionality
- Implement certificate verification workflow
- Add certificate expiry tracking
- Create certificate management admin panel

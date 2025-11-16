# Booking Feature Implementation

## Overview
Implemented full booking functionality that allows CTVs to create booking appointments for customers to view properties.

## Features Implemented

### 1. Booking Creation API
**Endpoint**: `POST /api/bookings/create`

**Request Body**:
```json
{
  "unitId": "string",
  "ctvId": "string",
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "visitDate": "string",
  "startTime": "string",
  "endTime": "string"
}
```

**Response**:
```json
{
  "success": true,
  "booking": { /* booking object */ },
  "message": "Booking đã được tạo thành công"
}
```

**Functionality**:
- Validates all required fields
- Checks if unit exists and is available
- Generates unique booking code (format: BK000001, BK000002, etc.)
- Sets booking expiry to 7 days from creation
- Creates booking with status 'CONFIRMED'
- Updates unit status to 'RESERVED_BOOKING'
- Stores visit schedule in notes field

### 2. BookingModal Component Updates

**New Features**:
- Added `isSubmitting` state to prevent double submissions
- Integrated with `/api/bookings/create` endpoint
- Fetches current user information from session
- Shows loading state during submission ("Đang xử lý...")
- Displays success/error toast notifications
- Reloads page after successful booking to update unit status

**Form Fields**:
- Customer Name (required)
- Customer Phone (required, validated)
- Customer Email (required)
- Visit Date (required, must be today or future)
- Start Time (required, dropdown with 30-min intervals)
- End Time (required, must be after start time)

**Validation**:
- Vietnamese phone number validation (mobile: 03x, 05x, 07x, 08x, 09x; landline: 02x)
- Time range validation (end time must be after start time)
- All fields required before submission

### 3. Unit Status Update

When a booking is created:
- Unit status changes from `AVAILABLE` to `RESERVED_BOOKING`
- Unit becomes unavailable for other bookings
- Status is reflected immediately in Project Management page
- Color coding updates automatically (blue for booking status)

### 4. Dashboard Integration

**Existing Integration** (already implemented):
- Dashboard fetches bookings from `/api/bookings`
- Displays recent bookings in "Danh sách Booking" section
- Shows booking details:
  - Booking code
  - Unit code
  - Customer name
  - Customer phone
  - Visit schedule
  - Status
  - Created date

### 5. Notification Integration

**Existing Integration** (already implemented):
- Notification page fetches bookings from `/api/bookings`
- Displays all bookings for the logged-in CTV
- Shows booking notifications with:
  - Booking code
  - Unit information
  - Customer details
  - Visit schedule
  - Status updates

## Database Schema

### Booking Table Fields Used:
- `code`: Unique booking identifier (BK000001, BK000002, etc.)
- `unitId`: Reference to the unit being booked
- `ctvId`: Reference to the CTV creating the booking
- `customerName`: Customer's full name
- `customerPhone`: Customer's phone number
- `customerEmail`: Customer's email address
- `customerIdCard`: Empty for now (will be filled later)
- `customerAddress`: Empty for now (will be filled later)
- `bookingAmount`: 0 (viewing is free)
- `paymentMethod`: 'NONE'
- `status`: 'CONFIRMED' (automatically approved)
- `expiresAt`: 7 days from creation
- `notes`: Visit schedule details
- `approvedAt`: Timestamp of creation

## User Flow

1. **CTV opens unit modal** → Clicks "Booking" button
2. **BookingModal opens** → CTV fills in customer information and visit schedule
3. **CTV clicks "Xác nhận"** → System validates all fields
4. **API creates booking** → Generates booking code, saves to database
5. **Unit status updates** → Changes to RESERVED_BOOKING
6. **Success notification** → Toast message confirms booking creation
7. **Page reloads** → Unit shows new status in Project Management
8. **Dashboard updates** → New booking appears in "Danh sách Booking"
9. **Notification created** → Booking appears in Notification page

## Error Handling

- Missing required fields → 400 error with message
- Unit not found → 404 error
- Database errors → 500 error with generic message
- Network errors → Toast notification to user
- Validation errors → Real-time field-level error messages

## Future Enhancements

Potential improvements:
1. Add booking confirmation email to customer
2. Add SMS notification for visit reminder
3. Allow booking rescheduling
4. Add booking cancellation with reason
5. Add booking history tracking
6. Add customer ID card upload
7. Add customer address collection
8. Implement booking payment if required
9. Add calendar view for bookings
10. Add booking conflict detection

## Testing

To test the booking feature:
1. Login as a CTV user
2. Navigate to Project Management
3. Click on an available unit (green)
4. Click "Booking" button
5. Fill in all customer information
6. Select visit date and time
7. Click "Xác nhận"
8. Verify success message
9. Check unit status changed to booking (blue)
10. Navigate to Dashboard → Check "Danh sách Booking"
11. Navigate to Notification → Check booking notification

## API Dependencies

- `GET /api/user/me` - Get current user information
- `POST /api/bookings/create` - Create new booking
- `GET /api/bookings` - Fetch all bookings (Dashboard & Notification)

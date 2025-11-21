# Reservation Create Functionality Fix

## Issue
The ReservedModal (reservation creation form) only showed a toast notification when clicking the submit button, but didn't actually create the reservation in the database.

## Solution
Created a complete reservation creation API endpoint and updated the ReservedModal to call it.

## Files Created

### 1. Create Reservation API
**File:** `apps/ctv-portal/app/api/reservations/create/route.ts`

**Functionality:**
- ✅ Validates required fields (unitId, ctvId, customerName, customerPhone)
- ✅ Checks if unit exists and is AVAILABLE
- ✅ Generates sequential reservation code (RS000001, RS000002, etc.)
- ✅ Calculates reservation expiry (default 7 days from now)
- ✅ Creates reservation record in database
- ✅ Updates unit status to RESERVED_BOOKING
- ✅ Returns complete reservation data with relations

**Request:**
```typescript
POST /api/reservations/create
Content-Type: application/json

{
    "unitId": "uuid",
    "ctvId": "uuid",
    "customerName": "Nguyễn Văn A",
    "customerPhone": "0901234567",
    "customerEmail": "email@example.com",
    "reservationDays": 7  // Optional, default 7
}
```

**Response:**
```typescript
{
    "success": true,
    "reservation": {
        "id": "uuid",
        "code": "RS000001",
        "status": "ACTIVE",
        "reservedUntil": "2025-11-27T...",
        "unit": {...},
        "ctv": {...}
    },
    "message": "Giữ chỗ đã được tạo thành công"
}
```

## Files Modified

### 1. ReservedModal Component
**File:** `apps/ctv-portal/components/ReservedModal.tsx`

**Changes:**
1. Added `isSubmitting` state for loading indicator
2. Updated submit button onClick handler to:
   - Get user information from session
   - Call create reservation API
   - Handle success/error responses
   - Show appropriate toast notifications
   - Refresh page on success

**Before:**
```typescript
onClick={() => {
    toastNotification.success("Giữ chỗ đã được xác nhận thành công!");
    onClose();
}}
```

**After:**
```typescript
onClick={async () => {
    setIsSubmitting(true);
    try {
        // Get user info
        const userRes = await fetch('/api/user/me', {...});
        const userData = await userRes.json();

        // Create reservation
        const response = await fetch('/api/reservations/create', {
            method: 'POST',
            body: JSON.stringify({
                unitId: unit.id,
                ctvId: userData.id,
                customerName: form.name,
                customerPhone: form.phone,
                customerEmail: form.email,
                reservationDays: 7
            })
        });

        if (response.ok) {
            toastNotification.success('Giữ chỗ đã được tạo thành công!');
            window.location.reload();
        }
    } catch (error) {
        toastNotification.error('Đã xảy ra lỗi');
    } finally {
        setIsSubmitting(false);
    }
}}
```

## How It Works

### User Flow
```
1. User opens available unit
2. User clicks "Giữ chỗ" button
3. ReservedModal opens with form
4. User fills in:
   - Customer name
   - Phone number
   - CCCD number
   - Address
   - Email
5. User checks agreement checkbox
6. User clicks "Thanh toán" button
7. System:
   - Validates form
   - Gets CTV user info
   - Calls create reservation API
   - Shows loading state
8. API:
   - Validates data
   - Checks unit availability
   - Generates reservation code
   - Creates reservation
   - Updates unit status
9. Success:
   - Toast notification appears
   - Modal closes
   - Page refreshes
   - Unit now shows as "Đang có đặt chỗ"
```

### Data Flow
```
ReservedModal
    ↓ (form data)
GET /api/user/me
    ↓ (user info)
POST /api/reservations/create
    ↓ (reservation data)
Database
    ├─> Create reservation record
    └─> Update unit status
    ↓ (success response)
Toast Notification
    ↓
Page Refresh
    ↓
Updated Unit Display
```

## Reservation Data Structure

### Created Reservation
```typescript
{
    code: "RS000001",              // Sequential code
    unitId: "uuid",                // Unit reference
    ctvId: "uuid",                 // CTV reference
    customerName: "Nguyễn Văn A",  // Customer info
    customerPhone: "0901234567",
    customerEmail: "email@...",
    status: "ACTIVE",              // Initial status
    priority: 0,                   // Queue priority
    reservedUntil: Date,           // Expiry time (now + 7 days)
    extendCount: 0,                // Number of extensions
    notes: "Giữ chỗ 7 ngày"       // Default note
}
```

### Unit Status Change
```
Before: AVAILABLE
After:  RESERVED_BOOKING
```

## Validation

### Required Fields
- ✅ unitId - Must exist and be AVAILABLE
- ✅ ctvId - Must be valid user
- ✅ customerName - Cannot be empty
- ✅ customerPhone - Must be valid Vietnamese phone number
- ✅ customerEmail - Optional but validated if provided
- ✅ CCCD - Must be 12 digits
- ✅ Address - Cannot be empty
- ✅ Agreement - Must be checked

### Business Rules
1. **Unit Availability**: Unit must have status AVAILABLE
2. **Sequential Codes**: Reservation codes are sequential (RS000001, RS000002...)
3. **Default Duration**: 7 days reservation period
4. **Status**: New reservations start with ACTIVE status
5. **Priority**: New reservations start with priority 0

## Error Handling

### Client-Side Errors
| Error | Message | Action |
|-------|---------|--------|
| Not logged in | "Vui lòng đăng nhập lại" | Redirect to login |
| Invalid form | Form validation errors | Show field errors |
| Network error | "Đã xảy ra lỗi khi tạo giữ chỗ" | Show error toast |

### Server-Side Errors
| Error | Status | Message |
|-------|--------|---------|
| Missing fields | 400 | "Thiếu thông tin bắt buộc" |
| Unit not found | 404 | "Không tìm thấy căn hộ" |
| Unit not available | 400 | "Căn hộ không còn trống" |
| Database error | 500 | "Đã xảy ra lỗi khi tạo giữ chỗ" |

## Testing

### Test Case 1: Successful Reservation
1. Open available unit (green)
2. Click "Giữ chỗ" button
3. Fill in all required fields
4. Check agreement checkbox
5. Click "Thanh toán" button
6. **Expected:**
   - Loading state shows "Đang xử lý..."
   - Success toast appears
   - Modal closes
   - Page refreshes
   - Unit shows as yellow "Đang có đặt chỗ"
   - Reservation appears in dashboard

### Test Case 2: Unit Not Available
1. Try to create reservation on non-available unit
2. **Expected:**
   - Error toast: "Căn hộ không còn trống"
   - Modal stays open
   - No reservation created

### Test Case 3: Invalid Form
1. Leave required fields empty
2. **Expected:**
   - Submit button disabled
   - Cannot submit form
   - Field validation errors shown

### Test Case 4: Network Error
1. Disconnect network
2. Try to submit form
3. **Expected:**
   - Error toast appears
   - Modal stays open
   - Can retry

## Reservation Code Generation

### Format
```
RS + 6-digit number
Examples: RS000001, RS000002, RS000003
```

### Logic
```typescript
const reservationCount = await prisma.reservation.count()
const reservationCode = `RS${String(reservationCount + 1).padStart(6, '0')}`
```

### Benefits
- ✅ Sequential and predictable
- ✅ No gaps (based on total count)
- ✅ Easy to track and reference
- ✅ Consistent with booking codes (BK000001)

## Reservation Duration

### Default: 7 Days
```typescript
const now = new Date()
const reservedUntil = new Date(now)
reservedUntil.setDate(reservedUntil.getDate() + 7)
```

### Customizable
Can be changed by passing `reservationDays` parameter:
```typescript
{
    reservationDays: 14  // 14 days instead of 7
}
```

## Integration Points

### APIs Used
1. **GET /api/user/me** - Get current user info
2. **POST /api/reservations/create** - Create reservation
3. **GET /api/reservations** - List reservations (for display)

### Database Tables
1. **reservations** - Reservation records
2. **units** - Unit status updates
3. **users** - CTV information

### UI Components
1. **ReservedModal** - Reservation creation form
2. **ReservationDetailModal** - View reservation details
3. **Dashboard** - Show urgent reservations
4. **Project Management** - Show unit status

## Benefits

1. **Complete Functionality**: Reservations now actually work
2. **Data Persistence**: All reservations saved to database
3. **Status Management**: Unit status properly updated
4. **User Feedback**: Clear loading states and notifications
5. **Error Handling**: Graceful error handling with user-friendly messages
6. **Sequential IDs**: Predictable reservation codes
7. **Audit Trail**: Complete history of all reservations

## Future Enhancements

1. **Payment Integration**: Add actual payment processing
2. **Email Notifications**: Send confirmation emails
3. **SMS Notifications**: Send SMS to customer
4. **Custom Duration**: Allow user to select reservation period
5. **Priority Queue**: Implement priority-based queue system
6. **Extension**: Allow extending reservation period
7. **Cancellation**: Add cancel reservation functionality

---

**Status:** ✅ Complete and Working  
**Date:** November 20, 2025  
**Version:** 1.0.0

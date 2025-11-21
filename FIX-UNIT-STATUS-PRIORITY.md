# Fix Unit Status Display Priority

## Issue
Unit T1-0104 has an active reservation but is showing as blue "Đang có booking" instead of yellow "Đang có đặt chỗ".

## Root Cause
The unit has BOTH:
1. An EXPIRED booking (BK000005 - test booking)
2. An ACTIVE reservation (RS000001 - new reservation)

The original logic checked bookings first, so even though the booking was EXPIRED, it still showed as blue "Đang có booking" instead of prioritizing the ACTIVE reservation.

## Solution
Updated the status mapping logic to prioritize ACTIVE reservations over EXPIRED bookings.

## File Modified

### `apps/ctv-portal/app/project-management/page.tsx`

**Changes:**
1. Added `bookingStatus` parameter to `mapDatabaseStatus` function
2. Updated logic to check if booking is EXPIRED
3. Prioritize ACTIVE reservation over EXPIRED booking

**New Logic:**
```typescript
const mapDatabaseStatus = (
    dbStatus: string, 
    hasActiveBooking: boolean, 
    hasActiveReservation: boolean, 
    bookingStatus?: string
): UnitStatus => {
    switch (dbStatus) {
        case 'RESERVED_BOOKING':
            // Priority logic:
            // 1. Active reservation takes priority over expired booking
            // 2. Active booking (CONFIRMED, PENDING) shows as booking
            // 3. Expired booking shows as booking (until user deletes it)
            // 4. Active reservation shows as reserved
            
            // If has active reservation and booking is expired, show as reserved
            if (hasActiveReservation && bookingStatus === 'EXPIRED') {
                return 'reserved';
            }
            
            // If unit has active booking (including EXPIRED), show as booking
            if (hasActiveBooking) {
                return 'booking';
            }
            
            // If unit has active reservation, show as reserved
            if (hasActiveReservation) {
                return 'reserved';
            }
            
            return 'reserved';
    }
}
```

## Priority Rules

### Status Display Priority (Highest to Lowest)
1. **ACTIVE Reservation** → Yellow "Đang có đặt chỗ"
2. **CONFIRMED/PENDING Booking** → Blue "Đang có booking"
3. **EXPIRED Booking** → Blue "Đang có booking"
4. **EXPIRED Reservation** → Yellow "Đang có đặt chỗ"

### Special Case: Both EXPIRED Booking + ACTIVE Reservation
- **Result:** Yellow "Đang có đặt chỗ" (reservation takes priority)
- **Reason:** Active reservation is more important than expired booking

## Status Matrix

| Unit Has | Booking Status | Reservation Status | Display |
|----------|----------------|-------------------|---------|
| Booking only | CONFIRMED | - | Blue "Đang có booking" |
| Booking only | EXPIRED | - | Blue "Đang có booking" |
| Reservation only | - | ACTIVE | Yellow "Đang có đặt chỗ" |
| Reservation only | - | EXPIRED | Yellow "Đang có đặt chỗ" |
| Both | CONFIRMED | ACTIVE | Blue "Đang có booking" |
| Both | EXPIRED | ACTIVE | Yellow "Đang có đặt chỗ" ✅ |
| Both | EXPIRED | EXPIRED | Blue "Đang có booking" |

## Expected Behavior

### Unit T1-0104 (Current State)
- Has: EXPIRED booking (BK000005) + ACTIVE reservation (RS000001)
- **Before Fix:** Blue "Đang có booking"
- **After Fix:** Yellow "Đang có đặt chỗ" ✅

### When User Deletes Expired Booking
1. User clicks Trash on BK000005
2. Booking hidden from dashboard
3. Unit still has ACTIVE reservation
4. Display: Yellow "Đang có đặt chỗ" (unchanged)

### When User Deletes Reservation
1. User clicks Trash on RS000001
2. Reservation hidden from dashboard
3. No more active transactions
4. Display: Green "Đang mở bán"

## Testing

### Test Case 1: Unit with EXPIRED Booking + ACTIVE Reservation
1. Unit T1-0104 should show yellow "Đang có đặt chỗ"
2. Click on unit
3. Should show reservation details (RS000001)

### Test Case 2: Unit with CONFIRMED Booking + ACTIVE Reservation
1. Create new booking on unit with reservation
2. Unit should show blue "Đang có booking"
3. Booking takes priority over reservation

### Test Case 3: Unit with Only EXPIRED Booking
1. Unit should show blue "Đang có booking"
2. Click on unit
3. Should show booking details with EXPIRED status

### Test Case 4: Unit with Only ACTIVE Reservation
1. Unit should show yellow "Đang có đặt chỗ"
2. Click on unit
3. Should show reservation details

## Benefits

1. **Logical Priority**: Active transactions take priority over expired ones
2. **Better UX**: Users see the most relevant status
3. **Clear Distinction**: Easy to identify active vs expired transactions
4. **Consistent Behavior**: Follows business logic expectations

## Related Scenarios

### Scenario 1: Clean Up Expired Booking
```
Initial: EXPIRED booking + ACTIVE reservation → Yellow
Delete booking → ACTIVE reservation only → Yellow (unchanged)
```

### Scenario 2: Reservation Expires
```
Initial: EXPIRED booking + ACTIVE reservation → Yellow
Reservation expires → EXPIRED booking + EXPIRED reservation → Blue
```

### Scenario 3: New Booking on Reserved Unit
```
Initial: ACTIVE reservation → Yellow
Create booking → CONFIRMED booking + ACTIVE reservation → Blue
```

## Implementation Details

### Data Flow
```typescript
// 1. Fetch unit data from API
const unit = {
    bookings: [{ status: 'EXPIRED' }],
    reservations: [{ status: 'ACTIVE' }]
}

// 2. Extract status
const hasActiveBooking = unit.bookings.length > 0  // true
const hasActiveReservation = unit.reservations.length > 0  // true
const bookingStatus = unit.bookings[0].status  // 'EXPIRED'

// 3. Map to display status
const displayStatus = mapDatabaseStatus(
    'RESERVED_BOOKING',
    hasActiveBooking,      // true
    hasActiveReservation,  // true
    bookingStatus          // 'EXPIRED'
)
// Result: 'reserved' (yellow)
```

## Future Enhancements

1. **Status Badges**: Show both booking and reservation status
2. **Multi-Transaction View**: Display all active transactions
3. **Priority Indicator**: Visual indicator of which transaction has priority
4. **Quick Actions**: Quick access to delete expired transactions

---

**Status:** ✅ Fixed  
**Date:** November 21, 2025  
**Impact:** High (affects unit display logic)  
**Priority:** High

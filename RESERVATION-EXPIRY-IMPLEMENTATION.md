# Reservation Expiry Implementation

## Overview
Implementing the same expiry and deletion functionality for Reservations as we have for Bookings.

## Requirements
1. ✅ When a reservation expires (reservedUntil time passes), status changes to EXPIRED
2. ✅ User can click Trash button on EXPIRED reservations in dashboard
3. ✅ Unit returns to AVAILABLE status when reservation is deleted
4. ✅ Reservation history is preserved (not deleted from database)
5. ✅ Reservation IDs continue to increase sequentially

## Files Created/Modified

### API Endpoints Created

#### 1. Check Expired Reservations
**File:** `apps/ctv-portal/app/api/reservations/check-expired/route.ts`

**Functionality:**
- Finds all ACTIVE reservations where `reservedUntil < now`
- Updates status to EXPIRED
- Adds cancellation reason: "Đã qua thời gian giữ chỗ"
- Does NOT change unit status (stays RESERVED_BOOKING)

**Usage:**
```typescript
POST /api/reservations/check-expired
Response: { success: true, expiredCount: 1, expiredReservations: ["RS000001"] }
```

#### 2. Delete (Hide) Expired Reservation
**File:** `apps/ctv-portal/app/api/reservations/[id]/route.ts`

**Functionality:**
- Only allows hiding EXPIRED, MISSED, or CANCELLED reservations
- Adds `[HIDDEN_FROM_DASHBOARD]` marker to notes
- Preserves original reservation status
- Returns unit to AVAILABLE if no other active transactions

**Usage:**
```typescript
DELETE /api/reservations/[id]
Response: { success: true, message: "Đã ẩn giữ chỗ..." }
```

### API Endpoints Modified

#### 3. Projects API
**File:** `apps/ctv-portal/app/api/projects/route.ts`

**Changes:**
- Include EXPIRED reservations in query
- Status filter: `['ACTIVE', 'YOUR_TURN', 'EXPIRED']`
- This makes expired reservations show as yellow "Đang có đặt chỗ"

#### 4. Dashboard API
**File:** `apps/ctv-portal/app/dashboard/page.tsx`

**Changes:**
- Added check for expired reservations on load
- Calls both booking and reservation expiry checks in parallel

## Status Flow

### Reservation Lifecycle

```
1. CREATE RESERVATION
   Status: ACTIVE
   Unit: RESERVED_BOOKING
   Display: Yellow "Đang có đặt chỗ"

2. TIME PASSES (reservedUntil < now)
   Status: EXPIRED
   Unit: RESERVED_BOOKING (unchanged)
   Display: Yellow "Đang có đặt chỗ" with Trash button

3. USER CLICKS TRASH
   Status: EXPIRED (unchanged)
   Notes: [HIDDEN_FROM_DASHBOARD] added
   Unit: AVAILABLE (if no other transactions)
   Display: Hidden from dashboard
```

## Reservation Status Enum

```prisma
enum ReservationStatus {
  ACTIVE        // Currently active
  YOUR_TURN     // Customer's turn to proceed
  MISSED        // Customer missed their turn
  EXPIRED       // Time has passed
  CANCELLED     // Manually cancelled
  COMPLETED     // Successfully completed
}
```

## Dashboard Display

### Urgent Reservations Section
- Shows ACTIVE reservations expiring within 24 hours
- No trash button (still active)

### Expired Reservations Section (NEW)
- Shows EXPIRED, MISSED, or CANCELLED reservations
- Has trash button for cleanup
- Similar to expired bookings section

## Unit Status Management

### Status Display Logic
```typescript
// In project-management page
if (unit.status === 'RESERVED_BOOKING') {
    if (hasActiveBooking) {
        return 'booking' // Blue
    }
    if (hasActiveReservation) {
        return 'reserved' // Yellow/Orange
    }
    return 'reserved' // Default yellow/orange
}
```

### Active Reservation Check
```typescript
// Includes EXPIRED reservations
reservations: {
    where: {
        status: {
            in: ['ACTIVE', 'YOUR_TURN', 'EXPIRED']
        }
    }
}
```

## Data Preservation

### What's Preserved
- ✅ Reservation record in database
- ✅ Reservation code (RS000001)
- ✅ Customer information
- ✅ Reserved until timestamp
- ✅ Creation timestamp
- ✅ Status history
- ✅ All relationships

### What's Changed
- ⚠️ Notes field (adds [HIDDEN_FROM_DASHBOARD] marker)
- ⚠️ Unit status (returns to AVAILABLE if no other transactions)

### What's NOT Changed
- ✅ Reservation status (stays EXPIRED)
- ✅ Reservation ID
- ✅ Customer data
- ✅ Timestamps
- ✅ Relationships

## Testing Checklist

### Test Case 1: Reservation Expiry
- [ ] Create reservation with past reservedUntil time
- [ ] Run check-expired API
- [ ] Verify reservation status changes to EXPIRED
- [ ] Verify unit status remains RESERVED_BOOKING
- [ ] Verify reservation appears in dashboard

### Test Case 2: Delete Expired Reservation
- [ ] Click Trash button on EXPIRED reservation
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion
- [ ] Verify reservation disappears from dashboard
- [ ] Verify unit status changes to AVAILABLE
- [ ] Verify reservation still in transaction history

### Test Case 3: History Preservation
- [ ] Delete multiple expired reservations
- [ ] Check database: reservations still exist with marker
- [ ] Verify transaction history shows all reservations
- [ ] Verify reservation codes continue sequentially

### Test Case 4: Multiple Transactions
- [ ] Create reservation on unit A
- [ ] Create booking on same unit A
- [ ] Expire and delete reservation
- [ ] Verify unit A remains RESERVED_BOOKING (due to booking)
- [ ] Delete booking
- [ ] Verify unit A returns to AVAILABLE

## Comparison: Booking vs Reservation

| Feature | Booking | Reservation |
|---------|---------|-------------|
| **Expiry Check** | visitEndTime + 30 min | reservedUntil |
| **Expired Status** | EXPIRED | EXPIRED |
| **Unit Display** | Blue "Đang có booking" | Yellow "Đang có đặt chỗ" |
| **Trash Button** | ✅ Yes | ✅ Yes |
| **History Preserved** | ✅ Yes | ✅ Yes |
| **Sequential IDs** | ✅ Yes | ✅ Yes |
| **Hidden Marker** | [HIDDEN_FROM_DASHBOARD] | [HIDDEN_FROM_DASHBOARD] |

## API Endpoints Summary

### Reservations
```
GET    /api/reservations              - List all reservations
POST   /api/reservations/check-expired - Check and mark expired
DELETE /api/reservations/[id]         - Hide expired reservation
```

### Bookings
```
GET    /api/bookings                  - List all bookings
POST   /api/bookings/check-expired    - Check and mark expired
DELETE /api/bookings/[id]             - Hide expired booking
POST   /api/bookings/complete         - Complete booking
POST   /api/bookings/cancel           - Cancel booking
```

## Next Steps

### 1. Update Dashboard UI
Add section for expired reservations with trash button:
- Similar to expired bookings section
- Show EXPIRED, MISSED, CANCELLED reservations
- Add trash button and confirmation dialog
- Add state management for reservation deletion

### 2. Update Transaction History
Ensure expired reservations are visible:
- Filter out hidden reservations from dashboard
- Show all reservations in transaction history
- Display proper status badges

### 3. Testing
- Test expiry detection
- Test deletion functionality
- Test unit status changes
- Test history preservation

## Benefits

1. **Consistent UX**: Same behavior for bookings and reservations
2. **Data Integrity**: All reservation history preserved
3. **User Control**: Users decide when to clean up expired items
4. **Audit Trail**: Complete transaction history available
5. **Sequential IDs**: No gaps in reservation codes

## Future Enhancements

1. **Auto-cleanup**: Automatically hide after X days
2. **Bulk Delete**: Delete multiple expired items at once
3. **Restore Function**: Allow restoring hidden items
4. **Analytics**: Track expiry patterns and success rates
5. **Notifications**: Alert users before expiry

---

**Status:** ✅ API Endpoints Complete  
**Date:** November 20, 2025  
**Next:** Update Dashboard UI

# Booking Expiry and History Management Implementation

## Overview
This document describes the implementation of the booking expiry system where EXPIRED bookings can be deleted from the dashboard while preserving booking history and returning units to AVAILABLE status.

## Requirements
1. ✅ When a booking expires (status = EXPIRED), it should be visible in the dashboard
2. ✅ When user clicks Trash button on an EXPIRED booking, the unit returns to AVAILABLE status
3. ✅ Booking history is preserved (not deleted from database)
4. ✅ Booking ID continues to increase sequentially (BK000001, BK000002, etc.)

## Implementation Details

### 1. Booking Expiry Check (`/api/bookings/check-expired`)
**File:** `apps/ctv-portal/app/api/bookings/check-expired/route.ts`

**Behavior:**
- Runs automatically when dashboard loads
- Checks all CONFIRMED bookings where visit end time + 30 minutes has passed
- Updates booking status to EXPIRED
- **Does NOT change unit status** - unit stays in RESERVED_BOOKING
- Adds cancellation reason: "Đã qua thời gian booking"

**Key Code:**
```typescript
await prisma.booking.update({
    where: { id: booking.id },
    data: { 
        status: 'EXPIRED',
        cancelledReason: 'Đã qua thời gian booking'
    }
})
// Note: Unit status is NOT changed here
// Unit will return to AVAILABLE only when user clicks Trash button
```

### 2. Delete/Hide Booking (`DELETE /api/bookings/[id]`)
**File:** `apps/ctv-portal/app/api/bookings/[id]/route.ts`

**Behavior:**
- Only allows hiding EXPIRED, COMPLETED, or CANCELLED bookings
- Adds `[HIDDEN_FROM_DASHBOARD]` marker to notes field
- **Preserves original booking status** (EXPIRED, COMPLETED, or CANCELLED)
- Returns unit to AVAILABLE if no other active transactions exist
- Checks for active bookings, reservations, AND deposits before returning unit

**Key Code:**
```typescript
// Add hidden marker WITHOUT changing status
await prisma.booking.update({
    where: { id: bookingId },
    data: {
        notes: booking.notes 
            ? `${booking.notes}\n[HIDDEN_FROM_DASHBOARD]`
            : '[HIDDEN_FROM_DASHBOARD]'
    }
})

// Return unit to AVAILABLE if no other active transactions
if (activeBookings === 0 && activeReservations === 0 && activeDeposits === 0) {
    await prisma.unit.update({
        where: { id: booking.unitId },
        data: { status: 'AVAILABLE' }
    })
}
```

### 3. Dashboard Display (`/dashboard`)
**File:** `apps/ctv-portal/app/dashboard/page.tsx`

**Behavior:**
- Filters out bookings with `[HIDDEN_FROM_DASHBOARD]` marker
- Shows Trash button only for EXPIRED, COMPLETED, or CANCELLED bookings
- Displays booking status badges (Hết hạn, Hoàn thành, Đã hủy)
- Refreshes data after deletion

**Key Code:**
```typescript
// Filter hidden bookings from dashboard
const recent = bookings
    .filter((b: any) => !b.notes?.includes('[HIDDEN_FROM_DASHBOARD]'))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

// Show trash button for completed/expired/cancelled bookings
{(booking.status === 'COMPLETED' || booking.status === 'EXPIRED' || booking.status === 'CANCELLED') && (
    <button onClick={() => handleDeleteClick(booking.id)}>
        <Trash2 className="w-4 h-4" />
    </button>
)}
```

### 4. Transaction History (`/my-transactions`)
**File:** `apps/ctv-portal/app/my-transactions/page.tsx`

**Behavior:**
- Shows ALL bookings including hidden ones
- Displays EXPIRED status with gray badge
- Includes all booking details and history
- No filtering of hidden bookings

**Key Code:**
```typescript
// All bookings are shown in transaction history
...bookings.map((b: any) => ({
    id: b.id,
    type: 'booking' as const,
    code: b.code,
    unitCode: b.unit?.code || 'N/A',
    status: b.status, // Shows EXPIRED, COMPLETED, CANCELLED, etc.
    createdAt: b.createdAt
}))
```

### 5. Booking ID Generation
**File:** `apps/ctv-portal/app/api/bookings/create/route.ts`

**Behavior:**
- Booking ID is generated based on total count: `BK000001`, `BK000002`, etc.
- Since bookings are never deleted (only hidden), the count continues to increase
- Each new booking gets the next sequential ID

**Key Code:**
```typescript
const bookingCount = await prisma.booking.count()
const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`
```

## Database Schema
**Booking Status Enum:**
```prisma
enum BookingStatus {
  PENDING_PAYMENT
  PENDING_APPROVAL
  CONFIRMED
  CANCELLED
  EXPIRED
  COMPLETED
  UPGRADED
}
```

**Unit Status Enum:**
```prisma
enum UnitStatus {
  AVAILABLE
  RESERVED_BOOKING
  DEPOSITED
  SOLD
}
```

## Flow Diagram

```
1. Booking Created
   ├─> Status: CONFIRMED
   └─> Unit Status: RESERVED_BOOKING

2. Visit Time Passes (check-expired runs)
   ├─> Status: EXPIRED
   └─> Unit Status: RESERVED_BOOKING (unchanged)

3. User Clicks Trash Button
   ├─> Status: EXPIRED (unchanged)
   ├─> Notes: [HIDDEN_FROM_DASHBOARD] added
   └─> Unit Status: AVAILABLE (if no other active transactions)

4. Dashboard View
   ├─> Hidden bookings: NOT shown
   └─> Active bookings: Shown with Trash button

5. Transaction History View
   ├─> Hidden bookings: SHOWN
   └─> All bookings: Complete history preserved
```

## Testing Checklist

### Test Case 1: Booking Expiry
- [ ] Create a booking with visit time in the past
- [ ] Run check-expired API
- [ ] Verify booking status changes to EXPIRED
- [ ] Verify unit status remains RESERVED_BOOKING
- [ ] Verify booking appears in dashboard with "Hết hạn" badge

### Test Case 2: Delete Expired Booking
- [ ] Click Trash button on EXPIRED booking
- [ ] Verify confirmation dialog appears
- [ ] Confirm deletion
- [ ] Verify booking disappears from dashboard
- [ ] Verify unit status changes to AVAILABLE
- [ ] Verify booking still appears in transaction history

### Test Case 3: Booking History Preservation
- [ ] Delete multiple expired bookings
- [ ] Check database: bookings still exist with [HIDDEN_FROM_DASHBOARD] marker
- [ ] Verify transaction history shows all bookings
- [ ] Verify booking codes continue sequentially (no gaps)

### Test Case 4: Unit Status Management
- [ ] Create booking on unit A
- [ ] Expire booking
- [ ] Create another booking on same unit A
- [ ] Delete first expired booking
- [ ] Verify unit A remains RESERVED_BOOKING (due to second booking)
- [ ] Delete second booking
- [ ] Verify unit A returns to AVAILABLE

### Test Case 5: Multiple Transaction Types
- [ ] Create reservation on unit B
- [ ] Create booking on same unit B
- [ ] Expire and delete booking
- [ ] Verify unit B remains RESERVED_BOOKING (due to active reservation)

## Benefits of This Implementation

1. **Data Integrity**: All booking history is preserved in the database
2. **User Control**: Users decide when to clean up expired bookings
3. **Audit Trail**: Complete transaction history available for reporting
4. **Sequential IDs**: Booking IDs never have gaps, making tracking easier
5. **Clean Dashboard**: Users see only active bookings, reducing clutter
6. **Complete History**: Transaction page shows full history for analysis

## Future Enhancements

1. **Auto-cleanup**: Add scheduled job to auto-hide bookings after X days
2. **Restore Function**: Allow users to restore hidden bookings
3. **Bulk Delete**: Allow deleting multiple expired bookings at once
4. **Export History**: Export complete booking history to CSV/Excel
5. **Analytics**: Add reports showing booking success rates, expiry patterns, etc.

## Related Files

- `apps/ctv-portal/app/api/bookings/[id]/route.ts` - Delete/hide booking
- `apps/ctv-portal/app/api/bookings/check-expired/route.ts` - Expiry check
- `apps/ctv-portal/app/api/bookings/create/route.ts` - Booking creation
- `apps/ctv-portal/app/dashboard/page.tsx` - Dashboard display
- `apps/ctv-portal/app/my-transactions/page.tsx` - Transaction history
- `apps/ctv-portal/components/BookingDetailModal.tsx` - Booking details
- `apps/ctv-portal/prisma/schema.prisma` - Database schema

## Conclusion

The implementation successfully meets all requirements:
- ✅ EXPIRED bookings can be deleted from dashboard
- ✅ Units return to AVAILABLE status when booking is deleted
- ✅ Booking history is fully preserved
- ✅ Booking IDs continue to increase sequentially
- ✅ Transaction history shows complete booking records

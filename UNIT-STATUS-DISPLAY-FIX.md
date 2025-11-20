# Unit Status Display Fix

## Issue
Units with EXPIRED bookings were showing as "Đang có đặt chỗ" (orange/yellow) instead of "Đang có booking" (blue) in the project management page.

## Requirement
- **"Đang có booking" (blue)** - for units with ANY booking (including EXPIRED) until user clicks Trash
- **"Đang có đặt chỗ" (orange/yellow)** - only for units with Reservations
- After user clicks Trash on EXPIRED booking → Unit returns to AVAILABLE (green)

## Solution
Updated the projects API to include EXPIRED bookings in the active bookings query.

### File Modified
`apps/ctv-portal/app/api/projects/route.ts`

### Change Made
```typescript
// BEFORE
bookings: {
    where: {
        status: {
            in: ['PENDING_APPROVAL', 'CONFIRMED', 'PENDING_PAYMENT']
        }
    },
    take: 1
}

// AFTER
bookings: {
    where: {
        status: {
            // Include EXPIRED bookings so they show as blue "Đang có booking"
            // until user clicks Trash button
            in: ['PENDING_APPROVAL', 'CONFIRMED', 'PENDING_PAYMENT', 'EXPIRED']
        }
    },
    take: 1
}
```

## Status Display Logic

### Unit Status Colors
| Status | Color | Label | When |
|--------|-------|-------|------|
| AVAILABLE | Green | "Đang mở bán" | No bookings/reservations |
| RESERVED_BOOKING + Booking | Blue | "Đang có booking" | Has CONFIRMED, PENDING, or EXPIRED booking |
| RESERVED_BOOKING + Reservation | Orange/Yellow | "Đang có đặt chỗ" | Has ACTIVE reservation |
| DEPOSITED | Purple | "Đã cọc tiền" | Has deposit |
| SOLD | Red | "Đã bán" | Sold |

### Flow for EXPIRED Bookings

```
1. Booking Created
   Unit Status: RESERVED_BOOKING
   Display: "Đang có booking" (blue) ✓

2. Booking Expires
   Unit Status: RESERVED_BOOKING (unchanged)
   Display: "Đang có booking" (blue) ✓
   Booking Status: EXPIRED

3. User Clicks Trash
   Unit Status: AVAILABLE
   Display: "Đang mở bán" (green) ✓
   Booking: Hidden from dashboard
```

## Testing

### Test Case 1: EXPIRED Booking Display
1. Unit T1-0104 has EXPIRED booking BK000005
2. Open project management page
3. **Expected**: Unit shows as blue "Đang có booking" ✓
4. **Not**: Orange/yellow "Đang có đặt chỗ"

### Test Case 2: After Trash Button
1. Go to dashboard
2. Click Trash on booking BK000005
3. Confirm deletion
4. Go back to project management
5. **Expected**: Unit T1-0104 shows as green "Đang mở bán" ✓

### Test Case 3: Reservation Display
1. Create reservation on unit T1-0106
2. Open project management page
3. **Expected**: Unit shows as orange/yellow "Đang có đặt chỗ" ✓

## Impact

### What Changed
- ✅ EXPIRED bookings now count as "active" for display purposes
- ✅ Units with EXPIRED bookings show as blue "Đang có booking"
- ✅ Orange/yellow "Đang có đặt chỗ" is reserved for Reservations only

### What Didn't Change
- ✅ Trash button functionality (still works the same)
- ✅ Unit returns to AVAILABLE after Trash click
- ✅ Booking history preservation
- ✅ Sequential booking IDs

## Verification

After this change:
1. Refresh the project management page
2. Unit T1-0104 should now show as blue "Đang có booking"
3. Click Trash button in dashboard
4. Unit T1-0104 should change to green "Đang mở bán"

---

**Status:** ✅ Fixed  
**Date:** November 20, 2025  
**Files Modified:** 1 (apps/ctv-portal/app/api/projects/route.ts)

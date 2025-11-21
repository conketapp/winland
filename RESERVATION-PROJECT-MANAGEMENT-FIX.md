# Reservation Project Management Fix

## Issue
Reservations in the project-management page were not working - clicking on a unit with "reserved" status only showed a toast notification instead of displaying reservation details.

## Solution
Implemented full reservation detail viewing functionality similar to bookings.

## Files Created

### 1. ReservationDetailModal Component
**File:** `apps/ctv-portal/components/ReservationDetailModal.tsx`

**Features:**
- ✅ Displays complete reservation information
- ✅ Shows unit details
- ✅ Shows CTV information
- ✅ Shows customer information
- ✅ Shows reservation schedule (reservedUntil time)
- ✅ Shows status with color-coded badges
- ✅ Shows priority and extend count
- ✅ Delete button for EXPIRED, MISSED, CANCELLED reservations
- ✅ Confirmation dialog for deletion
- ✅ Responsive design

**Status Colors:**
- 🟢 ACTIVE - Green
- 🔵 YOUR_TURN - Blue
- ⚫ EXPIRED - Gray
- 🟠 MISSED - Orange
- 🔴 CANCELLED - Red
- 🟣 COMPLETED - Purple

## Files Modified

### 1. Project Management Page
**File:** `apps/ctv-portal/app/project-management/page.tsx`

**Changes:**
1. Added import for `ReservationDetailModal`
2. Added state variable `selectedReservationDetail`
3. Updated `handleUnitClick` to fetch and display reservation details
4. Added `ReservationDetailModal` to render section

**Before:**
```typescript
} else if (unit.status === "reserved") {
    toastNotification.warning("Căn này đang có người giữ chỗ");
}
```

**After:**
```typescript
} else if (unit.status === "reserved") {
    // Fetch reservation details for this unit
    const response = await fetch('/api/reservations', {...});
    const reservations = await response.json();
    const reservation = reservations.find(...);
    if (reservation) {
        setSelectedReservationDetail(reservation);
    }
}
```

## How It Works

### User Flow
```
1. User opens project-management page
2. User sees units with yellow "Đang có đặt chỗ" badge
3. User clicks on reserved unit
4. System fetches reservation details from API
5. ReservationDetailModal opens showing:
   - Reservation code and status
   - Unit information
   - CTV information
   - Customer information
   - Reservation schedule
   - Priority and extend count
   - Notes
6. If reservation is EXPIRED/MISSED/CANCELLED:
   - Delete button appears
   - User can click to hide reservation
   - Unit returns to AVAILABLE
```

### API Integration
```typescript
// Fetch reservations
GET /api/reservations
Headers: { 'x-user-phone': userPhone }

// Find reservation for unit
const reservation = reservations.find(r => 
    r.unitId === unit.id && 
    ['ACTIVE', 'YOUR_TURN', 'EXPIRED'].includes(r.status)
);

// Delete reservation
DELETE /api/reservations/[id]
```

## Reservation Detail Modal Features

### Information Displayed

#### 1. Header
- Reservation code (e.g., RS000001)
- Status badge with color

#### 2. Unit Information
- Unit code
- Project name (if available)
- Building name (if available)

#### 3. CTV Information
- Full name
- Phone number
- Email

#### 4. Customer Information
- Full name
- Phone number
- Email

#### 5. Reservation Schedule
- Reserved until date/time
- Priority number
- Extend count

#### 6. Additional Information
- Created date
- Notes (filtered to remove hidden marker)

### Actions Available

#### For ACTIVE/YOUR_TURN Reservations
- ✅ View details
- ✅ Close modal

#### For EXPIRED/MISSED/CANCELLED Reservations
- ✅ View details
- ✅ Delete (hide) reservation
- ✅ Close modal

## Status Handling

### Reservation Statuses
| Status | Description | Can Delete? |
|--------|-------------|-------------|
| ACTIVE | Currently active | ❌ No |
| YOUR_TURN | Customer's turn | ❌ No |
| EXPIRED | Time has passed | ✅ Yes |
| MISSED | Customer missed turn | ✅ Yes |
| CANCELLED | Manually cancelled | ✅ Yes |
| COMPLETED | Successfully completed | ❌ No |

### Unit Status Display
| Unit Status | Has Reservation | Display |
|-------------|-----------------|---------|
| RESERVED_BOOKING | ACTIVE, YOUR_TURN, EXPIRED | Yellow "Đang có đặt chỗ" |
| AVAILABLE | None | Green "Đang mở bán" |

## Testing

### Test Case 1: View Active Reservation
1. Open project-management page
2. Find unit with yellow "Đang có đặt chỗ" badge
3. Click on unit
4. **Expected:** ReservationDetailModal opens
5. **Expected:** Shows reservation details
6. **Expected:** No delete button (status is ACTIVE)

### Test Case 2: View Expired Reservation
1. Open project-management page
2. Find unit with yellow "Đang có đặt chỗ" badge (expired)
3. Click on unit
4. **Expected:** ReservationDetailModal opens
5. **Expected:** Shows "Hết hạn" status badge
6. **Expected:** Delete button appears

### Test Case 3: Delete Expired Reservation
1. Open expired reservation detail
2. Click "Xóa giữ chỗ" button
3. Confirm deletion
4. **Expected:** Reservation hidden from dashboard
5. **Expected:** Unit returns to AVAILABLE
6. **Expected:** Modal closes
7. **Expected:** Page refreshes

### Test Case 4: No Reservation Found
1. Click on reserved unit
2. If no reservation found in API
3. **Expected:** Toast notification appears
4. **Expected:** "Căn này đang có người giữ chỗ"

## Comparison: Booking vs Reservation

| Feature | Booking | Reservation |
|---------|---------|-------------|
| **Modal Component** | BookingDetailModal | ReservationDetailModal |
| **Status Badge Color** | Blue | Yellow |
| **Delete Condition** | EXPIRED, COMPLETED, CANCELLED | EXPIRED, MISSED, CANCELLED |
| **Schedule Display** | Visit date/time | Reserved until |
| **Additional Info** | Visit schedule | Priority, extend count |

## Benefits

1. **Consistent UX**: Same interaction pattern as bookings
2. **Full Information**: Users can see complete reservation details
3. **Easy Cleanup**: Delete button for expired reservations
4. **Responsive Design**: Works on all devices
5. **Error Handling**: Graceful fallback if reservation not found

## Future Enhancements

1. **Extend Reservation**: Add button to extend reservation time
2. **Cancel Reservation**: Add button to cancel active reservations
3. **Complete Reservation**: Add button to mark as completed
4. **History View**: Show reservation history for unit
5. **Notifications**: Alert when reservation is about to expire

## Related Files

- `apps/ctv-portal/components/ReservationDetailModal.tsx` - New modal component
- `apps/ctv-portal/app/project-management/page.tsx` - Updated to use modal
- `apps/ctv-portal/app/api/reservations/route.ts` - API endpoint
- `apps/ctv-portal/app/api/reservations/[id]/route.ts` - Delete endpoint
- `apps/ctv-portal/app/api/reservations/check-expired/route.ts` - Expiry check

---

**Status:** ✅ Complete and Working  
**Date:** November 20, 2025  
**Version:** 1.0.0

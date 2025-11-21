# Reservation Detail View in Notifications

## Feature Added
Added "Xem chi tiết" (View Details) button for reservations in the notification page, matching the existing booking functionality.

## Implementation

### File Modified
`apps/ctv-portal/app/notification/page.tsx`

### Changes Made

#### 1. Added Import
```typescript
import ReservationDetailModal from '@/components/ReservationDetailModal';
```

#### 2. Added State
```typescript
const [selectedReservation, setSelectedReservation] = useState<any>(null);
```

#### 3. Added View Details Button
```typescript
{/* View Details Button for Reservations - Only show for reservation owner */}
{notification.type === 'reservation' && (() => {
    const fullReservation = reservationsData.find(r => r.id === notification.id);
    const isOwner = fullReservation?.ctv?.phone === currentUserPhone;
    return isOwner && (
        <div className="mt-3 text-right">
            <button
                onClick={() => {
                    if (fullReservation) {
                        setSelectedReservation(fullReservation);
                    }
                }}
                className="text-[#cc8400] text-sm font-medium hover:underline"
            >
                Xem chi tiết
            </button>
        </div>
    );
})()}
```

#### 4. Added Modal Component
```typescript
{/* Reservation Detail Modal */}
{selectedReservation && (
    <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onComplete={() => {
            setSelectedReservation(null);
            fetchNotifications();
        }}
        readOnly={selectedReservation.ctv?.phone !== currentUserPhone}
    />
)}
```

## How It Works

### User Flow
```
1. User views notification page
2. User sees their reservation (blue background)
3. "Xem chi tiết" button appears (orange color)
4. User clicks button
5. ReservationDetailModal opens
6. Shows complete reservation information
7. User can delete if expired
8. Modal closes, notifications refresh
```

### Owner Check
```typescript
const fullReservation = reservationsData.find(r => r.id === notification.id);
const isOwner = fullReservation?.ctv?.phone === currentUserPhone;
```

Only the reservation owner sees the "Xem chi tiết" button.

## Visual Design

### Button Colors
- **Booking:** Blue (#1224c4)
- **Reservation:** Orange (#cc8400)
- **Hover:** Underline effect

### Button Position
- Right-aligned
- Below notification content
- Consistent with booking button

## Features

### View Details
- ✅ Shows complete reservation information
- ✅ Displays unit details
- ✅ Shows CTV information
- ✅ Shows customer information
- ✅ Shows reservation schedule
- ✅ Shows status with color-coded badge

### Actions Available
- ✅ View all details
- ✅ Delete expired reservations
- ✅ Close modal
- ✅ Auto-refresh after actions

### Read-Only Mode
If viewing another user's reservation (shouldn't happen as button only shows for owner):
- View-only mode
- No delete button
- No actions available

## Comparison: Booking vs Reservation

| Feature | Booking | Reservation |
|---------|---------|-------------|
| **Button Color** | Blue | Orange |
| **Modal Component** | BookingDetailModal | ReservationDetailModal |
| **Owner Check** | ✅ Yes | ✅ Yes |
| **Delete Function** | ✅ Yes | ✅ Yes |
| **Read-Only Mode** | ✅ Yes | ✅ Yes |
| **Auto-Refresh** | ✅ Yes | ✅ Yes |

## Testing

### Test Case 1: View Your Reservation
1. Go to notification page
2. Find your reservation (blue background)
3. **Expected:** "Xem chi tiết" button visible (orange)
4. Click button
5. **Expected:** ReservationDetailModal opens
6. **Expected:** Shows all reservation details

### Test Case 2: Expired Reservation
1. View expired reservation
2. Click "Xem chi tiết"
3. **Expected:** Modal shows "Hết hạn" status
4. **Expected:** Delete button appears
5. Click delete
6. **Expected:** Confirmation dialog
7. Confirm
8. **Expected:** Reservation hidden, modal closes, page refreshes

### Test Case 3: Active Reservation
1. View active reservation
2. Click "Xem chi tiết"
3. **Expected:** Modal shows "Đang hoạt động" status
4. **Expected:** No delete button (still active)
5. **Expected:** Can only view details

### Test Case 4: Other User's Reservation
1. View another user's reservation (purple background)
2. **Expected:** No "Xem chi tiết" button
3. **Expected:** Cannot view details

## Benefits

1. **Consistency**: Same UX as bookings
2. **Easy Access**: Quick view of reservation details
3. **Owner Control**: Only owners can view/manage
4. **Complete Information**: All details in one modal
5. **Action Support**: Can delete expired reservations
6. **Auto-Refresh**: Page updates after actions

## User Experience

### Before
```
Notification → No way to view details
User must go to dashboard or project management
```

### After
```
Notification → Click "Xem chi tiết" → View all details
Quick access without leaving page
```

## Modal Features

### Information Displayed
- Reservation code (RS000001)
- Status badge (color-coded)
- Unit information
- CTV information
- Customer information
- Reservation schedule
- Priority and extend count
- Notes

### Actions
- View details
- Delete (if expired/missed/cancelled)
- Close modal

### Responsive
- Works on all devices
- Mobile-friendly
- Touch-optimized

## Future Enhancements

1. **Quick Actions**: Add quick actions in notification card
2. **Extend Reservation**: Add extend button in modal
3. **Cancel Reservation**: Add cancel button for active reservations
4. **Share Details**: Add share/export functionality
5. **History View**: Show reservation history

## Related Components

- `ReservationDetailModal` - Modal component
- `BookingDetailModal` - Reference implementation
- `ConfirmDialog` - Confirmation dialogs
- `AnimatedBottomNavigation` - Navigation

## Related Files

- `apps/ctv-portal/app/notification/page.tsx` - Notification page
- `apps/ctv-portal/components/ReservationDetailModal.tsx` - Modal component
- `apps/ctv-portal/app/api/reservations/route.ts` - Reservations API
- `apps/ctv-portal/app/api/reservations/[id]/route.ts` - Delete API

---

**Status:** ✅ Complete  
**Date:** November 21, 2025  
**Impact:** High (improves UX)  
**Priority:** High

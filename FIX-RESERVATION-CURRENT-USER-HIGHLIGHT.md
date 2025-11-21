# Fix Reservation Current User Highlight

## Issue
Reservations created by the current user were not showing with a blue background in the notification page, unlike bookings which highlight the current user's transactions.

## Solution
Added the same current user detection logic for reservations as exists for bookings.

## File Modified

### `apps/ctv-portal/app/notification/page.tsx`

**Changes:**
1. Added `reservationsData` state to store full reservation data
2. Set `reservationsData` when fetching notifications
3. Updated `isCurrentUser` logic to check reservations

**Before:**
```typescript
// Only checked bookings
if (notification.type === 'booking') {
    const fullBooking = bookingsData.find(b => b.id === notification.id);
    isCurrentUser = fullBooking?.ctv?.phone === currentUserPhone;
}
```

**After:**
```typescript
// Checks both bookings and reservations
if (notification.type === 'booking') {
    const fullBooking = bookingsData.find(b => b.id === notification.id);
    isCurrentUser = fullBooking?.ctv?.phone === currentUserPhone;
} else if (notification.type === 'reservation') {
    const fullReservation = reservationsData.find(r => r.id === notification.id);
    isCurrentUser = fullReservation?.ctv?.phone === currentUserPhone;
}
```

## How It Works

### Current User Detection
```typescript
// 1. Store current user's phone
const currentUserPhone = sessionStorage.getItem('login:userPhone');

// 2. Store full reservation data
setReservationsData(reservations);

// 3. Check if reservation belongs to current user
const fullReservation = reservationsData.find(r => r.id === notification.id);
const isCurrentUser = fullReservation?.ctv?.phone === currentUserPhone;
```

### Visual Styling
```typescript
// If current user's reservation
<div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300">
    <User className="text-blue-600" />
    <span className="text-blue-700">CTV: Your Name</span>
</div>

// If other user's reservation
<div className="bg-purple-50 dark:bg-purple-900/20">
    <User className="text-purple-600" />
    <span className="text-purple-700">CTV: Other Name</span>
</div>
```

## Visual Comparison

### Before Fix
```
┌─────────────────────────────────────┐
│ Giữ chỗ - Đang hoạt động           │
│ Mã: RS000001                       │
│ 👤 CTV: Your Name (purple)         │ ← Purple for all
│ Tran Thi A • 0946567234           │
└─────────────────────────────────────┘
```

### After Fix
```
┌─────────────────────────────────────┐
│ Giữ chỗ - Đang hoạt động           │
│ Mã: RS000001                       │
│ 👤 CTV: Your Name (blue)           │ ← Blue for current user
│ Tran Thi A • 0946567234           │
└─────────────────────────────────────┘
```

## Color Scheme

### Current User (Your Transactions)
- **Background:** Blue (bg-blue-50)
- **Border:** Blue (border-blue-300)
- **Icon:** Blue (text-blue-600)
- **Text:** Blue (text-blue-700)

### Other Users (Their Transactions)
- **Background:** Purple (bg-purple-50)
- **Border:** None
- **Icon:** Purple (text-purple-600)
- **Text:** Purple (text-purple-700)

## Transaction Type Colors

| Type | Current User | Other Users |
|------|-------------|-------------|
| Booking | Blue | Purple |
| Reservation | Blue | Purple |
| Deposit | Blue | Purple |

## Benefits

1. **Consistency**: Reservations now match booking behavior
2. **Visual Clarity**: Easy to identify your own transactions
3. **Better UX**: Quick visual distinction between your work and others'
4. **Complete Feature**: All transaction types now support user highlighting

## Testing

### Test Case 1: Your Reservation
1. Create a reservation
2. Go to notification page
3. **Expected:** Reservation shows with blue background
4. **Expected:** CTV name in blue color

### Test Case 2: Other User's Reservation
1. View reservation created by another CTV
2. **Expected:** Reservation shows with purple background
3. **Expected:** CTV name in purple color

### Test Case 3: Mixed Notifications
1. View page with multiple reservations
2. **Expected:** Your reservations in blue
3. **Expected:** Others' reservations in purple
4. **Expected:** Clear visual distinction

### Test Case 4: Booking Comparison
1. View both bookings and reservations
2. **Expected:** Your bookings in blue
3. **Expected:** Your reservations in blue
4. **Expected:** Consistent styling across types

## Implementation Details

### State Management
```typescript
// Store full data for user checking
const [bookingsData, setBookingsData] = useState<any[]>([]);
const [reservationsData, setReservationsData] = useState<any[]>([]);
const [currentUserPhone, setCurrentUserPhone] = useState<string>('');
```

### Data Flow
```
1. Fetch reservations from API
   ↓
2. Store in reservationsData state
   ↓
3. For each notification:
   - Find full reservation data
   - Compare CTV phone with current user
   - Set isCurrentUser flag
   ↓
4. Apply conditional styling based on isCurrentUser
```

### Performance
- Uses `Array.find()` for O(n) lookup
- Minimal performance impact
- Data already loaded in memory
- No additional API calls needed

## Future Enhancements

1. **Deposits**: Add same logic for deposits
2. **Color Customization**: Allow users to choose highlight color
3. **Team View**: Highlight team members differently
4. **Filter by User**: Quick filter to show only your transactions
5. **Statistics**: Show count of your vs others' transactions

## Related Files

- `apps/ctv-portal/app/notification/page.tsx` - Notification display
- `apps/ctv-portal/app/api/reservations/route.ts` - Reservations API
- `apps/ctv-portal/app/api/bookings/all/route.ts` - Bookings API

---

**Status:** ✅ Fixed  
**Date:** November 21, 2025  
**Impact:** Medium (improves UX)  
**Priority:** Medium

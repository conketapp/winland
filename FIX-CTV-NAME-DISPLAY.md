# Fix CTV Name Display in Notifications

## Issue
CTV name showing as "N/A" in the notification page for reservations.

## Root Cause
The reservations API (`/api/reservations`) was not including the `ctv` relation when fetching reservations, so the CTV information was not available in the response.

## Solution
Updated the reservations API to include the CTV relation with selected fields.

## File Modified

### `apps/ctv-portal/app/api/reservations/route.ts`

**Before:**
```typescript
include: {
    unit: {
        select: {
            code: true,
            unitNumber: true
        }
    }
}
```

**After:**
```typescript
include: {
    unit: {
        select: {
            code: true,
            unitNumber: true
        }
    },
    ctv: {
        select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
        }
    }
}
```

## How It Works

### API Response Structure
```json
{
    "id": "uuid",
    "code": "RS000001",
    "status": "ACTIVE",
    "customerName": "Tran Thi A",
    "customerPhone": "0946567234",
    "unit": {
        "code": "T1-0104",
        "unitNumber": "0104"
    },
    "ctv": {
        "id": "uuid",
        "fullName": "Nguyen Van B",
        "phone": "0901234567",
        "email": "ctv@example.com"
    },
    "createdAt": "2025-11-21T...",
    "reservedUntil": "2025-11-28T..."
}
```

### Notification Page Display
```typescript
const notifications = reservations.map(r => ({
    type: 'reservation',
    code: r.code,
    customerName: r.customerName,
    ctvName: r.ctv?.fullName || 'N/A',  // Now will show actual name
    unitCode: r.unit?.code || 'N/A',
    status: r.status,
    createdAt: r.createdAt
}))
```

## Expected Result

After this fix, the notification will show:
```
Giữ chỗ - Đang hoạt động
Mã: RS000001
CTV: Nguyen Van B  ← Instead of "N/A"
Tran Thi A • 0946567234
Căn hộ: T1-0104
```

## Testing

### Test Case 1: View Notification
1. Navigate to notification page
2. Look at reservation notification
3. **Expected:** CTV name displays correctly
4. **Expected:** No "N/A" for CTV field

### Test Case 2: API Response
```bash
curl -H "x-user-phone: YOUR_PHONE" http://localhost:3000/api/reservations
```

**Expected Response:**
```json
[
    {
        "code": "RS000001",
        "ctv": {
            "fullName": "Nguyen Van B"
        }
    }
]
```

### Test Case 3: Multiple Reservations
1. Create multiple reservations
2. Check notification page
3. **Expected:** All show correct CTV names

## Related Issues

This same pattern should be applied to:
- ✅ Bookings API - Already includes CTV
- ✅ Deposits API - Already includes CTV
- ✅ Reservations API - Now fixed

## Benefits

1. **Complete Information**: Users can see who created the reservation
2. **Better Tracking**: Easier to track which CTV made which reservation
3. **Consistency**: All transaction types now show CTV information
4. **User Experience**: No more confusing "N/A" labels

## Prevention

When creating new API endpoints that return transactions, always include:
```typescript
include: {
    ctv: {
        select: {
            id: true,
            fullName: true,
            phone: true,
            email: true
        }
    }
}
```

## Additional Notes

The notification page was already set up to display the CTV name correctly using `r.ctv?.fullName || 'N/A'`. The issue was simply that the API wasn't providing the data.

This is a common pattern in Prisma where you need to explicitly include relations in your queries.

---

**Status:** ✅ Fixed  
**Date:** November 21, 2025  
**Impact:** Low (cosmetic issue)  
**Priority:** Medium

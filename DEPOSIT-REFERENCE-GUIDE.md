# Deposit Implementation Reference Guide

## 📋 Quick Reference

This document provides a complete reference for understanding how Deposit functionality should work, based on the existing Booking and Reservation implementations.

## 🔍 Key Finding

**DepositModal.tsx currently has a MOCK implementation** - it only shows a success toast without creating a database record. This needs to be fixed to match Booking and Reservation functionality.

## 📁 Related Files

### Components
1. **`apps/ctv-portal/components/DepositModal.tsx`** ⚠️ NEEDS FIX
   - Current: Mock implementation (lines 396-400)
   - Required: Full API integration like BookingModal

2. **`apps/ctv-portal/components/BookingModal.tsx`** ✅ REFERENCE
   - Complete implementation with API integration
   - Shows correct pattern for form submission
   - Lines 532-544: Submit button handler

3. **`apps/ctv-portal/components/ReservedModal.tsx`** ✅ REFERENCE
   - Complete implementation for reservations
   - Similar pattern to BookingModal

4. **`apps/ctv-portal/components/BookingDetailModal.tsx`** ✅ REFERENCE
   - Shows how to display booking details
   - Complete/Cancel/Delete functionality

5. **`apps/ctv-portal/components/ReservationDetailModal.tsx`** ✅ REFERENCE
   - Shows how to display reservation details
   - Similar structure to BookingDetailModal

### Pages

6. **`apps/ctv-portal/app/dashboard/page.tsx`** ✅ DISPLAYS DEPOSITS
   - Lines 95-100: Fetches deposits from API
   - Lines 650-700: Displays deposit list
   - Already has section for deposits

7. **`apps/ctv-portal/app/notification/page.tsx`** ✅ DISPLAYS DEPOSITS
   - Lines 104-108: Fetches deposits from API
   - Lines 130-140: Maps deposits to notifications
   - Shows deposits alongside bookings and reservations

8. **`apps/ctv-portal/app/my-transactions/page.tsx`** ✅ DISPLAYS DEPOSITS
   - Lines 105-109: Fetches deposits from API
   - Lines 120-130: Maps deposits with commission calculation
   - Shows complete transaction history

### API Endpoints

9. **`apps/ctv-portal/app/api/deposits/route.ts`** ✅ EXISTS
   - GET endpoint to fetch user's deposits
   - Already working correctly

10. **`apps/ctv-portal/app/api/deposits/create/route.ts`** ❌ MISSING
    - **This file needs to be created**
    - Should follow pattern from bookings/create

11. **`apps/ctv-portal/app/api/bookings/create/route.ts`** ✅ REFERENCE
    - Complete implementation for booking creation
    - Shows correct pattern for:
      - Sequential code generation
      - Database record creation
      - Unit status update
      - Error handling

### Database Schema

12. **`apps/ctv-portal/prisma/schema.prisma`** ✅ COMPLETE
    - Deposit model already defined (lines 230-260)
    - All required fields present
    - Relations configured correctly

### Documentation

13. **`DEPOSIT-IMPLEMENTATION-ANALYSIS.md`** 📖 THIS DOCUMENT
    - Complete analysis of current state
    - Required implementation details
    - Code examples and testing plan

14. **`BOOKING-FLOW-DIAGRAM.md`** 📖 REFERENCE
    - Shows complete booking lifecycle
    - Expiry and deletion flow
    - Multi-transaction safety checks

15. **`RESERVATION-COMPLETE-IMPLEMENTATION.md`** 📖 REFERENCE
    - Shows reservation feature parity with bookings
    - Complete implementation checklist
    - Testing and validation

16. **`RESERVATION-EXPIRY-IMPLEMENTATION.md`** 📖 REFERENCE
    - Expiry detection and handling
    - Status transitions
    - History preservation

17. **`FIX-DEPOSITS-API-ERROR.md`** 📖 TROUBLESHOOTING
    - Common API errors and solutions
    - Prisma client regeneration steps

## 🔄 How Booking Works (Reference Pattern)

### 1. User Interaction
```
User fills form → Clicks "Xác nhận" → BookingModal handles submission
```

### 2. BookingModal Submit Handler
```typescript
// apps/ctv-portal/components/BookingModal.tsx (lines 532-544)
onClick={async () => {
    setIsSubmitting(true);
    try {
        // 1. Get user authentication
        const userPhone = sessionStorage.getItem('login:userPhone');
        const userResponse = await fetch('/api/user/me', {
            headers: { 'x-user-phone': userPhone }
        });
        const userData = await userResponse.json();

        // 2. Create booking via API
        const response = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                unitId: unit.id,
                ctvId: userData.id,
                customerName: BookingForm.name,
                customerPhone: BookingForm.phone,
                customerEmail: BookingForm.email,
                visitDate: BookingForm.date,
                startTime: BookingForm.startTime,
                endTime: BookingForm.endTime
            }),
        });

        // 3. Handle response
        if (response.ok) {
            toastNotification.success("Booking đã được xác nhận thành công!");
            onClose();
            window.location.reload();
        } else {
            toastNotification.error(data.error || 'Đã xảy ra lỗi');
        }
    } catch (error) {
        toastNotification.error('Đã xảy ra lỗi khi tạo booking');
    } finally {
        setIsSubmitting(false);
    }
}}
```

### 3. API Endpoint
```typescript
// apps/ctv-portal/app/api/bookings/create/route.ts
export async function POST(request: NextRequest) {
    // 1. Parse request body
    const body = await request.json();
    
    // 2. Validate data
    if (!unitId || !ctvId || !customerName) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    // 3. Generate sequential code
    const bookingCount = await prisma.booking.count();
    const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`;
    
    // 4. Create database record
    const booking = await prisma.booking.create({
        data: {
            code: bookingCode,
            unitId,
            ctvId,
            customerName,
            customerPhone,
            customerEmail,
            status: 'CONFIRMED',
            // ... other fields
        }
    });
    
    // 5. Update unit status
    await prisma.unit.update({
        where: { id: unitId },
        data: { status: 'RESERVED_BOOKING' }
    });
    
    // 6. Return success
    return NextResponse.json({ success: true, booking });
}
```

### 4. Database State
```
Booking Table:
  - id: uuid
  - code: BK000001 (sequential)
  - status: CONFIRMED
  - customerName, customerPhone, etc.
  - createdAt: timestamp

Unit Table:
  - status: RESERVED_BOOKING (updated)
```

### 5. Display in Pages
```
Dashboard → Shows in booking list
Notification → Shows in notification feed
My Transactions → Shows in transaction history
```

## ⚠️ How Deposit Currently Works (BROKEN)

### 1. User Interaction
```
User fills form → Clicks "Thanh toán" → DepositModal shows toast → Modal closes
```

### 2. DepositModal Submit Handler (CURRENT - BROKEN)
```typescript
// apps/ctv-portal/components/DepositModal.tsx (lines 396-400)
onClick={() => {
    toastNotification.success("Đặt cọc đã được xác nhận thành công!");
    onClose();
}}
```

### 3. What Happens
```
❌ No API call
❌ No database record
❌ No unit status update
❌ No sequential code
❌ Data is lost
```

### 4. Database State
```
Deposit Table: EMPTY (no record created)
Unit Table: status unchanged
```

### 5. Display in Pages
```
Dashboard → Shows empty list (no deposits)
Notification → Shows empty list (no deposits)
My Transactions → Shows empty list (no deposits)
```

## ✅ How Deposit Should Work (REQUIRED)

### 1. User Interaction
```
User fills form → Clicks "Thanh toán" → DepositModal calls API → Success
```

### 2. DepositModal Submit Handler (REQUIRED)
```typescript
// apps/ctv-portal/components/DepositModal.tsx (NEEDS TO BE UPDATED)
const [isSubmitting, setIsSubmitting] = useState(false);

onClick={async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
        // 1. Get user authentication
        const userPhone = sessionStorage.getItem('login:userPhone');
        const userResponse = await fetch('/api/user/me', {
            headers: { 'x-user-phone': userPhone }
        });
        const userData = await userResponse.json();

        // 2. Create deposit via API
        const response = await fetch('/api/deposits/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                unitId: unit.id,
                ctvId: userData.id,
                customerName: form.name,
                customerPhone: form.phone,
                customerEmail: form.email,
                customerIdCard: form.id,
                customerAddress: form.address,
                depositAmount: unit.depositMoney || (unit.price * 0.1),
                depositPercentage: 10,
            }),
        });

        // 3. Handle response
        const data = await response.json();
        if (response.ok) {
            toastNotification.success("Đặt cọc đã được xác nhận thành công!");
            onClose();
            window.location.reload();
        } else {
            toastNotification.error(data.error || 'Đã xảy ra lỗi');
        }
    } catch (error) {
        toastNotification.error('Đã xảy ra lỗi khi tạo đặt cọc');
    } finally {
        setIsSubmitting(false);
    }
}}
```

### 3. API Endpoint (NEEDS TO BE CREATED)
```typescript
// apps/ctv-portal/app/api/deposits/create/route.ts (NEW FILE)
export async function POST(request: NextRequest) {
    // 1. Parse request body
    const body = await request.json();
    
    // 2. Validate data
    if (!unitId || !ctvId || !customerName || !customerIdCard) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    // 3. Generate sequential code
    const depositCount = await prisma.deposit.count();
    const depositCode = `DP${String(depositCount + 1).padStart(6, '0')}`;
    
    // 4. Create database record
    const deposit = await prisma.deposit.create({
        data: {
            code: depositCode,
            unitId,
            ctvId,
            customerName,
            customerPhone,
            customerEmail,
            customerIdCard,
            customerAddress,
            depositAmount,
            depositPercentage,
            depositDate: new Date(),
            status: 'PENDING_APPROVAL',
            paymentMethod: 'BANK_TRANSFER'
        }
    });
    
    // 5. Update unit status
    await prisma.unit.update({
        where: { id: unitId },
        data: { status: 'DEPOSITED' }
    });
    
    // 6. Return success
    return NextResponse.json({ success: true, deposit });
}
```

### 4. Database State
```
Deposit Table:
  - id: uuid
  - code: DP000001 (sequential)
  - status: PENDING_APPROVAL
  - customerName, customerPhone, customerIdCard, etc.
  - depositAmount: calculated value
  - createdAt: timestamp

Unit Table:
  - status: DEPOSITED (updated)
```

### 5. Display in Pages
```
Dashboard → Shows in deposit list with code DP000001
Notification → Shows in notification feed
My Transactions → Shows with commission calculation (2%)
```

## 📊 Feature Comparison

| Feature | Booking | Reservation | Deposit (Current) | Deposit (Required) |
|---------|---------|-------------|-------------------|-------------------|
| **Form Component** | BookingModal.tsx | ReservedModal.tsx | DepositModal.tsx | DepositModal.tsx |
| **API Endpoint** | /api/bookings/create | /api/reservations/create | ❌ Missing | /api/deposits/create |
| **Sequential Code** | BK000001 | RS000001 | ❌ No | DP000001 |
| **Unit Status** | RESERVED_BOOKING | RESERVED_BOOKING | ❌ No change | DEPOSITED |
| **Database Record** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Loading State** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Error Handling** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Page Reload** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Dashboard Display** | ✅ Yes | ✅ Yes | ✅ Yes (empty) | ✅ Yes (with data) |
| **Notification Display** | ✅ Yes | ✅ Yes | ✅ Yes (empty) | ✅ Yes (with data) |
| **Transaction History** | ✅ Yes | ✅ Yes | ✅ Yes (empty) | ✅ Yes (with data) |

## 🎯 Implementation Steps

### Step 1: Create API Endpoint
1. Create file: `apps/ctv-portal/app/api/deposits/create/route.ts`
2. Copy pattern from `apps/ctv-portal/app/api/bookings/create/route.ts`
3. Adjust for deposit-specific fields
4. Test with curl or Postman

### Step 2: Update DepositModal
1. Open: `apps/ctv-portal/components/DepositModal.tsx`
2. Add `isSubmitting` state
3. Replace onClick handler (lines 396-400)
4. Add loading state to button text
5. Add error handling

### Step 3: Test End-to-End
1. Fill deposit form
2. Click "Thanh toán"
3. Verify API call in Network tab
4. Check database for new record
5. Verify unit status changed
6. Check dashboard displays deposit
7. Check notification page shows deposit
8. Check transaction history shows deposit

### Step 4: Verify Sequential Codes
1. Create first deposit → DP000001
2. Create second deposit → DP000002
3. Create third deposit → DP000003
4. Verify no gaps in sequence

## 🔧 Troubleshooting

### Issue: API returns 500 error
**Solution:** See `FIX-DEPOSITS-API-ERROR.md`
- Regenerate Prisma client: `npx prisma generate`
- Restart dev server

### Issue: Unit status not updating
**Solution:** Check API endpoint updates unit after creating deposit
```typescript
await prisma.unit.update({
    where: { id: unitId },
    data: { status: 'DEPOSITED' }
});
```

### Issue: Deposit not showing in dashboard
**Solution:** Check if dashboard filters out hidden deposits
- Dashboard should show all deposits with status PENDING_APPROVAL, CONFIRMED
- Check `apps/ctv-portal/app/dashboard/page.tsx` lines 650-700

### Issue: Sequential codes have gaps
**Solution:** Use count() instead of findMany().length
```typescript
const depositCount = await prisma.deposit.count(); // Correct
const depositCode = `DP${String(depositCount + 1).padStart(6, '0')}`;
```

## 📝 Testing Checklist

### ✅ Form Validation
- [ ] Name required
- [ ] Phone number validation (Vietnamese format)
- [ ] CCCD validation (12 digits)
- [ ] Address required
- [ ] Email required
- [ ] Agreement checkbox required

### ✅ API Integration
- [ ] API endpoint exists
- [ ] Request body correct
- [ ] Response handling correct
- [ ] Error handling works
- [ ] Loading state shows

### ✅ Database Operations
- [ ] Deposit record created
- [ ] Sequential code generated
- [ ] Unit status updated
- [ ] All fields saved correctly

### ✅ Display in Pages
- [ ] Dashboard shows deposit
- [ ] Notification shows deposit
- [ ] Transaction history shows deposit
- [ ] All information correct

### ✅ User Experience
- [ ] Success toast shows
- [ ] Modal closes
- [ ] Page reloads
- [ ] Unit status updates visually
- [ ] No errors in console

## 📚 Additional Resources

### Code References
- **Booking Implementation:** `apps/ctv-portal/components/BookingModal.tsx`
- **Reservation Implementation:** `apps/ctv-portal/components/ReservedModal.tsx`
- **API Pattern:** `apps/ctv-portal/app/api/bookings/create/route.ts`
- **Database Schema:** `apps/ctv-portal/prisma/schema.prisma`

### Documentation
- **Complete Analysis:** `DEPOSIT-IMPLEMENTATION-ANALYSIS.md`
- **Booking Flow:** `BOOKING-FLOW-DIAGRAM.md`
- **Reservation Features:** `RESERVATION-COMPLETE-IMPLEMENTATION.md`
- **Troubleshooting:** `FIX-DEPOSITS-API-ERROR.md`

### Database
- **Deposit Model:** Lines 230-260 in `prisma/schema.prisma`
- **Unit Status Enum:** Lines 450-455 in `prisma/schema.prisma`
- **Deposit Status Enum:** Lines 470-476 in `prisma/schema.prisma`

## 🎓 Key Learnings

### 1. Consistency is Critical
All transaction types (Booking, Reservation, Deposit) should follow the same pattern:
- Form validation
- API integration
- Loading states
- Error handling
- Database operations
- Unit status updates
- Page display

### 2. Sequential IDs Matter
Use `count()` to generate sequential codes:
```typescript
const count = await prisma.deposit.count();
const code = `DP${String(count + 1).padStart(6, '0')}`;
```

### 3. Unit Status Priority
```
SOLD > DEPOSITED > RESERVED_BOOKING > AVAILABLE
```

### 4. Data Preservation
Never delete records, use markers:
- `[HIDDEN_FROM_DASHBOARD]` for soft delete
- Preserve status for audit trail
- Keep all relationships intact

### 5. User Experience
- Show loading states
- Handle errors gracefully
- Provide clear feedback
- Reload to show changes

## 🚀 Next Steps

1. **Immediate:** Fix DepositModal API integration
2. **Short-term:** Add DepositDetailModal (like BookingDetailModal)
3. **Medium-term:** Add deposit expiry and cancellation
4. **Long-term:** Add payment schedule and tracking

---

**Document Version:** 1.0.0  
**Last Updated:** November 22, 2025  
**Status:** ⚠️ Critical Issue Identified  
**Priority:** High - Deposits not being saved to database

# Deposit Implementation Analysis

## Current Status: ⚠️ INCOMPLETE - Missing API Integration

## Problem Summary

The **DepositModal.tsx** component currently has a **mock implementation** that only shows a success toast notification without actually creating a deposit record in the database. This is inconsistent with how Booking and Reservation work.

## Current Implementation (DepositModal.tsx)

### Submit Button Handler (Lines 396-400)
```typescript
<button
    disabled={!isFormValid()}
    onClick={() => {
        toastNotification.success("Đặt cọc đã được xác nhận thành công!");
        onClose();
    }}
    className={`w-full py-3.5 rounded-xl font-semibold text-white text-base transition ${
        isFormValid()
            ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            : "bg-gray-300 cursor-not-allowed"
    }`}
>
    Thanh toán - {formatCurrency(unit.depositMoney || (unit.price * 0.1), { style: 'standard', locale: 'en-US' })}
</button>
```

### Issues with Current Implementation
1. ❌ **No API call** - Just shows toast and closes modal
2. ❌ **No database record** - Deposit is not saved
3. ❌ **No unit status update** - Unit remains in current status
4. ❌ **No sequential code generation** - No DP000001, DP000002, etc.
5. ❌ **No loading state** - No feedback during submission
6. ❌ **No error handling** - Cannot handle API failures
7. ❌ **No data persistence** - Deposit disappears after page refresh

## Comparison with Booking and Reservation

### BookingModal.tsx (Correct Implementation)
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

<Button
    disabled={!isFormValid() || isSubmitting}
    onClick={async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Get user ID from session
            const userPhone = sessionStorage.getItem('login:userPhone');
            if (!userPhone) {
                toastNotification.error('Vui lòng đăng nhập lại');
                return;
            }

            // Get user info
            const userResponse = await fetch('/api/user/me', {
                headers: { 'x-user-phone': userPhone }
            });
            if (!userResponse.ok) {
                throw new Error('Không thể lấy thông tin người dùng');
            }
            const userData = await userResponse.json();

            // Create booking
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

            const data = await response.json();

            if (response.ok) {
                toastNotification.success("Booking đã được xác nhận thành công!");
                onClose();
                window.location.reload();
            } else {
                toastNotification.error(data.error || 'Đã xảy ra lỗi khi tạo booking');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toastNotification.error('Đã xảy ra lỗi khi tạo booking');
        } finally {
            setIsSubmitting(false);
        }
    }}
>
    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
</Button>
```

### ReservedModal.tsx (Correct Implementation)
Similar pattern with:
- ✅ Loading state management
- ✅ User authentication check
- ✅ API call to `/api/reservations/create`
- ✅ Proper error handling
- ✅ Success/error notifications
- ✅ Page reload on success

## Required Implementation for DepositModal

### 1. Add State Management
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 2. Update Submit Button Handler
```typescript
<button
    disabled={!isFormValid() || isSubmitting}
    onClick={async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Get user ID from session
            const userPhone = sessionStorage.getItem('login:userPhone');
            if (!userPhone) {
                toastNotification.error('Vui lòng đăng nhập lại');
                return;
            }

            // Get user info
            const userResponse = await fetch('/api/user/me', {
                headers: { 'x-user-phone': userPhone }
            });
            if (!userResponse.ok) {
                throw new Error('Không thể lấy thông tin người dùng');
            }
            const userData = await userResponse.json();

            // Create deposit
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
                    depositPercentage: 10, // 10% default
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toastNotification.success("Đặt cọc đã được xác nhận thành công!");
                onClose();
                window.location.reload();
            } else {
                toastNotification.error(data.error || 'Đã xảy ra lỗi khi tạo đặt cọc');
            }
        } catch (error) {
            console.error('Deposit error:', error);
            toastNotification.error('Đã xảy ra lỗi khi tạo đặt cọc');
        } finally {
            setIsSubmitting(false);
        }
    }}
    className={`w-full py-3.5 rounded-xl font-semibold text-white text-base transition ${
        isFormValid() && !isSubmitting
            ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            : "bg-gray-300 cursor-not-allowed"
    }`}
>
    {isSubmitting ? 'Đang xử lý...' : `Thanh toán - ${formatCurrency(unit.depositMoney || (unit.price * 0.1), { style: 'standard', locale: 'en-US' })}`}
</button>
```

### 3. Create Deposit API Endpoint

**File:** `apps/ctv-portal/app/api/deposits/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            unitId,
            ctvId,
            customerName,
            customerPhone,
            customerEmail,
            customerIdCard,
            customerAddress,
            depositAmount,
            depositPercentage
        } = body

        // Validate required fields
        if (!unitId || !ctvId || !customerName || !customerPhone || !customerIdCard || !customerAddress) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Check if unit exists and is available
        const unit = await prisma.unit.findUnique({
            where: { id: unitId }
        })

        if (!unit) {
            return NextResponse.json(
                { error: 'Không tìm thấy căn hộ' },
                { status: 404 }
            )
        }

        // Generate sequential deposit code
        const depositCount = await prisma.deposit.count()
        const depositCode = `DP${String(depositCount + 1).padStart(6, '0')}`

        // Create deposit
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
                depositAmount: depositAmount || unit.price * 0.1,
                depositPercentage: depositPercentage || 10,
                depositDate: new Date(),
                status: 'PENDING_APPROVAL',
                paymentMethod: 'BANK_TRANSFER'
            },
            include: {
                unit: {
                    select: {
                        code: true,
                        unitNumber: true
                    }
                },
                ctv: {
                    select: {
                        fullName: true,
                        phone: true
                    }
                }
            }
        })

        // Update unit status to DEPOSITED
        await prisma.unit.update({
            where: { id: unitId },
            data: { status: 'DEPOSITED' }
        })

        return NextResponse.json({
            success: true,
            deposit
        })

    } catch (error) {
        console.error('Create deposit error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi tạo đặt cọc' },
            { status: 500 }
        )
    }
}
```

## Database Schema (Already Exists)

The Deposit model is already defined in `prisma/schema.prisma`:

```prisma
model Deposit {
  id                String            @id @default(uuid())
  code              String            @unique
  unitId            String            @map("unit_id")
  ctvId             String            @map("ctv_id")
  customerName      String            @map("customer_name")
  customerPhone     String            @map("customer_phone")
  customerEmail     String?           @map("customer_email")
  customerIdCard    String            @map("customer_id_card")
  customerAddress   String            @map("customer_address")
  depositAmount     Float             @map("deposit_amount")
  depositPercentage Float             @map("deposit_percentage")
  depositDate       DateTime          @map("deposit_date")
  paymentMethod     String            @default("BANK_TRANSFER") @map("payment_method")
  paymentProof      String?           @map("payment_proof")
  contractUrl       String?           @map("contract_url")
  status            DepositStatus     @default(PENDING_APPROVAL)
  approvedBy        String?           @map("approved_by")
  approvedAt        DateTime?         @map("approved_at")
  cancelledBy       String?           @map("cancelled_by")
  cancelledReason   String?           @map("cancelled_reason")
  refundAmount      Float?            @map("refund_amount")
  notes             String?
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")
  // Relations...
}

enum DepositStatus {
  PENDING_APPROVAL
  CONFIRMED
  OVERDUE
  CANCELLED
  COMPLETED
}
```

## Expected Flow After Implementation

### 1. User Fills Deposit Form
- Name, Phone, CCCD, Address, Email
- All validations pass
- Agreement checkbox checked

### 2. User Clicks "Thanh toán" Button
- Button shows "Đang xử lý..."
- Button is disabled during submission

### 3. API Call to Create Deposit
- POST `/api/deposits/create`
- Sends customer information
- Sends unit and CTV IDs
- Calculates deposit amount (10% of unit price)

### 4. Database Operations
- Generate sequential code: DP000001, DP000002, etc.
- Create deposit record with status PENDING_APPROVAL
- Update unit status to DEPOSITED

### 5. Success Response
- Show success toast notification
- Close modal
- Reload page to show updated unit status

### 6. Display in Dashboard
- Deposit appears in "Danh sách hợp đồng đang trong quá trình đặt cọc"
- Shows deposit code, customer name, amount, date
- Status badge: "Đang Chờ duyệt"

### 7. Display in Notification Page
- Deposit appears in notification list
- Can filter by "Cọc" type
- Shows complete deposit information

### 8. Display in My Transactions
- Deposit appears in transaction history
- Shows deposit amount and commission (2%)
- Can search and filter

## Pages That Display Deposits

### 1. Dashboard (`/dashboard`)
```typescript
// Already fetches deposits
const depositsRes = await fetch('/api/deposits', {
    headers: { 'x-user-phone': userPhone },
    cache: 'no-store'
});

// Displays in "Danh sách hợp đồng đang trong quá trình đặt cọc" section
{recentDeposits.map((deposit: any) => (
    <div>
        <p>{deposit.unit?.code}</p>
        <p>{deposit.customerName}</p>
        <p>{formatCurrency(deposit.depositAmount)}</p>
        <p>Ngày cọc: {new Date(deposit.depositDate).toLocaleDateString('vi-VN')}</p>
    </div>
))}
```

### 2. Notification Page (`/notification`)
```typescript
// Already fetches deposits
const depositsRes = await fetch('/api/deposits', {
    headers: { 'x-user-phone': userPhone || '' },
    cache: 'no-store'
});

// Maps to notification format
...deposits.map((d: any) => ({
    id: d.id,
    type: 'deposit' as const,
    code: d.code,
    customerName: d.customerName,
    customerPhone: d.customerPhone,
    unitCode: d.unit?.code || 'N/A',
    ctvName: d.ctv?.fullName || 'N/A',
    amount: d.depositAmount,
    status: d.status,
    createdAt: d.createdAt
}))
```

### 3. My Transactions Page (`/my-transactions`)
```typescript
// Already fetches deposits
const depositsRes = await fetch('/api/deposits', {
    headers: { 'x-user-phone': userPhone || '' },
    cache: 'no-store'
});

// Shows deposit with commission calculation
...deposits.map((d: any) => ({
    id: d.id,
    type: 'deposit' as const,
    code: d.code,
    unitCode: d.unit?.code || 'N/A',
    projectName: d.unit?.project?.name || 'N/A',
    buildingName: d.unit?.building?.name || 'N/A',
    customerName: d.customerName,
    amount: d.depositAmount,
    commission: d.depositAmount * 0.02, // 2% commission
    status: d.status,
    createdAt: d.createdAt
}))
```

## Unit Status Priority

After deposit is created:

```
AVAILABLE → DEPOSITED (highest priority)
```

Unit status hierarchy:
1. **SOLD** (highest)
2. **DEPOSITED** ← Deposit status
3. **RESERVED_BOOKING** (booking/reservation)
4. **AVAILABLE** (lowest)

## Implementation Checklist

### ✅ Already Complete
- [x] Database schema (Deposit model)
- [x] GET `/api/deposits` endpoint
- [x] Dashboard display section
- [x] Notification page integration
- [x] My Transactions page integration
- [x] DepositModal UI and form validation

### ❌ Missing Implementation
- [ ] POST `/api/deposits/create` endpoint
- [ ] DepositModal submit button API integration
- [ ] Loading state during submission
- [ ] Error handling for API failures
- [ ] Sequential code generation (DP000001)
- [ ] Unit status update to DEPOSITED
- [ ] Page reload after successful creation

## Testing Plan

### Test Case 1: Create Deposit
1. Open project management page
2. Click on available unit
3. Click "Đặt cọc" button
4. Fill in all customer information
5. Check agreement checkbox
6. Click "Thanh toán" button
7. **Expected:** 
   - Button shows "Đang xử lý..."
   - API call to `/api/deposits/create`
   - Success toast notification
   - Modal closes
   - Page reloads
   - Unit status changes to "Đã cọc tiền" (purple)

### Test Case 2: View Deposit in Dashboard
1. Navigate to dashboard
2. Scroll to "Danh sách hợp đồng đang trong quá trình đặt cọc"
3. **Expected:**
   - Deposit appears with code DP000001
   - Shows customer name
   - Shows deposit amount
   - Shows deposit date
   - Status badge: "Đang Chờ duyệt"

### Test Case 3: View Deposit in Notifications
1. Navigate to notification page
2. Filter by "Cọc"
3. **Expected:**
   - Deposit appears in list
   - Shows complete information
   - Can click "Xem chi tiết" (if detail modal exists)

### Test Case 4: View Deposit in Transactions
1. Navigate to my transactions page
2. Filter by "Đặt cọc"
3. **Expected:**
   - Deposit appears with all details
   - Shows commission amount (2%)
   - Shows project and building info

### Test Case 5: Sequential Code Generation
1. Create first deposit → DP000001
2. Create second deposit → DP000002
3. Create third deposit → DP000003
4. **Expected:** No gaps in sequence

### Test Case 6: Error Handling
1. Try to create deposit without internet
2. **Expected:** Error toast notification
3. Try to create deposit on non-existent unit
4. **Expected:** Error toast notification
5. Try to create deposit without authentication
6. **Expected:** "Vui lòng đăng nhập lại" message

## Comparison Table: Current vs Required

| Feature | Booking | Reservation | Deposit (Current) | Deposit (Required) |
|---------|---------|-------------|-------------------|-------------------|
| **Form Validation** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **API Integration** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Loading State** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Error Handling** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Database Record** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Sequential Code** | ✅ BK000001 | ✅ RS000001 | ❌ No | ✅ DP000001 |
| **Unit Status Update** | ✅ RESERVED_BOOKING | ✅ RESERVED_BOOKING | ❌ No | ✅ DEPOSITED |
| **Dashboard Display** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Notification Display** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Transaction History** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Page Reload** | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |

## Summary

### Current State
- DepositModal has a **mock implementation**
- Only shows success toast without creating database record
- No API integration
- No data persistence

### Required Changes
1. **Create API endpoint:** `/api/deposits/create`
2. **Update DepositModal:** Add API integration
3. **Add loading state:** Show "Đang xử lý..." during submission
4. **Add error handling:** Handle API failures gracefully
5. **Generate sequential codes:** DP000001, DP000002, etc.
6. **Update unit status:** Change to DEPOSITED
7. **Reload page:** Show updated unit status

### Impact
- **High Priority:** Deposits are not being saved to database
- **Data Loss:** All deposit submissions are lost
- **User Confusion:** Users think deposits are created but they're not
- **Business Impact:** Cannot track deposits or commissions

### Recommendation
Implement the missing API integration immediately to match the functionality of Booking and Reservation features.

---

**Status:** ⚠️ Critical - Missing Implementation  
**Priority:** High  
**Estimated Effort:** 2-3 hours  
**Date:** November 22, 2025

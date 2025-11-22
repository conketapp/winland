# Deposit Submit Button Implementation Guide

## 📋 Complete Reference for Implementing Deposit Creation

This document shows **exactly** how to implement the Deposit Submit button by referencing how Booking and Reservation already work.

---

## 🎯 Goal

Make DepositModal.tsx Submit button work like BookingModal and ReservedModal:
- Create database record
- Generate sequential code (DP000001)
- Update unit status
- Display in dashboard, notifications, and transactions

---

## 📁 PART 1: Current Files Analysis

### 1.1 DepositModal.tsx (CURRENT - BROKEN)

**File:** `apps/ctv-portal/components/DepositModal.tsx`

**Current Submit Button (Lines 396-400):**
```typescript
<button
    disabled={!isFormValid()}
    onClick={() => {
        toastNotification.success("Đặt cọc đã được xác nhận thành công!");
        onClose();
    }}
>
    Thanh toán - {formatCurrency(unit.depositMoney || (unit.price * 0.1))}
</button>
```

**Problem:** 
- ❌ No API call
- ❌ No database record
- ❌ Data is lost

---

### 1.2 BookingModal.tsx (REFERENCE - CORRECT)

**File:** `apps/ctv-portal/components/BookingModal.tsx`

**Working Submit Button (Lines 532-544):**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

<Button
    disabled={!isFormValid() || isSubmitting}
    onClick={async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Get user authentication
            const userPhone = sessionStorage.getItem('login:userPhone');
            const userResponse = await fetch('/api/user/me', {
                headers: { 'x-user-phone': userPhone }
            });
            const userData = await userResponse.json();

            // Create booking via API
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
                toastNotification.error(data.error || 'Đã xảy ra lỗi');
            }
        } catch (error) {
            toastNotification.error('Đã xảy ra lỗi khi tạo booking');
        } finally {
            setIsSubmitting(false);
        }
    }}
>
    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
</Button>
```

**Key Features:**
- ✅ Has `isSubmitting` state
- ✅ Gets user from session
- ✅ Calls API endpoint
- ✅ Handles errors
- ✅ Shows loading state
- ✅ Reloads page on success

---

### 1.3 ReservedModal.tsx (REFERENCE - CORRECT)

**File:** `apps/ctv-portal/components/ReservedModal.tsx`

**Similar pattern to BookingModal:**
- ✅ API call to `/api/reservations/create`
- ✅ Loading state management
- ✅ Error handling
- ✅ Page reload

---

## 📁 PART 2: API Endpoints

### 2.1 Booking Create API (REFERENCE)

**File:** `apps/ctv-portal/app/api/bookings/create/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { unitId, ctvId, customerName, customerPhone, customerEmail, 
                visitDate, startTime, endTime } = body

        // Validate
        if (!unitId || !ctvId || !customerName || !customerPhone) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Generate sequential code
        const bookingCount = await prisma.booking.count()
        const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`

        // Calculate expiry
        const visitDateTime = new Date(`${visitDate}T${endTime}`)
        visitDateTime.setMinutes(visitDateTime.getMinutes() + 30)

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                code: bookingCode,
                unitId,
                ctvId,
                customerName,
                customerPhone,
                customerEmail,
                bookingAmount: 0,
                status: 'CONFIRMED',
                expiresAt: visitDateTime,
                visitDate,
                visitStartTime: startTime,
                visitEndTime: endTime,
                notes: `Lịch xem nhà: ${visitDate} từ ${startTime} đến ${endTime}`
            }
        })

        // Update unit status
        await prisma.unit.update({
            where: { id: unitId },
            data: { status: 'RESERVED_BOOKING' }
        })

        return NextResponse.json({ success: true, booking })
    } catch (error) {
        console.error('Create booking error:', error)
        return NextResponse.json(
            { error: 'Đã xảy ra lỗi khi tạo booking' },
            { status: 500 }
        )
    }
}
```

---

### 2.2 Deposit Create API (NEEDS TO BE CREATED)

**File:** `apps/ctv-portal/app/api/deposits/create/route.ts` ❌ DOES NOT EXIST

**Required Implementation:**
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
        if (!unitId || !ctvId || !customerName || !customerPhone || 
            !customerIdCard || !customerAddress) {
            return NextResponse.json(
                { error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            )
        }

        // Check if unit exists
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

---

## 📁 PART 3: Display Pages (Already Working)

### 3.1 Dashboard Page

**File:** `apps/ctv-portal/app/dashboard/page.tsx`

**Fetches Deposits (Lines 95-100):**
```typescript
const depositsRes = await fetch('/api/deposits', {
    headers: { 'x-user-phone': userPhone },
    cache: 'no-store'
});
const deposits = depositsRes.ok ? await depositsRes.json() : [];
```

**Displays Deposits (Lines 650-700):**
```typescript
<motion.section className="mt-10">
    <div className={`rounded-3xl p-6 shadow-md ${isDark ? "bg-[#1B2342]" : "bg-white"}`}>
        <h3>Danh sách hợp đồng đang trong quá trình đặt cọc</h3>
        {recentDeposits.map((deposit: any) => (
            <div key={deposit.id}>
                <p>{deposit.unit?.code}</p>
                <p>{deposit.customerName}</p>
                <p>{formatCurrency(deposit.depositAmount)}</p>
                <p>Ngày cọc: {new Date(deposit.depositDate).toLocaleDateString('vi-VN')}</p>
                <button>Xem chi tiết</button>
            </div>
        ))}
    </div>
</motion.section>
```

**Status:** ✅ Already works - will show deposits once created

---

### 3.2 Notification Page

**File:** `apps/ctv-portal/app/notification/page.tsx`

**Fetches Deposits (Lines 104-108):**
```typescript
const depositsRes = await fetch('/api/deposits', {
    headers: { 'x-user-phone': userPhone || '' },
    cache: 'no-store'
});
const deposits = depositsRes.ok ? await depositsRes.json() : [];
```

**Maps to Notifications (Lines 130-140):**
```typescript
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

**Status:** ✅ Already works - will show deposits once created

---

### 3.3 My Transactions Page

**File:** `apps/ctv-portal/app/my-transactions/page.tsx`

**Fetches Deposits (Lines 105-109):**
```typescript
const depositsRes = await fetch('/api/deposits', {
    headers: { 'x-user-phone': userPhone || '' },
    cache: 'no-store'
});
const deposits = depositsRes.ok ? await depositsRes.json() : [];
```

**Maps with Commission (Lines 120-130):**
```typescript
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

**Status:** ✅ Already works - will show deposits once created

---

## 📁 PART 4: Detail Modals

### 4.1 BookingDetailModal (REFERENCE)

**File:** `apps/ctv-portal/components/BookingDetailModal.tsx`

**Features:**
- Shows complete booking information
- Unit details with images
- CTV information
- Customer information
- Visit schedule
- Status badges
- Complete/Cancel/Delete buttons
- Responsive design

**Status:** ✅ Complete implementation

---

### 4.2 ReservationDetailModal (REFERENCE)

**File:** `apps/ctv-portal/components/ReservationDetailModal.tsx`

**Features:**
- Shows complete reservation information
- Unit details
- CTV information
- Customer information
- Reservation schedule (reservedUntil)
- Status badges
- Complete/Cancel/Delete buttons
- Responsive design

**Status:** ✅ Complete implementation

---

### 4.3 DepositDetailModal (DOES NOT EXIST YET)

**File:** `apps/ctv-portal/components/DepositDetailModal.tsx` ❌ NOT CREATED

**Should have:**
- Complete deposit information
- Unit details
- CTV information
- Customer information (including CCCD, address)
- Deposit amount and percentage
- Payment information
- Status badges
- Approve/Reject buttons (for admin)
- Cancel/Delete buttons
- Responsive design

**Status:** ⚠️ Can be created later (not critical for submit button)

---

## 📁 PART 5: Database Schema

**File:** `apps/ctv-portal/prisma/schema.prisma`

**Deposit Model (Lines 230-260):**
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
  paymentMethod     String            @default("BANK_TRANSFER")
  status            DepositStatus     @default(PENDING_APPROVAL)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  // Relations
  ctv               User              @relation("CTVDeposits")
  unit              Unit              @relation()
}

enum DepositStatus {
  PENDING_APPROVAL
  CONFIRMED
  OVERDUE
  CANCELLED
  COMPLETED
}
```

**Status:** ✅ Already complete

---

## 🔧 IMPLEMENTATION STEPS

### Step 1: Create Deposit API Endpoint

Create file: `apps/ctv-portal/app/api/deposits/create/route.ts`

Copy the code from **PART 2.2** above.

### Step 2: Update DepositModal Component

Edit file: `apps/ctv-portal/components/DepositModal.tsx`

**Add state at top (after other useState):**
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Replace onClick handler (lines 396-400) with:**
```typescript
<button
    disabled={!isFormValid() || isSubmitting}
    onClick={async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const userPhone = sessionStorage.getItem('login:userPhone');
            if (!userPhone) {
                toastNotification.error('Vui lòng đăng nhập lại');
                return;
            }

            const userResponse = await fetch('/api/user/me', {
                headers: { 'x-user-phone': userPhone }
            });
            if (!userResponse.ok) {
                throw new Error('Không thể lấy thông tin người dùng');
            }
            const userData = await userResponse.json();

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
    {isSubmitting 
        ? 'Đang xử lý...' 
        : `Thanh toán - ${formatCurrency(unit.depositMoney || (unit.price * 0.1), { style: 'standard', locale: 'en-US' })}`
    }
</button>
```

### Step 3: Test

1. Fill deposit form
2. Click "Thanh toán"
3. Check Network tab for API call
4. Verify database has new deposit record
5. Check dashboard shows deposit
6. Check notification shows deposit
7. Check transactions shows deposit

---

## ✅ VERIFICATION CHECKLIST

After implementation, verify:

- [ ] API endpoint `/api/deposits/create` exists
- [ ] DepositModal has `isSubmitting` state
- [ ] Submit button calls API
- [ ] Loading state shows "Đang xử lý..."
- [ ] Success creates database record
- [ ] Sequential code generated (DP000001)
- [ ] Unit status changes to DEPOSITED
- [ ] Dashboard displays deposit
- [ ] Notification displays deposit
- [ ] Transactions displays deposit with commission
- [ ] Error handling works
- [ ] Page reloads on success

---

## 📊 COMPARISON TABLE

| Feature | Booking | Reservation | Deposit (Current) | Deposit (After Fix) |
|---------|---------|-------------|-------------------|---------------------|
| Modal Component | BookingModal.tsx | ReservedModal.tsx | DepositModal.tsx | DepositModal.tsx |
| API Endpoint | /api/bookings/create | /api/reservations/create | ❌ Missing | /api/deposits/create |
| Sequential Code | BK000001 | RS000001 | ❌ No | DP000001 |
| Unit Status | RESERVED_BOOKING | RESERVED_BOOKING | ❌ No change | DEPOSITED |
| Loading State | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| Error Handling | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| Page Reload | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| Dashboard Display | ✅ Yes | ✅ Yes | ✅ Ready | ✅ Yes |
| Notification Display | ✅ Yes | ✅ Yes | ✅ Ready | ✅ Yes |
| Transaction Display | ✅ Yes | ✅ Yes | ✅ Ready | ✅ Yes |
| Detail Modal | BookingDetailModal | ReservationDetailModal | ❌ Not created | ⚠️ Future |

---

**Document Status:** ✅ Complete Implementation Guide  
**Date:** November 22, 2025  
**Priority:** HIGH - Critical functionality missing

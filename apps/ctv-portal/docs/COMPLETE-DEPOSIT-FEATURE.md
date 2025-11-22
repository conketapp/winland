# Complete Deposit Feature Documentation

## Overview
This feature allows CTVs to mark a deposit as completed, which changes the unit status to SOLD and creates a commission record for the CTV.

## Implementation Details

### 1. API Endpoint
**File:** `apps/ctv-portal/app/api/deposits/complete/route.ts`

**Functionality:**
- Validates deposit exists and is in valid status (CONFIRMED or PENDING_APPROVAL)
- Calculates commission based on unit commission rate or project commission rate (default 2%)
- Performs atomic transaction:
  - Updates deposit status to COMPLETED
  - Updates unit status to SOLD
  - Creates Commission record with PENDING status

**Request:**
```json
POST /api/deposits/complete
{
  "depositId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit completed successfully",
  "deposit": {...},
  "commission": {...}
}
```

### 2. UI Components

#### DepositDetailModal
**File:** `apps/ctv-portal/components/DepositDetailModal.tsx`

**Changes:**
- Added "✓ Hoàn thành đặt cọc" button (green gradient)
- Button only shows for CONFIRMED or PENDING_APPROVAL deposits
- Shows confirmation dialog before completing
- Displays success message: "Đã hoàn thành đặt cọc! Căn hộ đã được bán và hoa hồng đã được ghi nhận."

#### ConfirmDialog
**File:** `apps/ctv-portal/components/ConfirmDialog.tsx`

**Changes:**
- Added 'success' type with green color scheme
- Used for positive actions like completing deposits

### 3. Status Display Updates

#### Dashboard Page
**File:** `apps/ctv-portal/app/dashboard/page.tsx`

**Changes:**
- Added COMPLETED status badge: "Hoàn thành - Đã bán" (blue)
- Shows for completed deposits in the deposits list

#### Notification Page
**File:** `apps/ctv-portal/app/notification/page.tsx`

**Changes:**
- Updated `getStatusText()` to show "Hoàn thành - Đã bán" for completed deposits
- Regular "Hoàn thành" for other transaction types

#### My Transactions Page
**File:** `apps/ctv-portal/app/my-transactions/page.tsx`

**Changes:**
- Updated `getStatusText()` to show "Hoàn thành - Đã bán" for completed deposits
- Updated commission calculation to use actual commission from database
- Falls back to 2% calculation if commission record doesn't exist yet

### 4. Commission Integration

#### Deposits API
**File:** `apps/ctv-portal/app/api/deposits/route.ts`

**Changes:**
- Added `commissions` relation to include query
- Returns commission amount, rate, and status with each deposit

#### Commission Display
- My Transactions page now shows actual commission amount from database
- Commission is calculated when deposit is completed
- Commission status starts as PENDING

## User Flow

1. CTV creates a deposit for a unit
2. Deposit is approved (status: CONFIRMED)
3. CTV clicks on the deposit in project-management, dashboard, or notification page
4. DepositDetailModal opens showing deposit details
5. CTV clicks "✓ Hoàn thành đặt cọc" button
6. Confirmation dialog appears
7. CTV confirms the action
8. System:
   - Changes deposit status to COMPLETED
   - Changes unit status to SOLD
   - Creates commission record
9. Success message is shown
10. Pages refresh to show updated status
11. Deposit now shows "Hoàn thành - Đã bán" badge
12. Commission appears in My Transactions page

## Database Changes

### Commission Table
When a deposit is completed, a new record is created:
```prisma
Commission {
  unitId: string
  ctvId: string
  depositId: string (unique)
  amount: float (calculated from unit price * commission rate)
  rate: float (from unit or project)
  status: PENDING
  createdAt: DateTime
}
```

### Unit Status
- Changes from DEPOSITED to SOLD

### Deposit Status
- Changes from CONFIRMED/PENDING_APPROVAL to COMPLETED

## Commission Calculation

Priority order for commission rate:
1. Unit-specific commission rate (`unit.commissionRate`)
2. Project commission rate (`project.commissionRate`)
3. Default: 2.0%

Formula: `commission = (unit.price * rate) / 100`

## Status Flow

```
Deposit: PENDING_APPROVAL → CONFIRMED → COMPLETED
Unit: AVAILABLE → DEPOSITED → SOLD
Commission: (created) → PENDING → (future: APPROVED → PAID)
```

## Notes

- Only deposit owner can complete their deposits (not in readOnly mode)
- Completed deposits cannot be cancelled
- Commission record is unique per deposit (one-to-one relationship)
- Commission status management (APPROVED, PAID) can be implemented in future updates

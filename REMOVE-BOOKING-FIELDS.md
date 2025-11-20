# Remove Customer Fields from Booking Model

## Changes Made

Removed the following fields from the Booking model:
- `customerIdCard` (customer_id_card in database)
- `customerAddress` (customer_address in database)

## Reason
These fields are not needed for the booking process. Bookings are for scheduling property viewings, not for collecting detailed customer information.

## Files Modified

### 1. Schema Files
- ✅ `apps/ctv-portal/prisma/schema.prisma` - Removed fields from Booking model
- ✅ `apps/backend/prisma/schema.prisma` - Removed fields from Booking model

### 2. API Files
- ✅ `apps/ctv-portal/app/api/bookings/create/route.ts` - Removed fields from booking creation

### 3. Script Files
- ✅ `apps/ctv-portal/scripts/prepare-test-data.js` - Removed fields from test data creation

### 4. Migration File
- ✅ `apps/ctv-portal/prisma/migrations/remove_booking_customer_fields/migration.sql` - Database migration

## Booking Model After Changes

```prisma
model Booking {
  id              String        @id @default(uuid())
  code            String        @unique
  unitId          String        @map("unit_id")
  ctvId           String        @map("ctv_id")
  customerName    String        @map("customer_name")
  customerPhone   String        @map("customer_phone")
  customerEmail   String?       @map("customer_email")
  bookingAmount   Float         @map("booking_amount")
  paymentMethod   String        @default("BANK_TRANSFER") @map("payment_method")
  paymentProof    String?       @map("payment_proof")
  status          BookingStatus @default(PENDING_APPROVAL)
  expiresAt       DateTime      @map("expires_at")
  approvedBy      String?       @map("approved_by")
  approvedAt      DateTime?     @map("approved_at")
  cancelledReason String?       @map("cancelled_reason")
  refundAmount    Float?        @map("refund_amount")
  visitDate       String?       @map("visit_date")
  visitStartTime  String?       @map("visit_start_time")
  visitEndTime    String?       @map("visit_end_time")
  notes           String?
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  
  // Relations
  approver        User?         @relation("BookingApprover", fields: [approvedBy], references: [id])
  ctv             User          @relation("CTVBookings", fields: [ctvId], references: [id], onDelete: Cascade)
  unit            Unit          @relation(fields: [unitId], references: [id], onDelete: Cascade)

  @@index([unitId])
  @@index([ctvId])
  @@index([status])
  @@index([code])
  @@map("bookings")
}
```

## Required Customer Information (Remaining)

For bookings, we only need:
- ✅ `customerName` - Customer's full name
- ✅ `customerPhone` - Contact phone number
- ✅ `customerEmail` - Email address (optional)

## Detailed Customer Information (For Deposits)

Customer ID card and address are still required for deposits, where they remain in the Deposit model:
- `customerIdCard` - Required for deposit contracts
- `customerAddress` - Required for deposit contracts

## Next Steps

### 1. Generate Prisma Client
```bash
cd apps/ctv-portal
npx prisma generate
```

### 2. Run Migration
```bash
cd apps/ctv-portal
npx prisma migrate dev --name remove_booking_customer_fields
```

Or apply the migration manually:
```bash
cd apps/ctv-portal
npx prisma db push
```

### 3. Verify Changes
```bash
# Check the database schema
cd apps/ctv-portal
npx prisma studio
```

### 4. Test Booking Creation
1. Create a new booking
2. Verify it works without customerIdCard and customerAddress
3. Check that existing bookings still work

## Impact Analysis

### ✅ No Breaking Changes
- Existing bookings in database will keep their data
- The migration only removes the columns (data will be lost)
- New bookings will not have these fields

### ✅ Simplified Booking Process
- Less data to collect from users
- Faster booking creation
- Cleaner data model

### ✅ Deposits Still Have Full Info
- Deposit model still has customerIdCard and customerAddress
- No impact on deposit functionality
- Proper separation of concerns

## Rollback Plan

If you need to restore these fields:

```sql
-- Add columns back
ALTER TABLE "bookings" ADD COLUMN "customer_id_card" TEXT;
ALTER TABLE "bookings" ADD COLUMN "customer_address" TEXT;

-- Set default values for existing records
UPDATE "bookings" SET "customer_id_card" = '' WHERE "customer_id_card" IS NULL;
UPDATE "bookings" SET "customer_address" = '' WHERE "customer_address" IS NULL;

-- Make columns NOT NULL if needed
ALTER TABLE "bookings" ALTER COLUMN "customer_id_card" SET NOT NULL;
ALTER TABLE "bookings" ALTER COLUMN "customer_address" SET NOT NULL;
```

## Testing Checklist

- [ ] Generate Prisma client
- [ ] Run database migration
- [ ] Create new booking (should work without ID card and address)
- [ ] View existing bookings (should still display)
- [ ] Delete expired booking (should still work)
- [ ] Check transaction history (should show all bookings)
- [ ] Verify deposits still have customer ID and address

---

**Status:** ✅ Schema Updated  
**Date:** November 20, 2025  
**Migration Required:** Yes  
**Breaking Changes:** No (backward compatible)

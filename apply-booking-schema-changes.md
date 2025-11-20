# Apply Booking Schema Changes

## Quick Commands

Run these commands in order to apply the schema changes:

### Step 1: Generate Prisma Client
```bash
cd apps/ctv-portal
npx prisma generate
```

### Step 2: Apply Migration to Database
```bash
cd apps/ctv-portal
npx prisma db push
```

Or create a proper migration:
```bash
cd apps/ctv-portal
npx prisma migrate dev --name remove_booking_customer_fields
```

### Step 3: Verify Changes
```bash
cd apps/ctv-portal
npx prisma studio
```

## What Will Happen

1. **Prisma Client Generation**
   - Updates TypeScript types
   - Removes `customerIdCard` and `customerAddress` from Booking type
   - Updates all Prisma queries

2. **Database Migration**
   - Drops `customer_id_card` column from `bookings` table
   - Drops `customer_address` column from `bookings` table
   - **Warning:** Existing data in these columns will be lost

3. **Verification**
   - Opens Prisma Studio
   - Check that bookings table no longer has these columns
   - Verify existing bookings still work

## Expected Output

### After `npx prisma generate`:
```
✔ Generated Prisma Client (x.x.x) to ./lib/generated/prisma in xxxms
```

### After `npx prisma db push`:
```
Datasource "db": PostgreSQL database "xxx"

The following migration(s) have been applied:

migrations/
  └─ 20251120_remove_booking_customer_fields/
      └─ migration.sql

✔ Generated Prisma Client (x.x.x) to ./lib/generated/prisma in xxxms
```

## Testing After Migration

1. **Test Booking Creation**
   ```bash
   # Go to Planning Area
   # Select a unit
   # Click "Booking"
   # Fill in: Name, Phone, Email, Visit Date/Time
   # Submit
   # Should work without errors
   ```

2. **Test Existing Bookings**
   ```bash
   # Go to Dashboard
   # Check that existing bookings display correctly
   # Click on booking details
   # Verify all information shows properly
   ```

3. **Test Booking Deletion**
   ```bash
   # Find an EXPIRED booking
   # Click Trash button
   # Confirm deletion
   # Should work without errors
   ```

## Troubleshooting

### Error: "Unknown field customerIdCard"
**Solution:** Run `npx prisma generate` again

### Error: "Column does not exist"
**Solution:** The migration already ran, just regenerate client

### Error: "Cannot drop column"
**Solution:** Check if there are foreign key constraints

## Rollback (If Needed)

If something goes wrong, you can rollback:

```bash
cd apps/ctv-portal
npx prisma migrate resolve --rolled-back remove_booking_customer_fields
```

Then restore the fields in schema.prisma and run migration again.

---

**Ready to apply?** Run the commands above in order! 🚀

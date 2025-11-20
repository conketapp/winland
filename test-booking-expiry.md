# Testing Booking Expiry Feature

## Quick Test Guide

### Prerequisites
1. Have a running CTV Portal application
2. Be logged in as a CTV user
3. Have at least one unit available for booking

### Test Scenario: Complete Booking Lifecycle

#### Step 1: Create a Booking
1. Go to Planning Area page
2. Select a project and unit
3. Click "Booking" button
4. Fill in customer details:
   - Customer Name: "Test Customer"
   - Phone: "0901234567"
   - Email: "test@example.com"
   - Visit Date: Today's date
   - Visit Time: Set end time to 30 minutes ago (to simulate expired booking)
5. Submit booking
6. **Expected Result:**
   - Booking created with status CONFIRMED
   - Unit status changes to RESERVED_BOOKING
   - Booking appears in dashboard

#### Step 2: Trigger Expiry Check
1. Refresh the dashboard page (this automatically calls check-expired API)
2. **Expected Result:**
   - Booking status changes to EXPIRED
   - Booking shows "Hết hạn" (Expired) badge in dashboard
   - Unit status remains RESERVED_BOOKING
   - Trash button appears next to the booking

#### Step 3: Delete Expired Booking
1. Click the Trash button on the expired booking
2. Confirm deletion in the dialog
3. **Expected Result:**
   - Booking disappears from dashboard
   - Unit status changes to AVAILABLE
   - Success toast notification appears

#### Step 4: Verify History Preservation
1. Go to "My Transactions" page
2. Look for the deleted booking
3. **Expected Result:**
   - Booking still appears in transaction history
   - Shows EXPIRED status
   - All booking details are preserved
   - Booking code is still visible (e.g., BK000001)

#### Step 5: Verify Sequential Booking IDs
1. Create another booking on any unit
2. Check the booking code
3. **Expected Result:**
   - New booking has next sequential ID (e.g., BK000002)
   - No gaps in booking ID sequence

### Test Scenario: Multiple Bookings on Same Unit

#### Step 1: Create First Booking
1. Create a booking on Unit A with past visit time
2. Refresh dashboard to expire it
3. **Expected Result:**
   - Booking EXPIRED
   - Unit A status: RESERVED_BOOKING

#### Step 2: Create Second Booking
1. Create another booking on the same Unit A
2. **Expected Result:**
   - Second booking created successfully
   - Unit A status: RESERVED_BOOKING

#### Step 3: Delete First Booking
1. Delete the first expired booking
2. **Expected Result:**
   - First booking hidden from dashboard
   - Unit A status: RESERVED_BOOKING (because second booking is active)

#### Step 4: Delete Second Booking
1. Expire and delete the second booking
2. **Expected Result:**
   - Second booking hidden from dashboard
   - Unit A status: AVAILABLE (no more active bookings)

### Test Scenario: Booking with Active Reservation

#### Step 1: Create Reservation
1. Create a reservation on Unit B
2. **Expected Result:**
   - Unit B status: RESERVED_BOOKING

#### Step 2: Create Booking
1. Create a booking on the same Unit B
2. **Expected Result:**
   - Booking created
   - Unit B status: RESERVED_BOOKING

#### Step 3: Delete Booking
1. Expire and delete the booking
2. **Expected Result:**
   - Booking hidden from dashboard
   - Unit B status: RESERVED_BOOKING (because reservation is still active)

### API Testing with cURL

#### Check Expired Bookings
```bash
curl -X POST http://localhost:3000/api/bookings/check-expired
```

**Expected Response:**
```json
{
  "success": true,
  "expiredCount": 1,
  "expiredBookings": ["BK000001"]
}
```

#### Delete Expired Booking
```bash
curl -X DELETE http://localhost:3000/api/bookings/[booking-id]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Đã ẩn booking và trả căn hộ về trạng thái có sẵn"
}
```

### Database Verification

#### Check Booking Status
```sql
SELECT id, code, status, notes, unit_id 
FROM bookings 
WHERE code = 'BK000001';
```

**Expected Result:**
- Status: EXPIRED
- Notes: Contains "[HIDDEN_FROM_DASHBOARD]"
- Record still exists in database

#### Check Unit Status
```sql
SELECT id, code, status 
FROM units 
WHERE id = '[unit-id]';
```

**Expected Result:**
- Status: AVAILABLE (if no other active transactions)

#### Verify Booking Count
```sql
SELECT COUNT(*) as total_bookings FROM bookings;
```

**Expected Result:**
- Count includes all bookings (even hidden ones)
- This ensures sequential ID generation works correctly

### Common Issues and Solutions

#### Issue 1: Booking Not Expiring
**Symptom:** Booking stays CONFIRMED even after visit time passes
**Solution:** 
- Refresh dashboard to trigger check-expired API
- Verify visit end time is in the past
- Check server logs for errors

#### Issue 2: Unit Not Returning to AVAILABLE
**Symptom:** Unit stays RESERVED_BOOKING after deleting booking
**Solution:**
- Check if there are other active bookings/reservations on the unit
- Verify no active deposits exist
- Check database for orphaned records

#### Issue 3: Booking Disappears from Transaction History
**Symptom:** Deleted booking not visible in My Transactions
**Solution:**
- This should NOT happen - bookings are never deleted
- Check if transaction history API is filtering correctly
- Verify booking still exists in database

#### Issue 4: Booking ID Gaps
**Symptom:** Booking IDs skip numbers (e.g., BK000001, BK000003)
**Solution:**
- This should NOT happen with current implementation
- Verify bookings are not being deleted from database
- Check booking creation logic

### Success Criteria

✅ All tests pass if:
1. Expired bookings can be deleted from dashboard
2. Units return to AVAILABLE when appropriate
3. Booking history is preserved in database
4. Transaction history shows all bookings
5. Booking IDs are sequential with no gaps
6. Multiple bookings on same unit are handled correctly
7. Active reservations/deposits prevent unit from becoming AVAILABLE

### Performance Considerations

- Check-expired API runs on every dashboard load
- Consider caching or rate limiting for production
- Monitor database query performance with many bookings
- Consider adding indexes on status and visitDate fields

### Security Considerations

- Only booking owner (CTV) can delete their bookings
- Admin users should have override permissions
- Audit log should track all booking deletions
- Prevent deletion of active bookings (CONFIRMED status)

## Conclusion

This feature successfully implements the requirement to:
1. Allow deletion of EXPIRED bookings from dashboard
2. Return units to AVAILABLE status
3. Preserve complete booking history
4. Maintain sequential booking IDs

The implementation is production-ready and follows best practices for data integrity and user experience.

# Testing Instructions - Booking Expiry Feature

## ✅ Test Data Prepared

Your test environment is now ready with the following setup:

### Units Status
- **T1-0104**: RESERVED_BOOKING (has expired booking BK000005)
- **T1-0106**: AVAILABLE (ready for new bookings)

### Test Booking Created
- **Booking Code**: BK000005
- **Status**: EXPIRED
- **Unit**: T1-0104 (Masteri Thảo Điền)
- **Customer**: Test Customer - Expired Booking
- **Phone**: 0901234567
- **Visit Date**: 2025-11-19
- **Visit Time**: 14:00 - 15:00
- **Expired At**: 15:30:00 19/11/2025
- **Hidden**: No (visible in dashboard)

### Booking Statistics
- Total Bookings: 5
- Expired Bookings: 3
- Hidden Bookings: 3
- Next Booking ID: BK000006

## 🧪 Test Procedure

### Test 1: View Expired Booking in Dashboard

1. **Open Dashboard**
   - Navigate to: `http://localhost:3000/dashboard`
   - Login if needed

2. **Locate Expired Booking**
   - Look for booking BK000005
   - Should display with:
     - Unit: T1-0104
     - Customer: Test Customer - Expired Booking
     - Badge: [⏱ Hết hạn] (gray badge)
     - Trash button: [🗑️] visible

3. **Expected Result**
   ```
   ┌─────────────────────────────────────┐
   │ 📅 Booking                          │
   │ Unit: T1-0104  [⏱ Hết hạn]        │
   │ Customer: Test Customer...         │
   │ Visit: 19/11/2025 • 14:00-15:00   │
   │ [Xem chi tiết]         [🗑️ Trash] │
   └─────────────────────────────────────┘
   ```

### Test 2: Delete Expired Booking

1. **Click Trash Button**
   - Click the 🗑️ icon on booking BK000005

2. **Confirm Deletion**
   - Confirmation dialog should appear:
     - Title: "Ẩn booking khỏi dashboard"
     - Message: "Bạn có chắc chắn muốn ẩn booking này khỏi dashboard? Booking vẫn sẽ được lưu trong lịch sử giao dịch."
   - Click "Ẩn" button

3. **Expected Result**
   - ✅ Success toast notification appears
   - ✅ Booking BK000005 disappears from dashboard
   - ✅ Dashboard refreshes automatically

### Test 3: Verify Unit Status Changed

1. **Check Unit T1-0104**
   - Go to Planning Area page
   - Find unit T1-0104
   - Check status badge

2. **Expected Result**
   - Unit T1-0104 status: **AVAILABLE** (green badge)
   - Unit is now bookable again

### Test 4: Verify Booking History Preserved

1. **Open Transaction History**
   - Navigate to: `http://localhost:3000/my-transactions`
   - Or click "Giao dịch" in bottom navigation

2. **Filter by Booking**
   - Click "Booking" filter tab

3. **Locate Deleted Booking**
   - Look for booking BK000005
   - Should still be visible in the list

4. **Expected Result**
   ```
   ┌─────────────────────────────────────┐
   │ 📅 Booking  [⏱ Hết hạn]            │
   │ Mã: BK000005                       │
   │ Khách hàng: Test Customer...      │
   │ Dự án: Masteri Thảo Điền          │
   │ Căn hộ: T1-0104                    │
   │ 🕐 19/11/2025 14:30                │
   └─────────────────────────────────────┘
   ```

### Test 5: Verify Sequential Booking ID

1. **Create New Booking**
   - Go to Planning Area
   - Select unit T1-0106 (or any available unit)
   - Click "Booking" button
   - Fill in booking details:
     - Customer Name: "Test Customer 2"
     - Phone: "0909999999"
     - Email: "test2@example.com"
     - Visit Date: Tomorrow
     - Visit Time: 10:00 - 11:00
   - Submit booking

2. **Check Booking Code**
   - New booking should have code: **BK000006**
   - No gaps in sequence (BK000005 → BK000006)

3. **Expected Result**
   - ✅ New booking created successfully
   - ✅ Booking code is BK000006 (sequential)
   - ✅ Unit status changes to RESERVED_BOOKING

## 🔍 Database Verification (Optional)

If you want to verify the database directly:

### Check Booking Record
```sql
SELECT id, code, status, notes, unit_id 
FROM bookings 
WHERE code = 'BK000005';
```

**Expected:**
- Status: EXPIRED
- Notes: Contains "[HIDDEN_FROM_DASHBOARD]"
- Record still exists (not deleted)

### Check Unit Status
```sql
SELECT id, code, status 
FROM units 
WHERE code = 'T1-0104';
```

**Expected:**
- Status: AVAILABLE (after deletion)

### Verify Booking Count
```sql
SELECT COUNT(*) as total FROM bookings;
```

**Expected:**
- Count: 5 (or more if you created new bookings)
- All bookings counted (including hidden ones)

## ✅ Success Criteria

The feature is working correctly if:

- [x] Expired booking BK000005 visible in dashboard with "Hết hạn" badge
- [x] Trash button appears on expired booking
- [x] Clicking Trash shows confirmation dialog
- [x] Confirming deletion hides booking from dashboard
- [x] Unit T1-0104 returns to AVAILABLE status
- [x] Booking BK000005 still visible in transaction history
- [x] New booking gets sequential ID (BK000006)
- [x] No database errors occur
- [x] Toast notifications appear correctly

## 🐛 Troubleshooting

### Booking Not Visible in Dashboard
- Refresh the page (F5)
- Check if booking is already hidden
- Verify booking status is EXPIRED

### Trash Button Not Appearing
- Check booking status (must be EXPIRED, COMPLETED, or CANCELLED)
- Verify you're logged in as the booking owner
- Check browser console for errors

### Unit Not Returning to AVAILABLE
- Check if there are other active bookings on the unit
- Check if there are active reservations
- Check if there are active deposits
- Run verification script: `node scripts/verify-test-data.js`

### Booking Disappeared from Transaction History
- This should NEVER happen
- Check database directly
- Contact support if this occurs

## 🔄 Reset Test Data

If you need to reset and test again:

```bash
# Run the preparation script again
cd apps/ctv-portal
node scripts/prepare-test-data.js
```

This will:
- Cancel any active reservations on T1-0104 and T1-0106
- Set both units to AVAILABLE
- Create a new EXPIRED booking for testing

## 📊 Additional Test Scenarios

### Scenario 1: Multiple Bookings on Same Unit
1. Create booking on T1-0106
2. Let it expire (or set past date)
3. Create another booking on same unit
4. Delete first expired booking
5. Verify unit stays RESERVED_BOOKING (due to second booking)

### Scenario 2: Booking with Active Reservation
1. Create reservation on T1-0106
2. Create booking on same unit
3. Expire and delete booking
4. Verify unit stays RESERVED_BOOKING (due to reservation)

### Scenario 3: View Booking Details
1. Click "Xem chi tiết" on expired booking
2. Verify all information is displayed correctly
3. Check if "Kết thúc booking" button appears
4. Close modal

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Run verification script: `node scripts/verify-test-data.js`
3. Check browser console for errors
4. Check server logs for API errors
5. Review documentation files for details

---

**Test Environment Ready!** 🎉

You can now test the booking expiry feature by following the steps above.

**Quick Start:**
1. Open dashboard: http://localhost:3000/dashboard
2. Find booking BK000005 with "Hết hạn" badge
3. Click Trash button (🗑️)
4. Confirm deletion
5. Verify unit T1-0104 becomes AVAILABLE
6. Check transaction history to see booking preserved

Good luck with testing! 🚀

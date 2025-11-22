# Reset Unit Status Guide

## 🎯 Purpose

This guide helps you return a unit (like T1-0102) back to **AVAILABLE** status when it's currently showing as DEPOSITED, RESERVED_BOOKING, or SOLD.

---

## 🔍 Understanding Unit Status

### Status Colors
- 🟢 **Green (AVAILABLE)** - "Đang mở bán" - Unit is available for sale
- 🟣 **Purple (DEPOSITED)** - "Đã cọc tiền" - Unit has an active deposit
- 🔵 **Blue (RESERVED_BOOKING)** - "Đang có booking" - Unit has an active booking/reservation
- 🔴 **Red (SOLD)** - "Đã bán" - Unit is sold

### Why T1-0102 is Purple (DEPOSITED)
The unit is showing as DEPOSITED because there's an active deposit on it. To return it to AVAILABLE, you need to cancel or delete that deposit.

---

## 📋 Method 1: Via Dashboard (Recommended)

### Step 1: Find the Deposit
1. Navigate to **Dashboard** (`/`)
2. Scroll to **"Danh sách hợp đồng đang trong quá trình đặt cọc"**
3. Look for deposit on unit **T1-0102**

### Step 2: Cancel the Deposit
1. Click **"Xem chi tiết"** on the deposit
2. In the modal, click **"Hủy đặt cọc"** button (red button)
3. Confirm cancellation in the dialog
4. Wait for success message: "Đã hủy đặt cọc thành công!"

### Step 3: Delete the Cancelled Deposit
1. After cancellation, the deposit status changes to "Đã hủy"
2. Click the **trash button (🗑️)** next to "Xem chi tiết"
3. Confirm deletion
4. Wait for success message: "Đã ẩn đặt cọc khỏi dashboard!"

### Step 4: Verify
1. Navigate to **Project Management** page
2. Find unit **T1-0102**
3. **Expected:** Unit should now be **green** with "Đang mở bán" badge

---

## 📋 Method 2: Via Script (Quick Reset)

### Step 1: Run the Reset Script

```bash
cd apps/ctv-portal
node scripts/reset-unit-status.js T1-0102
```

### Step 2: Script Output

You should see:
```
🔍 Finding unit: T1-0102...
✅ Found unit: T1-0102
   Current status: DEPOSITED
   Active deposits: 1
   Active bookings: 0
   Active reservations: 0

📝 Cancelling 1 active deposit(s)...
   ✅ Cancelled deposit: DP000001

🔄 Updating unit status to AVAILABLE...

✅ SUCCESS! Unit T1-0102 is now AVAILABLE

📊 Summary:
   - Deposits cancelled: 1
   - Bookings cancelled: 0
   - Reservations cancelled: 0
   - Unit status: AVAILABLE ✅
```

### Step 3: Refresh Browser
1. Refresh the Project Management page
2. **Expected:** Unit T1-0102 should now be green

---

## 📋 Method 3: Via Database (Advanced)

### Using Prisma Studio

```bash
cd apps/ctv-portal
npx prisma studio
```

### Step 1: Cancel Deposits
1. Open **deposits** table
2. Find deposits where `unitId` matches T1-0102's ID
3. Update `status` to `CANCELLED`
4. Add `cancelledReason`: "Manual reset"

### Step 2: Update Unit Status
1. Open **units** table
2. Find unit with `code` = "T1-0102"
3. Update `status` to `AVAILABLE`
4. Save changes

### Step 3: Verify
Refresh the browser and check the unit status.

---

## 🔄 Complete Reset for Multiple Units

If you need to reset multiple units:

```bash
# Reset single unit
node scripts/reset-unit-status.js T1-0102

# Reset multiple units (run separately)
node scripts/reset-unit-status.js T1-0101
node scripts/reset-unit-status.js T1-0102
node scripts/reset-unit-status.js T1-0103
node scripts/reset-unit-status.js T1-0104
```

---

## 🧪 Testing After Reset

### Test 1: Verify Unit Status
1. Open Project Management page
2. Find unit T1-0102
3. **Expected:** Green background with "Đang mở bán" badge

### Test 2: Try Creating New Deposit
1. Click on unit T1-0102
2. Click "Đặt cọc" button
3. Fill in form and submit
4. **Expected:** New deposit should be created successfully

### Test 3: Check Dashboard
1. Navigate to Dashboard
2. Check if old deposit is gone
3. Check if new deposit appears (if you created one)

---

## 🐛 Troubleshooting

### Issue: Script says "Unit not found"
**Solution:** Check the unit code spelling
```bash
# Make sure it's exactly: T1-0102
node scripts/reset-unit-status.js T1-0102
```

### Issue: Unit still shows as DEPOSITED
**Solution 1:** Refresh the browser (Ctrl+F5)

**Solution 2:** Check if there are other active transactions
```bash
# Run script again to see current status
node scripts/reset-unit-status.js T1-0102
```

**Solution 3:** Restart the development server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Script error "Cannot find module"
**Solution:** Make sure you're in the correct directory
```bash
cd apps/ctv-portal
node scripts/reset-unit-status.js T1-0102
```

### Issue: Prisma error
**Solution:** Regenerate Prisma client
```bash
cd apps/ctv-portal
npx prisma generate
node scripts/reset-unit-status.js T1-0102
```

---

## 📊 What the Script Does

### 1. Finds the Unit
- Searches for unit by code (T1-0102)
- Loads all active transactions

### 2. Cancels Active Transactions
- **Deposits:** Status → CANCELLED
- **Bookings:** Status → CANCELLED
- **Reservations:** Status → CANCELLED
- Adds reason: "Reset by admin script"
- Adds marker: [RESET_BY_SCRIPT]

### 3. Updates Unit Status
- Sets unit status to AVAILABLE
- Unit becomes available for new transactions

### 4. Preserves History
- Cancelled transactions remain in database
- Can still be viewed in transaction history
- Audit trail is maintained

---

## ⚠️ Important Notes

### Data Preservation
- ✅ Transactions are cancelled, not deleted
- ✅ History is preserved
- ✅ Audit trail maintained
- ✅ Can view in transaction history

### When to Use Each Method

**Use Dashboard Method When:**
- You want to follow normal workflow
- You need to review deposit details first
- You want to preserve user actions

**Use Script Method When:**
- You need quick reset for testing
- You have multiple units to reset
- You're in development environment

**Use Database Method When:**
- Other methods don't work
- You need fine-grained control
- You're debugging issues

---

## 🎯 Quick Reference

### Reset T1-0102 to AVAILABLE

**Fastest Way:**
```bash
cd apps/ctv-portal
node scripts/reset-unit-status.js T1-0102
```

**Via Dashboard:**
1. Dashboard → Find deposit for T1-0102
2. Click "Xem chi tiết" → "Hủy đặt cọc"
3. Click trash button → Confirm deletion
4. Unit returns to AVAILABLE

**Verify:**
- Project Management page
- Unit T1-0102 should be green
- Badge: "Đang mở bán"

---

## ✅ Success Checklist

After resetting:
- [ ] Unit T1-0102 shows green background
- [ ] Badge says "Đang mở bán"
- [ ] Can click on unit to view details
- [ ] Can create new deposit/booking/reservation
- [ ] Old transactions visible in transaction history
- [ ] No console errors

---

**Status:** ✅ Ready to Use  
**Date:** November 22, 2025  
**Purpose:** Reset unit status for testing and development

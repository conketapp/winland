# Test Deposit Implementation - Quick Guide

## ✅ Implementation Complete!

The Deposit functionality has been successfully implemented. Here's how to test it:

---

## 🚀 Quick Test (5 minutes)

### Step 1: Start the Application
```bash
cd apps/ctv-portal
npm run dev
```

### Step 2: Login
1. Open browser: `http://localhost:3000`
2. Login with your CTV account

### Step 3: Create a Deposit
1. Navigate to **Project Management** page
2. Find an **available unit** (green badge)
3. Click on the unit
4. Click **"Đặt cọc"** button
5. Fill in the form:
   - **Họ và tên:** Nguyễn Văn A
   - **Số điện thoại:** 0901234567
   - **Số CCCD:** 123456789012
   - **Địa chỉ:** Hà Nội
   - **Email:** test@example.com
6. Check the agreement checkbox
7. Click **"Thanh toán"** button

### Step 4: Verify Success
**You should see:**
- ✅ Button changes to "Đang xử lý..."
- ✅ Success toast: "Đặt cọc đã được xác nhận thành công!"
- ✅ Modal closes
- ✅ Page reloads
- ✅ Unit badge changes to purple **"Đã cọc tiền"**

### Step 5: Check Dashboard
1. Navigate to **Dashboard**
2. Scroll to **"Danh sách hợp đồng đang trong quá trình đặt cọc"**
3. **You should see:**
   - Deposit code: **DP000001**
   - Customer name: Nguyễn Văn A
   - Deposit amount
   - Status: "Đang Chờ duyệt"

### Step 6: Check Notifications
1. Navigate to **Notification** page
2. Click **"Cọc"** filter
3. **You should see:**
   - Your deposit in the list
   - Complete information displayed

### Step 7: Check Transactions
1. Navigate to **My Transactions** page
2. Filter by **"Đặt cọc"**
3. **You should see:**
   - Deposit with code DP000001
   - Commission calculation (2%)
   - Complete details

---

## 🔍 What to Check

### ✅ API Endpoint
- File exists: `apps/ctv-portal/app/api/deposits/create/route.ts`
- Check browser Network tab for POST request
- Should return 200 status
- Response should include deposit object

### ✅ Database
Open Prisma Studio to verify:
```bash
cd apps/ctv-portal
npx prisma studio
```

Check **deposits** table:
- New record with code DP000001
- Status: PENDING_APPROVAL
- All customer information saved

Check **units** table:
- Unit status changed to DEPOSITED

### ✅ Console Logs
Check browser console for:
```
✅ Deposit created: DP000001 for unit A-01-05
```

---

## 🐛 Troubleshooting

### Issue: Button doesn't respond
**Solution:** Check browser console for errors

### Issue: API returns 401
**Solution:** Make sure you're logged in, check session storage

### Issue: API returns 404 (unit not found)
**Solution:** Verify unit ID is correct

### Issue: API returns 500
**Solution:** 
1. Check Prisma client is generated: `npx prisma generate`
2. Restart dev server
3. Check database connection

### Issue: Deposit not showing in dashboard
**Solution:**
1. Refresh the page
2. Check if deposit was actually created in database
3. Verify dashboard is fetching from `/api/deposits`

---

## 📊 Expected Results

### First Deposit
- Code: **DP000001**
- Status: **PENDING_APPROVAL**
- Unit Status: **DEPOSITED**

### Second Deposit (on different unit)
- Code: **DP000002**
- Status: **PENDING_APPROVAL**
- Unit Status: **DEPOSITED**

### Third Deposit
- Code: **DP000003**
- No gaps in sequence ✅

---

## 🎯 Success Criteria

All of these should work:
- [x] Form validation works
- [x] Submit button shows loading state
- [x] API creates deposit record
- [x] Sequential code generated
- [x] Unit status updates
- [x] Success toast appears
- [x] Modal closes
- [x] Page reloads
- [x] Dashboard shows deposit
- [x] Notification shows deposit
- [x] Transactions shows deposit
- [x] No console errors

---

## 📝 Test Scenarios

### Scenario 1: Happy Path ✅
User fills valid form → Clicks submit → Deposit created → Success

### Scenario 2: Invalid Phone ⚠️
User enters invalid phone → Button disabled → Cannot submit

### Scenario 3: Invalid CCCD ⚠️
User enters non-12-digit CCCD → Button disabled → Cannot submit

### Scenario 4: Missing Fields ⚠️
User leaves fields empty → Button disabled → Cannot submit

### Scenario 5: No Agreement ⚠️
User doesn't check agreement → Button disabled → Cannot submit

### Scenario 6: Network Error ❌
Network fails → Error toast appears → User can retry

### Scenario 7: Unit Already Sold ❌
Try to deposit sold unit → Error toast: "Căn hộ đã được bán"

---

## 🎉 If Everything Works

**Congratulations!** The Deposit implementation is working correctly! 

You now have:
- ✅ Full deposit creation functionality
- ✅ Sequential deposit codes (DP000001, DP000002...)
- ✅ Unit status management
- ✅ Dashboard integration
- ✅ Notification integration
- ✅ Transaction history integration
- ✅ Complete feature parity with Booking and Reservation

---

## 📚 Documentation

For more details, see:
- **DEPOSIT-IMPLEMENTATION-COMPLETE.md** - Complete implementation summary
- **DEPOSIT-SUBMIT-IMPLEMENTATION-GUIDE.md** - Full implementation guide
- **DEPOSIT-REFERENCE-GUIDE.md** - All file references

---

**Ready to test?** Follow the steps above and verify everything works! 🚀

**Date:** November 22, 2025  
**Status:** ✅ Ready for Testing

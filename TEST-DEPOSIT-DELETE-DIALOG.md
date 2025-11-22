# Test Deposit Delete Dialog - Quick Guide

## ✅ Implementation Complete!

The Delete Deposit Confirmation Dialog has been successfully implemented in the dashboard. Here's how to test it:

---

## 🚀 Quick Test (3 minutes)

### Prerequisites
1. You have at least one deposit with status COMPLETED or CANCELLED
2. Application is running: `npm run dev`
3. You're logged in as a CTV

---

## Test 1: Verify Trash Button Visibility

### Steps:
1. Navigate to **Dashboard** (`/`)
2. Scroll to **"Danh sách hợp đồng đang trong quá trình đặt cọc"**
3. Look at each deposit in the list

### Expected Result:
✅ Deposits with status **"Đã hủy"** (CANCELLED) show trash button (🗑️)  
✅ Deposits with status **"Hoàn thành"** (COMPLETED) show trash button (🗑️)  
❌ Deposits with status **"Chờ duyệt"** (PENDING_APPROVAL) do NOT show trash button  
❌ Deposits with status **"Đã xác nhận"** (CONFIRMED) do NOT show trash button  

**Trash button location:** Right side, next to "Xem chi tiết" button

---

## Test 2: Open Confirmation Dialog

### Steps:
1. Find a deposit with status "Đã hủy" or "Hoàn thành"
2. Click the **trash button** (🗑️)

### Expected Result:
✅ Confirmation dialog appears with:
- **Title:** "Ẩn đặt cọc khỏi dashboard"
- **Message:** "Bạn có chắc chắn muốn xóa đặt cọc này khỏi trang này? Đặt cọc vẫn sẽ được lưu trong lịch sử giao dịch."
- **Buttons:** 
  - "Xóa" button (warning/yellow style)
  - "Hủy" button
- **Backdrop:** Semi-transparent with blur effect

---

## Test 3: Cancel Deletion

### Steps:
1. Open confirmation dialog (from Test 2)
2. Click **"Hủy"** button

### Expected Result:
✅ Dialog closes immediately  
✅ No changes made  
✅ Deposit still visible in list  
✅ No toast notification appears  

---

## Test 4: Confirm Deletion

### Steps:
1. Open confirmation dialog (from Test 2)
2. Click **"Xóa"** button
3. Watch the process

### Expected Result:
✅ Button text changes to **"Đang xóa..."**  
✅ Button becomes disabled during deletion  
✅ After ~1 second:
- Success toast appears: **"Đã ẩn đặt cọc khỏi dashboard!"**
- Dialog closes
- Page refreshes
- Deposit disappears from dashboard list

---

## Test 5: Verify Deposit Still in History

### Steps:
1. After deleting a deposit (from Test 4)
2. Navigate to **My Transactions** page (`/my-transactions`)
3. Filter by **"Đặt cọc"**
4. Look for the deleted deposit

### Expected Result:
✅ Deleted deposit is still visible in transaction history  
✅ Shows complete information  
✅ Status remains CANCELLED or COMPLETED  
✅ Can still view all details  

---

## Test 6: Verify Unit Status Update

### Steps:
1. Note the unit code of the deleted deposit
2. Navigate to **Project Management** page
3. Find the unit

### Expected Result:
✅ If no other active transactions on the unit:
- Unit status returns to **"Đang mở bán"** (green badge)
- Unit is available for new transactions

✅ If other active transactions exist:
- Unit status remains unchanged
- Unit shows appropriate status badge

---

## Test 7: Error Handling

### Test 7a: Network Error
1. Open DevTools → Network tab
2. Set to "Offline"
3. Try to delete a deposit
4. **Expected:** Error toast: "Đã xảy ra lỗi khi xóa đặt cọc"

### Test 7b: Try to Delete Active Deposit
1. Find deposit with status "Chờ duyệt" or "Đã xác nhận"
2. **Expected:** No trash button visible (cannot delete)

---

## Test 8: Visual Tests

### Trash Button Styling
- [ ] Icon is Trash2 (🗑️)
- [ ] Icon size is correct (w-4 h-4)
- [ ] Color is red (light mode: red-600, dark mode: red-400)
- [ ] Hover effect shows background highlight
- [ ] Button has rounded corners
- [ ] Tooltip shows "Xóa đặt cọc" on hover

### Dialog Styling
- [ ] Dialog is centered on screen
- [ ] Backdrop is semi-transparent with blur
- [ ] Title is bold and clear
- [ ] Message is readable
- [ ] Buttons are properly styled
- [ ] Warning color theme (yellow/orange)

### Layout
- [ ] "Xem chi tiết" and trash button are on same line
- [ ] Buttons use flex with justify-between
- [ ] Spacing between buttons is correct
- [ ] Layout works on mobile/tablet/desktop

---

## Test 9: Multiple Deletions

### Steps:
1. Delete first deposit
2. Wait for success
3. Delete second deposit
4. Delete third deposit

### Expected Result:
✅ Each deletion works independently  
✅ No interference between deletions  
✅ Dashboard refreshes after each deletion  
✅ Stats counter updates correctly  

---

## Test 10: Dark Mode

### Steps:
1. Toggle dark mode (moon/sun icon)
2. Look at trash button and dialog

### Expected Result:
✅ Trash button color adapts to dark mode  
✅ Hover effect works in dark mode  
✅ Dialog is readable in dark mode  
✅ All colors have proper contrast  

---

## 🔍 What to Check

### ✅ Browser Console
Should see:
```
Delete deposit error: [if error occurs]
```

No errors if deletion succeeds.

### ✅ Network Tab
Should see:
```
DELETE /api/deposits/[id]
Status: 200 OK
Response: { "success": true, "message": "..." }
```

### ✅ Database (Prisma Studio)
```bash
npx prisma studio
```

Check **deposits** table:
- Deposit notes contains `[HIDDEN_FROM_DASHBOARD]`
- Deposit status unchanged (still CANCELLED or COMPLETED)

Check **units** table:
- Unit status updated to AVAILABLE (if no other transactions)

---

## 🐛 Troubleshooting

### Issue: Trash button not showing
**Solution:** 
- Check deposit status (must be COMPLETED or CANCELLED)
- Refresh page to ensure latest data

### Issue: Dialog doesn't open
**Solution:**
- Check console for errors
- Verify ConfirmDialog component is imported
- Check state variables are defined

### Issue: Deletion fails
**Solution:**
- Check network tab for API errors
- Verify deposit exists in database
- Check deposit status is COMPLETED or CANCELLED
- Ensure API endpoint exists

### Issue: Deposit still visible after deletion
**Solution:**
- Check if page refreshed
- Verify [HIDDEN_FROM_DASHBOARD] marker was added
- Check dashboard filter logic

### Issue: Unit status not updating
**Solution:**
- Check if other active transactions exist on unit
- Verify API checks all transaction types
- Check console logs for status update messages

---

## ✅ Success Criteria

All of these should work:
- [x] Trash button appears for COMPLETED/CANCELLED deposits
- [x] Trash button does NOT appear for active deposits
- [x] Clicking trash button opens confirmation dialog
- [x] Dialog shows correct title and message
- [x] Clicking "Hủy" closes dialog without changes
- [x] Clicking "Xóa" starts deletion process
- [x] Button shows "Đang xóa..." during deletion
- [x] Success toast appears after deletion
- [x] Dialog closes after deletion
- [x] Dashboard refreshes automatically
- [x] Deposit disappears from dashboard
- [x] Deposit still in transaction history
- [x] Unit status updates correctly
- [x] No console errors
- [x] Works in dark mode
- [x] Responsive on all screen sizes

---

## 📊 Comparison Test

Verify that Deposit delete works the same as Booking and Reservation:

| Feature | Booking | Reservation | Deposit |
|---------|---------|-------------|---------|
| Trash button | ✅ | ✅ | Test 1 |
| Confirmation dialog | ✅ | ✅ | Test 2 |
| Cancel deletion | ✅ | ✅ | Test 3 |
| Confirm deletion | ✅ | ✅ | Test 4 |
| Preserve in history | ✅ | ✅ | Test 5 |
| Unit status update | ✅ | ✅ | Test 6 |
| Error handling | ✅ | ✅ | Test 7 |
| Loading state | ✅ | ✅ | Test 4 |
| Success toast | ✅ | ✅ | Test 4 |

---

## 🎉 If Everything Works

**Congratulations!** The Delete Deposit Confirmation Dialog is working perfectly!

You now have:
- ✅ Trash button for completed/cancelled deposits
- ✅ Confirmation dialog to prevent accidents
- ✅ Loading state during deletion
- ✅ Success/error feedback
- ✅ Dashboard auto-refresh
- ✅ Data preservation in history
- ✅ Complete feature parity with Booking and Reservation

---

## 📚 Documentation

For more details, see:
- **DEPOSIT-DELETE-DIALOG-IMPLEMENTATION.md** - Complete implementation details
- **DEPOSIT-DETAIL-MODAL-COMPLETE.md** - Detail modal implementation
- **DEPOSIT-COMPLETE-SUMMARY.md** - Overall deposit features

---

**Ready to test?** Follow the steps above and verify everything works! 🚀

**Date:** November 22, 2025  
**Status:** ✅ Ready for Testing

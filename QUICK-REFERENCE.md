# Quick Reference Guide - Booking Expiry Feature

## 🎯 What This Feature Does

When a booking expires, users can click a Trash button to:
- ✅ Hide the booking from dashboard
- ✅ Return the unit to AVAILABLE status
- ✅ Keep complete booking history
- ✅ Maintain sequential booking IDs

## 📋 Quick Facts

| Aspect | Details |
|--------|---------|
| **Booking Status** | CONFIRMED → EXPIRED → EXPIRED (hidden) |
| **Unit Status** | RESERVED_BOOKING → RESERVED_BOOKING → AVAILABLE |
| **Data Deletion** | Never deleted, only hidden with marker |
| **Booking IDs** | Sequential: BK000001, BK000002, BK000003... |
| **History** | Always preserved in transaction history |
| **Dashboard** | Hidden bookings filtered out |

## 🔄 Status Flow (Simple)

```
1. Create Booking
   Status: CONFIRMED
   Unit: RESERVED_BOOKING

2. Time Passes
   Status: EXPIRED
   Unit: RESERVED_BOOKING (unchanged)

3. Click Trash
   Status: EXPIRED (unchanged)
   Unit: AVAILABLE (if no other transactions)
   Hidden: Yes
```

## 🎨 UI Elements

### Dashboard - Expired Booking
```
┌─────────────────────────────────────┐
│ 📅 Booking                          │
│ Unit: A-01-05  [⏱ Hết hạn]        │
│ Customer: Nguyễn Văn A             │
│ [Xem chi tiết]         [🗑️ Trash] │
└─────────────────────────────────────┘
```

### Transaction History - All Bookings
```
┌─────────────────────────────────────┐
│ 📅 Booking  [⏱ Hết hạn]            │
│ Mã: BK000001                       │
│ Khách hàng: Nguyễn Văn A          │
│ Căn hộ: A-01-05                    │
└─────────────────────────────────────┘
```

## 🔧 API Endpoints

### Check Expired Bookings
```
POST /api/bookings/check-expired
Response: { success: true, expiredCount: 1 }
```

### Delete Booking
```
DELETE /api/bookings/[id]
Response: { success: true, message: "Đã ẩn booking..." }
```

## 💾 Database Changes

### Booking Record
```sql
-- Before Delete
status: 'EXPIRED'
notes: 'Lịch xem nhà: ...'

-- After Delete
status: 'EXPIRED' (unchanged)
notes: 'Lịch xem nhà: ...\n[HIDDEN_FROM_DASHBOARD]'
```

### Unit Record
```sql
-- Before Delete
status: 'RESERVED_BOOKING'

-- After Delete (if no other active transactions)
status: 'AVAILABLE'
```

## ✅ Safety Checks

Before returning unit to AVAILABLE, system checks:
- ✅ No active bookings (CONFIRMED, PENDING_APPROVAL)
- ✅ No active reservations (ACTIVE, YOUR_TURN)
- ✅ No active deposits (PENDING_APPROVAL, CONFIRMED)

If ANY active transaction exists → Unit stays RESERVED_BOOKING

## 📊 Where to Find Bookings

| Location | Shows Hidden? | Purpose |
|----------|---------------|---------|
| Dashboard | ❌ No | Clean view of active bookings |
| Transaction History | ✅ Yes | Complete audit trail |
| Database | ✅ Yes | Permanent storage |

## 🚀 Common Tasks

### Create Booking
1. Go to Planning Area
2. Select unit
3. Click "Booking"
4. Fill form
5. Submit

### Delete Expired Booking
1. Go to Dashboard
2. Find expired booking (⏱ badge)
3. Click Trash button (🗑️)
4. Confirm deletion
5. Booking disappears

### View History
1. Go to My Transactions
2. Filter by "Booking"
3. See all bookings (including deleted)

## 🐛 Troubleshooting

### Booking Not Expiring?
- Refresh dashboard
- Check visit end time is in past
- Verify booking status is CONFIRMED

### Unit Not Becoming AVAILABLE?
- Check for other active bookings
- Check for active reservations
- Check for active deposits

### Booking Disappeared from History?
- This should NEVER happen
- Check database directly
- Contact support

## 📁 Modified Files

1. `apps/ctv-portal/app/api/bookings/[id]/route.ts`
2. `apps/ctv-portal/app/api/bookings/check-expired/route.ts`
3. `apps/ctv-portal/app/api/bookings/complete/route.ts`
4. `apps/ctv-portal/app/api/bookings/cancel/route.ts`

## 📚 Documentation Files

1. `BOOKING-EXPIRY-IMPLEMENTATION.md` - Technical details
2. `BOOKING-EXPIRY-SUMMARY.md` - Feature overview
3. `BOOKING-FLOW-DIAGRAM.md` - Visual diagrams
4. `test-booking-expiry.md` - Testing guide
5. `CHANGES-SUMMARY.md` - Change log
6. `QUICK-REFERENCE.md` - This file

## 🎓 Key Concepts

### Hidden vs Deleted
- **Hidden:** Marked with `[HIDDEN_FROM_DASHBOARD]`, still in database
- **Deleted:** Permanently removed (we NEVER do this)

### Sequential IDs
- Based on total count (including hidden bookings)
- No gaps in sequence
- Example: BK000001, BK000002, BK000003

### Multi-Transaction Safety
- System checks ALL transaction types
- Unit only becomes AVAILABLE when ALL are cleared
- Prevents premature status changes

## 💡 Best Practices

### For Users
- ✅ Delete expired bookings regularly
- ✅ Check transaction history for audit
- ✅ Verify unit status before new booking

### For Developers
- ✅ Never delete bookings from database
- ✅ Always check active transactions
- ✅ Use hidden marker for filtering
- ✅ Maintain sequential IDs

### For Admins
- ✅ Monitor expired booking count
- ✅ Review deletion patterns
- ✅ Check database integrity
- ✅ Backup regularly

## 🔐 Security Notes

- Only booking owner can delete
- Confirmation required for deletion
- Complete audit trail maintained
- No permanent data loss

## 📈 Performance Tips

- Add indexes on status fields
- Cache active transaction counts
- Batch process expired bookings
- Monitor query performance

## 🎉 Success Indicators

✅ Feature working correctly if:
- Expired bookings show Trash button
- Clicking Trash hides booking from dashboard
- Unit returns to AVAILABLE (when safe)
- Booking visible in transaction history
- Booking IDs are sequential
- No database errors

## 📞 Support

Need help?
1. Check troubleshooting section
2. Review documentation files
3. Check database for data integrity
4. Review API logs for errors

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** November 20, 2025  
**Status:** ✅ Complete and Ready to Use

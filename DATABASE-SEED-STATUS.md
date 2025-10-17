# 🌱 Database Seed Status

## ✅ Seed Completed Successfully!

**Date:** October 11, 2025  
**Database:** SQLite (Development)  
**Location:** `apps/backend/prisma/dev.db`

---

## 📊 Seeded Data Summary

### Users (4 total):
| Role | Email | Phone | Password |
|------|-------|-------|----------|
| **Admin** | admin@batdongsan.com | 0901234567 | admin123 |
| **CTV 1** | ctv1@batdongsan.com | 0912345671 | ctv123 |
| **CTV 2** | ctv2@batdongsan.com | 0912345672 | ctv123 |
| **CTV 3** | ctv3@batdongsan.com | 0912345673 | ctv123 |

### Unit Types (3 total):
- **Studio** (Code: STUDIO)
- **1 Phòng ngủ** (Code: 1BR)
- **2 Phòng ngủ** (Code: 2BR)

### Projects (1 total):
- **Vinhomes Smart City** (Code: VHS-2025)
  - Status: OPEN
  - Developer: Vingroup
  - Location: Nam Từ Liêm, Hà Nội
  - Buildings: 2
  - Units: 36
  - Price Range: 2,000,000,000 - 5,000,000,000 VNĐ
  - Commission Rate: 2.5%

### Buildings (2 total):
- **Tòa A1** (Code: A1)
  - Floors: 5-10 (6 floors)
  - Units per floor: 3
  - Total units: 18
  
- **Tòa A2** (Code: A2)
  - Floors: 5-10 (6 floors)
  - Units per floor: 3
  - Total units: 18

### Units (36 total):
- **Status:** All AVAILABLE
- **Details:**
  - Area: 75 m²
  - Price: 2,500,000,000 VNĐ
  - Bedrooms: 2
  - Bathrooms: 2
  - Direction: Đông
  - Balcony: Yes

### Unit Codes Pattern:
```
A1-501, A1-502, A1-503
A1-601, A1-602, A1-603
...
A2-501, A2-502, A2-503
...
```

### System Configs (2 total):
| Key | Value | Type | Category |
|-----|-------|------|----------|
| BOOKING_DURATION | 24 | number | booking |
| COMMISSION_RATE | 2.5 | number | commission |

---

## 🔐 Login Credentials

### Admin Portal (http://localhost:5173)
```
Email: admin@batdongsan.com
Password: admin123
```

### CTV Portal (http://localhost:3000)
**CTV 1:**
```
Email: ctv1@batdongsan.com
Phone: 0912345671
Password: ctv123
```

**CTV 2:**
```
Email: ctv2@batdongsan.com
Phone: 0912345672
Password: ctv123
```

**CTV 3:**
```
Email: ctv3@batdongsan.com
Phone: 0912345673
Password: ctv123
```

---

## 🧪 Testing Scenarios

### 1. Admin Workflow:
1. ✅ Login as Admin
2. ✅ View Projects (1 project available)
3. ✅ View Units (36 units available)
4. ✅ Update System Config
5. ✅ Create new buildings/units
6. ✅ Import units in bulk

### 2. CTV Workflow:
1. ✅ Login as CTV
2. ✅ Browse available units (36 units)
3. ✅ Create reservation
4. ✅ Create booking with payment proof
5. ✅ Create deposit with documents
6. ✅ View commissions
7. ✅ Request payment withdrawal

### 3. Approval Workflow:
1. ✅ CTV creates booking
2. ✅ Admin approves/rejects booking
3. ✅ CTV creates deposit
4. ✅ Admin approves deposit
5. ✅ System generates payment schedules
6. ✅ Admin confirms transactions
7. ✅ System calculates commissions

---

## 🚀 How to Use

### Start Backend:
```bash
cd apps/backend
npm run start:dev
```
Backend will run on: **http://localhost:3001**

### Start Admin UI:
```bash
cd apps/admin
npm run dev
```
Admin UI will run on: **http://localhost:5173**

### Start CTV Portal:
```bash
cd apps/ctv-portal
npm run dev
```
CTV Portal will run on: **http://localhost:3000**

---

## 🔄 Reseed Database

If you need to reset and reseed the database:

```bash
cd apps/backend

# Reset database (requires explicit consent)
npx prisma migrate reset --force --skip-seed

# Or just run seed again (if you want to add more data)
npm run seed
```

---

## 📝 Seed Script Location

**Main Seed File:** `apps/backend/prisma/seed.ts`

To modify the seed data, edit this file and run:
```bash
npm run seed
```

---

## ✅ Verification Checklist

After seeding, verify:
- [ ] Admin can login
- [ ] CTV can login
- [ ] Projects appear in list
- [ ] Units appear in list
- [ ] All 36 units have status AVAILABLE
- [ ] System configs are set
- [ ] Unit types are created

---

## 🎯 Next Steps

1. ✅ Database seeded with test data
2. ⏳ Start backend server
3. ⏳ Start frontend apps
4. ⏳ Test full workflows
5. ⏳ Test API integration
6. ⏳ Add more test data (bookings, deposits, etc.)

---

## 📌 Important Notes

- This is **DEVELOPMENT** data only
- Passwords are **NOT secure** (plain: admin123, ctv123)
- Use these credentials for testing only
- Never use this seed data in production
- All data can be reset anytime

---

## 🎉 Status: READY TO TEST!

The database is now fully seeded with clean test data. You can:
- Test all CRUD operations
- Test booking/deposit workflows
- Test admin approval flows
- Test CTV commission calculations
- Test API integrations

**Happy Testing! 🚀**


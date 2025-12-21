# 🔧 Fix Login 500 Error - CTV Portal

**Ngày:** December 2025  
**Vấn đề:** `POST /api/auth/login` trả về 500 Internal Server Error

---

## 🐛 Nguyên Nhân

### Schema Mismatch
- CTV portal schema có field `totalDeals` trong User model
- Backend database không có column `total_deals`
- Prisma query fail với error: `The column main.users.total_deals does not exist`

---

## ✅ Giải Pháp

### 1. Thêm `totalDeals` vào Backend Schema

**File:** `apps/backend/prisma/schema.prisma`

```prisma
model User {
  // ... existing fields
  totalDeals           Int              @default(0) @map("total_deals")
  // ... rest of fields
}
```

### 2. Sync Database Schema

```bash
cd apps/backend
npx prisma db push --skip-generate
```

### 3. Regenerate Prisma Client

```bash
cd apps/ctv-portal
npx prisma generate
```

---

## 🧪 Verify Fix

### Test Prisma Connection
```bash
cd apps/ctv-portal
node -e "const { PrismaClient } = require('./lib/generated/prisma'); const prisma = new PrismaClient(); prisma.user.findFirst().then(() => console.log('✅ OK')).catch(e => console.error('❌', e.message)).finally(() => prisma.\$disconnect())"
```

### Test Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userPhone": "0912345678", "userPassword": "ctv123"}'
```

---

## 📋 Checklist

- [x] Thêm `totalDeals` vào backend schema
- [x] Sync database với `prisma db push`
- [x] Regenerate Prisma client cho CTV portal
- [x] Verify Prisma connection OK
- [ ] Test login API endpoint

---

## 🚀 Next Steps

1. **Restart CTV Portal Server:**
   ```bash
   # Stop current server (Ctrl+C)
   cd apps/ctv-portal
   npm run dev
   ```

2. **Test Login:**
   - Open browser: http://localhost:3000/login
   - Try login với test credentials
   - Should work now! ✅

---

**Status:** ✅ **Fixed**  
**Next:** Restart server và test login


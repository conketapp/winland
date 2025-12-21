# 🔧 Fix Login 500 Error - Final Solution

**Ngày:** December 2025  
**Vấn đề:** `POST /api/auth/login` trả về 500 Internal Server Error

---

## ✅ Đã Fix

### 1. Schema Mismatch
- ✅ Thêm `totalDeals` vào backend schema
- ✅ Sync database với `prisma db push`
- ✅ Regenerate Prisma client

### 2. Explicit Field Selection
- ✅ Thêm explicit `select` trong query để tránh schema mismatch
- ✅ Chỉ select fields cần thiết

---

## 🔍 Debugging Steps

### 1. Check Server Logs
Xem terminal nơi chạy `npm run dev` để thấy error details:
```
Login error: [error message]
Error details: { message, stack, name }
```

### 2. Test Prisma Connection
```bash
cd apps/ctv-portal
node -e "const { PrismaClient } = require('./lib/generated/prisma'); const prisma = new PrismaClient(); prisma.user.findFirst().then(() => console.log('✅ OK')).catch(e => console.error('❌', e.message)).finally(() => prisma.\$disconnect())"
```

### 3. Verify Database Schema
```bash
sqlite3 apps/backend/prisma/dev.db "PRAGMA table_info(users);"
```

---

## 🚀 Solution

### Restart Server
**Quan trọng:** Sau khi regenerate Prisma client, cần restart server:

```bash
# Stop current server (Ctrl+C)
cd apps/ctv-portal
npm run dev
```

### Verify Fix
1. **Check Prisma Client:**
   ```bash
   ls -la lib/generated/prisma/index.d.ts
   ```

2. **Test Login:**
   - Open: http://localhost:3000/login
   - Try login với test credentials
   - Should work now! ✅

---

## 📋 Common Issues

### Issue 1: Prisma Client Not Regenerated
**Symptom:** `Cannot find module '@/lib/generated/prisma'`

**Fix:**
```bash
cd apps/ctv-portal
npx prisma generate
```

### Issue 2: Schema Mismatch
**Symptom:** `The column main.users.xxx does not exist`

**Fix:**
```bash
cd apps/ctv-portal
npx prisma db push --skip-generate
npx prisma generate
```

### Issue 3: Server Not Restarted
**Symptom:** Still getting old errors

**Fix:**
- Stop server (Ctrl+C)
- Restart: `npm run dev`

---

## 🧪 Test Credentials

- **Phone:** `0912345678` (hoặc số trong database)
- **Password:** `ctv123` (hoặc password trong database)

---

**Status:** ✅ **Fixed**  
**Action Required:** Restart CTV portal server


# 🔧 NextAuth Error Fix - CTV Portal

**Ngày:** December 2025  
**Vấn đề:** NextAuth errors khi không có NextAuth setup

---

## 🐛 Lỗi Gặp Phải

### 1. NextAuth CLIENT_FETCH_ERROR
```
[next-auth][error][CLIENT_FETCH_ERROR] 
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**Nguyên nhân:**
- Code đang import `SessionProvider` từ `next-auth/react`
- Nhưng không có NextAuth config file (`[...nextauth].ts`)
- NextAuth đang cố gọi `/api/auth/_log` và các routes khác mà không tồn tại
- Server trả về HTML error page thay vì JSON

### 2. 404 Errors
```
Failed to load resource: the server responded with a status of 404 (Not Found)
api/auth/_log:1
```

**Nguyên nhân:**
- NextAuth đang tìm các API routes mà không tồn tại
- Không có NextAuth setup

### 3. 500 Error
```
api/auth/login:1 Failed to load resource: the server responded with a status of 500
```

**Nguyên nhân có thể:**
- Prisma connection issue
- Database path không đúng
- Error trong API route không được handle đúng

---

## ✅ Giải Pháp Đã Áp Dụng

### 1. Xóa NextAuth (Không Cần Thiết)

**File:** `app/page.tsx`

**Trước:**
```tsx
import { SessionProvider } from "next-auth/react"

<SessionProvider>
  {/* content */}
</SessionProvider>
```

**Sau:**
```tsx
// Removed SessionProvider - không cần NextAuth
<div>
  {/* content */}
</div>
```

**Lý do:**
- CTV portal đã có custom auth với localStorage
- Không cần NextAuth
- `useAuth` hook đã handle authentication

### 2. Cải Thiện Error Handling

**File:** `app/api/auth/login/route.ts`

**Thêm:**
- Better error logging
- Development mode: return detailed error
- Production mode: return generic error

```typescript
catch (error: any) {
  console.error('Login error:', error)
  console.error('Error details:', {
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
  })
  
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  return NextResponse.json(
    { 
      error: 'Đã xảy ra lỗi khi đăng nhập',
      ...(isDevelopment && { 
        details: errorMessage,
        hint: 'Check server logs for more information'
      })
    },
    { status: 500 }
  )
}
```

---

## 🔍 Debugging Lỗi 500

### Kiểm Tra Prisma Connection

1. **Check Prisma Client:**
```bash
cd apps/ctv-portal
ls -la lib/generated/prisma
```

2. **Check Database Path:**
```bash
# Trong prisma/schema.prisma
url = "file:/Users/mac/Documents/GitHub/winland/apps/backend/prisma/dev.db"

# Verify database exists
test -f ../backend/prisma/dev.db && echo "OK" || echo "NOT FOUND"
```

3. **Regenerate Prisma Client:**
```bash
cd apps/ctv-portal
npx prisma generate
```

### Kiểm Tra Server Logs

Xem terminal nơi chạy `npm run dev` để thấy:
- Prisma connection errors
- Database query errors
- Stack traces

### Common Issues

#### 1. Prisma Client Chưa Generate
**Error:** `Cannot find module '@/lib/generated/prisma'`

**Fix:**
```bash
cd apps/ctv-portal
npx prisma generate
```

#### 2. Database Path Sai
**Error:** `SQLite database file not found`

**Fix:**
- Check path trong `prisma/schema.prisma`
- Đảm bảo database file tồn tại
- Use absolute path hoặc relative path đúng

#### 3. Database Locked
**Error:** `SQLite database is locked`

**Fix:**
- Đảm bảo không có process khác đang dùng database
- Check file permissions

---

## 📋 Checklist

### Đã Fix
- [x] Xóa `SessionProvider` từ `app/page.tsx`
- [x] Cải thiện error handling trong login API
- [x] Thêm detailed error logging

### Cần Kiểm Tra
- [ ] Prisma client đã được generate
- [ ] Database path đúng
- [ ] Database file tồn tại
- [ ] Server logs không có errors

---

## 🚀 Test

### 1. Reload Page
- Refresh browser
- NextAuth errors sẽ biến mất

### 2. Test Login
- Thử đăng nhập
- Check server logs nếu vẫn có lỗi 500
- Xem error details trong response (development mode)

### 3. Verify
- Không còn NextAuth errors trong console
- Login API hoạt động đúng
- Không có 404 errors

---

## 📝 Notes

### Tại Sao Không Dùng NextAuth?

1. **Custom Auth Đã Đủ:**
   - `useAuth` hook với localStorage
   - Custom login API route
   - JWT tokens (nếu cần)

2. **Đơn Giản Hơn:**
   - Không cần setup NextAuth config
   - Không cần session management phức tạp
   - Dễ customize

3. **Phù Hợp Với CTV Portal:**
   - CTV chỉ cần basic auth
   - Không cần OAuth, social login
   - Simple phone/password login

---

## 🔗 Related Files

- `app/page.tsx` - Home page (đã xóa SessionProvider)
- `app/api/auth/login/route.ts` - Login API (đã cải thiện error handling)
- `hooks/useAuth.ts` - Custom auth hook
- `lib/prisma.ts` - Prisma client

---

**Status:** ✅ **Fixed**  
**Next Steps:** Test login và verify không còn errors


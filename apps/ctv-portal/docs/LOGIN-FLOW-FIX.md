# Login Flow Fix - SessionStorage Issue

## Problem
The dashboard was showing "No user phone found, redirecting to login" because the authentication page was removing `login:userPhone` from sessionStorage.

## Root Cause
In `app/login/authentication/page.tsx`, the code was clearing both phone and password:
```typescript
// ❌ OLD CODE - Removed both
sessionStorage.removeItem('login:userPhone');
sessionStorage.removeItem('login:userPassword');
```

## Solution
Keep the phone number in sessionStorage (needed for dashboard), but remove the password (security):
```typescript
// ✅ NEW CODE - Keep phone, remove password
sessionStorage.removeItem('login:userPassword');
// login:userPhone stays in sessionStorage
```

## Login Flow (Updated)

```
1. Login Page (/login)
   ↓
   User enters credentials
   ↓
   API validates credentials
   ↓
   Store in sessionStorage:
   - login:userPhone ✓
   - login:userId ✓
   - login:userRole ✓
   - login:userName ✓
   ↓
2. Authentication Page (/login/authentication)
   ↓
   Read phone from sessionStorage
   ↓
   User enters OTP
   ↓
   Remove password (security)
   Keep phone (needed for dashboard) ✓
   ↓
3. Dashboard (/dashboard)
   ↓
   Read phone from sessionStorage ✓
   ↓
   Call API with phone
   ↓
   Display user data from database ✓
```

## SessionStorage Data

### After Login
```javascript
sessionStorage = {
  'login:userPhone': '0912345678',
  'login:userId': 'uuid',
  'login:userRole': 'CTV',
  'login:userName': 'Test CTV User'
}
```

### After OTP (Before Fix)
```javascript
sessionStorage = {
  // ❌ Everything removed!
}
```

### After OTP (After Fix)
```javascript
sessionStorage = {
  'login:userPhone': '0912345678', // ✓ Kept for dashboard
  'login:userId': 'uuid',
  'login:userRole': 'CTV',
  'login:userName': 'Test CTV User'
}
```

## Testing Steps

1. **Clear sessionStorage** (to start fresh):
   ```javascript
   // In browser console
   sessionStorage.clear()
   ```

2. **Login**:
   - Go to: http://localhost:3000/login
   - Phone: `0912345678`
   - Password: `Test@123`
   - Click "Đăng nhập"

3. **Check sessionStorage** (in browser console):
   ```javascript
   console.log(sessionStorage.getItem('login:userPhone'))
   // Should show: "0912345678"
   ```

4. **OTP Page**:
   - Enter any 6 digits
   - Click "Xác nhận"
   - Wait 5 seconds (simulated API call)

5. **Check sessionStorage again**:
   ```javascript
   console.log(sessionStorage.getItem('login:userPhone'))
   // Should still show: "0912345678" ✓
   ```

6. **Dashboard**:
   - Should load successfully
   - Should display: "Test CTV User"
   - No redirect to login ✓

## Files Modified

1. **`app/login/authentication/page.tsx`**
   - Removed: `sessionStorage.removeItem('login:userPhone')`
   - Kept: `sessionStorage.removeItem('login:userPassword')`

## Security Note

We only remove the password from sessionStorage for security reasons. The phone number is safe to keep as it's needed for:
- Dashboard user data fetching
- API authentication
- User session management

In production, consider using:
- JWT tokens instead of sessionStorage
- HTTP-only cookies
- Refresh token mechanism

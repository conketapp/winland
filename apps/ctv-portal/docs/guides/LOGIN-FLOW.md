# Complete Login Flow Guide

## Overview
Step-by-step guide for the complete authentication flow in CTV Portal.

## Flow Diagram

```
┌─────────────────┐
│   Login Page    │
│  /login         │
└────────┬────────┘
         │
         │ 1. User enters credentials
         │    Phone: 0912345678
         │    Password: Test@123
         ▼
┌─────────────────┐
│ API Validation  │
│ /api/auth/login │
└────────┬────────┘
         │
         │ 2. Check database
         │    - Find user by phone
         │    - Verify password
         │    - Check if active
         ▼
┌─────────────────┐
│ Store Session   │
│ sessionStorage  │
└────────┬────────┘
         │
         │ 3. Store user data
         │    - login:userPhone
         │    - login:userId
         │    - login:userRole
         │    - login:userName
         ▼
┌─────────────────┐
│   OTP Page      │
│ /login/auth     │
└────────┬────────┘
         │
         │ 4. User enters OTP
         │    (6 digits)
         ▼
┌─────────────────┐
│ Verify OTP      │
│ (Simulated)     │
└────────┬────────┘
         │
         │ 5. OTP verified
         │    Keep phone in storage
         │    Remove password
         ▼
┌─────────────────┐
│   Dashboard     │
│ /dashboard      │
└────────┬────────┘
         │
         │ 6. Fetch user data
         │    GET /api/user/me
         ▼
┌─────────────────┐
│ Display Data    │
│ - Full Name     │
│ - Total Deals   │
│ - Role          │
└─────────────────┘
```

## Detailed Steps

### Step 1: Login Page (`/login`)

**User Actions:**
1. Enter phone number
2. Enter password
3. Click "Đăng nhập"

**System Actions:**
```typescript
// Call login API
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ userPhone, userPassword })
})

// Store user data
sessionStorage.setItem('login:userPhone', userPhone)
sessionStorage.setItem('login:userId', data.user.id)
sessionStorage.setItem('login:userRole', data.user.role)
sessionStorage.setItem('login:userName', data.user.fullName)

// Redirect to OTP
router.push('/login/authentication')
```

### Step 2: API Validation (`/api/auth/login`)

**Process:**
1. Receive credentials
2. Find user by phone in database
3. Verify password (currently plain text, should use bcrypt)
4. Check if user is active
5. Return user data (excluding password)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "0912345678",
    "fullName": "Test CTV User",
    "role": "CTV",
    "isActive": true
  }
}
```

### Step 3: OTP Page (`/login/authentication`)

**User Actions:**
1. View phone number (from sessionStorage)
2. Enter 6-digit OTP
3. Click "Xác nhận"

**System Actions:**
```typescript
// Read phone from sessionStorage
const phone = sessionStorage.getItem('login:userPhone')

// Verify OTP (currently simulated)
setTimeout(() => {
  // Keep phone for dashboard
  // Remove password for security
  sessionStorage.removeItem('login:userPassword')
  
  // Redirect to dashboard
  router.push('/dashboard')
}, 5000)
```

**Important:** The phone is kept in sessionStorage for dashboard use.

### Step 4: Dashboard (`/dashboard`)

**System Actions:**
```typescript
// Get phone from sessionStorage
const userPhone = sessionStorage.getItem('login:userPhone')

// Fetch full user data
const response = await fetch('/api/user/me', {
  headers: { 'x-user-phone': userPhone }
})

// Display user data
setUserData(data.user)
```

**Displays:**
- User's full name
- Total deals
- Role
- Avatar (if available)

## SessionStorage Data

### After Login
```javascript
{
  'login:userPhone': '0912345678',
  'login:userId': 'uuid',
  'login:userRole': 'CTV',
  'login:userName': 'Test CTV User'
}
```

### After OTP
```javascript
{
  'login:userPhone': '0912345678',  // Kept
  'login:userId': 'uuid',
  'login:userRole': 'CTV',
  'login:userName': 'Test CTV User'
  // password removed for security
}
```

## Security Considerations

### Current Implementation
- ⚠️ Passwords stored in plain text (development only)
- ✅ Password excluded from API responses
- ✅ User phone required for API calls
- ✅ Active status checked

### Production Recommendations
1. **Use bcrypt** for password hashing
2. **Implement JWT** tokens instead of sessionStorage
3. **Add refresh tokens** for session management
4. **Use HTTP-only cookies** for tokens
5. **Implement rate limiting** on login attempts
6. **Add CAPTCHA** for bot protection

## Testing

### Manual Test
```bash
# 1. Start dev server
npm run dev

# 2. Open browser
http://localhost:3000/login

# 3. Login
Phone: 0912345678
Password: Test@123

# 4. Enter OTP
Any 6 digits

# 5. Verify dashboard loads
```

### Automated Test
```bash
# Test database connection
npm run script:test:db

# Run diagnostics
npm run script:diagnose
```

## Troubleshooting

### Login Fails
- Check credentials
- Verify user exists: `npm run script:test:db`
- Check server logs

### OTP Page Shows Wrong Phone
- Check sessionStorage in browser console
- Verify login API stores phone correctly

### Dashboard Redirects to Login
- Check if phone is in sessionStorage
- Verify OTP page doesn't clear phone
- See [Login Issues](../troubleshooting/LOGIN-ISSUES.md)

### 500 Error on Dashboard
- Restart dev server
- Clear .next cache
- See [500 Error Fix](../troubleshooting/500-ERROR-FIX.md)

## Files

- `app/login/page.tsx` - Login page
- `app/login/authentication/page.tsx` - OTP page
- `app/dashboard/page.tsx` - Dashboard
- `app/api/auth/login/route.ts` - Login API
- `app/api/user/me/route.ts` - User data API

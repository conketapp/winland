# Login Issues Troubleshooting

## Common Problems

### 1. "No user phone found, redirecting to login"

**Cause:** sessionStorage doesn't have user phone.

**Solution:**
```javascript
// Check in browser console
console.log(sessionStorage.getItem('login:userPhone'))

// If null, login again
```

**Why it happens:**
- OTP page was clearing the phone from sessionStorage
- Browser cleared storage
- Logged in on different tab

**Fix:**
The authentication page now keeps the phone in sessionStorage.

### 2. Invalid Credentials

**Cause:** Wrong phone or password.

**Test Credentials:**
- Phone: `0912345678`
- Password: `Test@123`

**Solution:**
```bash
# Recreate test user
npm run script:user:create
```

### 3. User Not Found in Database

**Cause:** User doesn't exist in database.

**Solution:**
```bash
# Check if user exists
npm run script:test:db

# Create test user
npm run script:user:create
```

### 4. Password Doesn't Meet Requirements

**Requirements:**
- ✓ Minimum 8 characters
- ✓ Uppercase letter (A-Z)
- ✓ Lowercase letter (a-z)
- ✓ Special character (!@#$%^&*...)

**Valid Examples:**
- `Test@123` ✅
- `MyPass@2024` ✅
- `Welcome#123` ✅

**Invalid Examples:**
- `test123` ❌ (no uppercase, no special char)
- `Test1234` ❌ (no special char)
- `TestPass` ❌ (no special char)

### 5. Redirect Loop

**Cause:** sessionStorage keeps getting cleared.

**Solution:**
1. Clear all browser data
2. Close all tabs
3. Restart browser
4. Login again

### 6. OTP Page Issues

**Cause:** Credentials not passed to OTP page.

**Check:**
```javascript
// On OTP page, check console
console.log(sessionStorage.getItem('login:userPhone'))
```

**Solution:**
Make sure login page stores credentials before redirect.

## Login Flow Verification

### Step 1: Login Page
```
1. Enter phone: 0912345678
2. Enter password: Test@123
3. Click "Đăng nhập"
4. Should redirect to OTP page
```

### Step 2: Check sessionStorage
```javascript
// Should have these keys
sessionStorage.getItem('login:userPhone')    // "0912345678"
sessionStorage.getItem('login:userId')       // "uuid"
sessionStorage.getItem('login:userRole')     // "CTV"
sessionStorage.getItem('login:userName')     // "Test CTV User"
```

### Step 3: OTP Page
```
1. Enter any 6 digits
2. Click "Xác nhận"
3. Wait 5 seconds
4. Should redirect to dashboard
```

### Step 4: Dashboard
```
1. Should load user data
2. Should display "Test CTV User"
3. Should show totalDeals: 25
4. No errors in console
```

## Quick Fixes

### Reset Everything
```bash
# 1. Clear browser storage
# F12 → Application → Clear storage

# 2. Recreate test user
npm run script:user:create

# 3. Restart dev server
# Ctrl+C
npm run dev

# 4. Login again
```

### Test Database Connection
```bash
npm run script:test:db
```

### Run Full Diagnostics
```bash
npm run script:diagnose
```

## Prevention

### Best Practices
1. Don't clear sessionStorage manually
2. Use same browser tab for entire flow
3. Don't refresh during login process
4. Keep dev server running

### Development
1. Use test credentials consistently
2. Recreate test user after schema changes
3. Clear cache after major updates

## Still Having Issues?

### Debug Steps
1. Open browser console (F12)
2. Check for errors
3. Verify sessionStorage has data
4. Check network tab for API calls
5. Look at server terminal for errors

### Get Help
Provide:
- Browser console errors
- Server terminal output
- Steps to reproduce
- Screenshots if helpful

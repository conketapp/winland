# Fix 500 Error - API Issues

## Problem
API returns 500 Internal Server Error:
```
GET http://localhost:3000/api/user/me 500 (Internal Server Error)
```

## Common Causes

### 1. Prisma Client Not Updated
After schema changes, the Prisma client needs to be regenerated.

**Solution:**
```bash
npx prisma generate
```

### 2. Next.js Cache
Dev server is using cached modules.

**Solution:**
```bash
# Stop server (Ctrl+C)
Remove-Item -Recurse -Force .next
npm run dev
```

### 3. Database Connection
Database is not accessible or credentials are wrong.

**Solution:**
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Test connection
npm run script:test:db
```

### 4. Missing Field in Database
Schema and database are out of sync.

**Solution:**
```bash
npx prisma db push
npx prisma generate
```

## Step-by-Step Fix

### Step 1: Run Diagnostics
```bash
npm run script:diagnose
```

This will check:
- ✅ Prisma client exists
- ✅ Database connection
- ✅ User data
- ✅ Schema file

### Step 2: Check Server Logs
Look at terminal where `npm run dev` is running for error details.

### Step 3: Test Database Directly
```bash
npm run script:test:db
```

If this works, the issue is with the Next.js server cache.

### Step 4: Clear Cache and Restart
```bash
# Stop server
Ctrl + C

# Clear cache
Remove-Item -Recurse -Force .next

# Restart
npm run dev
```

### Step 5: Clear Browser Cache
- Press `F12` → Application → Clear storage
- Or `Ctrl + Shift + R` for hard refresh

## Verification

After fixing, you should see:
- ✅ No 500 errors
- ✅ User data loads correctly
- ✅ Dashboard displays properly

## Prevention

### After Schema Changes
Always run:
```bash
npx prisma db push
npx prisma generate
# Restart dev server
```

### Regular Maintenance
```bash
# Clear cache periodically
Remove-Item -Recurse -Force .next

# Test database connection
npm run script:test:db
```

## Still Not Working?

### Check These
1. Database is running
2. DATABASE_URL is correct in .env
3. User exists in database
4. sessionStorage has userPhone
5. No TypeScript errors

### Get Help
Run diagnostics and share output:
```bash
npm run script:diagnose > diagnostics.txt
```

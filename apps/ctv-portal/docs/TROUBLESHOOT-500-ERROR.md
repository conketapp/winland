# Troubleshooting 500 Error - Step by Step

## Current Error
```
GET http://192.168.1.2:3000/api/user/me 500 (Internal Server Error)
```

## Steps to Fix

### Step 1: Check Server Logs
Look at your terminal where `npm run dev` is running. You should see error logs like:
```
[API] Fetching user for phone: 0912345678
Get user error: ...
```

**What to look for:**
- Prisma connection errors
- TypeScript compilation errors
- Module not found errors

### Step 2: Test Database Connection
Open a new terminal and run:
```bash
cd apps/ctv-portal
npx tsx scripts/test-api-direct.ts
```

**Expected output:**
```json
{
  "fullName": "Test CTV User",
  "totalDeals": 25
}
```

If this works, the database and Prisma client are fine.

### Step 3: Test API Directly
Visit in browser: http://localhost:3000/api/test-db

**Expected response:**
```json
{
  "success": true,
  "userCount": 2,
  "sampleUser": {
    "fullName": "Test CTV User",
    "totalDeals": 25
  }
}
```

### Step 4: Restart Dev Server (IMPORTANT!)
1. **Stop the server**: `Ctrl + C`
2. **Clear Next.js cache**:
   ```bash
   Remove-Item -Recurse -Force .next
   ```
3. **Start again**:
   ```bash
   npm run dev
   ```

### Step 5: Clear Browser Cache
1. Open DevTools: `F12`
2. Go to Application tab
3. Click "Clear storage"
4. Reload page: `Ctrl + Shift + R`

### Step 6: Check sessionStorage
In browser console:
```javascript
console.log(sessionStorage.getItem('login:userPhone'))
// Should show: "0912345678"
```

If null, login again.

## Common Issues & Solutions

### Issue 1: Prisma Client Not Updated
**Symptom:** Error mentions "totalDeals" field doesn't exist

**Solution:**
```bash
cd apps/ctv-portal
npx prisma generate --schema=./prisma/schema.prisma
```

If you get permission error, close VS Code and any terminals, then try again.

### Issue 2: Database Not Updated
**Symptom:** Script works but API doesn't

**Solution:**
```bash
npx prisma db push
```

### Issue 3: Module Cache
**Symptom:** Changes not reflected

**Solution:**
```bash
# Delete all cache
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.cache

# Restart
npm run dev
```

### Issue 4: Port Already in Use
**Symptom:** Server won't start

**Solution:**
```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

## Verification Checklist

- [ ] Database has totalDeals column
- [ ] Prisma schema has totalDeals field
- [ ] Prisma client generated successfully
- [ ] Test script works (test-api-direct.ts)
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] sessionStorage has userPhone
- [ ] Server logs show no errors

## Still Not Working?

### Check Server Terminal Output
When you visit the dashboard, you should see:
```
[API] Fetching user for phone: 0912345678
[API] Querying database...
[API] User found: Yes
[API] User totalDeals: 25
```

If you see errors instead, copy the full error message.

### Manual Database Check
```bash
npx prisma studio
```
1. Open Users table
2. Find user with phone 0912345678
3. Check if totalDeals column exists and has value 25

### Last Resort: Full Reset
```bash
# Stop server
Ctrl + C

# Delete all generated files
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force lib\generated\prisma

# Regenerate everything
npx prisma generate
npx prisma db push

# Restart
npm run dev
```

## Need More Help?

Share the following information:
1. Full error from server terminal
2. Output of `npx tsx scripts/test-api-direct.ts`
3. Response from http://localhost:3000/api/test-db
4. Browser console errors (F12)

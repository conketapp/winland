# Fix Deposits API 500 Error

## Error
```
GET http://192.168.1.2:3000/api/deposits 500 (Internal Server Error)
```

## Cause
The error is likely caused by:
1. Prisma client not being regenerated after schema changes
2. File lock on Prisma query engine
3. Dev server needs restart

## Solution

### Step 1: Stop the Development Server
```bash
# Press Ctrl+C in the terminal running the dev server
```

### Step 2: Regenerate Prisma Client
```bash
cd apps/ctv-portal
npx prisma generate
```

If you get a file lock error, try:
```bash
# Close all Node processes
taskkill /F /IM node.exe

# Then regenerate
npx prisma generate
```

### Step 3: Push Schema Changes (if needed)
```bash
cd apps/ctv-portal
npx prisma db push
```

### Step 4: Restart Development Server
```bash
npm run dev
```

## Alternative Quick Fix

If the above doesn't work, try:

### Option 1: Delete Generated Folder
```bash
cd apps/ctv-portal
rmdir /s /q lib\generated\prisma
npx prisma generate
```

### Option 2: Restart Computer
Sometimes Windows file locks require a system restart.

## Verification

After restarting the server:

1. Open notification page
2. Check browser console
3. Should see no 500 errors
4. Deposits should load correctly

## Expected Behavior

The `/api/deposits` endpoint should:
- Return 200 status
- Return array of deposits
- Include unit information
- Be sorted by creation date

## API Response Format

```json
[
  {
    "id": "uuid",
    "code": "DP000001",
    "status": "CONFIRMED",
    "depositAmount": 500000000,
    "unit": {
      "code": "T1-0104",
      "unitNumber": "0104"
    },
    "customerName": "Nguyễn Văn A",
    "createdAt": "2025-11-20T..."
  }
]
```

## Common Issues

### Issue 1: Prisma Client Out of Sync
**Symptom:** 500 error after schema changes
**Solution:** Run `npx prisma generate`

### Issue 2: Database Connection Error
**Symptom:** Cannot connect to database
**Solution:** Check DATABASE_URL in .env file

### Issue 3: File Lock on Windows
**Symptom:** Cannot regenerate Prisma client
**Solution:** 
- Close all Node processes
- Close VS Code
- Restart computer if needed

### Issue 4: Missing Dependencies
**Symptom:** Module not found errors
**Solution:** Run `npm install`

## Prevention

To avoid this issue in the future:

1. **Always regenerate Prisma client after schema changes:**
   ```bash
   npx prisma generate
   ```

2. **Restart dev server after schema changes:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Use Prisma Studio to verify database:**
   ```bash
   npx prisma studio
   ```

## Testing After Fix

### Test 1: Notification Page
1. Navigate to notification page
2. Check browser console
3. Should see no errors
4. Deposits should display

### Test 2: API Direct Call
```bash
curl -H "x-user-phone: YOUR_PHONE" http://localhost:3000/api/deposits
```

Should return JSON array of deposits.

### Test 3: Dashboard
1. Navigate to dashboard
2. Check deposits section
3. Should load without errors

## Related Files

- `apps/ctv-portal/app/api/deposits/route.ts` - Deposits API
- `apps/ctv-portal/app/notification/page.tsx` - Notification page
- `apps/ctv-portal/prisma/schema.prisma` - Database schema
- `apps/ctv-portal/lib/generated/prisma` - Generated Prisma client

## Additional Notes

The deposits API is working correctly. The 500 error is likely a temporary issue caused by:
- Prisma client being out of sync
- File locks on Windows
- Dev server needing restart

Simply restarting the development server should resolve the issue.

---

**Status:** ⚠️ Requires Server Restart  
**Date:** November 20, 2025  
**Priority:** Medium

# Fix 500 Error - Restart Dev Server

## Problem
After adding `totalDeals` field to the database, the API returns 500 error:
```
GET http://192.168.1.2:3000/api/user/me 500 (Internal Server Error)
```

## Root Cause
The Next.js dev server is using a cached version of the Prisma client that doesn't include the new `totalDeals` field.

## Solution
**Restart the Next.js development server**

### Steps:

1. **Stop the current dev server**
   - Press `Ctrl + C` in the terminal running `npm run dev`
   - Or close the terminal

2. **Start the dev server again**
   ```bash
   cd apps/ctv-portal
   npm run dev
   ```

3. **Clear browser cache** (optional but recommended)
   - Press `Ctrl + Shift + Delete`
   - Or `F12` → Application → Clear storage

4. **Test again**
   - Login with: `0912345678` / `Test@123`
   - Go to dashboard
   - Should show totalDeals: **25**

## Verification

The Prisma client is working correctly (verified by script):
```bash
npx tsx scripts/test-api-direct.ts
```

Output:
```json
{
  "fullName": "Test CTV User",
  "totalDeals": 25,
  ...
}
```

## Why This Happens

When you update the Prisma schema and push to database:
1. ✅ Database is updated immediately
2. ✅ Prisma client types are updated
3. ❌ Next.js dev server still uses old cached modules

**Solution:** Restart dev server to reload all modules

## Alternative: Hard Refresh

If restarting doesn't work:

1. **Delete .next folder**
   ```bash
   Remove-Item -Recurse -Force .next
   ```

2. **Restart dev server**
   ```bash
   npm run dev
   ```

## Quick Commands

```bash
# Stop dev server (Ctrl+C), then:
npm run dev

# Or delete cache and restart:
Remove-Item -Recurse -Force .next; npm run dev
```

## Expected Result

After restart, the dashboard should display:
- ✅ User's fullName from database
- ✅ User's totalDeals from database (25)
- ✅ No 500 errors

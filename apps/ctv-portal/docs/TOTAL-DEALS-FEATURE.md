# Total Deals Feature

## Overview
Added `totalDeals` field to track the number of transactions completed by each user (CTV).

## Database Schema Update

### Added Field
```prisma
model User {
  // ... existing fields
  totalDeals  Int  @default(0) @map("total_deals")
  // ... other fields
}
```

**Field Details:**
- **Name:** `totalDeals`
- **Type:** `Int` (Integer)
- **Default:** `0`
- **Database Column:** `total_deals`
- **Purpose:** Track total number of deals/transactions completed by user

## Implementation

### 1. Database Migration
```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 2. Update Existing Users
Script: `scripts/update-user-deals.ts`

Assigns random totalDeals (5-50) to existing users:
```typescript
const totalDeals = randomInt(5, 50)
await prisma.user.update({
  where: { id: user.id },
  data: { totalDeals }
})
```

**Run:**
```bash
npx tsx scripts/update-user-deals.ts
```

### 3. API Updates

#### User API (`/api/user/me`)
Now returns `totalDeals`:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "fullName": "Test CTV User",
    "totalDeals": 5,
    // ... other fields
  }
}
```

#### Signup API (`/api/auth/signup`)
New users get random totalDeals (0-10):
```typescript
const randomDeals = Math.floor(Math.random() * 11)
const newUser = await prisma.user.create({
  data: {
    // ... other fields
    totalDeals: randomDeals,
  }
})
```

### 4. Dashboard Display

**Before:**
```typescript
<h2>{mockUser?.totalDeals}</h2>
```

**After:**
```typescript
<h2>{userData?.totalDeals ?? mockUser?.totalDeals}</h2>
```

Now displays real data from database!

## Current Data

### Test User
- **Phone:** `0912345678`
- **Name:** Test CTV User
- **Total Deals:** 5 (random)

### Other Users
All existing users have been updated with random totalDeals between 5-50.

## Testing

### Manual Test
1. Login with test user
2. Go to dashboard
3. Check "Tổng số giao dịch đã thực hiện" section
4. Should show real number from database (not mock data)

### API Test
```bash
# Make sure dev server is running
npm run dev

# In another terminal
npx tsx scripts/test-total-deals.ts
```

### Create New User Test
1. Go to signup page
2. Create new user
3. Login with new user
4. Check dashboard - should show random totalDeals (0-10)

## Future Enhancements

### 1. Real Transaction Tracking
Instead of random numbers, track actual transactions:
```prisma
model Transaction {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String   // "reservation", "booking", "deposit"
  amount    Decimal
  createdAt DateTime @default(now())
}

model User {
  // ... existing fields
  transactions Transaction[]
}
```

### 2. Auto-increment totalDeals
Update totalDeals when new transaction is created:
```typescript
// When creating a transaction
await prisma.user.update({
  where: { id: userId },
  data: { totalDeals: { increment: 1 } }
})
```

### 3. Deal Statistics
Add more fields:
```prisma
model User {
  totalDeals       Int @default(0)
  totalRevenue     Decimal @default(0)
  dealsThisMonth   Int @default(0)
  dealsThisYear    Int @default(0)
}
```

### 4. Deal History
Show deal history on dashboard:
- Recent deals
- Deal timeline
- Deal performance chart

## Scripts

### Update All Users
```bash
npx tsx scripts/update-user-deals.ts
```

### Test API
```bash
npx tsx scripts/test-total-deals.ts
```

### Check Database
```bash
npx prisma studio
```

## Database Query Examples

### Get users with most deals
```sql
SELECT full_name, phone, total_deals 
FROM users 
ORDER BY total_deals DESC 
LIMIT 10;
```

### Get average deals per user
```sql
SELECT AVG(total_deals) as avg_deals 
FROM users 
WHERE is_active = true;
```

### Update specific user's deals
```sql
UPDATE users 
SET total_deals = 25 
WHERE phone = '0912345678';
```

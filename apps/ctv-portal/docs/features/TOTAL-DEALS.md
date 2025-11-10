# Total Deals Feature

## Overview
Track the number of transactions completed by each user (CTV).

## Database Schema

### Added Field
```prisma
model User {
  // ... existing fields
  totalDeals  Int  @default(0) @map("total_deals")
}
```

**Field Details:**
- **Name:** `totalDeals`
- **Type:** `Int` (Integer)
- **Default:** `0`
- **Database Column:** `total_deals`

## Implementation

### 1. API Updates

#### User API (`/api/user/me`)
Returns `totalDeals`:
```json
{
  "success": true,
  "user": {
    "fullName": "Test CTV User",
    "totalDeals": 25
  }
}
```

#### Signup API (`/api/auth/signup`)
New users get random totalDeals (0-10):
```typescript
const randomDeals = Math.floor(Math.random() * 11)
```

### 2. Dashboard Display

Shows real data from database:
```typescript
<h2>{userData?.totalDeals ?? mockUser?.totalDeals}</h2>
```

## Current Data

### Test User
- **Phone:** `0912345678`
- **Name:** Test CTV User
- **Total Deals:** 25

## Management

### Update All Users
```bash
npm run script:user:deals
```
Assigns random totalDeals (5-50) to all users.

### Update Specific User
```bash
npm run script user:set-deals 0912345678 30
```

### View in Database
```bash
npm run db:studio
```

## Testing

### Manual Test
1. Login with test user
2. Go to dashboard
3. Check "Tổng số giao dịch đã thực hiện" section
4. Should show real number from database

### API Test
```bash
npm run script:test:db
```

## Future Enhancements

### 1. Real Transaction Tracking
```prisma
model Transaction {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      String
  amount    Decimal
  createdAt DateTime @default(now())
}
```

### 2. Auto-increment
```typescript
await prisma.user.update({
  where: { id: userId },
  data: { totalDeals: { increment: 1 } }
})
```

### 3. Statistics
```prisma
model User {
  totalDeals       Int @default(0)
  totalRevenue     Decimal @default(0)
  dealsThisMonth   Int @default(0)
  dealsThisYear    Int @default(0)
}
```

## Files
- `prisma/schema.prisma` - Database schema
- `app/api/user/me/route.ts` - API with totalDeals
- `app/dashboard/page.tsx` - Dashboard display
- `scripts/user/update-user-deals.ts` - Update script
- `scripts/user/set-user-deals.ts` - Set specific user

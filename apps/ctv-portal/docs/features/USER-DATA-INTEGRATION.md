# User Data Integration with Database

## Overview
The dashboard fetches and displays real user data from the PostgreSQL database.

## Implementation

### 1. API Route: `/api/user/me`
Fetches user data from the database based on phone number.

**Request:**
```typescript
GET /api/user/me
Headers: {
  'x-user-phone': '0912345678'
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "0912345678",
    "email": "test@example.com",
    "fullName": "Test CTV User",
    "avatar": null,
    "role": "CTV",
    "isActive": true,
    "totalDeals": 25,
    "createdAt": "2025-11-09T06:21:01.273Z",
    "updatedAt": "2025-11-09T07:19:18.543Z"
  }
}
```

### 2. Dashboard Integration
The dashboard:
1. Gets user phone from `sessionStorage`
2. Calls `/api/user/me` API to fetch user data
3. Displays real data from database
4. Redirects to login if no user found

### 3. Login Flow
After successful login:
1. API returns user data (including `fullName`)
2. Stores in sessionStorage:
   - `login:userPhone` - User's phone number
   - `login:userId` - User's ID
   - `login:userRole` - User's role
   - `login:userName` - User's full name

### 4. Data Flow

```
┌─────────────┐
│ Login Page  │
└──────┬──────┘
       │ 1. User enters credentials
       ▼
┌─────────────────┐
│ /api/auth/login │
└──────┬──────────┘
       │ 2. Validates & returns user data
       ▼
┌──────────────────┐
│ sessionStorage   │ ← Stores: phone, id, role, fullName
└──────┬───────────┘
       │ 3. Redirect to dashboard
       ▼
┌─────────────────┐
│ Dashboard Page  │
└──────┬──────────┘
       │ 4. Gets phone from sessionStorage
       ▼
┌─────────────────┐
│ /api/user/me    │
└──────┬──────────┘
       │ 5. Fetches full user data from DB
       ▼
┌─────────────────┐
│ Display User    │ ← Shows: fullName, role, avatar, totalDeals
└─────────────────┘
```

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  phone     String?  @unique
  email     String?  @unique
  password  String
  fullName  String   @map("full_name")
  avatar    String?
  role      UserRole @default(CTV)
  isActive  Boolean  @default(true) @map("is_active")
  totalDeals Int     @default(0) @map("total_deals")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

## Testing

### Manual Test
1. Login with test user: `0912345678` / `Test@123`
2. Navigate to dashboard
3. Verify user's fullName is displayed: "Test CTV User"
4. Verify totalDeals is displayed: "25"

### API Test
```bash
npm run script:test:db
```

## Security Considerations

1. **Password Excluded** - The API never returns the password field
2. **Authentication Check** - Requires user phone in header
3. **Active Status** - Only returns data for active users
4. **Session Storage** - User data stored client-side

## Files
- `app/api/user/me/route.ts` - User data API
- `app/dashboard/page.tsx` - Dashboard with user data
- `lib/prisma.ts` - Prisma client singleton

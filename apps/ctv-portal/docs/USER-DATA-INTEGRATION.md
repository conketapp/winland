# User Data Integration with Database

## Overview
The dashboard now fetches and displays real user data from the PostgreSQL database instead of using mock data.

## Implementation

### 1. API Route: `/api/user/me`
**File:** `app/api/user/me/route.ts`

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
    "createdAt": "2025-11-09T06:21:01.273Z",
    "updatedAt": "2025-11-09T07:19:18.543Z"
  }
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

### 2. Dashboard Integration
**File:** `app/dashboard/page.tsx`

The dashboard now:
1. Gets user phone from `sessionStorage`
2. Calls `/api/user/me` API to fetch user data
3. Displays real data from database
4. Redirects to login if no user found

**Key Changes:**
```typescript
// Before (Mock data)
<p>{userData?.name || mockUser?.fullName}</p>

// After (Real data from database)
<p>{userData?.fullName || mockUser?.fullName}</p>
```

### 3. Login Flow
**File:** `app/login/page.tsx`

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
│ Display User    │ ← Shows: fullName, role, avatar
└─────────────────┘
```

## Database Schema

The `User` model in Prisma:
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
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}
```

## Testing

### Manual Test
1. Start dev server: `npm run dev`
2. Login with test user:
   - Phone: `0912345678`
   - Password: `Test@123`
3. Navigate to dashboard
4. Verify user's fullName is displayed: "Test CTV User"

### API Test
```bash
# Make sure dev server is running
npm run dev

# In another terminal
npx tsx scripts/test-user-api.ts
```

## Security Considerations

1. **Password Excluded** - The API never returns the password field
2. **Authentication Check** - Requires user phone in header
3. **Active Status** - Only returns data for active users
4. **Session Storage** - User data stored client-side (consider JWT tokens for production)

## Future Improvements

1. **JWT Authentication** - Replace sessionStorage with JWT tokens
2. **Refresh Token** - Implement token refresh mechanism
3. **User Avatar Upload** - Allow users to upload profile pictures
4. **Role-Based Access** - Implement different views based on user role
5. **Real-time Updates** - Use WebSocket for live data updates

## Troubleshooting

### Issue: "Không tìm thấy thông tin người dùng"
**Solution:** User phone not in sessionStorage. Login again.

### Issue: "Người dùng không tồn tại"
**Solution:** User not in database. Check if user was created.

### Issue: Dashboard shows mock data
**Solution:** Check browser console for API errors. Verify database connection.

### Issue: Redirects to login immediately
**Solution:** Check if sessionStorage has `login:userPhone`. Clear cache and login again.

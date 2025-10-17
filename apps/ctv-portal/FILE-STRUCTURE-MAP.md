# 📁 CTV Portal File Structure Map

**Framework:** Next.js 14 App Router  
**Convention:** All routes use `page.tsx` (required by Next.js)

---

## ⚠️ Next.js App Router Naming Convention

Next.js App Router **requires** all page files to be named `page.tsx`. This is **not optional** - it's how Next.js routing works.

**Problem:** Hard to identify files in IDE (all named `page.tsx`)  
**Solution:** Use folder names + file comments to identify

---

## 📂 Complete File Structure

```
apps/ctv-portal/app/
│
├── page.tsx                                    🔑 LOGIN PAGE
│   Route: /
│   Purpose: CTV authentication (phone/password)
│   Features: Auto-fill demo credentials, JWT auth
│
├── layout.tsx                                  🎨 ROOT LAYOUT
│   Purpose: Global layout, fonts, metadata
│
├── globals.css                                 🎨 GLOBAL STYLES
│   Purpose: Tailwind + shadcn/ui variables
│
├── dashboard/
│   └── page.tsx                                📊 DASHBOARD
│       Route: /dashboard
│       Purpose: CTV stats, expiring reservations, quick actions
│       Features: Real-time stats, notifications
│
├── units/
│   ├── page.tsx                                🏘️ UNITS LISTING
│   │   Route: /units
│   │   Purpose: Browse available units
│   │   Features: Filter by project/status, search
│   │
│   └── [id]/
│       ├── page.tsx                            🏠 UNIT DETAIL
│       │   Route: /units/:id
│       │   Purpose: View full unit information
│       │   Features: Photos, specs, actions
│       │
│       ├── reserve/
│       │   └── page.tsx                        ⏰ CREATE RESERVATION
│       │       Route: /units/:id/reserve
│       │       Purpose: Reserve unit (24h hold)
│       │       Features: Customer form, 24h countdown
│       │
│       ├── booking/
│       │   └── page.tsx                        📝 CREATE BOOKING
│       │       Route: /units/:id/booking
│       │       Purpose: Create booking + payment proof
│       │       Features: Form, image upload
│       │
│       └── deposit/
│           └── page.tsx                        💰 CREATE DEPOSIT
│               Route: /units/:id/deposit
│               Purpose: Create deposit + documents
│               Features: Form, multi-file upload
│
├── my-transactions/
│   └── page.tsx                                📋 MY TRANSACTIONS
│       Route: /my-transactions
│       Purpose: View all CTV's transactions
│       Features: Filter by type, status badges
│
├── commissions/
│   └── page.tsx                                💵 COMMISSIONS
│       Route: /commissions
│       Purpose: Track commissions & request withdrawal
│       Features: Total earned, pending, paid
│
└── profile/
    └── page.tsx                                👤 PROFILE
        Route: /profile
        Purpose: CTV profile & settings
        Features: Edit info, bank details
```

---

## 🎯 Quick Reference (File → Purpose)

| File Path | Page Name | Route | Purpose |
|-----------|-----------|-------|---------|
| `app/page.tsx` | **Login** | `/` | CTV authentication |
| `app/dashboard/page.tsx` | **Dashboard** | `/dashboard` | CTV home screen |
| `app/units/page.tsx` | **Units Listing** | `/units` | Browse units |
| `app/units/[id]/page.tsx` | **Unit Detail** | `/units/:id` | View unit details |
| `app/units/[id]/reserve/page.tsx` | **Reserve** | `/units/:id/reserve` | Create reservation |
| `app/units/[id]/booking/page.tsx` | **Booking** | `/units/:id/booking` | Create booking |
| `app/units/[id]/deposit/page.tsx` | **Deposit** | `/units/:id/deposit` | Create deposit |
| `app/my-transactions/page.tsx` | **Transactions** | `/my-transactions` | Transaction history |
| `app/commissions/page.tsx` | **Commissions** | `/commissions` | Commission tracking |
| `app/profile/page.tsx` | **Profile** | `/profile` | User profile |

---

## 💡 How to Identify Files in IDE

### 1. By Folder Name:
- `dashboard/page.tsx` = Dashboard page
- `units/[id]/booking/page.tsx` = Booking page
- Look at parent folder, not filename!

### 2. By File Comment Header:
Every `page.tsx` has a header comment:
```tsx
/**
 * Dashboard Page (CTV Portal)
 * CTV stats, expiring reservations, quick actions
 */
```

### 3. By Full Path in IDE:
- Enable "Show Path" in VS Code tabs
- Or hover over tab to see full path

### 4. Use Breadcrumbs:
Most IDEs show breadcrumb navigation:
```
app > dashboard > page.tsx  ← You're in Dashboard!
```

---

## 🔧 Alternative Approach (Not Recommended)

If you REALLY need descriptive filenames, you could:

### Option A: Use `route.tsx` Files (Legacy)
```
pages/
├── login.tsx
├── dashboard.tsx
├── units.tsx
└── unit-detail.tsx
```
**Downside:** Loses App Router benefits (server components, layouts, loading states)

### Option B: Create Wrapper Components
```
app/dashboard/page.tsx:
  export { default } from './DashboardPage';

app/dashboard/DashboardPage.tsx:
  export default function DashboardPage() { ... }
```
**Downside:** Extra file for every page, more complexity

---

## ✅ Recommended Solution (What We'll Do)

### 1. Add Clear Headers to Every File:
```tsx
/**
 * [PAGE NAME] Page (CTV Portal)
 * [Brief description]
 * 
 * Route: /[route-path]
 * Features: [key features]
 */
```

### 2. Use This Map Document:
- Bookmark `FILE-STRUCTURE-MAP.md`
- Quick reference when navigating

### 3. IDE Configuration:
- Enable "Show Full Path" in tabs
- Use breadcrumbs navigation
- Use file search (Cmd+P) with folder names

---

## 📋 File Header Template

Copy this template for new pages:

```tsx
'use client';

/**
 * [PAGE NAME] Page (CTV Portal)
 * [Brief description of what this page does]
 * 
 * @route /[route-path]
 * @features [List key features]
 * @requires Authentication
 */

import { useState, useEffect } from 'react';
// ... imports

export default function PageName() {
  // ... component
}
```

---

## 🎯 Summary

**Why all `page.tsx`?**  
→ Next.js App Router requirement (file-based routing)

**How to identify?**  
→ Look at folder name + file header comment

**Better alternative?**  
→ None that doesn't break Next.js benefits

**Solution:**  
→ ✅ Clear headers + this map document + IDE breadcrumbs

---

**This is a Next.js convention, not a mistake!** 📚  
Use folder structure and comments for navigation. 🧭


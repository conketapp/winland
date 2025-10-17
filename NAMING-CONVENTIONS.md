# 📝 Naming Conventions - Batdongsan Platform

## 🎯 File Naming Standards

### Components (React/TypeScript)
```
PascalCase.tsx
✅ FormField.tsx
✅ CreateProjectPage.tsx
✅ UserCard.tsx
✅ LoadingSpinner.tsx
❌ formField.tsx
❌ create-project-page.tsx
```

### Hooks
```
useCamelCase.ts
✅ useAuth.ts
✅ useUnits.ts
✅ useDebounce.ts
❌ UseAuth.ts
❌ use-auth.ts
```

### Utilities
```
camelCase.ts
✅ format.ts
✅ validation.ts
✅ api.ts
❌ Format.ts
❌ format-utils.ts
```

### Types/Interfaces
```
camelCase.ts or types.ts
✅ types/index.ts
✅ types/user.types.ts
✅ auth.types.ts
❌ Types.ts
❌ user-types.ts
```

### Constants
```
camelCase.ts or constants.ts
✅ constants/index.ts
✅ apiEndpoints.ts
✅ config.ts
❌ API_ENDPOINTS.ts
❌ api-endpoints.ts
```

### Pages/Routes

#### Admin Portal (React Router):
```
PascalCasePage.tsx
✅ LoginPage.tsx
✅ DashboardPage.tsx
✅ CreateProjectPage.tsx
✅ BookingsApprovalPage.tsx
❌ login.tsx
❌ dashboard-page.tsx
```

#### CTV Portal (Next.js App Router):
```
page.tsx (REQUIRED by Next.js - folder determines route)
✅ app/dashboard/page.tsx           → /dashboard
✅ app/units/[id]/page.tsx          → /units/:id
✅ app/units/[id]/reserve/page.tsx  → /units/:id/reserve
❌ app/dashboard/Dashboard.tsx      → Won't route!
```

**Important:** In Next.js App Router:
- ✅ ALL routes MUST be named `page.tsx`
- ✅ Folder structure determines URL path
- ✅ Use descriptive FOLDER names
- ✅ Add clear COMMENT headers to identify files

**Example:**
```tsx
// app/dashboard/page.tsx
/**
 * 📊 DASHBOARD PAGE (CTV Portal)
 * @route /dashboard
 */
'use client';
export default function DashboardPage() { }
```

---

## 🏗️ Directory Structure

```
apps/admin/
├── src/
│   ├── components/
│   │   ├── ui/              → shadcn/ui components (PascalCase.tsx)
│   │   ├── shared/          → Shared components (PascalCase.tsx)
│   │   └── auth/            → Feature components (PascalCase.tsx)
│   ├── pages/               → Page components (PascalCasePage.tsx)
│   │   ├── auth/
│   │   ├── projects/
│   │   └── units/
│   ├── contexts/            → React contexts (PascalCaseContext.tsx)
│   ├── hooks/               → Custom hooks (useCamelCase.ts)
│   ├── lib/                 → Utilities (camelCase.ts)
│   ├── api/                 → API services (camelCase.api.ts)
│   ├── types/               → TypeScript types (camelCase.types.ts)
│   ├── constants/           → Constants (camelCase.ts)
│   └── layouts/             → Layout components (PascalCaseLayout.tsx)
```

---

## 📦 Component Naming

### Variables & Functions
```typescript
// ✅ CORRECT
const userName = 'John';
const isActive = true;
const getUserById = (id: string) => {};
const handleSubmit = () => {};

// ❌ WRONG
const user_name = 'John';
const UserName = 'John';
const GetUserById = (id: string) => {};
```

### Constants
```typescript
// ✅ CORRECT
export const API_BASE_URL = 'http://localhost:3001';
export const MAX_FILE_SIZE = 5000000;
export const DEFAULT_PAGE_SIZE = 10;

// ❌ WRONG
export const apiBaseUrl = 'http://localhost:3001';
export const max_file_size = 5000000;
```

### Types & Interfaces
```typescript
// ✅ CORRECT
interface User {
  id: string;
  fullName: string;
}

type UserRole = 'ADMIN' | 'CTV';

// ❌ WRONG
interface user {
  id: string;
  full_name: string;
}

type user_role = 'ADMIN' | 'CTV';
```

### Enums
```typescript
// ✅ CORRECT
enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

// ❌ WRONG
enum user_status {
  active = 'ACTIVE',
}
```

---

## 🎨 Component Organization

### Shared Components
```
components/shared/
├── FormField.tsx        → Reusable form input
├── FormSection.tsx      → Form section wrapper
├── StatusBadge.tsx      → Status display
├── DetailModal.tsx      → Detail view modal
├── DetailRow.tsx        → Detail row display
├── ActionButtons.tsx    → Action buttons
├── DataTable.tsx        → Table component
└── FileUpload.tsx       → File upload
```

### UI Components (shadcn/ui)
```
components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── badge.tsx
├── dialog.tsx
├── select.tsx
└── separator.tsx
```

### Feature Components
```
components/[feature]/
├── ProjectCard.tsx
├── UnitCard.tsx
├── BookingCard.tsx
└── DepositCard.tsx
```

---

## 📁 File Organization Best Practices

### 1. **Group by Feature**
```
pages/
├── projects/
│   ├── ProjectsPage.tsx         → List
│   ├── CreateProjectPage.tsx    → Create
│   ├── EditProjectPage.tsx      → Edit
│   └── ProjectDetailPage.tsx    → Detail
```

### 2. **Group by Type**
```
components/
├── shared/      → Shared across features
├── ui/          → Base UI components
└── [feature]/   → Feature-specific
```

### 3. **Clear Naming**
```
✅ CreateProjectPage.tsx     → Clear purpose
✅ BookingsApprovalPage.tsx  → Clear purpose
✅ BulkImportPage.tsx        → Clear purpose

❌ Page1.tsx                 → Unclear
❌ Form.tsx                  → Too generic
❌ Index.tsx                 → Unclear
```

---

## 🔧 API & Services Naming

### API Files
```
api/
├── auth.api.ts              → Authentication APIs
├── projects.api.ts          → Project APIs
├── units.api.ts             → Unit APIs
└── bookings.api.ts          → Booking APIs
```

### API Methods
```typescript
// ✅ CORRECT
export const projectsApi = {
  getAll: () => {},
  getById: (id: string) => {},
  create: (data) => {},
  update: (id, data) => {},
  delete: (id) => {},
};

// ❌ WRONG
export const projectsApi = {
  GetAll: () => {},
  get_by_id: (id: string) => {},
};
```

---

## 📋 Summary

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase.tsx | `FormField.tsx` |
| Page | PascalCasePage.tsx | `CreateProjectPage.tsx` |
| Hook | useCamelCase.ts | `useAuth.ts` |
| Utility | camelCase.ts | `format.ts` |
| Type | camelCase.types.ts | `user.types.ts` |
| API | camelCase.api.ts | `projects.api.ts` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Variable | camelCase | `userName` |
| Function | camelCase | `handleSubmit` |
| Interface | PascalCase | `User`, `Project` |
| Enum | PascalCase | `UserStatus` |

---

## ✅ Checklist

- [ ] All components use PascalCase
- [ ] All hooks start with 'use'
- [ ] All utilities use camelCase
- [ ] All constants use UPPER_SNAKE_CASE
- [ ] All files in correct directories
- [ ] No generic names (Form.tsx, Page.tsx)
- [ ] Consistent across all apps

---

**Remember:** Consistency is key! Follow these conventions across all apps (backend, admin, ctv-portal). 🎯


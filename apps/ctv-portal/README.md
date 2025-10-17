# CTV Portal - Mobile-First Application

## 📁 Project Structure

```
ctv-portal/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication routes
│   ├── dashboard/           # Dashboard page
│   ├── units/               # Units listing
│   ├── commissions/         # Commissions page
│   ├── my-transactions/     # Transactions page
│   └── profile/             # Profile page
├── components/              # Reusable components
│   ├── ui/                  # shadcn/ui components
│   ├── UnitCard.tsx         # Unit card component
│   ├── LoadingSpinner.tsx   # Loading component
│   ├── MobileLayout.tsx     # Mobile layout wrapper
│   └── BottomNav.tsx        # Bottom navigation
├── lib/                     # Utility libraries
│   ├── api.ts              # API client
│   ├── utils.ts            # General utilities
│   └── format.ts           # Formatting functions
├── hooks/                   # Custom React hooks
│   └── useAuth.ts          # Authentication hook
├── types/                   # TypeScript types
│   └── index.ts            # Type definitions
├── constants/              # Application constants
│   └── index.ts            # Constants & configs
└── services/               # API service layer (future)
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **UI Components**: Pure presentational components in `components/`
- **Business Logic**: Extracted to hooks in `hooks/`
- **API Layer**: Centralized in `lib/api.ts`
- **Types**: Centralized in `types/`
- **Constants**: Centralized in `constants/`

### 2. **Reusability**
- Shared UI components (UnitCard, LoadingSpinner)
- Custom hooks for common logic (useAuth)
- Utility functions for formatting (formatCurrency, formatDate)

### 3. **Type Safety**
- TypeScript for all files
- Proper type definitions in `types/`
- Type-safe API calls

### 4. **Clean Code**
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Descriptive naming conventions
- Consistent code structure

## 🎨 Design System

- **UI Library**: shadcn/ui (consistent with Admin Dashboard)
- **Icons**: lucide-react
- **Styling**: Tailwind CSS v4
- **Mobile-First**: Optimized for mobile devices

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Code Conventions

### Component Structure
```tsx
// 1. Imports
import { useState } from 'react';
import type { Unit } from '@/types';

// 2. Types/Interfaces (if local)
interface Props {
  unit: Unit;
}

// 3. Component
export default function UnitCard({ unit }: Props) {
  // 4. State
  const [isOpen, setIsOpen] = useState(false);

  // 5. Handlers
  const handleClick = () => {
    setIsOpen(true);
  };

  // 6. Render
  return (
    <div>{/* JSX */}</div>
  );
}
```

### File Naming
- Components: PascalCase (`UnitCard.tsx`)
- Hooks: camelCase with 'use' prefix (`useAuth.ts`)
- Utils: camelCase (`format.ts`)
- Constants: UPPER_SNAKE_CASE in files (`constants/index.ts`)

## 🔒 Authentication

Uses localStorage for demo purposes:
- Token: `ctv_token`
- User data: `ctv_user`

In production, consider:
- HTTP-only cookies
- Secure token storage
- Refresh token mechanism

## 📱 Mobile Optimization

- Touch-friendly buttons (min 44px)
- Optimized for portrait mode
- Bottom navigation for easy thumb access
- Safe area insets
- No hover states (touch-first)

## 🔄 State Management

Currently using React hooks. For scaling, consider:
- Context API for global state
- React Query for server state
- Zustand for complex state

## 🌐 API Integration

Mock data in components will be replaced with real API calls:

```tsx
// Current (mock)
const units = mockData;

// Future (API)
const { data: units } = useUnits();
```

## 📦 Future Enhancements

- [ ] Real API integration
- [ ] Offline support (PWA)
- [ ] Push notifications
- [ ] Image optimization
- [ ] Error boundary
- [ ] Analytics tracking
- [ ] Performance monitoring

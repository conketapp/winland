# Shared Package

Package chứa các types, constants và utilities được sử dụng chung cho toàn bộ monorepo.

## 📁 Structure

```
src/
├── types/              # TypeScript type definitions
│   ├── property.types.ts
│   ├── user.types.ts
│   ├── category.types.ts
│   ├── amenity.types.ts
│   └── common.types.ts
├── constants/          # Shared constants
│   ├── property.constants.ts
│   └── location.constants.ts
├── utils/              # Utility functions
│   ├── format.utils.ts
│   ├── validation.utils.ts
│   └── slug.utils.ts
└── index.ts           # Main export file
```

## 🚀 Usage

### In Backend (NestJS)

```typescript
import { PropertyType, PropertyStatus } from '@/shared/types';
import { formatCurrency } from '@/shared/utils';
```

### In Admin (React + Vite)

```typescript
import { User, UserRole } from '@/shared/types';
import { toSlug } from '@/shared/utils';
```

### In Client (Next.js)

```typescript
import { Property, QueryPropertyDto } from '@/shared/types';
import { VIETNAM_CITIES } from '@/shared/constants';
```

## 📦 Exports

### Types

- **Property Types**: `Property`, `PropertyType`, `PropertyStatus`, `CreatePropertyDto`, `QueryPropertyDto`
- **User Types**: `User`, `UserRole`, `CreateUserDto`, `LoginDto`, `RegisterDto`, `AuthResponse`
- **Category Types**: `Category`, `CreateCategoryDto`
- **Amenity Types**: `Amenity`, `CreateAmenityDto`
- **Common Types**: `PaginationParams`, `PaginatedResponse`, `ApiResponse`, `ErrorResponse`

### Constants

- **Property Constants**: `PROPERTY_TYPES`, `PROPERTY_STATUS`, `PROPERTY_DIRECTIONS`, `LEGAL_DOCUMENTS`
- **Location Constants**: `VIETNAM_CITIES`

### Utilities

#### Format Utils

- `formatCurrency(amount: number)`: Format to VND currency
- `formatCurrencyShort(amount: number)`: Format to short form (e.g., "1.5 tỷ")
- `formatArea(area: number)`: Format area with unit
- `formatDate(date: string | Date)`: Format date to Vietnamese
- `formatRelativeTime(date: string | Date)`: Format relative time (e.g., "2 ngày trước")

#### Validation Utils

- `isValidEmail(email: string)`: Validate email format
- `isValidPhoneNumber(phone: string)`: Validate Vietnamese phone number
- `isStrongPassword(password: string)`: Check password strength
- `sanitizeString(input: string)`: Sanitize string input

#### Slug Utils

- `toSlug(str: string)`: Convert Vietnamese string to slug
- `generateUniqueSlug(str: string)`: Generate unique slug with timestamp

## 🔧 Adding New Types

1. Create new type file in `src/types/`
2. Export from `src/types/index.ts`
3. Export from main `src/index.ts`

Example:

```typescript
// src/types/example.types.ts
export interface Example {
  id: string;
  name: string;
}

// src/types/index.ts
export * from './example.types';
```

## 📝 Development Notes

- Tất cả types phải được define rõ ràng, không sử dụng `any`
- Constants nên sử dụng `as const` để type safety
- Utilities phải có JSDoc comments
- Tất cả exports phải đi qua file index.ts chính


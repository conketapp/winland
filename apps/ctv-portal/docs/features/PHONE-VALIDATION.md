# Vietnamese Phone Number Validation

## Overview
Reusable Vietnamese phone number validation utility for consistent validation across all pages.

## Utility Functions

### `isValidVietnamesePhone(phone: string): boolean`
Validates Vietnamese mobile and landline numbers.

### `getPhoneErrorMessage(phone: string): string | null`
Returns error message for invalid phone or null if valid.

### `formatPhoneNumber(phone: string): string`
Formats phone number for display (e.g., `091 234 5678`).

### `isMobilePhone(phone: string): boolean`
Checks if phone is a mobile number.

### `isLandlinePhone(phone: string): boolean`
Checks if phone is a landline number.

### `getPhoneType(phone: string): 'mobile' | 'landline' | 'invalid'`
Returns the type of phone number.

## Usage

### Import
```typescript
import { 
  isValidVietnamesePhone, 
  getPhoneErrorMessage 
} from '@/lib/phone-validation'
```

### Validation
```typescript
const [phoneError, setPhoneError] = useState('')

useEffect(() => {
  if (userPhone) {
    const errorMessage = getPhoneErrorMessage(userPhone)
    setPhoneError(errorMessage || '')
  } else {
    setPhoneError('')
  }
}, [userPhone])
```

### Form Validation
```typescript
const isFormValid = () => {
  return (
    userName.trim() !== '' &&
    isValidVietnamesePhone(userPhone) &&
    // ... other validations
  )
}
```

## Validation Rules

### Mobile Numbers (10 digits)
- `03x` - Viettel, MobiFone
- `05x` - Vietnamobile
- `07x` - Viettel, Gmobile
- `08x` - Vinaphone
- `09x` - MobiFone, Viettel

### Landline Numbers (10-11 digits)
- `02x` - Landline prefix

## Examples

### Valid
- `0912345678` ✅ Mobile
- `0387654321` ✅ Mobile
- `0212345678` ✅ Landline
- `091 234 5678` ✅ Mobile (with spaces)

### Invalid
- `0112345678` ❌ Invalid prefix
- `091234567` ❌ Too short
- `09123456789` ❌ Too long

## Testing

```bash
npm run script:test:phone
```

All 15 tests pass including:
- Valid mobile numbers
- Valid landline numbers
- Invalid numbers
- Formatted numbers

## Files

- `lib/phone-validation.ts` - Reusable validation utility
- `app/login/page.tsx` - Login with phone validation
- `app/signup/page.tsx` - Signup with phone validation
- `scripts/test/test-phone-validation.ts` - Test script

## Benefits

1. **Reusable** - Single source of truth for phone validation
2. **Consistent** - Same validation logic across all pages
3. **Maintainable** - Update once, applies everywhere
4. **Tested** - Comprehensive test coverage
5. **Feature-rich** - Multiple utility functions

## Related Documentation

- [Signup Validation](./SIGNUP-VALIDATION.md)
- [Login Flow](../guides/LOGIN-FLOW.md)

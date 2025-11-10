# Password Validation Feature

## Overview
Real-time password validation with visual feedback for user registration.

## Requirements
Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, ký tự đặc biệt.

### Validation Rules
1. ✓ **Minimum 8 characters** - Password must be at least 8 characters long
2. ✓ **Uppercase letter (A-Z)** - Must contain at least one uppercase letter
3. ✓ **Lowercase letter (a-z)** - Must contain at least one lowercase letter
4. ✓ **Special character (!@#$%^&*...)** - Must contain at least one special character

## Visual Feedback
The signup form displays real-time validation feedback:
- **Gray (○)** - Not yet validated (no input)
- **Red (○)** - Requirement not met (invalid)
- **Green (✓)** - Requirement met (valid)

## Usage

### In Components
```typescript
import { validatePassword, isPasswordValid } from '@/lib/password-validation'

const [password, setPassword] = useState('')
const [validation, setValidation] = useState({
  minLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasSpecialChar: false,
})

useEffect(() => {
  if (password) {
    setValidation(validatePassword(password))
  }
}, [password])

// Check if valid before submit
if (!isPasswordValid(validation)) {
  alert('Password does not meet requirements!')
  return
}
```

## Valid Password Examples
- `Test@123` ✅
- `MyPass@2024` ✅
- `Welcome#123` ✅
- `Pass@word` ✅
- `Secure!Pass` ✅

## Invalid Password Examples
- `abc` ❌ (too short, no uppercase, no special char)
- `abcdefgh` ❌ (no uppercase, no special char)
- `ABCDEFGH` ❌ (no lowercase, no special char)
- `Abcdefgh` ❌ (no special char)
- `Test1234` ❌ (no special char)
- `short` ❌ (too short, no uppercase, no special char)

## API Validation
The backend also validates passwords in `/api/auth/signup/route.ts`:
- Checks minimum length
- Checks for uppercase letters
- Checks for lowercase letters
- Checks for special characters
- Returns specific error messages

## Accepted Special Characters
```
! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?
```

## Files
- `lib/password-validation.ts` - Validation utility functions
- `app/signup/page.tsx` - Signup form with real-time validation
- `app/api/auth/signup/route.ts` - Backend validation
- `components/PasswordStrengthIndicator.tsx` - Reusable component

## Testing
```bash
npm run script:test:password
```

# Password Validation Update - Special Characters

## Changes Made

### Updated Password Requirements
**Old:** Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường.  
**New:** Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, ký tự đặc biệt.

### Files Modified

#### 1. `lib/password-validation.ts`
- Added `hasSpecialChar` to `PasswordValidation` interface
- Updated `validatePassword()` to check for special characters: `!@#$%^&*()_+-=[]{};':"\\|,.<>/?`
- Updated `isPasswordValid()` to require special character
- Updated `getPasswordErrorMessage()` to return special character error

#### 2. `app/signup/page.tsx`
- Added `hasSpecialChar: false` to password validation state
- Added visual feedback for special character requirement
- Real-time validation shows green ✓ when requirement is met

#### 3. `app/api/auth/signup/route.ts`
- Added server-side validation for special characters
- Returns error if special character is missing

#### 4. `components/PasswordStrengthIndicator.tsx`
- Added special character indicator to reusable component

#### 5. `scripts/create-test-user.ts`
- Updated test user password from `ctv456` to `Test@123`

## Validation Rules (Updated)

1. ✓ **Minimum 8 characters**
2. ✓ **Uppercase letter (A-Z)**
3. ✓ **Lowercase letter (a-z)**
4. ✓ **Special character (!@#$%^&*...)**

## Accepted Special Characters
```
! @ # $ % ^ & * ( ) _ + - = [ ] { } ; ' : " \ | , . < > / ?
```

## Testing

### Valid Passwords ✅
- `Test@123`
- `MyPass@2024`
- `Welcome#123`
- `Pass@word`
- `Secure!Pass`

### Invalid Passwords ❌
- `Test1234` - Missing special character
- `MyPassword` - Missing special character
- `Abcdefgh` - Missing special character

## Test User Credentials (Updated)
- **Phone:** `0912345678`
- **Password:** `Test@123` (was `ctv456`)
- **Email:** `testctv@winland.com`

## How to Test

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/signup
3. Try passwords with/without special characters
4. See real-time validation feedback

## Login with Updated Password

After this update, use the new password to login:
- Phone: `0912345678`
- Password: `Test@123`

# Signup Form Validation

## Overview
Complete form validation with real-time feedback and disabled button until all requirements are met.

## Button Enable Conditions

The "Đăng ký" button is only enabled when ALL of the following conditions are met:

### 1. Required Fields
- ✓ **Họ và tên** - Not empty
- ✓ **Số điện thoại** - Not empty
- ✓ **Email** - Not empty
- ✓ **Mật khẩu** - Not empty
- ✓ **Nhập lại mật khẩu** - Not empty

### 2. Password Requirements
- ✓ Minimum 8 characters
- ✓ Has uppercase letter (A-Z)
- ✓ Has lowercase letter (a-z)
- ✓ Has special character (!@#$%^&*...)

### 3. Password Match
- ✓ Confirm password must match the password

## Visual Feedback

### Password Strength Indicators
Each requirement shows real-time status:
- **Gray (○)** - Not validated yet (no input)
- **Red (○)** - Requirement not met
- **Green (✓)** - Requirement met

### Password Match Indicator
Below "Nhập lại mật khẩu" field:
- **Green ✓ "Mật khẩu khớp"** - Passwords match
- **Red ✗ "Mật khẩu không khớp"** - Passwords don't match

### Button States
- **Disabled (grayed out)** - Form is not valid
  - Opacity reduced to 50%
  - Cursor shows "not-allowed"
  - No hover effects
- **Enabled (blue)** - All requirements met
  - Full opacity
  - Hover effects active
  - Can be clicked

## User Experience Flow

1. User starts typing in fields
2. Password validation shows real-time feedback
3. As user types confirm password, match indicator appears
4. Button remains disabled until ALL requirements are met
5. Once valid, button becomes active and clickable
6. User can submit the form

## Example Valid Form

```
Họ và tên: Nguyen Van A
Số điện thoại: 0987654321
Email: test@example.com
Mật khẩu: Test@123
Nhập lại mật khẩu: Test@123

✓ All password requirements met
✓ Passwords match
✓ Button is ENABLED
```

## Example Invalid Form

```
Họ và tên: Nguyen Van A
Số điện thoại: 0987654321
Email: test@example.com
Mật khẩu: Test123 (missing special char)
Nhập lại mật khẩu: Test123

✗ Missing special character
✓ Passwords match
✗ Button is DISABLED
```

## Implementation Details

### Form Validation Function
```typescript
const isFormValid = () => {
  return (
    userName.trim() !== '' &&
    userPhone.trim() !== '' &&
    userEmail.trim() !== '' &&
    userPassword !== '' &&
    confirmPassword !== '' &&
    checkPasswordValid(passwordValidation) &&
    userPassword === confirmPassword
  );
};
```

### Button Disabled State
```typescript
<Button
  type="submit"
  disabled={loading || !isFormValid()}
  className="...disabled:opacity-50 disabled:cursor-not-allowed"
>
```

## Benefits

1. **Prevents Invalid Submissions** - Users can't submit incomplete forms
2. **Clear Feedback** - Users know exactly what's missing
3. **Better UX** - Real-time validation guides users
4. **Reduced Errors** - Catches issues before API call
5. **Professional Feel** - Polished, modern form experience

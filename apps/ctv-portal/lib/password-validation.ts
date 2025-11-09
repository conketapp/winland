/**
 * Password Validation Utility
 * Validates password strength based on requirements
 */

export interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasSpecialChar: boolean;
}

/**
 * Validates password against security requirements
 * @param password - The password to validate
 * @returns Object with validation results for each requirement
 */
export function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

/**
 * Checks if password meets all requirements
 * @param validation - Password validation object
 * @returns true if all requirements are met
 */
export function isPasswordValid(validation: PasswordValidation): boolean {
  return validation.minLength && 
         validation.hasUpperCase && 
         validation.hasLowerCase &&
         validation.hasSpecialChar;
}

/**
 * Gets a human-readable error message for password validation
 * @param validation - Password validation object
 * @returns Error message or null if valid
 */
export function getPasswordErrorMessage(validation: PasswordValidation): string | null {
  if (!validation.minLength) {
    return 'Mật khẩu phải có ít nhất 8 ký tự';
  }
  if (!validation.hasUpperCase) {
    return 'Mật khẩu phải có ít nhất một chữ hoa (A-Z)';
  }
  if (!validation.hasLowerCase) {
    return 'Mật khẩu phải có ít nhất một chữ thường (a-z)';
  }
  if (!validation.hasSpecialChar) {
    return 'Mật khẩu phải có ít nhất một ký tự đặc biệt (!@#$%^&*...)';
  }
  return null;
}

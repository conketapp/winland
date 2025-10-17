/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Vietnamese phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(0|\+84)(\d{9,10})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Mật khẩu phải có ít nhất 6 ký tự');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 số');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}


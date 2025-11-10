/**
 * Vietnamese Phone Number Validation Utility
 * Validates Vietnamese mobile and landline phone numbers
 */

/**
 * Validates Vietnamese phone numbers
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidVietnamesePhone(phone: string): boolean {
  // Remove all spaces, dashes, and other non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');

  // Check mobile numbers (10 digits)
  // Mobile prefixes: 03, 05, 07, 08, 09
  const mobilePattern = /^(03|05|07|08|09)\d{8}$/;

  // Check landline numbers (10-11 digits)
  // Landline prefix: 02 + area code + subscriber number
  const landlinePattern = /^02\d{8,9}$/;

  return mobilePattern.test(cleanPhone) || landlinePattern.test(cleanPhone);
}

/**
 * Gets error message for invalid phone number
 * @param phone - Phone number to check
 * @returns Error message or null if valid
 */
export function getPhoneErrorMessage(phone: string): string | null {
  if (!phone) {
    return null;
  }

  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length > 11) {
    return 'Số điện thoại không hợp lệ, độ dài số tối đa là 11 chữ số';
  }

  if (!isValidVietnamesePhone(phone)) {
    return 'Số điện thoại không hợp lệ. Vui lòng nhập số di động (03x, 05x, 07x, 08x, 09x) hoặc số cố định (02x)';
  }

  return null;
}

/**
 * Formats phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');

  // Format mobile numbers: 091 234 5678
  if (cleanPhone.length === 10 && /^(03|05|07|08|09)/.test(cleanPhone)) {
    return `${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
  }

  // Format landline numbers: 02 12 345 678 or 02 123 456 789
  if (cleanPhone.length >= 10 && cleanPhone.startsWith('02')) {
    if (cleanPhone.length === 10) {
      return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 4)} ${cleanPhone.slice(4, 7)} ${cleanPhone.slice(7)}`;
    } else if (cleanPhone.length === 11) {
      return `${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 5)} ${cleanPhone.slice(5, 8)} ${cleanPhone.slice(8)}`;
    }
  }

  return phone;
}

/**
 * Cleans phone number by removing all non-digit characters
 * @param phone - Phone number to clean
 * @returns Cleaned phone number
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Checks if phone is a mobile number
 * @param phone - Phone number to check
 * @returns true if mobile, false otherwise
 */
export function isMobilePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^(03|05|07|08|09)\d{8}$/.test(cleanPhone);
}

/**
 * Checks if phone is a landline number
 * @param phone - Phone number to check
 * @returns true if landline, false otherwise
 */
export function isLandlinePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^02\d{8,9}$/.test(cleanPhone);
}

/**
 * Gets phone number type
 * @param phone - Phone number to check
 * @returns 'mobile', 'landline', or 'invalid'
 */
export function getPhoneType(phone: string): 'mobile' | 'landline' | 'invalid' {
  if (isMobilePhone(phone)) return 'mobile';
  if (isLandlinePhone(phone)) return 'landline';
  return 'invalid';
}

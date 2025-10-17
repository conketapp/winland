/**
 * Formatting Utilities
 */

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const formatPhoneNumber = (phone: string): string => {
  // Format: 0912345678 -> 091 234 5678
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
};

export const formatArea = (area: number): string => {
  return `${area}m²`;
};

export const formatBedrooms = (bedrooms?: number): string => {
  if (!bedrooms) return 'Studio';
  return `${bedrooms}PN`;
};


/**
 * Utility Functions
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency to Vietnamese format
 * @param amount - Amount to format
 * @param currency - Currency symbol (default: 'VNĐ')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number | string | null | undefined, currency: string = 'VNĐ'): string {
  if (amount === null || amount === undefined) {
    return `0 ${currency}`;
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return `0 ${currency}`;
  }

  // Format with thousand separators
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount);

  return `${formatted} ${currency}`;
}

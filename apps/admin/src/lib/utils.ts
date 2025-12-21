import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Ví dụ: 10_000_000 -> "10tr", 125_000_000 -> "125tr"
export function formatShortAmount(amount: number): string {
  if (!amount || isNaN(amount)) return '0';
  const millions = Math.round(amount / 1_000_000);
  return `${millions}tr`;
}


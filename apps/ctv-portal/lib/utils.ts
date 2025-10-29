import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return '0 ₫';

  const absAmount = Math.abs(amount);
  let formattedValue: string;
  let unit: string = '';

  if (absAmount >= 1_000_000_000) {
    // Tỷ (billion)
    const billions = absAmount / 1_000_000_000;
    formattedValue = billions % 1 === 0
      ? billions.toString()
      : billions.toFixed(1).replace(/\.0$/, '');
    unit = ' tỷ VND';
  } else if (absAmount >= 1_000_000) {
    // Triệu (million)
    const millions = absAmount / 1_000_000;
    formattedValue = millions % 1 === 0
      ? millions.toString()
      : millions.toFixed(1).replace(/\.0$/, '');
    unit = ' triệu VND';
  } else if (absAmount >= 1_000) {
    // Ngàn (thousand)
    const thousands = absAmount / 1_000;
    formattedValue = thousands % 1 === 0
      ? thousands.toString()
      : thousands.toFixed(1).replace(/\.0$/, '');
    unit = ' nghìn VND';
  } else {
    // Đồng
    formattedValue = absAmount.toString();
    unit = ' ₫';
  }

  // Add sign for negative amounts
  const sign = amount < 0 ? '-' : '';

  return `${sign}${formattedValue}${unit}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
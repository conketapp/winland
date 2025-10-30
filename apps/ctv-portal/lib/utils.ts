import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced formatCurrency function with more options
export function formatCurrency(
  amount: number, 
  options: {
    style?: 'standard' | 'compact' | 'formal';
    showSymbol?: boolean;
    symbol?: string;
    decimals?: number;
    locale?: 'vi-VN' | 'en-US';
  } = {}
): string {
  const {
    style = 'compact',
    showSymbol = true,
    symbol = 'VND',
    decimals = 0,
    locale = 'vi-VN'
  } = options;

  if (amount === 0) return showSymbol ? `0 ${symbol}` : '0';

  const absAmount = Math.abs(amount);
  let formattedValue: string;
  let unit: string = '';

  // Handle different formatting styles
  if (style === 'standard') {
    // Standard format with grouping separators
    formattedValue = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(absAmount);
    unit = ` ${symbol}`;
  } else if (style === 'formal') {
    // Formal format with Vietnamese words
    formattedValue = numberToVietnameseWords(absAmount);
    unit = ' đồng';
  } else {
    // Compact format (default)
    if (absAmount >= 1_000_000_000) {
      // Tỷ (billion)
      const billions = absAmount / 1_000_000_000;
      formattedValue = billions % 1 === 0
        ? billions.toString()
        : billions.toFixed(decimals).replace(/\.0$/, '');
      unit = ` tỷ${showSymbol ? ` ${symbol}` : ''}`;
    } else if (absAmount >= 1_000_000) {
      // Triệu (million)
      const millions = absAmount / 1_000_000;
      formattedValue = millions % 1 === 0
        ? millions.toString()
        : millions.toFixed(decimals).replace(/\.0$/, '');
      unit = ` triệu${showSymbol ? ` ${symbol}` : ''}`;
    } else if (absAmount >= 1_000) {
      // Ngàn (thousand)
      const thousands = absAmount / 1_000;
      formattedValue = thousands % 1 === 0
        ? thousands.toString()
        : thousands.toFixed(decimals).replace(/\.0$/, '');
      unit = ` nghìn${showSymbol ? ` ${symbol}` : ''}`;
    } else {
      // Đồng
      formattedValue = absAmount.toString();
      unit = showSymbol ? ` ${symbol}` : '';
    }
  }

  // Add sign for negative amounts
  const sign = amount < 0 ? '-' : '';

  return `${sign}${formattedValue}${unit}`;
}

// Helper function to convert numbers to Vietnamese words
function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'không';
  
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ'];
  let result = '';
  let unitIndex = 0;

  while (num > 0) {
    const remainder = num % 1000;
    if (remainder > 0) {
      const words = convertThreeDigitsToWords(remainder);
      result = words + (units[unitIndex] ? ' ' + units[unitIndex] : '') + ' ' + result;
    }
    num = Math.floor(num / 1000);
    unitIndex++;
  }

  return result.trim();
}

function convertThreeDigitsToWords(num: number): string {
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];

  if (num === 0) return '';
  if (num < 10) return ones[num];
  if (num < 20) return num === 10 ? 'mười' : 'mười ' + ones[num % 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one > 0 ? ' ' + ones[one] : '');
  }

  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return ones[hundred] + ' trăm' + (remainder > 0 ? ' ' + convertThreeDigitsToWords(remainder) : '');
}

// Additional utility functions for common use cases
export const currency = {
  // Compact format (default behavior)
  compact: (amount: number) => formatCurrency(amount),
  
  // Standard format with grouping
  standard: (amount: number, locale: 'vi-VN' | 'en-US' = 'vi-VN') => 
    formatCurrency(amount, { style: 'standard', locale }),
  
  // Formal format with Vietnamese words
  formal: (amount: number) => formatCurrency(amount, { style: 'formal' }),
  
  // Format with custom symbol
  withSymbol: (amount: number, symbol: string) => 
    formatCurrency(amount, { symbol }),
  
  // Format for price ranges
  range: (min: number, max: number) => {
    const formattedMin = formatCurrency(min);
    const formattedMax = formatCurrency(max);
    return `${formattedMin} - ${formattedMax}`;
  },
  
  // Format for tables (right-aligned)
  table: (amount: number) => formatCurrency(amount),
};

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
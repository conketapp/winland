/**
 * Custom Handlebars Helpers
 */

import * as Handlebars from 'handlebars';
import moment from 'moment';

/**
 * Register all custom Handlebars helpers
 */
export function registerHelpers(handlebars: typeof Handlebars): void {
  /**
   * Format currency to VND
   * Usage: {{formatCurrency amount}}
   */
  handlebars.registerHelper('formatCurrency', (amount: number) => {
    if (typeof amount !== 'number') {
      return amount;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  });

  /**
   * Format currency to text (bằng chữ)
   * Usage: {{formatCurrencyText amount}}
   */
  handlebars.registerHelper('formatCurrencyText', (amount: number) => {
    if (typeof amount !== 'number') {
      return amount;
    }
    return numberToVietnamese(amount);
  });

  /**
   * Format date
   * Usage: {{formatDate date 'DD/MM/YYYY'}}
   */
  handlebars.registerHelper('formatDate', (date: Date | string, format?: string) => {
    if (!date) return '';
    const dateFormat = format || 'DD/MM/YYYY';
    return moment(date).format(dateFormat);
  });

  /**
   * Format date full (Ngày DD tháng MM năm YYYY)
   * Usage: {{formatDateFull date}}
   */
  handlebars.registerHelper('formatDateFull', (date: Date | string) => {
    if (!date) return '';
    const m = moment(date);
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayName = days[m.day()];
    return `${dayName}, ngày ${m.format('DD')} tháng ${m.format('MM')} năm ${m.format('YYYY')}`;
  });

  /**
   * Compare values
   * Usage: {{#if (eq value1 value2)}}...{{/if}}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlebars.registerHelper('ne', (a: any, b: any) => a !== b);
  handlebars.registerHelper('gt', (a: number, b: number) => a > b);
  handlebars.registerHelper('gte', (a: number, b: number) => a >= b);
  handlebars.registerHelper('lt', (a: number, b: number) => a < b);
  handlebars.registerHelper('lte', (a: number, b: number) => a <= b);

  /**
   * Default value
   * Usage: {{default value 'default text'}}
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handlebars.registerHelper('default', (value: any, defaultValue: any) => {
    return value != null ? value : defaultValue;
  });

  /**
   * Uppercase/Lowercase
   */
  handlebars.registerHelper('uppercase', (str: string) => {
    return typeof str === 'string' ? str.toUpperCase() : str;
  });

  handlebars.registerHelper('lowercase', (str: string) => {
    return typeof str === 'string' ? str.toLowerCase() : str;
  });
}

/**
 * Convert number to Vietnamese text
 */
function numberToVietnamese(num: number): string {
  const ones = [
    '',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín',
  ];
  const teens = [
    'mười',
    'mười một',
    'mười hai',
    'mười ba',
    'mười bốn',
    'mười lăm',
    'mười sáu',
    'mười bảy',
    'mười tám',
    'mười chín',
  ];
  const tens = [
    '',
    '',
    'hai mươi',
    'ba mươi',
    'bốn mươi',
    'năm mươi',
    'sáu mươi',
    'bảy mươi',
    'tám mươi',
    'chín mươi',
  ];

  function convertHundreds(n: number): string {
    if (n === 0) return '';
    let result = '';
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;

    if (hundreds > 0) {
      result += ones[hundreds] + ' trăm ';
    }

    if (remainder > 0) {
      if (remainder < 10) {
        result += 'lẻ ' + ones[remainder];
      } else if (remainder < 20) {
        result += teens[remainder - 10];
      } else {
        const tensDigit = Math.floor(remainder / 10);
        const onesDigit = remainder % 10;
        result += tens[tensDigit];
        if (onesDigit > 0) {
          result += ' ' + ones[onesDigit];
        }
      }
    }

    return result.trim();
  }

  if (num === 0) return 'không đồng';
  if (num < 0) return 'âm ' + numberToVietnamese(-num);

  let result = '';
  const billions = Math.floor(num / 1000000000);
  const millions = Math.floor((num % 1000000000) / 1000000);
  const thousands = Math.floor((num % 1000000) / 1000);
  const remainder = num % 1000;

  if (billions > 0) {
    result += convertHundreds(billions) + ' tỷ ';
  }
  if (millions > 0) {
    result += convertHundreds(millions) + ' triệu ';
  }
  if (thousands > 0) {
    result += convertHundreds(thousands) + ' nghìn ';
  }
  if (remainder > 0) {
    result += convertHundreds(remainder);
  }

  return result.trim() + ' đồng';
}

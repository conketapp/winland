/**
 * PDF Generation Types
 */

export type PdfType =
  | 'reservation'
  | 'booking'
  | 'deposit-contract'
  | 'transaction-receipt'
  | 'payment-schedule'
  | 'commission-report';

export interface PdfGenerationOptions {
  format?: 'A4' | 'Letter';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  displayHeaderFooter?: boolean;
}

export interface PdfStorageResult {
  url: string;
  filename: string;
  size: number;
  generatedAt: Date;
}

export interface TemplateContext {
  [key: string]: any;
}

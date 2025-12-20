/**
 * PDF Generator Utility using Puppeteer
 */

import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';

export interface PdfGeneratorOptions {
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

export class PdfGenerator {
  private static browserInstance: puppeteer.Browser | null = null;

  /**
   * Get or create browser instance (singleton)
   */
  private static async getBrowser(): Promise<puppeteer.Browser> {
    if (!this.browserInstance) {
      this.browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
    }
    return this.browserInstance;
  }

  /**
   * Close browser instance
   */
  static async closeBrowser(): Promise<void> {
    if (this.browserInstance) {
      await this.browserInstance.close();
      this.browserInstance = null;
    }
  }

  /**
   * Generate PDF from HTML string
   */
  static async generateFromHtml(
    html: string,
    options: PdfGeneratorOptions = {},
  ): Promise<Buffer> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        margin: {
          top: options.margin?.top || '20mm',
          right: options.margin?.right || '15mm',
          bottom: options.margin?.bottom || '20mm',
          left: options.margin?.left || '15mm',
        },
        printBackground: options.printBackground ?? true,
        displayHeaderFooter: options.displayHeaderFooter ?? false,
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await page.close();
    }
  }

  /**
   * Generate PDF from HTML file
   */
  static async generateFromFile(
    filePath: string,
    options: PdfGeneratorOptions = {},
  ): Promise<Buffer> {
    const html = await fs.readFile(filePath, 'utf-8');
    const pdfBuffer = await this.generateFromHtml(html, options);
    return Buffer.from(pdfBuffer);
  }
}

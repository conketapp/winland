/**
 * PDF Templates Management Service
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import { TemplateRenderer } from './utils/template-renderer.util';
import { TemplateContext } from './types/pdf.types';

export interface TemplateInfo {
  name: string;
  displayName: string;
  description: string;
  filename: string;
  lastModified?: Date;
  size?: number;
}

@Injectable()
export class PdfTemplatesService {
  private readonly logger = new Logger(PdfTemplatesService.name);

  private readonly templatesConfig: Record<string, { displayName: string; description: string }> = {
    'reservation': {
      displayName: 'Phiếu Giữ chỗ',
      description: 'Template cho phiếu giữ chỗ căn hộ',
    },
    'deposit-contract': {
      displayName: 'Hợp đồng Đặt cọc',
      description: 'Template cho hợp đồng đặt cọc',
    },
    'booking-receipt': {
      displayName: 'Phiếu Đặt chỗ',
      description: 'Template cho phiếu đặt chỗ',
    },
    'transaction-receipt': {
      displayName: 'Phiếu Nhận Tiền',
      description: 'Template cho phiếu nhận tiền giao dịch',
    },
    'payment-schedule': {
      displayName: 'Lịch Trả góp',
      description: 'Template cho lịch trả góp chi tiết',
    },
    'commission-report': {
      displayName: 'Báo cáo Hoa hồng',
      description: 'Template cho báo cáo hoa hồng CTV',
    },
  };

  /**
   * Get templates directory path
   * Templates are .hbs files that are not compiled, so we always use src path
   */
  private getTemplatesDir(): string {
    // When running from dist, __dirname will be:
    // .../dist/apps/backend/src/modules/pdf
    // We need to go back to the root (apps/backend) and then to src/modules/pdf/templates
    
    // Check if we're in compiled code (dist) or source code
    if (__dirname.includes('dist')) {
      // From dist/apps/backend/src/modules/pdf, go up 6 levels to apps/backend root
      const rootDir = path.resolve(__dirname, '../../../../../../');
      return path.join(rootDir, 'src', 'modules', 'pdf', 'templates');
    }
    
    // In development (source code), __dirname is in src/modules/pdf
    // Go up 3 levels to apps/backend root
    const rootDir = path.resolve(__dirname, '../../..');
    return path.join(rootDir, 'src', 'modules', 'pdf', 'templates');
  }

  /**
   * Get template file path
   */
  private getTemplatePath(name: string): string {
    const templatesDir = this.getTemplatesDir();
    return path.join(templatesDir, `${name}.hbs`);
  }

  /**
   * Export getTemplatesDir for testing
   */
  public getTemplatesDirectory(): string {
    return this.getTemplatesDir();
  }

  /**
   * List all available templates
   */
  async listTemplates(): Promise<TemplateInfo[]> {
    const templates: TemplateInfo[] = [];

    for (const [name, config] of Object.entries(this.templatesConfig)) {
      const filePath = this.getTemplatePath(name);
      try {
        const stats = await fs.stat(filePath);
        templates.push({
          name,
          displayName: config.displayName,
          description: config.description,
          filename: `${name}.hbs`,
          lastModified: stats.mtime,
          size: stats.size,
        });
      } catch (error) {
        this.logger.warn(`Template file not found: ${filePath}`);
      }
    }

    return templates;
  }

  /**
   * Get template content
   */
  async getTemplate(name: string): Promise<{ name: string; content: string; displayName: string; description: string }> {
    // Validate template name
    if (!this.templatesConfig[name]) {
      throw new NotFoundException(`Template ${name} not found`);
    }

    const filePath = this.getTemplatePath(name);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const config = this.templatesConfig[name];

      return {
        name,
        content,
        displayName: config.displayName,
        description: config.description,
      };
    } catch (error) {
      this.logger.error(`Failed to read template ${name}:`, error);
      throw new NotFoundException(`Template ${name} not found`);
    }
  }

  /**
   * Update template content
   */
  async updateTemplate(name: string, content: string): Promise<{ name: string; message: string }> {
    // Validate template name
    if (!this.templatesConfig[name]) {
      throw new NotFoundException(`Template ${name} not found`);
    }

    const filePath = this.getTemplatePath(name);
    
    try {
      // Validate Handlebars syntax by trying to compile
      Handlebars.compile(content);
    } catch (error) {
      this.logger.error(`Invalid Handlebars syntax in template ${name}:`, error);
      throw new Error(`Invalid template syntax: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Write to file
    await fs.writeFile(filePath, content, 'utf-8');

    // Clear template cache to force reload
    TemplateRenderer.clearCache();

    this.logger.log(`Template ${name} updated successfully`);
    return {
      name,
      message: 'Template updated successfully',
    };
  }

  /**
   * Preview template with sample or provided context
   */
  async previewTemplate(name: string, context?: Record<string, unknown>): Promise<{ html: string }> {
    // Validate template name
    if (!this.templatesConfig[name]) {
      throw new NotFoundException(`Template ${name} not found`);
    }

    // Use provided context or generate sample context
    const sampleContext: TemplateContext = context || this.generateSampleContext(name);

    try {
      // Render template
      const html = await TemplateRenderer.render(name, sampleContext);
      return { html };
    } catch (error) {
      this.logger.error(`Failed to preview template ${name}:`, error);
      throw new Error(
        `Failed to render template: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate sample context for preview
   */
  private generateSampleContext(templateName: string): TemplateContext {
    const baseContext: TemplateContext = {
      companyName: 'CÔNG TY TNHH BẤT ĐỘNG SẢN WINLAND',
      companyAddress: '123 Đường ABC, Quận XYZ, TP.HCM',
      companyTaxCode: '0123456789',
      companyPhone: '1900 1234',
      companyEmail: 'info@winland.com',
      companyRepresentative: 'Nguyễn Văn A',
      companyLogo: null,

      customerName: 'Trần Văn B',
      customerPhone: '0901234567',
      customerEmail: 'customer@example.com',
      customerIdCard: '001234567890',
      customerAddress: '456 Đường DEF, Quận 1, TP.HCM',

      projectName: 'Vinhomes Smart City',
      unitCode: 'A1-501',
      buildingName: 'Tòa A1',
      floorNumber: '5',
      unitArea: 75,
      unitPrice: 2500000000,

      contractNumber: 'DP000001',
      contractDate: new Date(),

      depositAmount: 250000000,
      depositPercentage: 10,
    };

    // Template-specific context
    switch (templateName) {
      case 'deposit-contract':
        return {
          ...baseContext,
          paymentSchedules: [
            { installment: 2, amount: 675000000, dueDate: new Date('2025-02-01') },
            { installment: 3, amount: 675000000, dueDate: new Date('2025-03-01') },
            { installment: 4, amount: 900000000, dueDate: new Date('2025-04-01') },
          ],
          bankName: 'Vietcombank',
          bankAccount: '1234567890',
          bankAccountName: 'CÔNG TY TNHH BẤT ĐỘNG SẢN WINLAND',
          transferContent: 'DP000001 Trần Văn B Deposit',
        };

      case 'booking-receipt':
        return {
          ...baseContext,
          bookingCode: 'BK000001',
          bookingAmount: 25000000,
          expiresAt: new Date('2025-01-25'),
        };

      case 'transaction-receipt':
        return {
          ...baseContext,
          transactionCode: 'TXN000001',
          transactionAmount: 675000000,
          paymentMethod: 'BANK_TRANSFER',
          paymentDate: new Date(),
        };

      case 'payment-schedule':
        return {
          ...baseContext,
          paymentSchedules: [
            {
              installment: 1,
              name: 'Cọc',
              amount: 250000000,
              dueDate: new Date('2025-01-01'),
              status: 'PAID',
              paidAmount: 250000000,
              paidAt: new Date('2025-01-01'),
            },
            {
              installment: 2,
              name: 'Đợt 1',
              amount: 675000000,
              dueDate: new Date('2025-02-01'),
              status: 'PENDING',
              paidAmount: 0,
            },
          ],
        };

      default:
        return baseContext;
    }
  }
}
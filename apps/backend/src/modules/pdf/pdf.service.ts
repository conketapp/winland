import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * PDF Generation Service
 * 
 * NOTE: This is a simplified implementation with placeholder URLs.
 * In production, you would integrate with:
 * - puppeteer (HTML to PDF)
 * - pdfkit (programmatic PDF generation)
 * - Template engines (handlebars, ejs) for dynamic content
 * - Cloud storage (S3, Google Cloud Storage) for PDF hosting
 */
@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate PDF contract for deposit
   * Returns URL to generated PDF
   */
  async generateDepositContract(depositId: string): Promise<string> {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        paymentSchedules: true,
      },
    });

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    // In production: Generate PDF using template
    // For now: Return placeholder URL
    const pdfUrl = this.generatePlaceholderPdfUrl('deposit', deposit.code);

    // Update deposit with contract URL
    await this.prisma.deposit.update({
      where: { id: depositId },
      data: { contractUrl: pdfUrl },
    });

    return pdfUrl;
  }

  /**
   * Generate PDF receipt for booking
   */
  async generateBookingReceipt(bookingId: string): Promise<string> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        unit: {
          include: {
            project: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // In production: Generate PDF using template
    const pdfUrl = this.generatePlaceholderPdfUrl('booking', booking.code);

    return pdfUrl;
  }

  /**
   * Generate PDF receipt for transaction
   */
  async generateTransactionReceipt(transactionId: string): Promise<string> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        deposit: {
          include: {
            unit: true,
          },
        },
        paymentSchedule: true,
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // In production: Generate PDF using template
    const depositCode = transaction.deposit.code;
    const installment = transaction.paymentSchedule?.installment || 0;
    const filename = `${depositCode}_payment_${installment}`;
    
    const pdfUrl = this.generatePlaceholderPdfUrl('transaction', filename);

    return pdfUrl;
  }

  /**
   * Generate payment schedule PDF
   */
  async generatePaymentSchedulePdf(depositId: string): Promise<string> {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        unit: {
          include: {
            project: true,
          },
        },
        paymentSchedules: {
          orderBy: { installment: 'asc' },
        },
      },
    });

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    // In production: Generate PDF with payment schedule table
    const pdfUrl = this.generatePlaceholderPdfUrl('payment-schedule', deposit.code);

    return pdfUrl;
  }

  /**
   * Generate commission report PDF for CTV
   */
  async generateCommissionReport(ctvId: string): Promise<string> {
    const commissions = await this.prisma.commission.findMany({
      where: { ctvId },
      include: {
        unit: {
          include: {
            project: true,
          },
        },
        deposit: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (commissions.length === 0) {
      throw new Error('No commissions found for this CTV');
    }

    // In production: Generate PDF with commission summary
    const timestamp = Date.now();
    const pdfUrl = this.generatePlaceholderPdfUrl('commission-report', `ctv_${ctvId}_${timestamp}`);

    return pdfUrl;
  }

  /**
   * Get deposit contract data (for preview)
   */
  async getDepositContractData(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
          },
        },
        paymentSchedules: {
          orderBy: { installment: 'asc' },
        },
      },
    });

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    return {
      deposit,
      contractInfo: {
        contractNumber: deposit.code,
        contractDate: deposit.createdAt,
        sellerName: 'CÔNG TY BẤT ĐỘNG SẢN',
        buyerName: deposit.customerName,
        buyerIdCard: deposit.customerIdCard,
        property: {
          projectName: deposit.unit.project.name,
          unitCode: deposit.unit.code,
          area: deposit.unit.area,
          price: deposit.unit.price,
        },
        payment: {
          depositAmount: deposit.depositAmount,
          depositPercentage: deposit.depositPercentage,
          schedules: deposit.paymentSchedules,
        },
        ctvInfo: {
          name: deposit.ctv.fullName,
          phone: deposit.ctv.phone,
        },
      },
    };
  }

  /**
   * Generate placeholder PDF URL
   * In production: This would be replaced with actual PDF generation
   */
  private generatePlaceholderPdfUrl(type: string, filename: string): string {
    // In production: Upload to cloud storage and return real URL
    // For now: Return a placeholder URL
    const timestamp = Date.now();
    return `https://storage.example.com/pdfs/${type}/${filename}_${timestamp}.pdf`;
  }
}


import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QrcodeService } from '../qrcode/qrcode.service';
import { TemplateRenderer } from './utils/template-renderer.util';
import { PdfGenerator } from './utils/pdf-generator.util';
import { PdfStorage } from './utils/storage.util';
import { WatermarkUtil } from './utils/watermark.util';
import { TemplateContext } from './types/pdf.types';
import moment from 'moment';

/**
 * PDF Generation Service
 * 
 * Generates PDF documents using Handlebars templates and Puppeteer
 */
@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);

  constructor(
    private prisma: PrismaService,
    private qrcodeService: QrcodeService,
  ) {}

  async onModuleDestroy() {
    // Close browser instance on module destroy
    await PdfGenerator.closeBrowser();
  }

  /**
   * Get system configuration values
   */
  private async getSystemConfigs(keys: string[]): Promise<Record<string, string>> {
    const configs = await this.prisma.systemConfig.findMany({
      where: {
        key: { in: keys },
      },
    });

    const result: Record<string, string> = {};
    configs.forEach((config) => {
      result[config.key] = config.value;
    });

    // Set defaults
    keys.forEach((key) => {
      if (!result[key]) {
        switch (key) {
          case 'company_name':
            result[key] = 'CÔNG TY BẤT ĐỘNG SẢN';
            break;
          case 'company_address':
            result[key] = '';
            break;
          case 'company_tax_code':
            result[key] = '';
            break;
          case 'bank_name':
            result[key] = 'Vietcombank';
            break;
          case 'bank_account_number':
            result[key] = '';
            break;
          case 'bank_account_name':
            result[key] = '';
            break;
          default:
            result[key] = '';
        }
      }
    });

    return result;
  }

  /**
   * Generate PDF for reservation
   */
  async generateReservationPdf(reservationId: string): Promise<string> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
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
      },
    });

    if (!reservation) {
      this.logger.error(`Reservation not found: ${reservationId}`);
      throw new Error('Reservation not found');
    }

    try {
      this.logger.log(`Generating reservation PDF for: ${reservation.code}`);
      

    // Get system configs
    const configs = await this.getSystemConfigs([
      'company_name',
      'company_address',
      'company_phone',
      'company_email',
      'company_logo_url',
    ]);

    // Calculate validity period
    const validFrom = reservation.createdAt;
    const validTo = moment(reservation.createdAt)
      .add(24, 'hours')
      .toDate();

    // Build template context
    const context: TemplateContext = {
      // Company info
      companyName: configs.company_name,
      companyAddress: configs.company_address,
      companyPhone: configs.company_phone,
      companyEmail: configs.company_email,
      companyLogo: configs.company_logo_url || null,

      // Reservation info
      reservationCode: reservation.code,
      validFrom,
      validTo,
      validityHours: 24,

      // Unit info
      projectName: reservation.unit.project.name,
      projectAddress: reservation.unit.project.address || '',
      unitCode: reservation.unit.code,
      buildingName: reservation.unit.building?.name || '',
      floorNumber: reservation.unit.floor?.floorNumber?.toString() || '',
      unitArea: reservation.unit.area,
      unitPrice: reservation.unit.price,

      // Customer info
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      customerEmail: reservation.customerEmail || '',
      customerIdCard: reservation.customerIdCard || '',

      // CTV info
      ctvName: reservation.ctv?.fullName || '',
      ctvPhone: reservation.ctv?.phone || '',
    };

    // Generate QR code (optional, for verification)
    // const qrCode = await QrcodeEmbedder.getDepositQRCode(this.qrcodeService, reservationId);
    // if (qrCode) {
    //   context.qrCode = qrCode;
    // }

    // Render template
    let html = await TemplateRenderer.render('reservation', context);

    // Add watermark based on status
    const watermarkText = WatermarkUtil.getWatermarkText('reservation', reservation.status);
    if (watermarkText) {
      html = WatermarkUtil.addWatermarkToHtml(html, { text: watermarkText });
    }

    // Generate PDF
    const pdfBuffer = await PdfGenerator.generateFromHtml(html);

      // Save to storage
      const filename = `reservation_${reservation.code}_${Date.now()}.pdf`;
      const storageResult = await PdfStorage.save(pdfBuffer, filename, 'reservations');

      this.logger.log(`Reservation PDF generated: ${storageResult.url}`);
      return storageResult.url;
    } catch (error) {
      this.logger.error(
        `Failed to generate reservation PDF for ${reservationId}:`,
        error instanceof Error ? error.stack : error,
      );
      throw new Error(
        `Failed to generate reservation PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate PDF contract for deposit
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
        paymentSchedules: {
          orderBy: { installment: 'asc' },
        },
      },
    });

    if (!deposit) {
      this.logger.error(`Deposit not found: ${depositId}`);
      throw new Error('Deposit not found');
    }

    try {
      this.logger.log(`Generating deposit contract PDF for: ${deposit.code}`);
      
      // Get system configs
    const configs = await this.getSystemConfigs([
      'company_name',
      'company_address',
      'company_tax_code',
      'company_phone',
      'company_representative',
      'company_logo_url',
      'bank_name',
      'bank_account_number',
      'bank_account_name',
    ]);

    // Build template context
    const context: TemplateContext = {
      // Company info
      companyName: configs.company_name,
      companyAddress: configs.company_address,
      companyTaxCode: configs.company_tax_code,
      companyPhone: configs.company_phone,
      companyRepresentative: configs.company_representative || 'Đại diện công ty',
      companyLogo: configs.company_logo_url || null,

      // Contract info
      contractNumber: deposit.code,
      contractDate: deposit.createdAt,

      // Customer info
      customerName: deposit.customerName,
      customerPhone: deposit.customerPhone,
      customerEmail: deposit.customerEmail || '',
      customerIdCard: deposit.customerIdCard,
      customerAddress: deposit.customerAddress,

      // Unit info
      projectName: deposit.unit.project.name,
      unitCode: deposit.unit.code,
      buildingName: deposit.unit.building?.name || '',
      floorNumber: deposit.unit.floor?.floorNumber?.toString() || '',
      unitArea: deposit.unit.area,
      unitPrice: deposit.unit.price,

      // Deposit info
      depositAmount: deposit.depositAmount,
      depositPercentage: deposit.depositPercentage,

      // Payment schedules
      paymentSchedules: deposit.paymentSchedules.map((schedule) => ({
        installment: schedule.installment,
        amount: schedule.amount,
        dueDate: schedule.dueDate,
      })),

      // CTV info
      ctvName: deposit.ctv?.fullName || '',
      ctvPhone: deposit.ctv?.phone || '',

      // Bank info
      bankName: configs.bank_name,
      bankAccount: configs.bank_account_number,
      bankAccountName: configs.bank_account_name,
      transferContent: `${deposit.code} ${deposit.customerName} Deposit`,
    };

    // Generate QR code
    try {
      const qrCode = await this.qrcodeService.generateDepositQR(depositId);
      context.qrCode = qrCode;
    } catch (error) {
      this.logger.warn(`Failed to generate QR code for deposit ${depositId}:`, error);
      // Continue without QR code
    }

    // Render template
    let html = await TemplateRenderer.render('deposit-contract', context);

    // Add watermark based on status
    const watermarkText = WatermarkUtil.getWatermarkText(
      'deposit',
      deposit.status,
    );
    if (watermarkText) {
      html = WatermarkUtil.addWatermarkToHtml(html, { text: watermarkText });
    }

    // Generate PDF
    const pdfBuffer = await PdfGenerator.generateFromHtml(html);

    // Save to storage
    const filename = `deposit_${deposit.code}_${Date.now()}.pdf`;
    const storageResult = await PdfStorage.save(pdfBuffer, filename, 'deposits');

      // Update deposit with contract URL
      await this.prisma.deposit.update({
        where: { id: depositId },
        data: { contractUrl: storageResult.url },
      });

      this.logger.log(`Deposit contract PDF generated: ${storageResult.url}`);
      return storageResult.url;
    } catch (error) {
      this.logger.error(
        `Failed to generate deposit contract PDF for ${depositId}:`,
        error instanceof Error ? error.stack : error,
      );
      throw new Error(
        `Failed to generate deposit contract PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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
      this.logger.error(`Booking not found: ${bookingId}`);
      throw new Error('Booking not found');
    }

    try {
      this.logger.log(`Generating booking receipt PDF for: ${booking.code}`);
      
      // Get system configs
    const configs = await this.getSystemConfigs([
      'company_name',
      'company_address',
      'company_phone',
      'company_logo_url',
      'bank_name',
      'bank_account_number',
      'bank_account_name',
    ]);

    // Build template context
    const context: TemplateContext = {
      // Company info
      companyName: configs.company_name,
      companyAddress: configs.company_address,
      companyPhone: configs.company_phone,
      companyLogo: configs.company_logo_url || null,

      // Booking info
      bookingCode: booking.code,
      status: booking.status,

      // Unit info
      projectName: booking.unit.project.name,
      unitCode: booking.unit.code,
      unitArea: booking.unit.area,
      unitPrice: booking.unit.price,

      // Customer info
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerIdCard: booking.customerIdCard || '',

      // Booking amount
      bookingAmount: booking.bookingAmount,

      // Bank info
      bankName: configs.bank_name,
      bankAccount: configs.bank_account_number,
      bankAccountName: configs.bank_account_name,
      transferContent: `${booking.code} ${booking.customerName} Booking`,
    };

      // Generate QR code
      try {
        const qrCode = await this.qrcodeService.generateBookingQR(bookingId);
        context.qrCode = qrCode;
      } catch (error) {
        this.logger.warn(`Failed to generate QR code for booking ${bookingId}:`, error);
        // Continue without QR code
      }

    // Render template
    let html = await TemplateRenderer.render('booking-receipt', context);

    // Add watermark based on status
    const watermarkText = WatermarkUtil.getWatermarkText(
      'booking',
      booking.status,
    );
    if (watermarkText) {
      html = WatermarkUtil.addWatermarkToHtml(html, { text: watermarkText });
    }

    // Generate PDF
    const pdfBuffer = await PdfGenerator.generateFromHtml(html);

      // Save to storage
      const filename = `booking_${booking.code}_${Date.now()}.pdf`;
      const storageResult = await PdfStorage.save(pdfBuffer, filename, 'bookings');

      this.logger.log(`Booking receipt PDF generated: ${storageResult.url}`);
      return storageResult.url;
    } catch (error) {
      this.logger.error(
        `Failed to generate booking receipt PDF for ${bookingId}:`,
        error instanceof Error ? error.stack : error,
      );
      throw new Error(
        `Failed to generate booking receipt PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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
            unit: {
              include: {
                project: true,
              },
            },
          },
        },
        paymentSchedule: true,
      },
    });

    if (!transaction) {
      this.logger.error(`Transaction not found: ${transactionId}`);
      throw new Error('Transaction not found');
    }

    try {
      this.logger.log(`Generating transaction receipt PDF for: ${transactionId}`);
      
      // Get system configs
    const configs = await this.getSystemConfigs([
      'company_name',
      'company_address',
      'company_tax_code',
      'company_phone',
      'company_logo_url',
    ]);

    const deposit = transaction.deposit;

    // Build template context
    const context: TemplateContext = {
      // Company info
      companyName: configs.company_name,
      companyAddress: configs.company_address,
      companyTaxCode: configs.company_tax_code,
      companyPhone: configs.company_phone,
      companyLogo: configs.company_logo_url || null,

      // Transaction info
      transactionCode: transaction.code || `TXN-${transactionId.substring(0, 8)}`,
      transactionDate: transaction.createdAt,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : 'Tiền mặt',
      referenceNumber: transaction.referenceNumber || '',

      // Deposit/Customer info
      depositCode: deposit.code,
      customerName: deposit.customerName,
      customerIdCard: deposit.customerIdCard,

      // Unit info
      unitCode: deposit.unit.code,
      projectName: deposit.unit.project.name,

      // Payment schedule info
      installment: transaction.paymentSchedule?.installment || null,

      // Payment content
      paymentContent: transaction.paymentSchedule
        ? `Đặt cọc căn hộ ${deposit.unit.code} - Đợt ${transaction.paymentSchedule.installment}`
        : `Đặt cọc căn hộ ${deposit.unit.code}`,

      // Receiver (admin who confirmed)
      receiverName: configs.company_name,
    };

    // Render template
    let html = await TemplateRenderer.render('transaction-receipt', context);

    // Add watermark
    const watermarkText = WatermarkUtil.getWatermarkText('transaction');
    if (watermarkText) {
      html = WatermarkUtil.addWatermarkToHtml(html, { text: watermarkText });
    }

    // Generate PDF
    const pdfBuffer = await PdfGenerator.generateFromHtml(html);

      // Save to storage
      const filename = `transaction_${transaction.code || transactionId}_${Date.now()}.pdf`;
      const storageResult = await PdfStorage.save(pdfBuffer, filename, 'transactions');

      this.logger.log(`Transaction receipt PDF generated: ${storageResult.url}`);
      return storageResult.url;
    } catch (error) {
      this.logger.error(
        `Failed to generate transaction receipt PDF for ${transactionId}:`,
        error instanceof Error ? error.stack : error,
      );
      throw new Error(
        `Failed to generate transaction receipt PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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
      this.logger.error(`Deposit not found: ${depositId}`);
      throw new Error('Deposit not found');
    }

    try {
      this.logger.log(`Generating payment schedule PDF for: ${deposit.code}`);
      
      // Get transactions to check payment status
    const transactions = await this.prisma.transaction.findMany({
      where: { depositId },
      include: { paymentSchedule: true },
    });

    // Map payment schedules with status
    const paymentSchedulesWithStatus = deposit.paymentSchedules.map((schedule) => {
      const transaction = transactions.find(
        (t) => t.paymentSchedule?.installment === schedule.installment,
      );
      const dueDate = moment(schedule.dueDate);
      const now = moment();
      return {
        ...schedule,
        paid: transaction?.status === 'CONFIRMED',
        overdue: !transaction && now.isAfter(dueDate),
      };
    });

    // Calculate totals
    const totalPrice = deposit.unit.price;
    const totalAmount = paymentSchedulesWithStatus.reduce(
      (sum, s) => sum + s.amount,
      0,
    );
    const remainingAmount =
      totalAmount - deposit.depositAmount || totalAmount;

    // Get system configs
    const configs = await this.getSystemConfigs([
      'company_name',
      'company_address',
      'company_tax_code',
      'company_phone',
      'company_email',
      'company_logo_url',
      'bank_name',
      'bank_account_number',
      'bank_account_name',
    ]);

    // Build template context
    const context: TemplateContext = {
      // Company info
      companyName: configs.company_name,
      companyAddress: configs.company_address,
      companyTaxCode: configs.company_tax_code,
      companyPhone: configs.company_phone,
      companyEmail: configs.company_email || '',
      companyLogo: configs.company_logo_url || null,

      // Contract info
      contractCode: deposit.code,
      createdAt: deposit.createdAt,

      // Customer info
      customerName: deposit.customerName,
      customerPhone: deposit.customerPhone,
      customerIdCard: deposit.customerIdCard,

      // Unit info
      projectName: deposit.unit.project.name,
      unitCode: deposit.unit.code,
      unitArea: deposit.unit.area,
      totalPrice,
      depositAmount: deposit.depositAmount,
      remainingAmount,

      // Payment schedules
      paymentSchedules: paymentSchedulesWithStatus,
      totalAmount,

      // Bank info
      bankName: configs.bank_name,
      bankAccount: configs.bank_account_number,
      bankAccountName: configs.bank_account_name,
    };

    // Render template
    const html = await TemplateRenderer.render('payment-schedule', context);

    // Generate PDF
    const pdfBuffer = await PdfGenerator.generateFromHtml(html);

      // Save to storage
      const filename = `payment_schedule_${deposit.code}_${Date.now()}.pdf`;
      const storageResult = await PdfStorage.save(
        pdfBuffer,
        filename,
        'payment-schedules',
      );

      this.logger.log(`Payment schedule PDF generated: ${storageResult.url}`);
      return storageResult.url;
    } catch (error) {
      this.logger.error(
        `Failed to generate payment schedule PDF for ${depositId}:`,
        error instanceof Error ? error.stack : error,
      );
      throw new Error(
        `Failed to generate payment schedule PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Generate commission report PDF for CTV
   */
  async generateCommissionReport(
    ctvId: string,
    periodFrom?: Date,
    periodTo?: Date,
  ): Promise<string> {
    // Get CTV info
    const ctv = await this.prisma.user.findUnique({
      where: { id: ctvId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        email: true,
      },
    });

    if (!ctv) {
      this.logger.error(`CTV not found: ${ctvId}`);
      throw new Error('CTV not found');
    }

    try {
      this.logger.log(`Generating commission report PDF for CTV: ${ctv.fullName}`);
      
      // Build date filter
    const dateFilter: {
      createdAt?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};
    if (periodFrom || periodTo) {
      dateFilter.createdAt = {};
      if (periodFrom) {
        dateFilter.createdAt.gte = periodFrom;
      }
      if (periodTo) {
        dateFilter.createdAt.lte = periodTo;
      }
    }

    // Get commissions
    const commissions = await this.prisma.commission.findMany({
      where: {
        ctvId,
        ...dateFilter,
      },
      include: {
        unit: {
          include: {
            project: true,
          },
        },
        deposit: true,
        paymentRequests: {
          where: { status: 'APPROVED' },
          orderBy: { approvedAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (commissions.length === 0) {
      throw new Error('No commissions found for this CTV');
    }

    // Calculate summary
    const summary = {
      totalEarned: commissions.reduce((sum, c) => sum + c.amount, 0),
      pending: commissions
        .filter((c) => c.status === 'PENDING')
        .reduce((sum, c) => sum + c.amount, 0),
      approved: commissions
        .filter((c) => c.status === 'APPROVED')
        .reduce((sum, c) => sum + c.amount, 0),
      paid: commissions
        .filter((c) => c.status === 'PAID')
        .reduce((sum, c) => sum + c.amount, 0),
    };

    // Format commissions for template
    const commissionsFormatted = commissions.map((c) => ({
      unitCode: c.unit.code,
      projectName: c.unit.project.name,
      unitPrice: c.basePrice,
      rate: c.rate,
      amount: c.amount,
      status: c.status,
      createdAt: c.createdAt,
    }));

    // Get payment history from approved payment requests
    const paymentHistory = commissions
      .flatMap((c) =>
        c.paymentRequests.map((pr) => ({
          paidAt: pr.approvedAt || pr.requestedAt,
          amount: pr.amount,
          notes: `Hoa hồng căn ${c.unit.code}`,
        })),
      )
      .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime());

    // Get system configs
    const configs = await this.getSystemConfigs([
      'company_name',
      'company_address',
      'company_tax_code',
      'company_phone',
      'company_email',
    ]);

    // Build template context
    const context: TemplateContext = {
      // Company info
      companyName: configs.company_name,
      companyAddress: configs.company_address,
      companyTaxCode: configs.company_tax_code,
      companyPhone: configs.company_phone,
      companyEmail: configs.company_email || '',

      // CTV info
      ctvName: ctv.fullName,
      ctvPhone: ctv.phone,
      ctvEmail: ctv.email || '',

      // Report info
      periodFrom: periodFrom
        ? moment(periodFrom).format('DD/MM/YYYY')
        : 'Từ đầu',
      periodTo: periodTo
        ? moment(periodTo).format('DD/MM/YYYY')
        : 'Đến nay',
      reportDate: new Date(),

      // Summary
      summary,

      // Commissions
      commissions: commissionsFormatted,

      // Payment history (if any)
      paymentHistory: paymentHistory.length > 0 ? paymentHistory : null,
    };

    // Render template
    const html = await TemplateRenderer.render('commission-report', context);

    // Generate PDF
    const pdfBuffer = await PdfGenerator.generateFromHtml(html);

      // Save to storage
      const timestamp = Date.now();
      const filename = `commission_report_ctv_${ctvId}_${timestamp}.pdf`;
      const storageResult = await PdfStorage.save(
        pdfBuffer,
        filename,
        'commissions',
      );

      this.logger.log(`Commission report PDF generated: ${storageResult.url}`);
      return storageResult.url;
    } catch (error) {
      this.logger.error(
        `Failed to generate commission report PDF for CTV ${ctvId}:`,
        error instanceof Error ? error.stack : error,
      );
      throw new Error(
        `Failed to generate commission report PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
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
}

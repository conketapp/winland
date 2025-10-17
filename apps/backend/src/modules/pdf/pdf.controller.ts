import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  /**
   * Generate deposit contract PDF
   * GET /api/pdf/deposit/:depositId/contract
   */
  @Get('deposit/:depositId/contract')
  async generateDepositContract(@Param('depositId') depositId: string) {
    const pdfUrl = await this.pdfService.generateDepositContract(depositId);
    return {
      depositId,
      pdfUrl,
      message: 'Contract PDF generated successfully',
    };
  }

  /**
   * Get deposit contract data (for preview)
   * GET /api/pdf/deposit/:depositId/contract-data
   */
  @Get('deposit/:depositId/contract-data')
  async getDepositContractData(@Param('depositId') depositId: string) {
    const data = await this.pdfService.getDepositContractData(depositId);
    return data;
  }

  /**
   * Generate booking receipt PDF
   * GET /api/pdf/booking/:bookingId/receipt
   */
  @Get('booking/:bookingId/receipt')
  async generateBookingReceipt(@Param('bookingId') bookingId: string) {
    const pdfUrl = await this.pdfService.generateBookingReceipt(bookingId);
    return {
      bookingId,
      pdfUrl,
      message: 'Booking receipt PDF generated successfully',
    };
  }

  /**
   * Generate transaction receipt PDF
   * GET /api/pdf/transaction/:transactionId/receipt
   */
  @Get('transaction/:transactionId/receipt')
  async generateTransactionReceipt(@Param('transactionId') transactionId: string) {
    const pdfUrl = await this.pdfService.generateTransactionReceipt(transactionId);
    return {
      transactionId,
      pdfUrl,
      message: 'Transaction receipt PDF generated successfully',
    };
  }

  /**
   * Generate payment schedule PDF
   * GET /api/pdf/deposit/:depositId/payment-schedule
   */
  @Get('deposit/:depositId/payment-schedule')
  async generatePaymentSchedulePdf(@Param('depositId') depositId: string) {
    const pdfUrl = await this.pdfService.generatePaymentSchedulePdf(depositId);
    return {
      depositId,
      pdfUrl,
      message: 'Payment schedule PDF generated successfully',
    };
  }

  /**
   * Generate commission report PDF for CTV
   * GET /api/pdf/commission-report/:ctvId
   */
  @Get('commission-report/:ctvId')
  async generateCommissionReport(@Param('ctvId') ctvId: string) {
    const pdfUrl = await this.pdfService.generateCommissionReport(ctvId);
    return {
      ctvId,
      pdfUrl,
      message: 'Commission report PDF generated successfully',
    };
  }
}


import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PdfService } from './pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  /**
   * Generate reservation PDF
   * GET /api/pdf/reservations/:reservationId
   */
  @Get('reservations/:reservationId')
  async generateReservationPdf(@Param('reservationId') reservationId: string) {
    try {
      const pdfUrl = await this.pdfService.generateReservationPdf(reservationId);
      return {
        reservationId,
        pdfUrl,
        message: 'Reservation PDF generated successfully',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate reservation PDF: ${reservationId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate deposit contract PDF
   * Legacy endpoint
   * GET /api/pdf/deposit/:depositId/contract
   */
  @Get('deposit/:depositId/contract')
  async generateDepositContract(@Param('depositId') depositId: string) {
    try {
      const pdfUrl = await this.pdfService.generateDepositContract(depositId);
      return {
        depositId,
        pdfUrl,
        message: 'Contract PDF generated successfully',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate deposit contract: ${depositId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate deposit PDF (contract shortcut)
   * GET /api/pdf/deposits/:depositId
   */
  @Get('deposits/:depositId')
  async generateDepositPdf(@Param('depositId') depositId: string) {
    try {
      const pdfUrl = await this.pdfService.generateDepositContract(depositId);
      return {
        depositId,
        pdfUrl,
        message: 'Deposit PDF generated successfully',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate deposit PDF: ${depositId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get deposit contract data (for preview)
   * GET /api/pdf/deposit/:depositId/contract-data
   */
  @Get('deposit/:depositId/contract-data')
  async getDepositContractData(@Param('depositId') depositId: string) {
    try {
      const data = await this.pdfService.getDepositContractData(depositId);
      return data;
    } catch (error) {
      this.logger.error(
        `Failed to get deposit contract data: ${depositId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to get contract data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate booking receipt PDF
   * Legacy endpoint
   * GET /api/pdf/booking/:bookingId/receipt
   */
  @Get('booking/:bookingId/receipt')
  async generateBookingReceipt(@Param('bookingId') bookingId: string) {
    try {
      const pdfUrl = await this.pdfService.generateBookingReceipt(bookingId);
      return {
        bookingId,
        pdfUrl,
        message: 'Booking receipt PDF generated successfully',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate booking receipt: ${bookingId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate booking PDF (receipt shortcut)
   * GET /api/pdf/bookings/:bookingId
   */
  @Get('bookings/:bookingId')
  async generateBookingPdf(@Param('bookingId') bookingId: string) {
    try {
      const pdfUrl = await this.pdfService.generateBookingReceipt(bookingId);
      return {
        bookingId,
        pdfUrl,
        message: 'Booking PDF generated successfully',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate booking PDF: ${bookingId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate transaction receipt PDF
   * GET /api/pdf/transaction/:transactionId/receipt
   */
  @Get('transaction/:transactionId/receipt')
  async generateTransactionReceipt(@Param('transactionId') transactionId: string) {
    try {
      const pdfUrl = await this.pdfService.generateTransactionReceipt(transactionId);
      return {
        transactionId,
        pdfUrl,
        message: 'Transaction receipt PDF generated successfully',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate transaction receipt: ${transactionId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate payment schedule PDF
   * GET /api/pdf/deposit/:depositId/payment-schedule
   */
  @Get('deposit/:depositId/payment-schedule')
  async generatePaymentSchedulePdf(@Param('depositId') depositId: string) {
    try {
      const pdfUrl = await this.pdfService.generatePaymentSchedulePdf(depositId);
      return {
        depositId,
        pdfUrl,
        message: 'Payment schedule PDF generated successfully',
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate payment schedule: ${depositId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate commission report PDF for CTV
   * GET /api/pdf/commission-report/:ctvId
   */
  @Get('commission-report/:ctvId')
  async generateCommissionReport(
    @Param('ctvId') ctvId: string,
    @Query('from') periodFrom?: string,
    @Query('to') periodTo?: string,
  ) {
    try {
      const fromDate = periodFrom ? new Date(periodFrom) : undefined;
      const toDate = periodTo ? new Date(periodTo) : undefined;

      const pdfUrl = await this.pdfService.generateCommissionReport(
        ctvId,
        fromDate,
        toDate,
      );
      return {
        ctvId,
        pdfUrl,
        message: 'Commission report PDF generated successfully',
        generatedAt: new Date().toISOString(),
        period: {
          from: periodFrom || null,
          to: periodTo || null,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to generate commission report: ${ctvId}`,
        error instanceof Error ? error.stack : error,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Failed to generate PDF',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


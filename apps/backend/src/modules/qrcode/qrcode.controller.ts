import { Controller, Get, Param, UseGuards, Post, Body } from '@nestjs/common';
import { QrcodeService } from './qrcode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('qrcode')
@UseGuards(JwtAuthGuard)
export class QrcodeController {
  constructor(private readonly qrcodeService: QrcodeService) {}

  /**
   * Generate QR code for booking payment
   * GET /api/qrcode/booking/:bookingId
   */
  @Get('booking/:bookingId')
  async generateBookingQR(@Param('bookingId') bookingId: string) {
    const qrCodeDataUrl = await this.qrcodeService.generateBookingQR(bookingId);
    return {
      bookingId,
      qrCode: qrCodeDataUrl,
    };
  }

  /**
   * Generate QR code for deposit payment
   * GET /api/qrcode/deposit/:depositId
   */
  @Get('deposit/:depositId')
  async generateDepositQR(@Param('depositId') depositId: string) {
    const qrCodeDataUrl = await this.qrcodeService.generateDepositQR(depositId);
    return {
      depositId,
      qrCode: qrCodeDataUrl,
    };
  }

  /**
   * Generate QR code for transaction payment
   * GET /api/qrcode/transaction/:transactionId
   */
  @Get('transaction/:transactionId')
  async generateTransactionQR(@Param('transactionId') transactionId: string) {
    const qrCodeDataUrl = await this.qrcodeService.generateTransactionQR(transactionId);
    return {
      transactionId,
      qrCode: qrCodeDataUrl,
    };
  }

  /**
   * Generate custom QR code
   * POST /api/qrcode/custom
   */
  @Post('custom')
  async generateCustomQR(@Body() body: { text: string }) {
    const qrCodeDataUrl = await this.qrcodeService.generateCustomQR(body.text);
    return {
      qrCode: qrCodeDataUrl,
    };
  }
}


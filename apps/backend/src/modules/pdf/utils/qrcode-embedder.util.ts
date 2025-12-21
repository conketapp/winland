/**
 * QR Code Embedder Utility
 * Integrates with QRCode service to embed QR codes in PDF templates
 */

import { Logger } from '@nestjs/common';
import { QrcodeService } from '../../qrcode/qrcode.service';

export class QrcodeEmbedder {
  private static readonly logger = new Logger(QrcodeEmbedder.name);

  /**
   * Get QR code data URL for deposit
   */
  static async getDepositQRCode(qrcodeService: QrcodeService, depositId: string): Promise<string | null> {
    try {
      return await qrcodeService.generateDepositQR(depositId);
    } catch (error) {
      this.logger.warn(`Failed to generate QR code for deposit ${depositId}:`, error);
      return null;
    }
  }

  /**
   * Get QR code data URL for booking
   */
  static async getBookingQRCode(qrcodeService: QrcodeService, bookingId: string): Promise<string | null> {
    try {
      return await qrcodeService.generateBookingQR(bookingId);
    } catch (error) {
      this.logger.warn(`Failed to generate QR code for booking ${bookingId}:`, error);
      return null;
    }
  }

  /**
   * Get QR code data URL for transaction
   */
  static async getTransactionQRCode(qrcodeService: QrcodeService, transactionId: string): Promise<string | null> {
    try {
      return await qrcodeService.generateTransactionQR(transactionId);
    } catch (error) {
      this.logger.warn(`Failed to generate QR code for transaction ${transactionId}:`, error);
      return null;
    }
  }
}

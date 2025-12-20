/**
 * QR Code Embedder Utility
 * Integrates with QRCode service to embed QR codes in PDF templates
 */

import { QrcodeService } from '../../qrcode/qrcode.service';

export class QrcodeEmbedder {
  /**
   * Get QR code data URL for deposit
   */
  static async getDepositQRCode(qrcodeService: QrcodeService, depositId: string): Promise<string | null> {
    try {
      return await qrcodeService.generateDepositQR(depositId);
    } catch (error) {
      console.error(`Failed to generate QR code for deposit ${depositId}:`, error);
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
      console.error(`Failed to generate QR code for booking ${bookingId}:`, error);
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
      console.error(`Failed to generate QR code for transaction ${transactionId}:`, error);
      return null;
    }
  }
}

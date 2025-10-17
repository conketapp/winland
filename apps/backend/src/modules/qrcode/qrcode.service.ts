import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';

interface BankQRData {
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  amount: number;
  content: string;
}

@Injectable()
export class QrcodeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate QR code for payment
   * Returns base64 image
   */
  async generatePaymentQR(data: BankQRData): Promise<string> {
    // Format: Bank Name | Account | Account Name | Amount | Content
    const qrContent = [
      `Bank: ${data.bankName}`,
      `Account: ${data.bankAccount}`,
      `Name: ${data.bankAccountName}`,
      `Amount: ${this.formatCurrency(data.amount)}`,
      `Content: ${data.content}`,
    ].join('\n');

    try {
      // Generate QR code as base64
      const qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate QR code for booking payment
   */
  async generateBookingQR(bookingId: string): Promise<string> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        unit: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Get bank info from system config
    const bankConfigs = await this.prisma.systemConfig.findMany({
      where: {
        key: {
          in: ['bank_name', 'bank_account_number', 'bank_account_name'],
        },
      },
    });

    const bankInfo = {
      bankName: bankConfigs.find((c) => c.key === 'bank_name')?.value || 'Vietcombank',
      bankAccount: bankConfigs.find((c) => c.key === 'bank_account_number')?.value || '1234567890',
      bankAccountName: bankConfigs.find((c) => c.key === 'bank_account_name')?.value || 'CONG TY BDS',
    };

    const qrData: BankQRData = {
      bankName: bankInfo.bankName,
      bankAccount: bankInfo.bankAccount,
      bankAccountName: bankInfo.bankAccountName,
      amount: booking.bookingAmount,
      content: `${booking.code} ${booking.customerName} Booking`,
    };

    return this.generatePaymentQR(qrData);
  }

  /**
   * Generate QR code for deposit payment
   */
  async generateDepositQR(depositId: string): Promise<string> {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        unit: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!deposit) {
      throw new Error('Deposit not found');
    }

    // Get bank info from system config
    const bankConfigs = await this.prisma.systemConfig.findMany({
      where: {
        key: {
          in: ['bank_name', 'bank_account_number', 'bank_account_name'],
        },
      },
    });

    const bankInfo = {
      bankName: bankConfigs.find((c) => c.key === 'bank_name')?.value || 'Vietcombank',
      bankAccount: bankConfigs.find((c) => c.key === 'bank_account_number')?.value || '1234567890',
      bankAccountName: bankConfigs.find((c) => c.key === 'bank_account_name')?.value || 'CONG TY BDS',
    };

    const qrData: BankQRData = {
      bankName: bankInfo.bankName,
      bankAccount: bankInfo.bankAccount,
      bankAccountName: bankInfo.bankAccountName,
      amount: deposit.depositAmount,
      content: `${deposit.code} ${deposit.customerName} Deposit`,
    };

    return this.generatePaymentQR(qrData);
  }

  /**
   * Generate QR code for transaction payment
   */
  async generateTransactionQR(transactionId: string): Promise<string> {
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

    // Get bank info from system config
    const bankConfigs = await this.prisma.systemConfig.findMany({
      where: {
        key: {
          in: ['bank_name', 'bank_account_number', 'bank_account_name'],
        },
      },
    });

    const bankInfo = {
      bankName: bankConfigs.find((c) => c.key === 'bank_name')?.value || 'Vietcombank',
      bankAccount: bankConfigs.find((c) => c.key === 'bank_account_number')?.value || '1234567890',
      bankAccountName: bankConfigs.find((c) => c.key === 'bank_account_name')?.value || 'CONG TY BDS',
    };

    const installmentInfo = transaction.paymentSchedule
      ? ` Dot${transaction.paymentSchedule.installment}`
      : '';

    const qrData: BankQRData = {
      bankName: bankInfo.bankName,
      bankAccount: bankInfo.bankAccount,
      bankAccountName: bankInfo.bankAccountName,
      amount: transaction.amount,
      content: `${transaction.deposit.code}${installmentInfo} ${transaction.deposit.customerName}`,
    };

    return this.generatePaymentQR(qrData);
  }

  /**
   * Format currency to VND
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  /**
   * Generate custom QR code from text
   */
  async generateCustomQR(text: string): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
      });

      return qrCodeDataUrl;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


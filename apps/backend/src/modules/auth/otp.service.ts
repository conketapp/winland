import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  
  // Config (sau này sẽ lấy từ SystemConfig)
  private readonly OTP_EXPIRY_MINUTES = 5;
  private readonly OTP_RETRY_LIMIT = 3;
  private readonly OTP_RESEND_COOLDOWN_SECONDS = 60;

  constructor(private prisma: PrismaService) {}

  /**
   * Generate random 6-digit OTP code
   */
  private generateOtpCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP via SMS (Mock implementation)
   * TODO: Integrate with real SMS provider (Twilio, AWS SNS, etc.)
   */
  private async sendSms(phone: string, code: string): Promise<void> {
    // Mock SMS sending
    this.logger.log(`[MOCK SMS] Sending OTP ${code} to ${phone}`);
    
    // In production, integrate with:
    // - Twilio: await this.twilioClient.messages.create({...})
    // - AWS SNS: await this.snsClient.publish({...})
    // - Other SMS gateway
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Send OTP to phone number
   */
  async sendOtp(phone: string, purpose: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD'): Promise<{
    message: string;
    expiresAt: Date;
    canResendAt: Date;
  }> {
    // Check rate limiting
    const recentOtps = await this.prisma.oTP.findMany({
      where: {
        phone,
        purpose,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last 1 hour
        },
      },
    });

    if (recentOtps.length >= this.OTP_RETRY_LIMIT) {
      throw new BadRequestException(
        `Bạn đã gửi quá ${this.OTP_RETRY_LIMIT} OTP trong 1 giờ. Vui lòng thử lại sau.`
      );
    }

    // Check cooldown (must wait 60s between sends)
    const lastOtp = recentOtps[recentOtps.length - 1];
    if (lastOtp) {
      const timeSinceLastOtp = Date.now() - lastOtp.createdAt.getTime();
      if (timeSinceLastOtp < this.OTP_RESEND_COOLDOWN_SECONDS * 1000) {
        const waitTime = Math.ceil((this.OTP_RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastOtp) / 1000);
        throw new BadRequestException(
          `Vui lòng đợi ${waitTime} giây trước khi gửi lại OTP`
        );
      }
    }

    // Generate OTP
    const code = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save to database
    await this.prisma.oTP.create({
      data: {
        phone,
        code,
        purpose,
        expiresAt,
        attempts: 0,
      },
    });

    // Send SMS
    await this.sendSms(phone, code);

    return {
      message: 'OTP đã được gửi đến số điện thoại của bạn',
      expiresAt,
      canResendAt: new Date(Date.now() + this.OTP_RESEND_COOLDOWN_SECONDS * 1000),
    };
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(phone: string, code: string, purpose: string): Promise<boolean> {
    // DEV MODE: Allow mock OTP for testing
    if (process.env.NODE_ENV === 'development' && code === '123456') {
      this.logger.log(`🔓 DEV MODE: Mock OTP accepted for ${phone}`);
      return true;
    }

    // Find latest OTP for this phone + purpose
    const otp = await this.prisma.oTP.findFirst({
      where: {
        phone,
        purpose,
        verifiedAt: null, // Not verified yet
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('OTP không tồn tại hoặc đã được sử dụng');
    }

    // Check expiry
    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP đã hết hạn. Vui lòng gửi lại OTP mới');
    }

    // Check attempts
    if (otp.attempts >= 3) {
      throw new BadRequestException('Bạn đã nhập sai OTP quá 3 lần. Vui lòng gửi lại OTP mới');
    }

    // Verify code
    if (otp.code !== code) {
      // Increment attempts
      await this.prisma.oTP.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 },
      });

      const remainingAttempts = 3 - (otp.attempts + 1);
      throw new BadRequestException(
        `OTP không đúng. Còn ${remainingAttempts} lần thử`
      );
    }

    // Mark as verified
    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { verifiedAt: new Date() },
    });

    return true;
  }

  /**
   * Check if OTP was recently verified (within 5 minutes)
   * Use this to prevent replay attacks
   */
  async isOtpRecentlyVerified(phone: string, purpose: string): Promise<boolean> {
    const recentVerified = await this.prisma.oTP.findFirst({
      where: {
        phone,
        purpose,
        verifiedAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
    });

    return !!recentVerified;
  }

  /**
   * Clean up old OTPs (run as cronjob)
   */
  async cleanupOldOtps(): Promise<number> {
    const result = await this.prisma.oTP.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24h
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} old OTPs`);
    return result.count;
  }
}


import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export enum CodeType {
  RESERVATION = 'RESERVATION',
  BOOKING = 'BOOKING',
  DEPOSIT = 'DEPOSIT',
}

@Injectable()
export class CodeGeneratorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate sequential code with atomic operation to prevent race condition
   * Format: RS000001, BK000001, DP000001
   * 
   * @param type Code type (RESERVATION, BOOKING, DEPOSIT)
   * @param tx Optional transaction client (if called from within a transaction)
   * @returns Generated code (e.g., "RS000001")
   */
  async generateCode(type: CodeType, tx?: any): Promise<string> {
    // If transaction client provided, use it directly
    if (tx) {
      return this.generateCodeInTransaction(type, tx);
    }

    // Otherwise, create new transaction with retry logic
    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await this.generateCodeWithRetry(type);
      } catch (error: any) {
        attempt++;
        
        // If it's a unique constraint violation, retry
        if (
          (error.code === 'P2002' || error.message?.includes('Unique constraint')) &&
          attempt < maxRetries
        ) {
          // Exponential backoff: 10ms, 20ms, 40ms, 80ms, 160ms
          await new Promise((resolve) => setTimeout(resolve, 10 * Math.pow(2, attempt - 1)));
          continue;
        }
        
        // Otherwise, throw the error
        throw error;
      }
    }

    throw new Error(`Failed to generate code after ${maxRetries} attempts`);
  }

  /**
   * Generate code within existing transaction using sequence table
   * More efficient than count() and better for high concurrency
   */
  private async generateCodeInTransaction(type: CodeType, tx: any): Promise<string> {
    // Get prefix based on type
    const prefix = this.getPrefix(type);
    const sequenceType = type.toString();

    // Get or create sequence record
    let sequence = await tx.sequence.findUnique({
      where: { type: sequenceType },
    });

    if (!sequence) {
      // Initialize sequence if not exists
      sequence = await tx.sequence.create({
        data: {
          type: sequenceType,
          current: 0,
        },
      });
    }

    // Increment sequence atomically
    const updatedSequence = await tx.sequence.update({
      where: { type: sequenceType },
      data: {
        current: {
          increment: 1,
        },
      },
    });

    // Generate code from sequence number
    const nextNumber = updatedSequence.current;
    const code = `${prefix}${nextNumber.toString().padStart(6, '0')}`;

    // Verify code doesn't exist (safety check)
    const existing = await this.verifyCodeExists(type, code, tx);
    if (existing) {
      // If code exists (shouldn't happen with sequence), increment again
      const retrySequence = await tx.sequence.update({
        where: { type: sequenceType },
        data: {
          current: {
            increment: 1,
          },
        },
      });
      return `${prefix}${retrySequence.current.toString().padStart(6, '0')}`;
    }

    return code;
  }

  /**
   * Internal method to generate code with transaction protection
   */
         private async generateCodeWithRetry(type: CodeType): Promise<string> {
    return await this.prisma.$transaction(
      async (tx) => {
        return this.generateCodeInTransaction(type, tx);
      },
      {
        isolationLevel: 'Serializable',
        timeout: 5000,
      }
    );
  }

  /**
   * Get prefix for code type
   */
  private getPrefix(type: CodeType): string {
    switch (type) {
      case CodeType.RESERVATION:
        return 'RS';
      case CodeType.BOOKING:
        return 'BK';
      case CodeType.DEPOSIT:
        return 'DP';
      default:
        throw new Error(`Unknown code type: ${type}`);
    }
  }

  /**
   * Initialize sequence if not exists (for migration/backfill)
   * This method can be called to sync sequence with existing records
   */
  async initializeSequence(type: CodeType): Promise<void> {
    const sequenceType = type.toString();
    
    const existing = await this.prisma.sequence.findUnique({
      where: { type: sequenceType },
    });

    if (existing) {
      return; // Already initialized
    }

    // Get max count from actual records to initialize sequence
    let maxCount = 0;
    switch (type) {
      case CodeType.RESERVATION:
        maxCount = await this.prisma.reservation.count({});
        break;
      case CodeType.BOOKING:
        maxCount = await this.prisma.booking.count({});
        break;
      case CodeType.DEPOSIT:
        maxCount = await this.prisma.deposit.count({});
        break;
    }

    // Create sequence starting from max count
    await this.prisma.sequence.create({
      data: {
        type: sequenceType,
        current: maxCount,
      },
    });
  }

  /**
   * Verify if code already exists (for double-check)
   */
  private async verifyCodeExists(type: CodeType, code: string, tx: any): Promise<boolean> {
    switch (type) {
      case CodeType.RESERVATION:
        return !!(await tx.reservation.findUnique({ where: { code } }));
      case CodeType.BOOKING:
        return !!(await tx.booking.findUnique({ where: { code } }));
      case CodeType.DEPOSIT:
        return !!(await tx.deposit.findUnique({ where: { code } }));
      default:
        throw new Error(`Unknown code type: ${type}`);
    }
  }
}


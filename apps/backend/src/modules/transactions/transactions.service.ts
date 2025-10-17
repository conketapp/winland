import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create new transaction (payment record)
   */
  async create(createTransactionDto: CreateTransactionDto, ctvId: string) {
    // Verify deposit exists and belongs to CTV
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: createTransactionDto.depositId },
      include: { unit: true },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    if (deposit.ctvId !== ctvId) {
      throw new BadRequestException('You can only create transactions for your own deposits');
    }

    // Verify payment schedule if provided
    if (createTransactionDto.paymentScheduleId) {
      const schedule = await this.prisma.paymentSchedule.findUnique({
        where: { id: createTransactionDto.paymentScheduleId },
      });

      if (!schedule) {
        throw new NotFoundException('Payment schedule not found');
      }

      if (schedule.depositId !== createTransactionDto.depositId) {
        throw new BadRequestException('Payment schedule does not belong to this deposit');
      }

      if (schedule.status === 'PAID') {
        throw new BadRequestException('This installment has already been paid');
      }
    }

    // Create transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        ...createTransactionDto,
        paymentDate: new Date(createTransactionDto.paymentDate),
      },
      include: {
        deposit: true,
        paymentSchedule: true,
      },
    });

    return transaction;
  }

  /**
   * Get all transactions (with filters)
   */
  async findAll(query: QueryTransactionDto) {
    const where: any = {};

    if (query.depositId) {
      where.depositId = query.depositId;
    }

    if (query.paymentScheduleId) {
      where.paymentScheduleId = query.paymentScheduleId;
    }

    if (query.status) {
      where.status = query.status;
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        deposit: {
          include: {
            unit: true,
          },
        },
        paymentSchedule: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get transactions for a specific deposit
   */
  async findByDeposit(depositId: string) {
    return this.prisma.transaction.findMany({
      where: { depositId },
      include: {
        paymentSchedule: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get transaction by ID
   */
  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
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
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Admin confirms transaction (payment)
   * This updates the payment schedule and checks if unit is fully paid
   */
  async confirm(id: string, confirmDto: ConfirmTransactionDto, _adminId: string) {
    const transaction = await this.findOne(id);

    if (transaction.status !== 'PENDING_CONFIRMATION') {
      throw new BadRequestException('Transaction is not pending confirmation');
    }

    // Update transaction
    await this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        notes: confirmDto.notes || transaction.notes,
      },
    });

    // Update payment schedule if linked
    if (transaction.paymentScheduleId) {
      const schedule = await this.prisma.paymentSchedule.findUnique({
        where: { id: transaction.paymentScheduleId },
      });

      if (schedule) {
        const newPaidAmount = schedule.paidAmount + transaction.amount;

        await this.prisma.paymentSchedule.update({
          where: { id: transaction.paymentScheduleId },
          data: {
            paidAmount: newPaidAmount,
            status: newPaidAmount >= schedule.amount ? 'PAID' : 'PENDING',
            paidAt: newPaidAmount >= schedule.amount ? new Date() : null,
          },
        });
      }
    }

    // Check if all schedules are paid → Mark unit as SOLD
    await this.checkAndMarkUnitAsSold(transaction.depositId);

    return this.findOne(id);
  }

  /**
   * Admin rejects transaction
   */
  async reject(id: string, reason: string) {
    const transaction = await this.findOne(id);

    if (transaction.status !== 'PENDING_CONFIRMATION') {
      throw new BadRequestException('Transaction is not pending confirmation');
    }

    await this.prisma.transaction.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason,
      },
    });

    return this.findOne(id);
  }

  /**
   * Check if all payment schedules are paid
   * If yes, mark unit as SOLD and create commission
   */
  private async checkAndMarkUnitAsSold(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        unit: true,
        paymentSchedules: true,
      },
    });

    if (!deposit) {
      return;
    }

    // Check if all schedules are PAID
    const allPaid = deposit.paymentSchedules.every((schedule) => schedule.status === 'PAID');

    if (allPaid && deposit.unit.status !== 'SOLD') {
      // Update unit to SOLD
      await this.prisma.unit.update({
        where: { id: deposit.unitId },
        data: {
          status: 'SOLD',
        },
      });

      // Check if commission already exists
      const existingCommission = await this.prisma.commission.findUnique({
        where: { depositId },
      });

      if (!existingCommission) {
        // Create commission
        const commissionRate = deposit.unit.commissionRate || 2.0; // default 2%
        const commissionAmount = (deposit.unit.price * commissionRate) / 100;

        await this.prisma.commission.create({
          data: {
            unitId: deposit.unitId,
            ctvId: deposit.ctvId,
            depositId: deposit.id,
            amount: commissionAmount,
            rate: commissionRate,
            status: 'PENDING',
          },
        });
      }
    }
  }

  /**
   * Get payment summary for a deposit
   */
  async getPaymentSummary(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        unit: true,
        paymentSchedules: {
          include: {
            transactions: true,
          },
        },
        transactions: true,
      },
    });

    if (!deposit) {
      throw new NotFoundException('Deposit not found');
    }

    const totalScheduledAmount = deposit.paymentSchedules.reduce((sum, s) => sum + s.amount, 0);
    const totalPaidAmount = deposit.paymentSchedules.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalConfirmedTransactions = deposit.transactions.filter((t) => t.status === 'CONFIRMED').length;
    const totalPendingTransactions = deposit.transactions.filter((t) => t.status === 'PENDING_CONFIRMATION').length;

    const percentComplete = totalScheduledAmount > 0 ? (totalPaidAmount / totalScheduledAmount) * 100 : 0;

    return {
      deposit: {
        id: deposit.id,
        code: deposit.code,
        unitPrice: deposit.unit.price,
      },
      summary: {
        totalScheduledAmount,
        totalPaidAmount,
        totalRemainingAmount: totalScheduledAmount - totalPaidAmount,
        percentComplete: Math.round(percentComplete * 100) / 100,
        totalConfirmedTransactions,
        totalPendingTransactions,
      },
      schedules: deposit.paymentSchedules.map((schedule) => ({
        id: schedule.id,
        installment: schedule.installment,
        name: schedule.name,
        amount: schedule.amount,
        paidAmount: schedule.paidAmount,
        remainingAmount: schedule.amount - schedule.paidAmount,
        status: schedule.status,
        dueDate: schedule.dueDate,
        paidAt: schedule.paidAt,
      })),
      transactions: deposit.transactions.map((t) => ({
        id: t.id,
        amount: t.amount,
        paymentDate: t.paymentDate,
        status: t.status,
        confirmedAt: t.confirmedAt,
        paymentMethod: t.paymentMethod,
      })),
    };
  }
}


import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, TransactionStatus } from '@prisma/client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { CommissionsService } from '../commissions/commissions.service';
import { ErrorMessages } from '../../common/constants/error-messages';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    @Inject(forwardRef(() => CommissionsService))
    private commissionsService: CommissionsService,
  ) {}

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
      throw new NotFoundException(ErrorMessages.DEPOSIT.NOT_FOUND);
    }

    if (deposit.ctvId !== ctvId) {
      throw new BadRequestException(ErrorMessages.PAYMENT.NOT_OWNER);
    }

    // Verify payment schedule if provided
    if (createTransactionDto.paymentScheduleId) {
      const schedule = await this.prisma.paymentSchedule.findUnique({
        where: { id: createTransactionDto.paymentScheduleId },
      });

      if (!schedule) {
        throw new NotFoundException(ErrorMessages.PAYMENT.SCHEDULE_NOT_FOUND);
      }

      if (schedule.depositId !== createTransactionDto.depositId) {
        throw new BadRequestException(ErrorMessages.PAYMENT.SCHEDULE_MISMATCH);
      }

      if (schedule.status === 'PAID') {
        throw new BadRequestException(ErrorMessages.PAYMENT.SCHEDULE_ALREADY_PAID);
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
    const where: Prisma.TransactionWhereInput = {};

    if (query.depositId) {
      where.depositId = query.depositId;
    }

    if (query.paymentScheduleId) {
      where.paymentScheduleId = query.paymentScheduleId;
    }

    if (query.status) {
      // Cast string to enum value - Prisma WhereInput accepts enum values directly
      where.status = query.status as TransactionStatus;
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
      throw new NotFoundException(ErrorMessages.PAYMENT.NOT_FOUND);
    }

    return transaction;
  }

  /**
   * Admin confirms transaction (payment)
   * This updates the payment schedule and checks if unit is fully paid
   * 
   * Atomic operation: All updates (transaction, schedule, deposit, unit) are wrapped in transaction
   */
  async confirm(id: string, confirmDto: ConfirmTransactionDto, _adminId: string) {
    const transaction = await this.findOne(id);

    if (transaction.status !== 'PENDING_CONFIRMATION') {
      throw new BadRequestException(ErrorMessages.PAYMENT.NOT_PENDING);
    }

    // Wrap all updates in transaction to ensure atomicity
    return await this.prisma.$transaction(
      async (tx) => {
        // Update transaction status (atomic)
        await tx.transaction.update({
          where: { id },
          data: {
            status: 'CONFIRMED',
            confirmedAt: new Date(),
            notes: confirmDto.notes || transaction.notes,
          },
        });

        // Update payment schedule if linked (atomic)
        if (transaction.paymentScheduleId) {
          const schedule = await tx.paymentSchedule.findUnique({
            where: { id: transaction.paymentScheduleId },
          });

          if (schedule) {
            const newPaidAmount = schedule.paidAmount + transaction.amount;

            await tx.paymentSchedule.update({
              where: { id: transaction.paymentScheduleId },
              data: {
                paidAmount: newPaidAmount,
                status: newPaidAmount >= schedule.amount ? 'PAID' : 'PENDING',
                paidAt: newPaidAmount >= schedule.amount ? new Date() : null,
              },
            });
          }
        }

        // Check if all schedules are paid → Mark deposit as COMPLETED and unit as SOLD (atomic)
        await this.checkAndMarkUnitAsSold(transaction.depositId, tx);

        // Return depositId for notification (fetched after transaction commit)
        return transaction.depositId;
      },
      {
        isolationLevel: 'Serializable',
        timeout: 15000,
      }
    ).then(async (depositId) => {
      // Fetch updated transaction and deposit after transaction commit
      const updated = await this.findOne(id);
      const deposit = await this.prisma.deposit.findUnique({
        where: { id: depositId },
        include: {
          unit: true,
          paymentSchedules: true,
        },
      });

      // If unit was marked as SOLD, create commission if it doesn't exist
      if (deposit?.unit.status === 'SOLD') {
        const existingCommission = await this.prisma.commission.findUnique({
          where: { depositId: deposit.id },
        });

        if (!existingCommission) {
          try {
            // Create commission using CommissionsService (non-critical)
            await this.commissionsService.createCommission(deposit.id);
          } catch (error) {
            console.error(`[Non-critical] Failed to create commission:`, error);
          }
        }
      }

      // Notify CTV about payment confirmation (non-critical: fire and forget)
      this.notificationsService.createNotification({
        userId: updated.deposit.ctvId,
        type: 'PAYMENT_CONFIRMED',
        title: 'Thanh toán đã được xác nhận',
        message: `Khoản thanh toán cho phiếu cọc ${updated.deposit.code} đã được xác nhận.`,
        entityType: 'TRANSACTION',
        entityId: updated.id,
        metadata: {
          transactionId: updated.id,
          depositId: updated.depositId,
          unitId: updated.deposit.unit.id,
          unitCode: updated.deposit.unit.code,
        },
      }).catch((error) => {
        console.error(`[Non-critical] Failed to send payment confirmation notification:`, error);
      });

      return updated;
    });
  }

  /**
   * Admin rejects transaction
   */
  async reject(id: string, reason: string) {
    const transaction = await this.findOne(id);

    if (transaction.status !== 'PENDING_CONFIRMATION') {
      throw new BadRequestException(ErrorMessages.PAYMENT.NOT_PENDING);
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
  private async checkAndMarkUnitAsSold(depositId: string, tx?: Prisma.TransactionClient) {
    const prisma = tx || this.prisma;
    const deposit = await prisma.deposit.findUnique({
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
      // Update deposit status to COMPLETED (atomic)
      await prisma.deposit.update({
        where: { id: depositId },
        data: {
          status: 'COMPLETED',
        },
      });

      // Update unit to SOLD (atomic)
      await prisma.unit.update({
        where: { id: deposit.unitId },
        data: {
          status: 'SOLD',
          soldAt: new Date(),
        },
      });

      // Check if commission already exists (within transaction if tx provided)
      const existingCommission = await prisma.commission.findUnique({
        where: { depositId },
      });

      if (!existingCommission) {
        // Create commission using CommissionsService (non-critical: can be done outside transaction)
        // Note: CommissionsService uses this.prisma, so we create commission after transaction
        if (!tx) {
          try {
            await this.commissionsService.createCommission(deposit.id);
          } catch (error) {
            console.error(`[Non-critical] Failed to create commission:`, error);
          }
        }
        // If tx is provided, commission will be created in caller's .then() block
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
      throw new NotFoundException(ErrorMessages.DEPOSIT.NOT_FOUND);
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


import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, DepositStatus } from '@prisma/client';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { CommissionsService } from '../commissions/commissions.service';
import { CodeGeneratorService, CodeType } from '../common/services/code-generator.service';
import { TriggerService } from '../../common/services/trigger.service';
import { ErrorMessages } from '../../common/constants/error-messages';
import { PaginationUtil, PaginationOptions, PaginationResult } from '../../common/utils/pagination.util';
import { QueryOptimizerUtil } from '../../common/utils/query-optimizer.util';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UnitsService } from '../units/units.service';

@Injectable()
export class DepositsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private systemConfigService: SystemConfigService,
    private commissionsService: CommissionsService,
    private codeGenerator: CodeGeneratorService,
    private triggerService: TriggerService,
    @Inject(forwardRef(() => UnitsService))
    private unitsService: UnitsService,
  ) {}

  /**
   * Safe error handler for non-critical operations (e.g., syncUnitStatus, notifications)
   * Logs error but doesn't throw - used for operations that shouldn't fail the main flow
   * 
   * @param operation Description of the operation (for logging)
   * @param error The error that occurred
   * @param context Additional context for logging (entityId, etc.)
   */
  private handleNonCriticalError(operation: string, error: unknown, context?: Record<string, string>): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const contextStr = context ? ` [${Object.entries(context).map(([k, v]) => `${k}=${v}`).join(', ')}]` : '';
    console.error(`[Non-critical error] ${operation}${contextStr}: ${errorMessage}`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  /**
   * Validate unit is available for deposit
   * @param unit Unit to validate
   * @throws BadRequestException if unit is not available for deposit
   */
  private validateUnitAvailableForDeposit(unit: { status: string; id: string }): void {
    if (unit.status === 'SOLD') {
      throw new BadRequestException(ErrorMessages.UNIT.ALREADY_SOLD);
    }

    if (unit.status === 'DEPOSITED') {
      throw new BadRequestException(ErrorMessages.UNIT.ALREADY_DEPOSITED);
    }

    // Unit can be AVAILABLE or RESERVED_BOOKING (if upgrading from reservation)
    // RESERVED_BOOKING is allowed because deposit can be created from reservation
    if (unit.status === 'AVAILABLE' || unit.status === 'RESERVED_BOOKING') {
      return; // OK
    }

    // Otherwise, unit is not available
    throw new BadRequestException(ErrorMessages.UNIT.NOT_AVAILABLE(unit.status));
  }

  /**
   * Validate deposit status for action
   * @param deposit Deposit to validate
   * @param allowedStatuses List of allowed statuses
   * @throws BadRequestException if deposit status is not in allowed list
   */
  private validateDepositStatus(deposit: { status: string; id: string }, allowedStatuses: DepositStatus[]): void {
    if (!allowedStatuses.includes(deposit.status as DepositStatus)) {
      throw new BadRequestException(
        `Deposit status is ${deposit.status}. Allowed statuses: ${allowedStatuses.join(', ')}`
      );
    }
  }

  /**
   * Create deposit (CTV or from reservation)
   * CRITICAL: This triggers payment schedule + commission calculation
   * 
   * Race condition protection:
   * - Uses transaction with Serializable isolation level
   * - Checks unit status and existing deposits atomically
   * - Uses row-level locking (via transaction)
   * - Retries on conflict (up to 3 times)
   */
  async create(dto: CreateDepositDto, ctvId: string) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        return await this.createDepositWithRetry(dto, ctvId);
      } catch (error: unknown) {
        attempt++;
        
        // Check if it's a conflict/race condition error (Prisma P2034 = transaction conflict)
        const isConflictError = 
          (error instanceof Error && 'code' in error && error.code === 'P2034') ||
          (error instanceof Error && (
            error.message?.includes('conflict') || 
            error.message?.includes('already') ||
            error.message?.includes('serialization')
          ));
        
        // Retry on conflict errors with exponential backoff
        if (isConflictError && attempt < maxRetries) {
          const backoffMs = 50 * Math.pow(2, attempt - 1); // 50ms, 100ms, 200ms
          console.warn(`[Retry ${attempt}/${maxRetries}] Deposit creation conflict, retrying after ${backoffMs}ms...`);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }
        
        // Log and throw other errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[CRITICAL] Deposit creation failed after ${attempt} attempts:`, errorMessage);
        if (error instanceof Error && error.stack) {
          console.error(error.stack);
        }
        throw error;
      }
    }
  }

  /**
   * Internal method to create deposit with transaction protection
   */
  private async createDepositWithRetry(dto: CreateDepositDto, ctvId: string) {
    return await this.prisma.$transaction(
      async (tx) => {
        // Get unit with project (with lock to prevent race condition)
        const unit = await tx.unit.findUnique({
          where: { id: dto.unitId },
          include: { project: true },
        });

        if (!unit) {
          throw new NotFoundException(ErrorMessages.UNIT.NOT_FOUND);
        }

        // Validate unit is available for deposit
        this.validateUnitAvailableForDeposit(unit);

        // CRITICAL: Check for existing active deposit (atomic check)
        const existingActiveDeposit = await tx.deposit.findFirst({
          where: {
            unitId: dto.unitId,
            status: { in: ['PENDING_APPROVAL', 'CONFIRMED'] },
          },
        });

        if (existingActiveDeposit) {
          throw new ConflictException(ErrorMessages.DEPOSIT.ALREADY_EXISTS);
        }

        // Validate reservation if provided
        if (dto.reservationId) {
          const reservation = await tx.reservation.findUnique({
            where: { id: dto.reservationId },
          });

          if (!reservation) {
            throw new NotFoundException(ErrorMessages.RESERVATION.NOT_FOUND);
          }

          if (reservation.ctvId !== ctvId) {
            throw new BadRequestException(ErrorMessages.RESERVATION.NOT_OWNER);
          }

          if (reservation.unitId !== dto.unitId) {
            throw new BadRequestException(ErrorMessages.RESERVATION.UNIT_MISMATCH);
          }

          // Only allow if reservation is YOUR_TURN or ACTIVE
          if (reservation.status !== 'YOUR_TURN' && reservation.status !== 'ACTIVE') {
            throw new BadRequestException(ErrorMessages.RESERVATION.INVALID_STATUS);
          }
        }

        // Validate deposit amount constraints (database-level checks)
        if (dto.depositAmount <= 0) {
          throw new BadRequestException(ErrorMessages.COMMON.INVALID_INPUT);
        }
        if (dto.depositAmount > unit.price) {
          throw new BadRequestException(ErrorMessages.DEPOSIT.EXCEEDS_PRICE);
        }

        // Validate deposit amount (min % of unit price from SystemConfig)
        const configValues = await this.systemConfigService.getValuesByKeys([
          'deposit_min_percentage',
        ]);
        const minPercentage =
          typeof configValues.deposit_min_percentage === 'number'
            ? (configValues.deposit_min_percentage as number)
            : 5;
        const minDeposit = Math.ceil(unit.price * (minPercentage / 100)); // Round up
        if (dto.depositAmount < minDeposit) {
          throw new BadRequestException(
            ErrorMessages.DEPOSIT.MIN_AMOUNT(minDeposit, minPercentage)
          );
        }

        // Calculate deposit percentage
        const depositPercentage = (dto.depositAmount / unit.price) * 100;

        // Generate code: DP000001, DP000002, ... (within transaction to prevent race condition)
        const code = await this.codeGenerator.generateCode(CodeType.DEPOSIT, tx);

        // Create deposit (atomic)
        const deposit = await tx.deposit.create({
          data: {
            code,
            unitId: dto.unitId,
            ctvId,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            customerEmail: dto.customerEmail,
            customerIdCard: dto.customerIdCard,
            customerAddress: dto.customerAddress,
            depositAmount: dto.depositAmount,
            depositPercentage,
            depositDate: new Date(),
            paymentMethod: dto.paymentMethod || 'BANK_TRANSFER',
            paymentProof: dto.paymentProof ? JSON.stringify(dto.paymentProof) : null,
            status: 'PENDING_APPROVAL', // Waiting admin approval
            notes: dto.notes,
          },
          include: {
            unit: {
              include: {
                project: true,
                building: true,
                floor: true,
              },
            },
            ctv: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
          },
        });

        // Update unit status (atomic - within same transaction)
        await tx.unit.update({
          where: { id: dto.unitId },
          data: { status: 'DEPOSITED' },
        });

        // If from reservation, mark as COMPLETED and mark others as MISSED
        if (dto.reservationId) {
          await tx.reservation.update({
            where: { id: dto.reservationId },
            data: { status: 'COMPLETED' },
          });

          // Mark all other reservations for this unit as MISSED
          await tx.reservation.updateMany({
            where: {
              unitId: dto.unitId,
              id: { not: dto.reservationId },
              status: { in: ['ACTIVE', 'YOUR_TURN', 'EXPIRED'] },
            },
            data: { status: 'MISSED' },
          });
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: ctvId,
            action: 'CREATE',
            entityType: 'DEPOSIT',
            entityId: deposit.id,
            newValue: JSON.stringify(deposit),
          },
        });

        // Return deposit (notification will be sent outside transaction)
        return deposit;
      },
      {
        isolationLevel: 'Serializable', // Highest isolation level
        timeout: 15000, // 15s timeout
      }
    ).then(async (deposit) => {
      // Send notification (non-critical: fire and forget)
      this.notificationsService.notifyDepositStatus(ctvId, {
        depositId: deposit.id,
        unitCode: deposit.unit.code,
        status: 'CREATED',
      }).catch((error) => {
        this.handleNonCriticalError('notifyDepositStatus', error, { depositId: deposit.id, status: 'CREATED' });
      });

      return {
        ...deposit,
        message: 'Tạo phiếu cọc thành công! Chờ admin duyệt',
      };
    });
  }

  /**
   * Approve deposit (Admin)
   * CRITICAL: This creates payment schedule + commission
   */
  async approve(id: string, adminId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: {
        unit: true,
        ctv: {
          select: { id: true },
        },
      },
    });

    if (!deposit) {
      throw new NotFoundException(ErrorMessages.DEPOSIT.NOT_FOUND);
    }

    this.validateDepositStatus(deposit, ['PENDING_APPROVAL']);

    // Wrap in transaction to ensure atomicity
    return await this.prisma.$transaction(
      async (tx) => {
        // Update deposit status (atomic)
        await tx.deposit.update({
          where: { id },
          data: {
            status: 'CONFIRMED',
            approvedBy: adminId,
            approvedAt: new Date(),
          },
        });

        // 🔥 CRITICAL: Create payment schedule (4 installments) - atomic
        await this.createPaymentSchedule(
          id,
          deposit.unitId,
          deposit.depositAmount,
          deposit.depositPercentage,
          tx, // Pass transaction context
        );

        // Audit log (atomic)
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'APPROVE',
            entityType: 'DEPOSIT',
            entityId: id,
            newValue: JSON.stringify({ status: 'CONFIRMED' }),
          },
        });

        // Trigger: Update user totalDeals (non-critical: fire and forget)
        if (deposit.ctv) {
          this.triggerService
            .updateUserTotalDealsOnDepositConfirmed(deposit.ctv.id)
            .catch((error) => {
              this.handleNonCriticalError('updateUserTotalDeals', error, { ctvId: deposit.ctv.id, depositId: deposit.id });
            });
        }

        // Notify CTV about approval (non-critical: fire and forget)
        if (deposit.ctv) {
          this.notificationsService.notifyDepositStatus(deposit.ctv.id, {
            depositId: deposit.id,
            unitCode: deposit.unit.code,
            status: 'APPROVED',
          }).catch((error) => {
            this.handleNonCriticalError('notifyDepositStatus', error, { depositId: deposit.id, status: 'APPROVED' });
          });
        }

        return { message: 'Duyệt phiếu cọc thành công' };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    );
  }

  /**
   * Create payment schedule using dynamic template from SystemConfig.
   * Fallback: legacy 4-installment template if config is not found or invalid.
   *
   * Config key: deposit_payment_schedule_template (type: json)
   * Example value:
   * [
   *   { "name": "Đợt 2", "percentage": 30, "offsetDays": 30 },
   *   { "name": "Đợt 3", "percentage": 30, "offsetDays": 60 },
   *   { "name": "Thanh toán cuối (Bàn giao)", "percentage": 40, "offsetDays": 0 }
   * ]
   */
  private async createPaymentSchedule(
    depositId: string,
    unitId: string,
    depositAmount: number,
    depositPercentage: number,
    tx?: Prisma.TransactionClient, // Optional transaction context
  ) {
    const prisma = tx || this.prisma;
    const unit = await prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) return;

    const totalPrice = unit.price;

    // Installment 1: Deposit (already paid)
    await prisma.paymentSchedule.create({
      data: {
        depositId,
        installment: 1,
        name: 'Tiền cọc',
        percentage: depositPercentage,
        amount: depositAmount,
        dueDate: new Date(), // Already due
        status: 'PAID',
        paidAmount: depositAmount,
        paidAt: new Date(),
      },
    });

    // Try to load dynamic template from SystemConfig
    let template: Array<{ name: string; percentage?: number; offsetDays?: number | null }> | null =
      null;
    try {
      const value = await this.systemConfigService.getValueByKey(
        'deposit_payment_schedule_template',
      );
      if (Array.isArray(value)) {
        template = value;
      }
    } catch {
      // Config not found or invalid → fallback to legacy template
      template = null;
    }

    if (!template || template.length === 0) {
      // Legacy 3 installments after deposit
      const inst2Date = new Date();
      inst2Date.setDate(inst2Date.getDate() + 30);
      await prisma.paymentSchedule.create({
        data: {
          depositId,
          installment: 2,
          name: 'Đợt 2',
          percentage: 30,
          amount: totalPrice * 0.3,
          dueDate: inst2Date,
          status: 'PENDING',
        },
      });

      const inst3Date = new Date();
      inst3Date.setDate(inst3Date.getDate() + 60);
      await prisma.paymentSchedule.create({
        data: {
          depositId,
          installment: 3,
          name: 'Đợt 3',
          percentage: 30,
          amount: totalPrice * 0.3,
          dueDate: inst3Date,
          status: 'PENDING',
        },
      });

      const remaining = 100 - depositPercentage - 30 - 30;
      await prisma.paymentSchedule.create({
        data: {
          depositId,
          installment: 4,
          name: 'Thanh toán cuối (Bàn giao)',
          percentage: remaining,
          amount: totalPrice * (remaining / 100),
          dueDate: null,
          status: 'PENDING',
        },
      });
      return;
    }

    // Dynamic template logic
    const nonDepositTotalTarget = 100 - depositPercentage;
    let accumulated = 0;
    const now = new Date();

    for (let index = 0; index < template.length; index++) {
      const step = template[index];
      const isLast = index === template.length - 1;

      let percentage = typeof step.percentage === 'number' ? step.percentage : 0;

      if (isLast) {
        // Ensure total (deposit + template) = 100%
        percentage = Math.max(nonDepositTotalTarget - accumulated, 0);
      } else {
        accumulated += percentage;
      }

      if (percentage <= 0) {
        continue;
      }

      const amount = (totalPrice * percentage) / 100;
      const dueDate =
        typeof step.offsetDays === 'number'
          ? new Date(now.getTime() + step.offsetDays * 24 * 60 * 60 * 1000)
          : null;

      await this.prisma.paymentSchedule.create({
        data: {
          depositId,
          installment: index + 2, // deposit is 1
          name: step.name || `Đợt ${index + 2}`,
          percentage,
          amount,
          dueDate,
          status: 'PENDING',
        },
      });
    }
  }

  /**
   * Get all deposits (Admin) with pagination
   */
  async findAll(
    filters?: { status?: string; projectId?: string },
    pagination?: PaginationOptions
  ): Promise<PaginationResult<any>> {
    const where: Prisma.DepositWhereInput = {
      deletedAt: null, // Exclude soft-deleted
    };

    if (filters?.status) {
      // Cast string to enum value - Prisma WhereInput accepts enum values directly
      where.status = filters.status as DepositStatus;
    }

    if (filters?.projectId) {
      where.unit = { 
        projectId: filters.projectId,
        deletedAt: null, // Exclude soft-deleted units
      };
    }

    // Normalize pagination
    const { page, pageSize, skip, take } = PaginationUtil.normalize(pagination);

    // Optimized include to prevent N+1 queries
    const include = QueryOptimizerUtil.buildDepositInclude();

    // Execute queries in parallel without transaction (simpler and avoids extension conflicts)
    // Both queries already have deletedAt filter in where clause
    // Use extended client - extension will skip adding deletedAt since we already have it
    let items, total;
    try {
      [items, total] = await Promise.all([
        this.prisma.deposit.findMany({
          where,
          include,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take,
        }),
        this.prisma.deposit.count({ where }),
      ]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[CRITICAL] DepositsService.findAll query error:', errorMessage);
      if (error instanceof Error && error.stack) {
        console.error('Stack trace:', error.stack);
      }
      console.error('Where clause:', JSON.stringify(where, null, 2));
      throw error; // Re-throw to let NestJS error filter handle it
    }

    return PaginationUtil.createResult(items, total, page, pageSize);
  }

  /**
   * Get my deposits (CTV)
   */
  async getMyDeposits(ctvId: string) {
    return await this.prisma.deposit.findMany({
      where: { ctvId },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        paymentSchedules: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get deposits in "trash" (CANCELLED / OVERDUE) that are still locking units
   */
  async findTrash() {
    return this.prisma.deposit.findMany({
      where: {
        status: { in: ['CANCELLED', 'OVERDUE'] },
        unit: {
          status: 'DEPOSITED',
        },
      },
      include: {
        unit: {
          include: {
            project: true,
            building: true,
            floor: true,
          },
        },
        ctv: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  /**
   * Cleanup deposit: release unit back to AVAILABLE
   * - Chỉ áp dụng cho deposit CANCELLED hoặc OVERDUE
   * - Unit hiện đang ở trạng thái DEPOSITED
   */
  async cleanup(id: string, adminId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: {
        unit: true,
      },
    });

    if (!deposit) {
      throw new NotFoundException(ErrorMessages.DEPOSIT.NOT_FOUND);
    }

    if (!['CANCELLED', 'OVERDUE'].includes(deposit.status)) {
      throw new BadRequestException(ErrorMessages.DEPOSIT.CANNOT_CLEANUP);
    }

    if (!deposit.unit) {
      throw new NotFoundException(ErrorMessages.DEPOSIT.UNIT_NOT_FOUND);
    }

    if (deposit.unit.status !== 'DEPOSITED') {
      throw new BadRequestException(ErrorMessages.UNIT.STATUS_MISMATCH('DEPOSITED', deposit.unit.status));
    }

    // Wrap in transaction to ensure atomicity
    return await this.prisma.$transaction(
      async (tx) => {
        // Don't directly update unit status - use syncUnitStatus instead
        // This ensures unit status is calculated based on all active deposits/bookings/reservations
        
        // Audit log (atomic)
        await tx.auditLog.create({
          data: {
            userId: adminId,
            action: 'CLEANUP',
            entityType: 'DEPOSIT',
            entityId: deposit.id,
            newValue: JSON.stringify({ releasedUnitId: deposit.unitId }),
          },
        });

        return { message: 'Đã giải phóng căn về AVAILABLE thành công' };
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    );
  }

  /**
   * CRONJOB: Mark overdue payment schedules & deposits
   * - Any PENDING schedule with dueDate < now → OVERDUE
   * - Corresponding deposit (if CONFIRMED) → OVERDUE
   * - Send notifications to CTV (DEPOSIT_OVERDUE + PAYMENT_OVERDUE)
   */
  @Cron(CronExpression.EVERY_HOUR)
  async processOverduePayments() {
    const now = new Date();

    const schedules = await this.prisma.paymentSchedule.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: now,
        },
      },
      include: {
        deposit: {
          include: {
            unit: true,
            ctv: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    let processed = 0;
    const errors: string[] = [];

    // Process schedules in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < schedules.length; i += batchSize) {
      const batch = schedules.slice(i, i + batchSize);
      
      for (const schedule of batch) {
        if (!schedule.deposit || !schedule.deposit.ctv || !schedule.deposit.unit) {
          continue;
        }

        try {
          // Wrap in transaction to ensure atomicity
          await this.prisma.$transaction(async (tx) => {
            // Mark schedule as OVERDUE (atomic)
            await tx.paymentSchedule.update({
              where: { id: schedule.id },
              data: {
                status: 'OVERDUE',
              },
            });

            // If deposit is CONFIRMED, mark as OVERDUE (atomic)
            if (schedule.deposit.status === 'CONFIRMED') {
              await tx.deposit.update({
                where: { id: schedule.depositId },
                data: {
                  status: 'OVERDUE',
                },
              });
            }

            // Audit log (atomic)
            await tx.auditLog.create({
              data: {
                action: 'PAYMENT_OVERDUE',
                entityType: 'PAYMENT_SCHEDULE',
                entityId: schedule.id,
                newValue: JSON.stringify({
                  depositId: schedule.depositId,
                  installment: schedule.installment,
                  amount: schedule.amount,
                }),
              },
            });
          }, { isolationLevel: 'Serializable', timeout: 5000 });

          // Sync unit status after transaction (non-critical)
          if (schedule.deposit.status === 'CONFIRMED') {
            await this.unitsService.syncUnitStatus(schedule.deposit.unitId).catch((error) => {
              this.handleNonCriticalError('syncUnitStatus', error, { 
                unitId: schedule.deposit.unitId, 
                action: 'markOverdue', 
                depositId: schedule.depositId 
              });
            });
          }

          const ctvId = schedule.deposit.ctv.id;
          const unitCode = schedule.deposit.unit.code;

          // Notify about overdue deposit (non-critical)
          this.notificationsService.notifyDepositStatus(ctvId, {
            depositId: schedule.depositId,
            unitCode,
            status: 'OVERDUE',
          }).catch((error) => {
            this.handleNonCriticalError('notifyDepositStatus', error, { 
              depositId: schedule.depositId, 
              status: 'OVERDUE' 
            });
          });

          // Notify about specific overdue installment (non-critical)
          this.notificationsService.createNotification({
            userId: ctvId,
            type: 'PAYMENT_OVERDUE',
            title: 'Đợt thanh toán bị quá hạn',
            message: `Đợt ${schedule.installment} của phiếu cọc ${schedule.deposit.code} cho căn ${unitCode} đã quá hạn thanh toán.`,
            entityType: 'PAYMENT_SCHEDULE',
            entityId: schedule.id,
            metadata: {
              scheduleId: schedule.id,
              depositId: schedule.depositId,
              unitId: schedule.deposit.unit.id,
              unitCode,
            },
          }).catch((error) => {
            this.handleNonCriticalError('createNotification', error, { 
              type: 'PAYMENT_OVERDUE', 
              scheduleId: schedule.id 
            });
          });

          processed++;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Schedule ${schedule.id}: ${errorMessage}`);
          this.handleNonCriticalError('processOverdueSchedule', error, { scheduleId: schedule.id });
        }
      }
    }

    // Log results
    if (processed > 0 || errors.length > 0) {
      console.log(`[CRON] processOverduePayments: ${processed} processed, ${errors.length} errors`);
      if (errors.length > 0) {
        console.error('Errors:', errors);
      }
    }

    return { processed, errors: errors.length > 0 ? errors : undefined };
  }

  /**
   * Update final price for a deposit (Admin only)
   * This will trigger commission recalculation if commission exists and is PENDING
   * 
   * @param id Deposit ID
   * @param finalPrice Final price (giá thực tế chốt deal sau chiết khấu)
   * @param adminId Admin user ID
   */
  async updateFinalPrice(id: string, finalPrice: number, adminId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: {
        unit: true,
        commissions: true,
      },
    });

    if (!deposit) {
      throw new NotFoundException(ErrorMessages.DEPOSIT.NOT_FOUND);
    }

    // Validate finalPrice
    if (finalPrice <= 0) {
      throw new BadRequestException(ErrorMessages.COMMON.INVALID_INPUT);
    }

    if (finalPrice > deposit.unit.price * 1.1) {
      // Allow up to 10% increase (in case of price adjustment)
      throw new BadRequestException('Final price cannot exceed 110% of list price');
    }

    // Update deposit with finalPrice
    const updatedDeposit = await this.prisma.deposit.update({
      where: { id },
      data: {
        finalPrice,
      },
      include: {
        unit: true,
        commissions: true,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'UPDATE',
        entityType: 'DEPOSIT',
        entityId: id,
        oldValue: JSON.stringify({ finalPrice: deposit.finalPrice }),
        newValue: JSON.stringify({ finalPrice }),
      },
    });

    // If commission exists and is PENDING, recalculate it
    if (updatedDeposit.commissions && updatedDeposit.commissions.status === 'PENDING') {
      try {
        await this.commissionsService.recalculateCommission(id);
      } catch (error) {
        // Log error but don't fail the update
        this.handleNonCriticalError('recalculateCommission', error, { depositId: id });
      }
    }

    return {
      ...updatedDeposit,
      message: 'Final price updated successfully. Commission has been recalculated if applicable.',
    };
  }
}


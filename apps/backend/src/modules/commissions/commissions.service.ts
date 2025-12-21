import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { ErrorMessages } from '../../common/constants/error-messages';
import { Prisma, CommissionStatus } from '@prisma/client';
import { PaginationUtil } from '../../common/utils/pagination.util';
import { QueryOptimizerUtil } from '../../common/utils/query-optimizer.util';

@Injectable()
export class CommissionsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private systemConfigService: SystemConfigService,
  ) {}

  /**
   * Create commission with calculation_base support
   * Supports both final_price and list_price calculation
   */
  async createCommission(depositId: string) {
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
      throw new NotFoundException(ErrorMessages.DEPOSIT.NOT_FOUND);
    }

    // Check if commission already exists
    const existingCommission = await this.prisma.commission.findUnique({
      where: { depositId },
    });

    if (existingCommission) {
      throw new BadRequestException(ErrorMessages.PAYMENT_REQUEST.ALREADY_EXISTS);
    }

    // Get calculation_base from SystemConfig (default: final_price)
    const configValues = await this.systemConfigService.getValuesByKeys([
      'commission_calculation_base',
    ]);
    const calculationBase =
      (configValues.commission_calculation_base as string) || 'final_price';

    // Determine base price based on calculation_base
    let basePrice: number;
    if (calculationBase === 'final_price') {
      // Use finalPrice if available, otherwise fallback to list price
      basePrice = deposit.finalPrice || deposit.unit.price;
    } else {
      // Use list price (unit.price)
      basePrice = deposit.unit.price;
    }

    // Get commission rate (unit rate or project default)
    const commissionRate =
      deposit.unit.commissionRate || deposit.unit.project.commissionRate || 2.0;

    // Calculate commission amount
    const commissionAmount = (basePrice * commissionRate) / 100;

    // Create commission
    const commission = await this.prisma.commission.create({
      data: {
        unitId: deposit.unitId,
        ctvId: deposit.ctvId,
        depositId: deposit.id,
        amount: commissionAmount,
        rate: commissionRate,
        calculationBase,
        basePrice,
        status: 'PENDING',
      },
    });

    // Notify CTV about new commission (non-critical)
    this.notificationsService
      .createNotification({
        userId: commission.ctvId,
        type: 'COMMISSION_CREATED',
        title: 'Ghi nhận hoa hồng mới',
        message: `Bạn vừa được ghi nhận hoa hồng mới cho căn ${deposit.unit.code}.`,
        entityType: 'COMMISSION',
        entityId: commission.id,
        metadata: {
          commissionId: commission.id,
          unitId: deposit.unit.id,
          unitCode: deposit.unit.code,
          depositId: deposit.id,
          amount: commission.amount,
          rate: commission.rate,
          calculationBase: commission.calculationBase,
          basePrice: commission.basePrice,
        },
      })
      .catch((error) => {
        console.error(`[Non-critical] Failed to send commission notification:`, error);
      });

    return commission;
  }

  /**
   * Get all commissions with filters and pagination
   */
  async findAll(
    filters?: {
      ctvId?: string;
      status?: CommissionStatus;
      unitId?: string;
      depositId?: string;
    },
    pagination?: { page?: number; limit?: number },
  ) {
    const where: Prisma.CommissionWhereInput = {
      deletedAt: null,
    };

    if (filters?.ctvId) {
      where.ctvId = filters.ctvId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.unitId) {
      where.unitId = filters.unitId;
    }

    if (filters?.depositId) {
      where.depositId = filters.depositId;
    }

    const include = QueryOptimizerUtil.buildCommissionInclude();

    const { page = 1, limit = 20 } = pagination || {};
    const skip = (page - 1) * limit;

    try {
      const [commissions, total] = await Promise.all([
        this.prisma.commission.findMany({
          where,
          include,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.commission.count({ where }),
      ]);

      return PaginationUtil.createResult(commissions, total, page, limit);
    } catch (error: unknown) {
      console.error('[CommissionsService] findAll error:', error);
      throw error;
    }
  }

  /**
   * Get commissions for a specific CTV
   */
  async findMyCommissions(
    ctvId: string,
    filters?: { status?: CommissionStatus },
    pagination?: { page?: number; limit?: number },
  ) {
    return this.findAll(
      {
        ctvId,
        ...filters,
      },
      pagination,
    );
  }

  /**
   * Get commission summary for a CTV
   */
  async getMySummary(ctvId: string) {
    const commissions = await this.prisma.commission.findMany({
      where: { ctvId, deletedAt: null },
      include: {
        paymentRequests: true,
      },
    });

    const summary = {
      totalEarned: 0,
      pending: 0,
      approved: 0,
      paid: 0,
      count: {
        total: commissions.length,
        pending: 0,
        approved: 0,
        paid: 0,
      },
    };

    commissions.forEach((commission) => {
      summary.totalEarned += commission.amount;

      if (commission.status === 'PENDING') {
        summary.pending += commission.amount;
        summary.count.pending++;
      } else if (commission.status === 'APPROVED') {
        summary.approved += commission.amount;
        summary.count.approved++;
      } else if (commission.status === 'PAID') {
        summary.paid += commission.amount;
        summary.count.paid++;
      }
    });

    return summary;
  }

  /**
   * Get commission by ID
   */
  async findOne(id: string) {
    const commission = await this.prisma.commission.findUnique({
      where: { id, deletedAt: null },
      include: QueryOptimizerUtil.buildCommissionInclude(),
    });

    if (!commission) {
      throw new NotFoundException(ErrorMessages.COMMISSION.NOT_FOUND);
    }

    return commission;
  }

  /**
   * Recalculate commission when finalPrice changes
   * Only recalculates if commission status is PENDING
   */
  async recalculateCommission(depositId: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        unit: {
          include: {
            project: true,
          },
        },
        commissions: true,
      },
    });

    if (!deposit) {
      throw new NotFoundException(ErrorMessages.DEPOSIT.NOT_FOUND);
    }

    const commission = deposit.commissions;

    if (!commission) {
      throw new NotFoundException(ErrorMessages.COMMISSION.NOT_FOUND);
    }

    // Only recalculate if commission is PENDING (not yet paid)
    if (commission.status !== 'PENDING') {
      throw new BadRequestException(ErrorMessages.COMMISSION.CANNOT_RECALCULATE);
    }

    // Get calculation_base from SystemConfig
    const configValues = await this.systemConfigService.getValuesByKeys([
      'commission_calculation_base',
    ]);
    const calculationBase =
      (configValues.commission_calculation_base as string) || 'final_price';

    // Determine base price
    let basePrice: number;
    if (calculationBase === 'final_price') {
      basePrice = deposit.finalPrice || deposit.unit.price;
    } else {
      basePrice = deposit.unit.price;
    }

    // Get commission rate
    const commissionRate =
      deposit.unit.commissionRate || deposit.unit.project.commissionRate || 2.0;

    // Calculate new commission amount
    const newCommissionAmount = (basePrice * commissionRate) / 100;

    // Update commission
    const updatedCommission = await this.prisma.commission.update({
      where: { id: commission.id },
      data: {
        amount: newCommissionAmount,
        rate: commissionRate,
        calculationBase,
        basePrice,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: null, // System action
        action: 'UPDATE',
        entityType: 'COMMISSION',
        entityId: commission.id,
        oldValue: JSON.stringify({
          amount: commission.amount,
          basePrice: commission.basePrice,
        }),
        newValue: JSON.stringify({
          amount: updatedCommission.amount,
          basePrice: updatedCommission.basePrice,
        }),
      },
    });

    // Notify CTV about commission update (non-critical)
    this.notificationsService
      .createNotification({
        userId: commission.ctvId,
        type: 'COMMISSION_CREATED', // Reuse type
        title: 'Hoa hồng đã được tính lại',
        message: `Hoa hồng cho căn ${deposit.unit.code} đã được tính lại dựa trên giá mới.`,
        entityType: 'COMMISSION',
        entityId: commission.id,
        metadata: {
          commissionId: commission.id,
          oldAmount: commission.amount,
          newAmount: updatedCommission.amount,
          basePrice: updatedCommission.basePrice,
        },
      })
      .catch((error) => {
        console.error(`[Non-critical] Failed to send commission recalculation notification:`, error);
      });

    return updatedCommission;
  }
}

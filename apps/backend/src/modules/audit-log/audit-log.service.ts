import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Query audit logs with filters and pagination
   */
  async findAll(query: QueryAuditLogDto) {
    const {
      userId,
      action,
      entityType,
      entityId,
      fromDate,
      toDate,
      page = 1,
      pageSize = 20,
      search,
      sortDirection = 'desc',
    } = query;

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = fromDate;
      }
      if (toDate) {
        where.createdAt.lte = toDate;
      }
    }

    if (search) {
      where.OR = [
        { oldValue: { contains: search, mode: 'insensitive' } },
        { newValue: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Use callback transaction with base client to avoid extension conflicts
    const [items, total] = await this.prisma.$transaction(async (tx: any) => {
      return Promise.all([
        tx.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
          },
          orderBy: {
            createdAt: sortDirection,
          },
          skip,
          take,
        }),
        tx.auditLog.count({ where }),
      ]);
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get distinct actions
   */
  async getActions() {
    const logs = await this.prisma.auditLog.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' },
    });

    return logs.map((l) => l.action);
  }

  /**
   * Get distinct entity types
   */
  async getEntityTypes() {
    const logs = await this.prisma.auditLog.findMany({
      select: { entityType: true },
      distinct: ['entityType'],
      orderBy: { entityType: 'asc' },
    });

    return logs.map((l) => l.entityType);
  }
}



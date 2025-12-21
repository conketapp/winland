import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, UserRole } from '@prisma/client';
import { ErrorMessages } from '../../common/constants/error-messages';
import { PaginationUtil } from '../../common/utils/pagination.util';
import { QueryOptimizerUtil } from '../../common/utils/query-optimizer.util';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all users with filters and pagination
   */
  async findAll(
    filters?: {
      role?: UserRole;
      isActive?: boolean;
    },
    pagination?: { page?: number; limit?: number },
  ) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const select = QueryOptimizerUtil.buildUserSelect();

    const { page, limit } = pagination || {};
    
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          select,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.user.count({ where }),
      ]);

      return PaginationUtil.createResult(users, total, page, limit);
    }

    // No pagination
    const users = await this.prisma.user.findMany({
      where,
      select,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  /**
   * Get user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: QueryOptimizerUtil.buildUserSelect(),
    });

    if (!user) {
      throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    }

    return user;
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: QueryOptimizerUtil.buildUserSelect(),
    });
  }

  /**
   * Sync totalDeals from actual deposits count
   * Useful for ensuring data consistency
   */
  async syncUserTotalDeals(ctvId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: ctvId } });

    if (!user) {
      throw new NotFoundException(ErrorMessages.USER.NOT_FOUND);
    }

    // Count actual confirmed/completed deposits
    const actualCount = await this.prisma.deposit.count({
      where: {
        ctvId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        deletedAt: null,
      },
    });

    // Update totalDeals to match actual count
    return this.prisma.user.update({
      where: { id: ctvId },
      data: { totalDeals: actualCount },
      select: QueryOptimizerUtil.buildUserSelect(),
    });
  }

  /**
   * Search users by name, email, or phone
   */
  async search(
    query: string,
    filters?: {
      role?: UserRole;
      isActive?: boolean;
    },
  ) {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      OR: [
        { fullName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const select = QueryOptimizerUtil.buildUserSelect();

    return this.prisma.user.findMany({
      where,
      select,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit search results
    });
  }
}


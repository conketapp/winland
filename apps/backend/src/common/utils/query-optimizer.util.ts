/**
 * Query Optimizer Utilities
 * Helpers to prevent N+1 queries and optimize database queries
 */

import { Prisma } from '@prisma/client';

export class QueryOptimizerUtil {
  /**
   * Build optimized include for common patterns
   */
  static buildUnitInclude() {
    return {
      project: true,
      building: true,
      floor: true,
    };
  }

  /**
   * Build optimized include for bookings with unit
   */
  static buildBookingInclude() {
    return {
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
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          fullName: true,
        },
      },
    };
  }

  /**
   * Build optimized include for deposits with unit
   */
  static buildDepositInclude() {
    return {
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
          email: true,
        },
      },
      approver: {
        select: {
          id: true,
          fullName: true,
        },
      },
      canceller: {
        select: {
          id: true,
          fullName: true,
        },
      },
      paymentSchedules: {
        select: {
          id: true,
          installment: true,
          name: true,
          amount: true,
          status: true,
          dueDate: true,
        },
        orderBy: {
          installment: 'asc',
        },
      },
    };
  }

  /**
   * Build optimized include for reservations with unit
   */
  static buildReservationInclude() {
    return {
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
    };
  }

  /**
   * Build optimized include for commissions
   */
  static buildCommissionInclude() {
    return {
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
          email: true,
        },
      },
      deposit: {
        select: {
          id: true,
          code: true,
          customerName: true,
          depositAmount: true,
          finalPrice: true,
          status: true,
        },
      },
      paymentRequests: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    };
  }

  /**
   * Use select instead of include when possible (more efficient)
   */
  static buildUserSelect() {
    return {
      id: true,
      fullName: true,
      phone: true,
      email: true,
      avatar: true,
      role: true,
      isActive: true,
      totalDeals: true,
    };
  }

  /**
   * Optimize query by using select for specific fields
   * Prevents fetching unnecessary data
   */
  static optimizeSelect<T extends Record<string, any>>(
    select: T
  ): Prisma.Enumerable<T> {
    return select as Prisma.Enumerable<T>;
  }
}


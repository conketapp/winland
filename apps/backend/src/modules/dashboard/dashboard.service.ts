/**
 * Dashboard Service
 * Aggregated stats for Admin and CTV dashboards
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsQueryDto, AnalyticsPeriod, AnalyticsTimeRange } from './dto/analytics-query.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get Admin dashboard stats
   */
  async getAdminStats() {
    const [
      totalProjects,
      upcomingProjects,
      openProjects,
      closedProjects,
      totalUnits,
      availableUnits,
      reservedUnits,
      depositedUnits,
      soldUnits,
      pendingBookings,
      pendingDeposits,
      pendingTransactions,
      pendingPaymentRequests,
      totalReservations,
      activeReservations,
      yourTurnReservations,
      expiredReservations,
      totalBookings,
      confirmedBookings,
      totalDeposits,
      confirmedDeposits,
      cancelledDeposits,
      overdueDeposits,
      overdueSchedules,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'UPCOMING' } }),
      this.prisma.project.count({ where: { status: 'OPEN' } }),
      this.prisma.project.count({ where: { status: 'CLOSED' } }),
      this.prisma.unit.count(),
      this.prisma.unit.count({ where: { status: 'AVAILABLE' } }),
      this.prisma.unit.count({ where: { status: 'RESERVED_BOOKING' } }),
      this.prisma.unit.count({ where: { status: 'DEPOSITED' } }),
      this.prisma.unit.count({ where: { status: 'SOLD' } }),
      this.prisma.booking.count({ where: { status: 'PENDING_APPROVAL' } }),
      this.prisma.deposit.count({ where: { status: 'PENDING_APPROVAL' } }),
      this.prisma.transaction.count({ where: { status: 'PENDING_CONFIRMATION' } }),
      this.prisma.paymentRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.reservation.count(),
      this.prisma.reservation.count({
        where: { status: { in: ['ACTIVE', 'YOUR_TURN'] } as any },
      }),
      this.prisma.reservation.count({
        where: { status: 'YOUR_TURN' as any },
      }),
      this.prisma.reservation.count({
        where: { status: { in: ['EXPIRED', 'MISSED'] } as any },
      }),
      this.prisma.booking.count(),
      this.prisma.booking.count({
        where: { status: 'CONFIRMED' as any },
      }),
      this.prisma.deposit.count(),
      this.prisma.deposit.count({
        where: { status: 'CONFIRMED' as any },
      }),
      this.prisma.deposit.count({
        where: { status: 'CANCELLED' as any },
      }),
      this.prisma.deposit.count({
        where: { status: 'OVERDUE' as any },
      }),
      this.prisma.paymentSchedule.count({
        where: { status: 'OVERDUE' as any },
      }),
    ]);

    const revenue = await this.prisma.transaction.aggregate({
      where: { status: 'CONFIRMED' as any },
      _sum: { amount: true },
      _count: true,
    });

    return {
      projects: {
        total: totalProjects,
        upcoming: upcomingProjects,
        open: openProjects,
        closed: closedProjects,
      },
      units: {
        total: totalUnits,
        available: availableUnits,
        reserved: reservedUnits,
        deposited: depositedUnits,
        sold: soldUnits,
      },
      pending: {
        bookings: pendingBookings,
        deposits: pendingDeposits,
        transactions: pendingTransactions,
        paymentRequests: pendingPaymentRequests,
      },
      revenue: {
        totalRevenue: revenue._sum.amount || 0,
        totalTransactions: revenue._count,
      },
      funnel: {
        reservations: {
          total: totalReservations,
          active: activeReservations,
          yourTurn: yourTurnReservations,
          expiredOrMissed: expiredReservations,
        },
        bookings: {
          total: totalBookings,
          confirmed: confirmedBookings,
        },
        deposits: {
          total: totalDeposits,
          confirmed: confirmedDeposits,
          cancelled: cancelledDeposits,
          overdue: overdueDeposits,
        },
        conversionRates: {
          reservationToBooking:
            totalReservations > 0 ? Number(((confirmedBookings / totalReservations) * 100).toFixed(1)) : 0,
          reservationToDeposit:
            totalReservations > 0 ? Number(((confirmedDeposits / totalReservations) * 100).toFixed(1)) : 0,
        },
      },
      risks: {
        overdueSchedules,
        overdueDeposits,
        reservations: {
          yourTurn: yourTurnReservations,
          expiredOrMissed: expiredReservations,
        },
      },
    };
  }

  /**
   * Get CTV dashboard stats
   */
  async getCtvStats(ctvId: string) {
    const [
      activeReservations,
      expiringReservations,
      pendingBookings,
      approvedBookings,
      pendingDeposits,
      approvedDeposits,
      totalCommission,
      pendingCommission,
      paidCommission,
    ] = await Promise.all([
      this.prisma.reservation.count({
        where: { ctvId, status: 'ACTIVE' },
      }),
      this.prisma.reservation.count({
        where: {
          ctvId,
          status: 'ACTIVE',
          reservedUntil: {
            lte: new Date(Date.now() + 6 * 60 * 60 * 1000), // Next 6 hours
          },
        },
      }),
      this.prisma.booking.count({
        where: { ctvId, status: 'PENDING_APPROVAL' },
      }),
      this.prisma.booking.count({
        where: { ctvId, status: 'CONFIRMED' },
      }),
      this.prisma.deposit.count({
        where: { ctvId, status: 'PENDING_APPROVAL' },
      }),
      this.prisma.deposit.count({
        where: { ctvId, status: 'CONFIRMED' },
      }),
      this.prisma.commission.aggregate({
        where: { ctvId },
        _sum: { amount: true },
      }),
      this.prisma.commission.aggregate({
        where: { ctvId, status: 'PENDING' },
        _sum: { amount: true },
      }),
      this.prisma.commission.aggregate({
        where: { ctvId, status: 'PAID' },
        _sum: { amount: true },
      }),
    ]);

    return {
      reservations: {
        active: activeReservations,
        expiring: expiringReservations,
      },
      bookings: {
        pending: pendingBookings,
        approved: approvedBookings,
      },
      deposits: {
        pending: pendingDeposits,
        approved: approvedDeposits,
      },
      commissions: {
        total: totalCommission._sum.amount || 0,
        pending: pendingCommission._sum.amount || 0,
        paid: paidCommission._sum.amount || 0,
      },
    };
  }

  /**
   * Calculate date range from query parameters
   */
  private getDateRange(query: AnalyticsQueryDto): { start: Date; end: Date } {
    let start: Date;
    let end: Date = new Date();

    if (query.startDate && query.endDate) {
      start = new Date(query.startDate);
      end = new Date(query.endDate);
    } else {
      // Calculate from timeRange
      const now = new Date();
      end = now;

      switch (query.timeRange || AnalyticsTimeRange.LAST_30_DAYS) {
        case AnalyticsTimeRange.LAST_7_DAYS:
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case AnalyticsTimeRange.LAST_30_DAYS:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case AnalyticsTimeRange.LAST_90_DAYS:
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case AnalyticsTimeRange.LAST_6_MONTHS:
          start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case AnalyticsTimeRange.LAST_YEAR:
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    return { start, end };
  }

  /**
   * Group transactions by period for revenue chart
   */
  private groupByPeriod(
    period: AnalyticsPeriod,
    date: Date,
  ): string {
    switch (period) {
      case AnalyticsPeriod.DAY:
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case AnalyticsPeriod.WEEK:
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return `${weekStart.getFullYear()}-W${this.getWeekNumber(weekStart)}`;
      case AnalyticsPeriod.MONTH:
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case AnalyticsPeriod.QUARTER:
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
      case AnalyticsPeriod.YEAR:
        return String(date.getFullYear());
      default:
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Get Revenue Dashboard Analytics
   */
  async getRevenueAnalytics(query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query);

    // Get all confirmed transactions in date range
    const transactions = await this.prisma.transaction.findMany({
      where: {
        status: 'CONFIRMED',
        paymentDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        amount: true,
        paymentDate: true,
        deposit: {
          include: {
            unit: {
              include: {
                project: true,
              },
            },
          },
        },
      },
    });

    // Group by period
    const periodGroups: Record<string, { revenue: number; count: number; projects: Set<string> }> = {};
    
    transactions.forEach((tx) => {
      const periodKey = this.groupByPeriod(query.period || AnalyticsPeriod.MONTH, tx.paymentDate);
      if (!periodGroups[periodKey]) {
        periodGroups[periodKey] = { revenue: 0, count: 0, projects: new Set() };
      }
      periodGroups[periodKey].revenue += tx.amount;
      periodGroups[periodKey].count += 1;
      if (tx.deposit?.unit?.project?.id) {
        periodGroups[periodKey].projects.add(tx.deposit.unit.project.id);
      }
    });

    // Convert to array and sort
    const revenueTrend = Object.entries(periodGroups)
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        transactions: data.count,
        projects: data.projects.size,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Calculate totals
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTransactions = transactions.length;
    
    // Revenue by project
    const revenueByProject: Record<string, { projectName: string; revenue: number; transactions: number }> = {};
    transactions.forEach((tx) => {
      const projectId = tx.deposit?.unit?.project?.id;
      const projectName = tx.deposit?.unit?.project?.name || 'Unknown';
      if (projectId) {
        if (!revenueByProject[projectId]) {
          revenueByProject[projectId] = { projectName, revenue: 0, transactions: 0 };
        }
        revenueByProject[projectId].revenue += tx.amount;
        revenueByProject[projectId].transactions += 1;
      }
    });

    const projectComparison = Object.entries(revenueByProject)
      .map(([projectId, data]) => ({
        projectId,
        projectName: data.projectName,
        revenue: data.revenue,
        transactions: data.transactions,
        percentage: totalRevenue > 0 ? Number(((data.revenue / totalRevenue) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Simple forecast (linear regression based on recent trend)
    let forecast: { period: string; predicted: number }[] = [];
    if (revenueTrend.length >= 2) {
      const recent = revenueTrend.slice(-3); // Last 3 periods
      const avgGrowth = recent.length > 1
        ? (recent[recent.length - 1].revenue - recent[0].revenue) / (recent.length - 1)
        : 0;
      
      const lastPeriod = revenueTrend[revenueTrend.length - 1];
      forecast = Array.from({ length: 3 }, (_, i) => ({
        period: `Forecast ${i + 1}`,
        predicted: lastPeriod.revenue + avgGrowth * (i + 1),
      }));
    }

    return {
      summary: {
        totalRevenue,
        totalTransactions,
        averageTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        period: query.period || AnalyticsPeriod.MONTH,
        dateRange: { start, end },
      },
      trend: revenueTrend,
      projectComparison,
      forecast,
    };
  }

  /**
   * Get CTV Performance Analytics
   */
  async getCtvPerformanceAnalytics(query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query);

    // Get all CTVs with their activities in date range
    const ctvs = await this.prisma.user.findMany({
      where: {
        role: 'CTV',
        isActive: true,
      },
      include: {
        reservations: {
          where: {
            createdAt: { gte: start, lte: end },
          },
        },
        bookings: {
          where: {
            createdAt: { gte: start, lte: end },
          },
          include: {
            unit: true,
          },
        },
        deposits: {
          where: {
            createdAt: { gte: start, lte: end },
          },
          include: {
            unit: true,
          },
        },
        commissions: {
          where: {
            createdAt: { gte: start, lte: end },
          },
        },
      },
    });

    // Calculate metrics for each CTV
    const ctvPerformance = ctvs.map((ctv) => {
      const reservations = ctv.reservations.length;
      const bookings = ctv.bookings.filter((b) => b.status === 'CONFIRMED').length;
      const deposits = ctv.deposits.filter((d) => d.status === 'CONFIRMED').length;
      const sold = ctv.deposits.filter((d) => d.status === 'CONFIRMED').length; // Deposits confirmed = sold
      const totalCommission = ctv.commissions.reduce((sum, c) => sum + c.amount, 0);
      const totalRevenue = ctv.deposits
        .filter((d) => d.status === 'CONFIRMED')
        .reduce((sum, d) => {
          const depositPrice = d.finalPrice || (d.unit?.price || 0);
          return sum + depositPrice;
        }, 0);

      // Calculate conversion rates
      const reservationToBooking = reservations > 0 ? (bookings / reservations) * 100 : 0;
      const bookingToDeposit = bookings > 0 ? (deposits / bookings) * 100 : 0;
      const reservationToSold = reservations > 0 ? (sold / reservations) * 100 : 0;

      // Calculate average deal time (days from reservation to deposit confirmed)
      let avgDealTime = 0;
      const dealTimes: number[] = [];
      ctv.deposits
        .filter((d) => d.status === 'CONFIRMED' && d.approvedAt)
        .forEach((deposit) => {
          // Find earliest reservation for this unit
          const earliestReservation = ctv.reservations
            .filter((r) => r.unitId === deposit.unitId)
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
          
          if (earliestReservation && deposit.approvedAt) {
            const days = Math.floor(
              (deposit.approvedAt.getTime() - earliestReservation.createdAt.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            dealTimes.push(days);
          }
        });
      
      if (dealTimes.length > 0) {
        avgDealTime = dealTimes.reduce((sum, d) => sum + d, 0) / dealTimes.length;
      }

      return {
        ctvId: ctv.id,
        ctvName: ctv.fullName,
        phone: ctv.phone,
        metrics: {
          reservations,
          bookings,
          deposits,
          sold,
          totalRevenue,
          totalCommission,
          conversionRates: {
            reservationToBooking: Number(reservationToBooking.toFixed(1)),
            bookingToDeposit: Number(bookingToDeposit.toFixed(1)),
            reservationToSold: Number(reservationToSold.toFixed(1)),
          },
          averageDealTime: Number(avgDealTime.toFixed(1)),
        },
      };
    });

    // Sort by various criteria
    const rankingByDeals = [...ctvPerformance].sort((a, b) => b.metrics.sold - a.metrics.sold);
    const rankingByRevenue = [...ctvPerformance].sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue);
    const rankingByCommission = [...ctvPerformance].sort((a, b) => b.metrics.totalCommission - a.metrics.totalCommission);
    const rankingByConversion = [...ctvPerformance].sort(
      (a, b) => b.metrics.conversionRates.reservationToSold - a.metrics.conversionRates.reservationToSold
    );

    // Activity heatmap (activity by day of week)
    const activityByDay: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    ctvs.forEach((ctv) => {
      [...ctv.reservations, ...ctv.bookings, ...ctv.deposits].forEach((activity) => {
        const dayOfWeek = activity.createdAt.getDay();
        activityByDay[dayOfWeek] = (activityByDay[dayOfWeek] || 0) + 1;
      });
    });

    const activityHeatmap = Object.entries(activityByDay).map(([day, count]) => ({
      day: Number(day),
      dayName: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][Number(day)],
      count,
    }));

    return {
      summary: {
        totalCtv: ctvs.length,
        dateRange: { start, end },
      },
      performance: ctvPerformance,
      rankings: {
        byDeals: rankingByDeals.map((ctv, index) => ({ ...ctv, rank: index + 1 })),
        byRevenue: rankingByRevenue.map((ctv, index) => ({ ...ctv, rank: index + 1 })),
        byCommission: rankingByCommission.map((ctv, index) => ({ ...ctv, rank: index + 1 })),
        byConversion: rankingByConversion.map((ctv, index) => ({ ...ctv, rank: index + 1 })),
      },
      activityHeatmap,
    };
  }

  /**
   * Get Project Performance Analytics
   */
  async getProjectPerformanceAnalytics(query: AnalyticsQueryDto) {
    const { start, end } = this.getDateRange(query);

    // Get all projects with units and sales data
    const projects = await this.prisma.project.findMany({
      include: {
        units: {
          include: {
            deposits: {
              where: {
                createdAt: { gte: start, lte: end },
                status: 'CONFIRMED',
              },
              include: {
                transactions: {
                  where: {
                    status: 'CONFIRMED',
                    paymentDate: { gte: start, lte: end },
                  },
                },
              },
            },
          },
        },
      },
    });

    const projectPerformance = projects.map((project) => {
      const totalUnits = project.units.length;
      const availableUnits = project.units.filter((u) => u.status === 'AVAILABLE').length;
      const soldUnits = project.units.filter((u) => u.status === 'SOLD').length;
      const depositedUnits = project.units.filter((u) => u.status === 'DEPOSITED').length;
      const reservedUnits = project.units.filter((u) => u.status === 'RESERVED_BOOKING').length;

      // Calculate sales metrics
      const allDeposits = project.units.flatMap((u) => {
        const deposits = u.deposits || [];
        return deposits.map((d) => ({
          ...d,
          unitPrice: u.price,
        }));
      });
      const totalRevenue = allDeposits.reduce((sum, d) => sum + (d.finalPrice || d.unitPrice || 0), 0);
      const totalTransactions = allDeposits.reduce(
        (sum, d) => sum + ((d.transactions as { status: string }[] | undefined)?.length || 0),
        0,
      );

      // Calculate average selling time (days from deposit created to unit SOLD)
      const sellingTimes: number[] = [];
      project.units
        .filter((u) => u.status === 'SOLD')
        .forEach((unit) => {
          const deposits = unit.deposits || [];
          const confirmedDeposit = deposits
            .filter((d) => d.status === 'CONFIRMED')
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
          
          if (confirmedDeposit && unit.updatedAt) {
            const days = Math.floor(
              (unit.updatedAt.getTime() - confirmedDeposit.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            sellingTimes.push(days);
          }
        });

      const avgSellingTime = sellingTimes.length > 0
        ? sellingTimes.reduce((sum, d) => sum + d, 0) / sellingTimes.length
        : 0;

      // Price analysis
      const prices = project.units.map((u) => u.price).filter((p) => p > 0);
      const highestPrice = prices.length > 0 ? Math.max(...prices) : 0;
      const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const averagePrice = prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : 0;

      // Sales rate
      const salesRate = totalUnits > 0 ? (soldUnits / totalUnits) * 100 : 0;

      return {
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        metrics: {
          totalUnits,
          availableUnits,
          reservedUnits,
          depositedUnits,
          soldUnits,
          salesRate: Number(salesRate.toFixed(1)),
          totalRevenue,
          totalTransactions,
          averageSellingTime: Number(avgSellingTime.toFixed(1)),
          priceAnalysis: {
            highest: highestPrice,
            lowest: lowestPrice,
            average: Number(averagePrice.toFixed(0)),
          },
        },
      };
    });

    // Sort by sales rate
    const sortedBySalesRate = [...projectPerformance].sort(
      (a, b) => b.metrics.salesRate - a.metrics.salesRate
    );

    return {
      summary: {
        totalProjects: projects.length,
        dateRange: { start, end },
      },
      performance: projectPerformance,
      sortedBySalesRate: sortedBySalesRate.map((proj, index) => ({ ...proj, rank: index + 1 })),
    };
  }
}






/**
 * Dashboard Service
 * Aggregated stats for Admin and CTV dashboards
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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
}






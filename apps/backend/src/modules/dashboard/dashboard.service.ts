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
    ]);

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






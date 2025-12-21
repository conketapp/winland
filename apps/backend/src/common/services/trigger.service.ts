/**
 * Trigger Service
 * 
 * Manages database triggers for auto-update operations.
 * Since SQLite triggers are limited, some operations are handled here.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TriggerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Update user totalDeals when deposit is confirmed
   * This replaces the database trigger for better control
   */
  async updateUserTotalDealsOnDepositConfirmed(ctvId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: ctvId },
      data: {
        totalDeals: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Decrement user totalDeals when deposit is cancelled
   */
  async updateUserTotalDealsOnDepositCancelled(ctvId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: ctvId },
      data: {
        totalDeals: {
          decrement: 1,
        },
      },
      // Ensure totalDeals doesn't go below 0
      // Note: Prisma doesn't support max(0, totalDeals - 1) directly
      // We handle this in the service layer
    });

    // Ensure totalDeals >= 0
    const user = await this.prisma.user.findUnique({
      where: { id: ctvId },
      select: { totalDeals: true },
    });

    if (user && user.totalDeals < 0) {
      await this.prisma.user.update({
        where: { id: ctvId },
        data: { totalDeals: 0 },
      });
    }
  }

  /**
   * Update payment schedule paid amount when transaction is confirmed
   */
  async updatePaymentSchedulePaidAmount(
    paymentScheduleId: string,
    amount: number,
  ): Promise<void> {
    await this.prisma.paymentSchedule.update({
      where: { id: paymentScheduleId },
      data: {
        paidAmount: {
          increment: amount,
        },
      },
    });

    // Check if schedule should be marked as PAID
    const schedule = await this.prisma.paymentSchedule.findUnique({
      where: { id: paymentScheduleId },
      select: {
        amount: true,
        paidAmount: true,
        status: true,
      },
    });

    if (
      schedule &&
      schedule.paidAmount >= schedule.amount &&
      schedule.status !== 'PAID' &&
      schedule.status !== 'CANCELLED'
    ) {
      await this.prisma.paymentSchedule.update({
        where: { id: paymentScheduleId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }
  }

  /**
   * Mark payment schedules as OVERDUE when dueDate passes
   * This should be called by a cron job
   */
  async markOverduePaymentSchedules(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.paymentSchedule.updateMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    return result.count;
  }
}


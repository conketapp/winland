import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { SystemConfigService } from '../system-config/system-config.service';
import { NotificationChannel, NotificationStatus, NotificationType, Prisma } from '@prisma/client';
import { CreateNotificationParams } from './types/notification.types';

@Injectable()
export class NotificationsService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

  constructor(
    private prisma: PrismaService,
    // Reserved for future use (retry config from SystemConfig)
    // @ts-expect-error - Reserved for future use
    private readonly _systemConfigService: SystemConfigService,
  ) {}

  /**
   * Generic helper to create a notification record
   * With retry mechanism and queue support
   */
  async createNotification(params: CreateNotificationParams) {
    const { metadata, channel = NotificationChannel.IN_APP, ...rest } = params;

    try {
      // Try to create notification immediately
      const notification = await this.prisma.notification.create({
        data: {
          userId: rest.userId,
          type: rest.type as NotificationType,
          title: rest.title,
          message: rest.message,
          entityType: rest.entityType || null,
          entityId: rest.entityId || null,
          channel: (channel as NotificationChannel) || NotificationChannel.IN_APP,
          metadata: metadata ? JSON.stringify(metadata) : null,
          status: NotificationStatus.PENDING,
        },
      });

      // Try to send immediately (for IN_APP, this is just marking as SENT)
      try {
        await this.sendNotification(notification.id);
        return notification;
      } catch (sendError) {
        // If send fails, queue for retry
        console.warn(`[Notifications] Failed to send notification ${notification.id}, queuing for retry:`, sendError);
        await this.queueNotificationForRetry(notification.id, sendError);
        return notification;
      }
    } catch (error) {
      console.error(`[Notifications] Failed to create notification:`, error);
      throw error;
    }
  }

  /**
   * Send notification (mark as SENT for IN_APP, actual send for SMS/EMAIL)
   */
  private async sendNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // For IN_APP notifications, just mark as SENT
    // For SMS/EMAIL, implement actual sending logic here
    if (notification.channel === NotificationChannel.IN_APP) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
      return;
    }

    // TODO: Implement SMS/EMAIL sending
    // For now, mark as SENT
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  /**
   * Queue notification for retry
   */
  private async queueNotificationForRetry(notificationId: string, error: unknown) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return;
    }

    const retryCount = notification.retryCount || 0;

    if (retryCount >= this.MAX_RETRIES) {
      // Max retries reached, mark as FAILED
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.FAILED,
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : String(error),
        },
      });
      console.error(`[Notifications] Notification ${notificationId} failed after ${retryCount} retries`);
      return;
    }

    // Calculate next retry time (exponential backoff)
    const delay = this.RETRY_DELAYS[retryCount] || this.RETRY_DELAYS[this.RETRY_DELAYS.length - 1];
    const nextRetryAt = new Date(Date.now() + delay);

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.QUEUED,
        retryCount: retryCount + 1,
        nextRetryAt,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });

    console.log(`[Notifications] Queued notification ${notificationId} for retry #${retryCount + 1} at ${nextRetryAt.toISOString()}`);
  }

  /**
   * CRONJOB: Process queued notifications
   * Runs every minute
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processQueuedNotifications() {
    const now = new Date();

    // Find notifications that are ready to retry
    const queuedNotifications = await this.prisma.notification.findMany({
      where: {
        status: NotificationStatus.QUEUED,
        nextRetryAt: {
          lte: now,
        },
        deletedAt: null,
      },
      take: 50, // Process 50 at a time
    });

    if (queuedNotifications.length === 0) {
      return;
    }

    console.log(`[Notifications] Processing ${queuedNotifications.length} queued notifications`);

    const results = {
      sent: 0,
      requeued: 0,
      failed: 0,
    };

    for (const notification of queuedNotifications) {
      try {
        await this.sendNotification(notification.id);
        results.sent++;
      } catch (error) {
        // Queue for retry again
        await this.queueNotificationForRetry(notification.id, error);
        
        if (notification.retryCount >= this.MAX_RETRIES) {
          results.failed++;
        } else {
          results.requeued++;
        }
      }
    }

    console.log(
      `[Notifications] Processed queued notifications: ` +
      `${results.sent} sent, ${results.requeued} requeued, ${results.failed} failed`
    );
  }

  /**
   * Manually retry a failed notification
   */
  async retryNotification(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.status === NotificationStatus.SENT) {
      throw new BadRequestException('Notification already sent');
    }

    // Reset retry count and queue for immediate retry
    await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.QUEUED,
        retryCount: 0,
        nextRetryAt: new Date(),
        errorMessage: null,
      },
    });

    // Try to send immediately
    try {
      await this.sendNotification(notificationId);
      return { message: 'Notification sent successfully' };
    } catch (error) {
      await this.queueNotificationForRetry(notificationId, error);
      return { message: 'Notification queued for retry' };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId?: string) {
    const where: Prisma.NotificationWhereInput = { 
      deletedAt: null 
    };
    if (userId) {
      where.userId = userId;
    }

    const [total, pending, queued, sent, failed] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { ...where, status: NotificationStatus.PENDING } }),
      this.prisma.notification.count({ where: { ...where, status: NotificationStatus.QUEUED } }),
      this.prisma.notification.count({ where: { ...where, status: NotificationStatus.SENT } }),
      this.prisma.notification.count({ where: { ...where, status: NotificationStatus.FAILED } }),
    ]);

    return {
      total,
      pending,
      queued,
      sent,
      failed,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0.00',
    };
  }

  /**
   * Get notifications for current user
   */
  async getMyNotifications(userId: string, options?: { unreadOnly?: boolean }) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        deletedAt: null, // Exclude soft-deleted notifications
        ...(options?.unreadOnly ? { isRead: false } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật thông báo này');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }

  /**
   * Convenience helpers for common events
   */
  async notifyReservationYourTurn(userId: string, payload: { reservationId: string; unitCode: string }) {
    return this.createNotification({
      userId,
      type: 'RESERVATION_YOUR_TURN',
      title: 'Đến lượt bạn đặt cọc',
      message: `Đến lượt bạn đặt cọc cho căn ${payload.unitCode}. Vui lòng tạo phiếu cọc trong 48 giờ.`,
      entityType: 'RESERVATION',
      entityId: payload.reservationId,
      metadata: payload,
    });
  }

  async notifyReservationExpired(userId: string, payload: { reservationId: string; unitCode: string }) {
    return this.createNotification({
      userId,
      type: 'RESERVATION_EXPIRED',
      title: 'Phiếu giữ chỗ đã hết hạn',
      message: `Phiếu giữ chỗ cho căn ${payload.unitCode} đã hết hạn.`,
      entityType: 'RESERVATION',
      entityId: payload.reservationId,
      metadata: payload,
    });
  }

  async notifyBookingStatus(
    userId: string,
    payload: { bookingId: string; unitCode: string; status: 'CREATED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' },
  ) {
    const base = {
      userId,
      entityType: 'BOOKING',
      entityId: payload.bookingId,
      metadata: payload,
    };

    switch (payload.status) {
      case 'CREATED':
        return this.createNotification({
          ...base,
          type: 'BOOKING_CREATED',
          title: 'Tạo booking thành công',
          message: `Bạn đã tạo booking cho căn ${payload.unitCode}.`,
        });
      case 'APPROVED':
        return this.createNotification({
          ...base,
          type: 'BOOKING_APPROVED',
          title: 'Booking đã được duyệt',
          message: `Booking cho căn ${payload.unitCode} đã được admin duyệt.`,
        });
      case 'REJECTED':
        return this.createNotification({
          ...base,
          type: 'BOOKING_REJECTED',
          title: 'Booking bị từ chối',
          message: `Booking cho căn ${payload.unitCode} đã bị từ chối.`,
        });
      case 'CANCELLED':
        return this.createNotification({
          ...base,
          type: 'BOOKING_CANCELLED',
          title: 'Booking đã bị hủy',
          message: `Booking cho căn ${payload.unitCode} đã bị hủy.`,
        });
    }
  }

  async notifyDepositStatus(
    userId: string,
    payload: { depositId: string; unitCode: string; status: 'CREATED' | 'APPROVED' | 'CANCELLED' | 'OVERDUE' },
  ) {
    const base = {
      userId,
      entityType: 'DEPOSIT',
      entityId: payload.depositId,
      metadata: payload,
    };

    switch (payload.status) {
      case 'CREATED':
        return this.createNotification({
          ...base,
          type: 'DEPOSIT_CREATED',
          title: 'Tạo phiếu cọc thành công',
          message: `Bạn đã tạo phiếu cọc cho căn ${payload.unitCode}.`,
        });
      case 'APPROVED':
        return this.createNotification({
          ...base,
          type: 'DEPOSIT_APPROVED',
          title: 'Phiếu cọc đã được duyệt',
          message: `Phiếu cọc cho căn ${payload.unitCode} đã được admin duyệt.`,
        });
      case 'CANCELLED':
        return this.createNotification({
          ...base,
          type: 'DEPOSIT_CANCELLED',
          title: 'Phiếu cọc đã bị hủy',
          message: `Phiếu cọc cho căn ${payload.unitCode} đã bị hủy.`,
        });
      case 'OVERDUE':
        return this.createNotification({
          ...base,
          type: 'DEPOSIT_OVERDUE',
          title: 'Phiếu cọc quá hạn thanh toán',
          message: `Phiếu cọc cho căn ${payload.unitCode} đang quá hạn thanh toán.`,
        });
    }
  }

  /**
   * Notify all admins about queue processing errors
   */
  async notifyAdminQueueProcessingErrors(
    projectId: string,
    projectName: string,
    errors: Array<{ unitId: string; error: string }>,
  ) {
    // Get all admin users
    const admins = await this.prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    });

    if (admins.length === 0) {
      console.warn('[Notifications] No admin users found to notify about queue processing errors');
      return;
    }

    const errorCount = errors.length;
    const firstErrors = errors.slice(0, 5).map((e) => `Unit ${e.unitId}: ${e.error}`).join('\n');
    const message =
      errorCount > 5
        ? `${firstErrors}\n... và ${errorCount - 5} lỗi khác.`
        : firstErrors;

    // Send notification to all admins
    const notifications = admins.map((admin) =>
      this.createNotification({
        userId: admin.id,
        type: 'QUEUE_PROCESSING_ERRORS',
        title: `Lỗi xử lý queue cho dự án ${projectName}`,
        message: `Có ${errorCount} căn hộ gặp lỗi khi xử lý queue:\n${message}`,
        entityType: 'PROJECT',
        entityId: projectId,
        metadata: {
          projectId,
          projectName,
          errorCount,
          errors: errors.slice(0, 10), // Store first 10 errors in metadata
        },
      }),
    );

    await Promise.allSettled(notifications);
  }

  /**
   * Notify all admins about queue processing completion
   */
  async notifyAdminQueueProcessingComplete(
    projectId: string,
    projectName: string,
    results: { total: number; processed: number; skipped: number; failed: number },
  ) {
    // Only notify if there are failures
    if (results.failed === 0) {
      return;
    }

    // Get all admin users
    const admins = await this.prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        isActive: true,
      },
      select: { id: true },
    });

    if (admins.length === 0) {
      return;
    }

    const message = `Xử lý queue hoàn thành cho dự án ${projectName}:\n` +
      `- Tổng: ${results.total} căn\n` +
      `- Thành công: ${results.processed} căn\n` +
      `- Bỏ qua: ${results.skipped} căn\n` +
      `- Lỗi: ${results.failed} căn`;

    // Send notification to all admins
    const notifications = admins.map((admin) =>
      this.createNotification({
        userId: admin.id,
        type: 'QUEUE_PROCESSING_COMPLETE',
        title: `Hoàn thành xử lý queue - ${projectName}`,
        message,
        entityType: 'PROJECT',
        entityId: projectId,
        metadata: {
          projectId,
          projectName,
          ...results,
        },
      }),
    );

    await Promise.allSettled(notifications);
  }
}



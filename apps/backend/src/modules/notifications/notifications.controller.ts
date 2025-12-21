import { Controller, Get, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Get current user's notifications
   * GET /api/notifications/my
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyNotifications(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const onlyUnread = unreadOnly === 'true';
    return this.notificationsService.getMyNotifications(req.user.userId, {
      unreadOnly: onlyUnread,
    });
  }

  /**
   * Mark a notification as read
   * PATCH /api/notifications/:id/read
   */
  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.userId);
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/mark-all-read
   */
  @Patch('mark-all-read')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.userId);
  }

  /**
   * Retry a failed/queued notification
   * POST /api/notifications/:id/retry
   */
  @Patch(':id/retry')
  @UseGuards(JwtAuthGuard)
  retryNotification(@Param('id') id: string) {
    return this.notificationsService.retryNotification(id);
  }

  /**
   * Get notification statistics
   * GET /api/notifications/stats
   */
  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req) {
    return this.notificationsService.getNotificationStats(req.user.userId);
  }
}



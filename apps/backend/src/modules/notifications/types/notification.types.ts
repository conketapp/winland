/**
 * Notification Types
 * Type definitions for Notification module
 */

import { Notification, NotificationChannel, NotificationType } from '@prisma/client';

/**
 * Create notification parameters
 */
export interface CreateNotificationParams {
  userId: string;
  type: NotificationType | string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  channel?: NotificationChannel | string;
}

/**
 * Notification with user
 */
export interface NotificationWithUser extends Notification {
  user?: {
    id: string;
    fullName: string;
    email?: string | null;
  };
}

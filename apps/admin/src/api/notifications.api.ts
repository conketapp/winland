import { apiRequest } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: string | null;
  channel: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export async function fetchMyNotifications(unreadOnly?: boolean): Promise<Notification[]> {
  const query = unreadOnly ? '?unreadOnly=true' : '';
  return apiRequest<Notification[]>({
    method: 'GET',
    url: `/notifications/my${query}`,
  });
}

export async function markNotificationAsRead(id: string): Promise<Notification> {
  return apiRequest<Notification>({
    method: 'PATCH',
    url: `/notifications/${id}/read`,
  });
}

export async function markAllNotificationsAsRead(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>({
    method: 'PATCH',
    url: '/notifications/mark-all-read',
  });
}



import { apiRequest } from './client';

export interface AuditLogItem {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string | null;
  newValue?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email?: string | null;
    phone?: string | null;
  } | null;
}

export interface AuditLogResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogQuery {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  sortDirection?: 'asc' | 'desc';
}

export const auditLogApi = {
  async getAll(query: AuditLogQuery = {}): Promise<AuditLogResponse> {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const qs = params.toString();

    return apiRequest<AuditLogResponse>({
      method: 'GET',
      url: `/audit-logs${qs ? `?${qs}` : ''}`,
    });
  },

  async getActions(): Promise<string[]> {
    return apiRequest<string[]>({
      method: 'GET',
      url: '/audit-logs/actions',
    });
  },

  async getEntityTypes(): Promise<string[]> {
    return apiRequest<string[]>({
      method: 'GET',
      url: '/audit-logs/entity-types',
    });
  },
};



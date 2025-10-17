/**
 * Shared StatusBadge Component
 * Consistent status badges across the app
 */

import React from 'react';
import { Badge } from '../ui/badge';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  // Project statuses
  OPEN: 'default',
  UPCOMING: 'secondary',
  CLOSED: 'outline',
  DRAFT: 'outline',
  
  // Unit statuses
  AVAILABLE: 'default',
  RESERVED: 'secondary',
  RESERVED_BOOKING: 'secondary',
  DEPOSITED: 'secondary',
  SOLD: 'outline',
  
  // Transaction statuses
  PENDING_APPROVAL: 'secondary',
  CONFIRMED: 'default',
  CANCELLED: 'destructive',
  EXPIRED: 'destructive',
  REJECTED: 'destructive',
  
  // Commission statuses
  PENDING: 'secondary',
  APPROVED: 'default',
  PAID: 'default',
};

const STATUS_LABELS: Record<string, string> = {
  // Project
  OPEN: 'Đang mở bán',
  UPCOMING: 'Sắp mở bán',
  CLOSED: 'Đã đóng',
  DRAFT: 'Nháp',
  
  // Unit
  AVAILABLE: 'Còn trống',
  RESERVED: 'Đang giữ',
  RESERVED_BOOKING: 'Đã booking',
  DEPOSITED: 'Đã cọc',
  SOLD: 'Đã bán',
  
  // Transaction
  PENDING_APPROVAL: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
  REJECTED: 'Bị từ chối',
  ACTIVE: 'Đang hoạt động',
  
  // Commission
  PENDING: 'Chờ thanh toán',
  APPROVED: 'Đã duyệt',
  PAID: 'Đã thanh toán',
};

interface StatusBadgeProps {
  status: string;
  customLabel?: string;
}

export default function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] || 'secondary';
  const label = customLabel || STATUS_LABELS[status] || status;

  return (
    <Badge variant={variant}>
      {label}
    </Badge>
  );
}


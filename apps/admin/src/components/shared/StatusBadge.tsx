/**
 * Shared StatusBadge Component
 * Consistent status badges across the app
 */

import { Badge } from '../ui/badge';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'> = {
  // Project statuses
  OPEN: 'success',
  UPCOMING: 'warning',
  CLOSED: 'outline',
  DRAFT: 'secondary',
  
  // Unit statuses
  AVAILABLE: 'success',
  RESERVED: 'warning',
  RESERVED_BOOKING: 'warning',
  DEPOSITED: 'info',
  SOLD: 'outline',
  
  // Common statuses (used by multiple entities)
  PENDING_APPROVAL: 'warning',
  PENDING_CONFIRMATION: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'destructive',
  EXPIRED: 'destructive',
  REJECTED: 'destructive',
  COMPLETED: 'success',
  
  // Reservation statuses
  ACTIVE: 'info',
  YOUR_TURN: 'warning',
  MISSED: 'destructive',
  
  // Commission statuses
  PENDING: 'warning',
  APPROVED: 'info',
  PAID: 'success',
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
  
  // Common statuses (used by multiple entities)
  PENDING_APPROVAL: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  CANCELLED: 'Đã hủy',
  EXPIRED: 'Hết hạn',
  REJECTED: 'Bị từ chối',
  COMPLETED: 'Hoàn thành',
  
  // Reservation statuses
  ACTIVE: 'Đang chờ',
  YOUR_TURN: 'Đến lượt',
  MISSED: 'Bỏ lỡ',
  
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


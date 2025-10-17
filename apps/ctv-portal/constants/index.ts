/**
 * Application Constants
 */

export const UNIT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Còn trống',
  RESERVED: 'Đang giữ',
  RESERVED_BOOKING: 'Đã booking',
  DEPOSITED: 'Đã cọc',
  SOLD: 'Đã bán',
};

export const UNIT_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  RESERVED: 'bg-orange-100 text-orange-700',
  RESERVED_BOOKING: 'bg-blue-100 text-blue-700',
  DEPOSITED: 'bg-purple-100 text-purple-700',
  SOLD: 'bg-gray-100 text-gray-700',
};

export const COMMISSION_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  APPROVED: 'Đã duyệt',
  PAID: 'Đã nhận',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
  UPGRADED_TO_DEPOSIT: 'Đã cọc',
};

export const NAV_ITEMS = [
  { href: '/dashboard', icon: 'Home', label: 'Trang chủ' },
  { href: '/units', icon: 'Search', label: 'Tìm căn' },
  { href: '/my-transactions', icon: 'FileText', label: 'Phiếu' },
  { href: '/commissions', icon: 'DollarSign', label: 'Hoa hồng' },
  { href: '/profile', icon: 'User', label: 'Cá nhân' },
];


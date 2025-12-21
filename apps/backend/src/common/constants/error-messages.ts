/**
 * Error Messages Constants
 * 
 * Centralized error messages for consistency and future i18n support
 * 
 * Structure:
 * - Grouped by domain (unit, booking, deposit, reservation, etc.)
 * - Each message has a key and default Vietnamese text
 * - Future: Can be extended to support i18n with translation files
 */

export const ErrorMessages = {
  // ========== Common ==========
  COMMON: {
    NOT_FOUND: 'Không tìm thấy',
    UNAUTHORIZED: 'Bạn không có quyền thực hiện hành động này',
    FORBIDDEN: 'Bạn không có quyền truy cập',
    INVALID_INPUT: 'Dữ liệu đầu vào không hợp lệ',
    ALREADY_PROCESSED: 'Đã được xử lý',
    NOT_OWNER: 'Bạn không phải chủ sở hữu',
  },

  // ========== Unit ==========
  UNIT: {
    NOT_FOUND: 'Căn hộ không tồn tại',
    ALREADY_SOLD: 'Căn hộ đã được bán',
    ALREADY_DEPOSITED: 'Căn hộ đã được đặt cọc',
    ALREADY_RESERVED: 'Căn này đã được giữ/đặt bởi CTV khác hoặc không còn ở trạng thái AVAILABLE',
    NOT_AVAILABLE: (status: string) => `Căn này đã ${status}`,
    STATUS_MISMATCH: (expected: string, actual: string) =>
      `Căn hộ không còn ở trạng thái ${expected}, hiện tại là ${actual}`,
  },

  // ========== Project ==========
  PROJECT: {
    NOT_FOUND: 'Dự án không tồn tại',
    CODE_EXISTS: (code: string) => `Mã dự án "${code}" đã tồn tại`,
    INVALID_PRICE_RANGE: 'Giá từ phải nhỏ hơn hoặc bằng giá đến',
    NOT_UPCOMING: 'Chỉ có thể giữ chỗ cho dự án UPCOMING (sắp mở bán)',
    NOT_OPEN: 'Chỉ có thể tạo booking khi dự án đã mở bán',
  },

  // ========== Reservation ==========
  RESERVATION: {
    NOT_FOUND: 'Phiếu giữ chỗ không tồn tại',
    ALREADY_EXISTS: 'Bạn đã giữ chỗ căn này rồi',
    NOT_OWNER: 'Đây không phải phiếu giữ chỗ của bạn',
    UNIT_MISMATCH: 'Phiếu giữ chỗ không khớp với căn hộ',
    INVALID_STATUS: 'Phiếu giữ chỗ không ở trạng thái hợp lệ để đặt cọc',
    CANNOT_CANCEL: 'Bạn không có quyền hủy phiếu này',
  },

  // ========== Booking ==========
  BOOKING: {
    NOT_FOUND: 'Booking không tồn tại',
    ALREADY_EXISTS: 'Căn này đã được đặt bởi CTV khác',
    NOT_OWNER: 'Bạn không có quyền hủy booking này',
    ALREADY_PROCESSED: 'Booking này đã được xử lý',
    CANNOT_CLEANUP: 'Chỉ có thể dọn các booking đã hết hạn hoặc đã hủy',
    UNIT_NOT_FOUND: 'Căn hộ của booking không tồn tại',
  },

  // ========== Deposit ==========
  DEPOSIT: {
    NOT_FOUND: 'Phiếu cọc không tồn tại',
    ALREADY_EXISTS: 'Căn hộ đã có phiếu đặt cọc đang hoạt động',
    NOT_OWNER: 'Đây không phải phiếu giữ chỗ của bạn',
    ALREADY_PROCESSED: 'Phiếu cọc này đã được xử lý',
    MIN_AMOUNT: (minAmount: number, percentage: number) =>
      `Số tiền cọc tối thiểu là ${minAmount.toLocaleString()} VNĐ (${percentage}% giá căn)`,
    EXCEEDS_PRICE: 'Số tiền cọc không thể lớn hơn giá căn',
    CANNOT_CLEANUP: 'Chỉ có thể dọn các phiếu cọc đã hủy hoặc quá hạn',
    UNIT_NOT_FOUND: 'Căn hộ của phiếu cọc không tồn tại',
  },

  // ========== Payment ==========
  PAYMENT: {
    NOT_FOUND: 'Giao dịch không tồn tại',
    ALREADY_CONFIRMED: 'Giao dịch đã được xác nhận',
    INVALID_AMOUNT: 'Số tiền không hợp lệ',
    NOT_PENDING: 'Giao dịch không ở trạng thái chờ xác nhận',
    NOT_OWNER: 'Bạn chỉ có thể tạo giao dịch cho phiếu cọc của mình',
    SCHEDULE_NOT_FOUND: 'Đợt thanh toán không tồn tại',
    SCHEDULE_MISMATCH: 'Đợt thanh toán không thuộc phiếu cọc này',
    SCHEDULE_ALREADY_PAID: 'Đợt thanh toán này đã được thanh toán',
  },

  // ========== Payment Request ==========
  PAYMENT_REQUEST: {
    NOT_FOUND: 'Yêu cầu thanh toán không tồn tại',
    NOT_PENDING: 'Yêu cầu thanh toán không ở trạng thái chờ duyệt',
    NOT_APPROVED: 'Yêu cầu thanh toán chưa được duyệt',
    ALREADY_EXISTS: 'Đã tồn tại yêu cầu thanh toán cho hoa hồng này',
    NOT_OWNER: 'Bạn chỉ có thể tạo yêu cầu thanh toán cho hoa hồng của mình',
  },

  // ========== Commission ==========
  COMMISSION: {
    NOT_FOUND: 'Hoa hồng không tồn tại',
    CANNOT_RECALCULATE: 'Không thể tính lại hoa hồng đã được duyệt hoặc thanh toán',
  },

  // ========== User ==========
  USER: {
    NOT_FOUND: 'Người dùng không tồn tại',
    INACTIVE: 'Tài khoản đã bị vô hiệu hóa',
    INVALID_CREDENTIALS: 'Số điện thoại hoặc mật khẩu không đúng',
  },
} as const;

/**
 * Helper function to get error message
 * Future: Can be extended to support i18n
 */
export function getErrorMessage(
  domain: keyof typeof ErrorMessages,
  key: string,
  ...args: any[]
): string {
  const domainMessages = ErrorMessages[domain] as any;
  const message = domainMessages[key];

  if (typeof message === 'function') {
    return message(...args);
  }

  return message || ErrorMessages.COMMON.NOT_FOUND;
}

/**
 * Type-safe error message keys
 */
export type ErrorMessageKey<T extends keyof typeof ErrorMessages> = keyof (typeof ErrorMessages)[T];


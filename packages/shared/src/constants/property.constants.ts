export const PROPERTY_TYPES = {
  SALE: 'Bán',
  RENT: 'Cho thuê',
} as const;

export const PROPERTY_STATUS = {
  AVAILABLE: 'Còn trống',
  PENDING: 'Đang xử lý',
  SOLD: 'Đã bán',
  RENTED: 'Đã cho thuê',
} as const;

export const PROPERTY_DIRECTIONS = [
  'Đông',
  'Tây',
  'Nam',
  'Bắc',
  'Đông Bắc',
  'Đông Nam',
  'Tây Bắc',
  'Tây Nam',
] as const;

export const LEGAL_DOCUMENTS = [
  'Sổ đỏ',
  'Sổ hồng',
  'Giấy tờ hợp lệ',
  'Đang chờ sổ',
] as const;


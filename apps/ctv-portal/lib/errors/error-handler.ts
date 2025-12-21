/**
 * Centralized Error Handling
 * User-friendly error messages và error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class APIError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message, 'API_ERROR', statusCode, response);
    this.name = 'APIError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400, fields);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Không thể kết nối đến server') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
  }
}

/**
 * Error Messages Map
 * User-friendly Vietnamese error messages
 */
export const ErrorMessages = {
  // Network Errors
  NETWORK_ERROR: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.',
  TIMEOUT: 'Request quá thời gian chờ. Vui lòng thử lại.',
  
  // API Errors
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  SERVER_ERROR: 'Lỗi server. Vui lòng thử lại sau.',
  BAD_REQUEST: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  
  // Auth Errors
  INVALID_CREDENTIALS: 'Số điện thoại hoặc mật khẩu không đúng.',
  ACCOUNT_INACTIVE: 'Tài khoản đã bị vô hiệu hóa.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn.',
  
  // Validation Errors
  REQUIRED_FIELD: (field: string) => `${field} là bắt buộc.`,
  INVALID_FORMAT: (field: string) => `${field} không đúng định dạng.`,
  MIN_LENGTH: (field: string, min: number) => `${field} phải có ít nhất ${min} ký tự.`,
  MAX_LENGTH: (field: string, max: number) => `${field} không được vượt quá ${max} ký tự.`,
  
  // Business Logic Errors
  UNIT_NOT_AVAILABLE: 'Căn hộ không còn khả dụng.',
  ALREADY_RESERVED: 'Bạn đã giữ chỗ căn này rồi.',
  BOOKING_EXPIRED: 'Booking đã hết hạn.',
  DEPOSIT_EXISTS: 'Căn hộ đã có phiếu đặt cọc.',
  
  // Generic
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
} as const;

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Map common error messages
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorMessages.NETWORK_ERROR;
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return ErrorMessages.UNAUTHORIZED;
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return ErrorMessages.FORBIDDEN;
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return ErrorMessages.NOT_FOUND;
    }
    
    if (message.includes('timeout')) {
      return ErrorMessages.TIMEOUT;
    }
    
    return error.message || ErrorMessages.UNKNOWN_ERROR;
  }

  return ErrorMessages.UNKNOWN_ERROR;
}

/**
 * Handle API error response
 */
export function handleAPIError(response: Response, data?: unknown): APIError {
  const statusCode = response.status;
  let message: string = ErrorMessages.UNKNOWN_ERROR;

  const dataObj = data as { error?: unknown; message?: unknown } | undefined;
  if (dataObj?.error) {
    message = String(dataObj.error);
  } else if (dataObj?.message) {
    message = String(dataObj.message);
  } else {
    switch (statusCode) {
      case 401:
        message = ErrorMessages.UNAUTHORIZED;
        break;
      case 403:
        message = ErrorMessages.FORBIDDEN;
        break;
      case 404:
        message = ErrorMessages.NOT_FOUND;
        break;
      case 400:
        message = ErrorMessages.BAD_REQUEST;
        break;
      case 500:
      case 502:
      case 503:
        message = ErrorMessages.SERVER_ERROR;
        break;
    }
  }

  return new APIError(message, statusCode, data);
}

/**
 * Safe async wrapper với error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<[T | null, Error | null]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (errorHandler) {
      errorHandler(err);
    }
    return [null, err];
  }
}


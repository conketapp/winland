/**
 * Database Constraints Documentation
 * 
 * This file documents all check constraints and validation rules
 * that should be enforced at the database level (via Prisma) or application level.
 * 
 * Note: SQLite has limited support for CHECK constraints in ALTER TABLE.
 * For production PostgreSQL, these constraints can be added directly.
 */

/**
 * Check Constraints (should be enforced)
 */

export const DB_CONSTRAINTS = {
  // Units
  UNIT_PRICE_POSITIVE: 'price > 0',
  UNIT_AREA_POSITIVE: 'area > 0',
  
  // Projects
  PROJECT_PRICE_RANGE: 'priceFrom <= priceTo OR priceFrom IS NULL OR priceTo IS NULL',
  PROJECT_COMMISSION_RATE_RANGE: 'commissionRate >= 0 AND commissionRate <= 100',
  
  // Deposits
  DEPOSIT_AMOUNT_POSITIVE: 'depositAmount > 0',
  DEPOSIT_PERCENTAGE_RANGE: 'depositPercentage >= 0 AND depositPercentage <= 100',
  DEPOSIT_AMOUNT_NOT_EXCEED_UNIT_PRICE: 'depositAmount <= (SELECT price FROM units WHERE id = unitId)',
  DEPOSIT_REFUND_NOT_EXCEED_AMOUNT: 'refundAmount IS NULL OR refundAmount <= depositAmount',
  
  // Bookings
  BOOKING_AMOUNT_POSITIVE: 'bookingAmount > 0',
  
  // Transactions
  TRANSACTION_AMOUNT_POSITIVE: 'amount > 0',
  
  // Commissions
  COMMISSION_AMOUNT_POSITIVE: 'amount > 0',
  COMMISSION_RATE_POSITIVE: 'rate > 0',
  COMMISSION_RATE_RANGE: 'rate >= 0 AND rate <= 100',
  
  // Payment Requests
  PAYMENT_REQUEST_AMOUNT_POSITIVE: 'amount > 0',
  
  // Payment Schedules
  PAYMENT_SCHEDULE_AMOUNT_POSITIVE: 'amount > 0',
  PAYMENT_SCHEDULE_PERCENTAGE_RANGE: 'percentage >= 0 AND percentage <= 100',
  PAYMENT_SCHEDULE_PAID_AMOUNT_NON_NEGATIVE: 'paidAmount >= 0',
  PAYMENT_SCHEDULE_PAID_NOT_EXCEED_AMOUNT: 'paidAmount <= amount',
  
  // Reservations
  RESERVATION_PRIORITY_NON_NEGATIVE: 'priority >= 0',
  RESERVATION_EXTEND_COUNT_NON_NEGATIVE: 'extendCount >= 0',
  
  // Users
  USER_TOTAL_DEALS_NON_NEGATIVE: 'totalDeals >= 0',
} as const;

/**
 * Validation functions for application-level checks
 * These should be called before database operations
 */
export class ConstraintValidator {
  /**
   * Validate deposit amount constraints
   */
  static validateDepositAmount(depositAmount: number, unitPrice: number): void {
    if (depositAmount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }
    if (depositAmount > unitPrice) {
      throw new Error('Deposit amount cannot exceed unit price');
    }
  }

  /**
   * Validate deposit percentage
   */
  static validateDepositPercentage(percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Deposit percentage must be between 0 and 100');
    }
  }

  /**
   * Validate price range
   */
  static validatePriceRange(priceFrom?: number, priceTo?: number): void {
    if (priceFrom !== undefined && priceTo !== undefined && priceFrom > priceTo) {
      throw new Error('Price from must be less than or equal to price to');
    }
  }

  /**
   * Validate amount is positive
   */
  static validatePositiveAmount(amount: number, fieldName: string = 'Amount'): void {
    if (amount <= 0) {
      throw new Error(`${fieldName} must be greater than 0`);
    }
  }

  /**
   * Validate percentage range
   */
  static validatePercentage(percentage: number, fieldName: string = 'Percentage'): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error(`${fieldName} must be between 0 and 100`);
    }
  }

  /**
   * Validate refund amount doesn't exceed deposit amount
   */
  static validateRefundAmount(refundAmount: number, depositAmount: number): void {
    if (refundAmount > depositAmount) {
      throw new Error('Refund amount cannot exceed deposit amount');
    }
  }

  /**
   * Validate paid amount doesn't exceed schedule amount
   */
  static validatePaidAmount(paidAmount: number, scheduleAmount: number): void {
    if (paidAmount < 0) {
      throw new Error('Paid amount cannot be negative');
    }
    if (paidAmount > scheduleAmount) {
      throw new Error('Paid amount cannot exceed schedule amount');
    }
  }
}


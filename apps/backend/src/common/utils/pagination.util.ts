/**
 * Pagination Utilities
 * Consistent pagination across all services
 */

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  maxPageSize?: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginationUtil {
  /**
   * Default pagination values
   */
  static readonly DEFAULT_PAGE = 1;
  static readonly DEFAULT_PAGE_SIZE = 20;
  static readonly MAX_PAGE_SIZE = 100;

  /**
   * Normalize pagination options
   */
  static normalize(options: PaginationOptions = {}): {
    page: number;
    pageSize: number;
    skip: number;
    take: number;
  } {
    const page = Math.max(1, options.page || this.DEFAULT_PAGE);
    const maxPageSize = options.maxPageSize || this.MAX_PAGE_SIZE;
    const pageSize = Math.min(
      maxPageSize,
      Math.max(1, options.pageSize || this.DEFAULT_PAGE_SIZE)
    );
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    return { page, pageSize, skip, take };
  }

  /**
   * Create pagination result
   */
  static createResult<T>(
    items: T[],
    total: number,
    page: number,
    pageSize: number
  ): PaginationResult<T> {
    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Get pagination metadata for response
   */
  static getMetadata(page: number, pageSize: number, total: number) {
    const totalPages = Math.ceil(total / pageSize);

    return {
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}


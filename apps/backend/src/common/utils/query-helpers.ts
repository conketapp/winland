/**
 * Query Helpers for Soft Delete and Common Filters
 */

/**
 * Add soft delete filter to where clause
 * Automatically excludes records where deletedAt IS NOT NULL
 */
export function excludeDeleted<T extends Record<string, any>>(where: T): T {
  return {
    ...where,
    deletedAt: null,
  };
}

/**
 * Build where clause with soft delete filter
 */
export function buildWhereWithSoftDelete<T extends Record<string, any>>(
  filters?: Partial<T>,
): T & { deletedAt: null } {
  return {
    ...(filters || {}),
    deletedAt: null,
  } as T & { deletedAt: null };
}


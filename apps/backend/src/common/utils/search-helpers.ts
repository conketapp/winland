/**
 * Search Helpers for Full-Text Search
 * Provides utilities for building search queries with indexes
 */

/**
 * Build search query for projects
 * Searches in: name, code, developer, location, description
 */
export function buildProjectSearchQuery(search: string) {
  if (!search) return undefined;

  const searchLower = search.toLowerCase();
  return {
    OR: [
      { name: { contains: searchLower, mode: 'insensitive' } },
      { code: { contains: searchLower, mode: 'insensitive' } },
      { developer: { contains: searchLower, mode: 'insensitive' } },
      { location: { contains: searchLower, mode: 'insensitive' } },
      { description: { contains: searchLower, mode: 'insensitive' } },
    ],
  };
}

/**
 * Build search query for units
 * Searches in: code, unitNumber, description
 */
export function buildUnitSearchQuery(search: string) {
  if (!search) return undefined;

  const searchLower = search.toLowerCase();
  return {
    OR: [
      { code: { contains: searchLower, mode: 'insensitive' } },
      { unitNumber: { contains: searchLower, mode: 'insensitive' } },
      { description: { contains: searchLower, mode: 'insensitive' } },
    ],
  };
}

/**
 * Build search query for users
 * Searches in: fullName, phone, email
 */
export function buildUserSearchQuery(search: string) {
  if (!search) return undefined;

  const searchLower = search.toLowerCase();
  return {
    OR: [
      { fullName: { contains: searchLower, mode: 'insensitive' } },
      { phone: { contains: searchLower, mode: 'insensitive' } },
      { email: { contains: searchLower, mode: 'insensitive' } },
    ],
  };
}

/**
 * Build search query for reservations/bookings/deposits
 * Searches in: code, customerName, customerPhone
 */
export function buildTransactionSearchQuery(search: string) {
  if (!search) return undefined;

  const searchLower = search.toLowerCase();
  return {
    OR: [
      { code: { contains: searchLower, mode: 'insensitive' } },
      { customerName: { contains: searchLower, mode: 'insensitive' } },
      { customerPhone: { contains: searchLower, mode: 'insensitive' } },
    ],
  };
}


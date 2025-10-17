/**
 * Convert Vietnamese string to slug
 */
export function toSlug(str: string): string {
  // Convert to lowercase
  str = str.toLowerCase();

  // Remove Vietnamese accents
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace đ with d
  str = str.replace(/đ/g, 'd');

  // Remove special characters
  str = str.replace(/[^\w\s-]/g, '');

  // Replace spaces with hyphens
  str = str.replace(/\s+/g, '-');

  // Remove multiple hyphens
  str = str.replace(/-+/g, '-');

  // Remove leading/trailing hyphens
  str = str.replace(/^-+|-+$/g, '');

  return str;
}

/**
 * Generate unique slug with timestamp
 */
export function generateUniqueSlug(str: string): string {
  const baseSlug = toSlug(str);
  const timestamp = Date.now().toString(36);
  return `${baseSlug}-${timestamp}`;
}


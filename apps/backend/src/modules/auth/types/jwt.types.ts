/**
 * JWT Types
 * Type definitions for JWT authentication
 */

export interface JwtPayload {
  sub: string; // User ID
  email?: string;
  role?: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface JwtUser {
  userId: string;
  email?: string;
  role?: string;
}

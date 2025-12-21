/**
 * Cache Service
 * Abstraction layer for caching (currently in-memory, can be extended to Redis)
 * 
 * Future: Replace with Redis implementation
 */

import { Injectable } from '@nestjs/common';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

@Injectable()
export class CacheService {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || 3600; // Default 1 hour
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[]): Promise<void> {
    keys.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);

    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    await this.deleteMany(keysToDelete);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
    };
  }
}

/**
 * Cache Key Generator
 * Consistent cache key naming
 */
export class CacheKey {
  private static readonly PREFIX = 'winland';

  static project(id: string): string {
    return `${this.PREFIX}:project:${id}`;
  }

  static projectList(filters: Record<string, any>): string {
    const filterStr = JSON.stringify(filters);
    return `${this.PREFIX}:projects:${Buffer.from(filterStr).toString('base64')}`;
  }

  static unit(id: string): string {
    return `${this.PREFIX}:unit:${id}`;
  }

  static unitList(projectId: string, filters: Record<string, any>): string {
    const filterStr = JSON.stringify(filters);
    return `${this.PREFIX}:units:${projectId}:${Buffer.from(filterStr).toString('base64')}`;
  }

  static booking(id: string): string {
    return `${this.PREFIX}:booking:${id}`;
  }

  static bookingList(filters: Record<string, any>): string {
    const filterStr = JSON.stringify(filters);
    return `${this.PREFIX}:bookings:${Buffer.from(filterStr).toString('base64')}`;
  }

  static deposit(id: string): string {
    return `${this.PREFIX}:deposit:${id}`;
  }

  static depositList(filters: Record<string, any>): string {
    const filterStr = JSON.stringify(filters);
    return `${this.PREFIX}:deposits:${Buffer.from(filterStr).toString('base64')}`;
  }

  static reservation(id: string): string {
    return `${this.PREFIX}:reservation:${id}`;
  }

  static reservationList(filters: Record<string, any>): string {
    const filterStr = JSON.stringify(filters);
    return `${this.PREFIX}:reservations:${Buffer.from(filterStr).toString('base64')}`;
  }

  static user(id: string): string {
    return `${this.PREFIX}:user:${id}`;
  }

  static systemConfig(key: string): string {
    return `${this.PREFIX}:config:${key}`;
  }

  static dashboardStats(userId?: string): string {
    return userId
      ? `${this.PREFIX}:dashboard:${userId}`
      : `${this.PREFIX}:dashboard:admin`;
  }
}


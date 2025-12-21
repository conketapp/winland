/**
 * Query Analysis Service
 * 
 * Monitors and analyzes slow queries for performance optimization.
 * Provides insights into query patterns and suggests indexes.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  model?: string;
  operation?: string;
}

export interface QueryAnalysis {
  slowQueries: QueryMetrics[];
  frequentQueries: Map<string, { count: number; avgDuration: number }>;
  suggestedIndexes: string[];
  topSlowQueries: QueryMetrics[];
}

@Injectable()
export class QueryAnalysisService {
  private readonly logger = new Logger(QueryAnalysisService.name);
  private queryMetrics: QueryMetrics[] = [];
  private readonly SLOW_QUERY_THRESHOLD = 100; // milliseconds
  private readonly MAX_METRICS = 1000; // Keep last 1000 queries

  constructor(_prisma: PrismaService) {
    // PrismaService is injected for future use (e.g., storing metrics to DB)
    this.setupQueryLogging();
  }

  /**
   * Setup Prisma query logging to capture query metrics
   */
  private setupQueryLogging() {
    // Prisma query logging is handled via PrismaClient extensions
    // This is a placeholder for actual implementation
    // In production, use Prisma middleware or query event logging
  }

  /**
   * Record a query metric
   */
  recordQuery(metrics: QueryMetrics) {
    this.queryMetrics.push(metrics);

    // Keep only last MAX_METRICS
    if (this.queryMetrics.length > this.MAX_METRICS) {
      this.queryMetrics = this.queryMetrics.slice(-this.MAX_METRICS);
    }

    // Log slow queries
    if (metrics.duration > this.SLOW_QUERY_THRESHOLD) {
      this.logger.warn(
        `Slow query detected: ${metrics.operation || 'unknown'} on ${metrics.model || 'unknown'} - ${metrics.duration}ms`,
      );
    }
  }

  /**
   * Analyze queries and generate insights
   */
  analyzeQueries(): QueryAnalysis {
    const slowQueries = this.queryMetrics.filter(
      (q) => q.duration > this.SLOW_QUERY_THRESHOLD,
    );

    // Group by query pattern
    const queryPatterns = new Map<string, { count: number; totalDuration: number }>();

    this.queryMetrics.forEach((metric) => {
      const pattern = this.extractQueryPattern(metric.query);
      const existing = queryPatterns.get(pattern) || { count: 0, totalDuration: 0 };
      queryPatterns.set(pattern, {
        count: existing.count + 1,
        totalDuration: existing.totalDuration + metric.duration,
      });
    });

    // Calculate average duration for frequent queries
    const frequentQueries = new Map<string, { count: number; avgDuration: number }>();
    queryPatterns.forEach((stats, pattern) => {
      if (stats.count > 5) {
        // Only consider queries that appear more than 5 times
        frequentQueries.set(pattern, {
          count: stats.count,
          avgDuration: stats.totalDuration / stats.count,
        });
      }
    });

    // Generate suggested indexes based on query patterns
    const suggestedIndexes = this.generateIndexSuggestions(slowQueries, frequentQueries);

    // Top 10 slowest queries
    const topSlowQueries = [...slowQueries]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      slowQueries,
      frequentQueries,
      suggestedIndexes,
      topSlowQueries,
    };
  }

  /**
   * Extract query pattern from SQL query
   */
  private extractQueryPattern(query: string): string {
    // Simplify query to pattern
    // Remove specific values, keep structure
    let pattern = query
      .replace(/\d+/g, '?') // Replace numbers
      .replace(/'[^']*'/g, '?') // Replace strings
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Extract table name
    const tableMatch = pattern.match(/FROM\s+["`]?(\w+)["`]?/i);
    if (tableMatch) {
      pattern = `${tableMatch[1]}: ${pattern.substring(0, 100)}`;
    }

    return pattern;
  }

  /**
   * Generate index suggestions based on slow queries
   */
  private generateIndexSuggestions(
    slowQueries: QueryMetrics[],
    _frequentQueries: Map<string, { count: number; avgDuration: number }>,
  ): string[] {
    const suggestions: string[] = [];

    // Analyze WHERE clauses
    const wherePatterns = new Map<string, number>();
    slowQueries.forEach((query) => {
      const whereMatch = query.query.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
      if (whereMatch) {
        const conditions = whereMatch[1];
        // Extract column names
        const columns = conditions.match(/(\w+)\s*[=<>]/g);
        if (columns) {
          const columnList = columns
            .map((c) => c.replace(/\s*[=<>].*/, ''))
            .sort()
            .join(', ');
          const count = wherePatterns.get(columnList) || 0;
          wherePatterns.set(columnList, count + 1);
        }
      }
    });

    // Suggest composite indexes for frequently used column combinations
    wherePatterns.forEach((count, columns) => {
      if (count > 3 && columns.split(', ').length > 1) {
        suggestions.push(`Composite index on: (${columns})`);
      }
    });

    // Analyze ORDER BY patterns
    const orderByPatterns = new Map<string, number>();
    slowQueries.forEach((query) => {
      const orderMatch = query.query.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
      if (orderMatch) {
        const orderColumns = orderMatch[1]
          .split(',')
          .map((c) => c.trim().replace(/\s+(ASC|DESC)/i, ''))
          .join(', ');
        const count = orderByPatterns.get(orderColumns) || 0;
        orderByPatterns.set(orderColumns, count + 1);
      }
    });

    orderByPatterns.forEach((count, columns) => {
      if (count > 3) {
        suggestions.push(`Index for ORDER BY: (${columns})`);
      }
    });

    return suggestions;
  }

  /**
   * Get query statistics
   */
  getStatistics() {
    const total = this.queryMetrics.length;
    const slow = this.queryMetrics.filter((q) => q.duration > this.SLOW_QUERY_THRESHOLD).length;
    const avgDuration =
      this.queryMetrics.reduce((sum, q) => sum + q.duration, 0) / total || 0;
    const maxDuration = Math.max(...this.queryMetrics.map((q) => q.duration), 0);

    return {
      total,
      slow,
      avgDuration: Math.round(avgDuration * 100) / 100,
      maxDuration,
      slowPercentage: total > 0 ? Math.round((slow / total) * 100) : 0,
    };
  }

  /**
   * Clear metrics (useful for testing or reset)
   */
  clearMetrics() {
    this.queryMetrics = [];
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): QueryMetrics[] {
    return [...this.queryMetrics];
  }
}


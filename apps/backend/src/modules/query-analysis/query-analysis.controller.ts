/**
 * Query Analysis Controller
 * 
 * Provides endpoints to view query performance metrics and analysis.
 * Useful for monitoring and optimizing database queries.
 */

import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryAnalysisService } from '../../common/services/query-analysis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('query-analysis')
@UseGuards(JwtAuthGuard)
export class QueryAnalysisController {
  constructor(private queryAnalysis: QueryAnalysisService) {}

  /**
   * Get query statistics
   * GET /api/query-analysis/stats
   */
  @Get('stats')
  getStats() {
    return this.queryAnalysis.getStatistics();
  }

  /**
   * Get query analysis report
   * GET /api/query-analysis/report
   */
  @Get('report')
  getReport() {
    return this.queryAnalysis.analyzeQueries();
  }

  /**
   * Get slow queries
   * GET /api/query-analysis/slow-queries
   */
  @Get('slow-queries')
  getSlowQueries() {
    const analysis = this.queryAnalysis.analyzeQueries();
    return {
      slowQueries: analysis.slowQueries,
      topSlowQueries: analysis.topSlowQueries,
    };
  }

  /**
   * Get suggested indexes
   * GET /api/query-analysis/suggested-indexes
   */
  @Get('suggested-indexes')
  getSuggestedIndexes() {
    const analysis = this.queryAnalysis.analyzeQueries();
    return {
      suggestedIndexes: analysis.suggestedIndexes,
      frequentQueries: Array.from(analysis.frequentQueries.entries()).map(
        ([pattern, stats]) => ({
          pattern,
          ...stats,
        }),
      ),
    };
  }
}


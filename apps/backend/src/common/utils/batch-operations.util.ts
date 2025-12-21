/**
 * Batch Operations Utilities
 * Helper functions for batch processing
 */

export class BatchOperationsUtil {
  /**
   * Process items in batches
   * @param items Array of items to process
   * @param batchSize Number of items per batch
   * @param processor Function to process each batch
   * @returns Array of results from all batches
   */
  static async processInBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Process items in parallel batches
   * @param items Array of items to process
   * @param batchSize Number of items per batch
   * @param concurrency Number of parallel batches
   * @param processor Function to process each batch
   * @returns Array of results from all batches
   */
  static async processInParallelBatches<T, R>(
    items: T[],
    batchSize: number,
    concurrency: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    const results: R[] = [];

    // Process batches with concurrency limit
    for (let i = 0; i < batches.length; i += concurrency) {
      const concurrentBatches = batches.slice(i, i + concurrency);
      const batchResults = await Promise.all(
        concurrentBatches.map((batch) => processor(batch))
      );
      results.push(...batchResults.flat());
    }

    return results;
  }

  /**
   * Create batch update operations
   * @param items Array of items with id
   * @param batchSize Number of items per batch
   * @param updater Function to update each batch
   */
  static async batchUpdate<T extends { id: string }>(
    items: T[],
    batchSize: number,
    updater: (batch: T[]) => Promise<void>
  ): Promise<void> {
    await this.processInBatches(items, batchSize, async (batch) => {
      await updater(batch);
      return [];
    });
  }

  /**
   * Create batch delete operations
   * @param ids Array of IDs to delete
   * @param batchSize Number of IDs per batch
   * @param deleter Function to delete each batch
   */
  static async batchDelete(
    ids: string[],
    batchSize: number,
    deleter: (batchIds: string[]) => Promise<void>
  ): Promise<void> {
    await this.processInBatches(ids, batchSize, async (batch) => {
      await deleter(batch);
      return [];
    });
  }

  /**
   * Chunk array into batches
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}


/**
 * PDF Storage Utility
 * For now, using local file system storage
 * In production, this should be replaced with cloud storage (S3, GCS)
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface StorageResult {
  url: string;
  filename: string;
  filepath: string;
  size: number;
}

export class PdfStorage {
  private static storagePath = process.env.PDF_STORAGE_PATH || path.join(process.cwd(), 'storage', 'pdfs');

  /**
   * Initialize storage directory
   */
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * Save PDF buffer to storage
   */
  static async save(
    buffer: Buffer,
    filename: string,
    subfolder?: string,
  ): Promise<StorageResult> {
    await this.initialize();

    // Create subfolder if provided
    const folderPath = subfolder
      ? path.join(this.storagePath, subfolder)
      : this.storagePath;

    await fs.mkdir(folderPath, { recursive: true });

    // Full file path
    const filepath = path.join(folderPath, filename);

    // Write file
    await fs.writeFile(filepath, buffer);

    // Get file size
    const stats = await fs.stat(filepath);

    // Return URL (for local storage, use file path)
    // In production with cloud storage, this would be a public URL
    const url = process.env.PDF_BASE_URL
      ? `${process.env.PDF_BASE_URL}/${subfolder || ''}/${filename}`.replace(/\/+/g, '/')
      : filepath;

    return {
      url,
      filename,
      filepath,
      size: stats.size,
    };
  }

  /**
   * Delete PDF file
   */
  static async delete(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
    } catch (error) {
      // File might not exist, ignore
    }
  }

  /**
   * Get file path from URL
   */
  static getFilePathFromUrl(url: string): string {
    if (url.startsWith('http')) {
      // Cloud storage URL - return as is for now
      return url;
    }
    return url;
  }
}

/**
 * File Upload Utility
 * Handles file uploads with validation and storage
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BadRequestException, Logger } from '@nestjs/common';

export interface FileUploadResult {
  url: string;
  filename: string;
  filepath: string;
  size: number;
  mimeType: string;
}

export interface FileUploadOptions {
  maxSize?: number; // bytes, default 10MB
  allowedMimeTypes?: string[]; // default: ['image/jpeg', 'image/png', 'application/pdf']
  subfolder?: string; // subfolder in uploads directory
}

export class FileUploadUtil {
  private static readonly logger = new Logger(FileUploadUtil.name);
  private static readonly DEFAULT_UPLOAD_PATH = process.env.UPLOAD_DIR || path.join(process.cwd(), 'storage', 'uploads');
  private static readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly DEFAULT_ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  /**
   * Initialize upload directory
   */
  static async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.DEFAULT_UPLOAD_PATH, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }
  }

  /**
   * Validate file
   */
  static validateFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): void {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedMimeTypes || this.DEFAULT_ALLOWED_TYPES;

    // Check file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
      );
    }

    // Check MIME type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }
  }

  /**
   * Save uploaded file
   */
  static async saveFile(
    file: Express.Multer.File,
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult> {
    await this.initialize();

    // Validate file
    this.validateFile(file, options);

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${baseName}_${timestamp}_${randomStr}${ext}`;

    // Create subfolder if provided
    const folderPath = options.subfolder
      ? path.join(this.DEFAULT_UPLOAD_PATH, options.subfolder)
      : this.DEFAULT_UPLOAD_PATH;

    await fs.mkdir(folderPath, { recursive: true });

    // Full file path
    const filepath = path.join(folderPath, filename);

    // Write file
    await fs.writeFile(filepath, file.buffer);

    // Get file size
    const stats = await fs.stat(filepath);

    // Return URL (for local storage, use file path)
    // In production with cloud storage, this would be a public URL
    const url = process.env.UPLOAD_BASE_URL
      ? `${process.env.UPLOAD_BASE_URL}/${options.subfolder || ''}/${filename}`.replace(/\/+/g, '/')
      : filepath;

    this.logger.log(`File uploaded: ${filename} (${stats.size} bytes)`);

    return {
      url,
      filename,
      filepath,
      size: stats.size,
      mimeType: file.mimetype,
    };
  }

  /**
   * Save multiple files
   */
  static async saveFiles(
    files: Express.Multer.File[],
    options: FileUploadOptions = {},
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];

    for (const file of files) {
      try {
        const result = await this.saveFile(file, options);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to save file ${file.originalname}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Delete file
   */
  static async deleteFile(filepath: string): Promise<void> {
    try {
      await fs.unlink(filepath);
      this.logger.log(`File deleted: ${filepath}`);
    } catch (error) {
      this.logger.warn(`Failed to delete file ${filepath}:`, error);
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

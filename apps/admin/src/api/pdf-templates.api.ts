/**
 * PDF Templates API Service
 */

import { apiRequest } from './client';

export interface TemplateInfo {
  name: string;
  displayName: string;
  description: string;
  filename: string;
  lastModified?: string;
  size?: number;
}

export interface TemplateContent {
  name: string;
  content: string;
  displayName: string;
  description: string;
}

export interface UpdateTemplateDto {
  content: string;
}

export interface PreviewTemplateDto {
  templateName: string;
  context?: Record<string, unknown>;
}

export const pdfTemplatesApi = {
  /**
   * Get all templates
   */
  list: async (): Promise<TemplateInfo[]> => {
    return apiRequest<TemplateInfo[]>({
      method: 'GET',
      url: '/pdf-templates',
    });
  },

  /**
   * Get template content by name
   */
  get: async (name: string): Promise<TemplateContent> => {
    return apiRequest<TemplateContent>({
      method: 'GET',
      url: `/pdf-templates/${encodeURIComponent(name)}`,
    });
  },

  /**
   * Update template content
   */
  update: async (name: string, content: string): Promise<{ name: string; message: string }> => {
    return apiRequest<{ name: string; message: string }>({
      method: 'PUT',
      url: `/pdf-templates/${encodeURIComponent(name)}`,
      data: { content },
    });
  },

  /**
   * Preview template with sample or custom context
   */
  preview: async (name: string, context?: Record<string, unknown>): Promise<{ html: string }> => {
    return apiRequest<{ html: string }>({
      method: 'POST',
      url: `/pdf-templates/${encodeURIComponent(name)}/preview`,
      data: { templateName: name, context },
    });
  },
};
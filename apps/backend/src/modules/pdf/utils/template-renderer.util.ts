/**
 * Template Renderer Utility using Handlebars
 */

import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs/promises';
import { registerHelpers } from './handlebars-helpers';

// Register custom helpers
registerHelpers(Handlebars);

export interface TemplateContext {
  [key: string]: any;
}

export class TemplateRenderer {
  private static templateCache: Map<string, Handlebars.TemplateDelegate> = new Map();

  /**
   * Get templates directory path
   */
  private static getTemplatesDir(): string {
    // In development (TypeScript), templates are in src/modules/pdf/templates
    // In production (compiled), templates should be copied to dist/modules/pdf/templates
    // For now, use a path relative to process.cwd()
    const isDevelopment = __dirname.includes('src');
    if (isDevelopment) {
      return path.join(process.cwd(), 'apps', 'backend', 'src', 'modules', 'pdf', 'templates');
    }
    return path.join(process.cwd(), 'apps', 'backend', 'dist', 'modules', 'pdf', 'templates');
  }

  /**
   * Load template from file
   */
  static async loadTemplate(templateName: string): Promise<Handlebars.TemplateDelegate> {
    // Check cache first
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    // Load template file
    const templatesDir = this.getTemplatesDir();
    const templatePath = path.join(templatesDir, `${templateName}.hbs`);

    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);

      // Cache template
      this.templateCache.set(templateName, template);

      return template;
    } catch (error) {
      throw new Error(
        `Failed to load template ${templateName} from ${templatePath}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Render template with context
   */
  static async render(
    templateName: string,
    context: TemplateContext,
  ): Promise<string> {
    const template = await this.loadTemplate(templateName);
    return template(context);
  }

  /**
   * Clear template cache (useful for development)
   */
  static clearCache(): void {
    this.templateCache.clear();
  }
}

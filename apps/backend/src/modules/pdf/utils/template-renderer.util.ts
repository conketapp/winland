/**
 * Template Renderer Utility using Handlebars
 */

import * as Handlebars from 'handlebars';
import * as path from 'path';
import * as fs from 'fs/promises';
import { registerHelpers } from './handlebars-helpers';
import { TemplateContext } from '../types/pdf.types';

// Register custom helpers
registerHelpers(Handlebars);

export class TemplateRenderer {
  private static templateCache: Map<string, Handlebars.TemplateDelegate> = new Map();

  /**
   * Get templates directory path
   * Templates are .hbs files that are not compiled, so we always use src path
   */
  private static getTemplatesDir(): string {
    // When running from dist, __dirname will be:
    // .../dist/apps/backend/src/modules/pdf/utils
    // We need to go back to the root (apps/backend) and then to src/modules/pdf/templates
    
    // Check if we're in compiled code (dist) or source code
    if (__dirname.includes('dist')) {
      // From dist/apps/backend/src/modules/pdf/utils, go up 7 levels to apps/backend root
      const rootDir = path.resolve(__dirname, '../../../../../../..');
      return path.join(rootDir, 'src', 'modules', 'pdf', 'templates');
    }
    
    // In development (source code), __dirname is in src/modules/pdf/utils
    // Go up 4 levels to apps/backend root
    const rootDir = path.resolve(__dirname, '../../../../');
    return path.join(rootDir, 'src', 'modules', 'pdf', 'templates');
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

/**
 * Watermark Utility
 * Adds watermarks to HTML content before PDF generation
 */

export interface WatermarkOptions {
  text: string;
  opacity?: number;
  fontSize?: string;
  color?: string;
  rotation?: number;
  position?: 'center' | 'diagonal';
}

export class WatermarkUtil {
  /**
   * Add watermark CSS to HTML content
   */
  static addWatermarkToHtml(html: string, options: WatermarkOptions): string {
    const {
      text,
      opacity = 0.1,
      fontSize = '72px',
      color = '#000000',
      rotation = -45,
    } = options;

    const watermarkStyle = `
      <style>
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(${rotation}deg);
          font-size: ${fontSize};
          font-weight: bold;
          color: ${color};
          opacity: ${opacity};
          z-index: 9999;
          pointer-events: none;
          white-space: nowrap;
          user-select: none;
        }
        
        @media print {
          .watermark {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
      <div class="watermark">${text}</div>
    `;

    // Insert watermark before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', watermarkStyle + '</body>');
    }

    // If no body tag, append to html
    return html + watermarkStyle;
  }

  /**
   * Get watermark text based on status
   */
  static getWatermarkText(type: string, status?: string): string {
    switch (type) {
      case 'reservation':
        if (status === 'CONFIRMED' || status === 'EXPIRED') {
          return status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : 'HẾT HẠN';
        }
        return 'CHƯA THANH TOÁN';
      case 'deposit':
        if (status === 'APPROVED') {
          return 'ĐÃ DUYỆT';
        }
        return 'CHỜ DUYỆT';
      case 'booking':
        if (status === 'APPROVED') {
          return 'ĐÃ DUYỆT';
        }
        return 'CHỜ DUYỆT';
      case 'transaction':
        return 'ĐÃ XÁC NHẬN';
      default:
        return '';
    }
  }
}


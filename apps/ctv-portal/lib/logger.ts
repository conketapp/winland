/**
 * Logger utility for safe logging in development and production
 * 
 * Usage:
 * import { logger } from '@/lib/logger';
 * 
 * logger.info('User logged in', { userId: '123' });
 * logger.error('Failed to fetch data', error);
 * logger.debug('Debug info', { data });
 */

const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
    [key: string]: any;
}

class Logger {
    private log(level: LogLevel, message: string, data?: LogData | Error) {
        if (!isDevelopment) {
            // In production, only log errors
            if (level === 'error') {
                console.error(message, data);
            }
            return;
        }

        // In development, log everything with formatting
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        switch (level) {
            case 'info':
                console.log(`${prefix} ${message}`, data || '');
                break;
            case 'warn':
                console.warn(`${prefix} ${message}`, data || '');
                break;
            case 'error':
                console.error(`${prefix} ${message}`, data || '');
                break;
            case 'debug':
                console.debug(`${prefix} ${message}`, data || '');
                break;
        }
    }

    info(message: string, data?: LogData) {
        this.log('info', message, data);
    }

    warn(message: string, data?: LogData) {
        this.log('warn', message, data);
    }

    error(message: string, error?: Error | LogData) {
        this.log('error', message, error);
    }

    debug(message: string, data?: LogData) {
        this.log('debug', message, data);
    }

    // Group logging for related logs
    group(label: string) {
        if (isDevelopment) {
            console.group(label);
        }
    }

    groupEnd() {
        if (isDevelopment) {
            console.groupEnd();
        }
    }
}

export const logger = new Logger();

/**
 * Logger Service - JollyJet E-commerce API
 *
 * Provides a centralized Pino logger instance for structured logging.
 */

import config from '@/config';
import { Logger, pino } from 'pino';

/**
 * Pino Logger Instance
 * Exported as a named export for consistency and better IDE support.
 */
export const logger = pino({
  level: config.logLevel || (config.env === 'production' ? 'info' : 'debug'),
  transport:
    config.env !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
            singleLine: true,
          },
        }
      : undefined,
  base: {
    env: config.env,
    port: config.port,
  },
});

/**
 * Re-export the Logger type for type hinting in other modules.
 */
export type { Logger };

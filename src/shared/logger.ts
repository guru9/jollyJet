import { pino } from 'pino';
import config from '../config';

const LOG_LEVEL = (config.logLevel as string) || (config.env === 'production' ? 'info' : 'debug');

const logger = pino({
  level: LOG_LEVEL,
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
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    port: config.port,
    database: config.env !== 'production' ? config.mongoUri : undefined,
    env: config.env,
  },
});

export default logger;

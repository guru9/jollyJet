import { pino } from 'pino';

const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = (process.env.LOG_LEVEL as any) || (NODE_ENV === 'production' ? 'info' : 'debug');

const logger = pino({
  level: LOG_LEVEL,
  transport:
    NODE_ENV !== 'production'
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
    pid: false,
    hostname: false,
    env: NODE_ENV,
  },
});

export default logger;

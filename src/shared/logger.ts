import { pino } from 'pino';
import config from '../config';

const logger = pino({
  level: config.env === 'development' ? 'info' : 'debug',
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
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    pid: false,
    hostname: false,
    env: config.env,
  },
});

export default logger;

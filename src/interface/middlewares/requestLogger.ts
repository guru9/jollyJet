import { Request, Response, NextFunction } from 'express';
import logger from '../../shared/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const { method, path, ip } = req;
  const { statusCode } = res;
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info(
      {
        method: method,
        path: path,
        statusCode: statusCode,
        ip: ip,
        duration: `${duration}ms`,
      },
      `Message: ${method} ${path} ${statusCode} - ${ip} - ${duration}ms`
    );
  });

  next();
};

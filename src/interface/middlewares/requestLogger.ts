import { logger } from '@/shared';
import { NextFunction, Request, Response } from 'express';

/**
 * Express middleware that logs HTTP request details including method, path, status code, IP address,
 * and response time. Logs are recorded when the response is finished using the 'finish' event.
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function to continue middleware chain
 */
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

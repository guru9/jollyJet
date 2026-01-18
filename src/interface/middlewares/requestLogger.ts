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
  const startTime = Date.now();

  // Store start time for other middleware to use
  (req as Request & { startTime?: number }).startTime = startTime;

  // Log response when it's finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      ip: req.ip || req.connection.remoteAddress || '::1',
      duration: `${duration}ms`,
      msg: `Message: ${req.method} ${req.path} ${res.statusCode} - ${req.ip || req.connection.remoteAddress || '::1'} - ${duration}ms`,
    });
  });

  next();
};

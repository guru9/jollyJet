import { NextFunction, Request, Response } from 'express';

/**
 * Response Timing Middleware
 *
 * Measures time taken to process requests and adds timing information
 * to response headers for performance monitoring.
 *
 * Note: This middleware only sets timing headers since request logging
 * and timing logs are now handled by requestLogger and redisCacheHandler.
 *
 * Adds the following headers:
 * - X-Response-Time: Time taken in milliseconds
 */
export const responseTimingHandler = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  // Store start time on request object for other middleware to use
  (req as Request & { startTime?: number }).startTime = start;

  // Simple approach: use res.on('finish') to set header
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
  });

  next();
};

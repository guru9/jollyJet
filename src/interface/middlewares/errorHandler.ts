import { AppError, ERROR_STATUS, HTTP_STATUS, logger } from '@/shared';
import { NextFunction, Request, Response } from 'express';

/**
 * Express error handling middleware that catches and processes errors thrown during request processing.
 * Handles both custom AppError instances and unexpected errors, logging them appropriately and
 * sending standardized error responses to the client.
 *
 * @param err - The error object thrown during request processing
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused in error handlers)
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    // Clean error message for production logs
    logger.error(
      {
        message: err.message,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      `AppError: ${err.message}`
    );

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Unexpected errors - include stack trace in development only
  logger.error(
    {
      message: err.message,
      path: req.path,
      method: req.method,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
    `Unexpected Error: ${err.message}`
  );

  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: ERROR_STATUS.INTERNAL_SERVER_ERROR,
  });
};

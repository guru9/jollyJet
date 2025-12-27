import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors';
import logger from '../../shared/logger';

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
    logger.error(
      `AppError: ${err.message} - ${JSON.stringify({
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
        stack: err.stack,
      })}`
    );

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Unexpected errors
  logger.error(
    `Unexpected Error: ${err.message} - ${JSON.stringify({
      path: req.path,
      method: req.method,
      stack: err.stack,
    })}`
  );

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};




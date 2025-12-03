import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/errors';
import logger from '../../shared/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
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

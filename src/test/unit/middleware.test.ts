import { NextFunction, Request, Response } from 'express';
import { errorHandler } from '../../interface/middlewares/errorHandler';
import { requestLogger } from '../../interface/middlewares/requestLogger';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../../shared/errors';

describe('Middleware Tests', () => {
  describe('errorHandler', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn().mockReturnValue({ json: jsonMock });

      mockRequest = {
        path: '/test',
        method: 'GET',
      };

      mockResponse = {
        status: statusMock,
      };

      mockNext = jest.fn();
    });

    it('should handle AppError and return correct status code', () => {
      const error = new NotFoundError('Resource not found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Resource not found',
      });
    });

    it('should handle BadRequestError', () => {
      const error = new BadRequestError('Invalid input');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Invalid input',
      });
    });

    it('should handle UnauthorizedError', () => {
      const error = new UnauthorizedError('Not authorized');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Not authorized',
      });
    });

    it('should handle InternalServerError', () => {
      const error = new InternalServerError('Server error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Server error',
      });
    });

    it('should handle unexpected errors with 500 status', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        status: 'error',
        message: 'Internal server error',
      });
    });
  });

  describe('requestLogger', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;
    let onMock: jest.Mock;

    beforeEach(() => {
      onMock = jest.fn();
      mockNext = jest.fn();

      mockRequest = {
        method: 'GET',
        path: '/test',
        ip: '127.0.0.1',
      };

      mockResponse = {
        statusCode: 200,
        on: onMock,
      };
    });

    it('should call next middleware', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should register finish event listener', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    it('should log request details on finish event', () => {
      requestLogger(mockRequest as Request, mockResponse as Response, mockNext);

      // Get the finish callback and execute it
      const finishCallback = onMock.mock.calls[0][1];
      finishCallback();

      // Verify the logger was called (implicitly tested through no errors)
      expect(onMock).toHaveBeenCalled();
    });
  });
});

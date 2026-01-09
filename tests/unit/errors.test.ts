import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '@/shared';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with custom message and status code', () => {
      const error = new AppError('Custom error', 418);

      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(418);
      expect(error.isOperational).toBe(true);
    });

    it('should default to 400 status code', () => {
      const error = new AppError('Default error');

      expect(error.statusCode).toBe(400);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should have stack trace', () => {
      const error = new AppError('Test');

      expect(error.stack).toBeDefined();
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error with custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
    });
  });

  describe('BadRequestError', () => {
    it('should create 400 error with custom message', () => {
      const error = new BadRequestError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default message', () => {
      const error = new BadRequestError();

      expect(error.message).toBe('Bad request');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create 401 error with custom message', () => {
      const error = new UnauthorizedError('Invalid token');

      expect(error.message).toBe('Invalid token');
      expect(error.statusCode).toBe(401);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized access');
    });
  });

  describe('ForbiddenError', () => {
    it('should create 403 error with custom message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Forbidden access');
    });
  });

  describe('ConflictError', () => {
    it('should create 409 error with custom message', () => {
      const error = new ConflictError('Email already exists');

      expect(error.message).toBe('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default message', () => {
      const error = new ConflictError();

      expect(error.message).toBe('Resource conflict');
    });
  });

  describe('InternalServerError', () => {
    it('should create 500 error with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.message).toBe('Database connection failed');
      expect(error.statusCode).toBe(500);
      expect(error).toBeInstanceOf(AppError);
    });

    it('should use default message', () => {
      const error = new InternalServerError();

      expect(error.message).toBe('Internal server error');
    });
  });
});

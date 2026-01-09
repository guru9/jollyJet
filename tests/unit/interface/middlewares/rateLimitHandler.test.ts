import { IRateLimitingService } from '@/domain/interfaces/ratelimit/IRateLimitingService';
import { rateLimitHandler } from '@/interface/middlewares/rateLimitHandler';
import { DI_TOKENS, HTTP_STATUS } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';

describe('rateLimitHandler', () => {
  let mockRateLimitingService: jest.Mocked<IRateLimitingService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    // Clear container and setup mocks
    container.clearInstances();

    mockRateLimitingService = {
      checkRateLimit: jest.fn(),
      resetRateLimit: jest.fn(),
      getRateLimitStatus: jest.fn(),
    } as unknown as jest.Mocked<IRateLimitingService>;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    container.registerInstance(DI_TOKENS.RATE_LIMIT_SERVICE, mockRateLimitingService);
    container.registerInstance(DI_TOKENS.LOGGER, mockLogger);

    mockRequest = {
      ip: '127.0.0.1',
      socket: {},
    } as Partial<Request>;

    mockResponse = {
      set: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as Partial<Response>;

    nextFunction = jest.fn() as NextFunction;
  });

  it('should allow request if rate limit is not exceeded', async () => {
    const resetAt = new Date(Date.now() + 60000);
    mockRateLimitingService.checkRateLimit.mockResolvedValueOnce({
      allowed: true,
      remaining: 99,
      resetAt,
      totalRequests: 1,
    });

    const middleware = rateLimitHandler();
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.set).toHaveBeenCalledWith({
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
      'X-RateLimit-Reset': resetAt.getTime().toString(),
    });
    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should block request if rate limit is exceeded', async () => {
    const resetAt = new Date(Date.now() + 60000);
    mockRateLimitingService.checkRateLimit.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt,
      totalRequests: 101,
    });

    const middleware = rateLimitHandler({ limit: 100 });
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(HTTP_STATUS.TOO_MANY_REQUESTS);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Too many requests, please try again later.',
        retryAfter: resetAt,
      })
    );
    expect(nextFunction).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('should use keyPrefix if provided', async () => {
    mockRateLimitingService.checkRateLimit.mockResolvedValueOnce({
      allowed: true,
      remaining: 5,
      resetAt: new Date(),
      totalRequests: 1,
    });

    const middleware = rateLimitHandler({ keyPrefix: 'test-route' });
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRateLimitingService.checkRateLimit).toHaveBeenCalledWith(
      'test-route:127.0.0.1',
      expect.any(Object)
    );
  });

  it('should fail-open and allow request if rate limiting service throws an error', async () => {
    mockRateLimitingService.checkRateLimit.mockRejectedValueOnce(
      new Error('Redis connection failed')
    );

    const middleware = rateLimitHandler();
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should respect custom windowSize and limit options', async () => {
    mockRateLimitingService.checkRateLimit.mockResolvedValueOnce({
      allowed: true,
      remaining: 4,
      resetAt: new Date(),
      totalRequests: 1,
    });

    const middleware = rateLimitHandler({ windowSize: 30, limit: 5 });
    await middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRateLimitingService.checkRateLimit).toHaveBeenCalledWith('127.0.0.1', {
      windowSize: 30,
      limit: 5,
    });
  });
});

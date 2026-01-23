import { redisCacheHandler } from '@/interface/middlewares/redisCacheHandler';
import { DI_TOKENS, REDIS_CONFIG } from '@/shared/constants';
import { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import { container } from 'tsyringe';

jest.mock('tsyringe', () => ({
  container: {
    resolve: jest.fn(),
  },
  injectable: () => (_target: unknown) => _target,
  inject: () => (_target: unknown, _key: unknown, _index: unknown) => {},
}));

describe('redisCacheHandler', () => {
  let mockRedisService: { get: jest.Mock; set: jest.Mock; getTTL: jest.Mock };
  let mockCacheConsistencyService: {
    trackCacheHit: jest.Mock;
    trackCacheMiss: jest.Mock;
    trackStaleRead: jest.Mock;
    checkStaleData: jest.Mock;
    refreshAhead: jest.Mock;
  };
  let mockLogger: { info: jest.Mock; warn: jest.Mock; error: jest.Mock; debug: jest.Mock };
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let setHeaderMock: jest.Mock;

  beforeEach(() => {
    mockRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      getTTL: jest.fn().mockResolvedValue(300),
    };
    mockCacheConsistencyService = {
      trackCacheHit: jest.fn(),
      trackCacheMiss: jest.fn(),
      trackStaleRead: jest.fn(),
      checkStaleData: jest.fn().mockResolvedValue({ isStale: false, ttl: 300 }),
      refreshAhead: jest.fn(),
    };
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };

    (container.resolve as jest.Mock).mockImplementation((token: string | { name: string }) => {
      if (token === DI_TOKENS.REDIS_SERVICE) return mockRedisService;
      if (token === DI_TOKENS.LOGGER) return mockLogger;
      if (
        (typeof token === 'object' && token.name === 'CacheConsistencyService') ||
        token === 'CacheConsistencyService'
      ) {
        return mockCacheConsistencyService;
      }
      return mockCacheConsistencyService;
    });

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    setHeaderMock = jest.fn();

    mockRequest = {
      method: 'GET',
      originalUrl: '/test-url',
      ip: '127.0.0.1',
      path: '/test-url',
      connection: {
        remoteAddress: '127.0.0.1',
      },
    } as Partial<Request>;
    mockResponse = {
      status: statusMock,
      json: jsonMock,
      statusCode: 200,
      setHeader: setHeaderMock,
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should serve from cache on hit', async () => {
    const cachedData = JSON.stringify({ data: 'cached' });
    mockRedisService.get.mockResolvedValue(cachedData);

    const middleware = redisCacheHandler();
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockRedisService.get).toHaveBeenCalled();
    expect(mockCacheConsistencyService.trackCacheHit).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'cached',
        cacheInfo: expect.anything(),
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should proceed to next and cache on miss', async () => {
    mockRedisService.get.mockResolvedValue(null);

    const middleware = redisCacheHandler(300);
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockCacheConsistencyService.trackCacheMiss).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();

    const responseData = { data: 'fresh' };
    (mockResponse.json as jest.Mock)(responseData);

    expect(mockRedisService.set).toHaveBeenCalledWith(
      expect.stringContaining('GET:/test-url'),
      expect.any(String),
      300
    );
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'fresh',
        cacheInfo: expect.anything(),
      })
    );
  });

  it('should bypass caching for non-GET requests', async () => {
    mockRequest.method = 'POST';

    const middleware = redisCacheHandler();
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRedisService.get).not.toHaveBeenCalled();
  });

  it('should handle redis errors gracefully and proceed to next', async () => {
    mockRedisService.get.mockRejectedValue(new Error('Redis connection failed'));

    const middleware = redisCacheHandler();
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockLogger.error).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should track stale data and trigger background refresh if enabled', async () => {
    const cachedData = JSON.stringify({ data: 'stale-data' });
    mockRedisService.get.mockResolvedValue(cachedData);
    mockCacheConsistencyService.checkStaleData.mockResolvedValue({ isStale: true, ttl: 0 });

    const middleware = redisCacheHandler(300, {
      consistencyCheck: true,
      backgroundRefresh: true,
    });
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockCacheConsistencyService.trackStaleRead).toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: 'stale-data',
        cacheInfo: expect.anything(),
      })
    );
  });

  it('should use default TTL if none provided', async () => {
    mockRedisService.get.mockResolvedValue(null);

    const middleware = redisCacheHandler();
    await middleware(mockRequest as Request, mockResponse as Response, mockNext);

    const responseData = { test: 'default-ttl' };
    (mockResponse.json as jest.Mock)(responseData);

    expect(mockRedisService.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      Number(REDIS_CONFIG.TTL.DEFAULT)
    );
  });
});

import 'reflect-metadata';
import { BaseRepository } from '@/infrastructure/repositories/BaseRepository';
import { CacheService } from '@/domain/services/cache/CacheService';
import { Logger } from '@/shared/logger';
import { DI_TOKENS, CACHE_LOG_MESSAGES } from '@/shared/constants';

describe('BaseRepository', () => {
  let mockLogger: jest.Mocked<Logger>;
  let mockCacheService: jest.Mocked<CacheService>;

  // Create a concrete implementation of BaseRepository for testing
  class TestRepository extends BaseRepository {
    constructor(logger: Logger, cacheService: CacheService) {
      super(logger, cacheService);
    }
  }

  beforeEach(() => {
    // Mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    // Mock cache service
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      deleteByPattern: jest.fn().mockResolvedValue(undefined),
      getOrSet: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<CacheService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with logger and cache service', () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      expect(repo).toBeDefined();
      expect(mockLogger).toBeDefined();
      expect(mockCacheService).toBeDefined();
    });
  });

  describe('generateCacheKey', () => {
    it('should generate cache key with namespace and parameters', () => {
      const repo = new TestRepository(mockLogger, mockCacheService);

      // Use private method access for testing
      const cacheKey = (repo as any).generateCacheKey('test', {
        id: '123',
        category: 'electronics',
      });

      // Should sort keys and join with |
      expect(cacheKey).toBe('test:category:"electronics"|id:"123"');
    });

    it('should handle empty parameters', () => {
      const repo = new TestRepository(mockLogger, mockCacheService);

      const cacheKey = (repo as any).generateCacheKey('test', {});

      expect(cacheKey).toBe('test:');
    });

    it('should handle undefined values in parameters', () => {
      const repo = new TestRepository(mockLogger, mockCacheService);

      const cacheKey = (repo as any).generateCacheKey('test', { id: '123', category: undefined });

      expect(cacheKey).toBe('test:category:undefined|id:"123"');
    });
  });

  describe('invalidateCache', () => {
    it('should call cacheService.deleteByPattern with pattern', async () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      const pattern = 'test:*';

      await (repo as any).invalidateCache(pattern);

      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith(pattern);
    });

    it('should handle cache service errors gracefully', async () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      const pattern = 'test:*';
      const error = new Error('Cache service error');
      mockCacheService.deleteByPattern.mockRejectedValue(error);

      await expect((repo as any).invalidateCache(pattern)).rejects.toThrow(error);
    });
  });

  describe('getCachedData', () => {
    it('should call cacheService.getOrSet with correct parameters', async () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      const cacheKey = 'test:123';
      const fetchFn = jest.fn().mockResolvedValue('test-data');
      const ttl = 3600;

      await (repo as any).getCachedData(cacheKey, fetchFn, ttl);

      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(cacheKey, fetchFn, ttl);
    });

    it('should use default TTL when not provided', async () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      const cacheKey = 'test:123';
      const fetchFn = jest.fn().mockResolvedValue('test-data');

      await (repo as any).getCachedData(cacheKey, fetchFn);

      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(cacheKey, fetchFn, undefined);
    });

    it('should handle fetch function errors', async () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      const cacheKey = 'test:123';
      const error = new Error('Fetch error');
      const fetchFn = jest.fn().mockRejectedValue(error);

      await expect((repo as any).getCachedData(cacheKey, fetchFn)).rejects.toThrow(error);
    });
  });

  describe('caching behavior integration', () => {
    it('should demonstrate complete cache-aside pattern', async () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      const cacheKey = 'product:123';
      const fetchFn = jest.fn().mockResolvedValue('product-data');
      const ttl = 3600;

      // Mock cache miss first time
      mockCacheService.getOrSet.mockResolvedValueOnce('product-data');

      const result1 = await (repo as any).getCachedData(cacheKey, fetchFn, ttl);

      expect(result1).toBe('product-data');
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling and logging', () => {
    it('should provide structured error logging', async () => {
      const repo = new TestRepository(mockLogger, mockCacheService);
      const cacheKey = 'test:error';
      const error = new Error('Test error with context');

      mockCacheService.getOrSet.mockRejectedValue(error);

      try {
        await (repo as any).getCachedData(cacheKey, () => Promise.resolve('data'));
      } catch (err) {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          key: cacheKey,
          error: error.message,
        },
        CACHE_LOG_MESSAGES.FETCH_FUNCTION_FAILED
      );
    });
  });
});

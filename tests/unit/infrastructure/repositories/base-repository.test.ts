import { CacheService } from '@/domain/services/cache/CacheService';
import { BaseRepository } from '@/infrastructure/repositories';
import { CACHE_LOG_MESSAGES } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import 'reflect-metadata';

// Test repository class that extends BaseRepository to access protected methods
class TestRepository extends BaseRepository {
  constructor(logger: Logger, cacheService: CacheService) {
    super(logger, cacheService);
  }

  // Expose protected methods for testing
  public testGenerateCacheKey(namespace: string, params: Record<string, unknown>): string {
    return this.generateCacheKey(namespace, params);
  }

  public testInvalidateCache(pattern: string): Promise<void> {
    return this.invalidateCache(pattern);
  }

  public testGetCachedData<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    return this.getCachedData(key, fetchFn, ttl);
  }

  // Mock implementation for testing
  public async findAll(): Promise<unknown[]> {
    return this.getCachedData('test:all', () => Promise.resolve([]));
  }
}

describe('BaseRepository', () => {
  let mockLogger: jest.Mocked<Logger>;
  let mockCacheService: jest.Mocked<CacheService>;
  let testRepo: TestRepository;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPattern: jest.fn(),
      getOrSet: jest.fn().mockImplementation(async (key, fetchFn) => {
        try {
          return await fetchFn();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : String(error);
          mockLogger.error(
            { key, error: errMsg },
            CACHE_LOG_MESSAGES.FETCH_FUNCTION_FAILED(key, errMsg)
          );
          throw error;
        }
      }),
      isConnected: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<CacheService>;

    testRepo = new TestRepository(mockLogger, mockCacheService);
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
      const repo = testRepo;

      // Use public test method to access protected method
      const cacheKey = repo.testGenerateCacheKey('test', {
        id: '123',
        category: 'electronics',
      });

      // Should sort keys and join with |
      expect(cacheKey).toBe('test:category:"electronics"|id:"123"');
    });

    it('should handle empty parameters', () => {
      const cacheKey = testRepo.testGenerateCacheKey('test', {});

      expect(cacheKey).toBe('test:');
    });

    it('should handle undefined values in parameters', () => {
      const cacheKey = testRepo.testGenerateCacheKey('test', { id: '123', category: undefined });

      expect(cacheKey).toBe('test:category:undefined|id:"123"');
    });
  });

  describe('invalidateCache', () => {
    it('should call cacheService.deleteByPattern with pattern', async () => {
      const pattern = 'test:*';
      mockCacheService.deleteByPattern.mockResolvedValue(undefined);

      await testRepo.testInvalidateCache(pattern);

      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith(pattern);
    });

    it('should handle cache service errors gracefully', async () => {
      const pattern = 'test:*';
      const error = new Error('Cache service error');
      mockCacheService.deleteByPattern.mockRejectedValue(error);

      await expect(testRepo.testInvalidateCache(pattern)).rejects.toThrow(error);
    });
  });

  describe('getCachedData', () => {
    it('should call cacheService.getOrSet with correct parameters', async () => {
      const cacheKey = 'test:123';
      const fetchFn = jest.fn().mockResolvedValue('test-data');
      const ttl = 3600;

      await testRepo.testGetCachedData(cacheKey, fetchFn, ttl);

      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(cacheKey, fetchFn, ttl);
    });

    it('should use default TTL when not provided', async () => {
      const cacheKey = 'test:123';
      const fetchFn = jest.fn().mockResolvedValue('test-data');

      await testRepo.testGetCachedData(cacheKey, fetchFn);

      expect(mockCacheService.getOrSet).toHaveBeenCalledWith(cacheKey, fetchFn, undefined);
    });

    it('should handle fetch function errors', async () => {
      const cacheKey = 'test:123';
      const error = new Error('Fetch error');
      const fetchFn = jest.fn().mockRejectedValue(error);

      await expect(testRepo.testGetCachedData(cacheKey, fetchFn)).rejects.toThrow(error);
    });
  });

  describe('caching behavior integration', () => {
    it('should demonstrate complete cache-aside pattern', async () => {
      const cacheKey = 'product:123';
      const fetchFn = jest.fn().mockResolvedValue('product-data');
      const ttl = 3600;

      const result1 = await testRepo.testGetCachedData(cacheKey, fetchFn, ttl);

      expect(result1).toBe('product-data');
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling and logging', () => {
    it('should provide structured error logging', async () => {
      const cacheKey = 'test:error';
      const error = new Error('Test error with context');

      const fetchFn = jest.fn().mockRejectedValue(error);

      try {
        await testRepo.testGetCachedData(cacheKey, fetchFn);
      } catch {
        // Expected to throw
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        {
          key: cacheKey,
          error: error.message,
        },
        CACHE_LOG_MESSAGES.FETCH_FUNCTION_FAILED(cacheKey, error.message)
      );
    });
  });
});

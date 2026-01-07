import { CacheConsistencyService } from '@/domain/services';
import { DI_TOKENS } from '@/shared/constants';
import { Cacheable, CacheEvict } from '@/shared/decorators/cache.decorator';
import 'reflect-metadata';
import { container, InjectionToken } from 'tsyringe';

// Mock Dependencies
const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn(),
  acquireLock: jest.fn(),
  releaseLock: jest.fn(),
};

const mockCacheConsistencyService = {
  trackCacheHit: jest.fn(),
  trackCacheMiss: jest.fn(),
  trackStaleRead: jest.fn(),
  checkStaleData: jest.fn(),
  refreshAhead: jest.fn(),
};

const mockLogger = {
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

// Mock Container Resolve
jest.spyOn(container, 'resolve').mockImplementation((token: InjectionToken<unknown>) => {
  if (token === DI_TOKENS.REDIS_SERVICE) return mockRedisService;
  if (token === DI_TOKENS.LOGGER) return mockLogger;
  // Use identity check AND name check for robustness in test environment
  if (
    token === CacheConsistencyService ||
    (typeof token === 'function' && 'name' in token && token.name === 'CacheConsistencyService')
  ) {
    return mockCacheConsistencyService;
  }
  return null;
});

describe('Cache Decorators', () => {
  class TestService {
    @Cacheable(3600)
    async getData(id: string) {
      return { id, data: 'fresh' };
    }

    @CacheEvict('test:*')
    async updateData(id: string) {
      return { id, updated: true };
    }
  }

  let service: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TestService();
  });

  describe('@Cacheable', () => {
    it('should fetch from database and set cache on miss', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockRedisService.acquireLock.mockResolvedValue(true);
      mockCacheConsistencyService.checkStaleData.mockResolvedValue({ isStale: false });

      const result = await service.getData('123');

      expect(result).toEqual({ id: '123', data: 'fresh' });
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.stringContaining('TestService:getData:["123"]'),
        JSON.stringify({ id: '123', data: 'fresh' }),
        3600
      );
      expect(mockCacheConsistencyService.trackCacheMiss).toHaveBeenCalled();
    });

    it('should return cached data on hit', async () => {
      const cachedData = { id: '123', data: 'cached' };
      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedData));
      mockCacheConsistencyService.checkStaleData.mockResolvedValue({ isStale: false });

      const result = await service.getData('123');

      expect(result).toEqual(cachedData);
      expect(mockCacheConsistencyService.trackCacheHit).toHaveBeenCalled();
      expect(result.data).toBe('cached');
    });

    it('should trigger background refresh if data is stale', async () => {
      const cachedData = { id: '123', data: 'stale' };
      mockRedisService.get.mockResolvedValue(JSON.stringify(cachedData));
      // Mock refreshAhead to avoid errors if the decorator doesn't await it
      mockCacheConsistencyService.refreshAhead.mockResolvedValue({});
      mockCacheConsistencyService.checkStaleData.mockResolvedValue({ isStale: true });

      const result = await service.getData('123');

      expect(result).toEqual(cachedData);
      expect(mockCacheConsistencyService.trackStaleRead).toHaveBeenCalled();
      expect(mockCacheConsistencyService.refreshAhead).toHaveBeenCalled();
    });
  });

  describe('@CacheEvict', () => {
    it('should call original method and then evict cache', async () => {
      mockRedisService.keys.mockResolvedValue(['test:1', 'test:2']);

      const result = await service.updateData('123');

      expect(result).toEqual({ id: '123', updated: true });
      expect(mockRedisService.delete).toHaveBeenCalledTimes(2);
      expect(mockRedisService.keys).toHaveBeenCalledWith('test:*');
    });
  });
});

import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { CacheConsistencyService } from '@/domain/services/cache/CacheConsistencyService';
import { Logger } from '@/shared';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock RedisService for basic functionality tests
const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn(),
  getClient: jest.fn(),
  flush: jest.fn(),
  increment: jest.fn(),
  setWithExpiration: jest.fn(),
  acquireLock: jest.fn(),
  releaseLock: jest.fn(),
  isConnected: jest.fn(),
  getTTL: jest.fn(),
} as jest.Mocked<IRedisService>;

// Simple mock logger
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

describe('CacheConsistencyService', () => {
  let cacheConsistencyService: CacheConsistencyService;

  beforeEach(() => {
    jest.clearAllMocks();
    cacheConsistencyService = new CacheConsistencyService(
      mockRedisService,
      mockLogger as unknown as Logger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Cleanup the service to clear any intervals
    cacheConsistencyService.cleanup();
  });

  describe('getPerformanceStats', () => {
    it('should return performance statistics', () => {
      const stats = cacheConsistencyService.getPerformanceStats();

      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('consistencyScore');
      expect(stats).toHaveProperty('totalOperations');
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.consistencyScore).toBe('number');
      expect(typeof stats.totalOperations).toBe('number');
    });

    it('should return hit rate between 0 and 100', () => {
      const stats = cacheConsistencyService.getPerformanceStats();
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(100);
    });

    it('should return consistency score between 0 and 100', () => {
      const stats = cacheConsistencyService.getPerformanceStats();
      expect(stats.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(stats.consistencyScore).toBeLessThanOrEqual(100);
    });

    it('should return total operations as non-negative number', () => {
      const stats = cacheConsistencyService.getPerformanceStats();
      expect(stats.totalOperations).toBeGreaterThanOrEqual(0);
    });

    it('should return consistent results for multiple calls', () => {
      const stats1 = cacheConsistencyService.getPerformanceStats();
      const stats2 = cacheConsistencyService.getPerformanceStats();

      expect(stats1).toEqual(stats2);
    });
  });

  describe('getMetrics', () => {
    it('should return cache metrics', () => {
      const metrics = cacheConsistencyService.getMetrics();

      expect(metrics).toHaveProperty('cacheHits');
      expect(metrics).toHaveProperty('cacheMisses');
      expect(metrics).toHaveProperty('staleReads');
      expect(metrics).toHaveProperty('consistencyErrors');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('consistencyScore');
      expect(metrics).toHaveProperty('totalOperations');
    });

    it('should have proper initial metrics', () => {
      const metrics = cacheConsistencyService.getMetrics();

      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(metrics.staleReads).toBe(0);
      expect(metrics.consistencyErrors).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.consistencyScore).toBe(100);
      expect(metrics.totalOperations).toBe(0);
    });
  });

  describe('trackCacheHit', () => {
    it('should track cache hit and update metrics', () => {
      cacheConsistencyService.trackCacheHit();

      const metrics = cacheConsistencyService.getMetrics();
      expect(metrics.cacheHits).toBe(1);
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.hitRate).toBe(100);
    });

    it('should track multiple cache hits', () => {
      cacheConsistencyService.trackCacheHit();
      cacheConsistencyService.trackCacheHit();

      const metrics = cacheConsistencyService.getMetrics();
      expect(metrics.cacheHits).toBe(2);
      expect(metrics.totalOperations).toBe(2);
      expect(metrics.hitRate).toBe(100);
    });
  });

  describe('trackCacheMiss', () => {
    it('should track cache miss and update metrics', () => {
      cacheConsistencyService.trackCacheMiss();

      const metrics = cacheConsistencyService.getMetrics();
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.hitRate).toBe(0);
    });

    it('should calculate hit rate correctly with hits and misses', () => {
      cacheConsistencyService.trackCacheHit();
      cacheConsistencyService.trackCacheHit();
      cacheConsistencyService.trackCacheMiss();

      const metrics = cacheConsistencyService.getMetrics();
      expect(metrics.cacheHits).toBe(2);
      expect(metrics.cacheMisses).toBe(1);
      expect(metrics.totalOperations).toBe(3);
      expect(metrics.hitRate).toBeCloseTo(66.67, 2);
    });
  });

  describe('trackStaleRead', () => {
    it('should track stale read and update consistency score', () => {
      cacheConsistencyService.trackStaleRead();

      const metrics = cacheConsistencyService.getMetrics();
      expect(metrics.staleReads).toBe(1);
      expect(metrics.consistencyScore).toBeLessThan(100);
    });
  });

  describe('trackConsistencyError', () => {
    it('should track consistency error and update consistency score', () => {
      cacheConsistencyService.trackConsistencyError();

      const metrics = cacheConsistencyService.getMetrics();
      expect(metrics.consistencyErrors).toBe(1);
      expect(metrics.consistencyScore).toBeLessThan(100);
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics to initial values', () => {
      // First, modify the metrics
      cacheConsistencyService.trackCacheHit();
      cacheConsistencyService.trackCacheMiss();
      cacheConsistencyService.trackStaleRead();
      cacheConsistencyService.trackConsistencyError();

      expect(cacheConsistencyService.getMetrics().totalOperations).toBeGreaterThan(0);

      // Reset metrics
      cacheConsistencyService.resetMetrics();

      const metrics = cacheConsistencyService.getMetrics();
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(metrics.staleReads).toBe(0);
      expect(metrics.consistencyErrors).toBe(0);
      expect(metrics.hitRate).toBe(0);
      expect(metrics.consistencyScore).toBe(100);
      expect(metrics.totalOperations).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources successfully', () => {
      // The cleanup method should work synchronously
      expect(() => {
        cacheConsistencyService.cleanup();
      }).not.toThrow();

      // Should be called once for cleanup (constructor call is separate)
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('should handle cleanup when called multiple times', () => {
      // Clear the constructor's info call
      mockLogger.info.mockClear();

      cacheConsistencyService.cleanup();
      cacheConsistencyService.cleanup(); // Should not throw

      // Should be called exactly twice for the two cleanup calls
      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('checkStaleData', () => {
    it('should return stale data check result for existing key', async () => {
      const testKey = 'test:key';

      // Setup mock
      const mockTtl = jest.fn().mockImplementation(() => Promise.resolve(300));
      (mockRedisService.getClient as jest.Mock).mockReturnValue({
        ttl: mockTtl,
      });
      (mockRedisService.get as jest.Mock).mockImplementation(() =>
        Promise.resolve('{"id": "test"}')
      );

      const result = await cacheConsistencyService.checkStaleData(testKey);

      expect(result).toHaveProperty('isStale');
      expect(result).toHaveProperty('ttl');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('threshold');
      expect(typeof result.isStale).toBe('boolean');
      expect(typeof result.ttl).toBe('number');
      expect(typeof result.age).toBe('number');
      expect(typeof result.threshold).toBe('number');
    });

    it('should handle missing key gracefully', async () => {
      const testKey = 'nonexistent:key';

      // Setup mock
      const mockTtlMissing = jest.fn().mockImplementation(() => Promise.resolve(-1));
      (mockRedisService.getClient as jest.Mock).mockReturnValue({
        ttl: mockTtlMissing,
      });
      (mockRedisService.get as jest.Mock).mockImplementation(() => Promise.resolve(null));

      const result = await cacheConsistencyService.checkStaleData(testKey);

      expect(result.isStale).toBe(true); // Conservative approach
    });
  });
});

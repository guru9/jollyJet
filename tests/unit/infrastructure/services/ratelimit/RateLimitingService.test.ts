import { RateLimitConfig } from '@/domain/interfaces/ratelimit/IRateLimitingService';
import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { RateLimitingService } from '@/infrastructure/services/ratelimit/RateLimitingService';
import { Logger } from '@/shared/logger';
import Redis from 'ioredis';
import 'reflect-metadata';

type MockPipelineType = {
  zremrangebyscore: jest.MockedFunction<
    (key: string, min: number, max: number) => MockPipelineType
  >;
  zadd: jest.MockedFunction<(key: string, score: number, member: string) => MockPipelineType>;
  zcard: jest.MockedFunction<(key: string) => MockPipelineType>;
  expire: jest.MockedFunction<(key: string, seconds: number) => MockPipelineType>;
  exec: jest.MockedFunction<() => Promise<unknown[] | null>>;
};

// Mock dependencies
const mockRedisService = {
  getClient: jest.fn(),
  delete: jest.fn(),
} as unknown as jest.Mocked<IRedisService>;

const mockLogger = {
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
} as unknown as jest.Mocked<Logger>;

describe('RateLimitingService', () => {
  let rateLimitingService: RateLimitingService;
  let mockPipeline: MockPipelineType;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPipeline = {
      zremrangebyscore: jest.fn().mockReturnThis(),
      zadd: jest.fn().mockReturnThis(),
      zcard: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    mockRedisService.getClient.mockReturnValue({
      pipeline: jest.fn().mockReturnValue(mockPipeline),
    } as unknown as Redis);

    rateLimitingService = new RateLimitingService(mockRedisService, mockLogger);
  });

  describe('checkRateLimit', () => {
    it('should return allowed=true when under limit', async () => {
      // Mock exec result: zcard returns 5 (limit is 100 default)
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zrem
        [null, 1], // zadd
        [null, 5], // zcard -> Total requests = 5
        [null, 1], // expire
      ]);

      const result = await rateLimitingService.checkRateLimit('test-key');

      expect(result.allowed).toBe(true);
      expect(result.totalRequests).toBe(5);
      expect(result.remaining).toBeGreaterThan(0);
      expect(mockPipeline.zcard).toHaveBeenCalledWith(
        expect.stringContaining('rate_limit:test-key')
      );
    });

    it('should return allowed=false when limit exceeded', async () => {
      // Limit is 100. Return 101.
      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, 1],
        [null, 101], // zcard
        [null, 1],
      ]);

      const result = await rateLimitingService.checkRateLimit('test-key');

      expect(result.allowed).toBe(false);
      expect(result.totalRequests).toBe(101);
      expect(result.remaining).toBe(0);
    });

    it('should use custom config if provided', async () => {
      const config: Partial<RateLimitConfig> = { limit: 10, windowSize: 60 };

      mockPipeline.exec.mockResolvedValue([
        [null, 0],
        [null, 1],
        [null, 5],
        [null, 1],
      ]);

      const result = await rateLimitingService.checkRateLimit('key', config);

      expect(mockPipeline.expire).toHaveBeenCalledWith(expect.any(String), 60);
      expect(result.allowed).toBe(true);
    });

    it('should throw error if pipeline fails', async () => {
      mockPipeline.exec.mockResolvedValue(null);
      await expect(rateLimitingService.checkRateLimit('key')).rejects.toThrow(
        'Redis pipeline failed'
      );
    });
  });

  describe('resetRateLimit', () => {
    it('should delete keys from redis', async () => {
      await rateLimitingService.resetRateLimit('test-key');
      expect(mockRedisService.delete).toHaveBeenCalledWith(
        expect.stringContaining('rate_limit:test-key')
      );
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return status without adding attempt', async () => {
      mockPipeline.exec.mockResolvedValue([
        [null, 0], // zrem
        [null, 50], // zcard (index 1 in this pipeline)
      ]);

      const result = await rateLimitingService.getRateLimitStatus('test-key');

      expect(result?.totalRequests).toBe(50);
      expect(mockPipeline.zadd).not.toHaveBeenCalled();
    });

    it('should return null if pipeline fails', async () => {
      mockPipeline.exec.mockResolvedValue(null);
      const result = await rateLimitingService.getRateLimitStatus('key');
      expect(result).toBeNull();
    });
  });
});

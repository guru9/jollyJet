import { inject, injectable } from 'tsyringe';
import {
  IRateLimitingService,
  RateLimitConfig,
  RateLimitResult,
} from '../../../domain/interfaces/ratelimit/IRateLimitingService';
import { IRedisService } from '../../../domain/interfaces/redis/IRedisService';
import { CACHE_KEYS_PATTERNS, DI_TOKENS, REDIS_CONFIG } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

@injectable()
export class RateLimitingService implements IRateLimitingService {
  private readonly defaultConfig: RateLimitConfig;

  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {
    this.defaultConfig = {
      windowSize: Number(REDIS_CONFIG.RATE_LIMIT.WINDOW),
      limit: Number(REDIS_CONFIG.RATE_LIMIT.MAX_REQUESTS),
    };
  }

  public async checkRateLimit(
    key: string,
    config?: Partial<RateLimitConfig>
  ): Promise<RateLimitResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const { windowSize, limit } = finalConfig;
    const rateLimitKey = CACHE_KEYS_PATTERNS.RATE_LIMIT(key);
    const now = Date.now();
    const windowStart = now - windowSize * 1000;

    const pipeline = this.redisService.getClient().pipeline();

    // Sliding Window Logic using Sorted Sets (ZSET)
    // 1. Remove elements older than the window
    pipeline.zremrangebyscore(rateLimitKey, 0, windowStart);
    // 2. Add current request (score = timestamp, member = timestamp-random)
    pipeline.zadd(rateLimitKey, now, `${now}-${Math.random()}`);
    // 3. Count elements in the window (-inf to +inf covers all remaining)
    pipeline.zcard(rateLimitKey);
    // 4. Set expiry on the key (window size)
    pipeline.expire(rateLimitKey, windowSize);

    const results = await pipeline.exec();

    if (!results) {
      throw new Error('Redis pipeline failed');
    }

    // results[2] is ZCARD result
    const zCardResult = results[2];
    if (zCardResult[0]) {
      throw zCardResult[0];
    }
    const totalRequests = zCardResult[1] as number;

    const allowed = totalRequests <= limit;
    const remaining = Math.max(0, limit - totalRequests);
    const resetAt = new Date(now + windowSize * 1000);

    return {
      allowed,
      remaining,
      resetAt,
      totalRequests,
    };
  }

  public async resetRateLimit(key: string): Promise<boolean> {
    const rateLimitKey = CACHE_KEYS_PATTERNS.RATE_LIMIT(key);
    await this.redisService.delete(rateLimitKey);
    this.logger.debug(`Rate limit reset for key: ${key}`);
    return true;
  }

  public async getRateLimitStatus(key: string): Promise<RateLimitResult | null> {
    const { windowSize, limit } = this.defaultConfig;
    const rateLimitKey = CACHE_KEYS_PATTERNS.RATE_LIMIT(key);
    const now = Date.now();
    const windowStart = now - windowSize * 1000;

    const pipeline = this.redisService.getClient().pipeline();
    pipeline.zremrangebyscore(rateLimitKey, 0, windowStart);
    pipeline.zcard(rateLimitKey);

    const results = await pipeline.exec();

    if (!results) return null;

    const zCardResult = results[1];
    if (zCardResult[0]) return null;

    const totalRequests = zCardResult[1] as number;
    const remaining = Math.max(0, limit - totalRequests);
    const resetAt = new Date(now + windowSize * 1000);

    return {
      allowed: totalRequests < limit,
      remaining,
      resetAt,
      totalRequests,
    };
  }
}

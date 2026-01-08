/**
 * Redis Cache Management Controller
 *
 * Provides endpoints for monitoring and managing Redis cache operations.
 * This controller exposes Redis-specific functionality for administrative purposes.
 */

import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { DI_TOKENS, REDIS_CONTROLLER_MESSAGES, RESPONSE_STATUS } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

@injectable()
export class RedisController {
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  /**
   * Get Redis cache statistics
   *
   * Retrieves comprehensive statistics about Redis cache performance including:
   * - Cache hit rate and request counts
   * - Memory usage and key counts
   * - Server uptime and connection status
   *
   * @openapi
   * /api/cache/stats:
   *   get:
   *     tags: [Cache Management]
   *     summary: Get Redis cache statistics
   *     description: Retrieve comprehensive statistics about Redis cache performance including hit rate, memory usage, and connection status
   *     responses:
   *       200:
   *         description: Cache statistics retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     hitRate:
   *                       type: number
   *                       description: Cache hit rate percentage
   *                       example: 95.5
   *                     totalRequests:
   *                       type: integer
   *                       description: Total cache requests
   *                       example: 1000
   *                     cacheHits:
   *                       type: integer
   *                       description: Number of cache hits
   *                       example: 955
   *                     cacheMisses:
   *                       type: integer
   *                       description: Number of cache misses
   *                       example: 45
   *                     memoryUsage:
   *                       type: string
   *                       description: Memory usage in MB
   *                       example: '1.0 MB'
   *                     keysCount:
   *                       type: integer
   *                       description: Number of keys in cache
   *                       example: 100
   *                     uptimeSeconds:
   *                       type: integer
   *                       description: Server uptime in seconds
   *                       example: 3600
   *                     isConnected:
   *                       type: boolean
   *                       description: Redis connection status
   *                       example: true
   *       500:
   *         description: Error retrieving cache statistics
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async getCacheStats(req: Request, res: Response): Promise<void> {
    try {
      const client = this.redisService.getClient();

      // Get basic cache statistics from Redis
      const keysCount = await client.dbsize();
      const serverInfo = await client.info('server');
      const memoryUsage = await client.info('memory');

      // Parse server uptime from Redis info response
      const uptimeLine = serverInfo
        .split('\r\n')
        .find((line) => line.startsWith('uptime_in_seconds:'));
      const uptime = uptimeLine ? parseInt(uptimeLine.split(':')[1].trim()) : 0;

      // Parse memory usage from Redis info response
      const memoryInfo = memoryUsage.split('\r\n').find((line) => line.startsWith('used_memory:'));
      const memoryUsed = memoryInfo ? memoryInfo.split(':')[1].trim() : '0';

      // Calculate cache statistics (placeholder values for demonstration)
      // In production, these would be tracked using a metrics system
      const hitRate = REDIS_CONTROLLER_MESSAGES.CACHE_STATS_PLACEHOLDER.HIT_RATE;
      const totalRequests = REDIS_CONTROLLER_MESSAGES.CACHE_STATS_PLACEHOLDER.TOTAL_REQUESTS;
      const cacheHits = REDIS_CONTROLLER_MESSAGES.CACHE_STATS_PLACEHOLDER.CACHE_HITS;
      const cacheMisses = REDIS_CONTROLLER_MESSAGES.CACHE_STATS_PLACEHOLDER.CACHE_MISSES;

      // Compile statistics response
      const stats = {
        hitRate,
        totalRequests,
        cacheHits,
        cacheMisses,
        memoryUsage: `${(parseInt(memoryUsed) / 1024 / 1024).toFixed(1)} MB`,
        keysCount,
        uptimeSeconds: uptime,
        isConnected: this.redisService.isConnected(),
      };

      // Return successful response with cache statistics
      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: stats,
      });
    } catch (error) {
      // Log error and return appropriate error response
      this.logger.error(
        `Error getting cache stats: ${error instanceof Error ? error.message : String(error)}`
      );
      res.status(500).json({
        status: RESPONSE_STATUS.ERROR,
        message: REDIS_CONTROLLER_MESSAGES.ERROR_RETRIEVING_CACHE_STATS,
      });
    }
  }

  /**
   * Check if a specific key exists in cache
   *
   * Validates the key parameter and checks Redis for key existence and TTL information.
   * Returns detailed information about the cache key including existence status and time-to-live.
   *
   * @openapi
   * /api/cache/check:
   *   get:
   *     tags: [Cache Management]
   *     summary: Check if key exists in cache
   *     description: Check if a specific key exists in Redis cache and retrieve its TTL information
   *     parameters:
   *       - in: query
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Cache key to check (e.g., 'products:page:1')
   *     responses:
   *       200:
   *         description: Cache key check completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     key:
   *                       type: string
   *                       description: The cache key that was checked
   *                       example: 'products:page:1'
   *                     exists:
   *                       type: boolean
   *                       description: Whether the key exists in cache
   *                       example: true
   *                     ttl:
   *                       type: integer
   *                       nullable: true
   *                       description: Time-to-live in seconds (null if no TTL or key doesn't exist)
   *                       example: 3600
   *       400:
   *         description: Missing or invalid key parameter
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error checking cache key
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async checkCacheKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.query;

      // Validate key parameter - must be provided and must be a string
      if (!key || typeof key !== 'string') {
        res.status(400).json({
          status: RESPONSE_STATUS.ERROR,
          message: REDIS_CONTROLLER_MESSAGES.KEY_PARAMETER_REQUIRED,
        });
        return;
      }

      // Get Redis client and check key existence and TTL
      const client = this.redisService.getClient();
      const exists = await client.exists(key);
      const ttl = await client.ttl(key);

      // Return successful response with key information
      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: {
          key,
          exists: exists === 1,
          ttl: ttl === -1 || ttl === -2 ? null : ttl, // -1 means no TTL, -2 means key doesn't exist
        },
      });
    } catch (error) {
      // Log error and return appropriate error response
      this.logger.error(
        `Error checking cache key: ${error instanceof Error ? error.message : String(error)}`
      );
      res.status(500).json({
        status: RESPONSE_STATUS.ERROR,
        message: REDIS_CONTROLLER_MESSAGES.ERROR_CHECKING_CACHE_KEY,
      });
    }
  }

  /**
   * Invalidate cache by key pattern
   *
   * Removes cache entries matching a specific pattern using Redis KEYS command.
   * Supports wildcard patterns for flexible cache invalidation.
   *
   * @openapi
   * /api/cache/invalidate:
   *   delete:
   *     tags: [Cache Management]
   *     summary: Invalidate cache by pattern
   *     description: Remove cache entries matching a specific pattern (supports wildcards like 'products:*')
   *     parameters:
   *       - in: query
   *         name: pattern
   *         required: true
   *         schema:
   *           type: string
   *         description: Cache key pattern to invalidate (supports wildcards)
   *         example: 'products:*'
   *     responses:
   *       200:
   *         description: Cache invalidation completed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     pattern:
   *                       type: string
   *                       description: The pattern used for invalidation
   *                       example: 'products:*'
   *                     deletedCount:
   *                       type: integer
   *                       description: Number of keys deleted
   *                       example: 5
   *       400:
   *         description: Missing or invalid pattern parameter
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: Error invalidating cache
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async invalidateCache(req: Request, res: Response): Promise<void> {
    try {
      const { pattern } = req.query;

      // Validate pattern parameter - must be provided and must be a string
      if (!pattern || typeof pattern !== 'string') {
        res.status(400).json({
          status: RESPONSE_STATUS.ERROR,
          message: REDIS_CONTROLLER_MESSAGES.PATTERN_PARAMETER_REQUIRED,
        });
        return;
      }

      // Find all keys matching the pattern and delete them
      const keys = await this.redisService.keys(pattern);
      let deletedCount = 0;

      for (const key of keys) {
        await this.redisService.delete(key);
        deletedCount++;
      }

      // Return successful response with deletion count
      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: {
          pattern,
          deletedCount,
        },
      });
    } catch (error) {
      // Log error and return appropriate error response
      this.logger.error(
        `Error invalidating cache: ${error instanceof Error ? error.message : String(error)}`
      );
      res.status(500).json({
        status: RESPONSE_STATUS.ERROR,
        message: REDIS_CONTROLLER_MESSAGES.ERROR_INVALIDATING_CACHE,
      });
    }
  }

  /**
   * Get Redis connection status
   *
   * Checks the current connection status of the Redis service and provides
   * a health check response. This endpoint is useful for monitoring and
   * troubleshooting Redis connectivity issues.
   *
   * @openapi
   * /api/cache/status:
   *   get:
   *     tags: [Cache Management]
   *     summary: Get Redis connection status
   *     description: Check if Redis connection is active and healthy
   *     responses:
   *       200:
   *         description: Redis connection status retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     isConnected:
   *                       type: boolean
   *                       description: Current Redis connection status
   *                       example: true
   *                     message:
   *                       type: string
   *                       description: Human-readable connection status message
   *                       example: 'Redis connection is healthy'
   *       500:
   *         description: Error getting cache status
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  public async getCacheStatus(req: Request, res: Response): Promise<void> {
    try {
      // Check current Redis connection status
      const isConnected = this.redisService.isConnected();

      // Return connection status with appropriate message
      res.json({
        status: RESPONSE_STATUS.SUCCESS,
        data: {
          isConnected,
          message: isConnected ? 'Redis connection is healthy' : 'Redis connection is not active',
        },
      });
    } catch (error) {
      // Log error and return appropriate error response
      this.logger.error(
        `Error getting cache status: ${error instanceof Error ? error.message : String(error)}`
      );
      res.status(500).json({
        status: RESPONSE_STATUS.ERROR,
        message: REDIS_CONTROLLER_MESSAGES.ERROR_GETTING_CACHE_STATUS,
      });
    }
  }
}

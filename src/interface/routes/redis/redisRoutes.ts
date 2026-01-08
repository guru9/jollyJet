/**
 * Redis Cache Management Routes
 *
 * This module defines routes for Redis cache management and monitoring.
 * These endpoints provide administrative access to cache operations.
 */

import { RedisController } from '@/interface/controllers';
import { Router } from 'express';
import { container } from 'tsyringe';

/**
 * Redis Routes Factory
 *
 * Creates and configures the Express router for Redis cache management endpoints.
 *
 * @returns {Router} Configured Express Router
 */
const createRedisRoutes = (): Router => {
  const router = Router();
  const redisController = container.resolve(RedisController);

  /**
   * @openapi
   * tags:
   *   name: Cache Management
   *   description: Redis cache management and monitoring endpoints
   */

  // Cache Statistics
  router.get('/stats', redisController.getCacheStats.bind(redisController));

  // Cache Key Check
  router.get('/check', redisController.checkCacheKey.bind(redisController));

  // Cache Invalidation
  router.delete('/invalidate', redisController.invalidateCache.bind(redisController));

  // Cache Status
  router.get('/status', redisController.getCacheStatus.bind(redisController));

  return router;
};

export default createRedisRoutes;

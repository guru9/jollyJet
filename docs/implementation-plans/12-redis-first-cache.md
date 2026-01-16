# Redis First Cache Implementation

This document provides a comprehensive step-by-step guide for implementing Redis caching functionality in the JollyJet application.

## Overview

Redis will be used as the primary caching layer to improve application performance by reducing database queries and speeding up frequently accessed data.

## Prerequisites

- Node.js and npm installed
- Redis server running locally or accessible via URL
- ioredis package installed (`npm install ioredis`)
- TypeScript configuration set up

## Implementation Steps

### Step 1: Install Dependencies

```bash
npm install ioredis @types/ioredis
```

### Step 2: Environment Configuration

Add Redis URL to your `.env` file:

```env
REDIS_URL=redis://localhost:6379
```

### Step 3: Create Redis Cache Class

Create a robust Redis cache implementation with connection management, error handling, and basic CRUD operations.

```typescript
import Redis from 'ioredis';

export class RedisCache {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    });

    this.redis.on('connect', () => {
      this.isConnected = true;
      console.log('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      console.error('Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.isConnected = false;
      console.log('Redis connection closed');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const serializedValue = JSON.stringify(value);

      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }

      return true;
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking key existence ${key}:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.error('Error clearing Redis cache:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
    this.isConnected = false;
  }

  isConnectionActive(): boolean {
    return this.isConnected;
  }

  async ping(): Promise<string | null> {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }

      return await this.redis.ping();
    } catch (error) {
      console.error('Error pinging Redis:', error);
      return null;
    }
  }
}

export const redisCache = new RedisCache(process.env.REDIS_URL || 'redis://localhost:6379');
```

### Step 4: Create Cache Interface

Define a cache interface for better type safety and potential future implementations:

```typescript
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean>;
  del(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnectionActive(): boolean;
  ping(): Promise<string | null>;
}
```

Update the RedisCache class to implement this interface:

```typescript
export class RedisCache implements ICache {
  // ... existing implementation
}
```

### Step 5: Create Cache Middleware

Implement Express middleware for automatic caching:

```typescript
import { Request, Response, NextFunction } from 'express';
import { redisCache } from './redis';

export interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  skipCache?: (req: Request) => boolean;
}

export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // 5 minutes default
    keyGenerator = (req) => `cache:${req.method}:${req.originalUrl}`,
    skipCache = () => false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (skipCache(req)) {
      return next();
    }

    const cacheKey = keyGenerator(req);

    try {
      const cachedResponse = await redisCache.get(cacheKey);

      if (cachedResponse) {
        return res.json(cachedResponse);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (data: any) {
        redisCache.set(cacheKey, data, ttl);
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};
```

### Step 6: Create Cache Service

Implement a service layer for cache management:

```typescript
import { redisCache } from './redis';

export class CacheService {
  private static instance: CacheService;

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async getUserProfile(userId: string): Promise<any | null> {
    return await redisCache.get(`user:profile:${userId}`);
  }

  async setUserProfile(userId: string, profile: any, ttl = 3600): Promise<boolean> {
    return await redisCache.set(`user:profile:${userId}`, profile, ttl);
  }

  async getSessionData(sessionId: string): Promise<any | null> {
    return await redisCache.get(`session:${sessionId}`);
  }

  async setSessionData(sessionId: string, data: any, ttl = 1800): Promise<boolean> {
    return await redisCache.set(`session:${sessionId}`, data, ttl);
  }

  async getApiData(endpoint: string, params: string = ''): Promise<any | null> {
    const key = `api:${endpoint}:${params}`;
    return await redisCache.get(key);
  }

  async setApiData(endpoint: string, params: string, data: any, ttl = 300): Promise<boolean> {
    const key = `api:${endpoint}:${params}`;
    return await redisCache.set(key, data, ttl);
  }

  async invalidateUserCache(userId: string): Promise<boolean> {
    const patterns = [
      `user:profile:${userId}`,
      `user:preferences:${userId}`,
      `user:settings:${userId}`,
    ];

    const results = await Promise.all(patterns.map((pattern) => redisCache.del(pattern)));

    return results.every((result) => result);
  }

  async getCacheStats(): Promise<{ active: boolean; ping: string | null }> {
    return {
      active: redisCache.isConnectionActive(),
      ping: await redisCache.ping(),
    };
  }
}
```

### Step 7: Create Redis Routes

Add REST endpoints for cache management:

```typescript
import { Router } from 'express';
import { CacheService } from '../cache/cacheService';
import { redisCache } from '../redis/redis';

const router = Router();
const cacheService = CacheService.getInstance();

// Get cache statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await cacheService.getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
});

// Clear all cache
router.delete('/clear', async (req, res) => {
  try {
    const success = await redisCache.clear();
    res.json({ success, message: success ? 'Cache cleared' : 'Failed to clear cache' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

// Get specific cache key
router.get('/:key', async (req, res) => {
  try {
    const value = await redisCache.get(req.params.key);
    res.json({ value, exists: value !== null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get cache key' });
  }
});

// Delete specific cache key
router.delete('/:key', async (req, res) => {
  try {
    const success = await redisCache.del(req.params.key);
    res.json({ success, message: success ? 'Key deleted' : 'Key not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete cache key' });
  }
});

export default router;
```

### Step 8: Integration with Application

Update the main application file to include Redis routes and middleware:

```typescript
import redisRoutes from './interface/routes/redis/redisRoutes';
import { cacheMiddleware } from './interface/middlewares/redisCacheHandler';

// Add Redis routes
app.use('/api/cache', redisRoutes);

// Apply caching to specific routes
app.use('/api/public', cacheMiddleware({ ttl: 600 })); // 10 minutes
app.use(
  '/api/user/profile',
  cacheMiddleware({
    ttl: 300,
    keyGenerator: (req) => `user:profile:${req.user?.id}`,
  })
);
```

### Step 9: Error Handling and Monitoring

Add proper error handling and monitoring:

```typescript
export const cacheErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.message.includes('Redis')) {
    console.error('Redis Error:', error);
    // Continue without cache rather than failing the request
    next();
  } else {
    next(error);
  }
};

// Add health check endpoint
router.get('/health', async (req, res) => {
  try {
    const ping = await redisCache.ping();
    const isActive = redisCache.isConnectionActive();

    res.json({
      status: isActive ? 'healthy' : 'unhealthy',
      redis: ping,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
```

### Step 10: Testing

Create comprehensive tests for the Redis implementation:

```typescript
import { RedisCache } from '../src/infrastructure/database/redis';

describe('Redis Cache Tests', () => {
  let cache: RedisCache;

  beforeAll(async () => {
    cache = new RedisCache('redis://localhost:6379');
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  describe('Basic Operations', () => {
    it('should set and get values', async () => {
      await expect(cache.set('test-key', { data: 'test' })).resolves.toBe(true);
      await expect(cache.get('test-key')).resolves.toEqual({ data: 'test' });
    });

    it('should handle TTL', async () => {
      await expect(cache.set('ttl-key', 'value', 1)).resolves.toBe(true);
      await expect(cache.get('ttl-key')).resolves.toBe('value');

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 1100));
      await expect(cache.get('ttl-key')).resolves.toBeNull();
    });

    it('should check key existence', async () => {
      await cache.set('exists-key', 'value');
      await expect(cache.exists('exists-key')).resolves.toBe(true);
      await expect(cache.exists('non-existent')).resolves.toBe(false);
    });

    it('should delete keys', async () => {
      await cache.set('delete-key', 'value');
      await expect(cache.del('delete-key')).resolves.toBe(true);
      await expect(cache.exists('delete-key')).resolves.toBe(false);
    });
  });

  describe('Connection Management', () => {
    it('should ping Redis', async () => {
      const result = await cache.ping();
      expect(result).toBe('PONG');
    });

    it('should track connection status', () => {
      expect(cache.isConnectionActive()).toBe(true);
    });
  });
});
```

## Best Practices

### Key Naming Conventions

- Use colons (`:`) as separators: `user:profile:123`
- Include resource type and ID: `session:abc123`, `api:users:page=1`
- Use consistent prefixes: `cache:`, `temp:`, `perm:`

### TTL Strategies

- Short TTL for volatile data (5-15 minutes)
- Medium TTL for user sessions (30 minutes - 2 hours)
- Long TTL for static data (hours to days)
- Use `setex` for atomic set-with-expiration operations

### Error Handling

- Always wrap Redis operations in try-catch blocks
- Gracefully degrade when Redis is unavailable
- Log errors but don't fail the entire request

### Performance Considerations

- Use pipelining for multiple operations
- Consider connection pooling for high-traffic applications
- Monitor memory usage and set appropriate eviction policies

## Security Considerations

- Use TLS/SSL for Redis connections in production
- Implement proper authentication (Redis AUTH)
- Sanitize cache keys to prevent injection attacks
- Use separate Redis databases for different environments

## Monitoring and Maintenance

- Monitor Redis memory usage and hit rates
- Set up alerts for connection failures
- Regular cleanup of expired keys
- Backup critical Redis data if needed

## Deployment

1. Configure Redis instance in production
2. Update environment variables
3. Set up proper monitoring
4. Configure connection pooling if needed
5. Test failover scenarios

This implementation provides a solid foundation for Redis caching in the JollyJet application with proper error handling, monitoring, and extensibility.

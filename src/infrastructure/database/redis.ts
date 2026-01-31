import config from '@/config';
import { CACHE_LOG_MESSAGES } from '@/shared/constants';
import { logger } from '@/shared/logger';
import Redis, { RedisOptions } from 'ioredis';

class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    const protocol = config.redisConfig.tls ? 'rediss' : 'redis';
    const auth = config.redisConfig.password ? `:${config.redisConfig.password}@` : '';
    const uri = `${protocol}://${auth}${config.redisConfig.host}:${config.redisConfig.port}/${config.redisConfig.db}`;

    if (config.env === 'development') {
      logger.info(
        `Constructed Redis URI for host: ${config.redisConfig.host} (TLS: ${config.redisConfig.tls})`
      );
    }

    // Default options
    const options: RedisOptions = {
      lazyConnect: true,
      retryStrategy: (times: number) => {
        // Limit retry attempts in development
        if (config.env === 'development' && times >= 5) {
          logger.warn(CACHE_LOG_MESSAGES.CONNECTION_RETRY_LIMIT);
          return undefined;
        }
        return Math.min(times * 100, 3000);
      },
    };

    // If we have a URI, use it. If not (and no host), it will likely fail defaults.
    if (uri) {
      this.client = new Redis(uri, options);
    } else {
      // Fallback to internal defaults (localhost) if everything is missing
      this.client = new Redis(options);
    }

    this.setupEventHandlers();
  }

  // Get Instance Method (Singleton Pattern)
  public static getInstance(): RedisConnection {
    if (!this.instance) {
      this.instance = new RedisConnection();
    }
    return this.instance;
  }

  // Setup event handlers for Redis client
  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info(CACHE_LOG_MESSAGES.CONNECTION_SUCCESS);
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      logger.error(CACHE_LOG_MESSAGES.CONNECTION_ERROR(err.message));
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn(CACHE_LOG_MESSAGES.CONNECTION_CLOSED);
    });
  }

  // Connect to Redis
  public async connect(): Promise<void> {
    // Guard clause: If Redis is disabled, don't attempt connection
    if (config.redisConfig.disabled) {
      logger.warn(CACHE_LOG_MESSAGES.CONNECTION_DISABLED);
      return;
    }

    // Guard clause: If already connected, don't connect again
    if (this.isConnected) {
      return; // Exit early
    }

    try {
      await this.client.connect();
    } catch (error) {
      const err = error as Error;
      logger.error({ err: error }, CACHE_LOG_MESSAGES.CONNECTION_ERROR(err.message));
      throw error;
    }
  }

  // Disconnect from Redis
  public async disconnect(): Promise<void> {
    // Guard clause: If Redis is disabled, nothing to disconnect
    if (config.redisConfig.disabled) {
      logger.warn(CACHE_LOG_MESSAGES.DISCONNECT_DISABLED);
      return;
    }

    // Guard clause: If not connected, nothing to disconnect
    if (!this.isConnected) {
      return; // Exit early
    }

    try {
      await this.client.quit();
      this.isConnected = false; // Update our status
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.info({ err: error }, CACHE_LOG_MESSAGES.CONNECTION_CLOSE_ERROR(err.message));
      throw error;
    }
  }

  // Get Redis client
  public getClient(): Redis {
    return this.client;
  }

  // Get Connection Status
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default RedisConnection.getInstance();

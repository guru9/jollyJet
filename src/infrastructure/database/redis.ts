import { logger } from '@/shared';
import { CACHE_LOG_MESSAGES, REDIS_CONFIG } from '@/shared/constants';
import Redis from 'ioredis';

class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Redis({
      host: REDIS_CONFIG.HOST as string,
      port: REDIS_CONFIG.PORT as number,
      password: REDIS_CONFIG.PASSWORD as string,
      db: REDIS_CONFIG.DB as number,
      lazyConnect: true,
      retryStrategy: (times) => {
        // Limit retry attempts to 3 in development to reduce log noise
        if (process.env.NODE_ENV === 'development' && times >= 3) {
          logger.warn(CACHE_LOG_MESSAGES.CONNECTION_RETRY_LIMIT);
          return undefined; // Stop retrying
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
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
      logger.error(CACHE_LOG_MESSAGES.CONNECTION_ERROR.replace('{error}', err.message));
    });

    this.client.on('close', () => {
      this.isConnected = false;
      logger.warn(CACHE_LOG_MESSAGES.CONNECTION_CLOSED);
    });
  }

  // Connect to Redis
  public async connect(): Promise<void> {
    // Guard clause: If already connected, don't connect again
    if (this.isConnected) {
      return; // Exit early
    }

    try {
      await this.client.connect();
    } catch (error) {
      const err = error as Error;
      logger.error(
        { err: error },
        CACHE_LOG_MESSAGES.CONNECTION_ERROR.replace('{error}', err.message)
      );
      throw error;
    }
  }

  // Disconnect from Redis
  public async disconnect(): Promise<void> {
    // Guard clause: If not connected, nothing to disconnect
    if (!this.isConnected) {
      return; // Exit early
    }

    try {
      await this.client.quit();
      this.isConnected = false; // Update our status
    } catch (error) {
      logger.info({ err: error }, CACHE_LOG_MESSAGES.CONNECTION_CLOSE_ERROR);
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

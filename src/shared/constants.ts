/**
 * ============================================
 * 1) COMMON CONFIGURATION
 * ============================================
 */

/**
 * Application-wide constants for pagination and general configuration.
 */
export const APP_CONSTANTS = {
  MAX_PAGE_SIZE: 100,
};

/**
 * Standard HTTP status codes used throughout the application for consistent API responses.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  TOO_MANY_REQUESTS: 429,
} as const;

/**
 * Standardized response status strings for API responses.
 */
export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * Standardized error messages for consistent error responses.
 */
export const ERROR_STATUS = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database operation failed',
  INVALID_OBJECT_ID: 'Invalid ObjectId',
} as const;

/**
 * ============================================
 * 2) DATABASE CONFIGURATION
 * ============================================
 */

/**
 * MongoDB configuration constants for connection management.
 * Mirrors the structure pattern from REDIS_CONFIG for consistency.
 */
export const MONGODB_CONFIG = {
  // Connection
  HOST: process.env.MONGODB_HOST || 'localhost',
  PORT: parseInt(process.env.MONGODB_PORT || '27017', 10),
  USERNAME: process.env.MONGODB_USERNAME || '',
  PASSWORD: process.env.MONGODB_PASSWORD || '',
  DATABASE: process.env.MONGODB_DATABASE || 'jollyjet',
  URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/jollyjet',
  DISABLED: process.env.MONGODB_DISABLED === 'true',
  AUTH_SOURCE: process.env.MONGODB_AUTH_SOURCE || 'admin',
  AUTH_MECHANISM: process.env.MONGODB_AUTH_MECHANISM || '',
  SSL: process.env.MONGODB_SSL === 'true',
  REPLICA_SET: process.env.MONGODB_REPLICA_SET || '',
  SRV: process.env.MONGODB_SRV === 'true',

  // Connection Pooling
  MAX_POOL_SIZE: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10', 10),
  MIN_POOL_SIZE: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '2', 10),

  // Timeouts (ms)
  CONNECTION_TIMEOUT: parseInt(process.env.MONGODB_CONNECTION_TIMEOUT || '10000', 10),
  SOCKET_TIMEOUT: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000', 10),
  SERVER_SELECTION_TIMEOUT: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000', 10),

  // Retry Settings
  RETRY_ATTEMPTS: parseInt(process.env.MONGODB_RETRY_ATTEMPTS || '3', 10),
  RETRY_DELAY: parseInt(process.env.MONGODB_RETRY_DELAY || '1000', 10),
} as const;

/**
 * MongoDB connection and operation log messages.
 */
export const MONGODB_LOG_MESSAGES = {
  CONNECTION_SUCCESS: 'MongoDB connected successfully.',
  CONNECTION_FAILED: 'MongoDB connection failed. Server cannot start without database.',
  CONNECTION_ERROR: (error: string) => `MongoDB connection error: ${error}`,
  CONNECTION_DISABLED: 'MongoDB is disabled in configuration. Skipping connection.',
  DISCONNECT_SUCCESS: 'MongoDB disconnected successfully.',
  DISCONNECT_ERROR: (error: string) => `Error closing MongoDB connection: ${error}`,
  ALREADY_CONNECTED: 'MongoDB already connected.',
  SERVER_SHUTDOWN_ERROR: (error: string) => `Error during MongoDB shutdown: ${error}`,
} as const;

/**
 * ============================================
 * 3) REDIS CONFIGURATION
 * ============================================
 */

/**
 * Redis configuration constants for connection management.
 */
export const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: process.env.REDIS_PORT || 6379,
  PASSWORD: process.env.REDIS_PASSWORD || '',
  DB: process.env.REDIS_DB || 0,
  DISABLED: process.env.REDIS_DISABLED === 'true',
  TLS: process.env.REDIS_TLS === 'true',
  EXPIRE_TIME: process.env.REDIS_EXPIRE_TIME || 60 * 60 * 24,
  MAX_RETRIES: process.env.REDIS_MAX_RETRIES || 5,
  RETRY_DELAY: process.env.REDIS_RETRY_DELAY || 1000,
  TTL: {
    DEFAULT: process.env.REDIS_TTL_DEFAULT || 60 * 60 * 24,
    SHORT: process.env.REDIS_TTL_SHORT || 60 * 60,
    LONG: process.env.REDIS_TTL_LONG || 60 * 60 * 24 * 7,
    NEVER: process.env.REDIS_TTL_NEVER || 0,
    SESSION: process.env.REDIS_TTL_SESSION || 60 * 60 * 24,
    TEMPORARY: process.env.REDIS_TTL_TEMPORARY || 60 * 60 * 24,
    PERMANENT: process.env.REDIS_TTL_PERMANENT || 60 * 60 * 24 * 365,
    MAX: process.env.REDIS_TTL_MAX || 60 * 60 * 24 * 365,
    MIN: process.env.REDIS_TTL_MIN || 60 * 60 * 24,
    RATE_LIMIT: process.env.REDIS_TTL_RATE_LIMIT || 60 * 60 * 24,
    PRODUCT: process.env.REDIS_TTL_PRODUCT || 60 * 60 * 24,
    USER: process.env.REDIS_TTL_USER || 60 * 60 * 24,
  },
  RATE_LIMIT: {
    WINDOW: process.env.REDIS_RATE_LIMIT_WINDOW || 60 * 60 * 24,
    LIMIT: process.env.REDIS_RATE_LIMIT_LIMIT || 100,
    MAX_REQUESTS: process.env.REDIS_RATE_LIMIT_MAX_REQUESTS || 100,
    MAX_RETRIES: process.env.REDIS_RATE_LIMIT_MAX_RETRIES || 5,
  },
  CONSISTENCY: {
    CHECK_INTERVAL: process.env.REDIS_CONSISTENCY_CHECK_INTERVAL || 60 * 60 * 24,
    SAMPLE_SIZE: process.env.REDIS_CONSISTENCY_SAMPLE_SIZE || 10,
    STALE_THRESHOLD: process.env.REDIS_CONSISTENCY_STALE_THRESHOLD || 60 * 60 * 24,
  },
} as const;

/**
 * Redis connection and cache log messages.
 */
export const CACHE_LOG_MESSAGES = {
  CONNECTION_SUCCESS: 'Redis connected successfully.',
  CONNECTION_ERROR: (error: string) => `Failed to connect to Redis: ${error}`,
  CONNECTION_CLOSED: 'Redis connection has been closed',
  CONNECTION_WARNING: (operation: string) => `Redis not connected, ${operation} skipped`,
  CONNECTION_RETRY_LIMIT:
    'Redis connection attempts exhausted after 3 retries. No further retries in development mode.',
  CONNECTION_CLOSE_ERROR: (error: string) =>
    `Error occurred while closing Redis connection: ${error}`,
  CONNECTION_DISABLED: 'Redis is disabled in configuration. Skipping connection.',
  DISCONNECT_DISABLED: 'Redis is disabled. Skipping disconnection.',
  CACHE_INVALIDATED: (target: string) => `${target} cache invalidated successfully`,
  CACHE_HIT: (key: string) => `Cache hit for key: ${key}`,
  CACHE_MISS: (key: string, source: string) =>
    `Cache miss for key: ${key}, fetching from ${source}`,
  CACHE_SET: (key: string, ttl: number) => `Cache set for key: ${key} with TTL: ${ttl}`,
  CACHE_DELETE: (key: string) => `Cache deleted for key: ${key}`,
  CACHE_FLUSH: 'Cache flushed successfully',
  CACHE_KEYS: (pattern: string, count: number) =>
    `Found ${count} keys matching pattern: ${pattern}`,
  DATA_CACHED_SUCCESSFULLY: (key: string, ttl: number) =>
    `Data cached successfully for key: ${key}, ttl: ${ttl}`,
  STALE_CACHE_DETECTED: (key: string, ttl: number) =>
    `Stale cache detected for key: ${key}, TTL: ${ttl}`,
  CACHE_REFRESHED: (key: string) => `Cache refreshed for key: ${key}`,
  CONSISTENCY_CHECK_FAILED: (key: string) => `Consistency check failed for key: ${key}`,
  CONSISTENCY_CHECK_SUCCESS: (key: string) => `Consistency check passed for key: ${key}`,
  STAMPEDE_PROTECTION_ACTIVE: (key: string) => `Stampede protection active for key: ${key}`,
  BACKGROUND_REFRESH_STARTED: (key: string) => `Background refresh started for key: ${key}`,
  BACKGROUND_REFRESH_COMPLETED: (key: string) => `Background refresh completed for key: ${key}`,
  CACHE_OPERATION_FAILED: (operation: string, key: string, error: string) =>
    `Cache operation ${operation} failed for key: ${key}, error: ${error}`,
  CACHE_GET_FAILED: (key: string, error: string) =>
    `Cache get failed for key: ${key}, error: ${error}`,
  CACHE_SET_FAILED: (key: string, error: string) =>
    `Cache set failed for key: ${key}, error: ${error}`,
  CACHE_DELETE_FAILED: (key: string, error: string) =>
    `Cache delete failed for key: ${key}, error: ${error}`,
  CACHE_PATTERN_DELETE_FAILED: (pattern: string, error: string) =>
    `Cache pattern delete failed for pattern: ${pattern}, error: ${error}`,
  LOCK_ACQUISITION_FAILED: (key: string) => `Lock acquisition failed for key: ${key}`,
  METRICS_COLLECTION_FAILED: (error: string) => `Metrics collection failed: ${error}`,
  BATCH_OPERATION_FAILED: 'Batch operation failed, falling back to individual operations',
  CACHE_HIT_RATE: (hitRate: string, total: string) =>
    `Cache hit rate: ${hitRate}%, total operations: ${total}`,
  LOW_HIT_RATE_WARNING: (hitRate: string) =>
    `Low cache hit rate detected: ${hitRate}%, consider adjusting TTL or cache strategy`,
  MEMORY_USAGE: (memory: string) => `Redis memory usage: ${memory} bytes`,
  RATE_LIMIT_EXCEEDED: (key: string) => `Rate limit exceeded for key: ${key}`,
  RATE_LIMIT_CHECK_FAILED: (key: string, error: string) =>
    `Rate limit check failed for key: ${key}, error: ${error}`,
  CONSISTENCY_MONITORING_INIT: (interval: string, sampleSize: string, staleThreshold: string) =>
    `Consistency monitoring initialized with interval: ${interval}, sampleSize: ${sampleSize}, staleThreshold: ${staleThreshold}`,
  CACHE_HIT_TRACKED: 'Cache hit tracked',
  CACHE_MISS_TRACKED: 'Cache miss tracked',
  STALE_READ_DETECTED: 'Stale read detected during consistency check',
  CONSISTENCY_ERROR_DETECTED: 'Consistency error detected during check',
  CONSISTENCY_CHECK_STARTED: 'Consistency check started',
  NO_CACHE_ENTRIES_FOUND: 'No cache entries found',
  FETCH_FUNCTION_FAILED: (key: string, error: string) =>
    `Fetch function failed for key: ${key}, error: ${error}`,
  METRICS_RESET: 'Metrics reset successfully',
  SERVICE_CLEANUP_COMPLETED: 'Service cleanup completed',
  PRODUCT_UPDATE_INITIATED: (productId: string, fields: string) =>
    `Product update initiated for ${productId}, fields: ${fields}`,
  PRODUCT_UPDATE_SUCCESS: (productId: string, fields: string) =>
    `Product updated successfully for ${productId}, fields: ${fields}`,
  PRODUCT_UPDATE_FAILED: (productId: string, error: string) =>
    `Product update failed for ${productId}: ${error}`,
  PRODUCT_NOT_FOUND_UPDATE: (productId: string) => `Product not found for update: ${productId}`,
  PRODUCT_DELETION_INITIATED: (productId: string) => `Product deletion initiated for ${productId}`,
  PRODUCT_DELETION_SUCCESS: (productId: string) => `Product deleted successfully for ${productId}`,
  PRODUCT_DELETION_FAILED: (productId: string, error: string) =>
    `Product deletion failed for ${productId}: ${error}`,
  PRODUCT_DELETION_NOT_FOUND: (productId: string) =>
    `Product deletion failed - product not found: ${productId}`,
  PRODUCT_CACHE_INVALIDATED: (productId: string) =>
    `Product cache invalidated after operation for ${productId}`,
  PRODUCT_CACHE_INVALIDATION_FAILED: (productId: string, error: string) =>
    `Failed to invalidate product cache for ${productId}: ${error}`,
  LIST_PRODUCTS_QUERY: 'ListProductsUseCase query executed',
} as const;

/**
 * ============================================
 * 4) SERVER CONFIGURATION
 * ============================================
 */

/**
 * Server startup, shutdown, and operational log messages.
 */
export const SERVER_LOG_MESSAGES = {
  STARTUP: 'Starting JollyJet E-commerce API Server...',
  SERVICES_REQUIRED: 'Required Services: MongoDB + Redis (Redis-First Caching Strategy)',
  ESTABLISHING_MONGODB: 'Establishing MongoDB connection...',
  ESTABLISHING_REDIS: 'Establishing Redis connection...',
  CONNECTION_SUCCESS_MONGODB: 'MongoDB connected successfully.',
  CONNECTION_SUCCESS_REDIS: 'Redis connected successfully.',
  CONNECTION_FAILED_MONGODB: 'MongoDB connection failed - Server startup halted',
  CONNECTION_FAILED_REDIS: 'Redis connection failed - Server startup halted',
  LISTENING: (port: number) => `Server listening on port ${port}`,
  SERVICES_READY: 'All services connected successfully - Server is ready to handle requests.',
  STATUS_READY: 'Server Status: PRODUCTION READY',
  API_DOCS: (port: number) => `API Documentation: http://localhost:${port}/api-docs`,
  HEALTH_CHECK: (port: number) => `Health Check: http://localhost:${port}/health`,
  CACHE_STRATEGY: 'Cache Strategy: Redis-First with MongoDB Fallback',
  SECURITY_ENABLED: 'All security features enabled',
  READY_PRODUCTION: 'Production Ready: Redis-First Caching Enabled',
  SHUTDOWN_START: 'Server shutting down gracefully...',
  SHUTDOWN_RECEIVE: (signal: string) => `${signal} signal received. Closing gracefully...`,
  SHUTDOWN_ERROR: (error: string) => `Error during shutdown: ${error}`,
  STARTUP_ERROR: 'Failed to start server',
  UNCAUGHT_EXCEPTION: 'Uncaught Exception detected:',
  UNHANDLED_REJECTION: 'Unhandled Rejection detected:',
  DI_INITIALIZED: 'DI container initialized successfully',
} as const;

/**
 * ============================================
 * 5) DI-CONTAINER CONFIGURATION
 * ============================================
 */

/**
 * Dependency Injection container tokens for loose coupling between application layers.
 * These string tokens are used to register and resolve dependencies in the DI container.
 *
 * Token Categories:
 * - Repositories: Data access layer tokens
 * - Services: Business logic and infrastructure services
 * - Pub/Sub: Event-driven messaging services and handlers
 * - Controllers: HTTP request handlers
 *
 * Usage:
 * ```typescript
 * // Register a service
 * container.registerSingleton(DI_TOKENS.PUBLISHER_SERVICE, PublisherService);
 *
 * // Resolve a service
 * const publisher = container.resolve<IPublisherService>(DI_TOKENS.PUBLISHER_SERVICE);
 * ```
 *
 * @see di-container.ts
 */
export const DI_TOKENS = {
  // Repositories
  PRODUCT_REPOSITORY: 'ProductRepository',

  // Core Services
  LOGGER: 'Logger',
  REDIS_SERVICE: 'RedisService',
  CACHE_SERVICE: 'CacheService',
  SESSION_SERVICE: 'SessionService',
  RATE_LIMIT_SERVICE: 'RateLimitingService',
  CORS_SECURITY_SERVICE: 'CorsSecurityService',

  // Pub/Sub Services
  /**
   * Token for IPublisherService implementation.
   * Used to publish events to Redis Pub/Sub channels.
   */
  PUBLISHER_SERVICE: 'PublisherService',

  /**
   * Token for ISubscriberService implementation.
   * Used to subscribe to Redis Pub/Sub channels.
   */
  SUBSCRIBER_SERVICE: 'SubscriberService',

  // Pub/Sub Event Handlers
  /**
   * Token for ProductCreatedHandler.
   * Handles PRODUCT_CREATED events.
   */
  PRODUCT_CREATED_HANDLER: 'ProductCreatedHandler',

  /**
   * Token for ProductUpdatedHandler.
   * Handles PRODUCT_UPDATED events.
   */
  PRODUCT_UPDATED_HANDLER: 'ProductUpdatedHandler',

  /**
   * Token for ProductDeletedHandler.
   * Handles PRODUCT_DELETED events.
   */
  PRODUCT_DELETED_HANDLER: 'ProductDeletedHandler',

  /**
   * Token for AuditEventHandler.
   * Handles USER_ACTIVITY events for audit logging.
   */
  AUDIT_EVENT_HANDLER: 'AuditEventHandler',

  // Controllers
  HEALTH_CONTROLLER: 'HealthController',
} as const;

/**
 * ============================================
 * 6) PRODUCT CONFIGURATION
 * ============================================
 */

/**
 * Success messages for product-related operations to provide consistent user feedback.
 */
export const PRODUCT_SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_RETRIEVED: 'Product retrieved successfully',
  PRODUCTS_RETRIEVED: 'Products retrieved successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  PRODUCTS_COUNT_RETRIEVED: 'Products count retrieved successfully',
  WISHLIST_TOGGLED: 'Product wishlist status updated successfully',
  WISHLIST_RETRIEVED: 'Wishlist products retrieved successfully',
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
} as const;

/**
 * Error messages for product-related operations to provide consistent error responses.
 */
export const PRODUCT_ERROR_MESSAGES = {
  NOT_AVAILABLE: 'Product is not available.',
  NOT_FOUND: 'Product not found.',
  PRODUCT_NOT_FOUND_UPDATE: 'Product not found for update.',
  PRODUCT_ID_REQ_RETRIEVE: 'Product ID is required for retrieval.',
  PRODUCT_ID_REQ_UPDATE: 'Product ID is required for update.',
  PRODUCT_ID_REQ_DELETE: 'Product ID is required for deletion.',
  PRODUCT_ID_REQ_WISHLIST: 'Product ID is required for wishlist toggle.',
  PRODUCT_ID_INVALID: 'Invalid product ID format.',
  PRODUCT_NOT_FOUND_BY_ID: 'Product with specified ID does not exist.',
  MONGODB_DISCONNECTED_FIND_ALL: 'MongoDB not connected, returning empty product list',
  MONGODB_DISCONNECTED_COUNT: 'MongoDB not connected, returning 0 product count',
} as const;

/**
 * Validation error messages for product fields to ensure consistent validation messages.
 */
export const PRODUCT_VALIDATION_MESSAGES = {
  NAME_MIN_LENGTH: 'Name must be at least 3 characters long',
  NAME_MAX_LENGTH: 'Name must be at most 30 characters long',
  DESCRIPTION_MIN_LENGTH: 'Description must be at least 10 characters long',
  PRICE_MIN: 'Price must be a non-negative number',
  STOCK_MIN: 'Stock must be a non-negative number',
  CATEGORY_REQUIRED: 'Category is required',
  PRODUCT_ID_REQUIRED: 'Product ID is required',
  PRICE_RANGE_INVALID:
    'Price range must be valid JSON with min and max as non-negative numbers, min <= max',
  PAGE_INVALID: 'Page must be a positive integer',
  LIMIT_INVALID: 'Limit must be a positive integer between 1 and 100',
  PRODUCT_NAME_REQUIRED: 'Product name is required.',
  PRODUCT_DESCRIPTION_REQUIRED: 'Product description is required.',
  PRODUCT_PRICE_INVALID: 'Product price must be a non-negative number.',
  PRODUCT_STOCK_INVALID: 'Product stock must be a non-negative number.',
  PRODUCT_CATEGORY_REQUIRED: 'Product category is required.',
  WISHLIST_COUNT_INVALID: 'wishlistCount must be a non-negative number if provided.',
  INSUFFICIENT_STOCK: 'Insufficient stock.',
  PRICE_NEGATIVE: 'Price cannot be negative.',
  INVALID_STOCK_UPDATE: 'Invalid product data for stock update',
  INVALID_PRICE_UPDATE: 'Invalid product data for price update',
  INVALID_DETAILS_UPDATE: 'Invalid product data for details update',
  INVALID_WISHLIST_UPDATE: 'Invalid product data for wishlist update',
} as const;

/**
 * Product-specific constants defining validation rules, limits, and default values.
 */
export const PRODUCT_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 1000000,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 10,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_STOCK: 0,
  MAX_STOCK: 10000,
  MIN_PAGE_SIZE: 1,
  MAX_PAGE_SIZE: 100,
  MAX_WISHLIST_COUNT: 50,
  MAX_WISHLIST_COUNT_PER_USER: 10,
  MAX_PRODUCTS_PER_USER: 100,
  DEFAULT_CATEGORY: 'uncategorized',
  DEFAULT_ACTIVE_STATUS: true,
  DEFAULT_WISHLIST_STATUS: false,
} as const;

/**
 * ============================================
 * 7) CACHE KEY PATTERNS
 * ============================================
 */

/**
 * Structured cache key patterns for consistent key generation across the application.
 */
export const CACHE_KEYS_PATTERNS = {
  PRODUCT_SINGLE: (id: string) => `product:${id}`,
  PRODUCT_LIST: (query: string) => `products:${query}`,
  PRODUCT_COUNT: (query: string) => `products:count:${query}`,
  USER_SESSION: (userId: string) => `session:${userId}`,
  SESSION: 'session',
  RATE_LIMIT: (ip: string) => `rate_limit:${ip}`,
  HEALTH_STATUS: 'health:status',
  CONSISTENCY_LOCK: 'consistency:lock',
} as const;

/**
 * Cache operations for monitoring and metrics collection.
 */
export const CACHE_OPERATIONS = {
  CACHE_MIDDLEWARE: 'cache-middleware',
  CACHE_GET: 'cache-get',
  CACHE_SET: 'cache-set',
  CACHE_DELETE: 'cache-delete',
  CACHE_FLUSH: 'cache-flush',
  CONSISTENCY_CHECK: 'consistency-check',
  BACKGROUND_REFRESH: 'background-refresh',
  GET: 'get',
  SET: 'set',
  DEL: 'delete',
  KEYS: 'keys',
  INCREMENT: 'increment',
  CONSISTENCY_LOCK: 'consistency-lock',
  ACQUIRE_LOCK: 'acquire-lock',
  RELEASE_LOCK: 'release-lock',
  RATE_LIMIT_MIDDLEWARE: 'rate-limit-middleware',
} as const;

/**
 * ============================================
 * 8) SECURITY AND RATE LIMIT CONFIGURATION
 * ============================================
 */

export const CORS_SECURITY = {
  HEADERS: {
    X_FRAME_OPTIONS: 'SAMEORIGIN',
    X_CONTENT_TYPE_OPTIONS: 'nosniff',
    X_XSS_PROTECTION: '1; mode=block',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    PERMISSIONS_POLICY: 'geolocation=(), microphone=(), camera=()',
  },
  MESSAGES: {
    IP_BLOCKED: 'Access denied: IP blocked',
    GEO_BLOCKED: 'Access denied: Location blocked',
    IP_INVALID_FORMAT: 'IP address format is invalid',
    IP_VALIDATION_FAILED: 'IP validation failed',
    GEO_CHECK_FAILED: 'Geographic restriction check failed',
    SECURITY_HEADERS_APPLIED: 'Legacy security headers applied',
    SECURITY_HEADERS_FAILED: 'Failed to apply legacy security headers',
  },
  DEPRECATION: {
    APPLY_SECURITY_HEADERS:
      'applySecurityHeaders method is deprecated. Security headers are now handled by Helmet middleware.',
    VERSION: '1.0.0',
    ALTERNATIVE: 'Helmet middleware',
  },
} as const;

export const RATE_LIMIT_HEADERS = {
  LIMIT: 'X-RateLimit-Limit',
  REMAINING: 'X-RateLimit-Remaining',
  RESET: 'X-RateLimit-Reset',
} as const;

export const RATE_LIMIT_MESSAGES = {
  UNKNOWN_CLIENT: 'unknown',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later.',
} as const;

export const REDIS_CONTROLLER_MESSAGES = {
  CACHE_STATS_PLACEHOLDER: {
    HIT_RATE: 95.5,
    TOTAL_REQUESTS: 1000,
    CACHE_HITS: 955,
    CACHE_MISSES: 45,
  },
  ERROR_RETRIEVING_CACHE_STATS: 'Error retrieving cache statistics',
  KEY_PARAMETER_REQUIRED: 'Key parameter is required',
  ERROR_CHECKING_CACHE_KEY: 'Error checking cache key',
  PATTERN_PARAMETER_REQUIRED: 'Pattern parameter is required',
  ERROR_INVALIDATING_CACHE: 'Error invalidating cache',
  ERROR_GETTING_CACHE_STATUS: 'Error getting cache status',
} as const;

/**
 * ============================================
 * 9) ENVIRONMENT VALIDATION CONSTANTS
 * ============================================
 */

/**
 * Environment variable validation error messages for consistent error reporting.
 */
export const ENV_VALIDATION_MESSAGES = {
  INVALID_CONFIGURATION: 'Invalid environment configuration',
  MONGO_URI_INVALID:
    'MONGO_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)',
} as const;

/**
 * ============================================
 * 10) PUB/SUB CONFIGURATION
 * ============================================
 */

/**
 * Log messages for Pub/Sub operations to ensure consistent logging across the application.
 *
 * These messages provide standardized logging for all Pub/Sub operations including
 * publishing, subscribing, message handling, and error scenarios. They are used by
 * PublisherService, SubscriberService, and EventHandlers.
 *
 * Message Categories:
 * - PUBLISH_*: Messages related to publishing events
 * - SUBSCRIBE_*: Messages related to subscription management
 * - MESSAGE_*: Messages related to message processing
 * - SUBSCRIBER_CLIENT_*: Messages related to client lifecycle
 * - EVENT_HANDLING_*: Messages related to event processing
 * - DLQ_*: Messages related to Dead Letter Queue operations
 *
 * Usage:
 * ```typescript
 * // Success logging
 * logger.info(PUBSUB_MESSAGES.PUBLISH_SUCCESS(channel));
 *
 * // Error logging with context
 * logger.error(error, PUBSUB_MESSAGES.PUBLISH_FAILED(channel));
 *
 * // With additional metadata
 * logger.info({ messageSize: 1024 }, PUBSUB_MESSAGES.PUBLISH_SUCCESS(channel));
 * ```
 *
 * @see PublisherService
 * @see SubscriberService
 * @see BaseEventHandler
 */
export const PUBSUB_MESSAGES = {
  /**
   * Message logged when a message is successfully published to a channel.
   * Includes the channel name for traceability.
   */
  PUBLISH_SUCCESS: (channel: string) => `Published message to channel ${channel}`,

  /**
   * Message logged when publishing a message fails.
   * Logged before the error is re-thrown to calling code.
   */
  PUBLISH_FAILED: (channel: string) => `Failed to publish message to channel ${channel}`,

  /**
   * Message logged when successfully subscribed to a channel.
   * Indicates the subscriber is now receiving messages from this channel.
   */
  SUBSCRIBE_SUCCESS: (channel: string) => `Subscribed to channel ${channel}`,

  /**
   * Message logged when subscribing to a channel fails.
   * Usually indicates connection issues or invalid channel names.
   */
  SUBSCRIBE_FAILED: (channel: string) => `Failed to subscribe to channel ${channel}`,

  /**
   * Message logged when successfully unsubscribed from a channel.
   * The subscriber will no longer receive messages from this channel.
   */
  UNSUBSCRIBE_SUCCESS: (channel: string) => `Unsubscribed from channel ${channel}`,

  /**
   * Message logged when unsubscribing from a channel fails.
   * May occur during connection issues or if already unsubscribed.
   */
  UNSUBSCRIBE_FAILED: (channel: string) => `Failed to unsubscribe from channel ${channel}`,

  /**
   * Message logged when a message is received from a channel.
   * Triggered before message parsing and event handling.
   */
  MESSAGE_RECEIVED: (channel: string) => `Message received from channel ${channel}`,

  /**
   * Message logged when parsing a received message fails.
   * Indicates malformed JSON or unexpected message format.
   */
  MESSAGE_PARSE_FAILED: (channel: string) => `Failed to parse message from channel ${channel}`,

  /**
   * Message logged when subscriber client encounters an error.
   * Used for connection errors, Redis errors, etc.
   */
  SUBSCRIBER_CLIENT_ERROR: 'Subscriber client error',

  /**
   * Message logged when subscriber client successfully connects.
   * Indicates the Redis connection is ready for subscriptions.
   */
  SUBSCRIBER_CLIENT_CONNECTED: 'Subscriber client connected',

  /**
   * Message logged when subscriber client disconnects.
   * May indicate network issues or graceful shutdown.
   */
  SUBSCRIBER_CLIENT_DISCONNECTED: 'Subscriber client disconnected',

  /**
   * Message logged when event handling fails during retry attempts.
   * Includes current attempt number and maximum retry count.
   */
  EVENT_HANDLING_FAILED: (attempt: number, maxRetries: number) =>
    `Event handling failed, attempt ${attempt}/${maxRetries}`,

  /**
   * Message logged when event handling fails after exhausting all retry attempts.
   * The event will be moved to the Dead Letter Queue.
   */
  EVENT_HANDLING_FAILED_ALL_RETRIES: 'Event handling failed after all retries',

  /**
   * Message logged when an event is moved to the Dead Letter Queue (DLQ).
   * Includes event ID and type for debugging purposes.
   */
  DLQ_PUSHED: (eventId: string, eventType: string) =>
    `Event moved to DLQ: ${eventId} (${eventType})`,

  /**
   * Message logged when initializing subscriber client fails.
   */
  INITIALIZE_FAILED: 'Failed to initialize subscriber client',

  /**
   * Message logged when unsubscribe is attempted but subscriber is not initialized.
   */
  UNSUBSCRIBE_NOT_INITIALIZED: (channel: string) =>
    `Cannot unsubscribe from ${channel}: Subscriber not initialized`,

  /**
   * Message logged when a handler encounters an error.
   */
  HANDLER_ERROR: (channel: string) => `Handler error for channel ${channel}`,

  /**
   * Message logged when no handler is found for a channel.
   */
  NO_HANDLER_FOUND: (channel: string) => `No handler found for channel: ${channel}`,

  /**
   * Message logged when attempting to reconnect to Redis.
   */
  RECONNECTING: (attempt: number, maxAttempts: number) =>
    `Attempting reconnection ${attempt}/${maxAttempts}`,

  /**
   * Message logged when subscriber client connection is established.
   */
  SUBSCRIBER_CLIENT_CONNECTION_ESTABLISHED: 'Subscriber client connection established',

  /**
   * Message logged when subscriber client is ready.
   */
  SUBSCRIBER_CLIENT_READY: 'Subscriber client ready',

  /**
   * Message logged when resubscribing to a channel fails.
   */
  RESUBSCRIBE_FAILED: (channel: string) => `Failed to resubscribe to ${channel}`,

  /**
   * Message logged when successfully resubscribed to a channel.
   */
  RESUBSCRIBE_SUCCESS: (channel: string) => `Resubscribed to ${channel} after reconnection`,

  /**
   * Message logged when subscriber service disconnects successfully.
   */
  DISCONNECT_SUCCESS: 'Subscriber service disconnected successfully',

  /**
   * Message logged when an error occurs during subscriber service disconnect.
   */
  DISCONNECT_ERROR: 'Error during subscriber service disconnect',

  /**
   * Message logged when an event is received for processing.
   */
  EVENT_RECEIVED: (eventType: string) => `Received ${eventType} event`,

  /**
   * Message logged when an event is successfully processed.
   */
  EVENT_SUCCESS: (eventType: string) => `Successfully processed ${eventType} event`,

  /**
   * Message logged when an error occurs during event processing.
   */
  EVENT_ERROR: (eventType: string) => `Error processing ${eventType} event`,

  /**
   * Message logged when publishing an event to DLQ fails.
   */
  DLQ_PUBLISH_FAILED: 'Failed to publish event to DLQ',

  /**
   * Message logged when processing a product created event.
   */
  PRODUCT_CREATED_PROCESSING: 'Product created - processing event',

  /**
   * Message logged when processing a product updated event.
   */
  PRODUCT_UPDATED_PROCESSING: 'Product updated - processing event',

  /**
   * Message logged when processing a product deleted event.
   */
  PRODUCT_DELETED_PROCESSING: 'Product deleted - processing event',

  /**
   * Message logged for audit log entries.
   */
  AUDIT_LOG: (action: string) => `AUDIT: ${action}`,

  /**
   * Message logged when Pub/Sub system is already initialized.
   */
  PUBSUB_ALREADY_INITIALIZED: 'Pub/Sub system already initialized',

  /**
   * Message logged when subscriber service is initialized successfully.
   */
  SUBSCRIBER_INITIALIZED: 'Subscriber service initialized successfully',

  /**
   * Message logged when Pub/Sub system is initialized successfully.
   */
  PUBSUB_INITIALIZED: 'Pub/Sub system initialized successfully',

  /**
   * Message logged when Pub/Sub system initialization fails.
   */
  PUBSUB_INITIALIZE_FAILED: 'Failed to initialize Pub/Sub system',

  /**
   * Message logged when subscriber service is not initialized.
   */
  SUBSCRIBER_NOT_INITIALIZED: 'Subscriber service not initialized',

  /**
   * Message logged when an error occurs during event handling.
   */
  EVENT_HANDLING_ERROR: (eventType: string) => `Error handling ${eventType} event`,

  /**
   * Message logged when an unknown event type is received.
   */
  UNKNOWN_EVENT_TYPE: 'Unknown product event type received',

  /**
   * Message logged when subscriber service is disconnected.
   */
  SUBSCRIBER_DISCONNECTED: 'Subscriber service disconnected',

  /**
   * Message logged when an error occurs during Pub/Sub shutdown.
   */
  PUBSUB_SHUTDOWN_ERROR: 'Error during Pub/Sub shutdown',

  /**
   * Message logged when an error occurs while disconnecting subscriber service.
   */
  SUBSCRIBER_DISCONNECT_ERROR: 'Error disconnecting subscriber service',

  /**
   * Message logged when an error occurs while disconnecting Redis.
   */
  REDIS_DISCONNECT_ERROR: 'Error disconnecting Redis',
} as const;

/**
 * Pub/Sub channel names for consistent channel naming across the application.
 *
 * Channel Naming Convention:
 * All channel names follow the pattern: jollyjet:events:{domain}
 * This ensures clear organization and avoids naming collisions.
 *
 * Available Channels:
 * - PRODUCT: Product lifecycle events (create, update, delete)
 * - AUDIT: User activity and audit trail events
 * - NOTIFICATIONS: System notification events
 * - DLQ: Dead Letter Queue for failed event processing
 * - HEALTH_CHECK: System health monitoring events
 *
 * Environment Prefixing:
 * Use getEnvironmentChannel() to prefix channels with the current environment
 * (dev, staging, prod) for multi-environment deployments.
 *
 * Usage:
 * ```typescript
 * // Publishing to a channel
 * await publisherService.publish(PUBSUB_CHANNELS.PRODUCT, event);
 *
 * // Subscribing to a channel
 * subscriberService.subscribe(PUBSUB_CHANNELS.AUDIT, handler);
 *
 * // Environment-specific channel
 * const envChannel = PUBSUB_CHANNELS.getEnvironmentChannel(PUBSUB_CHANNELS.PRODUCT);
 * // Returns: "dev:jollyjet:events:product" (in development)
 * ```
 *
 * @see PublisherService
 * @see SubscriberService
 */
export const PUBSUB_CHANNELS = {
  /**
   * Channel for product-related events.
   * Events: PRODUCT_CREATED, PRODUCT_UPDATED, PRODUCT_DELETED
   */
  PRODUCT: 'jollyjet:events:product',

  /**
   * Channel for audit and user activity events.
   * Events: USER_ACTIVITY, security events, compliance events
   */
  AUDIT: 'jollyjet:events:audit',

  /**
   * Channel for notification events.
   * Events: Email notifications, push notifications, alerts
   */
  NOTIFICATIONS: 'jollyjet:events:notifications',

  /**
   * Dead Letter Queue channel for failed events.
   * Events that fail processing after all retries are moved here.
   */
  DLQ: 'jollyjet:events:dlq',

  /**
   * Health check channel for monitoring.
   * Events: Health status updates, heartbeat messages
   */
  HEALTH_CHECK: 'health:check',

  /**
   * Helper function to prefix a channel with the current environment.
   *
   * Use this when deploying to multiple environments to ensure
   * events don't cross environment boundaries.
   *
   * @param channel - The base channel name (e.g., PUBSUB_CHANNELS.PRODUCT)
   * @returns Channel name prefixed with environment
   * @example
   * ```typescript
   * // In development (NODE_ENV=development)
   * getEnvironmentChannel('jollyjet:events:product')
   * // Returns: 'development:jollyjet:events:product'
   *
   * // In production (NODE_ENV=production)
   * getEnvironmentChannel('jollyjet:events:product')
   * // Returns: 'production:jollyjet:events:product'
   * ```
   */
  getEnvironmentChannel: (channel: string) => `${process.env.NODE_ENV || 'dev'}:${channel}`,
} as const;

/**
 * Pub/Sub event types for consistent event type naming across the application.
 *
 * These string constants define all possible event types in the system.
 * They are used for:
 * - Type-safe event interfaces (via typeof PUBSUB_EVENT_TYPES.EVENT_NAME)
 * - Event routing and handler selection
 * - Event validation and filtering
 * - Logging and monitoring
 *
 * Event Categories:
 * - PRODUCT_*: Product lifecycle events
 * - USER_ACTIVITY: Audit and user behavior events
 * - BATCH: Bulk operation events
 *
 * Usage:
 * ```typescript
 * // In event interface definitions
 * interface ProductCreatedEvent extends BaseEvent {
 *   eventType: typeof PUBSUB_EVENT_TYPES.PRODUCT_CREATED;
 *   payload: { ... };
 * }
 *
 * // In event creation
 * const event: ProductCreatedEvent = {
 *   eventId: generateEventId(),
 *   eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
 *   timestamp: new Date(),
 *   payload: { productId: '123', name: 'Product' }
 * };
 *
 * // In event handling
 * if (event.eventType === PUBSUB_EVENT_TYPES.PRODUCT_CREATED) {
 *   // Handle product creation
 * }
 * ```
 *
 * @see BaseEvent
 * @see AppEvent
 * @see PUBSUB_CHANNELS
 */
export const PUBSUB_EVENT_TYPES = {
  /**
   * Event type emitted when a new product is successfully created.
   * Published to: PUBSUB_CHANNELS.PRODUCT
   * Payload: { productId, name, price, category }
   */
  PRODUCT_CREATED: 'PRODUCT_CREATED',

  /**
   * Event type emitted when an existing product is modified.
   * Published to: PUBSUB_CHANNELS.PRODUCT
   * Payload: { productId, changes }
   */
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',

  /**
   * Event type emitted when a product is removed from the system.
   * Published to: PUBSUB_CHANNELS.PRODUCT
   * Payload: { productId }
   */
  PRODUCT_DELETED: 'PRODUCT_DELETED',

  /**
   * Event type emitted for user activity and audit logging.
   * Published to: PUBSUB_CHANNELS.AUDIT
   * Payload: { userId, action, metadata }
   */
  USER_ACTIVITY: 'USER_ACTIVITY',

  /**
   * Event type for batch/bulk operations.
   * Used when processing multiple items in a single operation.
   * Published to: PUBSUB_CHANNELS.PRODUCT (or appropriate domain channel)
   */
  BATCH: 'BATCH',
} as const;

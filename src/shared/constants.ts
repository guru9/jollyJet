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
 */
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository',
  LOGGER: 'Logger',
  REDIS_SERVICE: 'RedisService',
  CACHE_SERVICE: 'CacheService',
  SESSION_SERVICE: 'SessionService',
  RATE_LIMIT_SERVICE: 'RateLimitingService',
  CORS_SECURITY_SERVICE: 'CorsSecurityService',
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

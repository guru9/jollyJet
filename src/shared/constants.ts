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
export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Standardized response status strings for API responses.
 */
export enum RESPONSE_STATUS {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Standardized error messages for consistent error responses.
 */
export const ERROR_STATUS = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database operation failed',
  INVALID_OBJECT_ID: 'Invalid ObjectId',
};

/**
 * ============================================
 * 2) DI-Container CONFIGURATION
 * ============================================
 *

/**
 * Dependency Injection container tokens for loose coupling between application layers.
 * These string tokens are used to register and resolve dependencies in the DI container.
 */
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository', // Injection token for product repository
  LOGGER: 'Logger', // Injection token for logger service
  REDIS_SERVICE: 'RedisService', // Injection token for Redis client
  SESSION_SERVICE: 'SessionService', // Injection token for session service
  RATE_LIMIT_SERVICE: 'RateLimitingService', // Injection token for rate limiting service

  // Future tokens can be added here for other modules
} as const;

/**
 * ============================================
 * 3) PRODDUCT CONFIGURATION
 * ============================================
 *

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
};

/**
 * Error messages for product-related operations to provide consistent error responses.
 */
export const PRODUCT_ERROR_MESSAGES = {
  NOT_AVAILABLE: 'Product is not available.',
  NOT_FOUND: 'Product not found.',
  PRODUCT_NOT_FOUND_UPDATE: 'Product not found for update.',
  PRODUCT_ID_REQ_RETRIEVE: 'Product ID is required to retrieve the product.',
  PRODUCT_ID_REQ_UPDATE: 'Product ID is required for updation.',
  PRODUCT_ID_REQ_DELETE: 'Product ID is required for deletion.',
  PRODUCT_ID_REQ_WISHLIST: 'Product ID is required for wishlist toggle.',
  PRODUCT_ID_INVALID: 'Invalid product ID format.',
};

/**
 * Validation error messages for product fields to ensure consistent validation messages.
 */
export const PRODUCT_VALIDATION_MESSAGES = {
  // Zod schema validation messages (used in ProductValidators.ts)
  NAME_MIN_LENGTH: 'Name must be at least 3 characters long',
  NAME_MAX_LENGTH: 'Name must be at most 30 characters long',
  DESCRIPTION_MIN_LENGTH: 'Description must be at least 10 characters long',
  PRICE_MIN: 'Price must be a non-negative number',
  STOCK_MIN: 'Stock must be non-negative number',
  CATEGORY_REQUIRED: 'Category is required',
  PRODUCT_ID_REQUIRED: 'Product ID is required',
  PRICE_RANGE_INVALID:
    'Price range must be valid JSON with min and max as non-negative numbers, min <= max',
  PAGE_INVALID: 'Page must be a positive integer',
  LIMIT_INVALID: 'Limit must be a positive integer between 1 and 100',
  // Domain entity validation messages
  PRODUCT_NAME_REQUIRED: 'Product name is required.',
  PRODUCT_DESCRIPTION_REQUIRED: 'Product description is required.',
  PRODUCT_PRICE_INVALID: 'Product price must be a non-negative number.',
  PRODUCT_STOCK_INVALID: 'Product stock must be a non-negative number.',
  PRODUCT_CATEGORY_REQUIRED: 'Product category is required.',
  WISHLIST_COUNT_INVALID: 'wishlistCount must be a non-negative number if provided.',
};

/**
 * Product-specific constants defining validation rules, limits, and default values.
 */
export const PRODUCT_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 1000000,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  DEFAULT_CATEGORY: 'general',
  MIN_STOCK: 0,
  MAX_STOCK: 100000,
  MIN_WISHLIST_COUNT: 0,
  MAX_WISHLIST_COUNT: 1000000,
  MAX_WISHLIST_ITEMS_PER_USER: 100,
};

/**
 * ============================================
 * 4) REDIS CONFIGURATION
 * ============================================
 *
 * Comprehensive Redis configuration for the JollyJet e-commerce platform.
 * This section defines all Redis-related constants including connection settings,
 * cache behavior parameters, TTL presets, rate limiting, cache consistency,
 * logging levels, and operational constants for efficient cache management.
 *
 * The configuration supports environment variable overrides for production flexibility
 * while providing sensible defaults for development environments.
 *
 * Key Features:
 * - Environment-aware configuration with fallback defaults
 * - Comprehensive TTL presets for various caching scenarios
 * - Rate limiting configuration for API protection
 * - Cache consistency mechanisms for data integrity
 * - Structured logging for cache operations
 */

/**
 * Redis configuration constants for connection settings, timeouts, and operational parameters.
 * These constants define how the application connects to Redis and manages cache operations.
 *
 * Connection Settings:
 * - HOST: Redis server hostname or IP address
 * - PORT: Redis server port number
 * - PASSWORD: Authentication password for Redis
 * - DB: Redis database index (0-15)
 *
 * Cache Behavior:
 * - EXPIRE_TIME: Default expiration time for cache entries in seconds
 * - MAX_RETRIES: Maximum number of retry attempts for failed operations
 * - RETRY_DELAY: Delay between retry attempts in milliseconds
 *
 * TTL (Time-To-Live) Presets:
 * - DEFAULT: Standard cache duration
 * - SHORT: Short-lived cache entries
 * - LONG: Extended cache duration
 * - NEVER: Cache entries that never expire
 * - SESSION: Session-based cache duration
 * - TEMPORARY: Temporary cache entries
 * - PERMANENT: Permanent cache entries
 * - MAX: Maximum allowed cache duration
 * - MIN: Minimum allowed cache duration
 * - RATE_LIMIT: Cache duration for rate limiting
 * - PRODUCT: Product-specific cache duration
 * - USER: User-specific cache duration
 *
 * Rate Limiting:
 * - WINDOW: Time window for rate limiting
 * - LIMIT: Maximum requests allowed in the window
 * - MAX_REQUESTS: Maximum concurrent requests
 * - MAX_RETRIES: Maximum retry attempts for rate-limited operations
 *
 * Cache Consistency:
 * - CHECK_INTERVAL: Interval for cache consistency checks
 * - SAMPLE_SIZE: Number of keys to sample for consistency checks
 * - STALE_THRESHOLD: Threshold for detecting stale cache entries
 *
 * Logging Levels:
 * - DEBUG: Detailed debugging information
 * - INFO: General operational information
 * - WARN: Warning messages
 * - ERROR: Error messages
 */
export const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: process.env.REDIS_PORT || 6379,
  PASSWORD: process.env.REDIS_PASSWORD || '',
  DB: process.env.REDIS_DB || 0,
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
  LOG_LEVELS: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
  },
};

/**
 * Cache operations constants defining all possible Redis operations for consistent logging and error handling.
 * These constants are used throughout the application to track and log cache operations.
 */
export const CACHE_OPERATIONS = {
  GET: 'GET',
  SET: 'SET',
  DEL: 'DEL',
  EXPIRE: 'EXPIRE',
  FLUSH: 'FLUSH',
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  AQUIRE_LOCK: 'AQUIRE_LOCK',
  RELEASE_LOCK: 'RELEASE_LOCK',
  EXPIRE_LOCK: 'EXPIRE_LOCK',
  KEYS: 'KEYS',
  SCAN: 'SCAN',
};

/**
 * Cache key patterns constants for consistent Redis key naming across the application.
 * These patterns ensure predictable key structures and enable efficient key management.
 * All key patterns use template functions that accept identifiers to generate complete keys.
 */
export const CACHE_KEYS_PATTERNS = {
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCT_LIST: (filter: string) => `product:list:${filter}`,
  SESSION: (id: string) => `session:${id}`,
  RATE_LIMIT: (id: string) => `rate_limit:${id}`,
  CONSISTENCY_LOCK: (id: string) => `consistency:lock:${id}`,
  CONSISTENCY_CHECK: (id: string) => `consistency:check:${id}`,
  CONSISTENCY_SAMPLE: (id: string) => `consistency:sample:${id}`,
  CONSISTENCY_STALE: (id: string) => `consistency:stale:${id}`,
  CONSISTENCY_STALE_THRESHOLD: (id: string) => `consistency:stale_threshold:${id}`,
  WISHLIST: (id: string) => `wishlist:${id}`,
  WISHLIST_COUNT: (id: string) => `wishlist:count:${id}`,
  WISHLIST_ITEMS: (id: string) => `wishlist:items:${id}`,
  WISHLIST_ITEMS_COUNT: (id: string) => `wishlist:items_count:${id}`,
};

/**
 * Cache operation log messages with placeholders for structured logging.
 * These messages provide consistent logging format across all cache operations,
 * with placeholders that get replaced with actual values during logging.
 *
 * Placeholders:
 * - {error}: Error details or messages
 * - {operation}: Type of cache operation being performed
 * - {key}: Redis key being operated on
 * - {source}: Data source (e.g., database, API)
 * - {ttl}: Time-to-live value in seconds
 * - {count}: Numeric count of items
 * - {pattern}: Redis key pattern used in operations
 * - {hitRate}: Cache hit rate percentage
 * - {total}: Total number of cache operations
 * - {memory}: Memory usage in bytes
 */
export const CACHE_LOG_MESSAGES = {
  // Connection management messages
  CONNECTION_SUCCESS: 'Redis connected successfully',
  CONNECTION_ERROR: 'Redis connection error: {error}',
  CONNECTION_CLOSED: 'Redis connection closed',
  CONNECTION_WARNING: 'Redis not connected, {operation} skipped',

  // Cache operation lifecycle messages
  CACHE_HIT: 'Cache hit for key: {key}',
  CACHE_MISS: 'Cache miss for key: {key}, fetching from {source}',
  CACHE_SET: 'Cache set for key: {key} with TTL: {ttl}',
  CACHE_DELETE: 'Cache deleted for key: {key}',
  CACHE_FLUSH: 'Cache flushed successfully',
  CACHE_KEYS: 'Found {count} keys matching pattern: {pattern}',

  // Cache consistency and refresh messages
  STALE_CACHE_DETECTED: 'Stale cache detected for key: {key}, TTL: {ttl}',
  CACHE_REFRESHED: 'Cache refreshed for key: {key}',
  CONSISTENCY_CHECK_FAILED: 'Consistency check failed for key: {key}',
  CONSISTENCY_CHECK_SUCCESS: 'Consistency check passed for key: {key}',

  // Performance optimization messages
  STAMPEDE_PROTECTION_ACTIVE: 'Stampede protection active for key: {key}',
  BACKGROUND_REFRESH_STARTED: 'Background refresh started for key: {key}',
  BACKGROUND_REFRESH_COMPLETED: 'Background refresh completed for key: {key}',

  // Error handling messages
  CACHE_OPERATION_FAILED: 'Cache operation {operation} failed for key: {key}, error: {error}',
  LOCK_ACQUISITION_FAILED: 'Lock acquisition failed for key: {key}',
  METRICS_COLLECTION_FAILED: 'Metrics collection failed: {error}',
  BATCH_OPERATION_FAILED: 'Batch operation failed, falling back to individual operations',

  // Performance monitoring and metrics
  CACHE_HIT_RATE: 'Cache hit rate: {hitRate}%, total operations: {total}',
  LOW_HIT_RATE_WARNING:
    'Low cache hit rate detected: {hitRate}%, consider adjusting TTL or cache strategy',
  MEMORY_USAGE: 'Redis memory usage: {memory} bytes',

  // Cache consistency service specific messages
  CONSISTENCY_CHECK_STARTED: 'Starting cache consistency check',
  NO_CACHE_ENTRIES_FOUND: 'No cache entries found for consistency check',
  CACHE_HIT_TRACKED: 'Cache hit tracked',
  CACHE_MISS_TRACKED: 'Cache miss tracked',
  STALE_READ_DETECTED: 'Stale cache read detected and served',
  CONSISTENCY_ERROR_DETECTED: 'Cache consistency error detected',
  CONSISTENCY_MONITORING_INIT:
    'Cache consistency monitoring initialized with check interval: {interval}ms, sample size: {sampleSize}, stale threshold: {staleThreshold}ms',
  KEY_CHECK_ERROR: 'Error checking key during consistency check, key: {key}, error: {error}',
  CONSISTENCY_CHECK_COMPLETED:
    'Cache consistency check completed: total keys: {totalKeys}, checked keys: {checkedKeys}, stale keys: {staleKeys}, stale ratio: {staleRatio}%, consistency score: {consistencyScore}',
  CONSISTENCY_CHECK_FAILED_MSG: 'Cache consistency check failed: {error}',
  STALE_DATA_DETECTED_MSG: 'Stale data detected for key: {key}, TTL: {ttl}, threshold: {threshold}',
  STALE_DATA_CHECK_ERROR: 'Error checking stale data for key: {key}, error: {error}',
  REFRESH_AHEAD_FAILED: 'Refresh-ahead operation failed for key: {key}, error: {error}',
  FORCE_REFRESH_STARTED: 'Force refreshing cache entry: {key}',
  FORCE_REFRESH_FAILED: 'Force refresh failed for key: {key}, error: {error}',
  NO_KEYS_FOUND_PATTERN: 'No keys found for pattern: {pattern}',
  KEY_DELETE_FAILED:
    'Failed to delete key during pattern invalidation, key: {key}, pattern: {pattern}, error: {error}',
  PATTERN_INVALIDATION_COMPLETED:
    'Pattern-based cache invalidation completed, pattern: {pattern}, total keys: {totalKeys}, invalidated keys: {invalidatedKeys}',
  PATTERN_INVALIDATION_FAILED: 'Pattern invalidation failed for pattern: {pattern}, error: {error}',
  METRICS_RESET: 'Cache consistency metrics reset',
  SERVICE_CLEANUP_COMPLETED: 'Cache consistency service cleanup completed',
};

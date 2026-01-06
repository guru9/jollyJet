/**
 * Rate Limiting Service Interface
 *
 * Defines the contract for rate limiting operations used to protect valid
 * resources from excessive use and abuse.
 *
 * @module IRateLimitingService
 */

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in the current window */
  remaining: number;
  /** When the rate limit window resets */
  resetAt: Date;
  /** Total requests made in the current window */
  totalRequests: number;
}

export interface RateLimitConfig {
  /** Window size in seconds */
  windowSize: number;
  /** Maximum number of requests allowed in the window */
  limit: number;
}

export interface IRateLimitingService {
  /**
   * Checks if a request should be rate limited
   * @param key - Unique identifier for the client/action (e.g., IP, User ID)
   * @param config - Optional configuration overriding defaults
   */
  checkRateLimit(key: string, config?: Partial<RateLimitConfig>): Promise<RateLimitResult>;

  /**
   * Resets the rate limit for a specific key
   */
  resetRateLimit(key: string): Promise<boolean>;

  /**
   * Gets current status without counting a request
   */
  getRateLimitStatus(key: string): Promise<RateLimitResult | null>;
}

/**
 * Session Service Implementation (Redis-based user session management)
 *
 * Provides Redis-based session management for user authentication in the JollyJet
 * e-commerce platform. This service implements ISessionService interface and handles
 * session lifecycle operations including creation, validation, update, deletion, and cleanup.
 *
 * Key Features:
 * - Secure session creation with unique session IDs
 * - Session validation and retrieval with automatic last-access updates
 * - Session data updates while preserving immutable fields
 * - Session TTL extension for active users
 * - Cleanup of expired/inactive sessions
 * - Distributed session support for load-balanced environments
 *
 * Dependencies:
 * - IRedisService: Core Redis operations for session storage
 * - Logger: Structured logging for session operations
 *
 * @module SessionService
 */
import { inject, injectable } from 'tsyringe';
import { IRedisService } from '../../../domain/interfaces/redis/IRedisService';
import {
  CreateSessionOptions,
  ISessionService,
  SessionData,
} from '../../../domain/interfaces/session/ISessionService';
import {
  CACHE_KEYS_PATTERNS,
  CACHE_LOG_MESSAGES,
  DI_TOKENS,
  REDIS_CONFIG,
} from '../../../shared/constants';
import { Logger } from '../../../shared/logger';

/**
 * Session Service
 *
 * Redis-based session management service implementing comprehensive session
 * lifecycle operations with automatic cleanup and distributed support.
 *
 * Usage:
 * ```typescript
 * // Create a session
 * const sessionId = await sessionService.createSession({
 *   userId: 'user123',
 *   email: 'user@example.com',
 *   roles: ['user', 'premium'],
 *   preferences: { theme: 'dark' }
 * });
 *
 * // Retrieve session
 * const session = await sessionService.getSession(sessionId);
 *
 * // Update session
 * await sessionService.updateSession(sessionId, { preferences: { theme: 'light' } });
 *
 * // Delete session
 * await sessionService.deleteSession(sessionId);
 * ```
 */
@injectable()
export class SessionService implements ISessionService {
  constructor(
    @inject(DI_TOKENS.REDIS_SERVICE) private redisService: IRedisService,
    @inject(DI_TOKENS.LOGGER) private logger: Logger
  ) {}

  /**
   * Creates a new session for a user
   *
   * Generates a unique session ID, creates session data with timestamps,
   * and stores it in Redis with the specified or default TTL.
   *
   * @param options - Session creation options including user data and optional TTL
   * @returns Promise resolving to the generated session ID
   */
  public async createSession(options: CreateSessionOptions): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = new Date();

    const sessionData: SessionData = {
      userId: options.userId,
      email: options.email,
      roles: options.roles,
      preferences: options.preferences || {},
      createdAt: now,
      lastAccessedAt: now,
    };

    const ttl = options.ttl || (REDIS_CONFIG.TTL.SESSION as number);
    const sessionKey = CACHE_KEYS_PATTERNS.USER_SESSION(sessionId);

    await this.redisService.set(sessionKey, JSON.stringify(sessionData), ttl);

    this.logger.info(CACHE_LOG_MESSAGES.CACHE_SET(sessionKey, ttl));

    this.logger.debug(`Session created for user ${options.userId} with session ID ${sessionId}`);

    return sessionId;
  }

  /**
   * Retrieves session data by session ID
   *
   * Fetches the session from Redis and automatically updates the
   * lastAccessedAt timestamp to track session activity.
   *
   * @param sessionId - The session ID to retrieve
   * @returns Promise resolving to SessionData if found, null otherwise
   */
  public async getSession(sessionId: string): Promise<SessionData | null> {
    const sessionKey = CACHE_KEYS_PATTERNS.USER_SESSION(sessionId);
    const sessionData = await this.redisService.get(sessionKey);

    if (sessionData) {
      this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT(sessionKey));

      // Parse stored session data
      const parsed = JSON.parse(sessionData) as SessionData;

      // Convert date strings back to Date objects
      parsed.createdAt = new Date(parsed.createdAt);
      parsed.lastAccessedAt = new Date();

      // Update last accessed time in cache (keeping the existing TTL)
      const currentTtl = await this.redisService.getClient().ttl(sessionKey);
      if (currentTtl > 0) {
        await this.redisService.set(sessionKey, JSON.stringify(parsed), currentTtl);
      }

      return parsed;
    }

    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS(sessionKey, 'session_store'));
    return null;
  }

  /**
   * Updates session data with partial updates
   *
   * Merges the provided updates with existing session data while
   * preserving immutable fields and updating the lastAccessedAt timestamp.
   *
   * @param sessionId - The session ID to update
   * @param updates - Partial session data to merge
   * @returns Promise resolving to true if updated, false if session not found
   */
  public async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean> {
    const sessionKey = CACHE_KEYS_PATTERNS.USER_SESSION(sessionId);
    const existingSession = await this.getSession(sessionId);

    if (!existingSession) {
      this.logger.warn(`Session not found for update: ${sessionId}`);
      return false;
    }

    // Merge updates while preserving createdAt (immutable)
    const updatedSession: SessionData = {
      ...existingSession,
      ...updates,
      createdAt: existingSession.createdAt, // Preserve original creation time
      lastAccessedAt: new Date(),
    };

    // Get current TTL to preserve existing expiration
    const currentTtl = await this.redisService.getClient().ttl(sessionKey);
    const ttl = currentTtl > 0 ? currentTtl : (REDIS_CONFIG.TTL.SESSION as number);

    await this.redisService.set(sessionKey, JSON.stringify(updatedSession), ttl);

    this.logger.debug(`Session ${sessionId} updated successfully`);
    return true;
  }

  /**
   * Deletes a session
   *
   * Removes the session from Redis, effectively logging out the user.
   *
   * @param sessionId - The session ID to delete
   * @returns Promise resolving to true when deleted
   */
  public async deleteSession(sessionId: string): Promise<boolean> {
    const sessionKey = CACHE_KEYS_PATTERNS.USER_SESSION(sessionId);
    await this.redisService.delete(sessionKey);

    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_DELETE(sessionKey));
    this.logger.info(`Session ${sessionId} deleted`);

    return true;
  }

  /**
   * Extends the TTL of an existing session
   *
   * Refreshes the session expiration time to keep active users logged in.
   * Useful for implementing "remember me" functionality or sliding session expiration.
   *
   * @param sessionId - The session ID to extend
   * @param ttl - Optional new TTL in seconds (defaults to REDIS_CONFIG.TTL.SESSION)
   * @returns Promise resolving to true if extended, false if session not found
   */
  public async extendSession(sessionId: string, ttl?: number): Promise<boolean> {
    const sessionKey = CACHE_KEYS_PATTERNS.USER_SESSION(sessionId);
    const extensionTtl = ttl || (REDIS_CONFIG.TTL.SESSION as number);

    const sessionData = await this.redisService.get(sessionKey);
    if (sessionData) {
      await this.redisService.set(sessionKey, sessionData, extensionTtl);
      this.logger.debug(`Session ${sessionId} extended by ${extensionTtl} seconds`);
      return true;
    }

    this.logger.warn(`Session not found for extension: ${sessionId}`);
    return false;
  }

  /**
   * Cleans up expired or inactive sessions
   *
   * Scans all session keys and removes sessions that have been inactive
   * for more than the specified threshold (default: 7 days).
   * This is useful for periodic session garbage collection.
   *
   * @param inactiveDaysThreshold - Number of inactive days before cleanup (default: 7)
   * @returns Promise resolving to the number of cleaned up sessions
   */
  public async cleanupExpiredSessions(inactiveDaysThreshold: number = 7): Promise<number> {
    const sessionKeys = await this.redisService.keys('session:*');
    let cleanedCount = 0;

    this.logger.info(`Starting session cleanup. Found ${sessionKeys.length} session keys.`);

    for (const key of sessionKeys) {
      try {
        const sessionData = await this.redisService.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData) as SessionData;
          const lastAccessed = new Date(session.lastAccessedAt).getTime();
          const daysSinceLastAccess = (Date.now() - lastAccessed) / (1000 * 60 * 60 * 24);

          if (daysSinceLastAccess > inactiveDaysThreshold) {
            await this.redisService.delete(key);
            cleanedCount++;
            this.logger.debug(
              `Cleaned up inactive session: ${key} (inactive for ${Math.floor(daysSinceLastAccess)} days)`
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `Error processing session ${key} during cleanup: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.logger.info(
      `Session cleanup completed. Cleaned ${cleanedCount} expired/inactive sessions.`
    );
    return cleanedCount;
  }

  /**
   * Deletes all sessions for a specific user
   *
   * Useful for security scenarios like password changes or account compromises
   * where all active sessions need to be invalidated.
   *
   * @param userId - The user ID whose sessions should be deleted
   * @returns Promise resolving to the number of deleted sessions
   */
  public async deleteUserSessions(userId: string): Promise<number> {
    const sessionKeys = await this.redisService.keys('session:*');
    let deletedCount = 0;

    for (const key of sessionKeys) {
      try {
        const sessionData = await this.redisService.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData) as SessionData;
          if (session.userId === userId) {
            await this.redisService.delete(key);
            deletedCount++;
          }
        }
      } catch (error) {
        this.logger.error(
          `Error checking session ${key} for user ${userId}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    this.logger.info(`Deleted ${deletedCount} sessions for user ${userId}`);
    return deletedCount;
  }

  /**
   * Gets all active sessions for a user
   *
   * Useful for displaying active sessions in user settings
   * or for security auditing purposes.
   *
   * @param userId - The user ID whose sessions to retrieve
   * @returns Promise resolving to array of session IDs and their data
   */
  public async getUserSessions(
    userId: string
  ): Promise<Array<{ sessionId: string; data: SessionData }>> {
    const sessionKeys = await this.redisService.keys('session:*');
    const userSessions: Array<{ sessionId: string; data: SessionData }> = [];

    for (const key of sessionKeys) {
      try {
        const sessionData = await this.redisService.get(key);
        if (sessionData) {
          const session = JSON.parse(sessionData) as SessionData;
          if (session.userId === userId) {
            // Extract session ID from key (format: session:{sessionId})
            const sessionId = key.replace('session:', '');
            userSessions.push({
              sessionId,
              data: {
                ...session,
                createdAt: new Date(session.createdAt),
                lastAccessedAt: new Date(session.lastAccessedAt),
              },
            });
          }
        }
      } catch (error) {
        this.logger.error(
          `Error retrieving session ${key} for user ${userId}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return userSessions;
  }

  /**
   * Generates a unique session ID
   *
   * Creates a session ID using a combination of:
   * - Prefix for identification ('sess_')
   * - Current timestamp for uniqueness
   * - Random string for unpredictability
   *
   * @returns Generated session ID string
   */
  private generateSessionId(): string {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 11);
    return `sess_${timestamp}_${randomPart}`;
  }

  /**
   * Validates session data structure
   *
   * Type guard that checks if the provided data conforms to the SessionData interface.
   * Useful for validating parsed JSON data from Redis.
   *
   * @param data - Unknown data to validate
   * @returns True if data is valid SessionData, false otherwise
   */
  public isValidSessionData(data: unknown): data is SessionData {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const session = data as Record<string, unknown>;

    return (
      typeof session.userId === 'string' &&
      typeof session.email === 'string' &&
      Array.isArray(session.roles) &&
      session.roles.every((role: unknown) => typeof role === 'string') &&
      typeof session.preferences === 'object' &&
      session.preferences !== null &&
      (session.createdAt instanceof Date || typeof session.createdAt === 'string') &&
      (session.lastAccessedAt instanceof Date || typeof session.lastAccessedAt === 'string')
    );
  }
}

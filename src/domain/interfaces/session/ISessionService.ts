/**
 * Session Service Interface (user session management)
 *
 * Defines the contract for session management operations in the JollyJet platform.
 * This interface abstracts the session storage mechanism, enabling different
 * implementations (Redis, in-memory, database) to be swapped without affecting
 * consuming code.
 *
 * Following Clean Architecture principles, this interface belongs in the Domain layer
 * while implementations reside in the Infrastructure layer.
 *
 * @module ISessionService
 */

/**
 * Session Data Interface
 *
 * Defines the structure of session data stored in the session store.
 * Contains user identity, permissions, preferences, and timestamps.
 */
export interface SessionData {
  /** Unique user identifier */
  userId: string;
  /** User's email address */
  email: string;
  /** Array of role identifiers assigned to the user */
  roles: string[];
  /** User preferences and settings */
  preferences: Record<string, unknown>;
  /** Timestamp when the session was created */
  createdAt: Date;
  /** Timestamp of the last session activity */
  lastAccessedAt: Date;
}

/**
 * Session Creation Options Interface
 *
 * Defines the options available when creating a new session.
 * Includes required user data and optional TTL configuration.
 */
export interface CreateSessionOptions {
  /** Unique user identifier */
  userId: string;
  /** User's email address */
  email: string;
  /** Array of role identifiers to assign to the session */
  roles: string[];
  /** Optional user preferences (defaults to empty object) */
  preferences?: Record<string, unknown>;
  /** Optional custom TTL in seconds */
  ttl?: number;
}

/**
 * Session Service Interface
 *
 * Contract for session management operations providing a clean abstraction
 * over the underlying session storage mechanism.
 */
export interface ISessionService {
  /**
   * Creates a new session for a user
   * @param options - Session creation options including user data and optional TTL
   * @returns Promise resolving to the generated session ID
   */
  createSession(options: CreateSessionOptions): Promise<string>;

  /**
   * Retrieves session data by session ID
   * @param sessionId - The session ID to retrieve
   * @returns Promise resolving to SessionData if found, null otherwise
   */
  getSession(sessionId: string): Promise<SessionData | null>;

  /**
   * Updates session data with partial updates
   * @param sessionId - The session ID to update
   * @param updates - Partial session data to merge
   * @returns Promise resolving to true if updated, false if session not found
   */
  updateSession(sessionId: string, updates: Partial<SessionData>): Promise<boolean>;

  /**
   * Deletes a session
   * @param sessionId - The session ID to delete
   * @returns Promise resolving to true when deleted
   */
  deleteSession(sessionId: string): Promise<boolean>;

  /**
   * Extends the TTL of an existing session
   * @param sessionId - The session ID to extend
   * @param ttl - Optional new TTL in seconds
   * @returns Promise resolving to true if extended, false if session not found
   */
  extendSession(sessionId: string, ttl?: number): Promise<boolean>;

  /**
   * Cleans up expired or inactive sessions
   * @param inactiveDaysThreshold - Number of inactive days before cleanup (default: 7)
   * @returns Promise resolving to the number of cleaned up sessions
   */
  cleanupExpiredSessions(inactiveDaysThreshold?: number): Promise<number>;

  /**
   * Deletes all sessions for a specific user
   * @param userId - The user ID whose sessions should be deleted
   * @returns Promise resolving to the number of deleted sessions
   */
  deleteUserSessions(userId: string): Promise<number>;

  /**
   * Gets all active sessions for a user
   * @param userId - The user ID whose sessions to retrieve
   * @returns Promise resolving to array of session IDs and their data
   */
  getUserSessions(userId: string): Promise<Array<{ sessionId: string; data: SessionData }>>;

  /**
   * Validates session data structure
   * @param data - Unknown data to validate
   * @returns True if data is valid SessionData, false otherwise
   */
  isValidSessionData(data: unknown): data is SessionData;
}

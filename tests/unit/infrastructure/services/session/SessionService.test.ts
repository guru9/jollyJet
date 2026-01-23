import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { CreateSessionOptions, SessionData } from '@/domain/interfaces/session/ISessionService';
import { SessionService } from '@/infrastructure/services/session/SessionService';
import { CACHE_KEYS_PATTERNS } from '@/shared/constants';
import { Logger } from '@/shared/logger';
import Redis from 'ioredis';
import 'reflect-metadata';

// Mock dependencies
const mockRedisService = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  keys: jest.fn(),
  getClient: jest.fn(),
} as unknown as jest.Mocked<IRedisService>;

const mockLogger = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as jest.Mocked<Logger>;

describe('SessionService', () => {
  let sessionService: SessionService;
  const mockBaseDate = new Date('2024-01-01T00:00:00Z');

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockBaseDate);

    // Mock Redis client ttl method since it's accessed via getClient()
    mockRedisService.getClient.mockReturnValue({
      ttl: jest.fn().mockResolvedValue(3600),
    } as unknown as Redis);

    sessionService = new SessionService(mockRedisService, mockLogger);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createSession', () => {
    it('should create a new session and store it in Redis', async () => {
      const options: CreateSessionOptions = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        preferences: { theme: 'dark' },
      };

      const sessionId = await sessionService.createSession(options);

      expect(sessionId).toMatch(/^sess_\d+_[a-z0-9]+$/);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        CACHE_KEYS_PATTERNS.USER_SESSION(sessionId),
        expect.stringContaining('"userId":"user-123"'),
        expect.any(Number)
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should return session data and update lastAccessedAt if session exists', async () => {
      const sessionId = 'test-session';
      const sessionData: SessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        preferences: {},
        createdAt: new Date(mockBaseDate.getTime() - 10000), // Created in past
        lastAccessedAt: new Date(mockBaseDate.getTime() - 5000),
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(sessionData));

      const result = await sessionService.getSession(sessionId);

      expect(result).toBeDefined();
      expect(result?.userId).toBe('user-123');
      expect(result?.lastAccessedAt).toEqual(mockBaseDate); // Should be updated to 'now'
      expect(mockRedisService.set).toHaveBeenCalled(); // Should save update
    });

    it('should return null if session does not exist', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await sessionService.getSession('non-existent');

      expect(result).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('Cache miss'));
    });
  });

  describe('updateSession', () => {
    it('should update session data while preserving immutable fields', async () => {
      const sessionId = 'test-session';
      const existingSession: SessionData = {
        userId: 'user-123',
        email: 'test@example.com',
        roles: ['user'],
        preferences: { theme: 'dark' },
        createdAt: mockBaseDate,
        lastAccessedAt: mockBaseDate,
      };

      mockRedisService.get.mockResolvedValue(JSON.stringify(existingSession));

      const updates = { preferences: { theme: 'light' } };
      const success = await sessionService.updateSession(sessionId, updates);

      expect(success).toBe(true);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"theme":"light"'), // Updated
        expect.any(Number)
      );
    });

    it('should return false if session to update does not exist', async () => {
      mockRedisService.get.mockResolvedValue(null);
      const success = await sessionService.updateSession('miss', {});
      expect(success).toBe(false);
    });
  });

  describe('deleteSession', () => {
    it('should delete session from Redis', async () => {
      const sessionId = 'test-session';
      await sessionService.deleteSession(sessionId);
      expect(mockRedisService.delete).toHaveBeenCalledWith(
        CACHE_KEYS_PATTERNS.USER_SESSION(sessionId)
      );
    });
  });

  describe('cleanupExpiredSessions', () => {
    it('should remove sessions inactive for longer than threshold', async () => {
      const activeSession = {
        userId: 'u1',
        lastAccessedAt: mockBaseDate, // Active now
      };
      const expiredSession = {
        userId: 'u2',
        lastAccessedAt: new Date(mockBaseDate.getTime() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
      };

      mockRedisService.keys.mockResolvedValue(['session:1', 'session:2']);
      mockRedisService.get.mockImplementation(async (key) => {
        if (key === 'session:1') return JSON.stringify(activeSession);
        if (key === 'session:2') return JSON.stringify(expiredSession);
        return null;
      });

      const cleanedCount = await sessionService.cleanupExpiredSessions(7); // 7 days threshold

      expect(cleanedCount).toBe(1);
      expect(mockRedisService.delete).toHaveBeenCalledWith('session:2');
      expect(mockRedisService.delete).not.toHaveBeenCalledWith('session:1');
    });
  });
});

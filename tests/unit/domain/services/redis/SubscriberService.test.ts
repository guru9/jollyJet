import { SubscriberService } from '@/domain/services/redis/SubscriberService';
import { PUBSUB_CHANNELS, PUBSUB_EVENT_TYPES } from '@/shared/constants';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('SubscriberService', () => {
  let subscriberService: SubscriberService;
  let mockRedisService: jest.Mocked<any>;
  let mockLogger: jest.Mocked<any>;
  let mockRedisClient: any;

  beforeEach(() => {
    mockRedisClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      unsubscribe: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
      on: jest.fn().mockImplementation((_event: string, _handler: (...args: any[]) => void) => {
        // Store the handler for later use in tests
        // The handler will be called with specific arguments in individual tests
      }),
    };

    (Redis as unknown as jest.Mock).mockImplementation(() => mockRedisClient);

    mockRedisService = {
      getClient: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    subscriberService = new SubscriberService(mockRedisService, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('TC-SUB-001: SubscriberService Instantiation', () => {
    it('should create instance with dependencies', () => {
      expect(subscriberService).toBeDefined();
    });

    it('should have initial state: isConnected = false', () => {
      expect(subscriberService.getConnectionStatus()).toBe(false);
    });

    it('should have empty handlers map initially', () => {
      expect(subscriberService.getSubscribedChannels()).toEqual([]);
    });
  });

  describe('TC-SUB-002: Initialize with Redis Disabled', () => {
    it('should log warning when Redis is disabled', async () => {
      jest.mock('@/config', () => ({
        redisConfig: { disabled: true },
      }));

      await subscriberService.initialize();

      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Redis is disabled'));
    });
  });

  describe('TC-SUB-003: Successful Initialization', () => {
    it('should create Redis subscriber client', async () => {
      await subscriberService.initialize();

      expect(Redis).toHaveBeenCalled();
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should set isConnected to true after initialization', async () => {
      await subscriberService.initialize();

      expect(subscriberService.getConnectionStatus()).toBe(true);
    });

    it('should log success message', async () => {
      await subscriberService.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Subscriber client connected')
      );
    });
  });

  describe('TC-SUB-004: Double Initialization Prevention', () => {
    it('should prevent double initialization', async () => {
      await subscriberService.initialize();
      await subscriberService.initialize();

      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('already initialized'));
    });
  });

  describe('TC-SUB-005: Subscribe to Channel', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should register handler and subscribe to channel', () => {
      const handler = jest.fn();
      subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, handler);

      expect(mockRedisClient.subscribe).toHaveBeenCalledWith(PUBSUB_CHANNELS.PRODUCT);
      expect(subscriberService.getSubscribedChannels()).toContain(PUBSUB_CHANNELS.PRODUCT);
    });

    it('should log subscription success', () => {
      const handler = jest.fn();
      subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, handler);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Subscribed to channel')
      );
    });
  });

  describe('TC-SUB-006: Subscribe Before Initialization', () => {
    it('should throw error if subscribe called before initialize', () => {
      const handler = jest.fn();

      expect(() => {
        subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, handler);
      }).toThrow('Subscriber service not initialized');
    });
  });

  describe('TC-SUB-007: Message Handling', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should parse and route messages to handler', () => {
      const handler = jest.fn();
      subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, handler);

      const messageHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'message'
      )?.[1];

      const message = JSON.stringify({
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        payload: { productId: 'prod_456' },
      });

      if (messageHandler) {
        messageHandler(PUBSUB_CHANNELS.PRODUCT, message);
      }

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'evt_123',
          eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        })
      );
    });
  });

  describe('TC-SUB-008: Message Parse Error Handling', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should handle invalid JSON gracefully', () => {
      const handler = jest.fn();
      subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, handler);

      const messageHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'message'
      )?.[1];

      if (messageHandler) {
        messageHandler(PUBSUB_CHANNELS.PRODUCT, 'invalid json{{');
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining('Failed to parse message')
      );
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('TC-SUB-009: Handler Error Handling', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should catch handler errors without crashing', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
      subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, errorHandler);

      const messageHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'message'
      )?.[1];

      const message = JSON.stringify({
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        payload: {},
      });

      if (messageHandler) {
        await messageHandler(PUBSUB_CHANNELS.PRODUCT, message);
      }

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('TC-SUB-010: Unsubscribe from Channel', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should remove handler and unsubscribe from channel', async () => {
      const handler = jest.fn();
      subscriberService.subscribe(PUBSUB_CHANNELS.PRODUCT, handler);
      await subscriberService.unsubscribe(PUBSUB_CHANNELS.PRODUCT);

      expect(mockRedisClient.unsubscribe).toHaveBeenCalledWith(PUBSUB_CHANNELS.PRODUCT);
      expect(subscriberService.getSubscribedChannels()).not.toContain(PUBSUB_CHANNELS.PRODUCT);
    });
  });

  describe('TC-SUB-011: Unsubscribe Before Initialization', () => {
    it('should handle unsubscribe gracefully when not initialized', async () => {
      await subscriberService.unsubscribe(PUBSUB_CHANNELS.PRODUCT);

      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('Cannot unsubscribe'));
    });
  });

  describe('TC-SUB-012: Connection Error Handling', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should handle connection errors', () => {
      const errorHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'error'
      )?.[1];

      if (errorHandler) {
        errorHandler(new Error('Connection lost'));
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(Error),
        expect.stringContaining('Subscriber client error')
      );
    });
  });

  describe('TC-SUB-013: Disconnection and Reconnection', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should handle disconnection and set isConnected to false', () => {
      const endHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'end'
      )?.[1];

      if (endHandler) {
        endHandler();
      }

      expect(subscriberService.getConnectionStatus()).toBe(false);
      expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining('disconnected'));
    });
  });

  describe('TC-SUB-014: Max Reconnection Attempts', () => {
    it('should stop reconnecting after max attempts', async () => {
      await subscriberService.initialize();

      const retryStrategy = (Redis as unknown as jest.Mock).mock.calls[0][1]?.retryStrategy;

      if (retryStrategy) {
        const result = retryStrategy(6);
        expect(result).toBeUndefined();
      }
    });
  });

  describe('TC-SUB-015: Resubscribe After Reconnection', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should resubscribe to channels after reconnection', async () => {
      const handler = jest.fn();
      subscriberService.subscribe('channel1', handler);
      subscriberService.subscribe('channel2', handler);

      const readyHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'ready'
      )?.[1];

      if (readyHandler) {
        await readyHandler();
      }

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Resubscribed to channel')
      );
    });
  });

  describe('TC-SUB-016: Graceful Disconnect', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
      subscriberService.subscribe('channel1', jest.fn());
      subscriberService.subscribe('channel2', jest.fn());
    });

    it('should clean up resources on disconnect', async () => {
      await subscriberService.disconnect();

      expect(mockRedisClient.quit).toHaveBeenCalled();
      expect(subscriberService.getConnectionStatus()).toBe(false);
      expect(subscriberService.getSubscribedChannels()).toEqual([]);
    });

    it('should log disconnect success', async () => {
      await subscriberService.disconnect();

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Subscriber client disconnected')
      );
    });
  });

  describe('TC-SUB-017: Get Connection Status', () => {
    it('should return false before initialization', () => {
      expect(subscriberService.getConnectionStatus()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await subscriberService.initialize();
      expect(subscriberService.getConnectionStatus()).toBe(true);
    });

    it('should return false after disconnect', async () => {
      await subscriberService.initialize();
      await subscriberService.disconnect();
      expect(subscriberService.getConnectionStatus()).toBe(false);
    });
  });

  describe('TC-SUB-018: Get Subscribed Channels', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should return list of subscribed channels', () => {
      subscriberService.subscribe('channel1', jest.fn());
      subscriberService.subscribe('channel2', jest.fn());
      subscriberService.subscribe('channel3', jest.fn());

      const channels = subscriberService.getSubscribedChannels();

      expect(channels).toContain('channel1');
      expect(channels).toContain('channel2');
      expect(channels).toContain('channel3');
      expect(channels).toHaveLength(3);
    });

    it('should return empty array when no channels subscribed', () => {
      expect(subscriberService.getSubscribedChannels()).toEqual([]);
    });
  });

  describe('TC-SUB-019: Multiple Handlers Same Channel', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should replace previous handler when subscribing to same channel', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();

      subscriberService.subscribe('channel', handler1);
      subscriberService.subscribe('channel', handler2);

      const messageHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'message'
      )?.[1];

      const message = JSON.stringify({
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        payload: {},
      });

      if (messageHandler) {
        messageHandler('channel', message);
      }

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('TC-SUB-020: Wrong Channel Message Filtering', () => {
    beforeEach(async () => {
      await subscriberService.initialize();
    });

    it('should ignore messages from unsubscribed channels', () => {
      const handler = jest.fn();
      subscriberService.subscribe('channel1', handler);

      const messageHandler = mockRedisClient.on.mock.calls.find(
        (call: [string, (...args: any[]) => void]) => call[0] === 'message'
      )?.[1];

      const message = JSON.stringify({
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        payload: {},
      });

      if (messageHandler) {
        messageHandler('channel2', message);
      }

      expect(handler).not.toHaveBeenCalled();
    });
  });
});

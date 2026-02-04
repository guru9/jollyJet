import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { PublisherService } from '@/domain/services/redis/PublisherService';
import { PUBSUB_CHANNELS, PUBSUB_EVENT_TYPES } from '@/shared/constants';
import { Logger } from '@/shared/logger';

describe('PublisherService', () => {
  let publisherService: PublisherService;
  let mockRedisService: {
    getClient: jest.Mock<
      () => { publish: jest.Mock<(channel: string, message: string) => Promise<number>> }
    >;
  };
  let mockRedisClient: {
    publish: jest.Mock<(channel: string, message: string) => Promise<number>>;
  };
  let mockLogger: {
    info: jest.Mock<(obj: unknown, msg: string) => void>;
    error: jest.Mock<(obj: unknown, msg: string) => void>;
  };

  beforeEach(() => {
    mockRedisClient = {
      publish: jest.fn().mockResolvedValue(1),
    };
    mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
    };
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };
    publisherService = new PublisherService(
      mockRedisService as unknown as IRedisService,
      mockLogger as unknown as Logger
    );
  });

  describe('TC-PUB-001: PublisherService Instantiation', () => {
    it('should create instance with dependencies', () => {
      expect(publisherService).toBeDefined();
    });

    it('should have redisService and logger injected', () => {
      expect(mockRedisService.getClient).toBeDefined();
      expect(mockLogger.info).toBeDefined();
    });
  });

  describe('TC-PUB-002: Successful Message Publishing', () => {
    it('should publish message to Redis channel', async () => {
      const event = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        payload: { productId: 'prod_456', name: 'Test' },
      };

      await publisherService.publish(PUBSUB_CHANNELS.PRODUCT, event);

      expect(mockRedisClient.publish).toHaveBeenCalledWith(
        PUBSUB_CHANNELS.PRODUCT,
        JSON.stringify(event)
      );
    });

    it('should log success with message size', async () => {
      const event = { eventId: 'evt_123', eventType: 'TEST', payload: {} };

      await publisherService.publish('channel', event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ messageSize: expect.any(Number) }),
        expect.stringContaining('Published message')
      );
    });
  });

  describe('TC-PUB-003: Message Serialization', () => {
    it('should serialize complex events with nested objects', async () => {
      const complexEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date('2024-01-01T00:00:00Z'),
        payload: {
          productId: 'prod_456',
          name: 'Test Product',
          price: 99.99,
          metadata: { key: 'value', nested: { data: true } },
        },
      };

      await publisherService.publish(PUBSUB_CHANNELS.PRODUCT, complexEvent);

      const serializedCall = mockRedisClient.publish.mock.calls[0][1];
      const deserialized = JSON.parse(serializedCall);

      expect(deserialized.payload.metadata.nested.data).toBe(true);
      expect(deserialized.timestamp).toBe(complexEvent.timestamp.toISOString());
    });

    it('should convert Date objects to ISO strings', async () => {
      const event = {
        eventId: 'evt_123',
        eventType: 'TEST',
        timestamp: new Date('2024-06-15T10:30:00Z'),
        payload: {},
      };

      await publisherService.publish('channel', event);

      const serializedCall = mockRedisClient.publish.mock.calls[0][1];
      expect(serializedCall).toContain('2024-06-15T10:30:00.000Z');
    });
  });

  describe('TC-PUB-004: Publish Error Handling', () => {
    it('should log error and re-throw on publish failure', async () => {
      const publishError = new Error('Redis connection failed');
      mockRedisClient.publish.mockRejectedValue(publishError as never);

      const event = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        payload: { productId: 'prod_456' },
      };

      await expect(publisherService.publish(PUBSUB_CHANNELS.PRODUCT, event)).rejects.toThrow(
        'Redis connection failed'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        publishError,
        expect.stringContaining('Failed to publish')
      );
    });
  });

  describe('TC-PUB-005: Message Size Logging', () => {
    it('should log correct size for small messages', async () => {
      const smallEvent = { eventId: 'evt_1', eventType: 'TEST', payload: {} };

      await publisherService.publish('channel', smallEvent);

      const loggedSize = mockLogger.info.mock.calls[0][0].messageSize;
      const expectedSize = JSON.stringify(smallEvent).length;
      expect(loggedSize).toBe(expectedSize);
    });

    it('should log correct size for large messages', async () => {
      const largeEvent = {
        eventId: 'evt_2',
        eventType: 'TEST',
        payload: { data: 'x'.repeat(10000) },
      };

      await publisherService.publish('channel', largeEvent);

      const loggedSize = mockLogger.info.mock.calls[0][0].messageSize;
      const expectedSize = JSON.stringify(largeEvent).length;
      expect(loggedSize).toBe(expectedSize);
      expect(loggedSize).toBeGreaterThan(10000);
    });
  });

  describe('TC-PUB-006: Multiple Channel Publishing', () => {
    it('should publish to different channels', async () => {
      const productEvent = { eventId: 'evt_1', eventType: 'PRODUCT_CREATED', payload: {} };
      const auditEvent = { eventId: 'evt_2', eventType: 'USER_ACTIVITY', payload: {} };

      await publisherService.publish(PUBSUB_CHANNELS.PRODUCT, productEvent);
      await publisherService.publish(PUBSUB_CHANNELS.AUDIT, auditEvent);

      expect(mockRedisClient.publish).toHaveBeenCalledTimes(2);
      expect(mockRedisClient.publish).toHaveBeenNthCalledWith(
        1,
        PUBSUB_CHANNELS.PRODUCT,
        JSON.stringify(productEvent)
      );
      expect(mockRedisClient.publish).toHaveBeenNthCalledWith(
        2,
        PUBSUB_CHANNELS.AUDIT,
        JSON.stringify(auditEvent)
      );
    });

    it('should create separate log entries for each publish', async () => {
      await publisherService.publish('channel1', { id: 1 });
      await publisherService.publish('channel2', { id: 2 });

      expect(mockLogger.info).toHaveBeenCalledTimes(2);
    });
  });

  describe('TC-PUB-007: Empty Message Handling', () => {
    it('should handle empty object', async () => {
      await publisherService.publish('channel', {});

      expect(mockRedisClient.publish).toHaveBeenCalledWith('channel', '{}');
    });

    it('should handle null', async () => {
      await publisherService.publish('channel', null);

      expect(mockRedisClient.publish).toHaveBeenCalledWith('channel', 'null');
    });

    it('should handle undefined', async () => {
      await publisherService.publish('channel', undefined);

      // The implementation converts undefined to the string 'undefined' for safe publishing
      expect(mockRedisClient.publish).toHaveBeenCalledWith('channel', 'undefined');
    });
  });

  describe('TC-PUB-008: Concurrent Publishing', () => {
    it('should handle concurrent publish calls', async () => {
      const events = Array.from({ length: 10 }, (_, i) => ({
        eventId: `evt_${i}`,
        eventType: 'TEST',
        payload: { index: i },
      }));

      await Promise.all(events.map((event) => publisherService.publish('channel', event)));

      expect(mockRedisClient.publish).toHaveBeenCalledTimes(10);
      expect(mockLogger.info).toHaveBeenCalledTimes(10);
    });
  });

  describe('TC-PUB-009: Redis Client Retrieval', () => {
    it('should call getClient for each publish', async () => {
      await publisherService.publish('channel1', { id: 1 });
      await publisherService.publish('channel2', { id: 2 });

      expect(mockRedisService.getClient).toHaveBeenCalledTimes(2);
    });
  });

  describe('TC-PUB-010: Circular Reference Handling', () => {
    it('should throw error for circular reference', async () => {
      const obj: Record<string, unknown> = { id: '1', data: 'test' };
      obj.self = obj;

      await expect(publisherService.publish('channel', obj)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});

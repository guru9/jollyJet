import { BaseEvent } from '@/domain/events';
import { EventHandler } from '@/domain/services/events/EventHandler';
import { PUBSUB_CHANNELS, PUBSUB_EVENT_TYPES } from '@/shared/constants';

// Concrete implementation for testing
class TestEventHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;
  public handleCallCount = 0;

  async handle(event: BaseEvent): Promise<void> {
    this.handleCallCount++;
    await this.executeWithRetry(async () => {
      // Test implementation
    }, event.eventId);
  }
}

// Implementation that fails then succeeds
class RetrySuccessHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;
  public attempts = 0;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      this.attempts++;
      if (this.attempts < 3) {
        throw new Error(`Attempt ${this.attempts} failed`);
      }
    }, event.eventId);
  }
}

// Implementation that always fails
class AlwaysFailHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 3;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      throw new Error('Persistent failure');
    }, event.eventId);
  }
}

// Implementation with custom retry delay
class CustomDelayHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 2;
  protected readonly retryDelayMs = 100;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      throw new Error('Fail');
    }, event.eventId);
  }
}

// Implementation with zero retries
class NoRetryHandler extends EventHandler<BaseEvent> {
  protected readonly maxRetries = 0;

  async handle(event: BaseEvent): Promise<void> {
    await this.executeWithRetry(async () => {
      throw new Error('Fail');
    }, event.eventId);
  }
}

describe('EventHandler', () => {
  let mockLogger: jest.Mocked<any>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };
  });

  describe('TC-EH-001: EventHandler Instantiation', () => {
    it('should not allow direct instantiation of abstract class', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new (EventHandler as any)(mockLogger);
      }).toThrow();
    });
  });

  describe('TC-EH-002: Concrete Handler Implementation', () => {
    it('should allow concrete handler to extend EventHandler', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(handler).toBeDefined();
      expect(handler['maxRetries']).toBe(3);
    });

    it('should inject logger into concrete handler', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(handler['logger']).toBe(mockLogger);
    });
  });

  describe('TC-EH-003: Execute With Retry - Success on First Attempt', () => {
    it('should succeed without retry on first attempt', async () => {
      const handler = new TestEventHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      await handler.handle(event);

      expect(handler.handleCallCount).toBe(1);
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('TC-EH-004: Execute With Retry - Success on Retry', () => {
    it('should retry and eventually succeed', async () => {
      const handler = new RetrySuccessHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      await handler.handle(event);

      expect(handler.attempts).toBe(3);
      expect(mockLogger.warn).toHaveBeenCalledTimes(2);
    });

    it('should log retry attempts with correct context', async () => {
      const handler = new RetrySuccessHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      await handler.handle(event);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'evt_123',
          attempt: expect.any(Number),
          maxRetries: 3,
          error: expect.any(String),
        }),
        expect.stringContaining('Event handling failed')
      );
    });
  });

  describe('TC-EH-005: Execute With Retry - All Retries Exhausted', () => {
    it('should throw error when all retries fail', async () => {
      const handler = new AlwaysFailHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      await expect(handler.handle(event)).rejects.toThrow('Persistent failure');
    });

    it('should log final error with attempt count', async () => {
      const handler = new AlwaysFailHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      try {
        await handler.handle(event);
      } catch {
        // Expected
      }

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'evt_123',
          attempts: 3,
          error: 'Persistent failure',
        }),
        expect.stringContaining('Event handling failed after all retries')
      );
    });
  });

  describe('TC-EH-006: Exponential Backoff Timing', () => {
    it('should use exponential backoff between retries', async () => {
      // Create handler with custom retry delay
      class FastFailHandler extends EventHandler<BaseEvent> {
        protected readonly maxRetries = 3;
        protected readonly retryDelayMs = 10; // Fast for testing

        async handle(event: BaseEvent): Promise<void> {
          await this.executeWithRetry(async () => {
            throw new Error('Persistent failure');
          }, event.eventId);
        }
      }

      const handler = new FastFailHandler(mockLogger);

      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      const startTime = Date.now();
      try {
        await handler.handle(event);
      } catch {
        // Expected
      }
      const endTime = Date.now();

      // With 3 retries and 10ms base: 10ms + 20ms = ~30ms minimum
      // With 3 retries and 10ms base: 10ms + 20ms = ~30ms minimum
      expect(endTime - startTime).toBeGreaterThanOrEqual(25);
    });
  });

  describe('TC-EH-007: Log Event Received', () => {
    it('should log event received with correct information', () => {
      const handler = new TestEventHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date('2024-01-01T00:00:00Z'),
        correlationId: 'req-456',
      };

      handler['logEventReceived'](event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'evt_123',
          eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
          correlationId: 'req-456',
          timestamp: event.timestamp,
        }),
        'Received PRODUCT_CREATED event'
      );
    });
  });

  describe('TC-EH-008: Log Event Success', () => {
    it('should log event success with correct information', () => {
      const handler = new TestEventHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        correlationId: 'req-456',
      };

      handler['logEventSuccess'](event);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'evt_123',
          eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
          correlationId: 'req-456',
        }),
        'Successfully processed PRODUCT_CREATED event'
      );
    });
  });

  describe('TC-EH-009: Log Event Error', () => {
    it('should log event error with correct information', () => {
      const handler = new TestEventHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        correlationId: 'req-456',
      };
      const error = new Error('Processing failed');

      handler['logEventError'](event, error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'evt_123',
          eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
          correlationId: 'req-456',
          error: 'Processing failed',
          stack: error.stack,
        }),
        'Error processing PRODUCT_CREATED event'
      );
    });
  });

  describe('TC-EH-010: Send to DLQ', () => {
    it('should publish DLQ event with correct structure', async () => {
      const handler = new TestEventHandler(mockLogger);
      const mockPublisher = { publish: jest.fn().mockResolvedValue(undefined) };
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
        correlationId: 'req-456',
      };
      const error = new Error('Processing failed');

      await handler['sendToDLQ'](event, error, mockPublisher);

      expect(mockPublisher.publish).toHaveBeenCalledWith(
        PUBSUB_CHANNELS.DLQ,
        expect.objectContaining({
          originalEvent: event,
          error: expect.objectContaining({
            message: 'Processing failed',
            stack: error.stack,
            timestamp: expect.any(Date),
          }),
          failedAt: expect.any(Date),
        })
      );
    });

    it('should log DLQ send operation', async () => {
      const handler = new TestEventHandler(mockLogger);
      const mockPublisher = { publish: jest.fn().mockResolvedValue(undefined) };
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };
      const error = new Error('Processing failed');

      await handler['sendToDLQ'](event, error, mockPublisher);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          eventId: 'evt_123',
          eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
          error: 'Processing failed',
        }),
        'Sending event to DLQ after failed processing'
      );
    });
  });

  describe('TC-EH-011: Send to DLQ Without Publisher', () => {
    it('should log error without publishing when no publisher provided', async () => {
      const handler = new TestEventHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };
      const error = new Error('Processing failed');

      await handler['sendToDLQ'](event, error);

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('TC-EH-012: Send to DLQ Publish Failure', () => {
    it('should handle DLQ publish failure gracefully', async () => {
      const handler = new TestEventHandler(mockLogger);
      const mockPublisher = {
        publish: jest.fn().mockRejectedValue(new Error('Publish failed')),
      };
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };
      const error = new Error('Processing failed');

      await expect(handler['sendToDLQ'](event, error, mockPublisher)).resolves.not.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(Error),
        'Failed to publish event to DLQ'
      );
    });
  });

  describe('TC-EH-013: Validate Event - Valid', () => {
    it('should return true for valid events', () => {
      const handler = new TestEventHandler(mockLogger);
      const validEvent = {
        eventId: 'evt_123',
        eventType: 'TEST',
        timestamp: new Date(),
      };

      const result = handler['validateEvent'](validEvent);

      expect(result).toBe(true);
    });
  });

  describe('TC-EH-014: Validate Event - Invalid', () => {
    it('should return false for null', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(handler['validateEvent'](null)).toBe(false);
    });

    it('should return false for undefined', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(handler['validateEvent'](undefined)).toBe(false);
    });

    it('should return false for empty object', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(handler['validateEvent']({})).toBe(false);
    });

    it('should return false for missing eventType', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(handler['validateEvent']({ eventId: 'evt_123', timestamp: new Date() })).toBe(false);
    });

    it('should return false for missing timestamp', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(handler['validateEvent']({ eventId: 'evt_123', eventType: 'TEST' })).toBe(false);
    });

    it('should return false for wrong eventId type', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(
        handler['validateEvent']({ eventId: 123, eventType: 'TEST', timestamp: new Date() })
      ).toBe(false);
    });

    it('should return false for wrong eventType type', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(
        handler['validateEvent']({ eventId: 'evt_123', eventType: 123, timestamp: new Date() })
      ).toBe(false);
    });

    it('should return false for wrong timestamp type', () => {
      const handler = new TestEventHandler(mockLogger);
      expect(
        handler['validateEvent']({ eventId: 'evt_123', eventType: 'TEST', timestamp: '2024-01-01' })
      ).toBe(false);
    });
  });

  describe('TC-EH-015: Custom Retry Delay', () => {
    it('should use custom retry delay', async () => {
      const handler = new CustomDelayHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      const startTime = Date.now();
      try {
        await handler.handle(event);
      } catch {
        // Expected
      }
      const endTime = Date.now();

      // With 2 retries and 100ms base: 100ms = ~100ms minimum
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });
  });

  describe('TC-EH-016: Zero Max Retries', () => {
    it('should not retry when maxRetries is 0', async () => {
      const handler = new NoRetryHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      await expect(handler.handle(event)).rejects.toThrow('Fail');
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });
  });

  describe('TC-EH-017: Async Operation in Retry', () => {
    it('should handle async operations in retry', async () => {
      class AsyncHandler extends EventHandler<BaseEvent> {
        protected readonly maxRetries = 2;
        public asyncOperationCalled = false;

        async handle(event: BaseEvent): Promise<void> {
          await this.executeWithRetry(async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            this.asyncOperationCalled = true;
          }, event.eventId);
        }
      }

      const handler = new AsyncHandler(mockLogger);
      const event: BaseEvent = {
        eventId: 'evt_123',
        eventType: PUBSUB_EVENT_TYPES.PRODUCT_CREATED,
        timestamp: new Date(),
      };

      await handler.handle(event);

      expect(handler.asyncOperationCalled).toBe(true);
    });
  });
});

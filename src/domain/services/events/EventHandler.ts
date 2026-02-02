/**
 * Event Handler Base Class
 *
 * Provides common functionality for all event handlers in the Pub/Sub system.
 * This abstract class implements retry logic, error handling, and structured logging
 * that all event handlers need.
 *
 * Key Features:
 * - Configurable retry logic with exponential backoff
 * - Structured logging for event processing
 * - Error categorization (transient vs permanent)
 * - Event metadata tracking (timing, correlation IDs)
 * - Dead Letter Queue (DLQ) support for failed events
 *
 * Usage:
 * ```typescript
 * @injectable()
 * export class ProductCreatedHandler extends EventHandler<ProductCreatedEvent> {
 *   protected readonly maxRetries = 3;
 *
 *   async handle(event: ProductCreatedEvent): Promise<void> {
 *     this.logEventReceived(event);
 *
 *     await this.executeWithRetry(async () => {
 *       // Your business logic here
 *       await sendNotification(event.payload.productId);
 *     }, event.eventId);
 *
 *     this.logEventSuccess(event);
 *   }
 * }
 * ```
 *
 * Retry Strategy:
 * - Exponential backoff: 1s, 2s, 4s, 8s, etc.
 * - Maximum retry attempts configurable per handler
 * - Transient errors are retried, permanent errors go to DLQ
 *
 * Error Handling:
 * - All errors are logged with context (event ID, event type, correlation ID)
 * - Failed events after max retries can be sent to DLQ
 * - Handlers should be idempotent as events may be redelivered
 *
 * @template T - The specific event type this handler processes
 *
 * @see ProductCreatedEvent
 * @see ProductUpdatedEvent
 * @see ProductDeletedEvent
 * @see UserActivityEvent
 * @see PUBSUB_MESSAGES
 */

import { inject } from 'tsyringe';
import { DI_TOKENS, PUBSUB_CHANNELS, PUBSUB_MESSAGES } from '../../../shared/constants';
import { Logger } from '../../../shared/logger';
import { BaseEvent } from '../../events';

/**
 * Abstract base class for all event handlers.
 *
 * @template T - The specific event type this handler processes, must extend BaseEvent
 */
export abstract class EventHandler<T extends BaseEvent> {
  /**
   * Maximum number of retry attempts for transient errors.
   * Override in subclasses to customize retry behavior.
   *
   * @default 3
   */
  protected abstract readonly maxRetries: number;

  /**
   * Delay in milliseconds between retry attempts.
   * Uses exponential backoff: delay * (2 ^ attempt)
   *
   * @default 1000 (1 second)
   */
  protected readonly retryDelayMs: number = 1000;

  /**
   * Creates an instance of EventHandler.
   *
   * @param logger - Logger for structured event logging
   */
  constructor(@inject(DI_TOKENS.LOGGER) protected logger: Logger) {}

  /**
   * Main entry point for processing events.
   *
   * Subclasses must implement this method to define their event processing logic.
   * The base class provides retry and logging infrastructure.
   *
   * @param event - The event to process
   * @returns Promise that resolves when processing is complete
   * @throws Error if processing fails after all retries
   *
   * @example
   * ```typescript
   * async handle(event: ProductCreatedEvent): Promise<void> {
   *   this.logEventReceived(event);
   *
   *   await this.executeWithRetry(async () => {
   *     await this.notificationService.sendProductCreatedAlert(event.payload);
   *   }, event.eventId);
   *
   *   this.logEventSuccess(event);
   * }
   * ```
   */
  abstract handle(event: T): Promise<void>;

  /**
   * Execute an operation with retry logic.
   *
   * This method implements exponential backoff retry strategy for transient errors.
   * It logs each retry attempt and provides detailed error information on failure.
   *
   * @param operation - The async operation to execute
   * @param eventId - The ID of the event being processed (for logging)
   * @returns Promise that resolves when the operation succeeds
   * @throws The last error encountered if all retries are exhausted
   *
   * @example
   * ```typescript
   * await this.executeWithRetry(async () => {
   *   await this.externalApi.call(event.payload);
   * }, event.eventId);
   * ```
   */
  protected async executeWithRetry(operation: () => Promise<void>, eventId: string): Promise<void> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Attempt the operation
        await operation();

        // Success - exit the retry loop
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if we should retry
        if (attempt < this.maxRetries) {
          // Log retry attempt
          this.logger.warn(
            {
              eventId,
              attempt,
              maxRetries: this.maxRetries,
              error: lastError.message,
            },
            PUBSUB_MESSAGES.EVENT_HANDLING_FAILED(attempt, this.maxRetries)
          );

          // Calculate delay with exponential backoff
          const delayMs = this.retryDelayMs * Math.pow(2, attempt - 1);

          // Wait before retrying
          await this.delay(delayMs);
        }
      }
    }

    // All retries exhausted - throw the last error
    this.logger.error(
      {
        eventId,
        attempts: this.maxRetries,
        error: lastError?.message,
        stack: lastError?.stack,
      },
      PUBSUB_MESSAGES.EVENT_HANDLING_FAILED_ALL_RETRIES
    );

    throw lastError;
  }

  /**
   * Log event received.
   *
   * Logs when an event is received for processing. Includes event metadata
   * for traceability.
   *
   * @param event - The event being processed
   */
  protected logEventReceived(event: T): void {
    this.logger.info(
      {
        eventId: event.eventId,
        eventType: event.eventType,
        correlationId: event.correlationId,
        timestamp: event.timestamp,
      },
      `Received ${event.eventType} event`
    );
  }

  /**
   * Log successful event processing.
   *
   * Logs when an event has been successfully processed.
   *
   * @param event - The event that was processed
   */
  protected logEventSuccess(event: T): void {
    this.logger.info(
      {
        eventId: event.eventId,
        eventType: event.eventType,
        correlationId: event.correlationId,
      },
      `Successfully processed ${event.eventType} event`
    );
  }

  /**
   * Log event processing error.
   *
   * Logs errors that occur during event processing with full context.
   *
   * @param event - The event being processed
   * @param error - The error that occurred
   */
  protected logEventError(event: T, error: Error): void {
    this.logger.error(
      {
        eventId: event.eventId,
        eventType: event.eventType,
        correlationId: event.correlationId,
        error: error.message,
        stack: error.stack,
      },
      `Error processing ${event.eventType} event`
    );
  }

  /**
   * Send an event to the Dead Letter Queue (DLQ).
   *
   * When an event fails processing after all retries, it can be sent to the DLQ
   * for later analysis and potential reprocessing.
   *
   * @param event - The failed event
   * @param error - The error that caused the failure
   * @param publisherService - Optional publisher service to publish to DLQ
   */
  protected async sendToDLQ(
    event: T,
    error: Error,
    publisherService?: { publish: (channel: string, message: any) => Promise<void> }
  ): Promise<void> {
    const dlqEvent = {
      originalEvent: event,
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
      },
      failedAt: new Date(),
    };

    this.logger.error(
      {
        eventId: event.eventId,
        eventType: event.eventType,
        error: error.message,
      },
      PUBSUB_MESSAGES.DLQ_PUSHED(event.eventId, event.eventType)
    );

    // If publisher service is provided, publish to DLQ channel
    if (publisherService) {
      try {
        await publisherService.publish(PUBSUB_CHANNELS.DLQ, dlqEvent);
      } catch (publishError) {
        this.logger.error(
          publishError instanceof Error ? publishError : new Error(String(publishError)),
          'Failed to publish event to DLQ'
        );
      }
    }
  }

  /**
   * Delay utility for retry logic.
   *
   * Returns a promise that resolves after the specified number of milliseconds.
   *
   * @param ms - Number of milliseconds to delay
   * @returns Promise that resolves after the delay
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate event structure.
   *
   * Checks if the event has all required fields of a BaseEvent.
   * Can be overridden by subclasses for additional validation.
   *
   * @param event - The event to validate
   * @returns True if the event is valid
   */
  protected validateEvent(event: any): event is T {
    return (
      event &&
      typeof event.eventId === 'string' &&
      typeof event.eventType === 'string' &&
      event.timestamp instanceof Date
    );
  }
}

// src/domain/interfaces/redis/IPublisherService.ts

/**
 * Publisher Service Interface
 * Defines the contract for publishing events to Redis channels
 */
export interface IPublisherService {
  /**
   * Publishes a message to a Redis channel
   * @param channel - The channel name to publish to
   * @param message - The message payload to publish
   * @returns Promise that resolves when message is published
   * @throws Error if publishing fails
   */
  publish(channel: string, message: any): Promise<void>;
}

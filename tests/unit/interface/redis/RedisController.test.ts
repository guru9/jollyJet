import { RedisController } from '@/interface/controllers/redis/RedisController';
import { Logger } from '@/shared/logger';
import { Request, Response } from 'express';
import { MockRedisService } from '../../../mocks/redis/MockRedisService';

describe('RedisController', () => {
  let redisController: RedisController;
  let mockRedisService: MockRedisService;
  let mockLogger: Logger;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeAll(() => {
    // Setup mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    // Setup mock Redis service
    mockRedisService = new MockRedisService(mockLogger);

    // Setup RedisController with mocked dependencies
    redisController = new RedisController(mockRedisService, mockLogger);

    // Setup mock request and response
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear the mock Redis store
    mockRedisService['store'].clear();
  });

  describe('getCacheStats', () => {
    it('should return cache statistics successfully', async () => {
      // Setup test data
      await mockRedisService.set('test:key1', 'value1', 60);
      await mockRedisService.set('test:key2', 'value2', 120);

      // Call the method
      await redisController.getCacheStats(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({
          hitRate: 95.5,
          totalRequests: 1000,
          cacheHits: 955,
          cacheMisses: 45,
          keysCount: 2,
          isConnected: true,
        }),
      });
    });

    it('should handle errors and return 500 status', async () => {
      // Mock an error in the Redis service
      const error = new Error('Redis connection failed');
      jest.spyOn(mockRedisService, 'getClient').mockImplementationOnce(() => {
        throw error;
      });

      // Call the method
      await redisController.getCacheStats(mockRequest as Request, mockResponse as Response);

      // Verify error handling
      expect(mockLogger.error).toHaveBeenCalledWith(`Error getting cache stats: ${error.message}`);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error retrieving cache statistics',
      });
    });
  });

  describe('checkCacheKey', () => {
    it('should return key existence and TTL for existing key', async () => {
      // Setup test data
      const testKey = 'test:existing';
      await mockRedisService.set(testKey, 'value', 60);

      // Setup request with key parameter
      mockRequest.query = { key: testKey };

      // Call the method
      await redisController.checkCacheKey(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          key: testKey,
          exists: true,
          ttl: expect.any(Number),
        },
      });
    });

    it('should return key does not exist for non-existing key', async () => {
      // Setup request with non-existing key
      mockRequest.query = { key: 'test:nonexisting' };

      // Call the method
      await redisController.checkCacheKey(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          key: 'test:nonexisting',
          exists: false,
          ttl: null,
        },
      });
    });

    it('should return 400 status for missing key parameter', async () => {
      // Setup request without key parameter
      mockRequest.query = {};

      // Call the method
      await redisController.checkCacheKey(mockRequest as Request, mockResponse as Response);

      // Verify error handling
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Key parameter is required',
      });
    });

    it('should handle errors and return 500 status', async () => {
      // Setup request with key parameter
      mockRequest.query = { key: 'test:error' };

      // Mock an error in the Redis service
      const error = new Error('Redis operation failed');
      jest.spyOn(mockRedisService, 'getClient').mockImplementationOnce(() => {
        throw error;
      });

      // Call the method
      await redisController.checkCacheKey(mockRequest as Request, mockResponse as Response);

      // Verify error handling
      expect(mockLogger.error).toHaveBeenCalledWith(`Error checking cache key: ${error.message}`);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error checking cache key',
      });
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache by pattern and return deleted count', async () => {
      // Setup test data
      await mockRedisService.set('products:page:1', 'value1', 60);
      await mockRedisService.set('products:page:2', 'value2', 60);
      await mockRedisService.set('users:profile:1', 'value3', 60);

      // Setup request with pattern
      mockRequest.query = { pattern: 'products:*' };

      // Call the method
      await redisController.invalidateCache(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          pattern: 'products:*',
          deletedCount: 2,
        },
      });

      // Verify keys were deleted
      const remainingKeys = await mockRedisService.keys('*');
      expect(remainingKeys).toHaveLength(1);
      expect(remainingKeys[0]).toBe('users:profile:1');
    });

    it('should return 400 status for missing pattern parameter', async () => {
      // Setup request without pattern parameter
      mockRequest.query = {};

      // Call the method
      await redisController.invalidateCache(mockRequest as Request, mockResponse as Response);

      // Verify error handling
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Pattern parameter is required',
      });
    });

    it('should handle errors and return 500 status', async () => {
      // Setup request with pattern
      mockRequest.query = { pattern: 'test:*' };

      // Mock an error in the Redis service
      const error = new Error('Redis operation failed');
      jest.spyOn(mockRedisService, 'keys').mockRejectedValueOnce(error);

      // Call the method
      await redisController.invalidateCache(mockRequest as Request, mockResponse as Response);

      // Verify error handling
      expect(mockLogger.error).toHaveBeenCalledWith(`Error invalidating cache: ${error.message}`);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error invalidating cache',
      });
    });
  });

  describe('getCacheStatus', () => {
    it('should return connected status when Redis is connected', async () => {
      // Call the method
      await redisController.getCacheStatus(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          isConnected: true,
          message: 'Redis connection is healthy',
        },
      });
    });

    it('should return not connected status when Redis is disconnected', async () => {
      // Disconnect the mock Redis service
      mockRedisService.setConnectionState(false);

      // Call the method
      await redisController.getCacheStatus(mockRequest as Request, mockResponse as Response);

      // Verify response
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          isConnected: false,
          message: 'Redis connection is not active',
        },
      });
    });

    it('should handle errors and return 500 status', async () => {
      // Mock an error in the Redis service
      const error = new Error('Redis connection check failed');
      jest.spyOn(mockRedisService, 'isConnected').mockImplementationOnce(() => {
        throw error;
      });

      // Call the method
      await redisController.getCacheStatus(mockRequest as Request, mockResponse as Response);

      // Verify error handling
      expect(mockLogger.error).toHaveBeenCalledWith(`Error getting cache status: ${error.message}`);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Error getting cache status',
      });
    });
  });
});

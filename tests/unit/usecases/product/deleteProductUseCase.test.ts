import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { IPublisherService } from '@/domain/interfaces/redis/IPublisherService';
import { CacheService } from '@/domain/services/cache/CacheService';
import { Logger } from '@/shared';
import { DeleteProductUseCase } from '@/usecases';
import { Types } from 'mongoose';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockCacheService: jest.Mocked<CacheService>;
  let mockPublisherService: jest.Mocked<IPublisherService>;
  let existingProduct: Product;

  beforeEach(() => {
    const validId = new Types.ObjectId().toString();
    existingProduct = new Product({
      id: validId,
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 10,
      category: 'Test Category',
      isActive: true,
    });

    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      fatal: jest.fn(),
      trace: jest.fn(),
      silent: jest.fn(),
      level: 'info',
      isLevelEnabled: jest.fn(),
      child: jest.fn(),
      flush: jest.fn(),
      useOnlyCustomLevels: false,
    } as unknown as jest.Mocked<Logger>;

    mockCacheService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPattern: jest.fn(),
      getOrSet: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;

    mockPublisherService = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<IPublisherService>;

    useCase = new DeleteProductUseCase(
      mockRepository,
      mockLogger,
      mockCacheService,
      mockPublisherService
    );
  });

  describe('execute method', () => {
    it('should successfully delete an existing product', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockResolvedValue(true);

      const result = await useCase.execute(existingProduct.toProps().id!);

      expect(mockRepository.findById).toHaveBeenCalledWith(existingProduct.toProps().id);
      expect(mockRepository.delete).toHaveBeenCalledWith(existingProduct.toProps().id);
      expect(result).toBe(true);
    });

    it('should return false when product does not exist', async () => {
      const validId = new Types.ObjectId().toString();
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validId);

      expect(mockRepository.findById).toHaveBeenCalledWith(validId);
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should throw error for empty product ID', async () => {
      await expect(useCase.execute('')).rejects.toThrow('Product ID is required for deletion.');
      await expect(useCase.execute('   ')).rejects.toThrow('Product ID is required for deletion.');
    });

    it('should throw error for null/undefined product ID', async () => {
      await expect(useCase.execute(null as unknown as string)).rejects.toThrow(
        'Product ID is required for deletion.'
      );
      await expect(useCase.execute(undefined as unknown as string)).rejects.toThrow(
        'Product ID is required for deletion.'
      );
    });

    it('should handle repository delete failure', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockResolvedValue(false);

      const result = await useCase.execute(existingProduct.toProps().id!);

      expect(mockRepository.findById).toHaveBeenCalledWith(existingProduct.toProps().id);
      expect(mockRepository.delete).toHaveBeenCalledWith(existingProduct.toProps().id);
      expect(result).toBe(false);
    });

    it('should handle repository errors during findById', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute(existingProduct.toProps().id!)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
      const error = new Error('Delete operation failed');
      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockRejectedValue(error);

      await expect(useCase.execute(existingProduct.toProps().id!)).rejects.toThrow(
        'Delete operation failed'
      );
    });
  });

  describe('dependency injection', () => {
    it('should inject repository dependency', () => {
      expect(useCase).toBeInstanceOf(DeleteProductUseCase);
    });
  });

  describe('business logic validation', () => {
    it('should validate product exists before deletion', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(existingProduct.toProps().id!);

      expect(mockRepository.findById).toHaveBeenCalledWith(existingProduct.toProps().id);
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should prevent deletion of non-existent products', async () => {
      const validId = new Types.ObjectId().toString();
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validId);

      expect(result).toBe(false);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const dbError = new Error('MongoDB connection lost');
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(useCase.execute(existingProduct.toProps().id!)).rejects.toThrow(
        'MongoDB connection lost'
      );
    });

    it('should handle network timeouts gracefully', async () => {
      const timeoutError = new Error('Operation timed out');
      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockRejectedValue(timeoutError);

      await expect(useCase.execute(existingProduct.toProps().id!)).rejects.toThrow(
        'Operation timed out'
      );
    });
  });
});

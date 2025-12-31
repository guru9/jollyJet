import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { Logger } from '@/shared';
import { GetProductUseCase } from '@/usecases';

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
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
    } as any;

    useCase = new GetProductUseCase(mockRepository, mockLogger);
  });

  describe('execute method', () => {
    it('should retrieve a product by ID successfully', async () => {
      const mockProduct = new Product({
        id: '1',
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      });

      mockRepository.findById.mockResolvedValue(mockProduct);

      const result = await useCase.execute('1');

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toBeInstanceOf(Product);
      if (result) {
        expect(result.toProps().id).toBe('1');
        expect(result.toProps().name).toBe('Test Product');
      }
    });

    it('should return null if product is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('non-existent-id');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
      expect(result).toBeNull();
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute('1')).rejects.toThrow('Database error');
    });
  });

  describe('dependency injection', () => {
    it('should inject repository dependency', () => {
      expect(useCase).toBeInstanceOf(GetProductUseCase);
      // The constructor properly injects the dependencies
    });
  });
});

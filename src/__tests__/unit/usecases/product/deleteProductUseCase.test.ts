import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { DeleteProductUseCase } from '@/usecases';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let existingProduct: Product;

  beforeEach(() => {
    existingProduct = new Product({
      id: '1',
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

    useCase = new DeleteProductUseCase(mockRepository);
  });

  describe('execute method', () => {
    it('should successfully delete an existing product', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockResolvedValue(true);

      const result = await useCase.execute('1');

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should return false when product does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('non-existent-id');

      expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
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

      const result = await useCase.execute('1');

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toBe(false);
    });

    it('should handle repository errors during findById', async () => {
      const error = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(error);

      await expect(useCase.execute('1')).rejects.toThrow('Database connection failed');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle repository errors during delete', async () => {
      const error = new Error('Delete operation failed');
      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockRejectedValue(error);

      await expect(useCase.execute('1')).rejects.toThrow('Delete operation failed');
    });
  });

  describe('dependency injection', () => {
    it('should inject repository dependency', () => {
      expect(useCase).toBeInstanceOf(DeleteProductUseCase);
      // The constructor properly injects the dependencies
    });
  });

  describe('business logic validation', () => {
    it('should validate product exists before deletion', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('1');

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockRepository.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should prevent deletion of non-existent products', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute('invalid-id');

      expect(result).toBe(false);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should propagate repository errors', async () => {
      const dbError = new Error('MongoDB connection lost');
      mockRepository.findById.mockRejectedValue(dbError);

      await expect(useCase.execute('1')).rejects.toThrow('MongoDB connection lost');
    });

    it('should handle network timeouts gracefully', async () => {
      const timeoutError = new Error('Operation timed out');
      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.delete.mockRejectedValue(timeoutError);

      await expect(useCase.execute('1')).rejects.toThrow('Operation timed out');
    });
  });
});

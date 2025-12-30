import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { ToggleWishlistDTO } from '@/interface/dtos';
import { ToggleWishlistProductUseCase } from '@/usecases';

describe('ToggleWishlistProductUseCase', () => {
  let useCase: ToggleWishlistProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      toggleWishlistStatus: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    useCase = new ToggleWishlistProductUseCase(mockRepository);
  });

  describe('execute method', () => {
    it('should toggle wishlist status successfully', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: true };

      const existingProduct = new Product({
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
        isWishlistStatus: false,
        wishlistCount: 0,
      });

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        isWishlistStatus: true,
        wishlistCount: 1,
      });

      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.toggleWishlistStatus.mockResolvedValue(updatedProduct);

      const result = await useCase.execute(productId, wishlistData);

      expect(mockRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockRepository.toggleWishlistStatus).toHaveBeenCalledWith(productId, true);
      expect(result).toBeInstanceOf(Product);
      expect(result.toProps().isWishlistStatus).toBe(true);
    });

    it('should throw error when product not found', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: true };

      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(productId, wishlistData)).rejects.toThrow('Product not found.');
      expect(mockRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockRepository.toggleWishlistStatus).not.toHaveBeenCalled();
    });

    it('should throw error for empty product ID', async () => {
      const productId = '';
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: true };

      await expect(useCase.execute(productId, wishlistData)).rejects.toThrow(
        'Product ID is required for wishlist toggle.'
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.toggleWishlistStatus).not.toHaveBeenCalled();
    });

    it('should throw error for null/undefined product ID', async () => {
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: true };

      await expect(useCase.execute(null as unknown as string, wishlistData)).rejects.toThrow(
        'Product ID is required for wishlist toggle.'
      );
      await expect(useCase.execute(undefined as unknown as string, wishlistData)).rejects.toThrow(
        'Product ID is required for wishlist toggle.'
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.toggleWishlistStatus).not.toHaveBeenCalled();
    });

    it('should handle toggling to false', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: false };

      const existingProduct = new Product({
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
        isWishlistStatus: true,
        wishlistCount: 5,
      });

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        isWishlistStatus: false,
        wishlistCount: 4,
      });

      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.toggleWishlistStatus.mockResolvedValue(updatedProduct);

      const result = await useCase.execute(productId, wishlistData);

      expect(mockRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockRepository.toggleWishlistStatus).toHaveBeenCalledWith(productId, false);
      expect(result).toBeInstanceOf(Product);
      expect(result.toProps().isWishlistStatus).toBe(false);
    });

    it('should handle repository errors during findById', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: true };

      mockRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      await expect(useCase.execute(productId, wishlistData)).rejects.toThrow(
        'Database connection failed'
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockRepository.toggleWishlistStatus).not.toHaveBeenCalled();
    });

    it('should handle repository errors during toggleWishlistStatus', async () => {
      const productId = '507f1f77bcf86cd799439011';
      const wishlistData: ToggleWishlistDTO = { isWishlistStatus: true };

      const existingProduct = new Product({
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
        isWishlistStatus: false,
        wishlistCount: 0,
      });

      mockRepository.findById.mockResolvedValue(existingProduct);
      mockRepository.toggleWishlistStatus.mockRejectedValue(new Error('Update failed'));

      await expect(useCase.execute(productId, wishlistData)).rejects.toThrow('Update failed');
      expect(mockRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockRepository.toggleWishlistStatus).toHaveBeenCalledWith(productId, true);
    });
  });

  describe('dependency injection', () => {
    it('should inject repository dependency', () => {
      expect(useCase).toBeInstanceOf(ToggleWishlistProductUseCase);
      // The constructor properly injects the dependency
    });
  });
});

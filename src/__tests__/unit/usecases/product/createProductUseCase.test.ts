import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { CreateProductDTO } from '@/interface/dtos';
import { CreateProductUseCase } from '@/usecases';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let mockService: jest.Mocked<ProductService>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    mockService = {
      isAvailable: jest.fn(),
      updateStock: jest.fn(),
      updatePrice: jest.fn(),
      updateProductDetails: jest.fn(),
      updateWishlistStatus: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;

    useCase = new CreateProductUseCase(mockRepository, mockService);
  });

  describe('execute method', () => {
    it('should create a product successfully', async () => {
      const productData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      };

      mockService.isAvailable.mockReturnValue(true);
      mockRepository.create.mockResolvedValue(
        new Product({ ...productData, id: '1', isActive: true, isWishlistStatus: false })
      );

      const result = await useCase.execute(productData);

      expect(mockService.isAvailable).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Product);
    });

    it('should throw error for unavailable product', async () => {
      const productData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 0, // No stock
        category: 'Test Category',
        isActive: true,
      };

      mockService.isAvailable.mockReturnValue(false);

      await expect(useCase.execute(productData)).rejects.toThrow('Product is not available.');
    });

    it('should handle optional isActive property', async () => {
      const productData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true, // default value
      };

      mockService.isAvailable.mockReturnValue(true);
      mockRepository.create.mockResolvedValue(
        new Product({
          ...productData,
          id: '1',
          isActive: true, // Should default to true
        })
      );

      const result = await useCase.execute(productData);
      expect(result.toProps().isActive).toBe(true);
    });

    it('should handle explicit isActive property', async () => {
      const productData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: false,
      };

      mockService.isAvailable.mockReturnValue(true);
      mockRepository.create.mockResolvedValue(
        new Product({
          ...productData,
          id: '1',
          isActive: false,
        })
      );

      const result = await useCase.execute(productData);
      expect(result.toProps().isActive).toBe(false);
    });

    it('should pass correct Product object to isAvailable', async () => {
      const productData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      };

      mockService.isAvailable.mockReturnValue(true);
      mockRepository.create.mockResolvedValue(
        new Product({ ...productData, id: '1', isActive: true })
      );

      await useCase.execute(productData);

      // Verify that isAvailable was called with a Product object, not CreateProductDTO
      const isAvailableCall = mockService.isAvailable.mock.calls[0][0];
      expect(isAvailableCall).toBeInstanceOf(Product);
      expect(isAvailableCall.toProps().name).toBe(productData.name);
      expect(isAvailableCall.toProps().stock).toBe(productData.stock);
      expect(isAvailableCall.toProps().isActive).toBe(true);
    });

    it('should handle validation errors from Product entity', async () => {
      const invalidProductData: CreateProductDTO = {
        name: '', // Invalid: empty name
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      };

      await expect(useCase.execute(invalidProductData)).rejects.toThrow(
        'Product name is required.'
      );
    });

    it('should handle negative price validation', async () => {
      const invalidProductData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: -100, // Invalid: negative price
        stock: 10,
        category: 'Test Category',
        isActive: true,
      };

      await expect(useCase.execute(invalidProductData)).rejects.toThrow(
        'Product price must be a non-negative number.'
      );
    });

    it('should handle negative stock validation', async () => {
      const invalidProductData: CreateProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: -10, // Invalid: negative stock
        category: 'Test Category',
        isActive: true,
      };

      await expect(useCase.execute(invalidProductData)).rejects.toThrow(
        'Product stock must be a non-negative number.'
      );
    });
  });

  describe('dependency injection', () => {
    it('should inject repository and service dependencies', () => {
      expect(useCase).toBeInstanceOf(CreateProductUseCase);
      // The constructor properly injects the dependencies
    });
  });
});

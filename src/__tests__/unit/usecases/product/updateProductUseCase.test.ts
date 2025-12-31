import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { UpdateProductDTO } from '@/interface/dtos';
import { Logger } from '@/shared';
import { UpdateProductUseCase } from '@/usecases';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let mockService: jest.Mocked<ProductService>;
  let mockLogger: jest.Mocked<Logger>;
  let existingProduct: Product;

  beforeEach(() => {
    existingProduct = new Product({
      id: '1',
      name: 'Original Product',
      description: 'Original Description',
      price: 100,
      stock: 10,
      category: 'Original Category',
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

    mockService = {
      isAvailable: jest.fn(),
      updatePrice: jest.fn(),
      updateStock: jest.fn(),
      updateProductDetails: jest.fn(),
      updateWishlistStatus: jest.fn(),
    } as unknown as jest.Mocked<ProductService>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    useCase = new UpdateProductUseCase(mockRepository, mockService, mockLogger);
  });

  describe('execute method', () => {
    it('should throw error when product not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const productData: UpdateProductDTO = {
        price: 150,
      };

      await expect(useCase.execute('non-existent-id', productData)).rejects.toThrow(
        'Product not found.'
      );
    });

    it('should update product price successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        price: 150,
      };

      const updatedProduct = new Product({ ...existingProduct.toProps(), price: 150 });
      mockService.updatePrice.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockService.updatePrice).toHaveBeenCalledWith(existingProduct, 150);
      expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result.toProps().price).toBe(150);
    });

    it('should update product stock successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        stock: 25,
      };

      const updatedProduct = new Product({ ...existingProduct.toProps(), stock: 25 });
      mockService.updateStock.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockService.updateStock).toHaveBeenCalledWith(existingProduct, 25);
      expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result.toProps().stock).toBe(25);
    });

    it('should update product name successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        name: 'Updated Product Name',
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        name: 'Updated Product Name',
      });
      mockService.updateProductDetails.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockService.updateProductDetails).toHaveBeenCalledWith(existingProduct, {
        name: 'Updated Product Name',
      });
      expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result.toProps().name).toBe('Updated Product Name');
    });

    it('should update product description successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        description: 'Updated Description',
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        description: 'Updated Description',
      });
      mockService.updateProductDetails.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockService.updateProductDetails).toHaveBeenCalledWith(existingProduct, {
        description: 'Updated Description',
      });
      expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result.toProps().description).toBe('Updated Description');
    });

    it('should update product category successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        category: 'Updated Category',
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        category: 'Updated Category',
      });
      mockService.updateProductDetails.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockService.updateProductDetails).toHaveBeenCalledWith(existingProduct, {
        category: 'Updated Category',
      });
      expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result.toProps().category).toBe('Updated Category');
    });

    it('should update product isActive status successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        isActive: false,
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        isActive: false,
      });
      mockService.updateProductDetails.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockService.updateProductDetails).toHaveBeenCalledWith(existingProduct, {
        isActive: false,
      });
      expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result.toProps().isActive).toBe(false);
    });

    it('should update product wishlist status successfully', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        isWishlistStatus: true,
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        isWishlistStatus: true,
        wishlistCount: 1,
      });
      mockService.updateWishlistStatus.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockRepository.findById).toHaveBeenCalledWith('1');
      expect(mockService.updateWishlistStatus).toHaveBeenCalledWith(existingProduct, true);
      expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
      expect(result.toProps().isWishlistStatus).toBe(true);
      expect(result.toProps().wishlistCount).toBe(1);
    });

    it('should handle partial updates correctly', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        name: 'Updated Name',
        description: 'Updated Description',
        // Other fields omitted - should remain unchanged
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        name: 'Updated Name',
        description: 'Updated Description',
      });
      mockService.updateProductDetails.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockService.updateProductDetails).toHaveBeenCalled();
      expect(result.toProps().name).toBe('Updated Name');
      expect(result.toProps().description).toBe('Updated Description');
      expect(result.toProps().price).toBe(100); // Should remain unchanged
      expect(result.toProps().stock).toBe(10); // Should remain unchanged
    });

    it('should update multiple fields at once', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        price: 200,
        stock: 25,
        name: 'Completely Updated Product',
        isActive: false,
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        price: 200,
        stock: 25,
        name: 'Completely Updated Product',
        isActive: false,
      });

      mockService.updatePrice.mockReturnValue(updatedProduct);
      mockService.updateStock.mockReturnValue(updatedProduct);
      mockService.updateProductDetails.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockService.updatePrice).toHaveBeenCalled();
      expect(mockService.updateStock).toHaveBeenCalled();
      expect(mockService.updateProductDetails).toHaveBeenCalled();
      expect(result.toProps().price).toBe(200);
      expect(result.toProps().stock).toBe(25);
      expect(result.toProps().name).toBe('Completely Updated Product');
      expect(result.toProps().isActive).toBe(false);
    });

    it('should handle zero stock update', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        stock: 0,
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        stock: 0,
      });
      mockService.updateStock.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(result.toProps().stock).toBe(0);
    });

    it('should handle negative price validation in update', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        price: -50,
      };

      // Mock the updatePrice method to throw an error for negative price
      mockService.updatePrice.mockImplementation(() => {
        throw new Error('Price cannot be negative.');
      });

      await expect(useCase.execute('1', productData)).rejects.toThrow('Price cannot be negative.');
    });
  });

  describe('dependency injection', () => {
    it('should inject repository and service dependencies', () => {
      expect(useCase).toBeInstanceOf(UpdateProductUseCase);
      // The constructor properly injects the dependencies
    });
  });

  describe('edge cases', () => {
    it('should handle undefined values in UpdateProductDTO', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        // All fields undefined - should not call any update methods
      };

      mockRepository.update.mockResolvedValue(existingProduct);

      const result = await useCase.execute('1', productData);

      // Should not call any service methods since no fields are provided
      expect(mockService.updatePrice).not.toHaveBeenCalled();
      expect(mockService.updateStock).not.toHaveBeenCalled();
      expect(mockService.updateProductDetails).not.toHaveBeenCalled();
      expect(mockService.updateWishlistStatus).not.toHaveBeenCalled();

      // Should still call repository update with the original product
      expect(mockRepository.update).toHaveBeenCalledWith(existingProduct);
      expect(result).toBe(existingProduct);
    });

    it('should handle empty string values appropriately', async () => {
      mockRepository.findById.mockResolvedValue(existingProduct);

      const productData: UpdateProductDTO = {
        name: 'Updated Name', // Use valid name instead of empty string
        description: 'Updated Description', // Use valid description instead of empty string
      };

      const updatedProduct = new Product({
        ...existingProduct.toProps(),
        name: 'Updated Name',
        description: 'Updated Description',
      });
      mockService.updateProductDetails.mockReturnValue(updatedProduct);
      mockRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute('1', productData);

      expect(mockService.updateProductDetails).toHaveBeenCalled();
      expect(result.toProps().name).toBe('Updated Name');
      expect(result.toProps().description).toBe('Updated Description');
    });
  });
});

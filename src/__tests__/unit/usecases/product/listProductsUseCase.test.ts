import { Product } from '@/domain/entities';
import { IProductRepository } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { ListProductsUseCase } from '@/usecases';

describe('ListProductsUseCase', () => {
  let listProductsUseCase: ListProductsUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();

    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      toggleWishlistStatus: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    listProductsUseCase = new ListProductsUseCase(mockRepository, productService);
  });

  describe('execute', () => {
    it('should handle empty query parameters with defaults', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      const result = await listProductsUseCase.execute({});

      expect(result).toEqual({ products: [], total: 0, page: 1, limit: 10, totalPages: 0 });
      expect(mockRepository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10, skip: 0 });
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });

    it('should handle pagination parameters correctly', async () => {
      const mockProducts = [
        Product.createProduct({
          name: 'Product 1',
          description: 'Description 1',
          price: 100,
          stock: 10,
          category: 'Category 1',
          isActive: true,
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockProducts);
      mockRepository.count.mockResolvedValue(1);

      const result = await listProductsUseCase.execute({
        page: '2',
        limit: '20',
      });

      expect(result).toEqual({
        products: mockProducts,
        total: 1,
        page: 2,
        limit: 20,
        totalPages: 1,
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith({}, { page: 2, limit: 20, skip: 20 });
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });

    it('should limit maximum page size to 100', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        limit: '200',
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 100, skip: 0 });
    });

    it('should apply category filter when provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        category: 'Electronics',
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { category: 'Electronics' },
        { page: 1, limit: 10, skip: 0 }
      );
      expect(mockRepository.count).toHaveBeenCalledWith({ category: 'Electronics' });
    });

    it('should apply search filter when provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        search: 'laptop',
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { search: 'laptop' },
        { page: 1, limit: 10, skip: 0 }
      );
    });

    it('should apply isActive filter when provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        isActive: true,
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { isActive: true },
        { page: 1, limit: 10, skip: 0 }
      );
    });

    it('should apply isWishlistStatus filter when provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        isWishlistStatus: true,
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { isWishlistStatus: true },
        { page: 1, limit: 10, skip: 0 }
      );
    });

    it('should apply valid priceRange filter when provided', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        priceRange: { min: 50, max: 200 },
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith(
        { priceRange: { min: 50, max: 200 } },
        { page: 1, limit: 10, skip: 0 }
      );
    });

    it('should not apply invalid priceRange filter', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        priceRange: { min: -10, max: 200 },
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10, skip: 0 });
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });

    it('should handle multiple filters simultaneously', async () => {
      const mockProducts = [
        Product.createProduct({
          name: 'Test Product',
          description: 'Test Description',
          price: 150,
          stock: 5,
          category: 'Electronics',
          isActive: true,
        }),
      ];

      mockRepository.findAll.mockResolvedValue(mockProducts);
      mockRepository.count.mockResolvedValue(1);

      const result = await listProductsUseCase.execute({
        category: 'Electronics',
        isActive: true,
        priceRange: { min: 100, max: 300 },
        limit: '5',
      });

      expect(result).toEqual({
        products: mockProducts,
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith(
        {
          category: 'Electronics',
          isActive: true,
          priceRange: { min: 100, max: 300 },
        },
        { page: 1, limit: 5, skip: 0 }
      );
    });

    it('should handle undefined priceRange gracefully', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        priceRange: undefined,
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10, skip: 0 });
    });
  });

  describe('priceRange validation', () => {
    it('should use ProductService.isValidPriceRange for validation', async () => {
      const spy = jest.spyOn(productService, 'isValidPriceRange');

      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        priceRange: { min: 10, max: 100 },
      });

      expect(spy).toHaveBeenCalledWith({ min: 10, max: 100 });
      spy.mockRestore();
    });

    it('should reject priceRange with negative min value', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        priceRange: { min: -5, max: 100 },
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10, skip: 0 });
    });

    it('should reject priceRange with negative max value', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.count.mockResolvedValue(0);

      await listProductsUseCase.execute({
        priceRange: { min: 10, max: -5 },
      });

      expect(mockRepository.findAll).toHaveBeenCalledWith({}, { page: 1, limit: 10, skip: 0 });
    });
  });
});

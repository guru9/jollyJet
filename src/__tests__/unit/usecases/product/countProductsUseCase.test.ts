import { IProductRepository } from '@/domain/interfaces';
import { ProductService } from '@/domain/services';
import { Logger } from '@/shared';
import { CountProductsUseCase } from '@/usecases';

describe('CountProductsUseCase', () => {
  let countProductsUseCase: CountProductsUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let productService: ProductService;
  let mockLogger: jest.Mocked<Logger>;

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

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as any;

    countProductsUseCase = new CountProductsUseCase(mockRepository, productService, mockLogger);
  });

  describe('execute', () => {
    it('should handle empty query parameters', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await countProductsUseCase.execute({});

      expect(result).toBe(0);
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });

    it('should apply category filter when provided', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await countProductsUseCase.execute({
        category: 'Electronics',
      });

      expect(result).toBe(5);
      expect(mockRepository.count).toHaveBeenCalledWith({ category: 'Electronics' });
    });

    it('should apply search filter when provided', async () => {
      mockRepository.count.mockResolvedValue(3);

      const result = await countProductsUseCase.execute({
        search: 'laptop',
      });

      expect(result).toBe(3);
      expect(mockRepository.count).toHaveBeenCalledWith({ search: 'laptop' });
    });

    it('should apply isActive filter when provided', async () => {
      mockRepository.count.mockResolvedValue(10);

      const result = await countProductsUseCase.execute({
        isActive: true,
      });

      expect(result).toBe(10);
      expect(mockRepository.count).toHaveBeenCalledWith({ isActive: true });
    });

    it('should apply isWishlistStatus filter when provided', async () => {
      mockRepository.count.mockResolvedValue(2);

      const result = await countProductsUseCase.execute({
        isWishlistStatus: true,
      });

      expect(result).toBe(2);
      expect(mockRepository.count).toHaveBeenCalledWith({ isWishlistStatus: true });
    });

    it('should apply valid priceRange filter when provided', async () => {
      mockRepository.count.mockResolvedValue(7);

      const result = await countProductsUseCase.execute({
        priceRange: { min: 50, max: 200 },
      });

      expect(result).toBe(7);
      expect(mockRepository.count).toHaveBeenCalledWith({ priceRange: { min: 50, max: 200 } });
    });

    it('should not apply invalid priceRange filter', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await countProductsUseCase.execute({
        priceRange: { min: -10, max: 200 },
      });

      expect(result).toBe(0);
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });

    it('should handle multiple filters simultaneously', async () => {
      mockRepository.count.mockResolvedValue(4);

      const result = await countProductsUseCase.execute({
        category: 'Electronics',
        isActive: true,
        priceRange: { min: 100, max: 300 },
      });

      expect(result).toBe(4);
      expect(mockRepository.count).toHaveBeenCalledWith({
        category: 'Electronics',
        isActive: true,
        priceRange: { min: 100, max: 300 },
      });
    });

    it('should handle undefined priceRange gracefully', async () => {
      mockRepository.count.mockResolvedValue(1);

      const result = await countProductsUseCase.execute({
        priceRange: undefined,
      });

      expect(result).toBe(1);
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });
  });

  describe('priceRange validation', () => {
    it('should use ProductService.isValidPriceRange for validation', async () => {
      const spy = jest.spyOn(productService, 'isValidPriceRange');

      mockRepository.count.mockResolvedValue(0);

      await countProductsUseCase.execute({
        priceRange: { min: 10, max: 100 },
      });

      expect(spy).toHaveBeenCalledWith({ min: 10, max: 100 });
      spy.mockRestore();
    });

    it('should reject priceRange with negative min value', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await countProductsUseCase.execute({
        priceRange: { min: -5, max: 100 },
      });

      expect(result).toBe(0);
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });

    it('should reject priceRange with negative max value', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await countProductsUseCase.execute({
        priceRange: { min: 10, max: -5 },
      });

      expect(result).toBe(0);
      expect(mockRepository.count).toHaveBeenCalledWith({});
    });
  });
});

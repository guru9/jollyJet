import { Product } from '../../../domain/entities/Product';
import { ProductService } from '../../../domain/services/ProductService';

describe('ProductService', () => {
  let productService: ProductService;
  let sampleProduct: Product;

  beforeEach(() => {
    productService = new ProductService();

    // Create a sample product for testing
    sampleProduct = Product.createProduct({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      stock: 50,
      category: 'Test Category',
      isActive: true,
    });
  });

  describe('isValidPriceRange', () => {
    it('should return false when priceRange is undefined', () => {
      const result = productService.isValidPriceRange(undefined);
      expect(result).toBe(false);
    });

    it('should return false when priceRange is null', () => {
      const result = productService.isValidPriceRange(
        null as unknown as { min: number; max: number } | undefined
      );
      expect(result).toBe(false);
    });

    it('should return false when priceRange.min is negative', () => {
      const result = productService.isValidPriceRange({ min: -10, max: 100 });
      expect(result).toBe(false);
    });

    it('should return false when priceRange.max is negative', () => {
      const result = productService.isValidPriceRange({ min: 10, max: -100 });
      expect(result).toBe(false);
    });

    it('should return true when both min and max are non-negative', () => {
      const result = productService.isValidPriceRange({ min: 10, max: 100 });
      expect(result).toBe(true);
    });

    it('should return true when min and max are zero', () => {
      const result = productService.isValidPriceRange({ min: 0, max: 0 });
      expect(result).toBe(true);
    });
  });

  describe('updateStock', () => {
    it('should increase stock when quantity is positive', () => {
      const updatedProduct = productService.updateStock(sampleProduct, 10);
      expect(updatedProduct.toProps().stock).toBe(60);
    });

    it('should decrease stock when quantity is negative', () => {
      const updatedProduct = productService.updateStock(sampleProduct, -10);
      expect(updatedProduct.toProps().stock).toBe(40);
    });

    it('should throw error when stock would become negative', () => {
      expect(() => {
        productService.updateStock(sampleProduct, -100);
      }).toThrow('Insufficient stock.');
    });

    it('should update the updatedAt timestamp', () => {
      const beforeUpdate = sampleProduct.toProps().updatedAt;
      const updatedProduct = productService.updateStock(sampleProduct, 5);
      const afterUpdate = updatedProduct.toProps().updatedAt;

      expect(afterUpdate).not.toBe(beforeUpdate);
      expect(afterUpdate).toBeInstanceOf(Date);
    });
  });

  describe('updatePrice', () => {
    it('should update product price', () => {
      const updatedProduct = productService.updatePrice(sampleProduct, 150);
      expect(updatedProduct.toProps().price).toBe(150);
    });

    it('should throw error when price is negative', () => {
      expect(() => {
        productService.updatePrice(sampleProduct, -50);
      }).toThrow('Price cannot be negative.');
    });
  });

  describe('isAvailable', () => {
    it('should return true when product is active and has stock', () => {
      const result = productService.isAvailable(sampleProduct);
      expect(result).toBe(true);
    });

    it('should return false when product is inactive', () => {
      const inactiveProduct = Product.createProduct({
        ...sampleProduct.toProps(),
        isActive: false,
      });
      const result = productService.isAvailable(inactiveProduct);
      expect(result).toBe(false);
    });

    it('should return false when product has no stock', () => {
      const noStockProduct = Product.createProduct({
        ...sampleProduct.toProps(),
        stock: 0,
      });
      const result = productService.isAvailable(noStockProduct);
      expect(result).toBe(false);
    });
  });
});

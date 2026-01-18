import { Product } from '@/domain/entities';
import { CacheService } from '@/domain/services';
import { Productmodel } from '@/infrastructure/models';
import { ProductRepository } from '@/infrastructure/repositories';
import { Logger } from '@/shared';

describe('ProductRepository - Redis Cache Integration', () => {
  let productRepository: ProductRepository;
  let mockLogger: jest.Mocked<Logger>;
  let mockCacheService: jest.Mocked<CacheService>;

  beforeAll(async () => {
    // Create mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    // Create mock cache service
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      deleteByPattern: jest.fn(),
      getOrSet: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    } as unknown as jest.Mocked<CacheService>;

    // Use the global test database connection
    productRepository = new ProductRepository(mockLogger, mockCacheService);
  });

  afterAll(async () => {
    // Clean up the test database
    await Productmodel.deleteMany({});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById - Cache First Strategy', () => {
    it('should return cached product on cache hit', async () => {
      const productProps = {
        id: '507f1f77bcf86cd799439011',
        name: 'Cached Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
        isWishlistStatus: false,
        wishlistCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCacheService.get.mockResolvedValue(productProps);

      const result = await productRepository.findById(productProps.id);

      expect(mockCacheService.get).toHaveBeenCalledWith(`product:${productProps.id}`);
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(result?.toProps().name).toBe('Cached Product');
    });

    it('should fetch from database and cache on cache miss', async () => {
      const product = Product.createProduct({
        name: 'Database Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Database Product' });
      const productId = createdProduct?._id.toString();

      mockCacheService.get.mockResolvedValue(null); // Cache miss

      const result = await productRepository.findById(productId!);

      expect(mockCacheService.get).toHaveBeenCalledWith(`product:${productId}`);
      expect(mockCacheService.set).toHaveBeenCalledWith(`product:${productId}`, expect.any(Object));
      expect(result?.toProps().name).toBe('Database Product');
    });
  });

  describe('create - Cache Invalidation', () => {
    it('should create product and invalidate list caches', async () => {
      const product = Product.createProduct({
        name: 'New Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      });

      await productRepository.create(product);

      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringMatching(/^product:/),
        expect.any(Object)
      );
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('products:*');
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('product:count:*');
    });
  });

  describe('update - Cache Update and Invalidation', () => {
    it('should update product and invalidate caches', async () => {
      const product = Product.createProduct({
        name: 'Update Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Update Test Product' });
      const productId = createdProduct?._id.toString();

      const updatedProduct = Product.createProduct({
        ...product.toProps(),
        id: productId,
        name: 'Updated Product',
      });

      await productRepository.update(updatedProduct);

      expect(mockCacheService.set).toHaveBeenCalledWith(`product:${productId}`, expect.any(Object));
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('products:*');
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('product:count:*');
    });
  });

  describe('delete - Cache Removal and Invalidation', () => {
    it('should delete product and clean up caches', async () => {
      const product = Product.createProduct({
        name: 'Delete Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Delete Test Product' });
      const productId = createdProduct?._id.toString();

      await productRepository.delete(productId!);

      expect(mockCacheService.delete).toHaveBeenCalledWith(`product:${productId}`);
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('products:*');
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('product:count:*');
    });
  });

  describe('findAll - Cache First with Filters', () => {
    it('should return cached results on cache hit', async () => {
      const cachedProducts = [
        {
          id: '507f1f77bcf86cd799439011',
          name: 'Cached Product 1',
          description: 'Test Description',
          price: 100,
          stock: 10,
          category: 'Test Category',
          isActive: true,
          isWishlistStatus: false,
          wishlistCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockCacheService.get.mockResolvedValue(cachedProducts);

      const result = await productRepository.findAll({ category: 'Test Category' });

      expect(mockCacheService.get).toHaveBeenCalledWith(
        `products:${JSON.stringify({ filter: { category: 'Test Category' }, pagination: undefined })}`
      );
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].toProps().name).toBe('Cached Product 1');
    });

    it('should fetch from database and cache on cache miss', async () => {
      const product = Product.createProduct({
        name: 'Database Product for List',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'List Test Category',
        isActive: true,
      });

      await productRepository.create(product);

      mockCacheService.get.mockResolvedValue(null); // Cache miss

      const result = await productRepository.findAll({ category: 'List Test Category' });

      expect(mockCacheService.get).toHaveBeenCalledWith(
        `products:${JSON.stringify({ filter: { category: 'List Test Category' }, pagination: undefined })}`
      );
      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringMatching(/^products:/),
        expect.any(Array),
        300 // 5 minutes TTL
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('count - Cache First Strategy', () => {
    it('should return cached count on cache hit', async () => {
      mockCacheService.get.mockResolvedValue(5);

      const result = await productRepository.count({ category: 'Test Category' });

      expect(mockCacheService.get).toHaveBeenCalledWith(
        `product:count:${JSON.stringify({ category: 'Test Category' })}`
      );
      expect(mockCacheService.set).not.toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should count from database and cache on cache miss', async () => {
      const product = Product.createProduct({
        name: 'Count Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Count Test Category',
        isActive: true,
      });

      await productRepository.create(product);

      mockCacheService.get.mockResolvedValue(null); // Cache miss

      const result = await productRepository.count({ category: 'Count Test Category' });

      expect(mockCacheService.get).toHaveBeenCalledWith(
        `product:count:${JSON.stringify({ category: 'Count Test Category' })}`
      );
      expect(mockCacheService.set).toHaveBeenCalledWith(
        expect.stringMatching(/^product:count:/),
        1,
        300 // 5 minutes TTL
      );
      expect(result).toBe(1);
    });
  });

  describe('toggleWishlistStatus - Cache Update and Invalidation', () => {
    it('should update wishlist status and invalidate caches', async () => {
      const product = Product.createProduct({
        name: 'Wishlist Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
        isWishlistStatus: false,
        wishlistCount: 0,
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Wishlist Test Product' });
      const productId = createdProduct?._id.toString();

      await productRepository.toggleWishlistStatus(productId!, true);

      expect(mockCacheService.set).toHaveBeenCalledWith(`product:${productId}`, expect.any(Object));
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('products:*');
      expect(mockCacheService.deleteByPattern).toHaveBeenCalledWith('product:count:*');
    });
  });

  describe('Cache Error Handling', () => {
    it('should handle cache service errors gracefully', async () => {
      mockCacheService.get.mockResolvedValue(null); // Simulate cache miss due to error

      const product = Product.createProduct({
        name: 'Error Handling Test',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isActive: true,
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Error Handling Test' });
      const productId = createdProduct?._id.toString();

      // Should still work even if cache fails - falls back to database
      const result = await productRepository.findById(productId!);

      expect(result).not.toBeNull();
      expect(result?.toProps().name).toBe('Error Handling Test');
      // Verify cache was attempted
      expect(mockCacheService.get).toHaveBeenCalledWith(`product:${productId}`);
      // Verify result was cached after database fetch
      expect(mockCacheService.set).toHaveBeenCalledWith(`product:${productId}`, expect.any(Object));
    });
  });
});

import { Product } from '../../../domain/entities/Product';
import { Productmodel } from '../../../infrastructure/models/ProductModel';
import { ProductRepository } from '../../../infrastructure/repositories/ProductRepository';

describe('ProductRepository', () => {
  let productRepository: ProductRepository;

  beforeAll(async () => {
    // Use the global test database connection
    productRepository = new ProductRepository();
  });

  afterAll(async () => {
    // Clean up the test database
    await Productmodel.deleteMany({});
  });

  describe('create', () => {
    it('should create a product', async () => {
      const product = Product.createProduct({
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Test Product' });
      expect(createdProduct).not.toBeNull();
      expect(createdProduct?.name).toBe('Test Product');
    });
  });

  describe('toggleWishlistStatus', () => {
    it('should toggle the wishlist status of a product', async () => {
      const product = Product.createProduct({
        name: 'Test Product for Wishlist',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        isInWishlist: false,
        wishlistCount: 0,
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Test Product for Wishlist' });
      const productId = createdProduct?._id.toString();

      const updatedProduct = await productRepository.toggleWishlistStatus(productId!, true);
      expect(updatedProduct.toProps().isInWishlist).toBe(true);
      expect(updatedProduct.toProps().wishlistCount).toBe(1);
    });

    // it('should throw an error if product not found', async () => {
    //   await expect(productRepository.toggleWishlistStatus('invalid-id', true)).rejects.toThrow(
    //     'Product not found'
    //   );
    // });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const product = Product.createProduct({
        name: 'Test Product for Update',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Test Product for Update' });
      const productId = createdProduct?._id.toString();

      const updatedProduct = Product.createProduct({
        ...product.toProps(),
        id: productId, // Add the ID to the product
        name: 'Updated Test Product',
      });

      await productRepository.update(updatedProduct);

      const retrievedProduct = await Productmodel.findById(productId);
      expect(retrievedProduct?.name).toBe('Updated Test Product');
    });
  });

  describe('findById', () => {
    it('should retrieve a product by its ID', async () => {
      const product = Product.createProduct({
        name: 'Test Product for Retrieval',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Test Product for Retrieval' });
      const productId = createdProduct?._id.toString();

      const retrievedProduct = await productRepository.findById(productId!);
      expect(retrievedProduct).not.toBeNull();
      expect(retrievedProduct?.toProps().name).toBe('Test Product for Retrieval');
    });

    // it('should return null if product not found', async () => {
    //   const retrievedProduct = await productRepository.findById('nonexistent-id');
    //   expect(retrievedProduct).toBeNull();
    // });
  });

  describe('findAll', () => {
    it('should retrieve all products', async () => {
      const product1 = Product.createProduct({
        name: 'Test Product 1',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      const product2 = Product.createProduct({
        name: 'Test Product 2',
        description: 'Test Description',
        price: 200,
        stock: 20,
        category: 'Test Category',
      });

      await productRepository.create(product1);
      await productRepository.create(product2);

      const products = await productRepository.findAll();
      expect(products.length).toBeGreaterThanOrEqual(2);
    });

    it('should retrieve products with filters', async () => {
      const product1 = Product.createProduct({
        name: 'Test Product 1',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      const product2 = Product.createProduct({
        name: 'Test Product 2',
        description: 'Test Description',
        price: 200,
        stock: 20,
        category: 'Another Category',
      });

      await productRepository.create(product1);
      await productRepository.create(product2);

      const products = await productRepository.findAll({ category: 'Test Category' });
      expect(products.length).toBeGreaterThanOrEqual(1);
      expect(products[0].toProps().category).toBe('Test Category');
    });
  });

  describe('delete', () => {
    it('should delete a product', async () => {
      const product = Product.createProduct({
        name: 'Test Product for Deletion',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      await productRepository.create(product);

      const createdProduct = await Productmodel.findOne({ name: 'Test Product for Deletion' });
      const productId = createdProduct?._id.toString();

      await productRepository.delete(productId!);

      const deletedProduct = await Productmodel.findById(productId);
      expect(deletedProduct).toBeNull();
    });
  });

  describe('count', () => {
    it('should count all products', async () => {
      const product1 = Product.createProduct({
        name: 'Test Product 1',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      const product2 = Product.createProduct({
        name: 'Test Product 2',
        description: 'Test Description',
        price: 200,
        stock: 20,
        category: 'Test Category',
      });

      await productRepository.create(product1);
      await productRepository.create(product2);

      const count = await productRepository.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    it('should count products with filters', async () => {
      const product1 = Product.createProduct({
        name: 'Test Product 1',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
      });

      const product2 = Product.createProduct({
        name: 'Test Product 2',
        description: 'Test Description',
        price: 200,
        stock: 20,
        category: 'Another Category',
      });

      await productRepository.create(product1);
      await productRepository.create(product2);

      const count = await productRepository.count({ category: 'Test Category' });
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });
});

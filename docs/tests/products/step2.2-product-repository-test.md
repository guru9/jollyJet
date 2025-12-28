# Product Repository Test Documentation

This document outlines the unit tests for the `ProductRepository` class, focusing on CRUD operations and wishlist functionality.

## Test Structure

The tests are organized into several main sections:

1. **create**
   - Tests basic product creation

2. **toggleWishlistStatus**
   - Tests toggling wishlist status

3. **update**
   - Tests product updates

4. **findById**
   - Tests product retrieval by ID

5. **findAll**
   - Tests retrieving all products
   - Tests retrieving products with filters

6. **delete**
   - Tests product deletion

7. **count**
   - Tests counting all products
   - Tests counting products with filters

## Test Cases

### create

#### Test Case 1: should create a product

- **Description**: Ensures that a product can be created in the database.
- **Input**:
  ```typescript
  const product = Product.createProduct({
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
    isActive: true,
  });
  await productRepository.create(product);
  ```
- **Expected Output**: Product should be created in the database and retrievable by name.

### toggleWishlistStatus

#### Test Case 1: should toggle the wishlist status of a product

- **Description**: Tests toggling the wishlist status of a product.
- **Input**:
  ```typescript
  const product = Product.createProduct({
    name: 'Test Product for Wishlist',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
    isWishlistStatus: false,
    wishlistCount: 0,
    isActive: true,
  });
  await productRepository.create(product);
  const createdProduct = await Productmodel.findOne({ name: 'Test Product for Wishlist' });
  const productId = createdProduct?._id.toString();
  const updatedProduct = await productRepository.toggleWishlistStatus(productId!, true);
  ```
- **Expected Output**: Product should be updated with `isWishlistStatus: true` and `wishlistCount: 1`.

### update

#### Test Case 1: should update a product

- **Description**: Tests updating an existing product.
- **Input**:
  ```typescript
  const product = Product.createProduct({
    name: 'Test Product for Update',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
    isActive: true,
  });
  await productRepository.create(product);
  const createdProduct = await Productmodel.findOne({ name: 'Test Product for Update' });
  const productId = createdProduct?._id.toString();
  const updatedProduct = Product.createProduct({
    ...product.toProps(),
    id: productId,
    name: 'Updated Test Product',
  });
  await productRepository.update(updatedProduct);
  ```
- **Expected Output**: Product should be updated in the database.

### findById

#### Test Case 1: should retrieve a product by its ID

- **Description**: Tests retrieving a product by its ID.
- **Input**:
  ```typescript
  const product = Product.createProduct({
    name: 'Test Product for Retrieval',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
    isActive: true,
  });
  await productRepository.create(product);
  const createdProduct = await Productmodel.findOne({ name: 'Test Product for Retrieval' });
  const productId = createdProduct?._id.toString();
  const retrievedProduct = await productRepository.findById(productId!);
  ```
- **Expected Output**: Product should be retrieved successfully.

### findAll

#### Test Case 1: should retrieve all products

- **Description**: Tests retrieving all products.
- **Input**:
  ```typescript
  // Create products
  await productRepository.create(product1);
  await productRepository.create(product2);
  const products = await productRepository.findAll();
  ```
- **Expected Output**: All products should be retrieved.

#### Test Case 2: should retrieve products with filters

- **Description**: Tests retrieving products with filters.
- **Input**:
  ```typescript
  // Create products
  await productRepository.create(product1);
  await productRepository.create(product2);
  const products = await productRepository.findAll({ category: 'Test Category' });
  ```
- **Expected Output**: Products matching the filter should be retrieved.

### delete

#### Test Case 1: should delete a product

- **Description**: Tests deleting a product.
- **Input**:
  ```typescript
  const product = Product.createProduct({
    name: 'Test Product for Deletion',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
    isActive: true,
  });
  await productRepository.create(product);
  const createdProduct = await Productmodel.findOne({ name: 'Test Product for Deletion' });
  const productId = createdProduct?._id.toString();
  await productRepository.delete(productId!);
  ```
- **Expected Output**: Product should be deleted from the database.

### count

#### Test Case 1: should count all products

- **Description**: Tests counting all products.
- **Input**:
  ```typescript
  // Create products
  await productRepository.create(product1);
  await productRepository.create(product2);
  const count = await productRepository.count();
  ```
- **Expected Output**: Count should be correct.

#### Test Case 2: should count products with filters

- **Description**: Tests counting products with filters.
- **Input**:
  ```typescript
  // Create products
  await productRepository.create(product1);
  await productRepository.create(product2);
  const count = await productRepository.count({ category: 'Test Category' });
  ```
- **Expected Output**: Count should match the filtered products.

## Summary

The `ProductRepository` tests ensure that all CRUD operations and wishlist functionality work correctly. The tests use the database for integration testing.

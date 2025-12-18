# Product Repository Test Documentation

This document outlines the unit tests for the `ProductRepository` class, focusing on the wishlist-related functionality and basic CRUD operations.

## Test Structure

The tests are organized into several main sections:

1. **Create Operations**
   - Tests basic product creation
   - Tests product creation with wishlist status

2. **Wishlist Operations**
   - Tests toggling wishlist status
   - Tests error handling for non-existent products

3. **Basic CRUD Operations**
   - Tests product updates
   - Tests product retrieval by ID
   - Tests retrieving all products with filtering
   - Tests product deletion
   - Tests product counting with filtering

## Test Cases

### Create Operations

#### Test Case 1: Basic Product Creation

- **Description**: Ensures that a product can be created in the database.
- **Input**:
  ```typescript
  const product = Product.createProduct({
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
  });
  await productRepository.create(product);
  ```
- **Expected Output**: Product should be created in the database and retrievable by name.

#### Test Case 2: Product Creation with Wishlist Status

- **Description**: Tests creating a product with wishlist status using the new `createWithWishlistStatus` method.
- **Input**:
  ```typescript
  const product = Product.createProduct({
    name: 'Test Product with Wishlist',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
  });
  await productRepository.createWithWishlistStatus(product, true);
  ```
- **Expected Output**: Product should be created with `isInWishlist: true` and `wishlistCount: 1`.

### Wishlist Operations

#### Test Case 1: Toggle Wishlist Status

- **Description**: Tests toggling the wishlist status of a product using the updated `toggleWishlistStatus` method.
- **Input**:
  ```typescript
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
  ```
- **Expected Output**: Product should be updated with `isInWishlist: true` and `wishlistCount: 1`, and the method should return the updated product.

#### Test Case 2: Error Handling for Non-existent Product

- **Description**: Tests that `toggleWishlistStatus` throws an error when the product is not found.
- **Input**:
  ```typescript
  await productRepository.toggleWishlistStatus('invalid-id', true);
  ```
- **Expected Output**: Should throw an error with message 'Product not found'.

### Basic CRUD Operations

The repository tests also cover standard CRUD operations:

- **Update**: Tests updating an existing product
- **Find by ID**: Tests retrieving a product by its ID
- **Find All**: Tests retrieving all products with optional filtering
- **Delete**: Tests deleting a product by ID
- **Count**: Tests counting products with optional filtering

## Summary

The `ProductRepository` tests ensure that:

1. **Wishlist functionality works correctly**: Products can be created with wishlist status and their status can be toggled
2. **CRUD operations are reliable**: All basic database operations work as expected
3. **Error handling is robust**: Proper errors are thrown for invalid operations
4. **Method signatures are correct**: All methods return the expected types and handle parameters correctly

The tests reflect the simplified architecture where wishlist operations are handled directly by the repository layer, while the entity remains focused on business rules and validation.

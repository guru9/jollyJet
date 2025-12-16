# Product Entity Test Documentation

This document outlines the unit tests for the `Product` entity, focusing on the `isInWishlist` and `wishlistCount` properties.

## Test Structure

The tests are organized into two main sections:

1. **isInWishlist Property Tests**
   - Tests the accessibility of the `isInWishlist` property via a getter.
   - Validates that the getter returns the correct value from the provided props.
   - Tests the `createWithWishlistStatus` factory method to ensure it works correctly with the getter.

2. **wishlistCount Property Tests**
   - Tests the accessibility of the `wishlistCount` property via a getter.
   - Validates that the getter returns a default value of `0` if the property is not provided.

## Test Cases

### isInWishlist Property

#### Test Case 1: Accessibility via Getter

- **Description**: Ensures that the `isInWishlist` property is accessible via a getter.
- **Input**:
  ```typescript
  const productProps = {
    name: 'Test Product',
    description: 'Test Description',
    price: 10.99,
    stock: 100,
    category: 'Test Category',
    isInWishlist: true,
  };
  const product = new Product(productProps);
  ```
- **Expected Output**: `product.isInWishlist` should return `true`.

#### Test Case 2: Correct Value from Props

- **Description**: Validates that the getter returns the correct value from the provided props.
- **Input**:
  ```typescript
  const productProps = {
    name: 'Test Product',
    description: 'Test Description',
    price: 10.99,
    stock: 100,
    category: 'Test Category',
    isInWishlist: false,
  };
  const product = new Product(productProps);
  ```
- **Expected Output**: `product.isInWishlist` should return `false`.

#### Test Case 3: Factory Method

- **Description**: Tests the `createWithWishlistStatus` factory method to ensure it works correctly with the getter.
- **Input**:
  ```typescript
  const productProps = {
    name: 'Test Product',
    description: 'Test Description',
    price: 10.99,
    stock: 100,
    category: 'Test Category',
    isInWishlist: false,
  };
  const product = Product.createWithWishlistStatus(productProps, true);
  ```
- **Expected Output**: `product.isInWishlist` should return `true`.

### wishlistCount Property

#### Test Case 1: Accessibility via Getter

- **Description**: Ensures that the `wishlistCount` property is accessible via a getter.
- **Input**:
  ```typescript
  const productProps = {
    name: 'Test Product',
    description: 'Test Description',
    price: 10.99,
    stock: 100,
    category: 'Test Category',
    isInWishlist: false,
    wishlistCount: 5,
  };
  const product = new Product(productProps);
  ```
- **Expected Output**: `product.wishlistCount` should return `5`.

#### Test Case 2: Default Value

- **Description**: Validates that the getter returns a default value of `0` if the property is not provided.
- **Input**:
  ```typescript
  const productProps = {
    name: 'Test Product',
    description: 'Test Description',
    price: 10.99,
    stock: 100,
    category: 'Test Category',
    isInWishlist: false,
  };
  const product = new Product(productProps);
  ```
- **Expected Output**: `product.wishlistCount` should return `0`.

## Summary

The `Product` entity tests ensure that the `isInWishlist` and `wishlistCount` properties are accessible and return the correct values. The tests cover both the direct initialization of the properties and the use of factory methods to ensure robustness and correctness.

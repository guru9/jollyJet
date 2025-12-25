# ToggleWishlistProductUseCase Test Documentation - Step 4.2

## Overview

Comprehensive test suite for the `ToggleWishlistProductUseCase` implementation, ensuring proper functionality, input validation, and error handling. This test suite validates the use case's ability to toggle product wishlist status, handle various edge cases, and propagate errors appropriately.

## Test File Location

**File:** [`src/test/unit/products/toggleWishlistProductUseCase.test.ts`](file:///e:/Project/jollyJet/src/test/unit/products/toggleWishlistProductUseCase.test.ts)

## Test Structure

```typescript
describe('ToggleWishlistProductUseCase', () => {
  let useCase: ToggleWishlistProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    // Setup mocks and use case instance
  });

  describe('execute method', () => {
    // 8 test cases for execute method
  });

  describe('dependency injection', () => {
    // 1 test case for DI
  });
});
```

## Test Cases

### 1. Successful Wishlist Toggle to True

**Test:** `should toggle wishlist status successfully`

**Purpose:** Verify the complete flow of toggling a product's wishlist status to true

**Test Data:**

```typescript
const productId = '507f1f77bcf86cd799439011';
const wishlistData: ToggleWishlistDTO = { isInWishlist: true };

const existingProduct = new Product({
  id: productId,
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: true,
  isInWishlist: false,
  wishlistCount: 0,
});

const updatedProduct = new Product({
  ...existingProduct.toProps(),
  isInWishlist: true,
  wishlistCount: 1,
});
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockRepository.toggleWishlistStatus.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct productId
- ✅ `mockRepository.toggleWishlistStatus` called with productId and true
- ✅ Result is instance of `Product`
- ✅ Result has `isInWishlist: true`

### 2. Successful Wishlist Toggle to False

**Test:** `should handle toggling to false`

**Purpose:** Verify toggling wishlist status to false works correctly

**Test Data:**

```typescript
const productId = '507f1f77bcf86cd799439011';
const wishlistData: ToggleWishlistDTO = { isInWishlist: false };

const existingProduct = new Product({
  id: productId,
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: true,
  isInWishlist: true,
  wishlistCount: 5,
});

const updatedProduct = new Product({
  ...existingProduct.toProps(),
  isInWishlist: false,
  wishlistCount: 4,
});
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockRepository.toggleWishlistStatus.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct productId
- ✅ `mockRepository.toggleWishlistStatus` called with productId and false
- ✅ Result is instance of `Product`
- ✅ Result has `isInWishlist: false`

### 3. Product Not Found Error Handling

**Test:** `should throw error when product not found`

**Purpose:** Ensure proper error handling when attempting to toggle wishlist for non-existent product

**Test Data:**

```typescript
const productId = '507f1f77bcf86cd799439011';
const wishlistData: ToggleWishlistDTO = { isInWishlist: true };
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(null)`

**Assertions:**

- ✅ Throws error with message `'Product not found.'`
- ✅ `mockRepository.findById` called with correct productId
- ✅ `mockRepository.toggleWishlistStatus` not called

### 4. Empty Product ID Validation

**Test:** `should throw error for empty product ID`

**Purpose:** Verify input validation for empty product ID

**Test Data:**

```typescript
const productId = '';
const wishlistData: ToggleWishlistDTO = { isInWishlist: true };
```

**Assertions:**

- ✅ Throws error with message `'Product ID is required for wishlist toggle.'`
- ✅ `mockRepository.findById` not called
- ✅ `mockRepository.toggleWishlistStatus` not called

### 5. Null/Undefined Product ID Validation

**Test:** `should throw error for null/undefined product ID`

**Purpose:** Verify input validation for null and undefined product IDs

**Test Data:**

```typescript
const wishlistData: ToggleWishlistDTO = { isInWishlist: true };
```

**Test Cases:**

- `productId = null`
- `productId = undefined`

**Assertions:**

- ✅ Throws error with message `'Product ID is required for wishlist toggle.'` for both cases
- ✅ `mockRepository.findById` not called
- ✅ `mockRepository.toggleWishlistStatus` not called

### 6. Repository Error During findById

**Test:** `should handle repository errors during findById`

**Purpose:** Verify proper error propagation when repository fails during product lookup

**Test Data:**

```typescript
const productId = '507f1f77bcf86cd799439011';
const wishlistData: ToggleWishlistDTO = { isInWishlist: true };
```

**Mock Setup:**

- `mockRepository.findById.mockRejectedValue(new Error('Database connection failed'))`

**Assertions:**

- ✅ Throws error with message `'Database connection failed'`
- ✅ `mockRepository.findById` called with correct productId
- ✅ `mockRepository.toggleWishlistStatus` not called

### 7. Repository Error During toggleWishlistStatus

**Test:** `should handle repository errors during toggleWishlistStatus`

**Purpose:** Verify proper error propagation when repository fails during wishlist toggle operation

**Test Data:**

```typescript
const productId = '507f1f77bcf86cd799439011';
const wishlistData: ToggleWishlistDTO = { isInWishlist: true };

const existingProduct = new Product({
  id: productId,
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: true,
  isInWishlist: false,
  wishlistCount: 0,
});
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockRepository.toggleWishlistStatus.mockRejectedValue(new Error('Update failed'))`

**Assertions:**

- ✅ Throws error with message `'Update failed'`
- ✅ `mockRepository.findById` called with correct productId
- ✅ `mockRepository.toggleWishlistStatus` called with correct parameters

### 8. Dependency Injection Verification

**Test:** `should inject repository dependency`

**Purpose:** Verify proper dependency injection

**Assertions:**

- ✅ Use case instance is created successfully
- ✅ Dependencies are properly injected via constructor

## Test Coverage Metrics

### Test Suites: 2

1. **execute method** - 7 test cases
2. **dependency injection** - 1 test case

### Total Tests: 8

### Coverage Areas:

- ✅ **Input Validation** - Product ID validation and error handling
- ✅ **Business Logic** - Product existence checking and wishlist toggling
- ✅ **Error Handling** - Repository errors and validation errors
- ✅ **Success Scenarios** - Both true and false wishlist toggles
- ✅ **Dependency Injection** - Constructor injection verification

## Test Execution

### Run All Tests

```bash
npm test
```

### Run Only ToggleWishlistProductUseCase Tests

```bash
npm test -- src/test/unit/products/toggleWishlistProductUseCase.test.ts
```

### Run in Watch Mode

```bash
npm run test:watch -- src/test/unit/products/toggleWishlistProductUseCase.test.ts
```

## Test Results

**Actual Test Execution Output:**

```
 PASS  src/test/unit/products/toggleWishlistProductUseCase.test.ts
  ToggleWishlistProductUseCase
    execute method
      √ should toggle wishlist status successfully (5 ms)
      √ should throw error when product not found (17 ms)
      √ should throw error for empty product ID (1 ms)
      √ should throw error for null/undefined product ID (1 ms)
      √ should handle toggling to false (1 ms)
      √ should handle repository errors during findById (2 ms)
      √ should handle repository errors during toggleWishlistStatus (2 ms)
    dependency injection
      √ should inject repository dependency (1 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

## Integration with Main Test Suite

This test suite integrates with the overall test coverage strategy:

- **Unit Test Category**: Tests application layer (use cases)
- **Coverage Focus**: Business logic and input validation
- **Test Organization**: Follows established unit/integration separation

## Relationship to Clean Architecture

```
┌─────────────────────────────────────────┐
│         Test Coverage Layers             │
├─────────────────────────────────────────┤
│  Unit Tests (Application Layer)         │  ← ToggleWishlistProductUseCase tests
├─────────────────────────────────────────┤
│  Unit Tests (Domain Layer)              │  ← Product entity tests
├─────────────────────────────────────────┤
│  Integration Tests (Interface Layer)    │  ← API endpoint tests
└─────────────────────────────────────────┘
```

## Benefits of This Test Suite

### 1. Input Validation Coverage

- Ensures all input validation scenarios are tested
- Prevents regression of validation logic
- Covers edge cases like null, undefined, and empty strings

### 2. Business Logic Validation

- Tests the complete wishlist toggle flow
- Validates product existence checking
- Ensures proper delegation to repository layer

### 3. Error Handling Verification

- Tests all error scenarios and propagation
- Ensures consistent error messages
- Validates that operations are not attempted after validation failures

### 4. Maintainability

- Clear test organization following established patterns
- Comprehensive coverage of all code paths
- Easy to extend with new test cases

### 5. Documentation

- Serves as executable documentation for the use case
- Shows expected behavior and edge cases
- Provides examples of proper usage

## Next Steps

### Additional Test Cases to Consider

1. **Edge Case Testing:**
   - Very long product IDs
   - Special characters in product IDs
   - Concurrent wishlist toggle operations

2. **Integration Testing:**
   - Test with real MongoDB repository
   - Test complete API flow (controller → use case → repository)

3. **Performance Testing:**
   - Bulk wishlist operations
   - High-frequency toggle requests

## Conclusion

The `ToggleWishlistProductUseCase` test suite provides comprehensive coverage of the use case implementation, ensuring proper functionality, input validation, and error handling. The tests follow established patterns and integrate seamlessly with the overall test strategy, contributing to the project's test coverage goals. The suite validates both success and failure scenarios, ensuring the use case behaves correctly under all conditions.

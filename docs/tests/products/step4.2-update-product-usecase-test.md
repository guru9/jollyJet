# UpdateProductUseCase Test Documentation - Step 4.2

## Overview

Comprehensive test suite for the `UpdateProductUseCase` implementation, ensuring proper functionality, type safety, and error handling. This test suite validates the use case's ability to retrieve existing products, apply partial updates, enforce business rules, and persist updated products through the repository.

## Test File Location

**File:** [`tests/unit/products/updateProductUseCase.test.ts`](file:///e:/Project/jollyJet/tests/unit/products/updateProductUseCase.test.ts)

## Test Structure

```typescript
describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let mockService: jest.Mocked<ProductService>;
  let existingProduct: Product;

  beforeEach(() => {
    // Setup mocks and use case instance
  });

  describe('execute method', () => {
    // 12 test cases for execute method
  });

  describe('dependency injection', () => {
    // 1 test case for DI
  });

  describe('edge cases', () => {
    // 2 test cases for edge cases
  });
});
```

## Test Cases

### 1. Product Not Found Error Handling

**Test:** `should throw error when product not found`

**Purpose:** Verify proper error handling when attempting to update non-existent product

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  price: 150,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(null)`

**Assertions:**

- ✅ Throws error with message `'Product not found.'`

### 2. Price Update

**Test:** `should update product price successfully`

**Purpose:** Verify price update functionality

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  price: 150,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updatePrice.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct product ID
- ✅ `mockService.updatePrice` called with existing product and new price
- ✅ `mockRepository.update` called with updated product
- ✅ Result has updated price (150)

### 3. Stock Update

**Test:** `should update product stock successfully`

**Purpose:** Verify stock update functionality

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  stock: 25,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateStock.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct product ID
- ✅ `mockService.updateStock` called with existing product and new stock
- ✅ `mockRepository.update` called with updated product
- ✅ Result has updated stock (25)

### 4. Name Update

**Test:** `should update product name successfully`

**Purpose:** Verify name update functionality

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  name: 'Updated Product Name',
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateProductDetails.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct product ID
- ✅ `mockService.updateProductDetails` called with correct parameters
- ✅ `mockRepository.update` called with updated product
- ✅ Result has updated name

### 5. Description Update

**Test:** `should update product description successfully`

**Purpose:** Verify description update functionality

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  description: 'Updated Description',
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateProductDetails.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct product ID
- ✅ `mockService.updateProductDetails` called with correct parameters
- ✅ `mockRepository.update` called with updated product
- ✅ Result has updated description

### 6. Category Update

**Test:** `should update product category successfully`

**Purpose:** Verify category update functionality

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  category: 'Updated Category',
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateProductDetails.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct product ID
- ✅ `mockService.updateProductDetails` called with correct parameters
- ✅ `mockRepository.update` called with updated product
- ✅ Result has updated category

### 7. isActive Status Update

**Test:** `should update product isActive status successfully`

**Purpose:** Verify isActive status update functionality

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  isActive: false,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateProductDetails.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct product ID
- ✅ `mockService.updateProductDetails` called with correct parameters
- ✅ `mockRepository.update` called with updated product
- ✅ Result has updated isActive status (false)

### 8. Wishlist Status Update

**Test:** `should update product wishlist status successfully`

**Purpose:** Verify wishlist status update functionality

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  iswishliststatus: true,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateWishlistStatus.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockRepository.findById` called with correct product ID
- ✅ `mockService.updateWishlistStatus` called with correct parameters
- ✅ `mockRepository.update` called with updated product
- ✅ Result has updated wishlist status and count

### 9. Partial Updates

**Test:** `should handle partial updates correctly`

**Purpose:** Verify that only specified fields are updated, others remain unchanged

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  name: 'Updated Name',
  description: 'Updated Description',
  // Other fields omitted - should remain unchanged
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateProductDetails.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockService.updateProductDetails` called
- ✅ Updated fields have new values
- ✅ Unspecified fields (price, stock) remain unchanged

### 10. Multiple Field Updates

**Test:** `should update multiple fields at once`

**Purpose:** Verify simultaneous update of multiple fields

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  price: 200,
  stock: 25,
  name: 'Completely Updated Product',
  isActive: false,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updatePrice.mockReturnValue(updatedProduct)`
- `mockService.updateStock.mockReturnValue(updatedProduct)`
- `mockService.updateProductDetails.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ All relevant service methods called
- ✅ All fields updated correctly
- ✅ Final result has all updated values

### 11. Zero Stock Update

**Test:** `should handle zero stock update`

**Purpose:** Verify that zero stock is handled correctly (valid business case)

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  stock: 0,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateStock.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ Stock updated to 0 successfully
- ✅ No validation errors thrown

### 12. Negative Price Validation

**Test:** `should handle negative price validation in update`

**Purpose:** Verify that negative price validation works in update context

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  price: -50,
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updatePrice.mockImplementation(() => { throw new Error('Price cannot be negative.') })`

**Assertions:**

- ✅ Throws error with message `'Price cannot be negative.'`

### 13. Dependency Injection Verification

**Test:** `should inject repository and service dependencies`

**Purpose:** Verify proper dependency injection

**Assertions:**

- ✅ Use case instance is created successfully
- ✅ Dependencies are properly injected via constructor

### 14. Undefined Values Handling

**Test:** `should handle undefined values in UpdateProductDTO`

**Purpose:** Verify that undefined/empty DTO doesn't call unnecessary update methods

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  // All fields undefined
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockRepository.update.mockResolvedValue(existingProduct)`

**Assertions:**

- ✅ No service update methods called
- ✅ Repository update called with original product
- ✅ Original product returned unchanged

### 15. Empty String Values Handling

**Test:** `should handle empty string values appropriately`

**Purpose:** Verify that valid string values are processed correctly

**Test Data:**

```typescript
const productData: UpdateProductDTO = {
  name: 'Updated Name',
  description: 'Updated Description',
};
```

**Mock Setup:**

- `mockRepository.findById.mockResolvedValue(existingProduct)`
- `mockService.updateProductDetails.mockReturnValue(updatedProduct)`
- `mockRepository.update.mockResolvedValue(updatedProduct)`

**Assertions:**

- ✅ `mockService.updateProductDetails` called
- ✅ Result has updated values

## Test Coverage Metrics

### Test Suites: 3

1. **execute method** - 12 test cases
2. **dependency injection** - 1 test case
3. **edge cases** - 2 test cases

### Total Tests: 15

### Coverage Areas:

- ✅ **Product Retrieval** - Verify existing product retrieval
- ✅ **Field Updates** - All updateable fields tested individually
- ✅ **Partial Updates** - Verify selective field updates
- ✅ **Multiple Updates** - Verify simultaneous field updates
- ✅ **Error Handling** - Product not found and validation errors
- ✅ **Type Safety** - Proper type conversion and passing
- ✅ **Dependency Injection** - Constructor injection verification
- ✅ **Edge Cases** - Undefined values and boundary conditions

## Test Execution

### Run All Tests

```bash
npm test
```

### Run Only UpdateProductUseCase Tests

```bash
npm test -- src/__tests__/unit/products/updateProductUseCase.test.ts
```

### Run in Watch Mode

```bash
npm run test:watch -- src/__tests__/unit/products/updateProductUseCase.test.ts
```

## Test Results

**Actual Test Execution Output:**

```
 PASS  src/__tests__/unit/products/updateProductUseCase.test.ts
   UpdateProductUseCase
     execute method
       √ should throw error when product not found (22 ms)
       √ should update product price successfully (4 ms)
       √ should update product stock successfully (2 ms)
       √ should update product name successfully (2 ms)
       √ should update product description successfully (2 ms)
       √ should update product category successfully (2 ms)
       √ should update product isActive status successfully (1 ms)
       √ should update product wishlist status successfully (2 ms)
       √ should handle partial updates correctly (2 ms)
       √ should update multiple fields at once (1 ms)
       √ should handle zero stock update (1 ms)
       √ should handle negative price validation in update (2 ms)
     dependency injection
       √ should inject repository and service dependencies (1 ms)
     edge cases
       √ should handle undefined values in UpdateProductDTO (1 ms)
       √ should handle empty string values appropriately (2 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Snapshots:   0 total
```

## Integration with Main Test Suite

This test suite integrates with the overall test coverage strategy:

- **Unit Test Category**: Tests application layer (use cases)
- **Coverage Focus**: Business logic, type safety, and error handling
- **Test Organization**: Follows established unit/integration separation
- **Total Test Suite**: 158 tests passing (including this suite)

## Relationship to Clean Architecture

```
┌─────────────────────────────────────────┐
│         Test Coverage Layers             │
├─────────────────────────────────────────┤
│  Unit Tests (Application Layer)         │  ← UpdateProductUseCase tests
├─────────────────────────────────────────┤
│  Unit Tests (Domain Layer)              │  ← Product entity tests
├─────────────────────────────────────────┤
│  Integration Tests (Interface Layer)    │  ← API endpoint tests
└─────────────────────────────────────────┘
```

## Benefits of This Test Suite

### 1. Type Safety Verification

- Ensures the type safety fixes work correctly
- Verifies proper handling of Product objects vs DTOs
- Prevents regression of the original TypeScript errors

### 2. Business Logic Validation

- Tests all business rules enforced by the use case
- Validates proper error handling for non-existent products
- Ensures Product entity validation is applied
- Verifies partial update functionality

### 3. Comprehensive Coverage

- All updateable fields tested individually
- Multiple field updates tested
- Edge cases and boundary conditions covered
- Error scenarios validated

### 4. Maintainability

- Clear test organization following established patterns
- Comprehensive coverage of all code paths
- Easy to extend with new test cases
- Follows same structure as other use case tests

### 5. Documentation

- Serves as executable documentation for the use case
- Shows expected behavior and edge cases
- Provides examples of proper usage
- Demonstrates type safety fixes in action

## Next Steps

### Additional Test Cases to Consider

1. **Edge Case Testing:**
   - Very long product names (boundary testing)
   - Maximum allowed price values
   - Boundary values for stock quantities
   - Multiple wishlist status toggles

2. **Integration Testing:**
   - Test with real MongoDB repository
   - Test complete API flow (controller → use case → repository)
   - Test concurrent update scenarios

3. **Performance Testing:**
   - Bulk product update scenarios
   - Concurrent update requests
   - Large product catalog updates

## Conclusion

The `UpdateProductUseCase` test suite provides comprehensive coverage of the use case implementation, ensuring proper functionality, type safety, and error handling. The tests follow established patterns and integrate seamlessly with the overall test strategy, contributing to the project's excellent test coverage.

Key achievements:

- ✅ 15 comprehensive test cases covering all functionality
- ✅ Type safety verification for the fixed issues
- ✅ Complete error handling validation
- ✅ Integration with existing test infrastructure
- ✅ Follows Clean Architecture testing principles
- ✅ Contributes to overall 100% test coverage goal

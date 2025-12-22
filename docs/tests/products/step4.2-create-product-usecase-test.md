# CreateProductUseCase Test Documentation - Step 4.2

## Overview

Comprehensive test suite for the `CreateProductUseCase` implementation, ensuring proper functionality, type safety, and error handling. This test suite validates the use case's ability to transform DTOs to domain entities, enforce business rules, and persist products through the repository.

## Test File Location

**File:** [`src/test/unit/products/createProductUseCase.test.ts`](file:///e:/Project/jollyJet/src/test/unit/products/createProductUseCase.test.ts)

## Test Structure

```typescript
describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let mockService: jest.Mocked<ProductService>;

  beforeEach(() => {
    // Setup mocks and use case instance
  });

  describe('execute method', () => {
    // 7 test cases for execute method
  });

  describe('dependency injection', () => {
    // 1 test case for DI
  });
});
```

## Test Cases

### 1. Successful Product Creation

**Test:** `should create a product successfully`

**Purpose:** Verify the complete flow from DTO to persisted product

**Test Data:**

```typescript
const productData: CreateProductDTO = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: true,
};
```

**Mock Setup:**

- `mockService.isAvailable.mockReturnValue(true)`
- `mockRepository.create.mockResolvedValue(new Product({ ...productData, id: '1' }))`

**Assertions:**

- ✅ `mockService.isAvailable` called
- ✅ `mockRepository.create` called
- ✅ Result is instance of `Product`

### 2. Unavailable Product Error Handling

**Test:** `should throw error for unavailable product`

**Purpose:** Ensure proper error handling when product is not available

**Test Data:**

```typescript
const productData: CreateProductDTO = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 0, // No stock
  category: 'Test Category',
  isActive: true,
};
```

**Mock Setup:**

- `mockService.isAvailable.mockReturnValue(false)`

**Assertions:**

- ✅ Throws error with message `'Product is not available.'`

### 3. Optional isActive Property Handling

**Test:** `should handle optional isActive property`

**Purpose:** Verify default value handling for isActive property

**Test Data:**

```typescript
const productData: CreateProductDTO = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: true, // default value
};
```

**Mock Setup:**

- `mockService.isAvailable.mockReturnValue(true)`
- `mockRepository.create.mockResolvedValue(new Product({ ...productData, id: '1', isActive: true }))`

**Assertions:**

- ✅ Result has `isActive: true`

### 4. Explicit isActive Property Handling

**Test:** `should handle explicit isActive property`

**Purpose:** Verify explicit isActive value is respected

**Test Data:**

```typescript
const productData: CreateProductDTO = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: false,
};
```

**Mock Setup:**

- `mockService.isAvailable.mockReturnValue(true)`
- `mockRepository.create.mockResolvedValue(new Product({ ...productData, id: '1', isActive: false }))`

**Assertions:**

- ✅ Result has `isActive: false`

### 5. Type Safety Verification

**Test:** `should pass correct Product object to isAvailable`

**Purpose:** Verify the type safety fix - ensuring Product object (not CreateProductDTO) is passed to isAvailable

**Test Data:**

```typescript
const productData: CreateProductDTO = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: true,
};
```

**Mock Setup:**

- `mockService.isAvailable.mockReturnValue(true)`
- `mockRepository.create.mockResolvedValue(new Product({ ...productData, id: '1' }))`

**Assertions:**

- ✅ `isAvailable` called with instance of `Product`
- ✅ Product object has correct properties (name, stock, isActive)

### 6. Validation Error Handling - Empty Name

**Test:** `should handle validation errors from Product entity`

**Purpose:** Verify Product entity validation catches invalid data

**Test Data:**

```typescript
const invalidProductData: CreateProductDTO = {
  name: '', // Invalid: empty name
  description: 'Test Description',
  price: 100,
  stock: 10,
  category: 'Test Category',
  isActive: true,
};
```

**Assertions:**

- ✅ Throws error with message `'Product name is required.'`

### 7. Validation Error Handling - Negative Price

**Test:** `should handle negative price validation`

**Purpose:** Verify price validation works correctly

**Test Data:**

```typescript
const invalidProductData: CreateProductDTO = {
  name: 'Test Product',
  description: 'Test Description',
  price: -100, // Invalid: negative price
  stock: 10,
  category: 'Test Category',
  isActive: true,
};
```

**Assertions:**

- ✅ Throws error with message `'Product price must be a non-negative number.'`

### 8. Validation Error Handling - Negative Stock

**Test:** `should handle negative stock validation`

**Purpose:** Verify stock validation works correctly

**Test Data:**

```typescript
const invalidProductData: CreateProductDTO = {
  name: 'Test Product',
  description: 'Test Description',
  price: 100,
  stock: -10, // Invalid: negative stock
  category: 'Test Category',
  isActive: true,
};
```

**Assertions:**

- ✅ Throws error with message `'Product stock must be a non-negative number.'`

### 9. Dependency Injection Verification

**Test:** `should inject repository and service dependencies`

**Purpose:** Verify proper dependency injection

**Assertions:**

- ✅ Use case instance is created successfully
- ✅ Dependencies are properly injected via constructor

## Test Coverage Metrics

### Test Suites: 2

1. **execute method** - 8 test cases
2. **dependency injection** - 1 test case

### Total Tests: 9

### Coverage Areas:

- ✅ **DTO to Entity Transformation** - Verified proper conversion
- ✅ **Business Rule Enforcement** - Availability checking
- ✅ **Error Handling** - Validation and business rule errors
- ✅ **Type Safety** - Proper type conversion and passing
- ✅ **Dependency Injection** - Constructor injection verification

## Test Execution

### Run All Tests

```bash
npm test
```

### Run Only CreateProductUseCase Tests

```bash
npm test -- src/test/unit/products/createProductUseCase.test.ts
```

### Run in Watch Mode

```bash
npm run test:watch -- src/test/unit/products/createProductUseCase.test.ts
```

## Test Results

**Expected Output:**

```
 PASS  src/test/unit/products/createProductUseCase.test.ts
  CreateProductUseCase
    execute method
      ✓ should create a product successfully (10ms)
      ✓ should throw error for unavailable product (5ms)
      ✓ should handle optional isActive property (3ms)
      ✓ should handle explicit isActive property (2ms)
      ✓ should pass correct Product object to isAvailable (4ms)
      ✓ should handle validation errors from Product entity (1ms)
      ✓ should handle negative price validation (1ms)
      ✓ should handle negative stock validation (1ms)
    dependency injection
      ✓ should inject repository and service dependencies (1ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
```

## Integration with Main Test Suite

This test suite integrates with the overall test coverage strategy:

- **Unit Test Category**: Tests application layer (use cases)
- **Coverage Focus**: Business logic and type safety
- **Test Organization**: Follows established unit/integration separation

## Relationship to Clean Architecture

```
┌─────────────────────────────────────────┐
│         Test Coverage Layers             │
├─────────────────────────────────────────┤
│  Unit Tests (Application Layer)         │  ← CreateProductUseCase tests
├─────────────────────────────────────────┤
│  Unit Tests (Domain Layer)              │  ← Product entity tests
├─────────────────────────────────────────┤
│  Integration Tests (Interface Layer)    │  ← API endpoint tests
└─────────────────────────────────────────┘
```

## Benefits of This Test Suite

### 1. Type Safety Verification

- Ensures the type safety fix works correctly
- Verifies proper conversion from DTO to domain entity
- Prevents regression of the original TypeScript error

### 2. Business Logic Validation

- Tests all business rules enforced by the use case
- Validates proper error handling for unavailable products
- Ensures Product entity validation is applied

### 3. Maintainability

- Clear test organization following established patterns
- Comprehensive coverage of all code paths
- Easy to extend with new test cases

### 4. Documentation

- Serves as executable documentation for the use case
- Shows expected behavior and edge cases
- Provides examples of proper usage

## Next Steps

### Additional Test Cases to Consider

1. **Edge Case Testing:**
   - Very long product names
   - Maximum allowed price values
   - Boundary values for stock quantities

2. **Integration Testing:**
   - Test with real MongoDB repository
   - Test complete API flow (controller → use case → repository)

3. **Performance Testing:**
   - Bulk product creation scenarios
   - Concurrent creation requests

## Conclusion

The CreateProductUseCase test suite provides comprehensive coverage of the use case implementation, ensuring proper functionality, type safety, and error handling. The tests follow established patterns and integrate seamlessly with the overall test strategy, contributing to the project's 100% test coverage goal.

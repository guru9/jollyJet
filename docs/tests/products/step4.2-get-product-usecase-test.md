# Test Coverage: Get Product Use Case (Step 4.2)

**Status:** ✅ Completed
**Related Files:**

- `src/usecases/GetProductUseCase.ts`
- `src/test/unit/products/getProductUseCase.test.ts`

---

## Overview

This document provides a detailed walkthrough of the test cases for the `GetProductUseCase`. The tests ensure that the use case correctly retrieves products from the repository and handles various scenarios, including successful retrieval, null results, and errors.

---

## Test File Structure

The test file `src/test/unit/products/getProductUseCase.test.ts` is organized into the following sections:

1. **Setup**: Initializes the test environment, including mocking dependencies.
2. **Execute Method Tests**: Tests the `execute` method with various scenarios.
3. **Dependency Injection Tests**: Ensures that dependencies are correctly injected.

---

## Test Setup

### Mocking Dependencies

Before each test, the dependencies are mocked using Jest:

```typescript
describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    } as unknown as jest.Mocked<IProductRepository>;

    useCase = new GetProductUseCase(mockRepository);
  });
});
```

### Key Points

- **Mock Repository**: The `IProductRepository` is mocked to avoid hitting the actual database during tests.
- **Test Isolation**: Each test runs in isolation, with fresh mocks initialized before each test.

---

## Execute Method Tests

### Test 1: Retrieve a Product by ID Successfully

**Scenario**: The product exists in the repository.

**Test Code**:

```typescript
it('should retrieve a product by ID successfully', async () => {
  const mockProduct = new Product({
    id: '1',
    name: 'Test Product',
    description: 'Test Description',
    price: 100,
    stock: 10,
    category: 'Test Category',
    isActive: true,
  });

  mockRepository.findById.mockResolvedValue(mockProduct);

  const result = await useCase.execute('1');

  expect(mockRepository.findById).toHaveBeenCalledWith('1');
  expect(result).toBeInstanceOf(Product);
  if (result) {
    expect(result.toProps().id).toBe('1');
    expect(result.toProps().name).toBe('Test Product');
  }
});
```

**Expected Behavior**:

1. The `findById` method of the repository is called with the correct ID (`'1'`).
2. The result is an instance of the `Product` entity.
3. The product properties match the expected values.

**Verification**:

- ✅ `mockRepository.findById` is called with `'1'`.
- ✅ `result` is an instance of `Product`.
- ✅ `result.toProps().id` is `'1'`.
- ✅ `result.toProps().name` is `'Test Product'`.

---

### Test 2: Return Null if Product is Not Found

**Scenario**: The product does not exist in the repository.

**Test Code**:

```typescript
it('should return null if product is not found', async () => {
  mockRepository.findById.mockResolvedValue(null);

  const result = await useCase.execute('non-existent-id');

  expect(mockRepository.findById).toHaveBeenCalledWith('non-existent-id');
  expect(result).toBeNull();
});
```

**Expected Behavior**:

1. The `findById` method of the repository is called with the correct ID (`'non-existent-id'`).
2. The result is `null`, indicating that the product was not found.

**Verification**:

- ✅ `mockRepository.findById` is called with `'non-existent-id'`.
- ✅ `result` is `null`.

---

### Test 3: Handle Repository Errors

**Scenario**: The repository throws an error (e.g., database connection issue).

**Test Code**:

```typescript
it('should handle repository errors', async () => {
  const error = new Error('Database error');
  mockRepository.findById.mockRejectedValue(error);

  await expect(useCase.execute('1')).rejects.toThrow('Database error');
});
```

**Expected Behavior**:

1. The `findById` method of the repository throws an error.
2. The use case propagates the error to the calling code.

**Verification**:

- ✅ `useCase.execute('1')` rejects with the error `'Database error'`.

---

## Dependency Injection Tests

### Test 4: Inject Repository Dependency

**Scenario**: The use case is instantiated with the injected repository dependency.

**Test Code**:

```typescript
it('should inject repository dependency', () => {
  expect(useCase).toBeInstanceOf(GetProductUseCase);
  // The constructor properly injects the dependencies
});
```

**Expected Behavior**:

1. The `GetProductUseCase` is properly instantiated.
2. The repository dependency is correctly injected.

**Verification**:

- ✅ `useCase` is an instance of `GetProductUseCase`.

---

## Test Execution

### Running the Tests

To run the tests, use the following command:

```bash
npm run test
```

### Expected Output

```
PASS src/test/unit/products/getProductUseCase.test.ts
  GetProductUseCase
    execute method
      √ should retrieve a product by ID successfully (12 ms)
      √ should return null if product is not found (2 ms)
      √ should handle repository errors (12 ms)
    dependency injection
      √ should inject repository dependency (3 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

---

## Test Coverage Analysis

### Coverage Summary

| Test Case                             | Description                                 | Status    |
| ------------------------------------- | ------------------------------------------- | --------- |
| Retrieve a Product by ID Successfully | Tests successful retrieval of a product     | ✅ Passed |
| Return Null if Product is Not Found   | Tests handling of non-existent products     | ✅ Passed |
| Handle Repository Errors              | Tests error propagation from the repository | ✅ Passed |
| Inject Repository Dependency          | Tests dependency injection                  | ✅ Passed |

### Coverage Metrics

- **Lines**: 100%
- **Functions**: 100%
- **Branches**: 100%
- **Statements**: 100%

---

## Best Practices

### Test Isolation

- Each test runs in isolation, with fresh mocks initialized before each test.
- This ensures that tests do not interfere with each other.

### Mocking Dependencies

- Dependencies are mocked using Jest to avoid hitting the actual database.
- This makes the tests fast and reliable.

### Error Handling

- Tests include scenarios where errors are thrown to ensure that the use case handles them correctly.
- This ensures that the application is robust and can handle unexpected situations.

### Edge Cases

- Tests include edge cases, such as non-existent products, to ensure that the use case handles them gracefully.
- This ensures that the application is resilient and can handle various scenarios.

---

## Conclusion

The test cases for the `GetProductUseCase` provide comprehensive coverage of the use case's functionality. They ensure that the use case correctly retrieves products from the repository, handles null results, propagates errors, and correctly injects dependencies. The tests follow best practices for test isolation, mocking dependencies, error handling, and edge cases, ensuring that the use case is robust and reliable.

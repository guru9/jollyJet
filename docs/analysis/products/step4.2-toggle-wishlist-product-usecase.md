# Analysis: Step 4.2 - ToggleWishlistProductUseCase Implementation

## Overview

Step 4.2 implements the ToggleWishlistProductUseCase, which is responsible for toggling a product's wishlist status in the system. This use case follows the Clean Architecture principles by acting as an intermediary between the interface layer (DTOs) and the infrastructure layer (repository), ensuring proper validation and business rule enforcement.

## Implementation Details

### Files Created/Updated

#### 1. ToggleWishlistProductUseCase

**Location:** `src/usecases/ToggleWishlistProductUseCase.ts`

**Purpose:** Orchestrates the toggling of a product's wishlist status with proper validation and error handling

**Structure:**

```typescript
@injectable()
export class ToggleWishlistProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
  ) {}

  public async execute(productId: string, wishlistData: ToggleWishlistDTO): Promise<Product> {
    // Validate input
    if (!productId?.trim()) {
      throw new Error('Product ID is required for wishlist toggle.');
    }

    // Check if product exists before attempting to toggle
    const existingProduct = await this.productRepository.findById(productId);
    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    // Toggle the wishlist status using the repository
    return await this.productRepository.toggleWishlistStatus(productId, wishlistData.isInWishlist);
  }
}
```

**Key Features:**

- Dependency injection for repository
- Input validation for product ID
- Product existence verification
- Repository-based wishlist status toggling
- Proper error handling

## Design Patterns Applied

### 1. Use Case Pattern

- **Purpose:** Separate business logic from interface concerns
- **Implementation:** ToggleWishlistProductUseCase orchestrates the wishlist toggle flow
- **Benefits:** Single responsibility, testable, independent of UI/interface changes

### 2. Dependency Injection Pattern

- **Purpose:** Decouple components and improve testability
- **Implementation:** Repository injected via constructor using DI_TOKENS
- **Benefits:** Easy to mock dependencies, improved testability, clear separation of concerns

### 3. Repository Pattern

- **Purpose:** Abstract data access operations
- **Implementation:** Uses IProductRepository for data operations
- **Benefits:** Decouples business logic from data access, enables testing with mocks

## Integration Points

### Dependencies

- **ToggleWishlistDTO:** Interface layer DTO containing wishlist toggle data
- **IProductRepository:** Repository interface for data persistence and retrieval
- **Product:** Domain entity representing a product

### Used By

- **ProductController:** Will use this use case to toggle product wishlist status via API
- **CLI Commands:** Could use this use case for command-line wishlist operations
- **Batch Processing:** Could use this use case for bulk wishlist updates

### Enables

- **Consistency:** Ensures all wishlist toggling follows the same business rules
- **Validation:** Centralized validation through use case logic
- **Testability:** Easy to test with mocked dependencies

## Benefits

### 1. Separation of Concerns

- Clear separation between interface (DTO), application (use case), and infrastructure layers
- Each component has a single responsibility
- Easy to modify one layer without affecting others

### 2. Business Rule Enforcement

- Validates product existence before toggling
- Ensures product ID is provided and valid
- Consistent error handling across all toggle operations

### 3. Testability

- Easy to mock repository dependencies
- Can test use case logic independently
- Clear input/output contract

### 4. Maintainability

- Centralized wishlist toggle logic
- Easy to add new validation rules
- Clear flow from DTO to repository operation

## Error Handling Strategy

### Input Validation Errors

- **Empty Product ID:** Throws `'Product ID is required for wishlist toggle.'`
- **Null/Undefined Product ID:** Throws `'Product ID is required for wishlist toggle.'`

### Business Logic Errors

- **Product Not Found:** Throws `'Product not found.'` when product doesn't exist

### Infrastructure Errors

- **Repository Errors:** Propagates database connection failures and update failures
- **Unhandled Errors:** Allows repository-level errors to bubble up with original messages

## Testing Strategy

### Test Coverage

- **Use Case Tests:** Test the complete flow from input validation to repository operations
- **Validation Tests:** Test input validation and error handling
- **Repository Integration Tests:** Test with real repository implementation
- **Edge Case Tests:** Test with invalid inputs, missing products, etc.

### Test Approach

- **Unit Tests:** Test use case logic with mocked dependencies
- **Integration Tests:** Test with real database
- **Error Scenario Tests:** Test proper error responses for various failure cases

### Example Test Cases

**For detailed test documentation, refer to:** [Toggle Wishlist Product Use Case Test Documentation](../../tests/products/step4.2-toggle-wishlist-product-usecase-test.md)

```typescript
describe('ToggleWishlistProductUseCase', () => {
  let useCase: ToggleWishlistProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      toggleWishlistStatus: jest.fn(),
      // other methods
    } as unknown as jest.Mocked<IProductRepository>;

    useCase = new ToggleWishlistProductUseCase(mockRepository);
  });

  it('should toggle wishlist status successfully', async () => {
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

    mockRepository.findById.mockResolvedValue(existingProduct);
    mockRepository.toggleWishlistStatus.mockResolvedValue(updatedProduct);

    const result = await useCase.execute(productId, wishlistData);

    expect(mockRepository.findById).toHaveBeenCalledWith(productId);
    expect(mockRepository.toggleWishlistStatus).toHaveBeenCalledWith(productId, true);
    expect(result).toBeInstanceOf(Product);
    expect(result.toProps().isInWishlist).toBe(true);
  });

  it('should throw error when product not found', async () => {
    const productId = '507f1f77bcf86cd799439011';
    const wishlistData: ToggleWishlistDTO = { isInWishlist: true };

    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(productId, wishlistData)).rejects.toThrow('Product not found.');
  });
});
```

## Relationship to Clean Architecture

```
┌─────────────────────────────────────────┐
│         Interface Layer (API)           │
│  ┌───────────────────────────────────┐  │
│  │    ToggleWishlistDTO             │  │
│  │  interface/dtos/ToggleWishlistDTO.ts│  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Use Cases Layer (Application)    │
│  ┌───────────────────────────────────┐  │
│  │ ToggleWishlistProductUseCase      │  │
│  │ usecases/ToggleWishlistProductUseCase.ts │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Infrastructure Layer (Data)      │
│  ┌───────────────────────────────────┐  │
│  │      IProductRepository          │  │
│  │  domain/interfaces/...            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Next Steps

### Step 4.3: Implement Additional Use Cases

- Continue implementing other product operations (update, delete, list)
- Follow the same pattern of DTO → Use Case → Repository
- Ensure consistent error handling and validation

### Step 5.1: Build ProductController

- Use ToggleWishlistProductUseCase for wishlist operations
- Handle HTTP requests and responses
- Integrate with Swagger for API documentation

### Step 5.2: Set up Product Routes

- Define API endpoints for wishlist operations
- Apply proper middleware (authentication, validation)
- Ensure consistent error responses

## Conclusion

Step 4.2 successfully implements the ToggleWishlistProductUseCase, providing a clean and maintainable way to toggle product wishlist status while enforcing business rules and maintaining proper error handling. The implementation follows Clean Architecture principles with clear separation between interface, application, and infrastructure layers. The use case properly validates inputs, checks product existence, and delegates the actual toggle operation to the repository interface. This provides a solid foundation for the upcoming controller and route layers.

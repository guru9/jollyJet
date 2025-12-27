# Analysis: Step 4.2 - UpdateProductUseCase Implementation

## Overview

Step 4.2 implements the UpdateProductUseCase, which is responsible for orchestrating the update of existing products in the system. This use case follows the Clean Architecture principles by acting as an intermediary between the interface layer (DTOs) and the domain layer (entities and services).

## Implementation Details

### Files Created/Updated

#### 1. UpdateProductUseCase

**Location:** `src/usecases/UpdateProductUseCase.ts`

**Purpose:** Orchestrates the update of existing products with proper validation and business rule enforcement

**Structure:**

```typescript
@injectable()
export class UpdateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    private productService: ProductService
  ) {}

  public async execute(productId: string, productData: UpdateProductDTO): Promise<Product> {
    // Retrieve existing product
    let existingProduct = await this.productRepository.findById(productId);

    if (!existingProduct) {
      throw new Error('Product not found.');
    }

    // Update product properties based on provided data
    if (productData.price) {
      existingProduct = this.productService.updatePrice(existingProduct, productData.price);
    }

    if (productData.stock !== undefined) {
      existingProduct = this.productService.updateStock(existingProduct, productData.stock);
    }

    if (productData.name) {
      existingProduct = this.productService.updateProductDetails(existingProduct, {
        name: productData.name,
      });
    }

    if (productData.description) {
      existingProduct = this.productService.updateProductDetails(existingProduct, {
        description: productData.description,
      });
    }

    if (productData.category) {
      existingProduct = this.productService.updateProductDetails(existingProduct, {
        category: productData.category,
      });
    }

    if (productData.isActive !== undefined) {
      existingProduct = this.productService.updateProductDetails(existingProduct, {
        isActive: productData.isActive,
      });
    }

    if (productData.iswishliststatus !== undefined) {
      existingProduct = this.productService.updateWishlistStatus(
        existingProduct,
        productData.iswishliststatus
      );
    }

    // Persist the updated product
    return this.productRepository.update(existingProduct);
  }
}
```

**Key Features:**

- Dependency injection for repository and service
- Retrieval of existing product by ID
- Comprehensive handling of all updateable product fields
- Business rule validation through ProductService methods
- Repository persistence of updated product
- Proper error handling for non-existent products

## Design Patterns Applied

### 1. Use Case Pattern

- **Purpose:** Separate business logic from interface concerns
- **Implementation:** UpdateProductUseCase orchestrates the product update flow
- **Benefits:** Single responsibility, testable, independent of UI/interface changes

### 2. Dependency Injection Pattern

- **Purpose:** Decouple components and improve testability
- **Implementation:** Repository and service injected via constructor
- **Benefits:** Easy to mock dependencies, improved testability, clear separation of concerns

### 3. Service Layer Pattern

- **Purpose:** Centralize business logic and validation
- **Implementation:** ProductService methods for specific updates (price, stock, etc.)
- **Benefits:** Reusable business logic, consistent validation, maintainable code

## Integration Points

### Dependencies

- **UpdateProductDTO:** Interface layer DTO containing product update data (all fields optional)
- **ProductService:** Domain service for business rule validation and updates
- **IProductRepository:** Repository interface for data persistence
- **Product:** Domain entity representing a product

### Used By

- **ProductController:** Will use this use case to update products via API
- **CLI Commands:** Could use this use case for command-line product updates
- **Batch Processing:** Could use this use case for bulk product updates

### Enables

- **Consistency:** Ensures all product updates follow the same business rules
- **Validation:** Centralized validation through domain entity and service
- **Testability:** Easy to test with mocked dependencies
- **Flexibility:** Handles partial updates (only specified fields are updated)

## Benefits

### 1. Separation of Concerns

- Clear separation between interface (DTO), application (use case), and domain layers
- Each component has a single responsibility
- Easy to modify one layer without affecting others

### 2. Business Rule Enforcement

- All business rules enforced through domain entity validation
- Product updates validated through ProductService methods
- Consistent validation across all update paths

### 3. Testability

- Easy to mock repository and service dependencies
- Can test use case logic independently
- Clear input/output contract

### 4. Maintainability

- Centralized product update logic
- Easy to add new validation rules
- Clear flow from DTO to persisted entity
- Handles partial updates gracefully

## Type Safety Fixes

### Issue 1: Constant Assignment

**Original Issue:**

```typescript
// ❌ Type Error: Cannot assign to 'existingProduct' because it is a constant
const existingProduct = await this.productRepository.findById(productId);
if (productData.price)
  existingProduct = this.productService.updatePrice(existingProduct, productData.price);
```

**Solution:**

```typescript
// ✅ Fixed: Use let instead of const to allow reassignment
let existingProduct = await this.productRepository.findById(productId);
if (productData.price)
  existingProduct = this.productService.updatePrice(existingProduct, productData.price);
```

**Benefits:**

- Allows reassignment of the product variable as it gets updated
- Maintains type safety throughout the update process
- Follows TypeScript best practices

### Issue 2: Promise vs Product Type Mismatch

**Original Issue:**

```typescript
// ❌ Type Error: Argument of type 'Promise<Product | null>' is not assignable to parameter of type 'Product'
if (productData.price)
  existingProduct = await this.productService.updatePrice(existingProduct, productData.price);
```

**Solution:**

```typescript
// ✅ Fixed: Remove await since updatePrice returns Product, not Promise
if (productData.price)
  existingProduct = this.productService.updatePrice(existingProduct, productData.price);
```

**Benefits:**

- Correctly handles the synchronous return type of ProductService methods
- Maintains proper type safety
- Prevents unnecessary async/await operations

## Testing Strategy

### Test Coverage

- **Use Case Tests:** Test the complete flow from DTO to persisted product
- **Validation Tests:** Test business rule enforcement for updates
- **Error Handling Tests:** Test proper error responses (product not found, etc.)
- **Integration Tests:** Test with real repository implementation
- **Partial Update Tests:** Test updates with only some fields specified

### Test Approach

- **Unit Tests:** Test use case logic with mocked dependencies
- **Integration Tests:** Test with real database
- **Edge Case Tests:** Test with invalid data, missing fields, etc.
- **Partial Update Tests:** Test updates with various combinations of fields

### Example Test Cases

**For detailed test documentation, refer to:** [Update Product Use Case Test Documentation](../../tests/products/step4.2-update-product-usecase-test.md)

```typescript
describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;
  let mockService: jest.Mocked<ProductService>;
  let existingProduct: Product;

  beforeEach(() => {
    existingProduct = new Product({
      id: '1',
      name: 'Original Product',
      description: 'Original Description',
      price: 100,
      stock: 10,
      category: 'Original Category',
      isActive: true,
    });

    mockRepository = {
      findById: jest.fn().mockResolvedValue(existingProduct),
      update: jest.fn().mockResolvedValue(existingProduct),
      // other methods
    } as unknown as jest.Mocked<IProductRepository>;

    mockService = {
      updatePrice: jest.fn().mockReturnValue(existingProduct),
      updateStock: jest.fn().mockReturnValue(existingProduct),
      updateProductDetails: jest.fn().mockReturnValue(existingProduct),
      updateWishlistStatus: jest.fn().mockReturnValue(existingProduct),
      // other methods
    } as unknown as jest.Mocked<ProductService>;

    useCase = new UpdateProductUseCase(mockRepository, mockService);
  });

  it('should update product price successfully', async () => {
    const productData: UpdateProductDTO = {
      price: 150,
    };

    const updatedProduct = new Product({ ...existingProduct.toProps(), price: 150 });
    mockService.updatePrice.mockReturnValue(updatedProduct);
    mockRepository.update.mockResolvedValue(updatedProduct);

    const result = await useCase.execute('1', productData);

    expect(mockRepository.findById).toHaveBeenCalledWith('1');
    expect(mockService.updatePrice).toHaveBeenCalledWith(existingProduct, 150);
    expect(mockRepository.update).toHaveBeenCalledWith(updatedProduct);
    expect(result.toProps().price).toBe(150);
  });

  it('should throw error when product not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const productData: UpdateProductDTO = {
      price: 150,
    };

    await expect(useCase.execute('non-existent-id', productData)).rejects.toThrow(
      'Product not found.'
    );
  });

  it('should handle partial updates correctly', async () => {
    const productData: UpdateProductDTO = {
      name: 'Updated Name',
      description: 'Updated Description',
      // Other fields omitted - should remain unchanged
    };

    const updatedProduct = new Product({
      ...existingProduct.toProps(),
      name: 'Updated Name',
      description: 'Updated Description',
    });
    mockService.updateProductDetails.mockReturnValue(updatedProduct);
    mockRepository.update.mockResolvedValue(updatedProduct);

    const result = await useCase.execute('1', productData);

    expect(mockService.updateProductDetails).toHaveBeenCalled();
    expect(result.toProps().name).toBe('Updated Name');
    expect(result.toProps().description).toBe('Updated Description');
    expect(result.toProps().price).toBe(100); // Should remain unchanged
  });

  it('should update multiple fields at once', async () => {
    const productData: UpdateProductDTO = {
      price: 200,
      stock: 25,
      name: 'Completely Updated Product',
      isActive: false,
    };

    const updatedProduct = new Product({
      ...existingProduct.toProps(),
      price: 200,
      stock: 25,
      name: 'Completely Updated Product',
      isActive: false,
    });

    mockService.updatePrice.mockReturnValue(updatedProduct);
    mockService.updateStock.mockReturnValue(updatedProduct);
    mockService.updateProductDetails.mockReturnValue(updatedProduct);
    mockRepository.update.mockResolvedValue(updatedProduct);

    const result = await useCase.execute('1', productData);

    expect(mockService.updatePrice).toHaveBeenCalled();
    expect(mockService.updateStock).toHaveBeenCalled();
    expect(mockService.updateProductDetails).toHaveBeenCalled();
    expect(result.toProps().price).toBe(200);
    expect(result.toProps().stock).toBe(25);
    expect(result.toProps().name).toBe('Completely Updated Product');
    expect(result.toProps().isActive).toBe(false);
  });
});
```

## Relationship to Clean Architecture

```
┌─────────────────────────────────────────┐
│         Interface Layer (API)           │
│  ┌───────────────────────────────────┐  │
│  │      UpdateProductDTO            │  │
│  │  interface/dtos/UpdateProductDTO.ts│  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Use Cases Layer (Application)    │
│  ┌───────────────────────────────────┐  │
│  │    UpdateProductUseCase          │  │
│  │  usecases/UpdateProductUseCase.ts │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Domain Layer (Business)          │
│  ┌───────────────────────────────────┐  │
│  │      Product Entity              │  │
│  │  domain/entities/Product.ts       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │      ProductService               │  │
│  │  domain/services/ProductService.ts │  │
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

- Create use cases for other product operations (delete, etc.)
- Follow the same pattern of DTO → Domain Entity → Repository
- Ensure consistent error handling and validation

### Step 5.1: Build ProductController

- Use UpdateProductUseCase for product updates
- Handle HTTP requests and responses
- Integrate with Swagger for API documentation

### Step 5.2: Set up Product Routes

- Define API endpoints for product operations
- Apply proper middleware (authentication, validation)
- Ensure consistent error responses

## Conclusion

Step 4.2 successfully implements the UpdateProductUseCase, providing a clean and maintainable way to update products while enforcing business rules and maintaining type safety. The implementation follows Clean Architecture principles with clear separation between interface, application, and domain layers. The use case properly handles the retrieval of existing products, transformation through domain services, and persistence through the repository interface. This provides a solid foundation for the upcoming controller and route layers.

The implementation also addresses critical TypeScript issues including constant assignment problems and Promise vs Product type mismatches, ensuring robust type safety throughout the update process.




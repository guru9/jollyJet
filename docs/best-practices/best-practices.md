# JollyJet Best Practices Guide

This document outlines the comprehensive best practices for the JollyJet project, a high-performance shopping application built with Node.js, TypeScript, and MongoDB. These practices ensure maintainability, scalability, and high code quality.

<details>
<summary>🏛️ Architecture Best Practices</summary>

### Clean Architecture Implementation

The project follows strict Clean Architecture principles to separate concerns and ensure long-term maintainability:

#### Layer Structure

- **🏛️ Domain Layer** (`src/domain`): Pure business logic with no external dependencies
  - **Entities**: Core business models with validation and business rules
  - **Interfaces**: Repository contracts and abstractions
  - **Services**: Pure domain logic operations

- **🌐 Infrastructure Layer** (`src/infrastructure`): External service implementations
  - **Database**: MongoDB/Mongoose implementations
  - **Repositories**: Data access layer implementing domain interfaces
  - **External Services**: Third-party API integrations

- **🎯 Use Cases Layer** (`src/usecases`): Application-specific business rules
  - Orchestrates domain entities and services
  - Implements complex business workflows
  - Uses dependency injection for loose coupling

- **🖥️ Interface Layer** (`src/interface`): HTTP layer and external communications
  - **Controllers**: Request handlers
  - **DTOs**: Data Transfer Objects for input/output
  - **Validators**: Input validation using Zod schemas
  - **Middlewares**: Request processing and error handling

#### Key Architectural Patterns

- **Dependency Inversion**: Use cases depend on abstractions (interfaces), not concretions
- **Single Responsibility**: Each class/module has one reason to change
- **Dependency Injection**: Using tsyringe for IoC container management
- **Factory Pattern**: Entities use factory methods for creation and validation
- **DI Token Strategy**: Use tokens for interfaces, direct injection for concrete classes

### File Organization

```
src/
├── 🧠 domain/ # Pure Business Logic
├── 💼 usecases/ # Application Use Cases
├── 🔌 infrastructure/ # External Services
├── 📡 interface/ # HTTP Layer
├── 🧩 shared/ # Shared Utilities
├── 🏷️ types/ # TypeScript Types
├── ⚙️ config/ # Configuration & DI
├── 🚀 app.ts # App Entry Point
└── 🎬 server.ts # Server Bootstrap

tests/ # 🧪 Test Suites (Root Level)
├── unit/ # Unit tests
├── integration/ # Integration tests
└── setup.ts # Test setup
```

</details>

<details>
<summary>🏗️ Module-Specific Best Practices and Architecture</summary>

This section provides detailed best practices and architectural guidelines for each module/layer in the JollyJet project.

### Domain Layer Best Practices (`src/domain`)

The domain layer contains pure business logic with no external dependencies.

#### Entities (`src/domain/entities`)

- **Factory Pattern**: Use static factory methods for creation and validation
- **Value Objects**: Implement immutable value objects for complex data types
- **Business Rules**: Enforce all business invariants within entities
- **Validation**: Perform domain validation in entity constructors/factory methods
- **Immutability**: Prefer immutable updates by creating new instances

**Example Entity Structure:**

```typescript
export class Product {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number
    // ... other properties
  ) {}

  static create(props: CreateProductProps): Result<Product, DomainError> {
    // Validation and creation logic
  }

  updatePrice(newPrice: number): Result<Product, DomainError> {
    // Business rule validation
  }
}
```

#### Interfaces (`src/domain/interfaces`)

- **Contract Definition**: Define clear contracts for external dependencies
- **Single Responsibility**: One interface per responsibility
- **Naming Convention**: Prefix with `I` (e.g., `IProductRepository`)
- **Method Signatures**: Use domain types in method signatures

#### Services (`src/domain/services`)

- **Pure Functions**: No side effects, pure business logic
- **Dependency Injection**: Accept interfaces, not concretions
- **Single Responsibility**: One service per business capability
- **Testability**: Easy to unit test without mocks

### Infrastructure Layer Best Practices (`src/infrastructure`)

The infrastructure layer implements external concerns like databases and external APIs.

#### Database (`src/infrastructure/database`)

- **Connection Management**: Proper connection pooling and lifecycle
- **Configuration**: Environment-based database configuration
- **Migration Scripts**: Version-controlled schema changes
- **Health Checks**: Database connectivity monitoring

#### Models (`src/infrastructure/models`)

- **ODM Mapping**: Mongoose schemas matching domain entities
- **Validation**: Database-level validation using Mongoose
- **Indexing**: Proper indexes for query performance
- **Type Safety**: TypeScript interfaces for model definitions

**Example Model Structure:**

```typescript
export interface IProductDocument extends Document {
  name: string;
  price: number;
  // ... other fields
}

const ProductSchema = new Schema<IProductDocument>({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  // ... schema definition
});

ProductSchema.index({ name: 1 }); // Indexing
```

#### Repositories (`src/infrastructure/repositories`)

- **Interface Implementation**: Implement domain repository interfaces
- **Data Mapping**: Convert between domain entities and database documents
- **Error Handling**: Proper error translation to domain errors
- **Query Optimization**: Efficient database queries with proper indexing
- **Transaction Support**: Use transactions for multi-document operations
- **ID Validation**: Validate MongoDB ObjectIds before database queries for better performance and error handling

#### Redis and Caching (`src/domain/services/redis`, `src/infrastructure/services`)

- **Connection Management**: Proper Redis connection lifecycle and pooling
- **Configuration**: Environment-based Redis configuration with validation
- **Health Checks**: Redis connectivity monitoring and graceful degradation
- **Connection Reuse**: Use connection pooling for optimal performance
- **Error Handling**: Handle Redis connection failures gracefully
- **Graceful Degradation**: Application should function without Redis when unavailable

**Example Redis Service Structure:**

```typescript
@injectable()
export class RedisService implements IRedisService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor(@inject(DI_TOKENS.REDIS_CONFIG) private config: RedisConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }

      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache set');
        return false;
      }

      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache delete');
        return false;
      }

      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}
```

**Caching Strategy Patterns:**

- **Cache-Aside Pattern**: Check cache first, fallback to database
- **Write-Through**: Update both cache and database synchronously
- **Write-Behind**: Update database first, then update cache asynchronously
- **Cache Warming**: Pre-populate cache with frequently accessed data
- **Cache Invalidation**: Proper cache invalidation on data updates

**Example Cache Implementation:**

```typescript
export class ProductCacheService {
  constructor(private redisService: IRedisService) {}

  private getCacheKey(productId: string): string {
    return `product:${productId}`;
  }

  async getProduct(productId: string): Promise<Product | null> {
    const cacheKey = this.getCacheKey(productId);

    // Try cache first
    const cached = await this.redisService.get<Product>(cacheKey);
    if (cached) {
      logger.info(`Cache hit for product ${productId}`);
      return cached;
    }

    logger.info(`Cache miss for product ${productId}`);
    return null;
  }

  async setProduct(product: Product, ttl: number = 3600): Promise<void> {
    const cacheKey = this.getCacheKey(product.id);
    await this.redisService.set(cacheKey, product, ttl);
  }

  async invalidateProduct(productId: string): Promise<void> {
    const cacheKey = this.getCacheKey(productId);
    await this.redisService.del(cacheKey);
  }

  async warmProductCache(products: Product[]): Promise<void> {
    const pipeline = this.redisService.pipeline();

    products.forEach((product) => {
      const cacheKey = this.getCacheKey(product.id);
      pipeline.set(cacheKey, product, 3600);
    });

    await pipeline.exec();
  }
}
```

**Data Serialization Best Practices:**

- **JSON Serialization**: Use JSON.stringify/parse for simple objects
- **Complex Objects**: Implement custom serialization for complex domain objects
- **Circular References**: Avoid circular references in cached objects
- **Date Handling**: Serialize dates as ISO strings, deserialize as Date objects
- **Type Safety**: Maintain TypeScript types during serialization

**Performance Considerations:**

- **TTL Strategy**: Set appropriate TTL values based on data volatility
- **Memory Management**: Monitor Redis memory usage and implement eviction policies
- **Connection Pooling**: Use connection pooling for high-throughput scenarios
- **Batch Operations**: Use Redis pipelines for multiple operations
- **Key Naming**: Use consistent, hierarchical key naming conventions

**Example Key Naming Convention:**

```typescript
// ✅ Good key naming patterns
const KEYS = {
  PRODUCTS: {
    LIST: (filters: string) => `products:list:${filters}`,
    DETAIL: (id: string) => `products:detail:${id}`,
    SEARCH: (query: string) => `products:search:${hashQuery(query)}`,
  },
  SESSIONS: {
    USER: (userId: string) => `sessions:user:${userId}`,
    TOKEN: (token: string) => `sessions:token:${token}`,
  },
  RATE_LIMITS: {
    API: (userId: string) => `rate_limit:api:${userId}`,
    AUTH: (ip: string) => `rate_limit:auth:${ip}`,
  },
} as const;
```

**Cache Invalidation Strategies:**

- **Time-Based**: Use TTL for automatic invalidation
- **Event-Based**: Invalidate cache on data changes
- **Pattern-Based**: Use Redis SCAN for pattern-based invalidation
- **Dependency-Based**: Invalidate related cache entries on updates

**Example Cache Invalidation:**

```typescript
export class ProductCacheInvalidator {
  constructor(
    private redisService: IRedisService,
    private productRepository: IProductRepository
  ) {}

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    // Update database first
    await this.productRepository.update(productId, updates);

    // Invalidate related cache entries
    await Promise.all([
      this.redisService.del(`products:detail:${productId}`),
      this.invalidateProductListCaches(),
      this.invalidateSearchCaches(),
    ]);
  }

  private async invalidateProductListCaches(): Promise<void> {
    const keys = await this.redisService.keys('products:list:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }

  private async invalidateSearchCaches(): Promise<void> {
    const keys = await this.redisService.keys('products:search:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
```

### Use Cases Layer Best Practices (`src/usecases`)

Use cases orchestrate domain logic and implement application-specific workflows.

- **Single Responsibility**: One use case per business operation
- **Dependency Injection**: Inject all dependencies via constructor
- **Error Handling**: Return domain errors, not infrastructure errors
- **Transaction Management**: Handle transactions at use case level
- **Input/Output DTOs**: Use DTOs for input/output contracts

### Dependency Injection Patterns

#### 🧩 `reflect-metadata` Requirement

`reflect-metadata` is **mandatory** for `tsyringe` to function correctly. It provides the runtime reflection capabilities needed to read decorator metadata.

**Crucial Rules:**

1.  **Absolute Entry Point**: `import 'reflect-metadata';` MUST be the **very first import** in your application's entry point (`src/server.ts`). If any module using decorators is loaded before this import, the application will throw a runtime error.
2.  **Module Safety**: While global import in `server.ts` is sufficient for the running app, it is a best practice to also include it at the top of:
    - `src/app.ts` (for safety during testing/modular loading)
    - `src/config/di-container.ts` (where orchestration happens)
    - Any file using decorators directly (optional, but helps IDEs and isolated tests)

**Correct Implementation:**

```typescript
// src/server.ts
/**
 * ✅ BEST PRACTICE: Mandatory first import for Dependency Injection
 */
import 'reflect-metadata';

import { jollyJetApp } from '@/app';
import config from '@/config';
// ... rest of the application
```

**Why It's Required:**

- **Decorator Metadata**: TypeScript decorators (like `@injectable`, `@inject`) emit metadata that `tsyringe` needs to resolve dependencies at runtime.
- **Runtime Polyfill**: `reflect-metadata` acts as a polyfill for the metadata reflection API. Without it, `tsyringe` cannot determine the types of dependencies in constructor signatures.

**When to use `@inject()` decorators:**

- **Interfaces**: Use `@inject(token)` for repository interfaces and abstractions (e.g., `IProductRepository`).
- **Concrete Classes**: Direct injection is preferred for domain services and utilities (no decorator needed).
- **Configuration**: Use tokens for external services that may have multiple implementations.

#### Interface vs Concrete Class Injection

**Correct Approach: No `@inject` Decorator for `ProductService`**

```typescript
// ✅ Best Practice - Current Implementation
constructor(
  @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
  private productService: ProductService  // No @inject needed
) {}
```

### Why This Pattern Exists:

1. **Interface vs Concrete Class**:
   - `IProductRepository` is an **interface** with multiple potential implementations (MongoDB, SQL, in-memory)
   - `ProductService` is a **concrete class** with a single, stable implementation

2. **Dependency Inversion Principle**:
   - **Repository**: Uses DI token because use cases depend on abstractions, not concretions
   - **Service**: Direct injection because it's a domain service with stable implementation

3. **Project Pattern Consistency**:
   All existing use cases follow this exact pattern:
   - `CreateProductUseCase`: `@inject(DI_TOKENS.PRODUCT_REPOSITORY)` + `private productService: ProductService`
   - `ListProductsUseCase`: Same pattern
   - `UpdateProductUseCase`: Same pattern

**Incorrect Approach: `@inject(ProductService)`**

```typescript
// ❌ Not Recommended - Violates established patterns
constructor(
  @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
  @inject(ProductService) private productService: ProductService  // ❌ Wrong
) {}
```

**Why This Would Be Wrong:**

- **Unnecessary Complexity**: `ProductService` doesn't need a token
- **Pattern Inconsistency**: Breaks established codebase conventions
- **Over-engineering**: Adds complexity without benefit
- **Maintenance Burden**: Requires additional DI container registration

**Best Practice Guidelines:**

✅ **Use `@inject(token)` for:**

- Interfaces (repositories, external services)
- Abstractions that might have multiple implementations
- Third-party services that need configuration

✅ **Use direct injection for:**

- Domain services with single implementations
- Concrete classes that are stable and unlikely to change
- Utility classes and helpers

**Verification:**

- `ProductService` is auto-resolved by tsyringe
- Tests pass with mocked services
- Code compiles and runs without issues
- Follows the same pattern as all other use cases

**Example Use Case Structure:**

```typescript
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository,
    private productService: ProductService
  ) {}

  async execute(input: CreateProductDTO): Promise<Result<ProductResponseDTO, DomainError>> {
    // Orchestration logic
  }
}
```

### Interface Layer Best Practices (`src/interface`)

The interface layer handles HTTP requests and external communications.

#### DTOs (`src/interface/dtos`)

- **Input Validation**: Use Zod schemas for runtime validation
- **Type Safety**: TypeScript interfaces matching Zod schemas
- **Separation**: Separate input and output DTOs
- **Naming**: Suffix with `DTO` (e.g., `CreateProductDTO`)
- **Documentation**: Use JSDoc comments for all DTO interfaces and properties
- **Consistent Naming**: Use camelCase for all property names (e.g., `isWishlistStatus` not `iswishliststatus`)
- **Optional Fields**: Mark optional fields with `[fieldName]` in JSDoc and `?` in TypeScript
- **Field Alignment**: Align DTO field names with validator schemas and database models

**Example DTO Structure:**

```typescript
/**
 * Data Transfer Object for creating new products
 *
 * @interface CreateProductDTO
 * @property {string} name - Product name (required, min 3 chars)
 * @property {string} description - Product description (required, min 10 chars)
 * @property {number} price - Product price (required, non-negative)
 * @property {number} stock - Initial stock quantity (required, non-negative integer)
 * @property {string} category - Product category (required, min 1 char)
 * @property {string[]} [images] - Product image URLs (optional, validated as URLs)
 * @property {boolean} [isActive] - Product active status (optional, default: true)
 * @property {boolean} [isWishlistStatus] - Product wishlist status (optional, default: false)
 */
export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  isActive?: boolean;
  isWishlistStatus?: boolean;
}
```

#### Validators (`src/interface/validators`)

- **Zod Schemas**: Define validation schemas for all inputs
- **Error Messages**: Provide clear, user-friendly error messages
- **Type Inference**: Use Zod's type inference for TypeScript types
- **Composition**: Build complex schemas from simpler ones

#### Controllers (`src/interface/controllers`)

- **Separation of Concerns**: One controller per resource
- **Error Propagation**: Pass errors to global error handler using `next(error)`
- **Request Validation**: Validate inputs before processing
- **Response Formatting**: Consistent response structures
- **DTO Integration**: Use TypeScript DTO interfaces for request/response typing
- **Error Handling**: Use try-catch blocks with proper error propagation
- **HTTP Methods**: Use appropriate HTTP methods and status codes
- **ID Validation**: Validate MongoDB ObjectIds in controllers for early error detection
- **Not Found Handling**: Implement proper 404 responses for non-existent resources

**DTO Usage in Controllers: Best Practice**

**✅ DTOs are ALWAYS RECOMMENDED for controllers**

Using DTOs in controllers is considered a best practice regardless of operation complexity. DTOs provide consistent type safety, better documentation, and improved maintainability throughout your application.

**Key Benefits of Always Using DTOs:**

1. **Type Safety**: Compile-time validation and IDE autocomplete support
2. **Consistency**: Uniform approach across all endpoints
3. **Documentation**: Self-documenting API contracts
4. **Maintainability**: Easier to update and refactor
5. **Validation**: Clear validation contracts for all inputs
6. **IDE Support**: Better developer experience with type hints

**Example: DTO Usage for All Operations**

```typescript
// ✅ Best Practice: Create operations with DTO
async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productData: CreateProductDTO = req.body;
    const product = await this.createProductUseCase.execute(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

// ✅ Best Practice: Update operations with DTO
async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId = req.params.id;
    const productData: UpdateProductDTO = req.body;
    const product = await this.updateProductUseCase.execute(productId, productData);
    res.json(product);
  } catch (error) {
    next(error);
  }
}

// ✅ Best Practice: Read operations with DTO (even for simple parameters)
async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId: string = req.params.id; // Type-safe parameter
    const product = await this.getProductUseCase.execute(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
}

// ✅ Best Practice: List operations with Query DTO
interface ListProductsQuery {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
}

async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const queryParams: ListProductsQuery = {
      page: req.query.page as string,
      limit: req.query.limit as string,
      category: req.query.category as string,
      search: req.query.search as string,
    };
    const result = await this.listProductsUseCase.execute(queryParams);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
```

**Why Always Use DTOs:**

```typescript
// ❌ Not Recommended: Direct parameter access without typing
async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId = req.params.id; // No type safety
    // ... rest of the code
  } catch (error) {
    next(error);
  }
}

// ✅ Best Practice: Always use typing, even for simple parameters
async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId: string = req.params.id; // Type-safe
    // ... rest of the code
  } catch (error) {
    next(error);
  }
}
```

**Exception Cases (Rare):**

While DTOs are always recommended, there might be rare exceptions:

- Simple health check endpoints
- Internal monitoring endpoints
- Legacy code migration scenarios

Even in these cases, consider using minimal typing for better maintainability.

**Example Controller Structure:**

```typescript
import { NextFunction, Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { CreateProductUseCase } from '../../usecases/CreateProductUseCase';
import { UpdateProductUseCase } from '../../usecases/UpdateProductUseCase';
import { CreateProductDTO } from '../dtos/CreateProductDTO';
import { UpdateProductDTO } from '../dtos/UpdateProductDTO';

@injectable()
export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private updateProductUseCase: UpdateProductUseCase
  ) {}

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productData: CreateProductDTO = req.body;
      const product = await this.createProductUseCase.execute(productData);
      res.status(201).json(product);
    } catch (error) {
      next(error); // Proper error propagation to global error handler
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const productId = req.params.id;
      const productData: UpdateProductDTO = req.body;
      const product = await this.updateProductUseCase.execute(productId, productData);
      if (product) {
        res.json(product);
      } else {
        res.status(404).json({ message: 'Product not found' });
      }
    } catch (error) {
      next(error); // Proper error propagation to global error handler
    }
  }
}
```

**Best Practices for `next()` Function:**

1. **Error Propagation**: Always use `next(error)` to pass errors to the global error handler
2. **Async/Await**: Use try-catch blocks in async methods to catch and propagate errors
3. **Error Types**: Pass appropriate error types (DomainError, ValidationError, etc.)
4. **HTTP Status**: Let the error handler determine the appropriate HTTP status code
5. **Error Context**: Include relevant context in errors for better debugging

**Example Error Handling:**

```typescript
// ✅ Correct: Proper error propagation
try {
  const result = await this.useCase.execute(input);
  res.json(result);
} catch (error) {
  next(error); // Pass to global error handler
}

// ❌ Incorrect: Manual error handling
try {
  const result = await this.useCase.execute(input);
  res.json(result);
} catch (error) {
  res.status(500).json({ error: error.message }); // ❌ Bypasses global error handler
}

// ✅ Correct: Using next() with custom errors
try {
  if (!req.params.id) {
    throw new ValidationError('Product ID is required');
  }
  const result = await this.useCase.execute(req.params.id, req.body);
  res.json(result);
} catch (error) {
  next(error); // Global error handler will set appropriate status code
}

// ❌ Incorrect: Manual status code handling
try {
  if (!req.params.id) {
    return res.status(400).json({ error: 'Product ID is required' }); // ❌ Manual error handling
  }
  const result = await this.useCase.execute(req.params.id, req.body);
  res.json(result);
} catch (error) {
  res.status(500).json({ error: 'Internal Server Error' }); // ❌ Manual status code
}
```

**When to Use `res.status(500)`:**

While `next()` is preferred for error handling, there are rare cases where `res.status(500)` might be appropriate:

1. **Fallback Error Handler**: As a last resort in middleware when no other error handling is available
2. **Health Check Endpoints**: For simple health check endpoints where minimal error handling is needed
3. **Legacy Code**: When working with legacy code that hasn't been migrated to use global error handlers

**Example of Appropriate `res.status(500)` Usage:**

```typescript
// ✅ Acceptable: Simple health check endpoint
app.get('/health', (req, res) => {
  try {
    // Simple health check logic
    res.json({ status: 'healthy', timestamp: new Date() });
  } catch (error) {
    // Minimal error handling for health check
    res.status(500).json({ status: 'unhealthy', error: 'Health check failed' });
  }
});

// ❌ Not Recommended: Complex endpoint with manual error handling
app.post('/products', async (req, res) => {
  try {
    // Complex business logic
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    // ❌ Should use next() instead for complex endpoints
    res.status(500).json({ error: 'Failed to create product' });
  }
});
```

**Best Practice Summary:**

- ✅ **Use `next(error)`** for all business logic and complex endpoints
- ✅ **Let global error handler** determine HTTP status codes and error responses
- ✅ **Use custom error types** (ValidationError, DomainError, etc.) for better error classification
- ✅ **Use HTTP status constants** from `HTTP_STATUS` for consistent status codes
- ❌ **Avoid `res.status(500)`** in business logic - reserve for simple cases only
- ❌ **Don't bypass** the global error handling mechanism
- ❌ **Avoid hardcoded status codes** like `201`, `404`, etc.

**Using HTTP Status Constants:**

Always use the `HTTP_STATUS` constants from `src/shared/constants.ts` instead of hardcoded status codes for better maintainability and consistency.

**Available Constants:**

```typescript
// src/shared/constants.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
```

**Example: Using HTTP Status Constants**

```typescript
// ✅ Best Practice: Use HTTP status constants
import { HTTP_STATUS } from '../../shared/constants';

async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productData: CreateProductDTO = req.body;
    const product = await this.createProductUseCase.execute(productData);
    res.status(HTTP_STATUS.CREATED).json(product); // ✅ Use constant
  } catch (error) {
    next(error);
  }
}

async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId: string = req.params.id;
    const product = await this.getProductUseCase.execute(productId);
    if (product) {
      res.json(product);
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found' }); // ✅ Use constant
    }
  } catch (error) {
    next(error);
  }
}

async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId = req.params.id;
    const success = await this.deleteProductUseCase.execute(productId);
    if (success) {
      res.status(HTTP_STATUS.NO_CONTENT).send(); // ✅ Use constant
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found' }); // ✅ Use constant
    }
  } catch (error) {
    next(error);
  }
}
```

**Why Use HTTP Status Constants:**

1. **Maintainability**: Easy to update status codes in one place
2. **Consistency**: Ensures same status codes are used throughout the application
3. **Readability**: More descriptive than magic numbers
4. **Type Safety**: IDE autocomplete and type checking
5. **Documentation**: Self-documenting code

**Example: Before and After**

```typescript
// ❌ Not Recommended: Hardcoded status codes
async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await this.createProductUseCase.execute(req.body);
    res.status(201).json(product); // ❌ Magic number
  } catch (error) {
    next(error);
  }
}

// ✅ Best Practice: Use HTTP status constants
async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productData: CreateProductDTO = req.body;
    const product = await this.createProductUseCase.execute(productData);
    res.status(HTTP_STATUS.CREATED).json(product); // ✅ Descriptive constant
  } catch (error) {
    next(error);
  }
}
```

**Using Response Message Constants:**

Always use response message constants from `src/shared/constants.ts` for consistent error and success messages across the application.

**Available Constants:**

```typescript
// src/shared/constants.ts
export const RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
};

export const PRODUCT_SUCCESS_MESSAGES = {
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_RETRIEVED: 'Product retrieved successfully',
  PRODUCTS_RETRIEVED: 'Products retrieved successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  OPERATION_SUCCESSFUL: 'Operation completed successfully',
};

export const PRODUCT_ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  VALIDATION_ERROR: 'Validation error',
  DATABASE_ERROR: 'Database operation failed',
};
```

**Example: Using Response Message Constants**

```typescript
// ✅ Best Practice: Use response message constants
import {
  HTTP_STATUS,
  PRODUCT_ERROR_MESSAGES,
  PRODUCT_SUCCESS_MESSAGES,
  RESPONSE_STATUS,
} from '../../shared/constants';

async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productData: CreateProductDTO = req.body;
    const product = await this.createProductUseCase.execute(productData);

    res.status(HTTP_STATUS.CREATED).json({
      status: RESPONSE_STATUS.SUCCESS, // ✅ Use constant
      data: product,
      message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_CREATED, // ✅ Use constant
    });
  } catch (error) {
    next(error);
  }
}

async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId: string = req.params.id;
    const product = await this.getProductUseCase.execute(productId);

    if (product) {
      res.status(HTTP_STATUS.OK).json({
        status: RESPONSE_STATUS.SUCCESS, // ✅ Use constant
        data: product,
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_RETRIEVED, // ✅ Use constant
      });
    } else {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: RESPONSE_STATUS.ERROR, // ✅ Use constant
        message: PRODUCT_ERROR_MESSAGES.NOT_FOUND, // ✅ Use constant
        errors: [{ field: 'id', message: 'Product with specified ID does not exist' }],
      });
    }
  } catch (error) {
    next(error);
  }
}
```

**Why Use Response Message Constants:**

1. **Consistency**: Ensures same messages are used throughout the application
2. **Maintainability**: Easy to update messages in one place
3. **Internationalization**: Foundation for future i18n support
4. **Type Safety**: IDE autocomplete and type checking
5. **Documentation**: Self-documenting code

**Example: Before and After**

```typescript
// ❌ Not Recommended: Hardcoded response messages
async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await this.createProductUseCase.execute(req.body);
    res.status(201).json({
      status: 'success', // ❌ Magic string
      data: product,
      message: 'Product created successfully', // ❌ Hardcoded message
    });
  } catch (error) {
    next(error);
  }
}

// ✅ Best Practice: Use response message constants
async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productData: CreateProductDTO = req.body;
    const product = await this.createProductUseCase.execute(productData);

    res.status(HTTP_STATUS.CREATED).json({
      status: RESPONSE_STATUS.SUCCESS, // ✅ Descriptive constant
      data: product,
      message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_CREATED, // ✅ Descriptive constant
    });
  } catch (error) {
    next(error);
  }
}
```

**Standardized Response Formats:**

For consistency across the API, use standardized response formats for success and error responses.

**Success Response Format:**

```typescript
// ✅ Best Practice: Standardized success response
res.status(HTTP_STATUS.OK).json({
  status: 'success',
  data: product,
  message: 'Product retrieved successfully',
});

// ✅ Best Practice: Success response with data only (for simple cases)
res.status(HTTP_STATUS.CREATED).json(product);

// ✅ Best Practice: Success response for operations without return data
res.status(HTTP_STATUS.NO_CONTENT).send();
```

**Error Response Format:**

```typescript
// ✅ Best Practice: Standardized error response
res.status(HTTP_STATUS.NOT_FOUND).json({
  status: 'error',
  message: 'Product not found',
  errors: [{ field: 'id', message: 'Product with specified ID does not exist' }],
});

// ✅ Best Practice: Simple error response
res.status(HTTP_STATUS.NOT_FOUND).json({ message: 'Product not found' });
```

**Response Format Guidelines:**

1. **Success Responses**:
   - Use `status: 'success'` for explicit success responses
   - Include `data` field for the main response content
   - Optional `message` field for descriptive success messages
   - Use appropriate HTTP status codes (200, 201, 204, etc.)

2. **Error Responses**:
   - Use `status: 'error'` for explicit error responses
   - Include `message` field with clear error description
   - Optional `errors` array for detailed validation errors
   - Let global error handler handle exception cases via `next()`

3. **Consistency**:
   - Maintain consistent response structure across all endpoints
   - Use the same field names (`status`, `data`, `message`, `errors`)
   - Follow RESTful conventions for response formats

**Example: Complete Controller with Standardized Responses**

```typescript
import { HTTP_STATUS } from '../../shared/constants';
import { successResponse, errorResponse } from '../../shared/utils';

async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productData: CreateProductDTO = req.body;
    const product = await this.createProductUseCase.execute(productData);

    // ✅ Standardized success response
    res.status(HTTP_STATUS.CREATED).json(successResponse(
      'Product created successfully',
      product,
      HTTP_STATUS.CREATED
    ));
  } catch (error) {
    next(error); // Let global error handler format the error response
  }
}

async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const productId: string = req.params.id;
    const product = await this.getProductUseCase.execute(productId);

    if (product) {
      // ✅ Standardized success response
      res.status(HTTP_STATUS.OK).json(successResponse(
        'Product retrieved successfully',
        product
      ));
    } else {
      // ✅ Standardized error response
      res.status(HTTP_STATUS.NOT_FOUND).json(errorResponse(
        'Product not found',
        HTTP_STATUS.NOT_FOUND,
        [{ field: 'id', message: 'Product with specified ID does not exist' }]
      ));
    }
  } catch (error) {
    next(error);
  }
}
```

#### Parameter Validation Best Practices

When handling URL parameters like `req.params.id`, consider the following best practices for robust input validation:

**Recommendation for ID Parameters:**

Given that productId comes from `req.params.id`, and assuming that your system generates and stores IDs in a normalized (no leading/trailing spaces) format:

- The `trim()` is likely redundant for productId from `req.params`.
- The check `!productId` is usually sufficient for `req.params` IDs to catch null or undefined which can happen if the route definition doesn't match the URL, or if middleware clears parameters.
- Empty strings ("") for `req.params.id` are less common but still possible.

However, the current `if (!productId?.trim())` validation is still robust. It handles potential edge cases of malformed inputs (like an ID consisting only of spaces, which is technically an empty ID).

**Conclusion and Recommendation:**

Keep the `trim()` check as it is for robust input validation, unless you have a strict, documented guarantee that IDs from `req.params` will never contain leading/trailing whitespace and `trim()` would interfere with a valid ID containing internal spaces (which is rare for a typical id).

It adds a small layer of defensive programming that might save you from obscure bugs if ID generation or URL routing ever had unexpected behavior. The performance impact is truly negligible here.

#### Middlewares (`src/interface/middlewares`)

- **Separation of Concerns**: One middleware per responsibility
- **Error Propagation**: Pass errors to global error handler
- **Performance**: Minimal overhead in request processing
- **Configuration**: Environment-based middleware configuration

### Shared Module Best Practices (`src/shared`)

Shared utilities and common code.

- **Pure Functions**: Utility functions should be pure and testable
- **Type Safety**: Strongly typed utility functions
- **Error Classes**: Custom error classes extending base errors
- **Constants**: Centralized application constants, kept clean by removing unused ones to maintain maintainability
- **Logger**: Centralized Pino logger instance as a shared utility/service, properly placed in `src/shared/logger.ts` rather than middleware. Middleware consumes the shared logger for request logging, maintaining separation of concerns and cross-cutting concern principles.
- **Best practice:** The logger should not be in middleware. The current structure is correct:
  - `src/shared/logger.ts` provides a centralized Pino logger instance as a shared utility/service, which is the appropriate place for it.
  - `src/interface/middlewares/requestLogger.ts` is a middleware that uses the shared logger to log HTTP requests.

  This follows clean architecture principles where logging is a cross-cutting concern handled by a shared service, and middleware consumes it for request logging. Moving the logger into middleware would violate separation of concerns.

### Configuration Module Best Practices (`src/config`)

Application configuration and dependency injection setup.

- **Environment Variables**: Use validated environment configurations
- **Dependency Injection**: Centralized DI container setup
- **Module Registration**: Register all modules in DI container
- **Configuration Validation**: Validate configuration at startup

### Test Module Best Practices (`src/test`)

Testing structure and practices.

- **Test Organization**: Mirror source structure in test directory
- **Setup/Teardown**: Proper test isolation and cleanup
- **Mocking**: Mock external dependencies appropriately
- **Coverage**: Aim for high test coverage on critical paths
- **Integration Tests**: Use in-memory databases for integration testing

</details>

<details>
<summary>💻 Coding Standards</summary>

### TypeScript Configuration

- **Strict Mode**: All strict TypeScript checks enabled
- **Target**: ES2020 for modern JavaScript features
- **Path Aliases**: Use `@/*` for clean imports (e.g., `@/domain/entities/Product`)
- **Decorators**: Enabled for dependency injection metadata
- **Source Maps**: Enabled for debugging
- **Reflect Metadata**: Required for tsyringe decorator-based dependency injection

### Code Quality Tools

- **ESLint v9**: Flat configuration with TypeScript support
- **Prettier**: Automated code formatting
- **Pre-commit Hooks**: Format and lint before commits

### Naming Conventions

- **Files**: PascalCase for classes, camelCase for utilities
- **Interfaces**: Prefix with `I` (e.g., `IProductRepository`)
- **DTOs**: Suffix with `DTO` (e.g., `CreateProductDTO`)
- **Use Cases**: Verb + Noun pattern (e.g., `CreateProductUseCase`)
- **Constants**: UPPER_SNAKE_CASE in constants files

### Code Style Rules

- **Explicit Types**: Avoid `any`, use proper TypeScript types
- **Const Assertions**: Use `const` for immutable data
- **Optional Chaining**: Leverage `?.` for safe property access
- **Nullish Coalescing**: Use `??` for default values
- **Unused Variables**: Prefix with `_` to indicate intentional

</details>

<details>
<summary>🧪 Testing Best Practices</summary>

### Testing Strategy

- **Unit Tests**: Isolated business logic testing
- **Integration Tests**: End-to-end API testing with in-memory MongoDB
- **100% Coverage**: Critical paths fully verified
- **Test Structure**: Mirror source structure in root-level `tests/`

### Testing Tools

- **Jest**: Modern testing framework with TypeScript support
- **ts-jest**: TypeScript preprocessor
- **mongodb-memory-server**: In-memory MongoDB for integration tests
- **supertest**: HTTP endpoint testing

### Test Organization

```
tests/
├── setup.ts                    # Global test setup
├── unit/                       # Unit tests
│   ├── entities/               # Entity validation tests
│   ├── services/               # Domain service tests
│   └── utils/                  # Utility function tests
└── integration/                # Integration tests
    └── app.test.ts             # API endpoint tests
```

### Testing Patterns

- **Arrange-Act-Assert**: Clear test structure
- **Mock Dependencies**: Use Jest mocks for external services
- **Factory Functions**: Create test data with factories
- **Descriptive Names**: Test names describe behavior

</details>

<details>
<summary>🔒 Security & Validation</summary>

### Input Validation

- **Zod Schemas**: Runtime type validation for all inputs
- **DTO Pattern**: Strict input/output contracts
- **Fail-Fast**: Validate early in request pipeline
- **Sanitization**: Clean and validate all external data

### Error Handling

- **Custom Errors**: Domain-specific error classes
- **Global Middleware**: Centralized error handling
- **Structured Logging**: JSON logs with Pino
- **HTTP Status Codes**: Appropriate status codes for responses

### Security Practices

- **Environment Variables**: Sensitive data in `.env`
- **Input Sanitization**: Validate and sanitize all inputs
- **CORS Configuration**: Proper cross-origin settings
- **Rate Limiting**: Implement request throttling (future)

</details>

<details>
<summary>📊 Database & Data Management</summary>

### MongoDB Best Practices

- **Mongoose ODM**: Type-safe database interactions
- **Schema Validation**: Database-level constraints
- **Indexing**: Proper indexes for query performance
- **Connection Pooling**: Efficient connection management

### Repository Pattern

- **Interface Segregation**: Repository interfaces define contracts
- **Data Mapping**: Convert between domain entities and DB documents
- **Query Optimization**: Efficient database queries
- **Transaction Support**: Atomic operations where needed

### Data Modeling

- **Domain Entities**: Rich business objects with validation
- **Immutable Updates**: Create new instances for changes
- **Factory Methods**: Controlled entity creation
- **Business Rules**: Enforce invariants in entities

</details>

<details>
<summary>🚀 API Design & Documentation</summary>

### RESTful API Design

- **Resource-Based**: RESTful endpoint naming
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **Status Codes**: Meaningful HTTP status codes
- **Pagination**: Consistent pagination for list endpoints

### API Documentation

- **Swagger/OpenAPI**: Auto-generated API documentation
- **Interactive UI**: Browser-accessible API docs
- **Schema Definitions**: Complete request/response schemas
- **Examples**: Sample requests and responses

### Middleware Architecture

- **Request Logging**: Structured request logging
- **Error Handling**: Global error catching
- **CORS**: Cross-origin resource sharing
- **Validation**: Input validation middleware

</details>

<details>
<summary>🔧 Development Workflow</summary>

### Environment Setup

- **Environment Variables**: `.env` for configuration
- **Development Tools**: Hot reloading with nodemon
- **Pre-commit Hooks**: Automated quality checks
- **Scripts**: NPM scripts for common tasks

### Development Commands

```bash
npm run dev          # Development with hot-reload
npm run build        # Production build
npm run lint         # Code linting
npm run format       # Code formatting
npm run test         # Run all tests
npm run test:coverage # Generate coverage report
```

### Git Workflow

- **Feature Branches**: Branch per feature/task
- **Pull Requests**: Code review process
- **Commit Messages**: Descriptive commit messages
- **Pre-commit**: Format and lint before commits

</details>

<details>
<summary>📈 Performance & Scalability</summary>

### Code Performance

- **Efficient Algorithms**: Optimal data structures and algorithms
- **Memory Management**: Avoid memory leaks
- **Async/Await**: Proper asynchronous programming
- **Caching**: Implement caching where beneficial

### Database Performance

- **Query Optimization**: Efficient MongoDB queries
- **Indexing**: Proper database indexes
- **Pagination**: Limit result sets
- **Connection Pooling**: Reuse database connections

### Application Scalability

- **Modular Design**: Feature-based modules
- **Dependency Injection**: Loose coupling for testing/scaling
- **Microservices Ready**: Architecture supports microservices
- **Horizontal Scaling**: Stateless design

</details>

<details>
<summary>📚 Documentation Standards</summary>

### Code Documentation

- **JSDoc Comments**: Comprehensive function/class documentation
- **TypeScript Types**: Self-documenting with types
- **README Files**: Project and module documentation
- **Implementation Plans**: Detailed technical specifications

### Documentation Structure

```
docs/
├── analysis/                    # Project analysis
├── implementation-plans/        # Technical specs
├── best-practices/              # This guide
├── tests/                       # Testing documentation
├── migrations/                  # Migration guides
└── tasks/                       # Project tasks
```

</details>

<details>
<summary>🔄 Continuous Integration & Deployment</summary>

### CI/CD Pipeline (Future)

- **Automated Testing**: Run tests on every push
- **Code Quality**: Lint and format checks
- **Security Scanning**: Vulnerability checks
- **Deployment**: Automated deployment to staging/production

### Deployment Best Practices

- **Environment Separation**: Dev, staging, production
- **Configuration Management**: Environment-specific configs
- **Health Checks**: Application health monitoring
- **Rollback Strategy**: Quick rollback capabilities

</details>

<details>
<summary>🛠️ Tooling & Dependencies</summary>

### Core Dependencies

- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB/Mongoose**: Database and ODM
- **Zod**: Schema validation
- **tsyringe**: Dependency injection
- **Pino**: Structured logging

### Development Dependencies

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Nodemon**: Development hot-reload
- **Swagger**: API documentation

</details>

<details>
<summary>✅ Do's and Don'ts</summary>

### 🏗️ Architecture Do's and Don'ts

#### ✅ Do's

- **Do** follow Clean Architecture layers strictly
- **Do** keep domain entities pure (no external dependencies)
- **Do** use dependency injection for all external services
- **Do** create interfaces for all repository contracts
- **Do** validate business rules in domain entities
- **Do** use factory methods for entity creation
- **Do** keep use cases focused on single responsibilities
- **Do** separate concerns across layers

**Example: Proper Clean Architecture**

```typescript
// ✅ Domain Layer - Pure business logic
export class Product {
  static create(props: CreateProductProps): Result<Product, DomainError> {
    if (props.price <= 0) {
      return err(new ValidationError('Price must be positive'));
    }
    return ok(new Product(props.id, props.name, props.price));
  }
}

// ✅ Use Case Layer - Orchestrates domain logic
export class CreateProductUseCase {
  constructor(
    private productRepository: IProductRepository, // Interface, not concrete
    private productService: ProductService
  ) {}

  async execute(input: CreateProductDTO): Promise<Result<Product, DomainError>> {
    const product = Product.create(input);
    if (product.isErr()) return product;

    return this.productRepository.save(product.value);
  }
}
```

#### ❌ Don'ts

- **Don't** import infrastructure code in domain layer
- **Don't** put business logic in controllers or repositories
- **Don't** create direct database dependencies in use cases
- **Don't** skip input validation in DTOs
- **Don't** mix different architectural layers in one file
- **Don't** bypass dependency injection for testing convenience
- **Don't** create circular dependencies between modules

**Example: Architecture violations to avoid**

```typescript
// ❌ Don't: Import infrastructure in domain
export class Product {
  static create(props: CreateProductProps) {
    // ❌ Direct database call in domain entity
    const existing = mongoose.model('Product').findOne({ name: props.name });
    if (existing) throw new Error('Product exists');
    // ...
  }
}

// ❌ Don't: Mix layers in controllers
export class ProductController {
  async create(req: Request, res: Response) {
    // ❌ Business logic in controller
    if (req.body.price <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    // ❌ Direct repository instantiation
    const repo = new MongoProductRepository();
    const product = await repo.save(req.body);

    res.json(product);
  }
}
```

### 💻 Coding Standards Do's and Don'ts

#### ✅ Do's

- **Do** use strict TypeScript types everywhere
- **Do** leverage path aliases (`@/*`) for imports
- **Do** write descriptive variable and function names
- **Do** use const assertions for immutable data
- **Do** add JSDoc comments for public APIs
- **Do** follow established naming conventions
- **Do** use early returns for better readability
- **Do** destructure objects for cleaner code
- **Do** validate MongoDB ObjectIds in repositories and controllers for better performance
- **Do** implement proper 404 error handling for non-existent resources
- **Do** use trim() checks for parameter validation in controllers for robust input handling
- **Do** clean unused constants regularly to maintain code quality

**Example: Good TypeScript practices**

```typescript
// ✅ Do: Use strict types and path aliases
import { IProductRepository } from '@/domain/interfaces/IProductRepository';
import { Product } from '@/domain/entities/Product';

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(input: CreateProductDTO): Promise<Product> {
    // Early return for better readability
    if (!input.name?.trim()) {
      throw new ValidationError('Product name is required');
    }

    // Destructure for cleaner code
    const { name, price } = input;

    // Use const assertion for immutable data
    const productData = { name, price } as const;

    return this.productRepository.create(productData);
  }
}
```

#### ❌ Don'ts

- **Don't** use `any` type (except in rare, justified cases)
- **Don't** disable TypeScript strict checks
- **Don't** use `var` declarations
- **Don't** ignore ESLint warnings without justification
- **Don't** write functions longer than 50 lines
- **Don't** use magic numbers or strings
- **Don't** mix synchronous and asynchronous code styles
- **Don't** keep unused constants in shared files
- **Don't** skip MongoDB ObjectId validation in database operations
- **Don't** return generic errors for non-existent resources
- **Don't** neglect parameter validation in controllers

**Example: Bad practices to avoid**

```typescript
// ❌ Don't: Use any type or magic numbers
export class BadExample {
  constructor(private repo: any) {} // ❌ any type

  async createProduct(input: any): Promise<any> {
    // ❌ any types
    if (input.price < 0) {
      // ❌ magic number
      throw new Error('Invalid price');
    }

    var result = await this.repo.save(input); // ❌ var declaration
    return result; // ❌ no return type
  }
}

// ❌ Don't: Mix sync/async or write long functions
export async function longFunction() {
  // ... 60+ lines of mixed sync/async code ❌
  const data = fs.readFileSync('file.txt'); // ❌ sync in async function
  await someAsyncOperation();
  // ... more code
}
```

### 🧪 Testing Do's and Don'ts

#### ✅ Do's

- **Do** write tests before implementation (TDD when possible)
- **Do** maintain 100% test coverage for critical paths
- **Do** use descriptive test names that explain behavior
- **Do** mock external dependencies in unit tests
- **Do** test both success and error scenarios
- **Do** use factories for test data creation
- **Do** test integration points thoroughly
- **Do** run tests before committing code

**Example: Good testing practices**

```typescript
// ✅ Do: Use descriptive names and test both scenarios
describe('CreateProductUseCase', () => {
  it('should create product when valid data provided', async () => {
    // Arrange
    const mockRepo = mock<IProductRepository>();
    const useCase = new CreateProductUseCase(mockRepo);
    const input = createProductDTOFactory.build();

    // Act
    await useCase.execute(input);

    // Assert
    expect(mockRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: input.name,
        price: input.price,
      })
    );
  });

  it('should throw error when product name is empty', async () => {
    // Test error scenarios too
    const useCase = new CreateProductUseCase(mock<IProductRepository>());
    const input = createProductDTOFactory.build({ name: '' });

    await expect(useCase.execute(input)).rejects.toThrow(ValidationError);
  });
});
```

#### ❌ Don'ts

- **Don't** test implementation details
- **Don't** write tests that depend on external services
- **Don't** skip testing error conditions
- **Don't** use hardcoded test data in multiple places
- **Don't** ignore failing tests
- **Don't** test private methods directly
- **Don't** rely on test order dependencies

**Example: Testing anti-patterns to avoid**

```typescript
// ❌ Don't: Test implementation details
it('should call repository save method', () => {
  // Testing how it's implemented, not what it does
});

// ❌ Don't: Hardcode test data everywhere
it('creates product', () => {
  const input = { name: 'Test Product', price: 99.99 }; // ❌ Hardcoded
  // ... test
});

// ❌ Don't: Skip error testing
it('creates product successfully', () => {
  // Only tests happy path, ignores errors ❌
});

// ❌ Don't: Test private methods
describe('private validatePrice', () => {
  it('should validate price', () => {
    // Testing private method directly ❌
  });
});
```

### 🔒 Security Do's and Don'ts

#### ✅ Do's

- **Do** validate all input data with Zod schemas
- **Do** sanitize user inputs before processing
- **Do** use environment variables for sensitive data
- **Do** implement proper error handling without information leakage
- **Do** use HTTPS in production
- **Do** implement rate limiting for APIs
- **Do** keep dependencies updated and audit for vulnerabilities
- **Do** log security events appropriately

**Example: Secure input validation**

```typescript
// ✅ Do: Use Zod schemas for validation
export const CreateProductDTO = z.object({
  name: z.string().min(1).max(100).trim(),
  price: z.number().positive(),
  description: z.string().max(500).optional(),
});

// ✅ Do: Sanitize and validate inputs
export class ProductController {
  async create(@Body() input: CreateProductDTO) {
    // Input already validated by Zod middleware
    const product = await this.createProductUseCase.execute(input);
    return { product };
  }
}

// ✅ Do: Use environment variables for secrets
const config = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  // Never hardcode these!
};
```

#### ❌ Don'ts

- **Don't** trust client-side validation alone
- **Don't** expose sensitive information in error messages
- **Don't** hardcode secrets or credentials
- **Don't** use deprecated or vulnerable packages
- **Don't** implement custom authentication without expertise
- **Don't** skip input sanitization
- **Don't** log sensitive user data

**Example: Security vulnerabilities to avoid**

```typescript
// ❌ Don't: Trust client-side validation alone
export class InsecureController {
  async create(req: Request) {
    // ❌ No server-side validation
    const { name, price } = req.body;
    // Assumes client validated this...
  }
}

// ❌ Don't: Expose sensitive info in errors
try {
  await database.connect(process.env.DB_PASSWORD);
} catch (error) {
  // ❌ Leaks sensitive information
  throw new Error(`DB connection failed: ${error.message}`);
}

// ❌ Don't: Hardcode secrets
export const config = {
  jwtSecret: 'my-secret-key-123', // ❌ Hardcoded secret
  dbPassword: 'admin123', // ❌ Hardcoded password
};

// ❌ Don't: Log sensitive data
logger.info('User login', {
  email: user.email,
  password: user.password, // ❌ Never log passwords!
  ip: req.ip,
});
```

### 📊 Database Do's and Don'ts

#### ✅ Do's

- **Do** use indexes for frequently queried fields
- **Do** implement proper error handling for database operations
- **Do** use transactions for multi-document operations
- **Do** validate data at both application and database levels
- **Do** optimize queries for performance
- **Do** use connection pooling
- **Do** implement proper data migration strategies
- **Do** monitor database performance

#### ❌ Don'ts

- **Don't** execute queries in loops
- **Don't** store sensitive data without encryption
- **Don't** skip database error handling
- **Don't** use deprecated database features
- **Don't** perform heavy operations in application threads
- **Don't** forget to close database connections
- **Don't** ignore database performance metrics

### 🗃️ Redis & Caching Do's and Don'ts

#### ✅ Do's

- **Do** implement graceful degradation when Redis is unavailable
- **Do** use connection pooling for Redis connections
- **Do** set appropriate TTL values based on data volatility
- **Do** use consistent hierarchical key naming conventions
- **Do** implement proper cache invalidation strategies
- **Do** handle Redis connection failures gracefully
- **Do** use Redis pipelines for batch operations
- **Do** monitor Redis memory usage and implement eviction policies
- **Do** implement health checks for Redis connectivity
- **Do** serialize complex objects properly (avoid circular references)
- **Do** use cache-aside pattern for read-heavy operations
- **Do** implement cache warming for frequently accessed data

**Example: Proper Redis implementation with graceful degradation**

```typescript
// ✅ Do: Graceful degradation and proper error handling
@injectable()
export class RedisService implements IRedisService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor(@inject(DI_TOKENS.REDIS_CONFIG) private config: RedisConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connected successfully');
    });

    this.redis.on('error', (error) => {
      this.isConnected = false;
      logger.error('Redis connection error:', error);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache get');
        return null;
      }
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        logger.warn('Redis not connected, skipping cache set');
        return false;
      }
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isConnected) return false;
      await this.redis.ping();
      return true;
    } catch {
      return false;
    }
  }
}

// ✅ Do: Use consistent key naming conventions
const KEYS = {
  PRODUCTS: {
    LIST: (filters: string) => `products:list:${filters}`,
    DETAIL: (id: string) => `products:detail:${id}`,
    SEARCH: (query: string) => `products:search:${hashQuery(query)}`,
  },
  SESSIONS: {
    USER: (userId: string) => `sessions:user:${userId}`,
    TOKEN: (token: string) => `sessions:token:${token}`,
  },
  RATE_LIMITS: {
    API: (userId: string) => `rate_limit:api:${userId}`,
    AUTH: (ip: string) => `rate_limit:auth:${ip}`,
  },
} as const;

// ✅ Do: Implement proper cache invalidation
class ProductCacheInvalidator {
  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    await Promise.all([
      this.redisService.del(`products:detail:${productId}`),
      this.invalidateProductListCaches(),
      this.invalidateSearchCaches(),
    ]);
  }

  private async invalidateProductListCaches(): Promise<void> {
    const keys = await this.redisService.keys('products:list:*');
    if (keys.length > 0) {
      await this.redisService.del(...keys);
    }
  }
}
```

#### ❌ Don'ts

- **Don't** assume Redis is always available
- **Don't** store sensitive data in Redis without encryption
- **Don't** use Redis as primary data store (use for caching only)
- **Don't** ignore Redis connection failures
- **Don't** set TTL to 0 or negative values
- **Don't** use generic key names without namespaces
- **Don't** store large objects without compression
- **Don't** create Redis connections for every operation
- **Don't** mix different data types in the same key
- **Don't** forget to handle Redis-specific errors
- **Don't** use Redis for complex queries (use databases instead)
- **Don't** cache data that changes frequently without proper invalidation

**Example: Redis anti-patterns to avoid**

```typescript
// ❌ Don't: Assume Redis is always available
class BadRedisService {
  async get(key: string): Promise<any> {
    // ❌ No connection checking
    return await this.redis.get(key); // Might throw if Redis down
  }
}

// ❌ Don't: Use generic key names
class BadCacheService {
  async cacheUser(user: User): Promise<void> {
    // ❌ Generic key without namespace
    await this.redis.set('user', user);
  }

  async cacheProduct(product: Product): Promise<void> {
    // ❌ Same key name, will overwrite user cache!
    await this.redis.set('user', product);
  }
}

// ❌ Don't: Store sensitive data without encryption
class InsecureCacheService {
  async storePassword(userId: string, password: string): Promise<void> {
    // ❌ Storing plain text password
    await this.redis.set(`password:${userId}`, password);
  }
}

// ❌ Don't: Create connections for every operation
class BadRedisUsage {
  async getData(key: string): Promise<any> {
    // ❌ Creating new connection every time
    const redis = new Redis(process.env.REDIS_URL);
    const value = await redis.get(key);
    await redis.quit();
    return value;
  }
}
```

### 🚀 API Design Do's and Don'ts

#### ✅ Do's

- **Do** use RESTful resource naming conventions
- **Do** return appropriate HTTP status codes
- **Do** implement proper pagination for list endpoints
- **Do** version your APIs appropriately
- **Do** provide comprehensive API documentation
- **Do** implement consistent error response formats
- **Do** use content negotiation (Accept/Content-Type headers)
- **Do** implement proper CORS policies

#### ❌ Don'ts

- **Don't** use verbs in REST resource names
- **Don't** return generic 500 errors without details
- **Don't** expose internal implementation details
- **Don't** break existing API contracts
- **Don't** skip API documentation updates
- **Don't** use inconsistent response formats
- **Don't** implement authentication in application logic

</details>

<details>
<summary>📋 Checklist for New Features</summary>

When implementing new features, ensure:

- ✅ Clean Architecture layers respected
- ✅ TypeScript strict mode compliance
- ✅ Input validation with Zod schemas
- ✅ Unit and integration tests written
- ✅ Documentation updated
- ✅ Code formatting and linting passed
- ✅ Dependency injection configured
- ✅ Error handling implemented
- ✅ API documentation updated

</details>

<details>
<summary>🎯 Quality Metrics</summary>

### Code Quality Goals

- **Test Coverage**: Maintain 100% coverage
- **Zero Lint Errors**: Clean ESLint reports
- **Type Safety**: No `any` types or type errors
- **Performance**: Efficient algorithms and queries

### Maintainability

- **Modular Design**: Single responsibility principle
- **Documentation**: Comprehensive code documentation
- **Consistent Style**: Uniform code formatting
- **Refactoring**: Regular code improvements

</details>

---

## 🔄 Naming Consistency Best Practices

### DTO vs Entity Property Naming

The project uses different naming conventions for DTOs and entities to maintain clear separation of concerns:

#### DTO Properties (Interface Layer)

- **Pattern**: `isWishlistStatus` (camelCase with descriptive names)
- **Purpose**: API contract and input validation
- **Usage**: Request/response objects, validation schemas

#### Entity Properties (Domain Layer)

- **Pattern**: `isWishlistStatus` (camelCase with domain terminology)
- **Purpose**: Business logic and domain state
- **Usage**: Core business entities and validation

#### Mapping Strategy

- **Use Cases**: Handle DTO-to-entity mapping
- **Services**: Domain services work with entity properties
- **Tests**: Use correct property names for each layer

#### Example Implementation

```typescript
// ✅ DTO (Interface Layer)
interface CreateProductDTO {
  isWishlistStatus?: boolean; // API contract
}

// ✅ Entity (Domain Layer)
interface ProductProps {
  isWishlistStatus?: boolean; // Domain state
}

// ✅ Use Case (Application Layer)
class UpdateProductUseCase {
  execute(productId: string, updates: UpdateProductDTO): Promise<Product> {
    // Map DTO to entity operations
    if (updates.isWishlistStatus !== undefined) {
      product = this.productService.updateWishlistStatus(product, updates.isWishlistStatus);
    }
  }
}
```

#### Common Pitfalls to Avoid

- ❌ Using `isWishlistStatus` in entity tests
- ❌ Using `isWishlistStatus` in DTO validation
- ❌ Mixing naming conventions within the same layer
- ❌ Bypassing proper mapping in use cases

#### Testing Guidelines

- **Unit Tests**: Use entity property names (`isWishlistStatus`)
- **Integration Tests**: Use DTO property names (`isWishlistStatus`)
- **Validation Tests**: Use DTO property names in schemas
- **Service Tests**: Use entity property names

---

_This guide should be updated as the project evolves and new best practices are established._

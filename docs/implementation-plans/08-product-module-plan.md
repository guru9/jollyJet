# Implementation Plan #08 - Product Module

**Plan:** 08-product-module-plan  
**Related Task:** 02-product-module-task  
**Branch:** `feature/jollyjet-08-product-module`  
**Status:** 🚧 In Progress

---

## Overview

This phase implements the **Product Module**, the foundational catalog engine of JollyJet. Crucial for e-commerce, it handles everything from inventory management to product discovery.

We will strictly follow **Clean Architecture**, ensuring our business rules (Domain) remain independent of frameworks (Interface/Infrastructure). This guarantees longevity, testability, and ease of maintenance.

## Implementation Steps (Step-by-Step Guide)

### ✅ Step 1: Create Product Entity

- **Objective:** Define the core Product domain model with TypeScript interfaces representing product properties (id, name, description, price, category, etc.) in the domain layer
- **Implementation:** Create `src/domain/entities/Product.ts` with immutable Product class, basic validation, and readonly properties
- **Dependencies:** None
- **Files:** `src/domain/entities/Product.ts`

### ✅ Step 2: Define IProductRepository Interface

- **Objective:** Create an abstract repository interface in the domain layer defining CRUD operations (create, findById, findAll, update, delete) for dependency inversion
- **Implementation:** Define interface with Promise-based methods for data persistence contract
- **Dependencies:** Product Entity (Step 1)
- **Files:** `src/domain/interfaces/IProductRepository.ts`

### ✅ Step 3: Implement MongoDB Product Schema

- **Objective:** Create Mongoose schema in infrastructure layer with validation rules, indexes, and mapping to the Product entity
- **Implementation:** Define schema with text indexes, timestamps, and proper validation at database level
- **Dependencies:** None
- **Files:** `src/infrastructure/models/ProductModel.ts`

### ✅ Step 4: Create MongoProductRepository

- **Objective:** Implement the repository interface using Mongoose, handling database operations and converting between MongoDB documents and domain entities
- **Implementation:** Map between domain entities and MongoDB documents with toDomain() method and error handling
- **Dependencies:** Product Entity (Step 1), IProductRepository (Step 2), ProductModel (Step 3)
- **Files:** `src/infrastructure/repositories/MongoProductRepository.ts`

### ✅ Step 5: Implement Product Use Cases

- **Objective:** Create application layer services for business logic: CreateProductUseCase, GetProductUseCase, UpdateProductUseCase, DeleteProductUseCase, ListProductsUseCase
- **Implementation:** Five use case classes with dependency injection, business rule validation, and repository calls
- **Dependencies:** IProductRepository (Step 2), DTOs (Step 6), DI_TOKENS (Step 12)
- **Files:** `src/application/usecases/product/*.ts`

### ✅ Step 6: Create Product DTOs with Zod Validation

- **Objective:** Define input/output data transfer objects using Zod schemas for API request/response validation and type safety
- **Implementation:** Create CreateProductDTO, UpdateProductDTO, ProductResponseDTO with Zod validation schemas
- **Dependencies:** None
- **Files:** `src/interface/dtos/product/*.ts`

### ✅ Step 7: Build ProductController

- **Objective:** Create Express controller class handling HTTP requests, using use cases, and returning appropriate responses with error handling
- **Implementation:** Controller with methods for create, getOne, list, update, delete operations using dependency injection
- **Dependencies:** Product Use Cases (Step 5)
- **Files:** `src/interface/controllers/ProductController.ts`

### ✅ Step 8: Set up Product Routes

- **Objective:** Configure Express routes with middleware (validation, authentication placeholder), mapping endpoints to controller methods
- **Implementation:** Define routes for CRUD operations with validation middleware and Swagger documentation
- **Dependencies:** ProductController (Step 7), ProductValidators (Step 6)
- **Files:** `src/interface/routes/productRoutes.ts`

### ✅ Step 9: Write Unit Tests

- **Objective:** Create unit tests for repository, use cases, controller, and DTOs using Jest with mocks and achieving high coverage
- **Implementation:** Comprehensive test suites with mocked dependencies for all components
- **Dependencies:** All implemented components (Steps 1-8)
- **Files:** `src/test/unit/product/*.test.ts`

### ✅ Step 10: Write Integration Tests

- **Objective:** Create end-to-end API tests for all product endpoints, testing full request/response cycles with database integration
- **Implementation:** API integration tests with real database connections and full request flows
- **Dependencies:** All implemented components (Steps 1-8)
- **Files:** `src/test/integration/product/*.test.ts`

### ✅ Step 11: Document Product API Endpoints in Swagger

- **Objective:** Add Swagger/OpenAPI annotations to routes and DTOs for automatic API documentation generation
- **Implementation:** Update Swagger configuration with Product API endpoint documentation
- **Dependencies:** Product Routes (Step 8)
- **Files:** `src/config/swagger.ts`, route annotations

### ✅ Step 12: Update Application Wiring

- **Objective:** Register all new dependencies in the DI container and integrate product routes into the main application
- **Implementation:** Add DI tokens, register repository and use cases, mount routes in app.ts
- **Dependencies:** All implemented components (Steps 1-11)
- **Files:** `src/shared/constants.ts`, `src/config/di-container.ts`, `src/app.ts`

---

### Implementation Steps Overview

The Product Module follows a systematic 5-step implementation approach based on Clean Architecture principles:

1. **Domain Layer**: Create core business entities, interfaces, and services (Product entity, repository interface, business logic)
2. **Infrastructure Layer**: Implement external adapters (MongoDB models, repository implementations)
3. **Application Layer**: Build use cases that orchestrate domain logic (CRUD operations with business rules)
4. **Interface Layer**: Develop HTTP adapters (controllers, routes, validators, Swagger documentation)
5. **Configuration Layer**: Wire everything together (DI container registration, route mounting)

### Key Objectives

1. **Strict Typing**: Full TypeScript coverage for entities and DTOs.
2. **Robust Validation**: Zod-based runtime validation for all inputs.
3. **Search & Filter**: Powerful querying capabilities for the frontend.
4. **Scalable Data**: Optimized MongoDB schema with necessary indexes.

---

## Folder Structure Changes

```
jollyJet/
├── src/
│   │
│   ├── domain/                                   # 💎 Step 1: Pure Core (Common Structure)
│   │   ├── entities/
│   │   │   └── Product.ts                        # ✅ NEW (Step 1.1) - No dependencies
│   │   ├── interfaces/
│   │   │   └── IProductRepository.ts             # ✅ NEW (Step 1.2) - Depends on Product (1.1)
│   │   └── services/
│   │       └── ProductService.ts                 # ✅ NEW (Step 1.3) - Depends on Product (1.1)
│   │
│   ├── infrastructure/                           # 💾 Step 2: External Adaptors (Common Structure)
│   │   ├── models/
│   │   │   └── ProductModel.ts                   # ✅ NEW (Step 2.1) - No dependencies
│   │   └── repositories/
│   │       └── MongoProductRepository.ts         # ✅ NEW (Step 2.2) - Depends on (1.1, 1.2, 2.1)
│   │
│   ├── interface/                                # 📡 Step 4: HTTP Adapters (Common Structure)
│   │   ├── dtos/
│   │   │   ├── CreateProductDTO.ts               # ✅ NEW (Step 3.1) - No dependencies
│   │   │   ├── UpdateProductDTO.ts               # ✅ NEW (Step 3.1) - No dependencies
│   │   │   └── ProductResponseDTO.ts             # ✅ NEW (Step 3.1) - No dependencies
│   │   ├── validators/
│   │   │   └── ProductValidators.ts              # ✅ NEW (Step 4.1) - Depends on DTOs (3.1)
│   │   ├── controllers/
│   │   │   └── ProductController.ts              # ✅ NEW (Step 4.2) - Depends on Use Cases (3.3)
│   │   └── routes/
│   │       └── productRoutes.ts                  # ✅ NEW (Step 4.3) - Depends on (4.1, 4.2)
│   │
│   ├── usecases/                                 # ⚙️ Step 3: Application Layer (Common Structure)
│   │   └── product/
│   │       ├── CreateProductUseCase.ts           # ✅ NEW (Step 3.3) - Depends on (3.1, 1.2, 5.0)
│   │       ├── GetProductUseCase.ts              # ✅ NEW (Step 3.3) - Depends on (1.2, 5.0)
│   │       ├── ListProductsUseCase.ts            # ✅ NEW (Step 3.3) - Depends on (1.2, 5.0)
│   │       ├── UpdateProductUseCase.ts           # ✅ NEW (Step 3.3) - Depends on (3.1, 1.2, 1.3, 5.0)
│   │       └── DeleteProductUseCase.ts           # ✅ NEW (Step 3.3) - Depends on (1.2, 5.0)
│   │
│   ├── shared/
│   │   └── constants.ts                          # ✅ MODIFIED (Step 5.0) - Before Use Cases & DI
│   │
│   ├── config/
│   │   └── di-container.ts                       # ✅ MODIFIED (Step 5.1) - Depends on (2.2, 1.3, 5.0) - Register Product Repository & Service
│   │
│   └── app.ts                                    # ✅ MODIFIED (Step 5.2) - Depends on Routes (4.3) - Mount product routes
```

---

## Implementation Order (Dependency Flow)

**Correct implementation sequence based on dependencies:**

| Step    | Component              | Dependencies                                                                | Layer          |
| ------- | ---------------------- | --------------------------------------------------------------------------- | -------------- |
| **1.1** | Product Entity         | None                                                                        | Domain         |
| **1.2** | IProductRepository     | Product (1.1)                                                               | Domain         |
| **1.3** | ProductService         | Product (1.1)                                                               | Domain         |
| **2.1** | ProductModel           | None                                                                        | Infrastructure |
| **2.2** | MongoProductRepository | Product (1.1), IProductRepository (1.2), ProductModel (2.1)                 | Infrastructure |
| **3.1** | DTOs                   | None                                                                        | Interface      |
| **5.0** | Constants (DI_TOKENS)  | None                                                                        | Shared         |
| **3.3** | Use Cases              | DTOs (3.1), IProductRepository (1.2), ProductService (1.3), DI_TOKENS (5.0) | Application    |
| **4.1** | Validators             | DTOs (3.1)                                                                  | Interface      |
| **4.2** | Controllers            | Use Cases (3.3)                                                             | Interface      |
| **4.3** | Routes                 | Controllers (4.2), Validators (4.1)                                         | Interface      |
| **4.4** | Swagger Documentation  | Routes (4.3)                                                                | Interface      |
| **5.1** | DI Container           | MongoProductRepository (2.2), ProductService (1.3), DI_TOKENS (5.0)         | Configuration  |
| **5.2** | App.ts                 | Routes (4.3)                                                                | Configuration  |

---

## Proposed Changes

### 💎 Step 1: Domain Layer

#### `src/domain/entities/Product.ts`

**Product Entity**: Simple data container with basic validation.

```typescript
export interface ProductProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;
  public readonly stock: number;
  public readonly category: string;
  public readonly images: string[];
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: ProductProps) {
    this.id = props.id || '';
    this.name = props.name.trim();
    this.description = props.description.trim();
    this.price = props.price;
    this.stock = props.stock;
    this.category = props.category.trim();
    this.images = props.images || [];
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();

    this.validate();
  }

  public static create(props: ProductProps): Product {
    return new Product(props);
  }

  private validate(): void {
    if (!this.name) throw new Error('Product name is required');
    if (this.price < 0) throw new Error('Price cannot be negative');
    if (this.stock < 0) throw new Error('Stock cannot be negative');
  }
}
```

#### `src/domain/services/ProductService.ts` (Step 1.3)

**Product Service**: Business logic for product operations. Depends on Product Entity (1.1).

```typescript
import { injectable } from 'tsyringe';
import { Product, ProductProps } from '../entities/Product';

@injectable()
export class ProductService {
  /**
   * Updates product stock with validation
   */
  public updateStock(product: Product, quantity: number): Product {
    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new Error('Insufficient stock');
    }

    return Product.create({
      ...this.toProps(product),
      stock: newStock,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates product price with validation
   */
  public updatePrice(product: Product, newPrice: number): Product {
    if (newPrice < 0) {
      throw new Error('Price cannot be negative');
    }

    return Product.create({
      ...this.toProps(product),
      price: newPrice,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates multiple product details
   */
  public updateDetails(
    product: Product,
    updates: Partial<
      Pick<ProductProps, 'name' | 'description' | 'category' | 'images' | 'isActive'>
    >
  ): Product {
    return Product.create({
      ...this.toProps(product),
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Converts Product entity to ProductProps
   */
  private toProps(product: Product): ProductProps {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: product.images,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
```

#### `src/domain/interfaces/IProductRepository.ts` (Step 1.2)

**Repository Interface**: Defines the contract `IProductRepository` for data persistence. Depends on Product Entity (1.1).

```typescript
import { Product } from '../entities/Product';

export interface ProductFilter {
  category?: string;
  search?: string;
  isActive?: boolean;
}

export interface IProductRepository {
  create(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(filter?: ProductFilter, skip?: number, limit?: number): Promise<Product[]>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<boolean>;
  count(filter?: ProductFilter): Promise<number>;
}
```

---

### 💾 Step 2: Infrastructure Layer

#### `src/infrastructure/models/ProductModel.ts` (Step 2.1)

**Mongoose Schema**: Optimized MongoDB schema with text indexes for search. No dependencies.

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IProductDocument extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    images: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductSchema.index({ name: 'text', description: 'text' });

export const ProductModel = mongoose.model<IProductDocument>('Product', ProductSchema);
```

#### `src/infrastructure/repositories/MongoProductRepository.ts` (Step 2.2)

**Repository Implementation**: `MongoProductRepository` implementing the domain interface. Depends on Product (1.1), IProductRepository (1.2), ProductModel (2.1).

```typescript
import { injectable } from 'tsyringe';
import { IProductRepository, ProductFilter } from '../../domain/interfaces/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ProductModel, IProductDocument } from '../models/ProductModel';

@injectable()
export class MongoProductRepository implements IProductRepository {
  public async create(product: Product): Promise<Product> {
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: product.images,
      isActive: product.isActive,
    };

    const createdDoc = await ProductModel.create(productData);
    return this.toDomain(createdDoc);
  }

  public async findById(id: string): Promise<Product | null> {
    if (!id) {
      return null;
    }

    const doc = await ProductModel.findById(id);
    if (!doc) {
      return null;
    }

    return this.toDomain(doc);
  }

  public async findAll(
    filter: ProductFilter = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<Product[]> {
    const mongoFilter: Record<string, unknown> = {};

    if (filter.category) {
      mongoFilter.category = filter.category;
    }
    if (filter.isActive !== undefined) {
      mongoFilter.isActive = filter.isActive;
    }
    if (filter.search) {
      mongoFilter.$text = { $search: filter.search };
    }

    const docs = await ProductModel.find(mongoFilter).skip(skip).limit(limit);
    return docs.map((doc) => this.toDomain(doc));
  }

  public async update(product: Product): Promise<Product> {
    if (!product.id) {
      throw new Error('Cannot update product without ID');
    }

    const updateData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: product.images,
      isActive: product.isActive,
      updatedAt: new Date(),
    };

    const updatedDoc = await ProductModel.findByIdAndUpdate(product.id, updateData, {
      new: true,
    });

    if (!updatedDoc) {
      throw new Error('Product not found for update');
    }

    return this.toDomain(updatedDoc);
  }

  public async delete(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  public async count(filter: ProductFilter = {}): Promise<number> {
    const mongoFilter: Record<string, unknown> = {};

    if (filter.category) {
      mongoFilter.category = filter.category;
    }
    if (filter.isActive !== undefined) {
      mongoFilter.isActive = filter.isActive;
    }
    if (filter.search) {
      mongoFilter.$text = { $search: filter.search };
    }

    return ProductModel.countDocuments(mongoFilter);
  }

  private toDomain(doc: IProductDocument): Product {
    return Product.create({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      price: doc.price,
      stock: doc.stock,
      category: doc.category,
      images: doc.images,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
```

---

### ⚙️ Step 3: Application Layer (Use Cases)

#### `src/interface/dtos/CreateProductDTO.ts` (Step 3.1)

**DTOs must be created first as they have no dependencies and are used by Use Cases.**

```typescript
export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  isActive?: boolean;
}
```

#### `src/interface/dtos/UpdateProductDTO.ts` (Step 3.1)

```typescript
export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  images?: string[];
  isActive?: boolean;
}
```

#### `src/interface/dtos/ProductResponseDTO.ts` (Step 3.1)

```typescript
export interface ProductResponseDTO {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

#### `src/shared/constants.ts` (Step 5.0 - Before Use Cases)

**Add DI Token**: Must be created before Use Cases as they depend on it.

```typescript
// ... existing constants

// DI Container Tokens
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository',
} as const;
```

---

#### `src/usecases/product/CreateProductUseCase.ts` (Step 3.3)

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../../domain/interfaces/IProductRepository';
import { CreateProductDTO } from '../../../interface/dtos/CreateProductDTO';
import { Product } from '../../../domain/entities/Product';
import { DI_TOKENS } from '../../../shared/constants';

@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
  ) {}

  public async execute(dto: CreateProductDTO): Promise<Product> {
    const product = Product.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      category: dto.category,
      images: dto.images,
      isActive: dto.isActive,
    });

    return this.productRepository.create(product);
  }
}
```

#### `src/usecases/product/ListProductsUseCase.ts` (Step 3.3)

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository, ProductFilter } from '../../../domain/interfaces/IProductRepository';
import { Product } from '../../../domain/entities/Product';
import { DI_TOKENS } from '../../../shared/constants';

export interface ListProductsQuery {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
  isActive?: string;
}

@injectable()
export class ListProductsUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
  ) {}

  public async execute(query: ListProductsQuery): Promise<{ products: Product[]; total: number }> {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filter: ProductFilter = {};
    if (query.category) {
      filter.category = query.category;
    }
    if (query.search) {
      filter.search = query.search;
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    const [products, total] = await Promise.all([
      this.productRepository.findAll(filter, skip, limit),
      this.productRepository.count(filter),
    ]);

    return { products, total };
  }
}
```

#### `src/usecases/product/UpdateProductUseCase.ts` (Step 3.3)

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../../domain/interfaces/IProductRepository';
import { UpdateProductDTO } from '../../../interface/dtos/UpdateProductDTO';
import { ProductService } from '../../../domain/services/ProductService';
import { DI_TOKENS } from '../../../shared/constants';

@injectable()
export class UpdateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
    @inject(ProductService) private productService: ProductService
  ) {}

  public async execute(id: string, dto: UpdateProductDTO): Promise<Product> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new Error('Product not found');
    }

    let updatedProduct = existingProduct;

    // Update price if provided
    if (dto.price !== undefined) {
      updatedProduct = this.productService.updatePrice(updatedProduct, dto.price);
    }

    // Update stock if provided
    if (dto.stock !== undefined) {
      const stockDifference = dto.stock - updatedProduct.stock;
      updatedProduct = this.productService.updateStock(updatedProduct, stockDifference);
    }

    // Update other details if provided
    if (dto.name || dto.description || dto.category || dto.images || dto.isActive !== undefined) {
      updatedProduct = this.productService.updateDetails(updatedProduct, {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        images: dto.images,
        isActive: dto.isActive,
      });
    }

    return this.productRepository.update(updatedProduct);
  }
}
```

#### `src/usecases/product/GetProductUseCase.ts` (Step 3.3)

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../../domain/interfaces/IProductRepository';
import { Product } from '../../../domain/entities/Product';
import { DI_TOKENS } from '../../../shared/constants';

@injectable()
export class GetProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
  ) {}

  public async execute(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }
}
```

#### `src/usecases/product/DeleteProductUseCase.ts` (Step 3.3)

```typescript
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../../domain/interfaces/IProductRepository';
import { DI_TOKENS } from '../../../shared/constants';

@injectable()
export class DeleteProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
  ) {}

  public async execute(id: string): Promise<boolean> {
    return this.productRepository.delete(id);
  }
}
```

---

### 📡 Step 4: Interface Layer (API Documentation Included)

#### `src/interface/validators/ProductValidators.ts` (Step 4.1)

**Zod Validators**: Robust runtime request validation.

```typescript
import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    price: z.number().min(0, 'Price must be non-negative'),
    stock: z.number().int().min(0, 'Stock must be a non-negative integer'),
    category: z.string().min(1, 'Category is required'),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    category: z.string().min(1).optional(),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});
```

#### `src/interface/controllers/ProductController.ts` (Step 4.2)

**Controller**: `ProductController` managing request/response lifecycles.

```typescript
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { CreateProductUseCase } from '../../usecases/product/CreateProductUseCase';
import { GetProductUseCase } from '../../usecases/product/GetProductUseCase';
import { ListProductsUseCase } from '../../usecases/product/ListProductsUseCase';
import { UpdateProductUseCase } from '../../usecases/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../usecases/product/DeleteProductUseCase';

@injectable()
export class ProductController {
  constructor(
    @inject(CreateProductUseCase) private createProductUseCase: CreateProductUseCase,
    @inject(GetProductUseCase) private getProductUseCase: GetProductUseCase,
    @inject(ListProductsUseCase) private listProductsUseCase: ListProductsUseCase,
    @inject(UpdateProductUseCase) private updateProductUseCase: UpdateProductUseCase,
    @inject(DeleteProductUseCase) private deleteProductUseCase: DeleteProductUseCase
  ) {}

  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.createProductUseCase.execute(req.body);
      res.status(201).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { products, total } = await this.listProductsUseCase.execute(req.query);
      res.status(200).json({
        status: 'success',
        results: products.length,
        total,
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.getProductUseCase.execute(req.params.id);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.updateProductUseCase.execute(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const success = await this.deleteProductUseCase.execute(req.params.id);
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
```

#### `src/interface/routes/productRoutes.ts` (Step 4.3)

**Routes**: RESTful endpoints registered in `productRoutes.ts`.

```typescript
import { Router } from 'express';
import { container } from 'tsyringe';
import { ProductController } from '../controllers/ProductController';
import { validateRequest } from '../../shared/utils';
import {
  createProductSchema,
  updateProductSchema,
  getProductSchema,
} from '../validators/ProductValidators';

const router = Router();
const productController = container.resolve(ProductController);

/**
 * @openapi
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @openapi
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - stock
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Wireless Headphones"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: "High-quality wireless headphones with noise cancellation"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 199.99
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 50
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/image1.jpg"]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', validateRequest(createProductSchema), productController.create);

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products with optional filtering
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product name and description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 25
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/', productController.list);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', validateRequest(getProductSchema), productController.getOne);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Updated Product Name"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 example: "Updated product description"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 149.99
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 example: 75
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/updated-image.jpg"]
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Validation error
 */
router.put('/:id', validateRequest(updateProductSchema), productController.update);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete('/:id', validateRequest(getProductSchema), productController.delete);

export default router;
```

---

### ✅ Step 5: Configuration & Integration (Swagger Ready)

#### `src/config/di-container.ts` (Step 5.1)

**DI Registration**: Register Product Repository and Service. Depends on constants (5.0), repository (2.2), and service (1.3).

```typescript
import { container } from 'tsyringe';
import { MongoProductRepository } from '../infrastructure/repositories/MongoProductRepository';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { DI_TOKENS } from '../shared/constants';

export const initializeDIContainer = () => {
  // Register Product Repository
  container.register<IProductRepository>(DI_TOKENS.PRODUCT_REPOSITORY, {
    useClass: MongoProductRepository,
  });

  // ProductService is automatically registered via @injectable decorator
  // No manual registration needed - tsyringe handles it
};
```

#### `src/app.ts` (Step 5.2)

**App Routing**: Mount `productRoutes` to `/api/products`. Depends on routes (4.3).

```typescript
import productRoutes from './interface/routes/productRoutes';

// ... existing middleware

app.use('/api/products', productRoutes);

// ... rest of the app
```

---

## Verification Plan

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Server

```bash
npm run dev
```

### 3. Test Product Endpoints

```bash
# Create Product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "A test product description",
    "price": 99.99,
    "stock": 100,
    "category": "Electronics"
  }'

# List Products
curl http://localhost:3000/api/products

# Get Product by ID
curl http://localhost:3000/api/products/{id}

# Update Product
curl -X PUT http://localhost:3000/api/products/{id} \
  -H "Content-Type: application/json" \
  -d '{"price": 89.99}'

# Delete Product
curl -X DELETE http://localhost:3000/api/products/{id}
```

---

## Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Interface Layer (API)           │
│  controllers/ routes/ validators/       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Use Cases Layer (Business)       │
│         usecases/ (application)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Domain Layer (Core Business)      │
│   entities/ interfaces/                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Infrastructure Layer (External)     │
│  models/ repositories/                 │
└─────────────────────────────────────────┘
```

---

## Next Steps

- [ ] Implement domain entities
- [ ] Create use cases
- [ ] Add API routes
- [ ] Implement repositories
- [ ] Add validation middleware
- [ ] Create DTOs
- [ ] Write comprehensive tests
- [x] Document API endpoints in Swagger

---

## Status

🚧 **In Progress**

**Phase 08: Product Module** - Feature implementation in progress

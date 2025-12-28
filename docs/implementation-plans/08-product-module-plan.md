# Implementation Plan #08 - Product Module

**Plan:** 08-product-module-plan  
**Related Task:** [02-product-module-task](../tasks/02-product-module-task.md) (for more details)  
**Branch:** `feature/jollyjet-08-product-module`  
**Status:** ✅ **COMPLETED WITH ENHANCED TYPE SYSTEM INTEGRATION**

---

## Overview

This phase implements the **Product Module**, the foundational catalog engine of JollyJet. Crucial for e-commerce, it handles everything from inventory management to product discovery.

We will strictly follow **Clean Architecture**, ensuring our business rules (Domain) remain independent of frameworks (Interface/Infrastructure). This guarantees longevity, testability, and ease of maintenance.

## 🚀 Implementation Steps (Step-by-Step Guide)

---

### ✅ _Step 1.1: Create Product Entity_

- **Objective:** Define the core Product domain model with TypeScript interfaces representing product properties (id, name, description, price, category, etc.) in the domain layer
- **Implementation:** Create `src/domain/entities/Product.ts` with immutable Product class, basic validation, and readonly properties
- **Dependencies:** None
- **Files:** `src/domain/entities/Product.ts`

> **🔥 DETAILED PRODUCT ENTITY EXPLANATION:**
>
> _<u>**ProductProps Interface:**</u>_
>
> - **Purpose:** Defines the contract for all product data properties
> - **Design Pattern:** TypeScript interface for compile-time type safety
> - **Fields:**
>   - Core properties: id, name, description, price, stock, category
>   - Optional properties: images, isActive, createdAt, updatedAt
>   - Wishlist properties: isWishlistStatus, wishlistCount (new additions)
> - **Validation:** TypeScript ensures all required fields are present
> - **Extensibility:** Optional fields allow for flexible product definitions
>
> _<u>**Product Class:**</u>_
>
> - **Design Pattern:** Immutable entity with factory methods
> - **ProductProps Interface Enhancements:** All readonly to enforce immutability
>   - Added `isWishlistStatus?: boolean` field for tracking wishlist status (default: false)
>   - Added `wishlistCount?: number` field for tracking popularity (default: 0)
>   - Both fields are optional to maintain backward compatibility
> - **Constructor:** Private to enforce factory method pattern
> - **Factory Methods:**
>   - `create()`: Standard product creation
>   - `createWithWishlistStatus()`: Product with specific wishlist status
> - **Wishlist Methods:**
>   - `toggleWishlist()`: Toggles wishlist status via repository
>   - Basic validation and wishlist properties support
> - **Validation:** Private validate() method enforces business rules
> - **Helper Methods:** toProps() converts entity to interface
>
> _<u>**Business Rules Enforcement:**</u>_
>
> - Name is required and trimmed
> - Price cannot be negative
> - Stock cannot be negative
> - Wishlist count cannot be negative
> - All string fields are auto> -trimmed
> - Default values for optional fields
> - Immutable pattern prevents direct modification
>
> _<u>**Wishlist Feature Integration:**</u>_
>
> - isWishlistStatus: Boolean flag for wishlist status
> - wishlistCount: Counter for wishlist popularity
> - Wishlist methods maintain data consistency
> - All wishlist operations return new instances
> - Wishlist count automatically updated
>
> _<u>**Benefits:**</u>_
>
> - Type Safety: Full TypeScript coverage
> - Immutability: Prevents accidental modifications
> - Validation: Business rules enforced consistently
> - Extensibility: Easy to add new properties
> - Testability: Pure functions with no side effects
> - Documentation: Self-documenting code structure

### ✅ _Step 1.2: Define IProductRepository Interface_

- **Objective:** Create an abstract repository interface in the domain layer defining CRUD operations (create, findById, findAll, update, delete) for dependency inversion
- **Implementation:** Define interface with Promise-based methods for data persistence contract
- **Dependencies:** Product Entity (Step 1.1)
- **Files:** `src/domain/interfaces/IProductRepository.ts`

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 1.2:**
>
> **Wishlist Integration in Repository Interface:**
>
> - **ProductFilter Interface Enhancements:**
>   - Added `isWishlistStatus?: boolean` field to support wishlist filtering
>   - Enables querying products by wishlist status across all repository methods
> - **Repository Method Updates:**
>   - `findAll()`: Supports wishlist filtering via ProductFilter parameter
>   - `count()`: Supports counting products by wishlist status
>   - All methods maintain wishlist data integrity during persistence operations
> - **Dependency Inversion Principle:**
>   - Interface defines contract without implementation details
>   - Enables multiple repository implementations (MongoDB, SQL, etc.)
>   - Wishlist functionality abstracted at interface level
> - **Design Patterns Applied:**
>   - **Repository Pattern**: Abstracts data access layer
>   - **Dependency Inversion**: High-level modules depend on abstractions
>   - **Interface Segregation**: Focused interface for product operations
> - **Dependencies:** Product Entity (Step 1.1) - Uses Product and ProductFilter types
> - **Integration Points:** Implemented by MongoProductRepository (Step 2.2)
> - **Benefits:** Loose coupling, testability, multiple storage backends support

### ✅ _Step 1.3: Create ProductService_

- **Objective:** Implement business logic service in the domain layer for product operations like stock management, price updates, and validation
- **Implementation:** Create ProductService class with methods for updating stock, price, and product details using dependency injection
- **Dependencies:** Product Entity (Step 1.1)
- **Files:** `src/domain/services/ProductService.ts`

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 1.3:**

> **Wishlist Integration in Product Service:**

> - **Service Method Enhancements:**
>   - Added `updateWishlistStatus()` method for wishlist state management
>   - Extended existing methods to maintain wishlist data integrity
>   - Implemented comprehensive business logic for wishlist operations
> - **Wishlist Business Logic:**
>   - Automatic wishlist count increments/decrements
>   - Validation for proper wishlist state transitions
>   - Integration with existing product update workflows
> - **Dependency Injection:**
>   - Uses Product Entity (Step 1.1) for type definitions
>   - Implements `@injectable()` decorator for DI container
>   - Enables loose coupling and easy testing
> - **Design Patterns Applied:**
>   - **Service Pattern**: Encapsulates business logic
>   - **Dependency Injection**: Enables testability
>   - **Single Responsibility**: Focused on product operations
> - **Dependencies:** Product Entity (Step 1.1) - Uses Product and ProductProps types
> - **Integration Points:** Used by UpdateProductUseCase (Step 4.2) and other use cases
> - **Benefits:** Centralized business logic, easy testing, framework independence

### ✅ _Step 2.1: Implement MongoDB Product Schema_

- **Objective:** Create Mongoose schema in infrastructure layer with validation rules, indexes, and mapping to the Product entity
- **Implementation:** Define schema with text indexes, timestamps, and proper validation at database level
- **Dependencies:** None
- **Files:** `src/infrastructure/models/ProductModel.ts`

> **💎 DETAILED WISHLIST EXPLANATION FOR STEP 2.1:**

> **Wishlist Integration in MongoDB Schema:**

> - **Schema Field Enhancements:**
>   - Added `isWishlistStatus` field with boolean type and default false
>   - Added `wishlistCount` field with number type, default 0, and min 0 validation
>   - Integrated wishlist fields with existing schema structure
> - **Validation Rules:**
>   - Non-negative constraint for wishlistCount field
>   - Default values ensure data consistency
>   - Type safety enforced at database level
> - **Database Optimization:**
>   - Proper indexing for efficient wishlist queries
>   - Schema validation prevents invalid wishlist data
>   - Timestamps automatically managed by Mongoose
> - **Design Patterns Applied:**
>   - **Repository Pattern**: Database schema for persistence
>   - **Data Mapping**: Converts between domain and database models
>   - **Validation Pattern**: Schema-level data validation
> - **Dependencies:** None (Pure infrastructure layer implementation)
> - **Integration Points:** Used by MongoProductRepository (Step 2.2)
> - **Benefits:** Data integrity, efficient queries, type safety

### ✅ _Step 2.2: Create MongoProductRepository_

- **Objective:** Implement the repository interface using Mongoose, handling database operations and converting between MongoDB documents and domain entities
- **Implementation:** Map between domain entities and MongoDB documents with toDomain() method and error handling
- **Dependencies:** Product Entity (Step 1.1), IProductRepository (Step 1.2), ProductModel (Step 2.1)
- **Files:** `src/infrastructure/repositories/MongoProductRepository.ts`

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 2.2:**

> **Wishlist Integration in Repository Implementation:**

> - **CRUD Operations Enhancement:**
>   - Updated `create()` method to persist wishlist fields
>   - Modified `update()` method to handle wishlist status changes
>   - Enhanced `findAll()` method with wishlist filtering support
>   - Updated `count()` method for wishlist product counting
> - **Filter Integration:**
>   - Added wishlist status filtering in query building (Line 708)
>   - Integrated with existing category and search filters
>   - Maintained consistent filter pattern across all methods
> - **Data Mapping:**
>   - Extended `toDomain()` method to include wishlist fields
>   - Ensured proper conversion between MongoDB and domain models
>   - Maintained data integrity during transformations
> - **Design Patterns Applied:**
>   - **Repository Pattern**: Concrete implementation of data access
>   - **Dependency Injection**: Injectable repository class
>   - **Adapter Pattern**: Converts between domain and database models
> - **Dependencies:** Product Entity (Step 1.1), IProductRepository (Step 1.2), ProductModel (Step 2.1)
> - **Integration Points:** Used by all use cases (Step 4.2)
> - **Benefits:** Loose coupling, testability, consistent data access

### ✅ _Step 3.1: Create Product DTOs with Zod Validation_

- **Objective:** Define input/output data transfer objects using Zod schemas for API request/response validation and type safety
- **Implementation:** Create CreateProductDTO, UpdateProductDTO, ProductResponseDTO with Zod validation schemas
- **Dependencies:** None
- **Files:** `src/interface/dtos/product/*.ts`

### ✅ _Step 3.2: Create Product Validators_

- **Objective:** Implement Zod-based runtime validation for API requests using the DTOs
- **Implementation:** Create validation schemas for create, update, and get operations
- **Dependencies:** DTOs (Step 3.1)
- **Files:** `src/interface/validators/ProductValidators.ts`

> **💎 DETAILED WISHLIST EXPLANATION FOR STEP 3.2:**
>
> **Wishlist Integration in Product Validators:**
>
> - **Validation Schema Enhancements:**
>   - Added wishlist field validation in create and update schemas
>   - Ensured proper type validation for wishlist boolean fields
>   - Integrated wishlist validation with existing product validation rules
> - **Wishlist Validation Rules:**
>   - Boolean type validation for isWishlistStatus field
>   - Optional field handling with proper defaults
>   - Integration with existing validation patterns
> - **Error Handling:**
>   - Clear error messages for invalid wishlist data
>   - Consistent error format across all validators
>   - Proper error propagation to API consumers
> - **Design Patterns Applied:**
>   - **Validation Pattern**: Comprehensive input validation
>   - **Adapter Pattern**: Converts between API and domain models
>   - **Single Responsibility**: Focused on validation logic
> - **Dependencies:** DTOs (Step 3.1) - Uses CreateProductDTO and UpdateProductDTO types
> - **Integration Points:** Used by ProductController (Step 5.1) for request validation
> - **Benefits:** Data integrity, security, consistent error responses

### ✅ _Step 4.1: Add Shared Constants (DI_TOKENS) - Shared Layer_

- **Objective:** Define dependency injection tokens for the product module in the shared layer
- **Implementation:** Add PRODUCT_REPOSITORY token to shared constants for dependency injection
- **Dependencies:** None
- **Files:** `src/shared/constants.ts`
- **Layer:** Shared (Cross-cutting concerns)
- **Importance:** Critical for dependency injection setup before use cases can be implemented

> **🔥 DETAILED EXPLANATION:**
>
> - **Purpose:** DI_TOKENS provide a centralized way to manage dependency injection tokens
> - **Why First:** Use Cases (Step 4.2) depend on these tokens for constructor injection
> - **Clean Architecture:** Shared layer contains cross-cutting concerns used across all layers
> - **Implementation:** Simple constant definition with no external dependencies
> - **Best Practice:** Follows dependency inversion principle by using abstraction tokens

### ✅ _Step 4.2: Implement Product Use Cases - Application Layer_

- **Objective:** Create application layer services for business logic: CreateProductUseCase, GetProductUseCase, UpdateProductUseCase, DeleteProductUseCase, ListProductsUseCase
- **Implementation:** Five use case classes with dependency injection, business rule validation, and repository calls
- **Dependencies:** DTOs (Step 3.1), IProductRepository (Step 1.2), ProductService (Step 1.3), DI_TOKENS (Step 4.1)
- **Files:** `src/usecases/product/*.ts`
- **Layer:** Application (Business logic orchestration)
- **Importance:** Core business logic that coordinates domain entities and infrastructure

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 4.2:**
>
> **Wishlist Integration in Use Cases:**
>
> - **Use Case Enhancements:**
>   - Updated ListProductsUseCase to support wishlist filtering
>   - Extended UpdateProductUseCase to handle wishlist status changes
>   - Added comprehensive wishlist business logic across all use cases
> - **Wishlist Business Logic:**
>   - Automatic wishlist count management
>   - Validation for proper wishlist state transitions
>   - Integration with existing product operations
> - **Dependency Injection:**
>   - Uses ProductService (Step 1.3) for wishlist operations
>   - Implements DI_TOKENS (Step 4.1) for loose coupling
>   - Enables easy testing and framework independence
> - **Design Patterns Applied:**
>   - **Use Case Pattern**: Encapsulates business logic
>   - **Dependency Injection**: Enables testability
>   - **Single Responsibility**: Focused on specific operations
> - **Dependencies:** DTOs (Step 3.1), IProductRepository (Step 1.2), ProductService (Step 1.3), DI_TOKENS (Step 4.1)
> - **Integration Points:** Used by ProductController (Step 5.1) for API operations
> - **Benefits:** Centralized business logic, easy testing, framework independence

**Error Handling Implementation:**

All use cases have been updated to use proper error classes from `src/shared/errors.ts` for better error classification and API responses:

1. **CreateProductUseCase**:
   - **Error**: `throw new BadRequestError('Product is not available.')`
   - **Import Added**: `import { BadRequestError } from '../shared/errors';`

2. **GetProductUseCase**:
   - **Error**: `throw new BadRequestError('Product ID is required to retrieve the product.')`
   - **Import Added**: `import { BadRequestError } from '../shared/errors';`

3. **DeleteProductUseCase**:
   - **Error**: `throw new BadRequestError('Product ID is required for deletion.')`
   - **Import Added**: `import { BadRequestError } from '../shared/errors';`

4. **ToggleWishlistProductUseCase**:
   - **Error 1**: `throw new BadRequestError('Product ID is required for wishlist toggle.')`
   - **Error 2**: `throw new NotFoundError('Product not found.')`
   - **Import Added**: `import { BadRequestError, NotFoundError } from '../shared/errors';`

5. **UpdateProductUseCase**:
   - **Error 1**: `throw new BadRequestError('Product ID is required for updation.')`
   - **Error 2**: `throw new NotFoundError('Product not found.')`
   - **Import Added**: `import { BadRequestError, NotFoundError } from '../shared/errors';`

**Completed Use Cases:**

1. **CreateProductUseCase**: Handles the creation of new products with validation and dependency injection.
2. **GetProductUseCase**: Retrieves a product by its ID.
3. **ListProductsUseCase**: Lists products with support for pagination, filtering, and parallel queries for efficiency.
4. **UpdateProductUseCase**: Updates existing products, including support for wishlist status updates.
5. **DeleteProductUseCase**: Deletes a product by its ID.
6. **ToggleWishlistProductUseCase**: Specifically handles toggling the wishlist status of a product.

All use cases follow best practices such as dependency injection, separation of concerns, and proper error handling. The wishlist functionality is integrated into both the `UpdateProductUseCase` and the dedicated `ToggleWishlistProductUseCase`. The error handling has been standardized to use appropriate error classes for better API consumer experience and consistent error responses.

### ✅ _Step 5.1: Build ProductController_

- **Objective:** Create Express controller class handling HTTP requests, using use cases, and returning properly typed `ApiResponse<T>` objects with error handling
- **Implementation:** Controller with methods for create, getOne, list, update, delete operations using dependency injection and type-safe API responses
- **Type Integration:** Full utilization of `ApiResponse<T>`, `ValidationError`, and enums from `types/index.d.ts`
- **Dependencies:** Product Use Cases (Step 4.2), Validators (Step 3.2), Types (types/index.d.ts)
- **Files:** `src/interface/controllers/ProductController.ts`

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 5.1:**
>
> **Wishlist Integration in ProductController:**
>
> - **Controller Method Enhancements:**
>   - Added `toggleWishlist()`, `getWishlist()` methods
>   - Extended existing methods to handle wishlist operations
>   - Implemented comprehensive error handling for wishlist endpoints
> - **Wishlist API Endpoints:**
>   - PATCH /api/products/{id}/wishlist - Toggle product wishlist status
>   - GET /api/products/wishlist - Get all wishlist products
> - **Request/Response Handling:**
>   - Proper HTTP status codes for wishlist operations
>   - Consistent JSON response format
>   - Comprehensive error propagation
> - **Design Patterns Applied:**
>   - **Controller Pattern**: Handles HTTP request/response lifecycle
>   - **Dependency Injection**: Uses injected use cases
>   - **Single Responsibility**: Focused on HTTP operations
> - **Dependencies:** Product Use Cases (Step 4.2), Validators (Step 3.2)
> - **Integration Points:** Used by ProductRoutes (Step 5.2) for API routing
> - **Benefits:** Clean separation of concerns, easy testing, framework independence

### ✅ _Step 5.2: Set up Product Routes_

- **Objective:** Configure Express routes with middleware (validation, authentication placeholder), mapping endpoints to controller methods
- **Implementation:** Define routes for CRUD operations with validation middleware and Swagger documentation
- **Dependencies:** ProductController (Step 5.1), ProductValidators (Step 3.2)
- **Files:** `src/interface/routes/productRoutes.ts`

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 5.2:**
>
> **Wishlist Integration in Product Routes:**
>
> - **Route Enhancements:**
>   - Added wishlist-specific routes for product wishlist operations
>   - Integrated wishlist endpoints with existing product routes
>   - Added comprehensive Swagger documentation for wishlist endpoints
> - **Wishlist API Endpoints:**
>   - PATCH /api/products/{id}/wishlist - Toggle product wishlist status
>   - GET /api/products/wishlist - Get all wishlist products
> - **Swagger Documentation:**
>   - Complete OpenAPI annotations for wishlist endpoints
>   - Detailed parameter and response documentation
>   - Error response documentation for wishlist operations
> - **Design Patterns Applied:**
>   - **Router Pattern**: Organizes related endpoints
>   - **Middleware Pattern**: Uses validation middleware
>   - **Single Responsibility**: Focused on routing logic
> - **Dependencies:** ProductController (Step 5.1), ProductValidators (Step 3.2)
> - **Integration Points:** Used by Swagger configuration (Step 6.1) for API documentation
> - **Benefits:** Clean URL structure, comprehensive documentation, easy maintenance

### ✅ _Step 6.1: Document Product API Endpoints in Swagger_

- **Objective:** Add Swagger/OpenAPI annotations to routes and DTOs for automatic API documentation generation
- **Implementation:** Update Swagger configuration with Product API endpoint documentation and add annotations to routes
- **Dependencies:** Product Routes (Step 5.2)
- **Files:** `src/config/swagger.ts` (Swagger configuration), route annotations in `src/interface/routes/productRoutes.ts`

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 6.1:**
>
> **Wishlist Integration in Swagger Documentation:**
>
> - **Schema Enhancements:**
>   - Added wishlist fields to Product schema definition
>   - Included comprehensive documentation for wishlist properties
>   - Added validation rules and examples for wishlist fields
> - **Endpoint Documentation:**
>   - Complete Swagger annotations for wishlist endpoints
>   - Detailed parameter and response documentation
>   - Error response documentation for wishlist operations
> - **API Documentation:**
>   - Interactive API documentation for wishlist functionality
>   - Try-it-out functionality for wishlist endpoints
>   - Comprehensive examples and descriptions
> - **Design Patterns Applied:**
>   - **Documentation Pattern**: Comprehensive API documentation
>   - **Single Source of Truth**: Documentation stays in sync with code
>   - **OpenAPI Standard**: Follows industry-standard documentation format
> - **Dependencies:** Product Routes (Step 5.2) - Uses route annotations
> - **Integration Points:** Used by Swagger UI middleware for interactive documentation
> - **Benefits:** Developer-friendly documentation, easy API exploration, consistent format

### ✅ _Step 6.2: Update DI Container Configuration_

- **Objective:** Register all new dependencies in the DI container for dependency injection
- **Implementation:** Add DI tokens, register repository and use cases
- **Dependencies:** MongoProductRepository (Step 2.2), ProductService (Step 1.3), DI_TOKENS (Step 4.1)
- **Files:** `src/config/di-container.ts`

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 6.2:**
>
> **Wishlist Integration in DI Container:**
>
> - **Dependency Registration:**
>   - Registered wishlist-related dependencies in DI container
>   - Ensured proper binding of wishlist repository implementations
>   - Maintained loose coupling for easy testing and mocking
> - **Wishlist Service Registration:**
>   - Automatic registration of wishlist services via decorators
>   - Proper dependency injection for wishlist functionality
>   - Centralized dependency management
> - **Design Patterns Applied:**
>   - **Dependency Injection Pattern**: Centralized dependency management
>   - **Inversion of Control**: Framework handles dependency resolution
>   - **Single Responsibility**: Focused on dependency configuration
> - **Dependencies:** MongoProductRepository (Step 2.2), ProductService (Step 1.3), DI_TOKENS (Step 4.1)
> - **Integration Points:** Used by Application (Step 6.3) for dependency resolution
> - **Benefits:** Loose coupling, easy testing, centralized configuration

### ✅ _Step 6.3: Update Application Wiring_

- **Objective:** Integrate product routes into the main application
- **Implementation:** Mount routes in app.ts
- **Dependencies:** Routes (Step 5.2)
- **Files:** `src/app.ts`

---

## 🔗 _Enhanced Type System Integration_

### **Post-Implementation Type System Enhancements**

Following the initial implementation, comprehensive type system integration was added to improve type safety and consistency across the entire product module:

#### **Types from `types/index.d.ts` Integration**

1. **`ApiResponse<T>` Interface**
   - **Purpose:** Standardized API response wrapper for all endpoints
   - **Usage:** All ProductController methods now return properly typed `ApiResponse<T>` objects
   - **Implementation:** Success responses with data, error responses with `ValidationError` arrays
   - **Benefits:** Type-safe API responses, consistent response structure, better IDE support

2. **`ValidationError` Interface**
   - **Purpose:** Structured validation error information for field-level errors
   - **Usage:** Error responses include detailed validation information with field names and messages
   - **Implementation:** `{ field: string; message: string }` structure for all validation errors
   - **Benefits:** Client-friendly error handling, consistent error reporting

3. **`PaginationParams` & `PaginationMeta` Interfaces**
   - **Purpose:** Standardized pagination handling across the application
   - **Usage:** Repository methods use `PaginationParams` for input, use cases return enhanced metadata
   - **Implementation:** Structured pagination with page, limit, skip, and totalPages
   - **Benefits:** Consistent pagination patterns, type safety for pagination logic

4. **`QueryFilter` Base Interface**
   - **Purpose:** Base filter interface for consistent querying patterns
   - **Usage:** `ProductFilter` extends `QueryFilter` for standardized filtering
   - **Implementation:** Extensible filter pattern used across repository methods
   - **Benefits:** Consistent query interfaces, type-safe filtering

5. **`IBaseRepository<T>` Pattern**
   - **Purpose:** Reference pattern for repository design consistency
   - **Usage:** Guides the design of `IProductRepository` interface
   - **Implementation:** Standard CRUD operations pattern with proper typing
   - **Benefits:** Consistent repository interfaces across the application

#### **Enum Enhancements**

1. **`HTTP_STATUS` Enum**
   - **Purpose:** Type-safe HTTP status codes
   - **Usage:** All controller responses use enum values instead of magic numbers
   - **Benefits:** Prevents typos, better IDE support, consistent status codes

2. **`RESPONSE_STATUS` Enum**
   - **Purpose:** Standardized response status strings
   - **Usage:** All API responses use enum values for status field
   - **Benefits:** Type safety, prevents typos, consistent response format

#### **Controller Type Safety**

All ProductController methods now use properly typed responses:

```typescript
// Before: Untyped responses
res.status(200).json({ status: 'success', data: product });

// After: Fully typed ApiResponse
const response: ApiResponse<Product> = {
  status: RESPONSE_STATUS.SUCCESS,
  data: product,
  message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_CREATED,
};
res.status(HTTP_STATUS.CREATED).json(response);
```

#### **Repository Type Enhancements**

```typescript
// Enhanced repository interface with structured types
export interface IProductRepository {
  findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]>;
  // ... other methods
}

// ProductFilter extends base QueryFilter
export interface ProductFilter extends QueryFilter {
  category?: string;
  isActive?: boolean;
  isWishlistStatus?: boolean;
  // ... product-specific filters
}
```

#### **Benefits of Type System Integration**

- **Compile-Time Safety:** TypeScript catches type errors at compile time
- **IDE Support:** Better autocomplete, refactoring, and error detection
- **API Consistency:** Standardized response formats across all endpoints
- **Maintainability:** Self-documenting code with clear type contracts
- **Developer Experience:** Improved development workflow with type hints
- **Runtime Safety:** Reduced potential for runtime errors through proper typing

---

## 🌟 _Final Implementation Status_

> **🔥 DETAILED WISHLIST EXPLANATION FOR STEP 6.3:**
>
> **Wishlist Integration in Application Wiring:**
>
> - **Route Integration:**
>   - Mounted wishlist routes in main application
>   - Ensured proper route configuration for wishlist endpoints
>   - Integrated wishlist functionality with existing product routes
> - **Middleware Configuration:**
>   - Added proper middleware for wishlist operations
>   - Ensured error handling for wishlist endpoints
>   - Configured request logging for wishlist operations
> - **Design Patterns Applied:**
>   - **Composition Pattern**: Integrates multiple components
>   - **Middleware Pattern**: Uses Express middleware chain
>   - **Single Responsibility**: Focused on application configuration
> - **Dependencies:** Routes (Step 5.2) - Uses productRoutes with wishlist endpoints
>   - **Integration Points:** Final integration point for wishlist functionality
> - **Benefits:** Complete application integration, proper error handling, clean architecture

---

## 🗺️ _Implementation Steps Overview_

---

The Product Module follows a systematic implementation approach based on Clean Architecture principles with proper dependency flow:

1. **🟣 Domain Layer (Steps 1.1-1.3)**: Create core business entities, interfaces, and services
2. **🟠 Infrastructure Layer (Steps 2.1-2.2)**: Implement external adapters
3. **🟡 Interface Layer - DTOs/Validators (Steps 3.1-3.2)**: Develop data transfer objects and validation
4. **🟢 Shared Layer - Constants (Step 4.1)**: Define dependency injection tokens (no dependencies)
5. **🔵 Application Layer - Use Cases (Step 4.2)**: Build use cases that orchestrate domain logic ← Depends on DTOs (3.1) and DI_TOKENS (4.1)
6. **🟡 Interface Layer - Controllers/Routes (Steps 5.1-5.2)**: Develop HTTP adapters ← Depends on Use Cases (4.2)
7. **🟢 Configuration Layer (Steps 6.1-6.3)**: Wire everything together

> **🔥 CRITICAL DEPENDENCY FLOW NOTES:**
>
> - **Step 4.1 (Shared Layer)** must come before **Step 4.2 (Application Layer)** because Use Cases depend on DI_TOKENS
> - **Circular Dependency Prevention:** Controllers depend on Use Cases, but Use Cases never depend on Controllers
> - **Layer Isolation:** Shared layer contains cross-cutting concerns used by multiple layers
> - **Implementation Order:** Follow the exact sequence to avoid dependency resolution errors

---

## 🌟 _Highlights_

---

**✅ Proper Clean Architecture Layer Ordering:** Domain → Infrastructure → Interface (DTOs/Validators) → Shared → Application → Interface (Controllers/Routes) → Configuration

**✅ Critical Dependency Flow:** Step 4.1 (Shared Constants) must come before Step 4.2 (Use Cases) due to DI_TOKENS dependency

**🖼️ Visual Architecture Reference:** For a comprehensive visual representation of the product module architecture and data flow, refer to the **[Product Flowchart](../flowchart/product-flowchart.md)** which illustrates the complete Clean Architecture implementation with all layers and their interactions.

---

## 🎯 _Key Objectives_

---

1. **✅ Proper Clean Architecture**: Correct layer ordering and dependency flow.
2. **✅ Robust Validation**: Zod-based runtime validation for all inputs.
3. **✅ Search & Filter**: Powerful querying capabilities for the frontend.
4. **✅ Scalable Data**: Optimized MongoDB schema with necessary indexes.
5. **✅ Strict Typing**: Full TypeScript coverage for entities and DTOs.
6. **✅ No Circular Dependencies**: Controllers depend on Use Cases (not vice versa)
7. **✅ Sequential Step Numbers**: Consistent numbering throughout (1.1-6.3)
8. **✅ Correct Dependencies**: All references updated to match proper flow
9. **✅ Comprehensive Documentation**: Every component has detailed explanations
10. **✅ Visual Clarity**: Consistent formatting with clear visual hierarchy
11. **✅ Implementation Guidance**: Step-by-step guide for developers
12. **✅ Dependency Flow**: Shared Layer (4.1) before Application Layer (4.2)
13. **✅ Layer Isolation**: Clear separation of concerns across all layers

---

## 📁 _Folder Structure Changes_

---

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
│   ├── interface/                                # 📡 Step 3: HTTP Adapters (Common Structure)
│   │   ├── dtos/
│   │   │   ├── CreateProductDTO.ts               # ✅ NEW (Step 3.1) - No dependencies
│   │   │   ├── UpdateProductDTO.ts               # ✅ NEW (Step 3.1) - No dependencies
│   │   │   └── ProductResponseDTO.ts             # ✅ NEW (Step 3.1) - No dependencies
│   │   └── validators/
│   │       └── ProductValidators.ts              # ✅ NEW (Step 3.2) - Depends on DTOs (3.1)
│   │
│   ├── shared/
│   │   └── constants.ts                          # ✅ MODIFIED (Step 4.1) - Before Use Cases & DI
│   │
│   ├── usecases/                                 # ⚙️ Step 4: Application Layer (Common Structure)
│   │   └── product/
│   │       ├── CreateProductUseCase.ts           # ✅ NEW (Step 4.2) - Depends on (3.1, 1.2, 1.3, 4.1)
│   │       ├── ListProductsUseCase.ts            # ✅ NEW (Step 4.2) - Depends on (1.2, 1.3, 4.1)
│   │       ├── UpdateProductUseCase.ts           # ✅ NEW (Step 4.2) - Depends on (3.1, 1.2, 1.3, 4.1)
│   │       ├── GetProductUseCase.ts              # ✅ NEW (Step 4.2) - Depends on (1.2, 1.3, 4.1)
│   │       └── DeleteProductUseCase.ts           # ✅ NEW (Step 4.2) - Depends on (1.2, 1.3, 4.1)
│   │
│   ├── interface/                                # 📡 Step 5: HTTP Adapters (Common Structure)
│   │   ├── controllers/
│   │   │   └── ProductController.ts              # ✅ NEW (Step 5.1) - Depends on Use Cases (4.2), Validators (3.2)
│   │   └── routes/
│   │       └── productRoutes.ts                  # ✅ NEW (Step 5.2) - Depends on (3.2, 5.1)
│   │
│   ├── config/
│   │   ├── swagger.ts                            # ✅ MODIFIED (Step 6.1) - Depends on Routes (5.2) - Swagger documentation
│   │   └── di-container.ts                       # ✅ MODIFIED (Step 6.2) - Depends on (2.2, 1.3, 4.1) - Register Product Repository & Service
│   │
│   └── app.ts                                    # ✅ MODIFIED (Step 6.3) - Depends on Routes (5.2) - Mount product routes
```

---

## 🔗 _Implementation Order (Dependency Flow)_

---

**Correct implementation sequence based on dependencies:**

| Step    | Component                                     | Dependencies                                                                | Layer          |
| ------- | --------------------------------------------- | --------------------------------------------------------------------------- | -------------- |
| **1.1** | Product Entity                                | None                                                                        | Domain         |
| **1.2** | IProductRepository                            | Product (1.1)                                                               | Domain         |
| **1.3** | ProductService                                | Product (1.1)                                                               | Domain         |
| **2.1** | ProductModel                                  | None                                                                        | Infrastructure |
| **2.2** | MongoProductRepository                        | Product (1.1), IProductRepository (1.2), ProductModel (2.1)                 | Infrastructure |
| **3.1** | DTOs                                          | None                                                                        | Interface      |
| **3.2** | Validators                                    | DTOs (3.1)                                                                  | Interface      |
| **4.1** | Shared Constants (DI_TOKENS)                  | None                                                                        | Shared         |
| **4.2** | Use Cases (Create, List, Update, Get, Delete) | DTOs (3.1), IProductRepository (1.2), ProductService (1.3), DI_TOKENS (4.1) | Application    |
| **5.1** | Controllers                                   | Use Cases (4.2), Validators (3.2)                                           | Interface      |
| **5.2** | Routes                                        | Controllers (5.1)                                                           | Interface      |
| **6.1** | Swagger Documentation                         | Routes (5.2)                                                                | Configuration  |
| **6.2** | DI Container Configuration                    | MongoProductRepository (2.2), ProductService (1.3), DI_TOKENS (4.1)         | Configuration  |
| **6.3** | App.ts                                        | Routes (5.2)                                                                | Configuration  |

> **🔥 CRITICAL DEPENDENCY NOTES:**
>
> - **Step 4.1** must come before **Step 4.2** (Use Cases depend on DI_TOKENS)
> - **Step 4.2** must come before **Step 5.1** (Controllers depend on Use Cases)
> - **Step 6.1** must come before **Step 6.2** (Swagger depends on Routes)
> - **Step 6.2** must come before **Step 6.3** (DI Container before App wiring)
> - **Circular Dependency Prevention:** Controllers → Use Cases (never vice versa)
> - **Layer Isolation:** Shared layer contains cross-cutting concerns used by multiple layers

---

## 🧭 _Visual Dependency Chain_

---

**Implementation Order (Dependency Flow):**

```
Step 1.1: src/domain/entities/Product.ts (core)
    ↓
Step 1.2: src/domain/interfaces/IProductRepository.ts (interface)
    ↓
Step 1.3: src/domain/services/ProductService.ts (business logic)
    ↓
Step 2.1: src/infrastructure/models/ProductModel.ts (MongoDB schema)
    ↓
Step 2.2: src/infrastructure/repositories/MongoProductRepository.ts (implementation)
    ↓
Step 3.1: src/interface/dtos/*.ts (DTOs)
    ↓
Step 3.2: src/interface/validators/*.ts (Validators)
    ↓
Step 4.1: src/shared/constants.ts (DI_TOKENS) ← 🔥 MUST COME FIRST - No dependencies
    ↓
Step 4.2: src/usecases/product/CreateProductUseCase.ts (Use Cases) ← Depends on DTOs (3.1) and DI_TOKENS (4.1)
Step 4.2: src/usecases/product/ListProductsUseCase.ts (Use Cases) ← Depends on DTOs (3.1) and DI_TOKENS (4.1)
Step 4.2: src/usecases/product/UpdateProductUseCase.ts (Use Cases) ← Depends on DTOs (3.1) and DI_TOKENS (4.1)
Step 4.2: src/usecases/product/GetProductUseCase.ts (Use Cases) ← Depends on DTOs (3.1) and DI_TOKENS (4.1)
Step 4.2: src/usecases/product/DeleteProductUseCase.ts (Use Cases) ← Depends on DTOs (3.1) and DI_TOKENS (4.1)
    ↓
Step 5.1: src/interface/controllers/ProductController.ts (Controller) ← Depends on Use Cases (4.2)
    ↓
Step 5.2: src/interface/routes/productRoutes.ts (Routes) ← Depends on Controllers (5.1)
    ↓
Step 6.1: src/config/swagger.ts (Swagger configuration) + route annotations ← Depends on Routes (5.2)
    ↓
Step 6.2: src/config/di-container.ts (DI Container) ← Final wiring step
    ↓
Step 6.3: src/app.ts (App Configuration) ← Final integration step
```

**Layer Flow:**

```
Domain Layer (Steps 1.1-1.3)
    ↓
Infrastructure Layer (Steps 2.1-2.2)
    ↓
Interface Layer - DTOs/Validators (Steps 3.1-3.2)
    ↓
Shared Layer - Constants (Step 4.1) ← 🔥 MUST COME FIRST
    ↓
Application Layer - Use Cases (Step 4.2)
    ↓
Interface Layer - Controllers/Routes (Steps 5.1-5.2)
    ↓
Configuration Layer (Steps 6.1-6.3)
```

---

## 🛠️ Proposed Changes

---

### 💎 Step 1: Domain Layer (Steps 1.1-1.3)

#### `src/domain/entities/Product.ts` (step 1.1)

**Product Entity**: Simple data container with basic validation.

**🔥 DETAILED PRODUCT ENTITY EXPLANATION:**

_<u>**ProductProps Interface:**</u>_

- **Purpose:** Defines the contract for all product data properties
- **Design Pattern:** TypeScript interface for compile-time type safety
- **Fields:**
  - Core properties: id, name, description, price, stock, category
  - Optional properties: images, isActive, createdAt, updatedAt
  - Wishlist properties: isWishlistStatus, wishlistCount (new additions)
- **Validation:** TypeScript ensures all required fields are present
- **Extensibility:** Optional fields allow for flexible product definitions

_<u>**Product Class:**</u>_

- **Design Pattern:** Immutable entity with factory methods
- **Properties:** All readonly to enforce immutability
- **Constructor:** Private to enforce factory method pattern
- **Factory Methods:**
  - `create()`: Standard product creation
  - `createWithWishlistStatus()`: Product with specific wishlist status
- **Wishlist Methods:**
  - `toggleWishlistStatus()`: Toggle wishlist status in database
- **Validation:** Private validate() method enforces business rules
- **Helper Methods:** toProps() converts entity to interface

_<u>**Business Rules Enforcement:**</u>_

- Name is required and trimmed
- Price cannot be negative
- Stock cannot be negative
- Wishlist count cannot be negative
- All string fields are auto-trimmed
- Default values for optional fields
- Immutable pattern prevents direct modification

_<u>**Wishlist Feature Integration:**</u>_

- isWishlistStatus: Boolean flag for wishlist status
- wishlistCount: Counter for wishlist popularity
- Wishlist methods maintain data consistency
- All wishlist operations return new instances
- Wishlist count automatically updated

_<u>**Benefits:**</u>_

- Type Safety: Full TypeScript coverage
- Immutability: Prevents accidental modifications
- Validation: Business rules enforced consistently
- Extensibility: Easy to add new properties
- Testability: Pure functions with no side effects
- Documentation: Self-documenting code structure

_<u>**Usage Examples:**</u>_

- const product = Product.createProduct({ name: 'Laptop', price: 999, ... });
- // Wishlist operations handled via repository/use case layer
- const toggledProduct = product.toggleWishlist();

---

```typescript
// Product properties interface defining all product attributes
export interface ProductProps {
  id?: string; // Unique product identifier
  name: string; // Product name (required)
  description: string; // Product description (required)
  price: number; // Product price (must be non-negative)
  stock: number; // Available stock quantity (must be non-negative)
  category: string; // Product category (required)
  images?: string[]; // Product image URLs (optional)
  isActive?: boolean; // Product active status (default: true)
  createdAt?: Date; // Creation timestamp (auto-generated)
  updatedAt?: Date; // Last update timestamp (auto-generated)
  isWishlistStatus?: boolean; // Wishlist status (default: false)
  wishlistCount?: number; // Number of users who added this to wishlist (default: 0)
}

// Immutable Product entity with business rule validation
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
  public readonly isWishlistStatus: boolean;
  public readonly wishlistCount: number;

  // Private constructor enforces factory method pattern
  private constructor(props: ProductProps) {
    this.id = props.id || '';
    this.name = props.name.trim(); // Auto-trim whitespace
    this.description = props.description.trim(); // Auto-trim whitespace
    this.price = props.price;
    this.stock = props.stock;
    this.category = props.category.trim(); // Auto-trim whitespace
    this.images = props.images || []; // Default empty array
    this.isActive = props.isActive ?? true; // Default to active
    this.createdAt = props.createdAt || new Date(); // Auto-set current date
    this.updatedAt = props.updatedAt || new Date(); // Auto-set current date
    this.isWishlistStatus = props.isWishlistStatus ?? false; // Default to not in wishlist
    this.wishlistCount = props.wishlistCount ?? 0; // Default to 0

    this.validate(); // Enforce business rules
  }

  // Factory method for creating validated Product instances
  public static create(props: ProductProps): Product {
    return new Product(props);
  }

  // Factory method for creating a product with wishlist status
  public static createWithWishlistStatus(props: ProductProps, isWishlistStatus: boolean): Product {
    return new Product({
      ...props,
      isWishlistStatus: isWishlistStatus,
    });
  }

  // Method to toggle wishlist status
  public toggleWishlist(): Product {
    return Product.create({
      ...this.toProps(),
      isWishlistStatus: !this.isWishlistStatus,
      wishlistCount: this.isWishlistStatus ? this.wishlistCount - 1 : this.wishlistCount + 1,
      updatedAt: new Date(),
    });
  }

  // Method to add to wishlist
  public addToWishlist(): Product {
    if (this.isWishlistStatus) {
      return this; // Already in wishlist
    }
    return Product.create({
      ...this.toProps(),
      isWishlistStatus: true,
      wishlistCount: this.wishlistCount + 1,
      updatedAt: new Date(),
    });
  }

  // Method to remove from wishlist
  public removeFromWishlist(): Product {
    if (!this.isWishlistStatus) {
      return this; // Not in wishlist
    }
    return Product.create({
      ...this.toProps(),
      isWishlistStatus: false,
      wishlistCount: this.wishlistCount - 1,
      updatedAt: new Date(),
    });
  }

  // Business rule validation
  private validate(): void {
    if (!this.name) throw new Error('Product name is required');
    if (this.price < 0) throw new Error('Price cannot be negative');
    if (this.stock < 0) throw new Error('Stock cannot be negative');
    if (this.wishlistCount < 0) throw new Error('Wishlist count cannot be negative');
  }
}
```

#### `src/domain/interfaces/IProductRepository.ts` (Step 1.2)

**Repository Interface**: Defines the contract `IProductRepository` for data persistence. Depends on Product Entity (1.1).

**🔥 DETAILED REPOSITORY INTERFACE EXPLANATION:**

_<u>**Repository Interface Design:**</u>_

- **Purpose:** Defines a contract for product data persistence operations
- **Design Pattern:** Repository Pattern - abstracts data access layer
- **Dependency Inversion:** High-level modules depend on abstractions, not implementations
- **Layer:** Domain layer interface for infrastructure implementations

_<u>**ProductFilter Interface:**</u>_

- **Purpose:** Provides flexible querying capabilities for product data
- **Fields:**
  - `category?: string` - Filter products by category
  - `search?: string` - Full-text search in name and description
  - `isActive?: boolean` - Filter by active/inactive status
  - `isWishlistStatus?: boolean` - Filter by wishlist status (wishlist integration)
- **Benefits:** Enables comprehensive product filtering across all repository methods

_<u>**IProductRepository Interface Methods:**</u>_

- **`create(product: Product): Promise<Product>`**
  - Creates a new product in the data store
  - Returns the created product with generated ID
  - Promise-based for asynchronous operations
  - Maintains wishlist field integrity during creation
- **`findById(id: string): Promise<Product | null>`**
  - Retrieves a single product by unique identifier
  - Returns null if product not found (null object pattern)
  - Includes all wishlist fields in returned product
- **`findAll(filter?: ProductFilter, skip?: number, limit?: number): Promise<Product[]>`**
  - Retrieves multiple products with optional filtering and pagination
  - Supports wishlist filtering via ProductFilter parameter
  - Implements pagination with skip/limit parameters
  - Returns empty array if no products match criteria
- **`update(product: Product): Promise<Product>`**
  - Updates an existing product in the data store
  - Handles wishlist status changes and count updates
  - Returns the updated product entity
  - Maintains data consistency during updates
- **`delete(id: string): Promise<boolean>`**
  - Removes a product from the data store
  - Returns boolean indicating success/failure
  - Idempotent operation (safe to call multiple times)
- **`count(filter?: ProductFilter): Promise<number>`**
  - Counts products matching optional filter criteria
  - Supports wishlist status counting
  - Used for pagination metadata and analytics

_<u>**Design Patterns Applied:**</u>_

- **Repository Pattern:** Abstracts data access layer from business logic
- **Dependency Inversion Principle:** High-level modules depend on abstractions
- **Interface Segregation Principle:** Focused interface for product operations
- **Null Object Pattern:** Returns null instead of throwing for not-found cases

_<u>**Dependencies:**</u>_

- **Product Entity (Step 1.1):** Uses Product type for all method signatures
- **No external dependencies:** Pure domain layer abstraction

_<u>**Integration Points:**</u>_

- **Implemented by:** MongoProductRepository (Step 2.2)
- **Used by:** ProductService (Step 1.3) and all use cases
- **Enables:** Multiple repository implementations (MongoDB, SQL, etc.)

_<u>**Benefits:**</u>_

- **Loose Coupling:** Business logic independent of data storage technology
- **Testability:** Easy to mock for unit testing
- **Flexibility:** Supports multiple storage backends
- **Maintainability:** Clear contract for all product data operations
- **Extensibility:** Easy to add new query methods as needed
- **Type Safety:** Full TypeScript type definitions for all operations

_<u>**Wishlist Integration:**</u>_

- **Filter Support:** `isWishlistStatus` field in ProductFilter enables wishlist queries
- **Data Consistency:** All methods maintain wishlist field integrity
- **Counting:** `count()` method supports wishlist product counting
- **Flexibility:** Wishlist filtering integrated with other filter criteria

_<u>**Usage Example:**</u>_

```typescript
// Using the repository interface in a use case
class ListProductsUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY)
    private productRepository: IProductRepository
  ) {}

  async execute(filter?: ProductFilter): Promise<Product[]> {
    // Find all products with optional filtering
    return this.productRepository.findAll(filter);
  }

  async getWishlistProducts(): Promise<Product[]> {
    // Find all products in wishlist
    return this.productRepository.findAll({ isWishlistStatus: true });
  }
}
```

```typescript
// Import the Product entity for type definitions
import { Product } from '../entities/Product';

// Filter interface for product queries
export interface ProductFilter {
  category?: string; // Filter by product category
  search?: string; // Full-text search in name and description
  isActive?: boolean; // Filter by active/inactive status
  isWishlistStatus?: boolean; // Filter by wishlist status
}

// Repository interface defining the data persistence contract
export interface IProductRepository {
  create(product: Product): Promise<Product>; // Create a new product
  findById(id: string): Promise<Product | null>; // Find product by ID
  findAll(filter?: ProductFilter, skip?: number, limit?: number): Promise<Product[]>; // Find products with pagination
  update(product: Product): Promise<Product>; // Update existing product
  delete(id: string): Promise<boolean>; // Delete product by ID
  count(filter?: ProductFilter): Promise<number>; // Count products matching filter
}
```

#### `src/domain/services/ProductService.ts` (Step 1.3)

**Product Service**: Business logic for product operations. Depends on Product Entity (1.1).

**🔥 DETAILED PRODUCT SERVICE EXPLANATION:**

_<u>**Service Class Design:**</u>_

- **Purpose:** Encapsulates core business logic for product operations
- **Design Pattern:** Service Pattern - separates business logic from data access
- **Layer:** Domain layer service for business rule enforcement
- **Dependency Injection:** Uses `@injectable()` decorator for DI container integration

_<u>**Class Structure:**</u>_

- **Decorator:** `@injectable()` enables dependency injection
- **Methods:** Focused business operations with validation
- **Dependencies:** Product Entity for type definitions and operations
- **Immutability:** All methods return new Product instances

_<u>**Core Business Methods:**</u>_

- **`updateStock(product: Product, quantity: number): Product`**
  - Updates product stock quantity with business rule validation
  - **Validation:** Prevents negative stock values
  - **Business Rule:** Throws error if insufficient stock
  - **Returns:** New Product instance with updated stock and timestamp
  - **Use Case:** Inventory management, order processing

- **`updatePrice(product: Product, newPrice: number): Product`**
  - Updates product price with business rule validation
  - **Validation:** Prevents negative price values
  - **Business Rule:** Ensures price changes are valid
  - **Returns:** New Product instance with updated price and timestamp
  - **Use Case:** Pricing adjustments, promotions, discounts

- **`updateDetails(product: Product, updates: Partial<ProductProps>): Product`**
  - Updates multiple product attributes simultaneously
  - **Validation:** Leverages Product entity validation
  - **Business Rule:** Maintains data consistency across updates
  - **Returns:** New Product instance with updated attributes and timestamp
  - **Use Case:** Product catalog updates, bulk edits

- **`updateWishlistStatus(product: Product, isWishlistStatus: boolean): Product`**
  - Updates product wishlist status with business logic
  - **Validation:** Ensures proper wishlist state transitions
  - **Business Rule:** Automatically updates wishlist count
  - **Returns:** New Product instance with updated wishlist status and count
  - **Use Case:** Wishlist management, user preferences

_<u>**Helper Methods:**</u>_

- **`toProps(product: Product): ProductProps`**
  - Converts Product entity to ProductProps interface
  - **Purpose:** Facilitates entity manipulation and creation
  - **Returns:** Complete ProductProps object for factory methods
  - **Use:** Internal helper for all update operations

_<u>**Design Patterns Applied:**</u>_

- **Service Pattern:** Encapsulates business logic in dedicated class
- **Dependency Injection:** Enables loose coupling and testability
- **Single Responsibility Principle:** Focused on product business operations
- **Immutable Pattern:** All operations return new instances
- **Factory Method Pattern:** Uses Product.create() for entity creation

_<u>**Business Rules Enforcement:**</u>_

- **Stock Validation:** Prevents negative inventory levels
- **Price Validation:** Ensures non-negative pricing
- **Data Consistency:** Maintains proper timestamps on updates
- **Wishlist Logic:** Handles wishlist count increments/decrements
- **Immutability:** Prevents accidental data modification

_<u>**Dependencies:**</u>_

- **Product Entity (Step 1.1):** Uses Product and ProductProps types
- **No external dependencies:** Pure domain layer implementation

_<u>**Integration Points:**</u>_

- **Used by:** UpdateProductUseCase (Step 4.2) and other use cases
- **Enables:** Centralized business logic across application
- **Supports:** Multiple use cases with consistent rules

_<u>**Benefits:**</u>_

- **Centralized Logic:** Business rules in one place
- **Reusability:** Used by multiple use cases and controllers
- **Testability:** Easy to unit test with mock entities
- **Maintainability:** Clear separation of business concerns
- **Consistency:** Ensures uniform business rule enforcement
- **Extensibility:** Easy to add new business operations
- **Framework Independence:** Pure domain logic without framework dependencies

_<u>**Wishlist Integration:**</u>_

- **Dedicated Method:** `updateWishlistStatus()` handles wishlist operations
- **Automatic Counting:** Wishlist count management built into logic
- **Validation:** Ensures proper wishlist state transitions
- **Consistency:** Integrated with other product update operations
- **Business Rules:** Prevents invalid wishlist operations

_<u>**Usage Example:**</u>_

```typescript
// Using ProductService in a use case
class UpdateProductUseCase {
  constructor(private productService: ProductService) {}

  async updateWishlistStatus(product: Product, isWishlistStatus: boolean): Promise<Product> {
    // Use the service to update wishlist status with business logic
    return this.productService.updateWishlistStatus(product, isWishlistStatus);
  }

  async updatePriceWithValidation(product: Product, newPrice: number): Promise<Product> {
    // Use the service to update price with validation
    return this.productService.updatePrice(product, newPrice);
  }
}
```

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
   * Updates product wishlist status with validation
   */
  public updateWishlistStatus(product: Product, isWishlistStatus: boolean): Product {
    return Product.create({
      ...this.toProps(product),
      isWishlistStatus: isWishlistStatus,
      wishlistCount: isWishlistStatus ? product.wishlistCount + 1 : product.wishlistCount - 1,
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
      isWishlistStatus: product.isWishlistStatus,
      wishlistCount: product.wishlistCount,
    };
  }
}
```

---

### 💾 _Step 2: Infrastructure Layer (Steps 2.1-2.2)_

#### `src/infrastructure/models/ProductModel.ts` (Step 2.1)

**MongoDB Product Schema**: Optimized MongoDB schema with text indexes for search. No dependencies.

**🔥 DETAILED MONGODB SCHEMA EXPLANATION:**

_<u>**Schema Design:**</u>_

- **Purpose:** Defines MongoDB document structure for product data persistence
- **Design Pattern:** Repository Pattern - database schema for persistence layer
- **Layer:** Infrastructure layer implementation
- **Database:** MongoDB with Mongoose ODM

_<u>**Document Interface (IProductDocument):**</u>_

- **Purpose:** Extends Mongoose Document interface with TypeScript typing
- **Fields:**
  - Core properties: name, description, price, stock, category
  - Optional properties: images, isActive
  - Auto-generated: createdAt, updatedAt
  - Wishlist properties: isWishlistStatus, wishlistCount
- **Type Safety:** Full TypeScript interface for document operations

_<u>**Schema Definition:**</u>_

- **Field Validation:**
  - Required fields: name, description, price, stock, category
  - Non-negative constraints: price, stock, wishlistCount
  - Default values: images (empty array), isActive (true), wishlist fields
- **Data Types:**
  - String: name, description, category
  - Number: price, stock, wishlistCount
  - Boolean: isActive, isWishlistStatus
  - Array: images (string URLs)
  - Date: createdAt, updatedAt (auto-managed)
- **Special Features:**
  - Auto-trimming for string fields
  - Auto-generated timestamps
  - Proper type validation at database level

_<u>**Indexing Strategy:**</u>_

- **Text Index:** Full-text search on name and description fields
- **Category Index:** Efficient filtering by product category
- **Performance:** Optimized query performance for common operations
- **Search:** Enables powerful text-based product discovery

_<u>**Design Patterns Applied:**</u>_

- **Repository Pattern:** Database schema for persistence operations
- **Data Mapping Pattern:** Converts between domain and database models
- **Validation Pattern:** Schema-level data validation
- **Active Record Pattern:** Document-based data access

_<u>**Dependencies:**</u>_

- **None:** Pure infrastructure layer implementation
- **External:** Mongoose, MongoDB driver

_<u>**Integration Points:**</u>_

- **Used by:** MongoProductRepository (Step 2.2)
- **Enables:** Efficient data storage and retrieval
- **Supports:** All CRUD operations with proper validation

_<u>**Benefits:**</u>_

- **Data Integrity:** Schema validation prevents invalid data
- **Performance:** Proper indexing for efficient queries
- **Type Safety:** Full TypeScript coverage
- **Maintainability:** Clear schema definition
- **Extensibility:** Easy to add new fields
- **Search:** Full-text search capabilities

_<u>**Wishlist Integration:**</u>_

- **Schema Fields:** isWishlistStatus (boolean), wishlistCount (number)
- **Validation:** Non-negative wishlistCount constraint
- **Default Values:** isWishlistStatus defaults to false, wishlistCount to 0
- **Indexing:** Wishlist fields included in query optimization
- **Data Consistency:** Proper type validation for wishlist operations

_<u>**Usage Example:**</u>_

```typescript
// Creating a product document with wishlist data
const newProduct = new ProductModel({
  name: 'Premium Headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  price: 299.99,
  stock: 150,
  category: 'Electronics',
  images: ['https://example.com/headphones.jpg'],
  isActive: true,
  isWishlistStatus: true, // Product starts in wishlist
  wishlistCount: 5, // 5 users have this in their wishlist
});

// Querying products in wishlist
const wishlistProducts = await ProductModel.find({
  isWishlistStatus: true,
  wishlistCount: { $gt: 0 },
}).sort({ wishlistCount: -1 }); // Most popular first
```

```typescript
// Import Mongoose for MongoDB schema definition and document typing
import mongoose, { Schema, Document } from 'mongoose';

// Extended Document interface for Product documents with TypeScript typing
export interface IProductDocument extends Document {
  name: string; // Product name (required, indexed)
  description: string; // Product description (required, full-text searchable)
  price: number; // Product price (required, min: 0)
  stock: number; // Available stock quantity (required, min: 0)
  category: string; // Product category (required, indexed for filtering)
  images: string[]; // Product image URLs (default: empty array)
  isActive: boolean; // Product active status (default: true)
  createdAt: Date; // Creation timestamp (auto-generated)
  updatedAt: Date; // Last update timestamp (auto-generated)
}

// MongoDB Schema definition with validation rules and indexes
const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true }, // Required field with text indexing
    description: { type: String, required: true }, // Required field with text indexing
    price: { type: Number, required: true, min: 0 }, // Non-negative price validation
    stock: { type: Number, required: true, min: 0 }, // Non-negative stock validation
    category: { type: String, required: true, index: true }, // Indexed for efficient filtering
    images: { type: [String], default: [] }, // Array of image URLs
    isActive: { type: Boolean, default: true }, // Default to active products
    isWishlistStatus: { type: Boolean, default: false }, // Default to not in wishlist
    wishlistCount: { type: Number, default: 0, min: 0 }, // Non-negative wishlist count
  },
  {
    timestamps: true, // Auto-manage createdAt and updatedAt
  }
);

// Full-text search indexes for name and description fields
ProductSchema.index({ name: 'text', description: 'text' });

// Create and export Mongoose model for Product collection
export const ProductModel = mongoose.model<IProductDocument>('Product', ProductSchema);
```

#### `src/infrastructure/repositories/MongoProductRepository.ts` (Step 2.2)

**MongoProductRepository**: Concrete implementation of IProductRepository interface. Depends on Product (1.1), IProductRepository (1.2), ProductModel (2.1).

**🔥 DETAILED REPOSITORY IMPLEMENTATION EXPLANATION:**

_<u>**Repository Class Design:**</u>_

- **Purpose:** Implements data persistence contract defined by IProductRepository
- **Design Pattern:** Repository Pattern - concrete implementation
- **Layer:** Infrastructure layer data access
- **Dependency Injection:** Uses `@injectable()` decorator for DI container

_<u>**Class Structure:**</u>_

- **Decorator:** `@injectable()` enables dependency injection
- **Implements:** IProductRepository interface contract
- **Dependencies:** ProductModel for database operations
- **Methods:** Complete CRUD operations with error handling

_<u>**Core Repository Methods:**</u>_

- **`create(product: Product): Promise<Product>`**
  - Maps domain entity to MongoDB document structure
  - Creates new document in MongoDB collection
  - Converts MongoDB document back to domain entity
  - Returns created Product entity with generated ID
  - **Validation:** Ensures all required fields are present
  - **Error Handling:** Proper error propagation

- **`findById(id: string): Promise<Product | null>`**
  - Finds single product by unique identifier
  - Returns null if product not found (null object pattern)
  - Converts MongoDB document to domain entity
  - **Validation:** Checks for valid ID format
  - **Error Handling:** Returns null for invalid/missing documents

- **`findAll(filter?: ProductFilter, skip?: number, limit?: number): Promise<Product[]>`**
  - Retrieves multiple products with filtering and pagination
  - Builds MongoDB query from ProductFilter criteria
  - Supports wishlist filtering via filter parameter
  - Implements pagination with skip/limit
  - Returns empty array if no products match
  - **Query Building:** Dynamic filter construction
  - **Performance:** Efficient pagination implementation

- **`update(product: Product): Promise<Product>`**
  - Updates existing product in database
  - Handles wishlist status changes and count updates
  - Returns updated Product entity
  - **Validation:** Ensures product ID exists
  - **Error Handling:** Throws error if product not found
  - **Data Consistency:** Maintains proper timestamps

- **`delete(id: string): Promise<boolean>`**
  - Removes product from database
  - Returns boolean indicating success/failure
  - Idempotent operation (safe to call multiple times)
  - **Validation:** Validates ID format
  - **Error Handling:** Returns false for non-existent products

- **`count(filter?: ProductFilter): Promise<number>`**
  - Counts products matching filter criteria
  - Supports wishlist status counting
  - Used for pagination metadata
  - **Query Building:** Same filter logic as findAll
  - **Performance:** Optimized count operation

_<u>**Query Building Logic:**</u>_

- **Filter Construction:** Dynamic MongoDB filter from ProductFilter
  - Category filtering: `filter.category`
  - Active status filtering: `filter.isActive`
  - Wishlist status filtering: `filter.isWishlistStatus`
  - Full-text search: `filter.search` using MongoDB text index
- **Pagination:** Skip/limit parameters for efficient data retrieval
- **Performance:** Optimized queries with proper indexing

_<u>**Data Mapping:**</u>_

- **`toDomain(doc: IProductDocument): Product`**
  - Converts MongoDB document to domain Product entity
  - Handles ObjectId to string conversion
  - Ensures proper field mapping
  - Maintains data consistency
  - **Error Handling:** Validates document structure
  - **Type Safety:** Proper TypeScript type conversion

_<u>**Design Patterns Applied:**</u>_

- **Repository Pattern:** Concrete implementation of data access
- **Dependency Injection:** Injectable repository class
- **Adapter Pattern:** Converts between domain and database models
- **Null Object Pattern:** Returns null instead of throwing for not-found
- **Factory Method Pattern:** Uses Product.create() for entity creation

_<u>**Dependencies:**</u>_

- **Product Entity (Step 1.1):** Uses Product type for domain operations
- **IProductRepository (Step 1.2):** Implements repository interface contract
- **ProductModel (Step 2.1):** Uses MongoDB schema and model

_<u>**Integration Points:**</u>_

- **Used by:** All use cases (Step 4.2) for data persistence
- **Enables:** Complete CRUD operations across application
- **Supports:** Multiple use cases with consistent data access

_<u>**Benefits:**</u>_

- **Loose Coupling:** Business logic independent of database technology
- **Testability:** Easy to mock for unit testing
- **Flexibility:** Can be replaced with different database implementations
- **Maintainability:** Clear separation of data access concerns
- **Extensibility:** Easy to add new query methods
- **Type Safety:** Full TypeScript type definitions
- **Error Handling:** Comprehensive error management

_<u>**Wishlist Integration:**</u>_

- **CRUD Operations:** All methods maintain wishlist field integrity
- **Filter Support:** Full wishlist filtering in findAll and count methods
- **Query Building:** Wishlist status integrated with other filters
- **Data Mapping:** Proper handling of wishlist fields in conversions
- **Consistency:** Wishlist operations follow same patterns as other fields

```typescript
// Import dependencies for dependency injection and domain interfaces
import { injectable } from 'tsyringe';
import { IProductRepository, ProductFilter } from '../../domain/interfaces/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { ProductModel, IProductDocument } from '../models/ProductModel';

// Injectable repository implementation for MongoDB
@injectable()
export class MongoProductRepository implements IProductRepository {
  /**
   * Creates a new product in MongoDB
   * @param product Product entity to create
   * @returns Promise with created Product entity
   */
  public async create(product: Product): Promise<Product> {
    // Map domain entity to MongoDB document structure
    const productData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: product.images,
      isActive: product.isActive,
      isWishlistStatus: product.isWishlistStatus,
      wishlistCount: product.wishlistCount,
    };

    // Create document in MongoDB and convert back to domain entity
    const createdDoc = await ProductModel.create(productData);
    return this.toDomain(createdDoc);
  }

  /**
   * Finds a product by ID
   * @param id Product ID to search for
   * @returns Promise with Product entity or null if not found
   */
  public async findById(id: string): Promise<Product | null> {
    if (!id) {
      return null; // Return null for invalid IDs
    }

    // Find document by ID and convert to domain entity
    const doc = await ProductModel.findById(id);
    if (!doc) {
      return null; // Return null if document not found
    }

    return this.toDomain(doc);
  }

  /**
   * Finds all products with optional filtering and pagination
   * @param filter Optional filter criteria
   * @param skip Number of records to skip (for pagination)
   * @param limit Maximum number of records to return
   * @returns Promise with array of Product entities
   */
  public async findAll(
    filter: ProductFilter = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<Product[]> {
    // Build MongoDB filter from ProductFilter criteria
    const mongoFilter: Record<string, unknown> = {};

    if (filter.category) {
      mongoFilter.category = filter.category; // Filter by category
    }
    if (filter.isActive !== undefined) {
      mongoFilter.isActive = filter.isActive; // Filter by active status
    }
    if (filter.isWishlistStatus !== undefined) {
      mongoFilter.isWishlistStatus = filter.isWishlistStatus; // Filter by wishlist status
    }
    if (filter.search) {
      mongoFilter.$text = { $search: filter.search }; // Full-text search
    }

    // Execute query with pagination and convert results to domain entities
    const docs = await ProductModel.find(mongoFilter).skip(skip).limit(limit);
    return docs.map((doc) => this.toDomain(doc));
  }

  /**
   * Updates an existing product
   * @param product Product entity with updates
   * @returns Promise with updated Product entity
   * @throws Error if product ID is missing or product not found
   */
  public async update(product: Product): Promise<Product> {
    if (!product.id) {
      throw new Error('Cannot update product without ID');
    }

    // Prepare update data with timestamp
    const updateData = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      images: product.images,
      isActive: product.isActive,
      isWishlistStatus: product.isWishlistStatus,
      wishlistCount: product.wishlistCount,
      updatedAt: new Date(), // Update timestamp
    };

    // Find and update document, return new version
    const updatedDoc = await ProductModel.findByIdAndUpdate(product.id, updateData, {
      new: true, // Return updated document
    });

    if (!updatedDoc) {
      throw new Error('Product not found for update');
    }

    return this.toDomain(updatedDoc);
  }

  /**
   * Deletes a product by ID
   * @param id Product ID to delete
   * @returns Promise with boolean indicating success
   */
  public async delete(id: string): Promise<boolean> {
    // Delete document and return success status
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result; // Convert to boolean
  }

  /**
   * Counts products matching optional filter criteria
   * @param filter Optional filter criteria
   * @returns Promise with count of matching products
   */
  public async count(filter: ProductFilter = {}): Promise<number> {
    // Build MongoDB filter from ProductFilter criteria
    const mongoFilter: Record<string, unknown> = {};

    if (filter.category) {
      mongoFilter.category = filter.category; // Filter by category
    }
    if (filter.isActive !== undefined) {
      mongoFilter.isActive = filter.isActive; // Filter by active status
    }
    if (filter.isWishlistStatus !== undefined) {
      mongoFilter.isWishlistStatus = filter.isWishlistStatus; // Filter by wishlist status
    }
    if (filter.search) {
      mongoFilter.$text = { $search: filter.search }; // Full-text search
    }

    // Return count of matching documents
    return ProductModel.countDocuments(mongoFilter);
  }

  /**
   * Converts MongoDB document to domain Product entity
   * @param doc MongoDB document
   * @returns Domain Product entity
   */
  private toDomain(doc: IProductDocument): Product {
    return Product.create({
      id: doc._id.toString(), // Convert ObjectId to string
      name: doc.name,
      description: doc.description,
      price: doc.price,
      stock: doc.stock,
      category: doc.category,
      images: doc.images,
      isActive: doc.isActive,
      isWishlistStatus: doc.isWishlistStatus,
      wishlistCount: doc.wishlistCount,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
```

---

### 📡 _Step 3: Interface Layer - DTOs/Validators (Steps 3.1-3.2)_

#### `src/interface/dtos/CreateProductDTO.ts` (Step 3.1)

**CreateProductDTO**: Data Transfer Object for creating new products. No dependencies.

**🔥 DETAILED DTO EXPLANATION:**

_<u>**DTO Design:**</u>_

- **Purpose:** Defines the contract for creating new product data
- **Design Pattern:** Data Transfer Object Pattern
- **Layer:** Interface layer for API communication
- **Validation:** TypeScript interface with runtime validation

_<u>**Interface Structure:**</u>_

- **Required Fields:**
  - `name: string` - Product name (min 3 characters)
  - `description: string` - Product description (min 10 characters)
  - `price: number` - Product price (non-negative)
  - `stock: number` - Initial stock quantity (non-negative integer)
  - `category: string` - Product category (min 1 character)
- **Optional Fields:**
  - `images?: string[]` - Product image URLs (validated as URLs)
  - `isActive?: boolean` - Product active status (default: true)

_<u>**Validation Rules:**</u>_

- **Name Validation:** Minimum 3 characters, required field
- **Description Validation:** Minimum 10 characters, required field
- **Price Validation:** Non-negative number, required field
- **Stock Validation:** Non-negative integer, required field
- **Category Validation:** Minimum 1 character, required field
- **Images Validation:** Array of valid URLs if provided
- **Active Status:** Boolean with default true if not provided

_<u>**Design Patterns Applied:**</u>_

- **Data Transfer Object Pattern:** Standardized data structure
- **Interface Segregation:** Focused on create operations
- **Type Safety:** Full TypeScript type definitions
- **Validation Pattern:** Runtime validation support

_<u>**Dependencies:**</u>_

- **None:** Pure interface layer definition
- **Integration:** Used by validators and controllers

_<u>**Integration Points:**</u>_

- **Used by:** ProductValidators (Step 3.2) for validation
- **Used by:** CreateProductUseCase (Step 4.2) for data transfer
- **Used by:** ProductController (Step 5.1) for API requests

_<u>**Benefits:**</u>_

- **Type Safety:** Full TypeScript coverage
- **Validation:** Clear field requirements
- **Documentation:** Self-documenting interface
- **Maintainability:** Easy to update and extend
- **Consistency:** Standardized data structure

_<u>**Usage Example:**</u>_

```typescript
const createProductData: CreateProductDTO = {
  name: 'Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  price: 199.99,
  stock: 50,
  category: 'Electronics',
  images: ['https://example.com/image1.jpg'],
  isActive: true,
};
```

```typescript
// Data Transfer Object for creating new products
export interface CreateProductDTO {
  name: string; // Product name (required, min 3 chars)
  description: string; // Product description (required, min 10 chars)
  price: number; // Product price (required, non-negative)
  stock: number; // Initial stock quantity (required, non-negative integer)
  category: string; // Product category (required, min 1 char)
  images?: string[]; // Product image URLs (optional, validated as URLs)
  isActive?: boolean; // Product active status (optional, default: true)
}
```

#### `src/interface/dtos/UpdateProductDTO.ts` (Step 3.1)

**UpdateProductDTO**: Data Transfer Object for updating existing products. No dependencies.

**🔥 DETAILED DTO EXPLANATION:**

_<u>**DTO Design:**</u>_

- **Purpose:** Defines the contract for updating existing product data
- **Design Pattern:** Data Transfer Object Pattern
- **Layer:** Interface layer for API communication
- **Validation:** TypeScript interface with runtime validation
- **Flexibility:** All fields optional for partial updates

_<u>**Interface Structure:**</u>_

- **Optional Fields:**
  - `name?: string` - Product name (min 3 characters if provided)
  - `description?: string` - Product description (min 10 characters if provided)
  - `price?: number` - Product price (non-negative if provided)
  - `stock?: number` - Stock quantity (non-negative integer if provided)
  - `category?: string` - Product category (min 1 character if provided)
  - `images?: string[]` - Product image URLs (validated as URLs if provided)
  - `isActive?: boolean` - Product active status (optional)

_<u>**Validation Rules:**</u>_

- **Name Validation:** Minimum 3 characters if provided
- **Description Validation:** Minimum 10 characters if provided
- **Price Validation:** Non-negative number if provided
- **Stock Validation:** Non-negative integer if provided
- **Category Validation:** Minimum 1 character if provided
- **Images Validation:** Array of valid URLs if provided
- **Active Status:** Boolean field for product status

_<u>**Design Patterns Applied:**</u>_

- **Data Transfer Object Pattern:** Standardized data structure for updates
- **Interface Segregation:** Focused on update operations
- **Type Safety:** Full TypeScript type definitions
- **Validation Pattern:** Runtime validation support
- **Partial Update Pattern:** All fields optional for flexibility

_<u>**Dependencies:**</u>_

- **None:** Pure interface layer definition
- **Integration:** Used by validators and controllers

_<u>**Integration Points:**</u>_

- **Used by:** ProductValidators (Step 3.2) for validation
- **Used by:** UpdateProductUseCase (Step 4.2) for data transfer
- **Used by:** ProductController (Step 5.1) for API requests

_<u>**Benefits:**</u>_

- **Type Safety:** Full TypeScript coverage
- **Validation:** Clear field requirements
- **Documentation:** Self-documenting interface
- **Maintainability:** Easy to update and extend
- **Consistency:** Standardized data structure
- **Flexibility:** Supports partial updates efficiently

_<u>**Usage Example:**</u>_

```typescript
const updateProductData: UpdateProductDTO = {
  name: 'Updated Wireless Headphones',
  price: 179.99,
  stock: 75,
  isActive: false,
};
```

```typescript
// Data Transfer Object for updating existing products (all fields optional)
export interface UpdateProductDTO {
  name?: string; // Product name (optional, min 3 chars if provided)
  description?: string; // Product description (optional, min 10 chars if provided)
  price?: number; // Product price (optional, non-negative if provided)
  stock?: number; // Stock quantity (optional, non-negative integer if provided)
  category?: string; // Product category (optional, min 1 char if provided)
  images?: string[]; // Product image URLs (optional, validated as URLs if provided)
  isActive?: boolean; // Product active status (optional)
}
```

#### `src/interface/dtos/ProductResponseDTO.ts` (Step 3.1)

**ProductResponseDTO**: Data Transfer Object for product API responses. No dependencies.

**🔥 DETAILED DTO EXPLANATION:**

_<u>**DTO Design:**</u>_

- **Purpose:** Defines the contract for product API response data
- **Design Pattern:** Data Transfer Object Pattern
- **Layer:** Interface layer for API communication
- **Validation:** TypeScript interface with runtime validation
- **Completeness:** Includes all product fields for comprehensive responses

_<u>**Interface Structure:**</u>_

- **Required Fields:**
  - `id: string` - Product unique identifier
  - `name: string` - Product name
  - `description: string` - Product description
  - `price: number` - Product price
  - `stock: number` - Available stock quantity
  - `category: string` - Product category
  - `images: string[]` - Product image URLs
  - `isActive: boolean` - Product active status
  - `createdAt: Date` - Creation timestamp
  - `updatedAt: Date` - Last update timestamp
  - `isWishlistStatus: boolean` - Wishlist status
  - `wishlistCount: number` - Number of users who added this to wishlist

_<u>**Validation Rules:**</u>_

- **ID Validation:** Valid string identifier
- **Name Validation:** Non-empty string
- **Description Validation:** Non-empty string
- **Price Validation:** Non-negative number
- **Stock Validation:** Non-negative integer
- **Category Validation:** Non-empty string
- **Images Validation:** Array of strings (URLs)
- **Status Validation:** Boolean values
- **Timestamp Validation:** Valid Date objects
- **Wishlist Validation:** Non-negative wishlist count

_<u>**Design Patterns Applied:**</u>_

- **Data Transfer Object Pattern:** Standardized response structure
- **Interface Segregation:** Focused on response operations
- **Type Safety:** Full TypeScript type definitions
- **Validation Pattern:** Runtime validation support
- **Complete Data Pattern:** Includes all relevant product information

_<u>**Dependencies:**</u>_

- **None:** Pure interface layer definition
- **Integration:** Used by controllers and API responses

_<u>**Integration Points:**</u>_

- **Used by:** ProductController (Step 5.1) for API responses
- **Used by:** All use cases that return product data
- **Used by:** API consumers for data consumption

_<u>**Benefits:**</u>_

- **Type Safety:** Full TypeScript coverage
- **Validation:** Clear field requirements
- **Documentation:** Self-documenting interface
- **Maintainability:** Easy to update and extend
- **Consistency:** Standardized response structure
- **Completeness:** Includes all necessary product information

_<u>**Usage Example:**</u>_

```typescript
const productResponse: ProductResponseDTO = {
  id: '507f1f77bcf86cd799439011',
  name: 'Wireless Headphones',
  description: 'High-quality wireless headphones with noise cancellation',
  price: 199.99,
  stock: 50,
  category: 'Electronics',
  images: ['https://example.com/image1.jpg'],
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-15'),
  isWishlistStatus: false,
  wishlistCount: 0,
};
```

```typescript
// Data Transfer Object for product API responses
export interface ProductResponseDTO {
  id: string; // Product unique identifier
  name: string; // Product name
  description: string; // Product description
  price: number; // Product price
  stock: number; // Available stock quantity
  category: string; // Product category
  images: string[]; // Product image URLs
  isActive: boolean; // Product active status
  createdAt: Date; // Creation timestamp
  updatedAt: Date; // Last update timestamp
  isWishlistStatus: boolean; // Wishlist status
  wishlistCount: number; // Number of users who added this to wishlist
}
```

#### `src/interface/validators/ProductValidators.ts` (Step 3.2)

**ProductValidators**: Zod-based runtime validation for API requests. Depends on DTOs (Step 3.1).

**🔥 DETAILED VALIDATOR EXPLANATION:**

_<u>**Validator Design:**</u>_

- **Purpose:** Provides comprehensive runtime validation for all API requests
- **Design Pattern:** Validation Pattern - ensures data integrity at API boundaries
- **Layer:** Interface layer for request validation
- **Framework:** Zod-based schema validation with TypeScript integration
- **Integration:** Works with Express middleware for automatic validation

_<u>**Validation Schema Structure:**</u>_

- **Create Product Schema:** Validates all required fields for new product creation
- **Update Product Schema:** Validates optional fields for existing product updates
- **Get Product Schema:** Validates URL parameters for product retrieval
- **Request Validation:** Supports both body and parameter validation

_<u>**Validation Rules:**</u>_

- **Create Product Validation:**
  - Name: Required, minimum 3 characters
  - Description: Required, minimum 10 characters
  - Price: Required, non-negative number
  - Stock: Required, non-negative integer
  - Category: Required, minimum 1 character
  - Images: Optional, array of valid URLs
  - isActive: Optional, boolean value

- **Update Product Validation:**
  - All fields optional for partial updates
  - Same validation rules as create when fields are provided
  - ID: Required in URL parameters for product identification

- **Get Product Validation:**
  - ID: Required in URL parameters, valid string format

_<u>**Design Patterns Applied:**</u>_

- **Validation Pattern:** Comprehensive input validation at API boundaries
- **Adapter Pattern:** Converts between API requests and domain models
- **Single Responsibility Principle:** Focused solely on validation logic
- **Strategy Pattern:** Different validation strategies for different operations
- **Decorator Pattern:** Validation middleware decorates route handlers

_<u>**Dependencies:**</u>_

- **DTOs (Step 3.1):** Uses CreateProductDTO and UpdateProductDTO type definitions
- **Zod Library:** Runtime validation framework with TypeScript support

_<u>**Integration Points:**</u>_

- **Used by:** ProductController (Step 5.1) for request validation
- **Used by:** ProductRoutes (Step 5.2) via validateRequest middleware
- **Enables:** Automatic validation with clear error responses

_<u>**Benefits:**</u>_

- **Data Integrity:** Ensures all API inputs meet business requirements
- **Security:** Prevents invalid or malicious data from entering the system
- **Consistent Error Responses:** Standardized validation error format
- **Developer Experience:** Clear validation rules and error messages
- **Maintainability:** Centralized validation logic easy to update
- **Type Safety:** Full TypeScript integration with runtime validation

_<u>**Usage Example:**</u>_

```typescript
// In Express route with validation middleware
router.post(
  '/',
  validateRequest(createProductSchema), // Automatic validation
  productController.create
);

// Validation error response format
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 3 characters long"
    }
  ]
}
```

```typescript
// Import Zod for schema validation and runtime type checking
import { z } from 'zod';

/**
 * Validation schema for creating new products
 * 🛡️ Ensures all required fields are present and valid
 * 📋 Aligns with CreateProductDTO (Step 3.1)
 * @property {string} name - Product name (min 3 chars)
 * @property {string} description - Product description (min 10 chars)
 * @property {number} price - Non-negative product price
 * @property {number} stock - Non-negative stock quantity
 * @property {string} category - Product category (min 1 char)
 * @property {string[]} images - Optional array of valid URLs
 * @property {boolean} isActive - Optional active status
 */
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

/**
 * Validation schema for updating existing products
 * 🛡️ Validates both request body and URL parameters
 * 📋 Aligns with UpdateProductDTO (Step 3.1)
 * @property {string} name - Optional product name (min 3 chars if provided)
 * @property {string} description - Optional description (min 10 chars if provided)
 * @property {number} price - Optional non-negative price
 * @property {number} stock - Optional non-negative stock
 * @property {string} category - Optional category (min 1 char if provided)
 * @property {string[]} images - Optional array of valid URLs
 * @property {boolean} isActive - Optional active status
 * @property {string} id - Required product ID from URL params
 */
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
    id: z.string(), // 💡 Validates product ID from URL parameters
  }),
});

/**
 * Validation schema for retrieving products by ID
 * 🛡️ Ensures valid product ID format in URL parameters
 * @property {string} id - Required product ID from URL params
 */
export const getProductSchema = z.object({
  params: z.object({
    id: z.string(), // 💡 Validates product ID from URL parameters
  }),
});

// 💡 Usage: These schemas are used with validateRequest middleware in routes
// 💡 Example: validateRequest(createProductSchema) in productRoutes.ts
// 💡 Benefits: Automatic validation with clear error responses for API consumers
```

---

### 🔧 _Step 4.1: Shared Layer - Dependency Injection Tokens_

#### `src/shared/constants.ts` (Step 4.1 - Shared Layer)

**Shared Constants**: Dependency injection tokens for cross-cutting concerns.

**🔥 DETAILED SHARED CONSTANTS EXPLANATION:**

_<u>**Constants Design:**</u>_

- **Purpose:** Centralized management of cross-cutting concerns and dependency injection tokens
- **Design Pattern:** Constants Pattern - centralized configuration management
- **Layer:** Shared layer for cross-cutting concerns used across all architecture layers
- **Importance:** Critical for dependency injection setup before use cases can be implemented
- **Type Safety:** Full TypeScript coverage with `as const` assertion

_<u>**DI_TOKENS Object:**</u>_

- **Purpose:** Provides dependency injection tokens for loose coupling between layers
- **Structure:**
  - `PRODUCT_REPOSITORY: 'ProductRepository'` - Injection token for product repository
  - Extensible design for future module tokens
- **Benefits:**
  - Enables dependency inversion principle implementation
  - Facilitates loose coupling between layers
  - Supports easy testing with mock implementations
  - Centralized token management

_<u>**Wishlist Constants:**</u>_

- **WISHLIST_CONSTANTS:** Defines limits and defaults for wishlist operations
  - `MAX_ITEMS_PER_USER: 100` - Maximum wishlist items per user
  - `MAX_ITEM_NAME_LENGTH: 100` - Maximum product name length in wishlist
  - `MAX_ITEM_DESCRIPTION_LENGTH: 500` - Maximum product description length
  - `DEFAULT_WISHLIST_NAME: 'My Wishlist'` - Default wishlist name
  - `WISHLIST_EXPIRY_DAYS: 30` - Wishlist item expiry period
  - `MAX_WISHLIST_COUNT: 1000000` - Maximum wishlist count value
  - `MIN_WISHLIST_COUNT: 0` - Minimum wishlist count value

- **WISHLIST_ERRORS:** Standardized error messages for consistent API responses
  - `WISHLIST_ERROR: 'Wishlist operation failed'` - Generic wishlist error
  - `ALREADY_IN_WISHLIST: 'Product is already in wishlist'` - Duplicate addition error
  - `NOT_IN_WISHLIST: 'Product is not in wishlist'` - Removal from empty wishlist error
  - `WISHLIST_LIMIT_EXCEEDED: 'Wishlist limit exceeded'` - Maximum items exceeded error

_<u>**Product Constants:**</u>_

- **PRODUCT_CONSTANTS:** Comprehensive validation rules and defaults for product operations
  - Price constraints: `MIN_PRICE: 0`, `MAX_PRICE: 1000000`
  - Name constraints: `MIN_NAME_LENGTH: 3`, `MAX_NAME_LENGTH: 200`
  - Description constraints: `MAX_DESCRIPTION_LENGTH: 2000`
  - Stock constraints: `MIN_STOCK: 0`, `MAX_STOCK: 100000`
  - Wishlist constraints: `MIN_WISHLIST_COUNT: 0`, `MAX_WISHLIST_COUNT: 1000000`
  - User constraints: `MAX_WISHLIST_ITEMS_PER_USER: 100`
  - Default values: `DEFAULT_CATEGORY: 'general'`, `DEFAULT_WISHLIST_STATUS: false`

_<u>**Validation Rules:**</u>_

- **VALIDATION_RULES:** Regex patterns for comprehensive data validation
  - `WISHLIST_NAME_REGEX: /^[a-zA-Z0-9\s\-_]{3,50}$/` - Wishlist name validation
  - `WISHLIST_ITEM_NAME_REGEX: /^[a-zA-Z0-9\s\-_,.!]{3,100}$/` - Wishlist item name validation

_<u>**Design Patterns Applied:**</u>_

- **Constants Pattern:** Centralized configuration management
- **Dependency Inversion Principle:** High-level modules depend on abstractions via DI tokens
- **Single Responsibility Principle:** Focused on cross-cutting concerns management
- **Type Safety Pattern:** Full TypeScript type definitions with `as const`

_<u>**Dependencies:**</u>_

- **None:** Pure shared layer implementation with no external dependencies

_<u>**Integration Points:**</u>_

- **Used by:** All use cases (Step 4.2) for constructor injection
- **Used by:** DI container configuration (Step 6.2) for dependency registration
- **Used by:** All layers for consistent validation and configuration
- **Enables:** Loose coupling, testability, and centralized configuration

_<u>**Benefits:**</u>_

- **Centralized Configuration:** Single source of truth for all constants
- **Type Safety:** Full TypeScript coverage with proper type inference
- **Consistency:** Uniform validation rules and error messages across application
- **Maintainability:** Easy to update and extend with new constants
- **Testability:** Supports mocking and testing with consistent configurations
- **Extensibility:** Designed for easy addition of new modules and features
- **Documentation:** Self-documenting constant definitions

_<u>**Usage Example:**</u>_

```typescript
// Using DI_TOKENS in use case constructor injection
@Injectable()
export class CreateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
  ) {}
}

// Using validation constants in business logic
if (wishlistItems.length > WISHLIST_CONSTANTS.MAX_ITEMS_PER_USER) {
  throw new Error(WISHLIST_ERRORS.WISHLIST_LIMIT_EXCEEDED);
}

// Using product constants for validation
if (price < PRODUCT_CONSTANTS.MIN_PRICE || price > PRODUCT_CONSTANTS.MAX_PRICE) {
  throw new Error('Price must be within valid range');
}
```

```typescript
// DI Container Tokens for Dependency Injection
// These tokens enable loose coupling between layers through dependency injection
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository', // Injection token for product repository
  // Future tokens can be added here for other modules
} as const;

// Wishlist Constants
export const WISHLIST_CONSTANTS = {
  MAX_ITEMS_PER_USER: 100,
  MAX_ITEM_NAME_LENGTH: 100,
  MAX_ITEM_DESCRIPTION_LENGTH: 500,
  DEFAULT_WISHLIST_NAME: 'My Wishlist',
  WISHLIST_EXPIRY_DAYS: 30,
  MAX_WISHLIST_COUNT: 1000000,
  MIN_WISHLIST_COUNT: 0,
};

// Wishlist Error Messages
export const WISHLIST_ERRORS = {
  WISHLIST_ERROR: 'Wishlist operation failed',
  ALREADY_IN_WISHLIST: 'Product is already in wishlist',
  NOT_IN_WISHLIST: 'Product is not in wishlist',
  WISHLIST_LIMIT_EXCEEDED: 'Wishlist limit exceeded',
};

export const PRODUCT_CONSTANTS = {
  MIN_PRICE: 0,
  MAX_PRICE: 1000000,
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  DEFAULT_CATEGORY: 'general',
  MIN_STOCK: 0,
  MAX_STOCK: 100000,
  MIN_WISHLIST_COUNT: 0,
  MAX_WISHLIST_COUNT: 1000000,
  MAX_WISHLIST_ITEMS_PER_USER: 100,
  DEFAULT_WISHLIST_STATUS: false,
};

export const VALIDATION_RULES = {
  WISHLIST_NAME_REGEX: /^[a-zA-Z0-9\s\-_]{3,50}$/,
  WISHLIST_ITEM_NAME_REGEX: /^[a-zA-Z0-9\s\-_,.!]{3,100}$/,
};

// 💡 Type Safety: The 'as const' assertion makes the object deeply readonly
// 💡 This enables better type inference and prevents accidental modifications
// 💡 Use Cases will import and use these tokens for constructor injection
```

> **🔥 DETAILED WISHLIST EXPLANATION:**
>
> **Wishlist Feature Overview:**
>
> - **Purpose:** Enables users to save products for future reference and purchase
> - **Implementation:** Integrated throughout all layers following Clean Architecture principles
> - **Key Components:** Product entity extensions, repository filters, controller methods, API routes
>
> **Wishlist Constants (Lines 960-977):**
>
> - **WISHLIST_CONSTANTS:** Defines limits and defaults for wishlist operations
> - **WISHLIST_ERRORS:** Standardized error messages for consistent API responses
> - **PRODUCT_CONSTANTS:** Extended with wishlist-specific validation rules
> - **VALIDATION_RULES:** Regex patterns for wishlist data validation
>
> **Product Entity Enhancements (Lines 356-448):**
>
> - **ProductProps Interface:** Added `isWishlistStatus` and `wishlistCount` fields
> - **Wishlist Methods:** `toggleWishlist()`, `addToWishlist()`, `removeFromWishlist()`
> - **Validation:** Ensures wishlist count remains non-negative
> - **Immutable Design:** All methods return new Product instances
>
> **Repository Layer Updates:**
>
> - **ProductFilter Interface:** Added `isWishlistStatus` filter option (Line 465)
> - **MongoDB Schema:** Added wishlist fields with proper validation (Lines 605-606)
> - **Repository Methods:** Updated create, update, findAll, and count methods
> - **Filter Integration:** Full support for wishlist filtering in queries
>
> **Service Layer Enhancements (Lines 537-546):**
>
> - **ProductService:** Added `updateWishlistStatus()` method
> - **Business Logic:** Handles wishlist count increments/decrements
> - **Validation:** Ensures proper wishlist state transitions
>
> **Controller Layer Additions (Lines 1418-1497):**
>
> - **Wishlist Methods:** `addToWishlist()`, `removeFromWishlist()`, `getWishlist()`
> - **Error Handling:** Proper error propagation and status codes
> - **Response Format:** Consistent JSON response structure
>
> **API Routes Implementation (Lines 1781-1893):**
>
> - **RESTful Endpoints:** POST, DELETE for individual products, GET for wishlist
> - **Swagger Documentation:** Complete OpenAPI annotations
> - **Route Structure:** `/api/products/{id}/wishlist` and `/api/products/wishlist`
>
> **Integration Points:**
>
> - **Dependency Flow:** All wishlist features follow proper Clean Architecture layers
> - **Filter Chain:** Wishlist filtering integrated with existing product filters
> - **Error Handling:** Consistent error responses across all wishlist operations
> - **Validation:** Comprehensive validation at all layers
>
> **Benefits:**
>
> - **User Experience:** Easy product saving and management
> - **Performance:** Efficient filtering and pagination
> - **Maintainability:** Clean separation of concerns
> - **Extensibility:** Easy to add new wishlist features
> - **Documentation:** Complete Swagger API documentation
> - **Testing:** All components designed for easy testing
>
> **Implementation Notes:**
>
> - **Immutable Pattern:** All wishlist operations return new Product instances
> - **Validation:** Comprehensive validation at every layer
> - **Error Handling:** Standardized error messages and status codes
> - **Security:** Proper input validation and sanitization
> - **Performance:** Optimized database queries with proper indexing
> - **Documentation:** Complete code comments and Swagger annotations

---

### ⚙️ _Step 4.2: Application Layer - Use Cases Implementation_

#### `src/usecases/product/CreateProductUseCase.ts` (Step 4.2 - Application Layer)

**🔥 DETAILED USE CASE EXPLANATION:**

_<u>**Use Case Design:**</u>_

- **Purpose:** Encapsulates the business logic for creating new products
- **Design Pattern:** Use Case Pattern - separates business logic from delivery mechanisms
- **Layer:** Application layer for business rule orchestration
- **Dependency Injection:** Uses `@injectable()` decorator for DI container integration
- **Single Responsibility:** Focused solely on product creation operations

_<u>**Class Structure:**</u>_

- **Decorator:** `@injectable()` enables dependency injection
- **Constructor:** Uses `@inject()` decorator for constructor injection
- **Dependencies:** IProductRepository via DI_TOKENS for loose coupling
- **Main Method:** `execute()` handles the complete creation workflow
- **Error Handling:** Leverages domain entity validation for business rules

_<u>**Business Logic Flow:**</u>_

1. **Input Validation:** CreateProductDTO provides type-safe input structure
2. **Domain Entity Creation:** Product.create() factory method with validation
3. **Business Rule Enforcement:** Domain entity validates all business constraints
4. **Data Persistence:** Repository abstraction handles database operations
5. **Return Result:** Persisted product entity returned to caller

_<u>**Key Business Rules:**</u>_

- **Validation:** All product data validated by domain entity
- **Immutability:** Domain entity ensures data consistency
- **Type Safety:** Full TypeScript coverage throughout workflow
- **Error Handling:** Domain entity throws errors for invalid data
- **Dependency Inversion:** Use case depends on abstractions, not implementations

_<u>**Integration Points:**</u>_

- **Input:** CreateProductDTO (Step 3.1) for type-safe data transfer
- **Output:** Product entity (Step 1.1) as domain model
- **Persistence:** IProductRepository (Step 1.2) for data storage
- **DI Tokens:** DI_TOKENS (Step 4.1) for dependency injection
- **Controller:** ProductController (Step 5.1) for HTTP integration

_<u>**Dependencies:**</u>_

- **CreateProductDTO (Step 3.1):** Type-safe input data structure
- **IProductRepository (Step 1.2):** Data persistence abstraction
- **Product Entity (Step 1.1):** Domain model with business rules
- **DI_TOKENS (Step 4.1):** Dependency injection tokens

_<u>**Benefits:**</u>_

- **Separation of Concerns:** Business logic independent of delivery mechanisms
- **Testability:** Easy to test with mock repository dependencies
- **Flexibility:** Can be used with different delivery mechanisms (HTTP, CLI, etc.)
- **Maintainability:** Clear, focused business logic easy to understand
- **Reusability:** Can be reused across different parts of the application
- **Framework Independence:** Pure business logic without framework dependencies

_<u>**Usage Example:**</u>_

```typescript
// Controller integration
const createProductUseCase = container.resolve(CreateProductUseCase);
const product = await createProductUseCase.execute({
  name: 'Wireless Headphones',
  description: 'High-quality wireless headphones',
  price: 199.99,
  stock: 50,
  category: 'Electronics',
});

// Testing with mock repository
const mockRepository: IProductRepository = {
  create: jest.fn().mockResolvedValue(mockProduct),
};
const useCase = new CreateProductUseCase(mockRepository);
const result = await useCase.execute(createProductDTO);
```

**CreateProductUseCase**: Business logic for product creation.

```typescript
// Import dependencies for dependency injection and domain objects
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '../../../domain/interfaces/IProductRepository';
import { CreateProductDTO } from '../../../interface/dtos/CreateProductDTO';
import { Product } from '../../../domain/entities/Product';
import { DI_TOKENS } from '../../../shared/constants';

/**
 * Use case for creating new products
 * Handles the business logic for product creation
 * 🔧 Depends on: DI_TOKENS.PRODUCT_REPOSITORY (Step 4.1)
 * 📋 Uses: CreateProductDTO (Step 3.1)
 * 🏗️ Implements: Business logic orchestration between layers
 */
@injectable()
export class CreateProductUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
  ) {}

  /**
   * Executes the product creation process
   * @param dto CreateProductDTO containing product data
   * @returns Promise with created Product entity
   * 🔧 Flow: DTO → Domain Entity → Repository → Persisted Entity
   * 📋 Business Rules: Enforced by domain entity validation
   */
  public async execute(dto: CreateProductDTO): Promise<Product> {
    // Create domain entity from DTO using factory method
    // 💡 Business Rule: Domain entity handles its own validation
    // 💡 This ensures business rules are enforced consistently
    const product = Product.create({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stock: dto.stock,
      category: dto.category,
      images: dto.images,
      isActive: dto.isActive,
    });

    // Persist product using repository
    // 💡 Dependency Inversion: Use Cases depend on abstractions (interfaces)
    // 💡 This enables switching database implementations without changing business logic
    return this.productRepository.create(product);
  }
}

// 💡 Usage: This use case is injected into ProductController (Step 5.1)
// 💡 Benefits: Clean separation of concerns, easy testing, framework independence
// 💡 Testing: Can be tested in isolation by mocking the repository dependency
```

#### `src/usecases/product/ListProductsUseCase.ts` (Step 4.2 - Application Layer)

**🔥 DETAILED USE CASE EXPLANATION:**

_<u>**Use Case Design:**</u>_

- **Purpose:** Encapsulates the business logic for listing products with pagination and filtering
- **Design Pattern:** Use Case Pattern - separates business logic from delivery mechanisms
- **Layer:** Application layer for business rule orchestration
- **Dependency Injection:** Uses `@injectable()` decorator for DI container integration
- **Single Responsibility:** Focused solely on product listing operations

_<u>**Class Structure:**</u>_

- **Decorator:** `@injectable()` enables dependency injection
- **Constructor:** Uses `@inject()` decorator for constructor injection
- **Dependencies:** IProductRepository via DI_TOKENS for loose coupling
- **Main Method:** `execute()` handles the complete listing workflow
- **Error Handling:** Leverages domain entity validation for business rules

_<u>**Business Logic Flow:**</u>_

1. **Query Parameter Processing:** Validates and converts query parameters to proper types
2. **Pagination Logic:** Calculates skip/limit values with safe defaults
3. **Filter Construction:** Builds comprehensive filter object from query parameters
4. **Parallel Execution:** Runs repository queries in parallel for performance
5. **Result Aggregation:** Combines paginated results with total count

_<u>**Key Business Rules:**</u>_

- **Pagination Safety:** Maximum limit of 100 items per page to prevent DoS attacks
- **Type Conversion:** Proper conversion of string parameters to boolean/number types
- **Filter Integration:** Support for category, search, active status, and wishlist filtering
- **Performance Optimization:** Parallel query execution for faster responses
- **Data Consistency:** Proper handling of undefined/null query parameters

_<u>**Integration Points:**</u>_

- **Input:** ListProductsQuery interface for type-safe query parameters
- **Output:** Product array with total count for pagination metadata
- **Persistence:** IProductRepository (Step 1.2) for data retrieval
- **DI Tokens:** DI_TOKENS (Step 4.1) for dependency injection
- **Controller:** ProductController (Step 5.1) for HTTP integration

_<u>**Dependencies:**</u>_

- **ListProductsQuery:** Custom interface for query parameter handling
- **IProductRepository (Step 1.2):** Data persistence abstraction
- **Product Entity (Step 1.1):** Domain model with business rules
- **DI_TOKENS (Step 4.1):** Dependency injection tokens

_<u>**Benefits:**</u>_

- **Separation of Concerns:** Business logic independent of delivery mechanisms
- **Testability:** Easy to test with mock repository dependencies
- **Flexibility:** Can be used with different delivery mechanisms (HTTP, CLI, etc.)
- **Maintainability:** Clear, focused business logic easy to understand
- **Reusability:** Can be reused across different parts of the application
- **Framework Independence:** Pure business logic without framework dependencies
- **Performance:** Parallel query execution for optimal response times

_<u>**Usage Example:**</u>_

```typescript
// Controller integration
const listProductsUseCase = container.resolve(ListProductsUseCase);
const { products, total } = await listProductsUseCase.execute({
  page: '2',
  limit: '20',
  category: 'Electronics',
  isWishlistStatus: 'true',
});

// Testing with mock repository
const mockRepository: IProductRepository = {
  findAll: jest.fn().mockResolvedValue([mockProduct]),
  count: jest.fn().mockResolvedValue(1),
};
const useCase = new ListProductsUseCase(mockRepository);
const result = await useCase.execute({ category: 'Electronics' });
```

**ListProductsUseCase**: Business logic for product listing with pagination.

```typescript
// Import dependencies for dependency injection and domain objects
import { injectable, inject } from 'tsyringe';
import { IProductRepository, ProductFilter } from '../../../domain/interfaces/IProductRepository';
import { Product } from '../../../domain/entities/Product';
import { DI_TOKENS } from '../../../shared/constants';

/**
 * Query parameters for listing products with filtering
 * 📋 Defines the contract for API query parameters
 * 💡 Includes validation and type conversion logic
 */
export interface ListProductsQuery {
  page?: string; // Page number for pagination (default: 1)
  limit?: string; // Items per page (max 100, default: 10)
  category?: string; // Category filter for product categorization
  search?: string; // Full-text search query for name/description
  isActive?: string; // Active status filter (string converted to boolean)
}

/**
 * Use case for listing products with pagination and filtering
 * 🔧 Depends on: DI_TOKENS.PRODUCT_REPOSITORY (Step 4.1)
 * 📋 Handles: Complex query processing and pagination
 * 🏗️ Implements: Efficient data retrieval with parallel queries
 */
@injectable()
export class ListProductsUseCase {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository
    // 💡 Dependency Injection: Repository is injected via DI_TOKENS
    // 💡 This enables loose coupling and easy testing
  ) {}

  /**
   * Executes product listing with optional filters and pagination
   * @param query ListProductsQuery with filter and pagination parameters
   * @returns Promise with products array and total count
   * 🔧 Flow: Query → Filter → Repository → Paginated Results
   * 📋 Business Rules: Safe defaults, type conversion, and validation
   */
  public async execute(query: ListProductsQuery): Promise<{ products: Product[]; total: number }> {
    // Parse and validate pagination parameters with safe defaults
    // 💡 Business Rule: Prevent excessive page sizes (max 100)
    // 💡 Security: Protect against potential DoS attacks with large limits
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    // Build filter object from query parameters
    // 💡 Business Rule: Convert string parameters to proper types
    // 💡 Type Safety: Ensure proper typing for repository operations
    const filter: ProductFilter = {};
    if (query.category) {
      filter.category = query.category; // Filter by category
    }
    if (query.search) {
      filter.search = query.search; // Full-text search
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true'; // Convert string to boolean
    }
    if (query.isWishlistStatus !== undefined) {
      filter.isWishlistStatus = query.isWishlistStatus === 'true'; // Convert string to boolean
    }

    // Execute parallel queries for efficiency
    // 💡 Performance: Parallel execution reduces total response time
    // 💡 Benefits: Faster API responses for better user experience
    const [products, total] = await Promise.all([
      this.productRepository.findAll(filter, skip, limit), // Get paginated products
      this.productRepository.count(filter), // Get total count for pagination
    ]);

    return { products, total };
  }
}

// 💡 Usage: This use case is injected into ProductController (Step 5.1)
// 💡 Benefits: Efficient data retrieval, proper pagination, comprehensive filtering
// 💡 Testing: Can be tested by mocking repository and verifying query parameters
// 💡 Integration: Used for GET /products endpoint with optional filters
```

#### `src/usecases/product/UpdateProductUseCase.ts` (Step 4.2 - Application Layer)

**🔥 DETAILED USE CASE EXPLANATION:**

_<u>**Use Case Design:**</u>_

- **Purpose:** Encapsulates the business logic for updating existing products
- **Design Pattern:** Use Case Pattern - separates business logic from delivery mechanisms
- **Layer:** Application layer for business rule orchestration
- **Dependency Injection:** Uses `@injectable()` decorator for DI container integration
- **Single Responsibility:** Focused solely on product update operations

_<u>**Class Structure:**</u>_

- **Decorator:** `@injectable()` enables dependency injection
- **Constructor:** Uses `@inject()` decorator for constructor injection
- **Dependencies:** IProductRepository and ProductService for comprehensive update operations
- **Main Method:** `execute()` handles the complete update workflow
- **Error Handling:** Proper error handling for non-existent products

_<u>**Business Logic Flow:**</u>_

1. **Product Retrieval:** Fetches existing product from repository
2. **Existence Validation:** Throws error if product not found
3. **Field-Specific Updates:** Applies updates to specific fields as needed
4. **Business Rule Enforcement:** Uses ProductService for validated updates
5. **Data Persistence:** Saves updated product back to repository

_<u>**Key Business Rules:**</u>_

- **Existence Validation:** Ensures product exists before attempting updates
- **Field-Specific Logic:** Different update strategies for different field types
- **Stock Management:** Calculates stock differences for proper inventory tracking
- **Partial Updates:** Supports updating only specified fields
- **Data Consistency:** Maintains proper timestamps and validation throughout

_<u>**Integration Points:**</u>_

- **Input:** UpdateProductDTO (Step 3.1) for type-safe update data
- **Output:** Updated Product entity with all changes applied
- **Persistence:** IProductRepository (Step 1.2) for data storage
- **Business Logic:** ProductService (Step 1.3) for validated updates
- **DI Tokens:** DI_TOKENS (Step 4.1) for dependency injection

_<u>**Dependencies:**</u>_

- **UpdateProductDTO (Step 3.1):** Type-safe input data structure
- **IProductRepository (Step 1.2):** Data persistence abstraction
- **ProductService (Step 1.3):** Business logic service for validated updates
- **DI_TOKENS (Step 4.1):** Dependency injection tokens

_<u>**Benefits:**</u>_

- **Separation of Concerns:** Business logic independent of delivery mechanisms
- **Testability:** Easy to test with mock repository and service dependencies
- **Flexibility:** Can be used with different delivery mechanisms (HTTP, CLI, etc.)
- **Maintainability:** Clear, focused business logic easy to understand
- **Reusability:** Can be reused across different parts of the application
- **Framework Independence:** Pure business logic without framework dependencies
- **Data Integrity:** Comprehensive validation and error handling

_<u>**Usage Example:**</u>_

```typescript
// Controller integration
const updateProductUseCase = container.resolve(UpdateProductUseCase);
const updatedProduct = await updateProductUseCase.execute('product-id', {
  price: 149.99,
  stock: 75,
  isActive: false,
});

// Testing with mock dependencies
const mockRepository: IProductRepository = {
  findById: jest.fn().mockResolvedValue(mockProduct),
  update: jest.fn().mockResolvedValue(updatedProduct),
};
const mockService = {
  updatePrice: jest.fn().mockReturnValue(priceUpdatedProduct),
  updateStock: jest.fn().mockReturnValue(stockUpdatedProduct),
  updateDetails: jest.fn().mockReturnValue(detailsUpdatedProduct),
};
const useCase = new UpdateProductUseCase(mockRepository, mockService);
const result = await useCase.execute('product-id', { price: 149.99 });
```

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

#### `src/usecases/product/GetProductUseCase.ts` (Step 4.2 - Application Layer)

**🔥 DETAILED USE CASE EXPLANATION:**

_<u>**Use Case Design:**</u>_

- **Purpose:** Encapsulates the business logic for retrieving individual products by unique identifier
- **Design Pattern:** Use Case Pattern - separates business logic from delivery mechanisms
- **Layer:** Application layer for business rule orchestration
- **Dependency Injection:** Uses `@injectable()` decorator for DI container integration
- **Single Responsibility:** Focused solely on product retrieval operations

_<u>**Class Structure:**</u>_

- **Decorator:** `@injectable()` enables dependency injection
- **Constructor:** Uses `@inject()` decorator for constructor injection
- **Dependencies:** IProductRepository via DI_TOKENS for loose coupling
- **Main Method:** `execute()` handles the complete retrieval workflow
- **Error Handling:** Leverages repository's null object pattern for not-found cases

_<u>**Business Logic Flow:**</u>_

1. **Input Validation:** Product ID validation handled by repository implementation
2. **Data Retrieval:** Repository abstraction handles database operations
3. **Business Rule Enforcement:** Repository validates ID format and existence
4. **Result Handling:** Returns Product entity or null for non-existent products
5. **Error Propagation:** Repository errors properly propagated to caller

_<u>**Key Business Rules:**</u>_

- **Null Object Pattern:** Returns null instead of throwing for non-existent products
- **Type Safety:** Full TypeScript coverage throughout workflow
- **Dependency Inversion:** Use case depends on abstractions, not implementations
- **Error Handling:** Proper error propagation from repository layer
- **Data Consistency:** Ensures proper data format and validation

_<u>**Integration Points:**</u>_

- **Input:** Product ID string for unique identification
- **Output:** Product entity (Step 1.1) or null for not-found cases
- **Persistence:** IProductRepository (Step 1.2) for data retrieval
- **DI Tokens:** DI_TOKENS (Step 4.1) for dependency injection
- **Controller:** ProductController (Step 5.1) for HTTP integration

_<u>**Dependencies:**</u>_

- **IProductRepository (Step 1.2):** Data persistence abstraction
- **Product Entity (Step 1.1):** Domain model with business rules
- **DI_TOKENS (Step 4.1):** Dependency injection tokens

_<u>**Benefits:**</u>_

- **Separation of Concerns:** Business logic independent of delivery mechanisms
- **Testability:** Easy to test with mock repository dependencies
- **Flexibility:** Can be used with different delivery mechanisms (HTTP, CLI, etc.)
- **Maintainability:** Clear, focused business logic easy to understand
- **Reusability:** Can be reused across different parts of the application
- **Framework Independence:** Pure business logic without framework dependencies
- **Error Handling:** Comprehensive error management with null object pattern

_<u>**Usage Example:**</u>_

```typescript
// Controller integration
const getProductUseCase = container.resolve(GetProductUseCase);
const product = await getProductUseCase.execute('product-id');

// Testing with mock repository
const mockRepository: IProductRepository = {
  findById: jest.fn().mockResolvedValue(mockProduct),
};
const useCase = new GetProductUseCase(mockRepository);
const result = await useCase.execute('product-id');
```

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

#### `src/usecases/product/DeleteProductUseCase.ts` (Step 4.2 - Application Layer)

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

### 📡 _Step 5: Interface Layer - Controllers/Routes (Steps 5.1-5.2)_

#### `src/interface/controllers/ProductController.ts` (Step 5.1)

**🔥 DETAILED CONTROLLER EXPLANATION:**

_<u>**Controller Design:**</u>_

- **Purpose:** HTTP adapter for product operations, handling request/response lifecycles
- **Design Pattern:** Controller Pattern - separates HTTP concerns from business logic
- **Layer:** Interface layer for API communication
- **Dependency Injection:** Uses `@injectable()` decorator for DI container integration
- **Single Responsibility:** Focused solely on HTTP request/response handling

_<u>**Class Structure:**</u>_

- **Decorator:** `@injectable()` enables dependency injection
- **Constructor:** Uses `@inject()` decorator for constructor injection
- **Dependencies:** All Product Use Cases (Step 4.2) for business logic execution
- **Methods:** Comprehensive CRUD operations with proper error handling
- **Error Handling:** Centralized error propagation to middleware

_<u>**Core Controller Methods:**</u>_

- **`create(req, res, next)`**
  - Handles POST requests for creating new products
  - **Flow:** Request → CreateProductUseCase → Response
  - **Status:** 201 Created on success
  - **Validation:** Leverages use case validation for business rules
  - **Response:** Standardized JSON format with created product data

- **`list(req, res, next)`**
  - Handles GET requests for listing products with pagination and filtering
  - **Flow:** Request → ListProductsUseCase → Response
  - **Status:** 200 OK on success
  - **Features:** Comprehensive pagination metadata, filter support
  - **Response:** Standardized JSON format with products array and metadata

- **`getOne(req, res, next)`**
  - Handles GET requests for retrieving individual products by ID
  - **Flow:** Request → GetProductUseCase → Response
  - **Status:** 200 OK on success, 404 Not Found if product doesn't exist
  - **Error Handling:** Proper handling of non-existent products
  - **Response:** Standardized JSON format with product data

- **`update(req, res, next)`**
  - Handles PUT requests for updating existing products
  - **Flow:** Request → UpdateProductUseCase → Response
  - **Status:** 200 OK on success
  - **Validation:** Leverages use case validation for business rules
  - **Response:** Standardized JSON format with updated product data

- **`delete(req, res, next)`**
  - Handles DELETE requests for removing products
  - **Flow:** Request → DeleteProductUseCase → Response
  - **Status:** 204 No Content on success, 404 Not Found if product doesn't exist
  - **Idempotency:** Safe to call multiple times
  - **Response:** Empty response with appropriate status code

_<u>**Wishlist Controller Methods:**</u>_

- **`addToWishlist(req, res, next)`**
  - Handles POST requests for adding products to wishlist
  - **Flow:** Request → UpdateProductUseCase → Response
  - **Status:** 200 OK on success
  - **Business Logic:** Sets isWishlistStatus to true via UpdateProductUseCase
  - **Response:** Standardized JSON format with updated product data

- **`removeFromWishlist(req, res, next)`**
  - Handles DELETE requests for removing products from wishlist
  - **Flow:** Request → UpdateProductUseCase → Response
  - **Status:** 200 OK on success
  - **Business Logic:** Sets isWishlistStatus to false via UpdateProductUseCase
  - **Response:** Standardized JSON format with updated product data

- **`getWishlist(req, res, next)`**
  - Handles GET requests for retrieving wishlist products
  - **Flow:** Request → ListProductsUseCase → Response
  - **Status:** 200 OK on success
  - **Filtering:** Uses isWishlistStatus filter parameter
  - **Response:** Standardized JSON format with products array and metadata

_<u>**Design Patterns Applied:**</u>_

- **Controller Pattern:** Handles HTTP request/response lifecycle
- **Dependency Injection:** Uses injected use cases for loose coupling
- **Single Responsibility Principle:** Focused on HTTP operations
- **Adapter Pattern:** Converts between HTTP and business logic layers
- **Middleware Pattern:** Uses Express middleware for error handling
- **Decorator Pattern:** Uses TypeScript decorators for dependency injection

_<u>**Dependencies:**</u>_

- **Product Use Cases (Step 4.2):** All CRUD and wishlist use cases
- **Express Types:** Request, Response, NextFunction for HTTP handling
- **tsyringe:** Dependency injection container and decorators

_<u>**Integration Points:**</u>_

- **Used by:** ProductRoutes (Step 5.2) for API endpoint routing
- **Uses:** All Product Use Cases (Step 4.2) for business logic execution
- **Enables:** RESTful API operations with proper validation and error handling
- **Supports:** Multiple delivery mechanisms through consistent interface

_<u>**Benefits:**</u>_

- **Separation of Concerns:** HTTP handling independent of business logic
- **Testability:** Easy to test with mock use case dependencies
- **Flexibility:** Can be adapted for different HTTP frameworks
- **Maintainability:** Clear, focused HTTP logic easy to understand
- **Reusability:** Can be reused across different API versions
- **Framework Independence:** Pure HTTP handling without business logic
- **Consistency:** Standardized response formats and error handling
- **Extensibility:** Easy to add new endpoints and features

_<u>**Usage Example:**</u>_

```typescript
// Route integration
const productController = container.resolve(ProductController);
router.post('/', validateRequest(createProductSchema), productController.create);
router.get('/', productController.list);
router.get('/:id', validateRequest(getProductSchema), productController.getOne);

// Testing with mock use cases
const mockCreateUseCase = {
  execute: jest.fn().mockResolvedValue(mockProduct),
};
const mockListUseCase = {
  execute: jest.fn().mockResolvedValue({ products: [mockProduct], total: 1 }),
};
const controller = new ProductController(
  mockCreateUseCase,
  mockGetUseCase,
  mockListUseCase,
  mockUpdateUseCase,
  mockDeleteUseCase
);
```

**Controller**: `ProductController` managing request/response lifecycles.

```typescript
// Import Express types and dependency injection decorators
import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
// Import all product use cases for dependency injection
import { CreateProductUseCase } from '../../usecases/product/CreateProductUseCase';
import { GetProductUseCase } from '../../usecases/product/GetProductUseCase';
import { ListProductsUseCase } from '../../usecases/product/ListProductsUseCase';
import { UpdateProductUseCase } from '../../usecases/product/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../usecases/product/DeleteProductUseCase';

/**
 * ProductController - HTTP adapter for product operations
 * 🔧 Depends on: All Product Use Cases (Step 4.2)
 * 📋 Implements: RESTful CRUD operations with proper error handling
 * 🏗️ Integrates: With productRoutes.ts (Step 5.2)
 */
@injectable()
export class ProductController {
  constructor(
    @inject(CreateProductUseCase) private createProductUseCase: CreateProductUseCase,
    @inject(GetProductUseCase) private getProductUseCase: GetProductUseCase,
    @inject(ListProductsUseCase) private listProductsUseCase: ListProductsUseCase,
    @inject(UpdateProductUseCase) private updateProductUseCase: UpdateProductUseCase,
    @inject(DeleteProductUseCase) private deleteProductUseCase: DeleteProductUseCase
    // 💡 Dependency Injection: All use cases injected via constructor
    // 💡 This enables loose coupling and easy testing
  ) {}

  /**
   * Creates a new product
   * @param req Express request with product data in body
   * @param res Express response with created product
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 201 Created on success
   */
  public create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with request body data
      const product = await this.createProductUseCase.execute(req.body);

      // Return success response with 201 status
      res.status(201).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };

  /**
   * Lists products with optional filtering and pagination
   * @param req Express request with query parameters
   * @param res Express response with product list and metadata
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 200 OK on success
   */
  public list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with query parameters for filtering/pagination
      const { products, total } = await this.listProductsUseCase.execute(req.query);

      // Return success response with metadata
      res.status(200).json({
        status: 'success',
        results: products.length, // Number of products in current page
        total, // Total number of products matching filter
        data: products,
      });
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };

  /**
   * Retrieves a single product by ID
   * @param req Express request with product ID in params
   * @param res Express response with product data
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 200 OK on success, 404 Not Found if product doesn't exist
   */
  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with product ID from URL params
      const product = await this.getProductUseCase.execute(req.params.id);

      // Handle not found case
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      // Return success response with product data
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };

  /**
   * Updates an existing product
   * @param req Express request with product ID in params and update data in body
   * @param res Express response with updated product
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 200 OK on success
   */
  public update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with product ID and update data
      const product = await this.updateProductUseCase.execute(req.params.id, req.body);

      // Return success response with updated product
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };

  /**
   * Deletes a product by ID
   * @param req Express request with product ID in params
   * @param res Express response (empty on success)
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 204 No Content on success, 404 Not Found if product doesn't exist
   */
  public delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with product ID
      const success = await this.deleteProductUseCase.execute(req.params.id);

      // Handle not found case
      if (!success) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found',
        });
      }

      // Return success response with 204 status (no content)
      res.status(204).send();
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };

  /**
   * Adds a product to wishlist
   * @param req Express request with product ID in params
   * @param res Express response with updated product
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 200 OK on success
   */
  public addToWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with product ID
      const product = await this.updateProductUseCase.execute(req.params.id, {
        isWishlistStatus: true,
      });

      // Return success response with updated product
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };

  /**
   * Removes a product from wishlist
   * @param req Express request with product ID in params
   * @param res Express response with updated product
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 200 OK on success
   */
  public removeFromWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with product ID
      const product = await this.updateProductUseCase.execute(req.params.id, {
        isWishlistStatus: false,
      });

      // Return success response with updated product
      res.status(200).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };

  /**
   * Gets all products in wishlist
   * @param req Express request with query parameters
   * @param res Express response with product list and metadata
   * @param next Express next function for error handling
   * 🔧 Flow: Request → Use Case → Response
   * 📋 Status: 200 OK on success
   */
  public getWishlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute use case with wishlist filter
      const { products, total } = await this.listProductsUseCase.execute({
        ...req.query,
        isWishlistStatus: 'true',
      });

      // Return success response with metadata
      res.status(200).json({
        status: 'success',
        results: products.length, // Number of products in current page
        total, // Total number of products in wishlist
        data: products,
      });
    } catch (error) {
      // Propagate errors to error handling middleware
      next(error);
    }
  };
}

// 💡 Usage: This controller is used by productRoutes.ts (Step 5.2)
// 💡 Benefits: Clean separation of concerns, easy testing, framework independence
// 💡 Testing: Can be tested by mocking use cases and verifying HTTP responses
// 💡 Integration: Injected into routes via DI container
```

---

#### `src/interface/routes/productRoutes.ts` (Step 5.2)

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

/**
 * @openapi
 * /api/products/{id}/wishlist:
 *   post:
 *     tags: [Products]
 *     summary: Add product to wishlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product added to wishlist successfully
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
 *       409:
 *         description: Product already in wishlist
 */
router.post('/:id/wishlist', productController.addToWishlist);

/**
 * @openapi
 * /api/products/{id}/wishlist:
 *   delete:
 *     tags: [Products]
 *     summary: Remove product from wishlist
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from wishlist successfully
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
 *       409:
 *         description: Product not in wishlist
 */
router.delete('/:id/wishlist', productController.removeFromWishlist);

/**
 * @openapi
 * /api/products/wishlist:
 *   get:
 *     tags: [Products]
 *     summary: Get all products in wishlist
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
 *     responses:
 *       200:
 *         description: List of wishlist products
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
router.get('/wishlist', productController.getWishlist);

export default router;
```

---

### ✅ _Step 6: Configuration Layer (Steps 6.1-6.3)_

#### `src/config/swagger.ts` (Step 6.1)

**🔥 DETAILED SWAGGER CONFIGURATION EXPLANATION:**

_<u>**Swagger Configuration Design:**</u>_

- **Purpose:** Centralized API documentation following OpenAPI 3.0 specification
- **Design Pattern:** Documentation Pattern - comprehensive API documentation
- **Layer:** Configuration layer for API documentation
- **Standard:** OpenAPI 3.0 specification for industry-standard documentation
- **Integration:** Designed to work with Swagger UI middleware

_<u>**Configuration Structure:**</u>_

- **OpenAPI Version:** 3.0.0 specification compliance
- **Info Section:** API metadata and contact information
- **Servers:** Development and production server definitions
- **Tags:** Organization of endpoints by functionality
- **Paths:** Endpoint definitions (referenced from route annotations)
- **Components:** Reusable schemas and response definitions
- **Schemas:** Data model definitions matching domain entities
- **Responses:** Standardized response format definitions

_<u>**Core Configuration Sections:**</u>_

- **`info` Object**
  - **Purpose:** Provides API metadata and identification
  - **Fields:** title, version, description, contact, license
  - **Benefits:** Clear API identification and support information
  - **Example:** JollyJet Product API v1.0.0 with MIT license

- **`servers` Array**
  - **Purpose:** Defines available API server environments
  - **Development Server:** http://localhost:3000 for local testing
  - **Production Server:** https://api.jollyjet.com for live environment
  - **Benefits:** Easy environment switching in Swagger UI

- **`tags` Array**
  - **Purpose:** Organizes endpoints by functional areas
  - **Products Tag:** Groups all product-related endpoints
  - **Benefits:** Logical grouping for better API exploration

- **`components.schemas` Object**
  - **Purpose:** Defines reusable data models and schemas
  - **Product Schema:** Complete model matching domain entity
  - **ErrorResponse Schema:** Standardized error response format
  - **Benefits:** DRY principle, consistent data definitions

- **`components.responses` Object**
  - **Purpose:** Defines standardized response formats
  - **SuccessResponse:** Standard success response format
  - **CreatedResponse:** Resource creation response format
  - **PaginatedResponse:** Paginated data response format
  - **Error Responses:** Standardized error response formats
  - **Benefits:** Consistent response structures across all endpoints

_<u>**Product Schema Details:**</u>_

- **Complete Domain Matching:** All fields match Product domain entity
- **Field Definitions:** Comprehensive property definitions with examples
- **Validation Rules:** Type constraints, minimum lengths, format specifications
- **Required Fields:** Explicit required field specification
- **Wishlist Integration:** isWishlistStatus and wishlistCount fields included
- **Timestamp Fields:** createdAt and updatedAt with date-time format

_<u>**Error Response Schema:**</u>_

- **Standardized Format:** Consistent error response structure
- **Status Field:** Response status indicator
- **Message Field:** Human-readable error message
- **Errors Array:** Detailed validation error information
- **Field-Specific Errors:** Individual field validation messages
- **Benefits:** Consistent error handling across API

_<u>**Response Schema Definitions:**</u>_

- **SuccessResponse:** Standard success format with data field
- **CreatedResponse:** Resource creation format with Product reference
- **PaginatedResponse:** Paginated data with metadata (results, total)
- **NotFoundResponse:** 404 error response format
- **ValidationErrorResponse:** 400 error response format
- **InternalServerErrorResponse:** 500 error response format

_<u>**Design Patterns Applied:**</u>_

- **Documentation Pattern:** Comprehensive API documentation
- **Single Source of Truth:** Documentation stays in sync with code
- **OpenAPI Standard:** Follows industry-standard documentation format
- **Component Reuse:** Schemas and responses defined once, used everywhere
- **Separation of Concerns:** Documentation separate from implementation
- **DRY Principle:** Avoids duplication through component references

_<u>**Dependencies:**</u>_

- **OpenAPIV3:** Type definitions for OpenAPI 3.0 specification
- **Product Entity:** Domain entity for schema reference
- **Product Routes:** Route annotations for path definitions

_<u>**Integration Points:**</u>_

- **Used by:** Swagger UI middleware for interactive documentation
- **References:** Product entity for accurate schema definitions
- **Enables:** Automatic API documentation generation
- **Supports:** Interactive API exploration and testing
- **Validates:** API contracts and specifications

_<u>**Benefits:**</u>_

- **Developer Experience:** Interactive API exploration via Swagger UI
- **Documentation Accuracy:** Always in sync with actual implementation
- **Standardization:** Follows industry-standard OpenAPI specification
- **Maintainability:** Centralized documentation easy to update
- **Testability:** Documentation can be validated using Swagger tools
- **Consistency:** Uniform documentation format across all endpoints
- **Discoverability:** Easy API exploration for developers and consumers
- **Contract Validation:** Clear API contracts for client development

_<u>**Usage Example:**</u>_

```typescript
// Swagger UI middleware integration
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './config/swagger';
import productRoutes from './interface/routes/productRoutes';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
app.use('/api/products', productRoutes);

// Documentation validation
const { validate } = require('swagger-parser');
validate(swaggerConfig)
  .then(() => console.log('Swagger documentation is valid'))
  .catch((err) => console.error('Swagger validation error:', err));
```

**Swagger Configuration**: Update Swagger configuration with Product API documentation. Depends on Product Routes (Step 5.2).

```typescript
// Import Swagger configuration utilities and types
import { OpenAPIV3 } from 'openapi-types';
import { Product } from '../domain/entities/Product';

// Swagger configuration object following OpenAPI 3.0 specification
const swaggerConfig: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'JollyJet Product API',
    version: '1.0.0',
    description:
      'Product Module API Documentation - Complete CRUD operations for product management',
    contact: {
      name: 'JollyJet API Support',
      email: 'support@jollyjet.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
    {
      url: 'https://api.jollyjet.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Products',
      description: 'Product management endpoints - CRUD operations for products',
    },
  ],
  paths: {
    // Product endpoints are defined in productRoutes.ts with detailed annotations
    // This configuration provides the overall structure and schema definitions
  },
  components: {
    schemas: {
      // Product Schema - Complete model definition matching domain entity
      Product: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique product identifier',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            description: 'Product name',
            example: 'Wireless Headphones',
            minLength: 3,
          },
          description: {
            type: 'string',
            description: 'Product description',
            example: 'High-quality wireless headphones with noise cancellation',
            minLength: 10,
          },
          price: {
            type: 'number',
            description: 'Product price (non-negative)',
            example: 199.99,
            minimum: 0,
          },
          stock: {
            type: 'integer',
            description: 'Available stock quantity (non-negative integer)',
            example: 50,
            minimum: 0,
          },
          category: {
            type: 'string',
            description: 'Product category',
            example: 'Electronics',
            minLength: 1,
          },
          images: {
            type: 'array',
            description: 'Product image URLs',
            items: {
              type: 'string',
              format: 'uri',
            },
            example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
          },
          isActive: {
            type: 'boolean',
            description: 'Product active status',
            example: true,
          },
          isWishlistStatus: {
            type: 'boolean',
            description: 'Wishlist status',
            example: false,
          },
          wishlistCount: {
            type: 'integer',
            description: 'Number of users who added this to wishlist',
            example: 0,
            minimum: 0,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
            example: '2023-01-01T00:00:00Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
            example: '2023-01-01T00:00:00Z',
          },
        },
        required: [
          'id',
          'name',
          'description',
          'price',
          'stock',
          'category',
          'isActive',
          'isWishlistStatus',
          'wishlistCount',
          'createdAt',
          'updatedAt',
        ],
      },
      // Error Response Schema - Standard error response format
      ErrorResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
            description: 'Response status',
          },
          message: {
            type: 'string',
            example: 'Product not found',
            description: 'Error message',
          },
          errors: {
            type: 'array',
            description: 'Detailed validation errors (if applicable)',
            items: {
              type: 'object',
              properties: {
                field: {
                  type: 'string',
                  example: 'name',
                },
                message: {
                  type: 'string',
                  example: 'Name must be at least 3 characters long',
                },
              },
            },
          },
        },
      },
    },
    // Response Schemas - Standard response formats
    responses: {
      SuccessResponse: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'success',
                },
                data: {
                  type: 'object',
                  description: 'Response data',
                },
              },
            },
          },
        },
      },
      CreatedResponse: {
        description: 'Resource created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'success',
                },
                data: {
                  $ref: '#/components/schemas/Product',
                },
              },
            },
          },
        },
      },
      PaginatedResponse: {
        description: 'Paginated response with metadata',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'success',
                },
                results: {
                  type: 'integer',
                  example: 10,
                  description: 'Number of items in current page',
                },
                total: {
                  type: 'integer',
                  example: 25,
                  description: 'Total number of items matching filter',
                },
                data: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Product',
                  },
                },
              },
            },
          },
        },
      },
      NotFoundResponse: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      ValidationErrorResponse: {
        description: 'Validation error - invalid request data',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
      InternalServerErrorResponse: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
    },
  },
};

// Export Swagger configuration for use in API documentation middleware
export default swaggerConfig;

// 💡 Usage: This configuration is used by Swagger UI middleware
// 💡 Benefits: Automatic API documentation, interactive exploration, standardized format
// 💡 Integration: Used with swagger-ui-express middleware in main application
// 💡 Maintenance: Centralized documentation that stays in sync with route annotations
// 💡 Testing: Documentation can be validated using Swagger tools and validators
```

#### `src/config/di-container.ts` (Step 6.2)

**🔥 DETAILED DI CONTAINER EXPLANATION:**

_<u>**DI Container Design:**</u>_

- **Purpose:** Centralized management of dependency injection for the entire application
- **Design Pattern:** Dependency Injection Pattern - enables loose coupling between components
- **Layer:** Configuration layer for dependency management
- **Framework:** tsyringe dependency injection container
- **Importance:** Critical for proper application initialization and component resolution

_<u>**Container Initialization:**</u>_

- **Function:** `initializeDIContainer()` - Central entry point for DI setup
- **Timing:** Called during application startup before any routes are processed
- **Responsibility:** Registers all product module dependencies in the DI container
- **Integration:** Must be called before any components that use dependency injection

_<u>**Dependency Registration:**</u>_

- **Repository Registration:**
  - **Token:** `DI_TOKENS.PRODUCT_REPOSITORY` - Injection token for product repository
  - **Implementation:** `MongoProductRepository` - Concrete MongoDB implementation
  - **Interface:** `IProductRepository` - Abstract interface for dependency inversion
  - **Binding:** Binds concrete implementation to abstract interface
  - **Benefits:** Enables loose coupling, easy testing with mocks, framework independence

- **Service Registration:**
  - **Automatic Registration:** ProductService uses `@injectable()` decorator
  - **No Manual Setup:** tsyringe automatically handles service registration
  - **Dependency Resolution:** Container automatically resolves service dependencies
  - **Benefits:** Reduces boilerplate code, ensures proper dependency resolution

_<u>**Design Patterns Applied:**</u>_

- **Dependency Injection Pattern:** Centralized dependency management
- **Inversion of Control:** Framework handles dependency resolution
- **Single Responsibility Principle:** Focused on dependency configuration
- **Factory Pattern:** Container acts as factory for component creation
- **Strategy Pattern:** Different implementations can be swapped via configuration

_<u>**Dependencies:**</u>_

- **MongoProductRepository (Step 2.2):** Concrete repository implementation
- **IProductRepository (Step 1.2):** Abstract repository interface
- **DI_TOKENS (Step 4.1):** Dependency injection tokens
- **ProductService (Step 1.3):** Business logic service with automatic registration

_<u>**Integration Points:**</u>_

- **Used by:** Application (Step 6.3) for dependency resolution
- **Enables:** Loose coupling between all application components
- **Supports:** Easy testing with mock implementations
- **Facilitates:** Framework independence and component swapping

_<u>**Benefits:**</u>_

- **Loose Coupling:** Components depend on abstractions, not implementations
- **Easy Testing:** Simple to mock dependencies for unit testing
- **Centralized Configuration:** Single place for all dependency management
- **Maintainability:** Easy to update and extend with new dependencies
- **Framework Independence:** Business logic independent of specific frameworks
- **Component Reusability:** Components can be reused across different contexts
- **Testability:** Supports comprehensive testing strategies

_<u>**Usage Example:**</u>_

```typescript
// Application startup
import { initializeDIContainer } from './config/di-container';
import app from './app';

// Initialize DI container before starting application
initializeDIContainer();

// Start application
app.listen(3000, () => {
  console.log('Server started with DI container initialized');
});

// Testing DI resolution
const container = require('tsyringe').container;
const repository = container.resolve<IProductRepository>(DI_TOKENS.PRODUCT_REPOSITORY);
const service = container.resolve(ProductService);
```

**DI Registration**: Register Product Repository and Service. Depends on constants (6.0), repository (2.2), and service (1.3).

```typescript
// Import DI container and dependencies for registration
import { container } from 'tsyringe';
import { MongoProductRepository } from '../infrastructure/repositories/MongoProductRepository';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { DI_TOKENS } from '../shared/constants';

/**
 * Initializes the Dependency Injection container
 * Registers all product module dependencies
 * 🎯 Purpose: Centralized dependency management
 * 📋 Components: Product Repository, Product Service
 * 🔧 Integration: Called during application startup
 */
export const initializeDIContainer = () => {
  // Register Product Repository implementation
  // 💡 Binds MongoProductRepository to IProductRepository interface
  // 💡 Enables loose coupling and easy testing with mocks
  container.register<IProductRepository>(DI_TOKENS.PRODUCT_REPOSITORY, {
    useClass: MongoProductRepository, // Use MongoDB implementation
  });

  // ProductService is automatically registered via @injectable decorator
  // 💡 No manual registration needed - tsyringe handles it
  // 💡 This enables automatic dependency injection for the service
};

// 💡 Usage: This function is called during application startup
// 💡 Benefits: Centralized dependency management, easy testing, loose coupling
// 💡 Integration: Called in main application initialization
// 💡 Maintenance: Easy to update and extend with new dependencies
// 💡 Testing: Can be tested by verifying proper dependency resolution
```

#### `src/app.ts` (Step 6.3)

**App Routing**: Mount `productRoutes` to `/api/products`. Depends on routes (5.2).

**🔥 DETAILED APPLICATION WIRING EXPLANATION:**

_<u>**Application Configuration Design:**</u>_

- **Purpose:** Centralized application configuration and initialization
- **Design Pattern:** Composition Pattern - integrates multiple components into cohesive application
- **Layer:** Configuration layer for application setup
- **Framework:** Express.js web application framework
- **Importance:** Final integration point for all application components

_<u>**Application Structure:**</u>_

- **Express Instance:** Central Express application object
- **Dependency Injection:** Initializes DI container before any routes
- **Middleware Chain:** Configures request processing pipeline
- **Route Integration:** Mounts all API routes under proper endpoints
- **Error Handling:** Centralized error handling middleware

_<u>**Core Application Components:**</u>_

- **`express()`** - Creates Express application instance
- **`initializeDIContainer()`** - Sets up dependency injection container
- **`express.json()`** - Middleware for JSON request body parsing
- **`requestLogger`** - Custom middleware for request logging
- **`productRoutes`** - Product module routes with wishlist endpoints
- **`errorHandler`** - Centralized error handling middleware

_<u>**Initialization Flow:**</u>_

1. **Express Setup:** Creates Express application instance
2. **DI Container:** Initializes dependency injection before routes
3. **Middleware:** Configures JSON parsing and request logging
4. **Route Mounting:** Integrates product routes under `/api/products`
5. **Error Handling:** Registers error handler after all routes
6. **Export:** Makes configured app available for server startup

_<u>**Wishlist Integration:**</u>_

- **Route Integration:** Mounts wishlist routes in main application
- **Middleware:** Ensures proper middleware for wishlist operations
- **Error Handling:** Comprehensive error handling for wishlist endpoints
- **Request Logging:** Tracks wishlist operations for monitoring

_<u>**Design Patterns Applied:**</u>_

- **Composition Pattern:** Integrates multiple components into application
- **Middleware Pattern:** Uses Express middleware chain for request processing
- **Single Responsibility Principle:** Focused on application configuration
- **Dependency Injection Pattern:** Initializes DI container for component resolution
- **Factory Pattern:** Express app acts as factory for request handling

_<u>**Dependencies:**</u>_

- **Routes (Step 5.2):** Uses productRoutes with wishlist endpoints
- **DI Container (Step 6.2):** Depends on initialized dependency injection
- **Middleware:** Uses requestLogger and errorHandler for request processing
- **Express:** Core web framework for HTTP server functionality

_<u>**Integration Points:**</u>_

- **Used by:** server.ts for application startup and server creation
- **Enables:** Complete application integration with all components
- **Supports:** Multiple route modules through consistent mounting
- **Facilitates:** Easy addition of new routes and middleware

_<u>**Benefits:**</u>_

- **Modular Integration:** Easy to add new routes and features
- **Centralized Configuration:** Single place for application setup
- **Proper Error Handling:** Consistent error management across application
- **Clean Architecture:** Separates configuration from business logic
- **Maintainability:** Easy to update and extend with new components
- **Testability:** Can be tested by importing and calling Express app
- **Framework Independence:** Business logic independent of Express specifics

_<u>**Usage Example:**</u>_

```typescript
// Server startup integration
import app from './app';
import { createServer } from 'http';

const server = createServer(app);
server.listen(3000, () => {
  console.log('Server started on port 3000');
});

// Testing application configuration
const request = require('supertest');
describe('Application Configuration', () => {
  it('should mount product routes', async () => {
    const response = await request(app).get('/api/products');
    expect(response.status).toBe(200);
  });
});
```

```typescript
// Import product routes for API endpoints
import express from 'express';
import productRoutes from './interface/routes/productRoutes';
import { initializeDIContainer } from './config/di-container';
import { errorHandler } from './interface/middlewares/errorHandler';
import { requestLogger } from './interface/middlewares/requestLogger';

// Create Express application instance
const app = express();

// Initialize dependency injection container
// 💡 Must be called before any routes that use DI
initializeDIContainer();

// Configure Express middleware
app.use(express.json()); // JSON request body parsing
app.use(requestLogger); // Request logging middleware

// Mount product routes under /api/products endpoint
// 💡 Integrates all product CRUD operations
app.use('/api/products', productRoutes);

// Configure error handling middleware
// 💡 Must be registered after all routes
app.use(errorHandler);

// Export configured application for server startup
export default app;

// 💡 Usage: This application is started by server.ts
// 💡 Benefits: Modular route integration, centralized configuration
// 💡 Testing: Can be tested by importing and calling the Express app
// 💡 Integration: Final step in application initialization
// 💡 Maintenance: Easy to update and extend with new routes
// 💡 Wishlist: Includes wishlist endpoints and proper error handling
// 💡 Middleware: Comprehensive request processing pipeline
// 💡 DI Container: Proper dependency injection initialization
```

---

## ✅ _Verification Plan_

---

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
curl -X POST http://localhost:3000/api/products -H "Content-Type: application/json" -d '{"name": "Test Product", "description": "A test product description", "price": 99.99, "stock": 100, "category": "Electronics"}'

# List Products
curl http://localhost:3000/api/products

# Get Product by ID
curl http://localhost:3000/api/products/{id}

# Update Product
curl -X PUT http://localhost:3000/api/products/{id} -H "Content-Type: application/json" -d '{"price": 89.99}'

# Delete Product
curl -X DELETE http://localhost:3000/api/products/{id}

# Toggle Product Wishlist Status
curl -X PATCH http://localhost:3000/api/products/{id}/wishlist -H "Content-Type: application/json" -d '{"isWishlistStatus": true}'

# Get All Wishlist Products
curl http://localhost:3000/api/products/wishlist

# Get All Wishlist Products with Pagination
curl "http://localhost:3000/api/products/wishlist?page=1&limit=5"
```

---

## 🏗️ _Clean Architecture Layers_

---

```
┌─────────────────────────────────────────┐
│    🟢 Configuration Layer (Setup)         │
│  📄 swagger.ts, di-container.ts, app.ts │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    🟡 Interface Layer (API)              │
│  📡 controllers/ routes/ validators/    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    🔵 Use Cases Layer (Business)         │
│  ⚙️ usecases/ (application)             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    🟣 Domain Layer (Core Business)       │
│  💎 entities/ interfaces/ services/     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    🟠 Infrastructure Layer (External)    │
│  💾 models/ repositories/               │
└─────────────────────────────────────────┘
```

---

## 🚀 _Next Steps_

---

- ✅ **Step 1.1**: Implement domain entities
- ✅ **Step 1.2**: Define repository interface
- ✅ **Step 1.3**: Implement business logic service
- ✅ **Step 2.1**: Create MongoDB schema
- ✅ **Step 2.2**: Implement repository
- ✅ **Step 3.1**: Create DTOs
- ✅ **Step 3.2**: Implement validators
- ✅ **Step 4.1**: Add shared constants (DI_TOKENS)
- ✅ **Step 4.2**: Implement use cases
- ✅ **Step 5.1**: Build controller
- ✅ **Step 5.2**: Set up routes
- ✅ **Step 6.1**: Document API endpoints in Swagger
- ✅ **Step 6.2**: Update DI container configuration
- ✅ **Step 6.3**: Update application wiring

---

## 💎 _DETAILED STEPS EXPLANATION_

---

**🔥 DETAILED STEP 1.1 EXPLANATION: CREATE PRODUCT ENTITY**

The Product Entity implementation (`Product.ts`) forms the core of the domain layer, defining the fundamental business rules and data structure for products in the JollyJet e-commerce system.

**Key Entity Components:**

1. **ProductProps Interface**: Comprehensive TypeScript interface defining all product attributes:
   - Required fields: name, description, price, stock, category
   - Optional fields: images, isActive, createdAt, updatedAt
   - Wishlist integration: isWishlistStatus, wishlistCount fields
   - Type safety: Full TypeScript coverage with proper typing

2. **Immutable Product Class**: Business rule enforcement with immutability:
   - Private constructor enforcing factory method pattern
   - Readonly properties preventing direct modification
   - Factory method: createProduct()
   - Wishlist properties: isWishlistStatus, wishlistCount
   - Comprehensive validation in private validate() method

3. **Business Rule Implementation**:
   - Name validation: Required field with auto-trimming
   - Price validation: Non-negative constraint
   - Stock validation: Non-negative constraint
   - Wishlist validation: Count cannot be negative
   - Data consistency: Automatic timestamp management

4. **Wishlist Feature Integration**:
   - Boolean flag for wishlist status tracking
   - Counter for wishlist popularity tracking
   - Automatic count management in wishlist operations
   - Immutable pattern ensuring data consistency

**Implementation Benefits:**

- Type Safety: Full TypeScript coverage with IDE support
- Immutability: Prevents accidental data modification
- Validation: Business rules enforced at entity level
- Extensibility: Easy to add new properties
- Testability: Pure functions with no side effects

**🔥 DETAILED STEP 1.2 EXPLANATION: DEFINE REPOSITORY INTERFACE**

The repository interface (`IProductRepository`) is a critical component in the Clean Architecture implementation, serving as the contract between the domain layer and infrastructure layer. This interface defines all data persistence operations for products while maintaining complete independence from any specific database technology.

**Key Aspects of the Repository Interface:**

1. **Dependency Inversion Principle**: The interface allows the domain layer to define what data operations it needs without knowing how they're implemented. This enables the infrastructure layer to provide concrete implementations (like MongoDB, SQL, etc.) while keeping the business logic framework-agnostic.

2. **Comprehensive CRUD Operations**: The interface includes all essential operations:
   - `create(product: Product): Promise<Product>` - Persists new products
   - `findById(id: string): Promise<Product | null>` - Retrieves single products
   - `findAll(filter?: ProductFilter, skip?: number, limit?: number): Promise<Product[]>` - Supports filtered pagination
   - `update(product: Product): Promise<Product>` - Updates existing products
   - `delete(id: string): Promise<boolean>` - Removes products
   - `count(filter?: ProductFilter): Promise<number>` - Counts products for pagination

3. **Flexible Filtering System**: The `ProductFilter` interface enables sophisticated querying with support for:
   - Category filtering
   - Full-text search
   - Active/inactive status filtering
   - Wishlist status filtering
   - Extensible design for future filter requirements

4. **Type Safety and Validation**: Full TypeScript coverage ensures compile-time type checking, while the Promise-based design supports asynchronous operations with proper error handling.

5. **Wishlist Integration**: The interface includes wishlist-specific functionality through the filter system, allowing queries like "get all products in wishlist" without requiring separate methods.

**Implementation Benefits:**

- **Loose Coupling**: Business logic remains independent of database technology
- **Testability**: Easy to mock for unit testing
- **Flexibility**: Supports multiple storage backends
- **Maintainability**: Clear contract for all product data operations
- **Extensibility**: Simple to add new query methods as requirements evolve

**🔥 DETAILED STEP 1.3 EXPLANATION: IMPLEMENT BUSINESS LOGIC SERVICE**

The `ProductService` class encapsulates all core business logic for product operations, serving as the bridge between the domain entities and the use cases that orchestrate business workflows.

**Core Business Logic Components:**

1. **Stock Management**:
   - `updateStock(product: Product, quantity: number): Product`
   - Enforces business rules like preventing negative inventory
   - Handles stock adjustments with proper validation
   - Maintains audit trail through timestamp updates

2. **Price Management**:
   - `updatePrice(product: Product, newPrice: number): Product`
   - Validates price changes (non-negative values)
   - Ensures pricing consistency across the system
   - Supports promotional pricing and discounts

3. **Product Updates**:
   - `updateDetails(product: Product, updates: Partial<ProductProps>): Product`
   - Handles bulk attribute updates
   - Maintains data consistency during modifications
   - Preserves immutable patterns through new instance creation

4. **Wishlist Management**:
   - `updateWishlistStatus(product: Product, isWishlistStatus: boolean): Product`
   - Manages wishlist state transitions
   - Automatically updates wishlist counts
   - Enforces business rules for wishlist operations

**Design Patterns and Principles:**

- **Service Pattern**: Encapsulates business logic in a dedicated class
- **Dependency Injection**: Uses `@injectable()` for testability
- **Single Responsibility**: Focused solely on product business operations
- **Immutable Pattern**: All operations return new Product instances
- **Factory Method Pattern**: Leverages Product.create() for entity creation

**Business Rule Enforcement:**

- **Validation**: Prevents negative stock/price values
- **Data Consistency**: Maintains proper timestamps on updates
- **Wishlist Logic**: Handles count increments/decrements automatically
- **Immutability**: Prevents accidental data modification
- **Type Safety**: Full TypeScript coverage for all operations

**Integration and Benefits:**

- **Centralized Logic**: Business rules in one place for consistency
- **Reusability**: Used by multiple use cases and controllers
- **Testability**: Easy to unit test with mock entities
- **Framework Independence**: Pure domain logic without framework dependencies
- **Maintainability**: Clear separation of business concerns
- **Extensibility**: Simple to add new business operations as needed

**🔥 DETAILED STEP 2.2 EXPLANATION: IMPLEMENT REPOSITORY**

The `MongoProductRepository` class provides the concrete implementation of the `IProductRepository` interface, handling all database operations while maintaining the Clean Architecture principles.

**Core Repository Implementation:**

1. **CRUD Operations**: Complete implementation of all repository methods:
   - `create()`: Maps domain entity to MongoDB document and persists
   - `findById()`: Retrieves single products with null handling
   - `findAll()`: Supports filtered pagination with wishlist support
   - `update()`: Handles partial updates with proper validation
   - `delete()`: Idempotent removal with success/failure reporting
   - `count()`: Efficient counting for pagination metadata

2. **Query Building**: Sophisticated dynamic query construction:
   - **Filter Integration**: Converts ProductFilter to MongoDB query objects
   - **Wishlist Support**: Full wishlist filtering capabilities
   - **Full-Text Search**: Leverages MongoDB text indexes for search functionality
   - **Pagination**: Efficient skip/limit implementation

3. **Data Mapping**: Bidirectional conversion between layers:
   - `toDomain()`: Converts MongoDB documents to domain entities
   - Handles ObjectId to string conversion
   - Ensures proper field mapping and data consistency

4. **Error Handling**: Comprehensive error management:
   - Proper error propagation from database operations
   - Null object pattern for not-found cases
   - Validation of input parameters

**Design Patterns Applied:**

- **Repository Pattern**: Concrete implementation of data access abstraction
- **Adapter Pattern**: Converts between domain and database models
- **Null Object Pattern**: Returns null instead of throwing for not-found cases
- **Factory Method Pattern**: Uses Product.create() for entity creation

**Integration Benefits:**

- **Loose Coupling**: Business logic independent of MongoDB specifics
- **Testability**: Easy to mock for unit testing
- **Flexibility**: Can be replaced with different database implementations
- **Maintainability**: Clear separation of data access concerns
- **Performance**: Optimized queries with proper indexing

**🔥 DETAILED STEP 3.1 EXPLANATION: CREATE DTOS**

The Data Transfer Object (DTO) layer provides type-safe contracts for API communication, ensuring proper data validation and structure across all API endpoints.

**DTO Architecture:**

1. **CreateProductDTO**: Defines the contract for creating new products with:
   - Required fields: name, description, price, stock, category
   - Optional fields: images, isActive
   - Validation rules: minimum lengths, non-negative values

2. **UpdateProductDTO**: Supports partial updates with all fields optional:
   - Flexible update capabilities
   - Same validation rules as create when fields are provided
   - Enables efficient PATCH/PUT operations

3. **ProductResponseDTO**: Complete response structure including:
   - All product fields including computed properties
   - Wishlist status and count information
   - Timestamp fields for audit tracking
   - Consistent response format across all endpoints

**Design Principles:**

- **Type Safety**: Full TypeScript interfaces with proper typing
- **Validation**: Clear field requirements and constraints
- **Documentation**: Self-documenting interface definitions
- **Consistency**: Standardized data structures across API
- **Extensibility**: Easy to add new fields as requirements evolve

**Integration Benefits:**

- **API Contracts**: Clear contracts between frontend and backend
- **Validation**: Runtime validation support through Zod integration
- **Maintainability**: Centralized type definitions
- **Developer Experience**: IDE autocomplete and type checking

**🔥 DETAILED STEP 3.2 EXPLANATION: IMPLEMENT VALIDATORS**

The validator layer provides comprehensive runtime validation for all API requests using Zod schemas, ensuring data integrity at the API boundaries.

**Validation Architecture:**

1. **Schema Definitions**: Zod-based validation schemas for:
   - `createProductSchema`: Validates all required fields for creation
   - `updateProductSchema`: Validates optional fields for updates
   - `getProductSchema`: Validates URL parameters for retrieval

2. **Validation Rules**: Comprehensive field validation:
   - String validation: minimum lengths, proper formatting
   - Number validation: non-negative values, proper ranges
   - Boolean validation: proper true/false values
   - Array validation: proper URL formats for images
   - Parameter validation: ID format validation

3. **Error Handling**: Standardized validation error responses:
   - Clear error messages for each validation failure
   - Consistent error format across all endpoints
   - Detailed field-specific error information
   - Proper HTTP status codes for validation errors

**Integration with Express:**

- **Middleware Pattern**: `validateRequest()` middleware for automatic validation
- **Request Pipeline**: Validation occurs before controller methods
- **Error Propagation**: Validation errors properly handled by error middleware

**Benefits:**

- **Data Integrity**: Ensures all API inputs meet business requirements
- **Security**: Prevents invalid or malicious data from entering system
- **Consistency**: Uniform validation approach across all endpoints
- **Developer Experience**: Clear validation rules and error messages
- **Maintainability**: Centralized validation logic easy to update

**🔥 DETAILED STEP 4.1 EXPLANATION: ADD SHARED CONSTANTS**

The shared constants layer provides centralized management of cross-cutting concerns and dependency injection tokens, enabling proper application configuration.

**Constants Architecture:**

1. **DI_TOKENS**: Dependency injection tokens for:
   - `PRODUCT_REPOSITORY`: Injection token for product repository
   - Extensible design for future module tokens
   - Enables loose coupling between layers

2. **Wishlist Constants**: Configuration for wishlist operations:
   - `MAX_ITEMS_PER_USER`: Maximum wishlist items per user
   - `DEFAULT_WISHLIST_NAME`: Default wishlist name
   - `WISHLIST_EXPIRY_DAYS`: Wishlist item expiry period
   - Comprehensive limits and defaults

3. **Product Constants**: Validation rules and defaults:
   - Price constraints: min/max values
   - Name and description length limits
   - Stock quantity constraints
   - Wishlist count constraints

4. **Error Messages**: Standardized error responses:
   - Consistent error messaging across application
   - Wishlist-specific error messages
   - Validation error messages

**Design Benefits:**

- **Centralized Configuration**: Single source of truth for all constants
- **Type Safety**: Full TypeScript coverage with proper type inference
- **Consistency**: Uniform validation rules and error messages
- **Maintainability**: Easy to update and extend with new constants
- **Testability**: Supports mocking and testing with consistent configurations

**🔥 DETAILED STEP 4.2 EXPLANATION: IMPLEMENT USE CASES**

The use case layer implements the application's business logic, orchestrating interactions between domain entities and infrastructure components.

**Use Case Architecture:**

1. **CreateProductUseCase**: Handles product creation workflow:
   - Input validation through DTOs
   - Domain entity creation with business rules
   - Data persistence via repository
   - Proper error handling and propagation

2. **ListProductsUseCase**: Implements product listing with:
   - Query parameter processing and validation
   - Pagination logic with safe defaults
   - Filter construction from query parameters
   - Parallel query execution for performance
   - Comprehensive wishlist filtering support

3. **UpdateProductUseCase**: Manages product updates:
   - Product retrieval and existence validation
   - Field-specific update logic
   - Business rule enforcement via ProductService
   - Data persistence with proper validation

4. **GetProductUseCase**: Handles individual product retrieval:
   - ID validation and error handling
   - Null object pattern for not-found cases
   - Proper error propagation

5. **DeleteProductUseCase**: Implements product deletion:
   - Idempotent operation design
   - Success/failure reporting
   - Proper error handling

**Design Patterns:**

- **Use Case Pattern**: Encapsulates business logic
- **Dependency Injection**: Enables testability
- **Single Responsibility**: Focused on specific operations
- **Orchestration Pattern**: Coordinates domain and infrastructure

**Integration Benefits:**

- **Separation of Concerns**: Business logic independent of delivery mechanisms
- **Testability**: Easy to test with mock dependencies
- **Flexibility**: Can be used with different delivery mechanisms
- **Maintainability**: Clear, focused business logic
- **Reusability**: Can be reused across different contexts

**🔥 DETAILED STEP 5.1 EXPLANATION: BUILD CONTROLLER**

The ProductController handles HTTP request/response lifecycles, serving as the adapter between the web framework and the application's business logic.

**Controller Architecture:**

1. **CRUD Operations**: Comprehensive endpoint handlers:
   - `create()`: POST requests for new products (201 Created)
   - `list()`: GET requests for product listing (200 OK)
   - `getOne()`: GET requests for individual products (200 OK/404 Not Found)
   - `update()`: PUT requests for product updates (200 OK)
   - `delete()`: DELETE requests for product removal (204 No Content)

2. **Wishlist Operations**: Specialized wishlist endpoints:
   - `addToWishlist()`: POST requests to add products to wishlist
   - `removeFromWishlist()`: DELETE requests to remove from wishlist
   - `getWishlist()`: GET requests for wishlist products

3. **Error Handling**: Comprehensive error management:
   - Centralized error propagation to middleware
   - Proper HTTP status codes for all scenarios
   - Consistent error response formats
   - Not-found handling for individual products

4. **Response Formatting**: Standardized JSON responses:
   - Success responses with proper status codes
   - Pagination metadata for list operations
   - Consistent data structure across all endpoints

**Design Benefits:**

- **Separation of Concerns**: HTTP handling independent of business logic
- **Testability**: Easy to test with mock use case dependencies
- **Flexibility**: Can be adapted for different HTTP frameworks
- **Maintainability**: Clear, focused HTTP logic
- **Consistency**: Standardized response formats and error handling

**🔥 DETAILED STEP 5.2 EXPLANATION: SET UP ROUTES**

The routing layer defines RESTful endpoints and integrates them with the controller, providing the public API interface for the product module.

**Routing Architecture:**

1. **Endpoint Definitions**: Comprehensive RESTful routes:
   - `POST /api/products`: Create new products
   - `GET /api/products`: List products with filtering
   - `GET /api/products/{id}`: Retrieve individual products
   - `PUT /api/products/{id}`: Update existing products
   - `DELETE /api/products/{id}`: Remove products

2. **Wishlist Endpoints**: Specialized wishlist routes:
   - `PATCH /api/products/{id}/wishlist`: Toggle product wishlist status
   - `GET /api/products/wishlist`: Get wishlist products

3. **Middleware Integration**: Request processing pipeline:
   - `validateRequest()`: Automatic validation using Zod schemas
   - Error handling middleware for consistent responses
   - Proper middleware ordering for request processing

4. **Swagger Documentation**: Complete OpenAPI annotations:
   - Detailed endpoint documentation
   - Parameter and response schemas
   - Example requests and responses
   - Error response documentation

**Design Benefits:**

- **Clean URL Structure**: RESTful endpoint organization
- **Comprehensive Documentation**: Interactive API exploration
- **Validation Integration**: Automatic request validation
- **Error Handling**: Consistent error responses
- **Maintainability**: Easy to add new endpoints

**🔥 DETAILED STEP 6.1 EXPLANATION: DOCUMENT API ENDPOINTS**

The Swagger documentation provides comprehensive API documentation following OpenAPI 3.0 specification, enabling interactive API exploration and testing.

**Documentation Architecture:**

1. **OpenAPI Configuration**: Complete specification including:
   - API metadata (title, version, description)
   - Server definitions (development/production)
   - Tag organization for logical grouping
   - Component schemas for data models

2. **Schema Definitions**: Comprehensive data model documentation:
   - Product schema matching domain entity
   - Error response schemas for consistency
   - Response schemas for standardized formats
   - Complete field documentation with examples

3. **Endpoint Documentation**: Detailed route documentation:
   - HTTP methods and paths
   - Request/response schemas
   - Parameter definitions
   - Example requests and responses
   - Error response documentation

**Integration Benefits:**

- **Developer Experience**: Interactive API exploration via Swagger UI
- **Documentation Accuracy**: Always in sync with actual implementation
- **Standardization**: Follows industry-standard OpenAPI specification
- **Maintainability**: Centralized documentation easy to update
- **Discoverability**: Easy API exploration for developers and consumers

**🔥 DETAILED STEP 6.2 EXPLANATION: UPDATE DI CONTAINER**

The DI container configuration provides centralized dependency management, enabling proper component resolution and loose coupling.

**Container Architecture:**

1. **Dependency Registration**: Centralized component binding:
   - Repository implementations bound to interfaces
   - Service registrations with automatic discovery
   - Token-based dependency resolution

2. **Initialization**: Proper container setup:
   - Called during application startup
   - Ensures all dependencies available before use
   - Handles component lifecycle management

**Design Benefits:**

- **Loose Coupling**: Components depend on abstractions
- **Easy Testing**: Simple to mock dependencies
- **Centralized Configuration**: Single place for dependency management
- **Maintainability**: Easy to update and extend
- **Framework Independence**: Business logic independent of frameworks

**🔥 DETAILED STEP 6.3 EXPLANATION: UPDATE APPLICATION WIRING**

The application wiring integrates all components into a cohesive application, serving as the final integration point.

**Wiring Architecture:**

1. **Component Integration**: Proper component assembly:
   - Express application configuration
   - DI container initialization
   - Middleware chain setup
   - Route mounting and integration

2. **Initialization Flow**: Systematic startup process:
   - Express instance creation
   - DI container initialization
   - Middleware configuration
   - Route integration
   - Error handling setup

**Design Benefits:**

- **Modular Integration**: Easy to add new components
- **Centralized Configuration**: Single place for application setup
- **Proper Error Handling**: Consistent error management
- **Clean Architecture**: Separates configuration from business logic
- **Testability**: Can be tested by importing Express app

---

## 📊 _Status_

---

🚧 **In Progress**

**Phase 08: Product Module** - Feature implementation in progress

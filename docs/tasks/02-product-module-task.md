# Product Module Implementation Task

**Task:** 08-product-module-task  
**Related Plan:** [08-product-module-plan](../implementation-plans/08-product-module-plan.md)  
**Status:** 🚧 **In Progress**

---

## Overview

This task outlines the step-by-step implementation of the Product Module, covering Create, Get, List, Update, Delete operations, and Wishlist functionality across all architectural layers following Clean Architecture principles.

---

## Layer Annotations Summary

This task follows Clean Architecture principles with clear layer separation:

### ✅ Steps 1.1-1.3: Domain Layer

- **Step 1.1:** Create Product Entity with Wishlist support → `src/domain/entities/Product.ts`
- **Step 1.2:** Define IProductRepository Interface with Wishlist filtering → `src/domain/interfaces/IProductRepository.ts`
- **Step 1.3:** Create ProductService with Wishlist business logic → `src/domain/services/ProductService.ts`

### ✅ Steps 2.1-2.2: Infrastructure Layer

- **Step 2.1:** Implement MongoDB Product Schema with Wishlist fields → `src/infrastructure/models/ProductModel.ts`
- **Step 2.2:** Create MongoProductRepository with Wishlist support → `src/infrastructure/repositories/MongoProductRepository.ts`

### ✅ Steps 3.1-3.2: Interface Layer - DTOs/Validators

- **Step 3.1:** Create Product DTOs with Zod Validation → `src/interface/dtos/product/*.ts`
- **Step 3.2:** Create Product Validators → `src/interface/validators/ProductValidators.ts`

### ✅ Steps 4.1-4.2: Shared & Application Layers

- **Step 4.1:** Add Shared Constants (DI_TOKENS) with Wishlist configuration → `src/shared/constants.ts`
- **Step 4.2:** Implement Product Use Cases with Wishlist functionality → `src/usecases/product/*.ts`

### ✅ Steps 5.1-5.2: Interface Layer - Controllers/Routes

- **Step 5.1:** Build ProductController with Wishlist endpoints → `src/interface/controllers/ProductController.ts`
- **Step 5.2:** Set up Product Routes with Wishlist endpoints → `src/interface/routes/productRoutes.ts`

### ✅ Steps 6.1-6.3: Configuration Layer

- **Step 6.1:** Document Product API Endpoints in Swagger → `src/config/swagger.ts`
- **Step 6.2:** Update DI Container Configuration → `src/config/di-container.ts`
- **Step 6.3:** Update Application Wiring → `src/app.ts`

---

## Implementation Checklist

### ✅ Step 1.1: Create Product Entity with Wishlist Support

**Layer:** Domain

- **Objective:** Define core Product domain model with validation and Wishlist functionality.
- **Files:** `src/domain/entities/Product.ts`
- **Code:** Immutable class with basic validation and wishlist properties.

### ✅ Step 1.2: Define IProductRepository Interface with Wishlist Filtering

**Layer:** Domain

- **Objective:** Abstract repository interface for CRUD operations with Wishlist filtering support.
- **Files:** `src/domain/interfaces/IProductRepository.ts`
- **Code:** Promise-based methods with ProductFilter including isWishlistStatus parameter.

### ✅ Step 1.3: Create ProductService with Wishlist Business Logic

**Layer:** Domain

- **Objective:** Business logic service for product operations including Wishlist management.
- **Files:** `src/domain/services/ProductService.ts`
- **Code:** Stock management, price updates, validation, and Wishlist status updates.

### ✅ Step 2.1: Implement MongoDB Product Schema with Wishlist Fields

**Layer:** Infrastructure

- **Objective:** Mongoose schema with indexes, validation, and Wishlist field support.
- **Files:** `src/infrastructure/models/ProductModel.ts`
- **Code:** Schema with text indexes for search and Wishlist fields (isWishlistStatus, wishlistCount).

### ✅ Step 2.2: Create MongoProductRepository with Wishlist Support

**Layer:** Infrastructure

- **Objective:** Repository implementation with domain mapping and Wishlist filtering.
- **Files:** `src/infrastructure/repositories/MongoProductRepository.ts`
- **Code:** Injectable class with toDomain() method and Wishlist query support.

### ✅ Step 3.1: Create Product DTOs with Zod Validation

**Layer:** Interface

- **Objective:** Data transfer objects with validation.
- **Files:** `src/interface/dtos/product/*.ts`
- **Code:** Interfaces for Create, Update, Response.

### ✅ Step 3.2: Create Product Validators

**Layer:** Interface

- **Objective:** Zod-based runtime validation for API requests.
- **Files:** `src/interface/validators/ProductValidators.ts`
- **Code:** Validation schemas for create, update, and get operations.

### ✅ Step 4.1: Add Shared Constants (DI_TOKENS) with Wishlist Configuration

**Layer:** Shared

- **Objective:** Dependency injection tokens and Wishlist constants for cross-cutting concerns.
- **Files:** `src/shared/constants.ts`
- **Code:** DI tokens, Wishlist constants (MAX_ITEMS_PER_USER, etc.), and error messages.

### ✅ Step 4.2: Implement Product Use Cases with Wishlist Functionality

**Layer:** Application

- **Objective:** Business logic for CRUD operations and Wishlist management.
- **Files:** `src/usecases/product/*.ts`
- **Code:** Five use case classes with dependency injection and Wishlist support.

### ✅ Step 5.1: Build ProductController with Wishlist Endpoints

**Layer:** Interface

- **Objective:** HTTP request handler with Wishlist functionality.
- **Files:** `src/interface/controllers/ProductController.ts`
- **Code:** Injectable controller with error handling and wishlist methods (toggleWishlist, getWishlist).

### ✅ Step 5.2: Set up Product Routes with Wishlist Endpoints

**Layer:** Interface

- **Objective:** API endpoints with validation and Wishlist routes.
- **Files:** `src/interface/routes/productRoutes.ts`
- **Code:** Express routes with middleware including Wishlist endpoints (POST/DELETE /api/products/{id}/wishlist, GET /api/products/wishlist).

### ✅ Step 6.1: Document Product API Endpoints in Swagger

**Layer:** Configuration

- **Objective:** Auto-generated API docs.
- **Files:** `src/config/swagger.ts`, route annotations
- **Code:** OpenAPI annotations.

### ✅ Step 6.2: Update DI Container Configuration

**Layer:** Configuration

- **Objective:** Register dependencies in DI container.
- **Files:** `src/config/di-container.ts`
- **Code:** Container registration for repository and services.

### ✅ Step 6.3: Update Application Wiring

**Layer:** Configuration

- **Objective:** Integrate routes into main application.
- **Files:** `src/app.ts`
- **Code:** Route mounting at `/api/products`.

---

## Key Objectives

1. **Strict Typing**: Full TypeScript coverage for entities and DTOs.
2. **Robust Validation**: Zod-based runtime validation for all inputs.
3. **Search & Filter**: Powerful querying capabilities for the frontend.
4. **Scalable Data**: Optimized MongoDB schema with necessary indexes.
5. **Wishlist Functionality**: Complete Wishlist feature implementation across all layers.

---

## Layer-Based Implementation Details

### Domain Layer

- **Step 1.1:** Create Product Entity with Wishlist support (`src/domain/entities/Product.ts`)
  - Immutable class with validation and Wishlist methods
  - Business rules, invariants, and Wishlist business logic
  - Clean architecture compliance with Wishlist integration

- **Step 1.2:** Define IProductRepository Interface with Wishlist filtering (`src/domain/interfaces/IProductRepository.ts`)
  - Abstract CRUD operations with Wishlist support
  - ProductFilter for querying including isWishlistStatus parameter
  - Promise-based async methods with Wishlist filtering

- **Step 1.3:** Create ProductService with Wishlist business logic (`src/domain/services/ProductService.ts`)
  - Business logic for product operations and Wishlist management
  - Stock management, price updates, and Wishlist status management
  - Dependency injection with tsyringe for loose coupling

### Infrastructure Layer

- **Step 2.1:** Create Mongoose Schema with Wishlist fields (`src/infrastructure/models/ProductModel.ts`)
  - Text indexes for search functionality
  - Schema-level validation including Wishlist constraints
  - Timestamps, indexing, and Wishlist field definitions
  - MongoDB optimization with Wishlist support

- **Step 2.2:** Implement Repository with Wishlist support (`src/infrastructure/repositories/MongoProductRepository.ts`)
  - `IProductRepository` implementation with Wishlist filtering
  - Domain entity mapping including Wishlist fields
  - `toDomain()` conversion method with Wishlist support
  - Error handling, type safety, and Wishlist query building

### Interface Layer - DTOs/Validators

- **Step 3.1:** Create Product DTOs (`src/interface/dtos/product/*.ts`)
  - `CreateProductDTO.ts` - Input validation
  - `UpdateProductDTO.ts` - Partial updates
  - `ProductResponseDTO.ts` - API responses
  - Zod schemas for runtime validation

- **Step 3.2:** Implement Product Validators (`src/interface/validators/ProductValidators.ts`)
  - Zod schemas for request validation
  - Request body, params, and query validation
  - Clear error messages
  - Optional field support for updates

### Shared & Application Layers

- **Step 4.1:** Add DI Tokens and Wishlist constants (`src/shared/constants.ts`)
  - Export `DI_TOKENS` object with `PRODUCT_REPOSITORY` token
  - Wishlist constants (MAX_ITEMS_PER_USER, MAX_WISHLIST_COUNT, etc.)
  - Error messages and validation rules for Wishlist functionality
  - Loose coupling support for all components

- **Step 4.2:** Implement Product Use Cases with Wishlist functionality (`src/usecases/product/*.ts`)
  - `CreateProductUseCase.ts` - Business validation
  - `GetProductUseCase.ts` - Single product retrieval
  - `ListProductsUseCase.ts` - Paginated listing with Wishlist filtering
  - `UpdateProductUseCase.ts` - Modification logic including Wishlist updates
  - `DeleteProductUseCase.ts` - Removal operations
  - Dependency injection with tsyringe for all components

### Interface Layer - Controllers/Routes

- **Step 5.1:** Implement Controller with Wishlist endpoints (`src/interface/controllers/ProductController.ts`)
  - HTTP request handling including Wishlist operations
  - Input parsing and validation for all endpoints
  - Use case invocation with Wishlist support
  - Response formatting for standard and Wishlist responses
  - Error handling for all scenarios including Wishlist operations

- **Step 5.2:** Define Routes with Wishlist endpoints (`src/interface/routes/productRoutes.ts`)
  - `POST /api/products` - Create product
  - `GET /api/products` - List products (with pagination)
  - `GET /api/products/:id` - Get product by ID
  - `PUT /api/products/:id` - Update product
  - `DELETE /api/products/:id` - Delete product
  - `POST /api/products/:id/wishlist` - Add product to wishlist
  - `DELETE /api/products/:id/wishlist` - Remove product from wishlist
  - `GET /api/products/wishlist` - Get all wishlist products
  - Validation middleware integration
  - Swagger documentation for all endpoints

### Configuration Layer

- **Step 6.1:** Update Swagger (`src/config/swagger.ts`)
  - Product API documentation
  - OpenAPI annotations

- **Step 6.2:** Update DI Container (`src/config/di-container.ts`)
  - MongoProductRepository registration
  - tsyringe container setup
  - Proper token mapping

- **Step 6.3:** Update Application Wiring (`src/app.ts`)
  - Import and mount productRoutes
  - `/api/products` endpoint setup

---

## Testing Strategy

### Unit Tests - Domain Layer

- **Step 7.1:** Product Entity Tests (`src/__tests__/unit/product/Product.test.ts`)
  - Entity validation and business logic including Wishlist functionality
  - Immutable property tests and Wishlist method validation
  - Business rule enforcement for all operations

### Unit Tests - Infrastructure Layer

- **Step 7.2:** Repository Tests (`src/__tests__/unit/product/MongoProductRepository.test.ts`)
  - Mocked MongoDB operations
  - Domain mapping verification
  - Error handling tests

### Unit Tests - Application Layer

- **Step 7.3:** Use Case Tests (`src/__tests__/unit/product/*UseCase.test.ts`)
  - Business logic validation including Wishlist operations
  - Mocked dependency injection for all use cases
  - Success and failure scenarios for CRUD and Wishlist operations

### Integration Tests

- **Step 7.4:** Full Flow Tests (`src/__tests__/integration/product/product.test.ts`)
  - End-to-end API testing including Wishlist endpoints
  - Database integration with Wishlist data
  - Complete request/response cycle for all operations

---

## Verification Steps

### Step 8.1: Start Server

- Ensure the server starts without errors

### Step 8.2: Test Create Endpoint

- Create a product via POST request and verify response

### Step 8.3: Test List Endpoint

- Retrieve list of products and verify pagination

### Step 8.4: Test Get Endpoint

- Retrieve a single product by ID

### Step 8.5: Test Update Endpoint

- Update a product and verify changes
- Test Wishlist status updates via update endpoint

### Step 8.6: Test Delete Endpoint

- Delete a product and verify removal
- Test that Wishlist status is properly handled during deletion

### Step 8.7: Test Validation

- Verify that invalid inputs are properly rejected
- Test Wishlist-specific validation rules

### Step 8.8: Test Error Handling

- Verify proper error responses for edge cases
- Test Wishlist-specific error scenarios (already in wishlist, not in wishlist, etc.)

---

## Progress Summary

| Layer          | Tasks  | Completed | Status     |
| -------------- | ------ | --------- | ---------- |
| Domain         | 3      | 0         | 🚧 Pending |
| Infrastructure | 2      | 0         | 🚧 Pending |
| Interface      | 4      | 0         | 🚧 Pending |
| Shared         | 1      | 0         | 🚧 Pending |
| Application    | 1      | 0         | 🚧 Pending |
| Configuration  | 3      | 0         | 🚧 Pending |
| Testing        | 4      | 0         | 🚧 Pending |
| Verification   | 8      | 0         | 🚧 Pending |
| **Total**      | **25** | **0**     | **🚧 0%**  |

---

## Notes

- Follow Clean Architecture principles strictly
- Maintain 100% test coverage including Wishlist functionality
- Use TypeScript strictly (no `any` types)
- Document all API endpoints in Swagger including Wishlist endpoints
- Ensure proper error handling at all layers including Wishlist operations
- Use dependency injection for all dependencies
- Implement comprehensive Wishlist feature across all architectural layers

---

## Related Documentation

- [Implementation Plan](../implementation-plans/08-product-module-plan.md)
- [Main Task List](./01-jollyjet-task.md)




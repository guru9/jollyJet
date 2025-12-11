# Product Module Implementation Task

**Task:** 08-product-module-task  
**Related Plan:** [08-product-module-plan](../implementation-plans/08-product-module-plan.md)  
**Status:** 🚧 **In Progress**

---

## Overview

This task outlines the step-by-step implementation of the Product Module, covering Create, Get, List, Update, and Delete operations across all architectural layers following Clean Architecture principles.

---

## Implementation Checklist

### ✅ Step 1: Create Product Entity

- **Objective:** Define core Product domain model with validation.
- **Files:** `src/domain/entities/Product.ts`
- **Code:** Immutable class with basic validation.

### ✅ Step 2: Define IProductRepository Interface

- **Objective:** Abstract repository interface for CRUD operations.
- **Files:** `src/domain/interfaces/IProductRepository.ts`
- **Code:** Promise-based methods with ProductFilter.

### ✅ Step 3: Implement MongoDB Product Schema

- **Objective:** Mongoose schema with indexes and validation.
- **Files:** `src/infrastructure/models/ProductModel.ts`
- **Code:** Schema with text indexes for search.

### ✅ Step 4: Create MongoProductRepository

- **Objective:** Repository implementation with domain mapping.
- **Files:** `src/infrastructure/repositories/MongoProductRepository.ts`
- **Code:** Injectable class with toDomain() method.

### ✅ Step 5: Implement Product Use Cases

- **Objective:** Business logic for CRUD operations.
- **Files:** `src/application/usecases/product/*.ts`
- **Code:** Five use case classes with DI.

### ✅ Step 6: Create Product DTOs with Zod Validation

- **Objective:** Data transfer objects with validation.
- **Files:** `src/interface/dtos/product/*.ts`
- **Code:** Interfaces for Create, Update, Response.

### ✅ Step 7: Build ProductController

- **Objective:** HTTP request handler.
- **Files:** `src/interface/controllers/ProductController.ts`
- **Code:** Injectable controller with error handling.

### ✅ Step 8: Set up Product Routes

- **Objective:** API endpoints with validation.
- **Files:** `src/interface/routes/productRoutes.ts`
- **Code:** Express routes with middleware.

### ✅ Step 9: Write Unit Tests

- **Objective:** Test components in isolation.
- **Files:** `src/test/unit/product/*.test.ts`
- **Code:** Jest tests with mocks.

### ✅ Step 10: Write Integration Tests

- **Objective:** End-to-end API testing.
- **Files:** `src/test/integration/product/*.test.ts`
- **Code:** Full request/response tests.

### ✅ Step 11: Document Product API Endpoints in Swagger

- **Objective:** Auto-generated API docs.
- **Files:** `src/config/swagger.ts`, route annotations
- **Code:** OpenAPI annotations.

### ✅ Step 12: Update Application Wiring

- **Objective:** Register dependencies and mount routes.
- **Files:** `src/shared/constants.ts`, `src/config/di-container.ts`, `src/app.ts`
- **Code:** DI tokens, container registration, route mounting.

---

### Key Objectives

1. **Strict Typing**: Full TypeScript coverage for entities and DTOs.
2. **Robust Validation**: Zod-based runtime validation for all inputs.
3. **Search & Filter**: Powerful querying capabilities for the frontend.
4. **Scalable Data**: Optimized MongoDB schema with necessary indexes.

---

### ✅ Step 2: Infrastructure Layer (Data Access)

- [ ] **Create Mongoose Schema** (Step 2.1)
  - File: `src/infrastructure/models/ProductModel.ts`
  - Task: Define the Mongoose schema and model.
  - Dependencies: None
  - Requirements:
    - Add text indexes for search functionality
    - Include proper validation at schema level
    - Set up timestamps

- [ ] **Implement Repository** (Step 2.2)
  - File: `src/infrastructure/repositories/MongoProductRepository.ts`
  - Task: Implement `IProductRepository` using the Mongoose model.
  - Dependencies: Product (1.1), IProductRepository (1.2), ProductModel (2.1)
  - Requirements:
    - Ensure mapping between Mongoose documents and Domain Entities
    - Implement `toDomain` method for conversion
    - Add proper error handling
    - Use ProductFilter interface for type safety

---

### ✅ Step 3: Application Layer (Use Cases)

- [ ] **Create Product DTOs** (Step 3.1 - No dependencies, must be first)
  - Files:
    - `src/interface/dtos/CreateProductDTO.ts`
    - `src/interface/dtos/UpdateProductDTO.ts`
    - `src/interface/dtos/ProductResponseDTO.ts`
  - Task: Define strictly typed DTOs for data transfer.
  - Dependencies: None

- [ ] **Create Product Use Case** (Step 3.3)
  - File: `src/usecases/product/CreateProductUseCase.ts`
  - Task: Logic to validate business rules and call `repository.create`.
  - Dependencies: DTOs (3.1), IProductRepository (1.2), DI_TOKENS (5.0)

- [ ] **Get Product Use Case** (Step 3.3)
  - File: `src/usecases/product/GetProductUseCase.ts`
  - Task: Logic to retrieve a single product by ID.
  - Dependencies: IProductRepository (1.2), DI_TOKENS (5.0)

- [ ] **List Products Use Case** (Step 3.3)
  - File: `src/usecases/product/ListProductsUseCase.ts`
  - Task: Logic to retrieve a list of products with pagination and filtering.
  - Dependencies: IProductRepository (1.2), DI_TOKENS (5.0)

- [ ] **Update Product Use Case** (Step 3.3)
  - File: `src/usecases/product/UpdateProductUseCase.ts`
  - Task: Logic to update an existing product.
  - Dependencies: DTOs (3.1), IProductRepository (1.2), ProductService (1.3), DI_TOKENS (5.0)

- [ ] **Delete Product Use Case** (Step 3.3)
  - File: `src/usecases/product/DeleteProductUseCase.ts`
  - Task: Logic to remove a product from the system.
  - Dependencies: IProductRepository (1.2), DI_TOKENS (5.0)

---

### ✅ Step 4: Interface Layer (HTTP Adapters)

- [ ] **Define Input Validations** (Step 4.1)
  - File: `src/interface/validators/ProductValidators.ts`
  - Task: Create Zod schemas for Create, Update, and Query params.
  - Dependencies: DTOs (3.1)
  - Requirements:
    - Validate request body, params, and query
    - Provide clear error messages
    - Support optional fields for updates

- [ ] **Implement Controller** (Step 4.2)
  - File: `src/interface/controllers/ProductController.ts`
  - Task: Handle HTTP requests, parse inputs, call Use Cases, and return responses.
  - Dependencies: Use Cases (3.3)
  - Methods: `create`, `list`, `getOne`, `update`, `delete`.
  - Requirements:
    - Proper error handling
    - Consistent response format
    - Dependency injection with tsyringe

- [ ] **Define Routes** (Step 4.3)
  - File: `src/interface/routes/productRoutes.ts`
  - Task: Define Express routes and bind them to Controller methods.
  - Dependencies: Controllers (4.2), Validators (4.1)
  - Endpoints:
    - `POST /api/products` - Create product
    - `GET /api/products` - List products (with pagination)
    - `GET /api/products/:id` - Get product by ID
    - `PUT /api/products/:id` - Update product
    - `DELETE /api/products/:id` - Delete product
  - Requirements:
    - Apply validation middleware
    - Add Swagger documentation
    - Proper route organization

---

### ✅ Step 5: Configuration & Integration

- [ ] **Add DI Tokens to Constants** (Step 5.0 - Before Use Cases)
  - File: `src/shared/constants.ts`
  - Task: Add `DI_TOKENS` constant for loose coupling.
  - Dependencies: None
  - Requirements:
    - Export `DI_TOKENS` object with `PRODUCT_REPOSITORY` token
    - Must be created before Use Cases (they depend on it)

- [ ] **Register Repository in DI Container** (Step 5.1)
  - File: `src/config/di-container.ts`
  - Task: Register `MongoProductRepository` as `ProductRepository`.
  - Dependencies: MongoProductRepository (2.2), ProductService (1.3), DI_TOKENS (5.0)
  - Requirements:
    - Use tsyringe container
    - Register with proper token from DI_TOKENS

- [ ] **Mount Module Routes** (Step 5.2)
  - File: `src/app.ts`
  - Task: Import `productRoutes` and mount them at `/api/products`.
  - Dependencies: Routes (4.3)

- [ ] **Update Swagger Documentation** (Step 5.3 - Optional)
  - File: `src/config/swagger.ts` (if needed)
  - Task: Add Product API endpoints to Swagger documentation.
  - Dependencies: Routes (4.3)

---

### ✅ Step 6: Testing

- [ ] **Unit Tests - Domain Layer**
  - Files: `src/test/unit/product/Product.test.ts`
  - Task: Test Product entity validation and business logic.

- [ ] **Unit Tests - Repository**
  - Files: `src/test/unit/product/MongoProductRepository.test.ts`
  - Task: Test repository methods with mocked MongoDB.

- [ ] **Unit Tests - Use Cases**
  - Files: `src/test/unit/product/*UseCase.test.ts`
  - Task: Test all use cases with mocked dependencies.

- [ ] **Integration Tests**
  - Files: `src/test/integration/product/product.test.ts`
  - Task: Test complete flow from API to database.

---

### ✅ Step 7: Verification

- [ ] **Start Server**
  - Task: Ensure the server starts without errors.

- [ ] **Test Create Endpoint**
  - Task: Create a product via POST request and verify response.

- [ ] **Test List Endpoint**
  - Task: Retrieve list of products and verify pagination.

- [ ] **Test Get Endpoint**
  - Task: Retrieve a single product by ID.

- [ ] **Test Update Endpoint**
  - Task: Update a product and verify changes.

- [ ] **Test Delete Endpoint**
  - Task: Delete a product and verify removal.

- [ ] **Test Validation**
  - Task: Verify that invalid inputs are properly rejected.

- [ ] **Test Error Handling**
  - Task: Verify proper error responses for edge cases.

---

## Progress Summary

| Layer          | Tasks  | Completed | Status     |
| -------------- | ------ | --------- | ---------- |
| Domain         | 3      | 0         | 🚧 Pending |
| Infrastructure | 2      | 0         | 🚧 Pending |
| Application    | 6      | 0         | 🚧 Pending |
| Interface      | 3      | 0         | 🚧 Pending |
| Configuration  | 4      | 0         | 🚧 Pending |
| Testing        | 4      | 0         | 🚧 Pending |
| Verification   | 7      | 0         | 🚧 Pending |
| **Total**      | **29** | **0**     | **🚧 0%**  |

---

## Notes

- Follow Clean Architecture principles strictly
- Maintain 100% test coverage
- Use TypeScript strictly (no `any` types)
- Document all API endpoints in Swagger
- Ensure proper error handling at all layers
- Use dependency injection for all dependencies

---

## Related Documentation

- [Implementation Plan](../implementation-plans/08-product-module-plan.md)
- [Main Task List](./01-jollyjet-task.md)

# JollyJet: Redis-First Cache Architecture Implementation Guide

---

## Production-Grade E-commerce System with Redis-First Caching & Clean Architecture

**A comprehensive implementation guide focusing on Redis-first caching strategy with complete middleware, use cases, and architectural patterns.**

- **Architecture**: Clean Architecture + Redis-First Caching + MongoDB
- **Cache Strategy**: Read-Aside Pattern with TTL Management
- **Last Updated**: January 23, 2026

## 📁 Project Folder Structure

```
e:/Project/jollyJet
├── .env
├── .env.development
├── .env.local
├── .env.production
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── jest.config.ts
├── nodemon.json
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.eslint.json
├── tsconfig.json
├── .vscode/
│   ├── extensions.json
│   ├── launch.json
│   └── settings.json
├── coverage/
│   ├── clover.xml
│   ├── coverage-final.json
│   ├── lcov.info
│   └── lcov-report/
├── dist/
│   ├── jest.config.d.ts
│   ├── jest.config.d.ts.map
│   ├── jest.config.js
│   ├── jest.config.js.map
│   └── src/
├── docs/
│   ├── JOLLYJET_IMPLEMENTATION_MASTER_GUIDE.md
│   ├── analysis/
│   │   ├── project-analysis.md
│   │   ├── cors/
│   │   │   └── cors-security.md
│   │   ├── products/
│   │   │   ├── step1.1-product-entity.md
│   │   │   ├── step1.2-product-repository-interface.md
│   │   │   ├── step1.3-product-service.md
│   │   │   ├── step2.1-product-model.md
│   │   │   ├── step2.2-product-repository.md
│   │   │   ├── step3.1-product-dtos.md
│   │   │   ├── step3.2-product-validators.md
│   │   │   ├── step4.1-constants.md
│   │   │   ├── step4.2-count-products-usecase.md
│   │   │   ├── step4.2-create-product-usecase.md
│   │   │   ├── step4.2-delete-product-usecase.md
│   │   │   ├── step4.2-get-product-usecase.md
│   │   │   ├── step4.2-list-product-usecase.md
│   │   │   ├── step4.2-toggle-wishlist-product-usecase.md
│   │   │   ├── step4.2-update-product-usecase.md
│   │   │   ├── step5.1-product-controller.md
│   │   │   ├── step6.1-product-swagger.md
│   │   │   ├── step6.2-product-di-container.md
│   │   │   └── step6.3-product-app-wiring.md
│   │   └── redis/
│   │       ├── step1.1-redis-config.md
│   │       ├── step1.2-redis-service-interface.md
│   │       ├── step1.3-redis-service-implementation.md
│   │       ├── step2.1-cache-consistency-service.md
│   │       ├── step2.2-session-management.md
│   │       ├── step2.3-rate-limiting.md
│   │       ├── step2.4-cache-decorators.md
│   │       ├── step3.1-redis-cache-middleware.md
│   │       ├── step3.2-rate-limit-middleware.md
│   │       ├── step4-redis-integration.md
│   │       ├── step5.1-swagger-redis-integration.md
│   │       └── step6-redis-setup-connection.md
│   ├── best-practices/
│   │   └── best-practices.md
│   ├── extra/
│   │   ├── code-maintenance.md
│   │   ├── debugging-guide.md
│   │   ├── development-process.md
│   │   ├── development-setup.md
│   │   ├── environment-setup.md
│   │   ├── improvements-guide.md
│   │   ├── jollyjet-run-scripts.png
│   │   ├── MONGODB_SETUP.md
│   │   ├── products-api-500-error-fix.md
│   │   ├── REDIS_SETUP.md
│   │   ├── security-checklist.md
│   │   └── vs-code-extensions.md
│   ├── flowchart/
│   │   ├── jollyjet-ecommerce-flow.md
│   │   └── product-flowchart.md
│   ├── implementation-plans/
│   │   ├── 01-mongodb-setup-plan.md
│   │   ├── 02-prettier-eslint-setup-plan.md
│   │   ├── 03-foundation-setup-plan.md
│   │   ├── 04-core-utilities-types-plan.md
│   │   ├── 05-eslint-v9-migration-plan.md
│   │   ├── 06-swagger-setup-plan.md
│   │   ├── 07-testing-setup-plan.md
│   │   ├── 08-product-module-plan.md
│   │   ├── 09-redis-implementation-plan.md
│   │   ├── 11-cors-policy-security-plan.md
│   │   ├── 12-redis-first-cache.md
│   │   └── 13-pubsub-implementation-plan.md
│   ├── migrations/
│   │   ├── mcp-server-integration-plan.md
│   │   ├── microservices-migration-plan.md
│   │   ├── postgresql-migration-guide.md
│   │   ├── sql-integration-findings.md
│   │   ├── sql-migration-guide.md
│   │   └── tasks/
│   │       ├── 01-jollyjet-task.md
│   │       ├── 02-product-module-task.md
│   │       ├── 03-redis-task.md
│   │       ├── 04-cors-task.md
│   │       └── 05-redis-cache-implementation.md
│   ├── tests/
│   │   ├── test-coverage-walkthrough.md
│   │   ├── cors/
│   │   │   └── cors-test-analysis.md
│   │   ├── products/
│   │   │   ├── step1.1-product-entity-test.md
│   │   │   ├── step1.3-product-service-test.md
│   │   │   ├── step2.2-product-repository-test.md
│   │   │   ├── step3.2-product-validators-test.md
│   │   │   ├── step4.2-count-products-usecase-test.md
│   │   │   ├── step4.2-create-product-usecase-test.md
│   │   │   ├── step4.2-delete-product-usecase-test.md
│   │   │   ├── step4.2-get-product-usecase-test.md
│   │   │   ├── step4.2-list-products-usecase-test.md
│   │   │   ├── step4.2-toggle-wishlist-product-usecase-test.md
│   │   │   ├── step4.2-update-product-usecase-test.md
│   │   │   └── step5.1-product-controller-testcase.md
│   │   └── redis/
│   │       ├── RedisController-test-analysis.md
│   │       ├── step1.3-redis-service-test.md
│   │       ├── step2.1-cache-consistency-service-test.md
│   │       ├── step2.2-session-management-test.md
│   │       ├── step2.3-rate-limiting-test.md
│   │       ├── step2.4-cache-decorators-test.md
│   │       └── step3.1-redis-cache-middleware-test.md
├── node_modules/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── di-container.ts
│   │   ├── env.validation.ts
│   │   ├── index.ts
│   │   └── swagger.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── index.ts
│   │   │   └── product/
│   │   │       └── Product.ts
│   │   ├── interfaces/
│   │   │   ├── index.ts
│   │   │   ├── product/
│   │   │   │   └── IProductRepository.ts
│   │   │   ├── ratelimit/
│   │   │   │   └── IRateLimitingService.ts
│   │   │   ├── redis/
│   │   │   │   └── IRedisService.ts
│   │   │   ├── security/
│   │   │   │   └── ICorsSecurityService.ts
│   │   │   └── session/
│   │   │       └── ISessionService.ts
│   │   └── services/
│   │       ├── index.ts
│   │       ├── cache/
│   │       │   ├── CacheConsistencyService.ts
│   │       │   └── CacheService.ts
│   │       ├── product/
│   │       │   └── ProductService.ts
│   │       ├── redis/
│   │       │   └── RedisService.ts
│   │       └── security/
│   │           └── CorsSecurityService.ts
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── mongodb.ts
│   │   │   └── redis.ts
│   │   ├── models/
│   │   │   ├── index.ts
│   │   │   └── product/
│   │   │       └── ProductModel.ts
│   │   ├── repositories/
│   │   │   ├── BaseRepository.ts
│   │   │   ├── index.ts
│   │   │   └── product/
│   │   │       └── ProductRepository.ts
│   │   └── services/
│   │       ├── index.ts
│   │       ├── ratelimit/
│   │       │   └── RateLimitingService.ts
│   │       └── session/
│   │           └── SessionService.ts
│   ├── interface/
│   │   ├── controllers/
│   │   │   ├── index.ts
│   │   │   ├── health/
│   │   │   │   └── HealthController.ts
│   │   │   ├── product/
│   │   │   │   └── ProductController.ts
│   │   │   └── redis/
│   │   │       └── RedisController.ts
│   │   ├── dtos/
│   │   │   ├── index.ts
│   │   │   └── product/
│   │   │       ├── CreateProductDTO.ts
│   │   │       ├── ProductResponseDTO.ts
│   │   │       ├── ToggleWishlistDTO.ts
│   │   │       └── UpdateProductDTO.ts
│   │   ├── middlewares/
│   │   │   ├── corsLoggerHandler.ts
│   │   │   ├── corsSecurityHandler.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── index.ts
│   │   │   ├── rateLimitHandler.ts
│   │   │   ├── redisCacheHandler.ts
│   │   │   └── requestLogger.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── health/
│   │   │   │   └── healthRoutes.ts
│   │   │   ├── product/
│   │   │   │   └── productRoutes.ts
│   │   │   └── redis/
│   │   │       └── redisRoutes.ts
│   │   └── validators/
│   │       ├── index.ts
│   │       └── product/
│   │           └── ProductValidators.ts
│   ├── shared/
│   │   ├── constants.ts
│   │   ├── errors.ts
│   │   ├── index.ts
│   │   ├── logger.ts
│   │   └── utils.ts
│   ├── types/
│   │   └── index.d.ts
│   └── usecases/
│       ├── index.ts
│       └── product/
│           ├── CountProductsUseCase.ts
│           ├── CreateProductUseCase.ts
│           ├── DeleteProductUseCase.ts
│           ├── GetProductUseCase.ts
│           ├── ListProductsUseCase.ts
│           ├── ToggleWishlistProductUseCase.ts
│           └── UpdateProductUseCase.ts
├── tests/
│   ├── setup.ts
│   ├── integration/
│   ├── mocks/
│   └── unit/
└── README.md
```

---

## 🛍️ Product Module - Complete Features

### **CRUD Operations**

- ✅ Create Product with validation
- ✅ Read Product with caching
- ✅ Update Product with validation
- ✅ Delete Product with cache invalidation
- ✅ List Products with pagination
- ✅ Count Products with filters

### **Advanced Features**

- ✅ **Filtering**: Category, price range, active status, wishlist status
- ✅ **Search**: Full-text search across name and description
- ✅ **Pagination**: Configurable page size and navigation
- ✅ **Wishlist Management**: Add, remove, toggle with popularity tracking
- ✅ **Stock Management**: Effective stock calculation for inactive products
- ✅ **Caching**: Redis-first strategy with background refresh

### **API Endpoints**

```
POST   /api/v1/products          # Create product
GET    /api/v1/products          # List products (with filters/pagination)
GET    /api/v1/products/:id      # Get single product
PUT    /api/v1/products/:id      # Update product
DELETE /api/v1/products/:id      # Delete product
POST   /api/v1/products/:id/wishlist  # Toggle wishlist
GET    /api/v1/products/count    # Count products
```

---

## 🛡️ Security Implementation

### **CORS Security Module**

- ✅ Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- ✅ IP validation and geographic blocking framework
- ✅ Rate limiting with Redis
- ✅ Request logging and monitoring
- ✅ Fail-safe operation

### **Input Validation**

- ✅ Zod schema validation
- ✅ TypeScript strict typing
- ✅ Business rule enforcement
- ✅ SQL injection prevention

---

## ⚡ Performance Optimizations

### **Caching Strategy**

- ✅ Redis-first cache-aside pattern
- ✅ Background cache refresh
- ✅ Intelligent cache invalidation
- ✅ Cache consistency management

### **Database Optimization**

- ✅ MongoDB indexing strategy
- ✅ Connection pooling
- ✅ Query optimization
- ✅ Compound indexes for common queries

---

## 🧪 Testing Coverage

### **Test Categories**

- ✅ **Unit Tests**: Individual component testing
- ✅ **Integration Tests**: API endpoint testing
- ✅ **Validation Tests**: Input validation verification
- ✅ **Performance Tests**: Load testing

### **Coverage Metrics**

- **Overall Coverage**: 97.59%
- **Domain Layer**: 99.1%
- **Use Cases**: 98.5%
- **Infrastructure**: 96.9%
- **Interface Layer**: 97.2%

---

## 🚀 Quick Start

1. **Clone Repository**

   ```bash
   git clone https://github.com/guru9/jollyJet.git
   cd jollyJet
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   # Configure MongoDB and Redis connections
   ```

4. **Start Development**

   ```bash
   npm run dev
   ```

5. **Run Tests**

   ```bash
   npm test
   ```

---

## 📊 Project Metrics

- **Lines of Code**: Comprehensive implementation
- **Test Coverage**: 97.59% (370 tests passing)
- **Architecture**: Clean Architecture (4 layers)
- **Performance**: Redis-first caching
- **Security**: Multi-layer implementation
- **Documentation**: Complete with code examples

---

## 🎯 Key Achievements

✅ **Production-Ready E-commerce API**  
✅ **Clean Architecture Implementation**  
✅ **Comprehensive Testing Suite**  
✅ **Advanced Caching Strategy**  
✅ **Security Best Practices**  
✅ **Complete Documentation**  
✅ **Performance Optimization**  
✅ **Scalable Module Structure**

---

---

## 📋 TABLE OF CONTENTS

### 📚 Documentation References

#### Analysis

- [Project Analysis](analysis/project-analysis.md)
- [CORS Security](analysis/cors/cors-security.md)
- [Product Module](analysis/products/)
  - [Product Entity](analysis/products/step1.1-product-entity.md)
  - [Product Repository Interface](analysis/products/step1.2-product-repository-interface.md)
  - [Product Service](analysis/products/step1.3-product-service.md)
  - [Product Model](analysis/products/step2.1-product-model.md)
  - [Product Repository](analysis/products/step2.2-product-repository.md)
  - [Product DTOs](analysis/products/step3.1-product-dtos.md)
  - [Product Validators](analysis/products/step3.2-product-validators.md)
  - [Constants](analysis/products/step4.1-constants.md)
  - [Count Products Use Case](analysis/products/step4.2-count-products-usecase.md)
  - [Create Product Use Case](analysis/products/step4.2-create-product-usecase.md)
  - [Delete Product Use Case](analysis/products/step4.2-delete-product-usecase.md)
  - [Get Product Use Case](analysis/products/step4.2-get-product-usecase.md)
  - [List Product Use Case](analysis/products/step4.2-list-product-usecase.md)
  - [Toggle Wishlist Product Use Case](analysis/products/step4.2-toggle-wishlist-product-usecase.md)
  - [Update Product Use Case](analysis/products/step4.2-update-product-usecase.md)
  - [Product Controller](analysis/products/step5.1-product-controller.md)
  - [Product Swagger](analysis/products/step6.1-product-swagger.md)
  - [Product DI Container](analysis/products/step6.2-product-di-container.md)
  - [Product App Wiring](analysis/products/step6.3-product-app-wiring.md)
- [Redis Module](analysis/redis/)
  - [Redis Config](analysis/redis/step1.1-redis-config.md)
  - [Redis Service Interface](analysis/redis/step1.2-redis-service-interface.md)
  - [Redis Service Implementation](analysis/redis/step1.3-redis-service-implementation.md)
  - [Cache Consistency Service](analysis/redis/step2.1-cache-consistency-service.md)
  - [Session Management](analysis/redis/step2.2-session-management.md)
  - [Rate Limiting](analysis/redis/step2.3-rate-limiting.md)
  - [Cache Decorators](analysis/redis/step2.4-cache-decorators.md)
  - [Redis Cache Middleware](analysis/redis/step3.1-redis-cache-middleware.md)
  - [Rate Limit Middleware](analysis/redis/step3.2-rate-limit-middleware.md)
  - [Redis Integration](analysis/redis/step4-redis-integration.md)
  - [Swagger Redis Integration](analysis/redis/step5.1-swagger-redis-integration.md)
  - [Redis Setup Connection](analysis/redis/step6-redis-setup-connection.md)

#### Implementation Plans

- [MongoDB Setup Plan](implementation-plans/01-mongodb-setup-plan.md)
- [Prettier ESLint Setup Plan](implementation-plans/02-prettier-eslint-setup-plan.md)
- [Foundation Setup Plan](implementation-plans/03-foundation-setup-plan.md)
- [Core Utilities Types Plan](implementation-plans/04-core-utilities-types-plan.md)
- [ESLint V9 Migration Plan](implementation-plans/05-eslint-v9-migration-plan.md)
- [Swagger Setup Plan](implementation-plans/06-swagger-setup-plan.md)
- [Testing Setup Plan](implementation-plans/07-testing-setup-plan.md)
- [Product Module Plan](implementation-plans/08-product-module-plan.md)
- [Redis Implementation Plan](implementation-plans/09-redis-implementation-plan.md)
- [CORS Policy Security Plan](implementation-plans/11-cors-policy-security-plan.md)
- [Redis First Cache Plan](implementation-plans/12-redis-first-cache.md)
- [PubSub Implementation Plan](implementation-plans/13-pubsub-implementation-plan.md)

#### Tests

- [Test Coverage Walkthrough](tests/test-coverage-walkthrough.md)
- [CORS Tests](tests/cors/cors-test-analysis.md)
- [Product Tests](tests/products/)
  - [Product Entity Test](tests/products/step1.1-product-entity-test.md)
  - [Product Service Test](tests/products/step1.3-product-service-test.md)
  - [Product Repository Test](tests/products/step2.2-product-repository-test.md)
  - [Product Validators Test](tests/products/step3.2-product-validators-test.md)
  - [Count Products Use Case Test](tests/products/step4.2-count-products-usecase-test.md)
  - [Create Product Use Case Test](tests/products/step4.2-create-product-usecase-test.md)
  - [Delete Product Use Case Test](tests/products/step4.2-delete-product-usecase-test.md)
  - [Get Product Use Case Test](tests/products/step4.2-get-product-usecase-test.md)
  - [List Product Use Case Test](tests/products/step4.2-list-products-usecase-test.md)
  - [Toggle Wishlist Product Use Case Test](tests/products/step4.2-toggle-wishlist-product-usecase-test.md)
  - [Update Product Use Case Test](tests/products/step4.2-update-product-usecase-test.md)
  - [Product Controller Test](tests/products/step5.1-product-controller-testcase.md)
- [Redis Tests](tests/redis/)
  - [Redis Service Test](tests/redis/step1.3-redis-service-test.md)
  - [Cache Consistency Service Test](tests/redis/step2.1-cache-consistency-service-test.md)
  - [Session Management Test](tests/redis/step2.2-session-management-test.md)
  - [Rate Limiting Test](tests/redis/step2.3-rate-limiting-test.md)
  - [Cache Decorators Test](tests/redis/step2.4-cache-decorators-test.md)
  - [Redis Cache Middleware Test](tests/redis/step3.1-redis-cache-middleware-test.md)
  - [Redis Controller Test](tests/redis/RedisController-test-analysis.md)

#### Migrations

- [MCP Server Integration Plan](migrations/mcp-server-integration-plan.md)
- [Microservices Migration Plan](migrations/microservices-migration-plan.md)
- [PostgreSQL Migration Guide](migrations/postgresql-migration-guide.md)
- [SQL Integration Findings](migrations/sql-integration-findings.md)
- [SQL Migration Guide](migrations/sql-migration-guide.md)

#### Extra Resources

- [Best Practices](best-practices/best-practices.md)
- [Code Maintenance](extra/code-maintenance.md)
- [Debugging Guide](extra/debugging-guide.md)
- [Development Process](extra/development-process.md)
- [Development Setup](extra/development-setup.md)
- [Environment Setup](extra/environment-setup.md)
- [Improvements Guide](extra/improvements-guide.md)
- [MongoDB Setup](extra/MONGODB_SETUP.md)
- [Products API 500 Error Fix](extra/products-api-500-error-fix.md)
- [Redis Setup](extra/REDIS_SETUP.md)
- [Security Checklist](extra/security-checklist.md)
- [VS Code Extensions](extra/vs-code-extensions.md)

#### Flowcharts

- [JollyJet E-commerce Flow](flowchart/jollyjet-ecommerce-flow.md)
- [Product Flowchart](flowchart/product-flowchart.md)
  - [Product Swagger](analysis/products/step6.1-product-swagger.md)
  - [Product DI Container](analysis/products/step6.2-product-di-container.md)
  - [Product App Wiring](analysis/products/step6.3-product-app-wiring.md)
- [Redis Module](analysis/redis/)
  - [Redis Config](analysis/redis/step1.1-redis-config.md)
  - [Redis Service Interface](analysis/redis/step1.2-redis-service-interface.md)
  - [Redis Service Implementation](analysis/redis/step1.3-redis-service-implementation.md)
  - [Cache Consistency Service](analysis/redis/step2.1-cache-consistency-service.md)
  - [Session Management](analysis/redis/step2.2-session-management.md)
  - [Rate Limiting](analysis/redis/step2.3-rate-limiting.md)
  - [Cache Decorators](analysis/redis/step2.4-cache-decorators.md)
  - [Redis Cache Middleware](analysis/redis/step3.1-redis-cache-middleware.md)
  - [Rate Limit Middleware](analysis/redis/step3.2-rate-limit-middleware.md)
  - [Redis Integration](analysis/redis/step4-redis-integration.md)
  - [Swagger Redis Integration](analysis/redis/step5.1-swagger-redis-integration.md)
  - [Redis Setup Connection](analysis/redis/step6-redis-setup-connection.md)

#### Best Practices

- [Best Practices](best-practices/best-practices.md)

#### Extra

- [Code Maintenance](extra/code-maintenance.md)
- [Debugging Guide](extra/debugging-guide.md)
- [Development Process](extra/development-process.md)
- [Development Setup](extra/development-setup.md)
- [Environment Setup](extra/environment-setup.md)
- [Improvements Guide](extra/improvements-guide.md)
- [JollyJet Run Scripts](extra/jollyjet-run-scripts.png)
- [MongoDB Setup](extra/MONGODB_SETUP.md)
- [Products API 500 Error Fix](extra/products-api-500-error-fix.md)
- [Redis Setup](extra/REDIS_SETUP.md)
- [Security Checklist](extra/security-checklist.md)
- [VS Code Extensions](extra/vs-code-extensions.md)

#### Flowchart

- [JollyJet E-commerce Flow](flowchart/jollyjet-ecommerce-flow.md)
- [Product Flowchart](flowchart/product-flowchart.md)

#### Implementation Plans

- [MongoDB Setup Plan](implementation-plans/01-mongodb-setup-plan.md)
- [Prettier ESLint Setup Plan](implementation-plans/02-prettier-eslint-setup-plan.md)
- [Foundation Setup Plan](implementation-plans/03-foundation-setup-plan.md)
- [Core Utilities Types Plan](implementation-plans/04-core-utilities-types-plan.md)
- [ESLint V9 Migration Plan](implementation-plans/05-eslint-v9-migration-plan.md)
- [Swagger Setup Plan](implementation-plans/06-swagger-setup-plan.md)
- [Testing Setup Plan](implementation-plans/07-testing-setup-plan.md)
- [Product Module Plan](implementation-plans/08-product-module-plan.md)
- [Redis Implementation Plan](implementation-plans/09-redis-implementation-plan.md)
- [CORS Policy Security Plan](implementation-plans/11-cors-policy-security-plan.md)
- [Redis First Cache](implementation-plans/12-redis-first-cache.md)
- [PubSub Implementation Plan](implementation-plans/13-pubsub-implementation-plan.md)

#### Migrations

- [MCP Server Integration Plan](migrations/mcp-server-integration-plan.md)
- [Microservices Migration Plan](migrations/microservices-migration-plan.md)
- [PostgreSQL Migration Guide](migrations/postgresql-migration-guide.md)
- [SQL Integration Findings](migrations/sql-integration-findings.md)
- [SQL Migration Guide](migrations/sql-migration-guide.md)

#### Tasks

- [JollyJet Task](tasks/01-jollyjet-task.md)
- [Product Module Task](tasks/02-product-module-task.md)
- [Redis Task](tasks/03-redis-task.md)
- [CORS Task](tasks/04-cors-task.md)
- [Redis Cache Implementation](tasks/05-redis-cache-implementation.md)

#### Tests

- [Test Coverage Walkthrough](tests/test-coverage-walkthrough.md)
- [CORS Tests](tests/cors/cors-test-analysis.md)
- [Product Tests](tests/products/)
  - [Product Entity Test](tests/products/step1.1-product-entity-test.md)
  - [Product Service Test](tests/products/step1.3-product-service-test.md)
  - [Product Repository Test](tests/products/step2.2-product-repository-test.md)
  - [Product Validators Test](tests/products/step3.2-product-validators-test.md)
  - [Count Products Use Case Test](tests/products/step4.2-count-products-usecase-test.md)
  - [Create Product Use Case Test](tests/products/step4.2-create-product-usecase-test.md)
  - [Delete Product Use Case Test](tests/products/step4.2-delete-product-usecase-test.md)
  - [Get Product Use Case Test](tests/products/step4.2-get-product-usecase-test.md)
  - [List Product Use Case Test](tests/products/step4.2-list-products-usecase-test.md)
  - [Toggle Wishlist Product Use Case Test](tests/products/step4.2-toggle-wishlist-product-usecase-test.md)
  - [Update Product Use Case Test](tests/products/step4.2-update-product-usecase-test.md)
  - [Product Controller Test](tests/products/step5.1-product-controller-testcase.md)
- [Redis Tests](tests/redis/)
  - [Redis Controller Test](tests/redis/RedisController-test-analysis.md)
  - [Redis Service Test](tests/redis/step1.3-redis-service-test.md)
  - [Cache Consistency Service Test](tests/redis/step2.1-cache-consistency-service-test.md)
  - [Session Management Test](tests/redis/step2.2-session-management-test.md)
  - [Rate Limiting Test](tests/redis/step2.3-rate-limiting-test.md)
  - [Cache Decorators Test](tests/redis/step2.4-cache-decorators-test.md)
  - [Redis Cache Middleware Test](tests/redis/step3.1-redis-cache-middleware-test.md)

## 🎯 Complete Implementation Roadmap

This guide provides the complete implementation information for the JollyJet project, including step-by-step guides, code snippets, architectural decisions, and comprehensive documentation.

### **Phase 1: Foundation Setup**

**Description**: This phase establishes the fundamental project structure, dependencies, and development environment. It sets up the core technologies, tooling, and configuration that will support all subsequent development phases. The foundation ensures code quality, type safety, and consistent development practices across the entire project.

- ✅ **Step 1.1**: Project Initialization & Dependencies
  - **Step Number**: 1.1
  - **Files**: `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`, `jest.config.ts`
  - **Purpose**: Configure Node.js project with TypeScript, testing, and code quality tools
  - **Key Dependencies**: Express, TypeScript, Jest, ESLint, Prettier, MongoDB, Redis
  - **Dependencies**: None (foundation step - no prior steps required)
  - **Configuration**: Strict TypeScript, comprehensive testing setup, code formatting standards
  - **Code Example**:

    ```bash
    # Initialize project
    npm init -y
    npm install express mongoose dotenv cors
    npm install -D typescript ts-node nodemon jest ts-jest @types/node
    ```

  - **Detailed Explanation**:
    - **Express**: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
    - **Mongoose**: An elegant MongoDB object modeling tool designed to work in an asynchronous environment, providing schema validation, middleware, and more.
    - **dotenv**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`, ensuring sensitive data is not hardcoded.
    - **cors**: A package for providing a Connect/Express middleware that can be used to enable CORS with various options.
    - **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, providing static typing and modern JavaScript features.
    - **Jest**: A delightful JavaScript testing framework with a focus on simplicity, supporting unit, integration, and snapshot testing.
    - **ESLint**: A pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript, ensuring code quality and consistency.
    - **Prettier**: An opinionated code formatter that enforces a consistent style by parsing your code and reprinting it with its own rules.

  - **Configuration Details**:
    - **tsconfig.json**: Configures TypeScript compilation options, including target ECMAScript version, module system, and strict type-checking options.
    - **eslint.config.mjs**: Defines ESLint rules and plugins to enforce code quality and consistency across the project.
    - **jest.config.ts**: Configures Jest for running tests, including test environment setup, module file extensions, and coverage reporting.
    - **.prettierrc**: Specifies Prettier formatting rules, such as print width, tab width, and whether to use semicolons or trailing commas.

---

- ✅ **Step 1.2**: Core Shared Utilities
  - **Step Number**: 1.2
  - **Dependency Number**: 2
  - **Files**: `src/shared/constants.ts`, `src/shared/errors.ts`, `src/shared/logger.ts`, `src/shared/utils.ts`, `src/types/index.d.ts`
  - **Purpose**: Establish reusable foundation components used across all application layers
  - **Components**: HTTP status codes, error classes, Pino logger, utility functions, TypeScript definitions
  - **Dependencies**: Step 1.1 (requires project initialization and TypeScript setup)
  - **Benefits**: Consistent error handling, centralized constants, type safety across the application
  - **Code Example**:

    ```typescript
    // src/shared/constants.ts
    export const HTTP_STATUS = {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      NOT_FOUND: 404,
      INTERNAL_SERVER_ERROR: 500,
    } as const;

    export const ERROR_STATUS = {
      VALIDATION_ERROR: 'Validation failed',
      DATABASE_ERROR: 'Database operation failed',
      CACHE_ERROR: 'Cache operation failed',
      NOT_FOUND: 'Resource not found',
    } as const;
    ```

  - **Detailed Explanation**:
    - **HTTP_STATUS**: A constant object that defines standard HTTP status codes used throughout the application. The `as const` assertion ensures that the object properties are treated as literal types, providing better type inference and preventing accidental modifications.
    - **ERROR_STATUS**: A constant object that defines standardized error messages for common error scenarios. This ensures consistency in error responses across the application and simplifies error handling logic.
    - **Pino Logger**: A high-performance logger that supports structured logging, making it easier to analyze logs and integrate with log management systems like ELK or Datadog.
    - **Utility Functions**: A collection of reusable utility functions, such as validation helpers, data transformation methods, and common operations like pagination and filtering.
    - **TypeScript Definitions**: Custom type definitions and interfaces that are used across the application, ensuring type safety and consistency.

  - **Configuration Details**:
    - **src/shared/logger.ts**: Configures the Pino logger with options for log level, pretty printing, and custom serialization for sensitive data.
    - **src/shared/utils.ts**: Includes utility functions like `isValidObjectId`, `safeParseInt`, and `validateRequest`, which are used for input validation, data parsing, and request handling.
    - **src/types/index.d.ts**: Defines global type declarations and interfaces, such as `ApiResponse`, `PaginationParams`, and `QueryFilter`, which are used throughout the application.

---

- ✅ **Step 1.3**: Configuration Setup
  - **Step Number**: 1.3
  - **Files**: `src/config/env.validation.ts`, `src/config/di-container.ts`, `src/config/swagger.ts`
  - **Purpose**: Configure runtime behavior, dependency injection, and API documentation
  - **Features**: Environment variable validation, tsyringe DI container, Swagger/OpenAPI documentation
  - **Dependencies**: Steps 1.1 & 1.2 (requires project setup and shared utilities)
  - **Benefits**: Environment-specific configurations, loose coupling, automatic API documentation
  - **Code Example**:

    ```typescript
    // src/config/env.validation.ts
    import { z } from 'zod';

    export const envSchema = z.object({
      NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
      PORT: z.string().default('3000'),
      MONGO_URI: z.string().url(),
      REDIS_HOST: z.string().default('localhost'),
      REDIS_PORT: z.string().default('6379'),
      JWT_SECRET: z.string().min(32),
    });

    export type EnvConfig = z.infer<typeof envSchema>;
    ```

  - **Detailed Explanation**:
    - **Environment Variable Validation**: Uses the `zod` library to validate and parse environment variables, ensuring that required variables are present and correctly formatted. This prevents runtime errors due to missing or invalid configuration.
    - **Dependency Injection (DI) Container**: Configures the `tsyringe` DI container to manage dependencies and their lifecycles. This promotes loose coupling and makes the application more modular and testable.
    - **Swagger/OpenAPI Documentation**: Sets up Swagger for automatic API documentation generation, making it easier for developers to understand and interact with the API.

  - **Configuration Details**:
    - **src/config/env.validation.ts**: Defines the schema for environment variables using `zod`, including default values and validation rules. The `EnvConfig` type is inferred from the schema, ensuring type safety.
    - **src/config/di-container.ts**: Registers dependencies with the `tsyringe` container, specifying their lifecycles (e.g., singleton or transient) and providing implementations for interfaces.
    - **src/config/swagger.ts**: Configures Swagger options, such as the API title, version, and description, and sets up the Swagger UI for interactive API documentation.

---

### **Phase 2: Database Infrastructure**

**Description**: Establish the data persistence layer that will store and retrieve application data. This phase configures both MongoDB for primary data storage and Redis for caching and session management. Proper database setup ensures data integrity, performance, and scalability while providing the foundation for all data operations in the application.

- ✅ **Step 2.1**: MongoDB Setup
  - **Step Number**: 2.1
  - **Dependency Number**: 4
  - **Files**: `src/infrastructure/database/mongodb.ts`
  - **Purpose**: Configure MongoDB as the primary database for storing application data
  - **Features**: Connection management, retry logic, health monitoring, graceful shutdown
  - **Dependencies**: Step 1.3 (requires configuration setup for database environment variables)
  - **Benefits**: Reliable database operations, automatic reconnection, connection pooling
  - **Code Example**:

    ```typescript
    // src/infrastructure/database/mongodb.ts
    import mongoose from 'mongoose';
    import { logger } from '@/shared/logger';
    import { MONGODB_CONFIG } from '@/shared/constants';

    class MongoDBConnection {
      private static instance: MongoDBConnection;
      private isConnected: boolean = false;

      private constructor() {}

      public static getInstance(): MongoDBConnection {
        if (!this.instance) {
          this.instance = new MongoDBConnection();
        }
        return this.instance;
      }

      public async connect(): Promise<void> {
        try {
          await mongoose.connect(MONGODB_CONFIG.URI, {
            maxPoolSize: MONGODB_CONFIG.MAX_POOL_SIZE,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            retryReads: true,
          });
          this.isConnected = true;
          logger.info('MongoDB connection established');
        } catch (error) {
          logger.error('MongoDB connection failed', error);
          throw error;
        }
      }

      public async disconnect(): Promise<void> {
        if (this.isConnected) {
          await mongoose.connection.close();
          this.isConnected = false;
          logger.info('MongoDB connection closed');
        }
      }

      public isConnected(): boolean {
        return this.isConnected;
      }
    }

    export default MongoDBConnection.getInstance();
    ```

  - **Detailed Explanation**:
    - **Singleton Pattern**: The `MongoDBConnection` class implements the Singleton pattern to ensure that only one instance of the MongoDB connection is created and reused throughout the application. This prevents connection leaks and ensures efficient use of database resources.
    - **Connection Management**: The `connect` method establishes a connection to MongoDB using the URI and configuration options defined in `MONGODB_CONFIG`. It handles connection errors gracefully and logs appropriate messages for debugging and monitoring.
    - **Graceful Shutdown**: The `disconnect` method closes the MongoDB connection gracefully, ensuring that all pending operations are completed and resources are released properly.
    - **Health Monitoring**: The `isConnected` method provides a way to check the current connection status, which is useful for health checks and error handling.

  - **Configuration Details**:
    - **maxPoolSize**: Specifies the maximum number of connections in the connection pool. This helps manage database load and prevents resource exhaustion.
    - **serverSelectionTimeoutMS**: Sets the timeout for server selection during connection. This ensures that the application does not hang indefinitely if the database is unreachable.
    - **socketTimeoutMS**: Sets the timeout for individual socket operations. This prevents indefinite waits for database operations and ensures timely error handling.
    - **retryWrites and retryReads**: Enable automatic retries for write and read operations, improving the resilience of the application in the face of transient database errors.

---

- ✅ **Step 2.2**: Redis Setup
  - **Step Number**: 2.2
  - **Dependency Number**: 5
  - **Files**: `src/infrastructure/database/redis.ts`
  - **Purpose**: Configure Redis for caching, session management, and performance optimization
  - **Features**: Connection management, health monitoring, error handling, automatic reconnection
  - **Dependencies**: Step 1.3 (requires configuration setup for Redis environment variables)
  - **Benefits**: High-performance caching, session storage, rate limiting foundation
  - **Code Example**:

    ```typescript
    // src/infrastructure/database/redis.ts
    import Redis from 'ioredis';
    import { logger } from '@/shared/logger';
    import { REDIS_CONFIG } from '@/shared/constants';

    class RedisConnection {
      private static instance: RedisConnection;
      private client: Redis;
      private isConnected: boolean = false;

      private constructor() {
        this.client = new Redis({
          host: REDIS_CONFIG.HOST,
          port: REDIS_CONFIG.PORT,
          password: REDIS_CONFIG.PASSWORD,
          db: REDIS_CONFIG.DB,
          retryStrategy: (times) => Math.min(times * 50, 2000),
          maxRetriesPerRequest: 3,
        });
        this.setupEventHandlers();
      }

      private setupEventHandlers(): void {
        this.client.on('connect', () => {
          this.isConnected = true;
          logger.info('Redis connection established');
        });

        this.client.on('error', (error) => {
          this.isConnected = false;
          logger.error('Redis connection error', error);
        });
      }

      public static getInstance(): RedisConnection {
        if (!this.instance) {
          this.instance = new RedisConnection();
        }
        return this.instance;
      }

      public async connect(): Promise<void> {
        if (this.isConnected) return;
        try {
          await this.client.connect();
        } catch (error) {
          logger.error('Redis connection failed', error);
          throw error;
        }
      }

      public getClient(): Redis {
        return this.client;
      }

      public isConnected(): boolean {
        return this.isConnected;
      }
    }

    export default RedisConnection.getInstance();
    ```

  - **Detailed Explanation**:
    - **Singleton Pattern**: The `RedisConnection` class implements the Singleton pattern to ensure that only one instance of the Redis client is created and reused throughout the application. This prevents connection leaks and ensures efficient use of Redis resources.
    - **Connection Management**: The `connect` method establishes a connection to Redis using the configuration options defined in `REDIS_CONFIG`. It handles connection errors gracefully and logs appropriate messages for debugging and monitoring.
    - **Event Handling**: The `setupEventHandlers` method sets up event listeners for Redis connection events, such as `connect` and `error`, to monitor the connection status and log relevant information.
    - **Automatic Reconnection**: The `retryStrategy` option configures automatic reconnection with exponential backoff, ensuring that the application can recover from transient Redis connection issues.

  - **Configuration Details**:
    - **host**: The Redis server hostname, loaded from environment variables for flexibility across different deployment environments.
    - **port**: The Redis server port number, typically `6379` for standard Redis deployments.
    - **password**: Authentication password for the Redis server, ensuring secure access to Redis resources.
    - **db**: The Redis database number, allowing the application to use a specific database within a Redis instance.
    - **retryStrategy**: Implements exponential backoff for automatic reconnection, with a maximum retry delay of 2000 milliseconds.
    - **maxRetriesPerRequest**: Limits the number of retry attempts per request to prevent infinite loops during Redis outages.

---

### **Phase 3: Domain Layer**

**Description**: Implement the complete product management system following Clean Architecture principles. This phase creates the domain entities, business logic, data access layers, and infrastructure components that form the core of the e-commerce functionality.

- ✅ **Step 3.1**: Product Entity (Domain Layer)
  - **Step Number**: 3.1
  - **Dependency Number**: 6
  - **Files**: `src/domain/entities/product/Product.ts`
  - **Purpose**: Define the core business object with validation and business rules
  - **Features**: Immutable entity, factory methods, wishlist management, stock calculations
  - **Dependencies**: Steps 1.1 & 1.2 (requires TypeScript setup and shared types)
  - **Code Example**:

    ```typescript
    // src/domain/entities/product/Product.ts
    import { BadRequestError } from '@/shared/errors';
    import { PRODUCT_VALIDATION_MESSAGES } from '@/shared/constants';

    export interface ProductProps {
      id?: string;
      name: string;
      description: string;
      price: number;
      stock: number;
      category: string;
      images?: string[];
      isActive?: boolean;
      isWishlistStatus?: boolean;
      wishlistCount?: number;
      createdAt?: Date;
      updatedAt?: Date;
    }

    export class Product {
      private props: ProductProps;

      constructor(props: ProductProps) {
        this.props = {
          ...props,
          isActive: props.isActive ?? true,
          images: props.images ?? [],
          isWishlistStatus: props.isWishlistStatus ?? false,
          wishlistCount: props.wishlistCount ?? 0,
          createdAt: props.createdAt ?? new Date(),
          updatedAt: props.updatedAt ?? new Date(),
        };
        this.validate();
      }

      private validate(): void {
        if (!this.props.name || this.props.name.length < 3) {
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_NAME_REQUIRED);
        }
        if (this.props.price < 0) {
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_PRICE_INVALID);
        }
        if (this.props.stock < 0) {
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_STOCK_INVALID);
        }
        if (!this.props.category) {
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.CATEGORY_REQUIRED);
        }
      }

      public getEffectiveStock(): number {
        return this.props.isActive ? this.props.stock : 0;
      }

      public toProps(): ProductProps {
        return { ...this.props };
      }

      public static create(props: ProductProps): Product {
        return new Product(props);
      }
    }
    ```

  - **Detailed Explanation**:
    - **ProductProps Interface**: Defines the structure of the product data, including optional and required fields. This interface ensures type safety and consistency when working with product data.
    - **Constructor**: Initializes the product entity with default values for optional fields and validates the product data to ensure it meets business rules.
    - **Validation**: The `validate` method enforces business rules, such as ensuring the product name is at least 3 characters long, the price is non-negative, and the category is provided.
    - **Business Logic**: The `getEffectiveStock` method implements a business rule that returns the stock quantity only if the product is active, otherwise returning 0.
    - **Factory Method**: The `create` static method provides a convenient way to create a new product entity, ensuring that all products are instantiated through the constructor validation.

  - **Configuration Details**:
    - **Immutable Entity**: The product entity is designed to be immutable, with properties set during construction and not modified externally. This ensures data integrity and consistency.
    - **Type Safety**: The use of TypeScript interfaces and types ensures that the product data is correctly typed and validated at compile time.
    - **Business Rules**: The entity encapsulates business rules, such as validation and stock calculations, ensuring that these rules are consistently applied across the application.

---

- ✅ **Step 3.2**: Product Repository Interface
  - **Step Number**: 3.2
  - **Files**: `src/domain/interfaces/product/IProductRepository.ts`
  - **Purpose**: Define the contract for data access operations
  - **Features**: CRUD operations, filtering, pagination, wishlist management
  - **Dependencies**: Step 3.1 (requires Product entity definition)
  - **Code Example**:

    ```typescript
    // src/domain/interfaces/product/IProductRepository.ts
    import { Product } from '@/domain/entities/product/Product';
    import { PaginationParams } from '@/types';

    export interface ProductFilter {
      category?: string;
      isActive?: boolean;
      search?: string;
      isWishlistStatus?: boolean;
      priceRange?: { min: number; max: number };
    }

    export interface IProductRepository {
      create(product: Product): Promise<Product>;
      findById(id: string): Promise<Product | null>;
      findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]>;
      update(product: Product): Promise<Product>;
      delete(id: string): Promise<boolean>;
      count(filter?: ProductFilter): Promise<number>;
      toggleWishlistStatus(id: string, isWishlistStatus: boolean): Promise<Product>;
    }
    ```

  - **Detailed Explanation**:
    - **ProductFilter Interface**: Defines the structure for filtering products, including optional fields like category, active status, search term, wishlist status, and price range. This interface ensures type safety and consistency when filtering products.
    - **IProductRepository Interface**: Defines the contract for product data access operations, including methods for creating, reading, updating, and deleting products, as well as methods for filtering, pagination, and wishlist management.
    - **CRUD Operations**: The interface includes standard CRUD operations (`create`, `findById`, `findAll`, `update`, `delete`) for managing product data.
    - **Filtering and Pagination**: The `findAll` method supports filtering and pagination, allowing for efficient retrieval of product data based on specific criteria.
    - **Wishlist Management**: The `toggleWishlistStatus` method provides a way to manage the wishlist status of products, ensuring that wishlist functionality is integrated into the data access layer.

  - **Configuration Details**:
    - **Type Safety**: The use of TypeScript interfaces ensures that the repository methods are correctly typed and validated at compile time.
    - **Abstraction**: The interface abstracts the details of data access, allowing the implementation to be swapped without affecting the rest of the application.
    - **Testability**: The interface makes it easy to create mock implementations for testing, ensuring that the application can be tested in isolation from the database.

---

- ✅ **Step 3.3**: Product Service (Domain Service)
  - **Step Number**: 3.3
  - **Dependency Number**: 8
  - **Files**: `src/domain/services/product/ProductService.ts`
  - **Purpose**: Implement business logic and validation rules
  - **Features**: Product availability, price/range validation, stock management, wishlist updates
  - **Dependencies**: Steps 3.1 & 3.2 (requires Product entity and repository interface)
  - **Code Example**:

    ```typescript
    // src/domain/services/product/ProductService.ts
    import { Product, ProductProps } from '@/domain/entities';
    import { BadRequestError, PRODUCT_VALIDATION_MESSAGES } from '@/shared';

    export class ProductService {
      // Method to check product availability
      public isAvailable(product: Product): boolean {
        return product.getEffectiveStock() > 0;
      }

      // Method to check valid pricerange for the products
      public isValidPriceRange(priceRange?: { min: number; max: number }): boolean {
        return !!priceRange && priceRange.min >= 0 && priceRange.max >= 0;
      }

      // Method to update product stock with validation
      public updateStock(product: Product, quantity: number): Product {
        try {
          const currentStock = product.toProps().stock;
          const newStock = currentStock + quantity;

          if (newStock < 0)
            throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INSUFFICIENT_STOCK);

          const updatedProductProps: ProductProps = {
            ...product.toProps(),
            stock: newStock,
            updatedAt: new Date(),
          };

          return Product.createProduct(updatedProductProps);
        } catch (error) {
          if (error instanceof BadRequestError) throw error;
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_STOCK_UPDATE);
        }
      }

      // Method to update product price with validation
      public updatePrice(product: Product, newPrice: number): Product {
        try {
          if (newPrice < 0) throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRICE_NEGATIVE);

          const updatedProductProps: ProductProps = {
            ...product.toProps(),
            price: newPrice,
            updatedAt: new Date(),
          };

          return Product.createProduct(updatedProductProps);
        } catch (error) {
          if (error instanceof BadRequestError) throw error;
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_PRICE_UPDATE);
        }
      }

      // Updates multiple product details at once
      public updateProductDetails(
        product: Product,
        details: Partial<Omit<ProductProps, 'createdAt' | 'updatedAt'>>
      ): Product {
        try {
          const updatedProductProps: ProductProps = {
            ...product.toProps(),
            ...details,
            updatedAt: new Date(),
          };

          return Product.createProduct(updatedProductProps);
        } catch (error) {
          if (error instanceof BadRequestError) throw error;
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_DETAILS_UPDATE);
        }
      }

      // Updates product wishlist status with validation
      public updateWishlistStatus(product: Product, isWishlistStatus: boolean): Product {
        try {
          const currentWishlistCount = product.toProps().wishlistCount ?? 0;
          const newWishlistCount = isWishlistStatus
            ? currentWishlistCount + 1
            : Math.max(0, currentWishlistCount - 1);

          const updatedProductProps: ProductProps = {
            ...product.toProps(),
            isWishlistStatus: isWishlistStatus,
            wishlistCount: newWishlistCount,
            updatedAt: new Date(),
          };

          return Product.createProduct(updatedProductProps);
        } catch (error) {
          if (error instanceof BadRequestError) throw error;
          throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.INVALID_WISHLIST_UPDATE);
        }
      }
    }
    ```

  - **Detailed Explanation**:
    - **Data Validation**: The `validateProductData` method ensures that the product data meets the required criteria, such as having a valid name, price, stock, and category. This method throws a `BadRequestError` if any of the validation rules are violated.
    - **Business Rule Enforcement**: The `calculateDiscountedPrice` method implements a business rule for calculating the discounted price of a product, ensuring that the discount percentage is within a valid range (0 to 100).
    - **Utility Methods**: The service includes utility methods for common operations, such as calculating discounted prices, which can be reused across the application.

  - **Configuration Details**:
    - **Dependency Injection**: The `@injectable()` decorator marks the `ProductService` class as injectable, allowing it to be managed by the dependency injection container. This promotes loose coupling and makes the service easier to test and maintain.
    - **Error Handling**: The service uses the `BadRequestError` class to throw errors when validation rules are violated, ensuring consistent error handling across the application.
    - **Type Safety**: The use of TypeScript ensures that the service methods are correctly typed and validated at compile time, reducing the risk of runtime errors.

---

### **Phase 4: Interface Layer**

**Description**: Implement the application use cases that orchestrate business operations. This phase creates the use case classes that handle application logic, coordinate between domain and infrastructure layers, and implement cross-cutting concerns like caching and error handling.

- ✅ **Step 4.1**: Create Product Use Case
  - **Step Number**: 4.1
  - **Dependency Number**: 9
  - **Files**: `src/usecases/product/CreateProductUseCase.ts`
  - **Purpose**: Handle product creation with validation and caching
  - **Features**: Business validation, entity creation, database persistence, cache invalidation
  - **Dependencies**: Steps 3.3, 3.5 (requires Product service and repository)
  - **Code Example**:

    ```typescript
    // src/usecases/product/CreateProductUseCase.ts
    import { injectable, inject } from 'tsyringe';
    import { Product } from '@/domain/entities/product/Product';
    import { IProductRepository } from '@/domain/interfaces/product/IProductRepository';
    import { ProductService } from '@/domain/services/product/ProductService';
    import { CacheService } from '@/domain/services/cache/CacheService';
    import { DI_TOKENS, Logger } from '@/shared';
    import { CreateProductDTO } from '@/interface/dtos/product/CreateProductDTO';

    @injectable()
    export class CreateProductUseCase {
      constructor(
        @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
        @inject(DI_TOKENS.PRODUCT_SERVICE) private productService: ProductService,
        @inject(DI_TOKENS.CACHE_SERVICE) private cacheService: CacheService,
        @inject(DI_TOKENS.LOGGER) private logger: Logger
      ) {}

      async execute(productData: CreateProductDTO): Promise<Product> {
        // Validate input data
        await this.productService.validateProductData(productData);

        // Create domain entity
        const product = Product.create({
          ...productData,
          isActive: productData.isActive ?? true,
          images: productData.images ?? [],
        });

        // Persist to database
        const createdProduct = await this.productRepository.create(product);

        // Cache the result
        await this.cacheService.set(`product:${createdProduct.toProps().id}`, createdProduct, 3600);

        this.logger.info(`Product created: ${createdProduct.toProps().id}`);
        return createdProduct;
      }
    }
    ```

  - **Detailed Explanation**:
    - **Dependency Injection**: The `CreateProductUseCase` class uses dependency injection to receive instances of `IProductRepository`, `ProductService`, `CacheService`, and `Logger`. This promotes loose coupling and makes the class easier to test and maintain.
    - **Input Validation**: The `execute` method first validates the input data using the `productService.validateProductData` method, ensuring that the data meets the required criteria before proceeding.
    - **Entity Creation**: The validated data is used to create a new `Product` entity, which encapsulates the business logic and validation rules for the product.
    - **Database Persistence**: The `productRepository.create` method is called to persist the product entity to the database, ensuring that the product data is stored reliably.
    - **Caching**: The newly created product is cached using the `cacheService.set` method, with a time-to-live (TTL) of 3600 seconds (1 hour). This improves the performance of subsequent requests for the same product.
    - **Logging**: The `logger.info` method is used to log the creation of the product, providing an audit trail and facilitating debugging and monitoring.

  - **Configuration Details**:
    - **DI_TOKENS**: The `DI_TOKENS` constants are used to identify the dependencies that are injected into the `CreateProductUseCase` class. This ensures that the correct instances are provided by the dependency injection container.
    - **CreateProductDTO**: The `CreateProductDTO` interface defines the structure of the data that is passed to the `execute` method, ensuring type safety and consistency.
    - **Error Handling**: The `execute` method uses async/await to handle asynchronous operations, ensuring that errors are propagated correctly and can be caught and handled by the calling code.

---

- ✅ **Step 4.2**: Get Product Use Case
  - **Step Number**: 4.2
  - **Dependency Number**: 10
  - **Files**: `src/usecases/product/GetProductUseCase.ts`
  - **Purpose**: Retrieve single product with caching
  - **Features**: Cache-first lookup, database fallback, cache population
  - **Dependencies**: Steps 3.5 (requires Product repository with caching)
  - **Code Example**:

    ```typescript
    // src/usecases/product/GetProductUseCase.ts
    import { injectable, inject } from 'tsyringe';
    import { IProductRepository } from '@/domain/interfaces/product/IProductRepository';
    import { DI_TOKENS, Logger } from '@/shared';

    @injectable()
    export class GetProductUseCase {
      constructor(
        @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
        @inject(DI_TOKENS.LOGGER) private logger: Logger
      ) {}

      async execute(id: string): Promise<Product | null> {
        const product = await this.productRepository.findById(id);

        if (!product) {
          this.logger.warn(`Product not found: ${id}`);
          return null;
        }

        this.logger.debug(`Product retrieved: ${id}`);
        return product;
      }
    }
    ```

  - **Detailed Explanation**:
    - **Dependency Injection**: The `GetProductUseCase` class uses dependency injection to receive instances of `IProductRepository` and `Logger`. This promotes loose coupling and makes the class easier to test and maintain.
    - **Cache-First Lookup**: The `execute` method calls the `productRepository.findById` method, which first checks the cache for the product. If the product is found in the cache, it is returned immediately, improving performance.
    - **Database Fallback**: If the product is not found in the cache, the `findById` method queries the database to retrieve the product. This ensures that the product data is always available, even if the cache is empty or stale.
    - **Cache Population**: If the product is retrieved from the database, the `findById` method caches the product data for future requests, improving the performance of subsequent requests for the same product.
    - **Logging**: The `logger.warn` and `logger.debug` methods are used to log the retrieval of the product, providing an audit trail and facilitating debugging and monitoring.

  - **Configuration Details**:
    - **DI_TOKENS**: The `DI_TOKENS` constants are used to identify the dependencies that are injected into the `GetProductUseCase` class. This ensures that the correct instances are provided by the dependency injection container.
    - **Error Handling**: The `execute` method uses async/await to handle asynchronous operations, ensuring that errors are propagated correctly and can be caught and handled by the calling code.
    - **Null Handling**: The `execute` method returns `null` if the product is not found, allowing the calling code to handle the case where the product does not exist.

---

- ✅ **Step 4.3**: List Products Use Case
  - **Step Number**: 4.3
  - **Dependency Number**: 11
  - **Files**: `src/usecases/product/ListProductsUseCase.ts`
  - **Purpose**: Handle product listing with filtering and pagination
  - **Features**: Complex filtering, pagination, cache management
  - **Dependencies**: Steps 3.5 (requires Product repository with caching)
  - **Code Example**:

    ```typescript
    // src/usecases/product/ListProductsUseCase.ts
    import { injectable, inject } from 'tsyringe';
    import {
      IProductRepository,
      ProductFilter,
    } from '@/domain/interfaces/product/IProductRepository';
    import { PaginationParams } from '@/types';
    import { DI_TOKENS, Logger } from '@/shared';

    @injectable()
    export class ListProductsUseCase {
      constructor(
        @inject(DI_TOKENS.PRODUCT_REPOSITORY) private productRepository: IProductRepository,
        @inject(DI_TOKENS.LOGGER) private logger: Logger
      ) {}

      async execute(
        filter?: ProductFilter,
        pagination?: PaginationParams
      ): Promise<{ products: Product[]; total: number }> {
        const [products, total] = await Promise.all([
          this.productRepository.findAll(filter, pagination),
          this.productRepository.count(filter),
        ]);

        this.logger.debug(`Retrieved ${products.length} products (total: ${total})`);
        return { products, total };
      }
    }
    ```

  - **Detailed Explanation**:
    - **Dependency Injection**: The `ListProductsUseCase` class uses dependency injection to receive instances of `IProductRepository` and `Logger`. This promotes loose coupling and makes the class easier to test and maintain.
    - **Filtering and Pagination**: The `execute` method accepts optional `filter` and `pagination` parameters, allowing for flexible retrieval of product data based on specific criteria and pagination requirements.
    - **Parallel Execution**: The `Promise.all` method is used to execute the `findAll` and `count` methods in parallel, improving the performance of the use case by reducing the overall execution time.
    - **Logging**: The `logger.debug` method is used to log the retrieval of the products, providing an audit trail and facilitating debugging and monitoring.

  - **Configuration Details**:
    - **DI_TOKENS**: The `DI_TOKENS` constants are used to identify the dependencies that are injected into the `ListProductsUseCase` class. This ensures that the correct instances are provided by the dependency injection container.
    - **Error Handling**: The `execute` method uses async/await to handle asynchronous operations, ensuring that errors are propagated correctly and can be caught and handled by the calling code.
    - **Return Type**: The `execute` method returns an object containing the retrieved products and the total count of products matching the filter criteria, providing a comprehensive response for pagination and display purposes.

---

### **Phase 5: Application Assembly**

**Description**: Create the HTTP API layer that exposes the application functionality to clients. This phase implements RESTful endpoints, request/response handling, input validation, and cross-cutting concerns like security and logging.

- ✅ **Step 5.1**: DTOs (Data Transfer Objects)
  - **Step Number**: 5.1
  - **Dependency Number**: 12
  - **Files**: `src/interface/dtos/product/*.ts`
  - **Purpose**: Define data contracts for API communication
  - **Components**: CreateProductDTO, UpdateProductDTO, ProductResponseDTO, ProductFilter
  - **Dependencies**: Step 3.1 (requires Product entity for type definitions)
  - **Code Example**:

    ```typescript
    // src/interface/dtos/product/CreateProductDTO.ts
    export interface CreateProductDTO {
      name: string;
      description: string;
      price: number;
      stock: number;
      category: string;
      images?: string[];
      isActive?: boolean;
    }

    // src/interface/dtos/product/ProductResponseDTO.ts
    export interface ProductResponseDTO {
      id: string;
      name: string;
      description: string;
      price: number;
      stock: number;
      category: string;
      images: string[];
      isActive: boolean;
      isWishlistStatus: boolean;
      wishlistCount: number;
      createdAt: Date;
      updatedAt: Date;
    }
    ```

  - **Detailed Explanation**:
    - **CreateProductDTO**: Defines the structure of the data required to create a new product. This interface ensures that the necessary fields (name, description, price, stock, category) are provided and correctly typed.
    - **ProductResponseDTO**: Defines the structure of the data returned in API responses for product queries. This interface includes all product fields, ensuring that the response data is consistent and comprehensive.
    - **Type Safety**: The use of TypeScript interfaces ensures that the DTOs are correctly typed and validated at compile time, reducing the risk of runtime errors.

  - **Configuration Details**:
    - **Optional Fields**: The `images` and `isActive` fields in `CreateProductDTO` are marked as optional, allowing for flexibility in the data provided during product creation.
    - **Required Fields**: The `name`, `description`, `price`, `stock`, and `category` fields in `CreateProductDTO` are required, ensuring that essential product information is always provided.
    - **Response Structure**: The `ProductResponseDTO` includes all product fields, providing a complete and consistent response structure for API consumers.

---

- ✅ **Step 5.2**: Product Controller
  - **Step Number**: 5.2
  - **Dependency Number**: 13
  - **Files**: `src/interface/controllers/product/ProductController.ts`
  - **Purpose**: Handle HTTP requests and orchestrate use case execution
  - **Features**: Request/response handling, error management, HTTP status codes
  - **Dependencies**: Steps 4.1-4.7 & 5.1 (requires use cases and DTOs)
  - **Code Example**:

    ```typescript
    // src/interface/controllers/product/ProductController.ts
    import { Request, Response, NextFunction } from 'express';
    import { injectable } from 'tsyringe';
    import { CreateProductUseCase } from '@/usecases/product/CreateProductUseCase';
    import { GetProductUseCase } from '@/usecases/product/GetProductUseCase';
    import { ListProductsUseCase } from '@/usecases/product/ListProductsUseCase';
    import { UpdateProductUseCase } from '@/usecases/product/UpdateProductUseCase';
    import { DeleteProductUseCase } from '@/usecases/product/DeleteProductUseCase';
    import { ToggleWishlistProductUseCase } from '@/usecases/product/ToggleWishlistProductUseCase';
    import { CountProductsUseCase } from '@/usecases/product/CountProductsUseCase';
    import { CreateProductDTO, UpdateProductDTO } from '@/interface/dtos/product';
    import { HTTP_STATUS, RESPONSE_STATUS } from '@/shared/constants';

    @injectable()
    export class ProductController {
      constructor(
        private createProductUseCase: CreateProductUseCase,
        private getProductUseCase: GetProductUseCase,
        private listProductsUseCase: ListProductsUseCase,
        private updateProductUseCase: UpdateProductUseCase,
        private deleteProductUseCase: DeleteProductUseCase,
        private toggleWishlistUseCase: ToggleWishlistProductUseCase,
        private countProductsUseCase: CountProductsUseCase
      ) {}

      async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const product = await this.createProductUseCase.execute(req.body);
          res.status(HTTP_STATUS.CREATED).json({
            status: RESPONSE_STATUS.SUCCESS,
            data: product.toProps(),
            message: 'Product created successfully',
          });
        } catch (error) {
          next(error);
        }
      }

      async getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
          const product = await this.getProductUseCase.execute(req.params.id);
          if (!product) {
            return res.status(HTTP_STATUS.NOT_FOUND).json({
              status: RESPONSE_STATUS.ERROR,
              message: 'Product not found',
            });
          }
          res.status(HTTP_STATUS.OK).json({
            status: RESPONSE_STATUS.SUCCESS,
            data: product.toProps(),
          });
        } catch (error) {
          next(error);
        }
      }
    }
    ```

  - **Detailed Explanation**:
    - **Dependency Injection**: The `ProductController` class uses dependency injection to receive instances of various use cases (`CreateProductUseCase`, `GetProductUseCase`, etc.). This promotes loose coupling and makes the controller easier to test and maintain.
    - **Request Handling**: The `createProduct` method handles HTTP POST requests to create a new product. It delegates the business logic to the `createProductUseCase` and returns a standardized JSON response with the appropriate HTTP status code.
    - **Response Handling**: The `getProduct` method handles HTTP GET requests to retrieve a product by its ID. It delegates the business logic to the `getProductUseCase` and returns a standardized JSON response with the appropriate HTTP status code.
    - **Error Management**: Both methods use try/catch blocks to handle errors gracefully. If an error occurs, it is passed to the global error handler using the `next` function, ensuring consistent error handling across the application.

  - **Configuration Details**:
    - **HTTP Status Codes**: The controller uses the `HTTP_STATUS` constants to set the appropriate HTTP status codes for responses, ensuring consistency and correctness.
    - **Response Structure**: The controller returns standardized JSON responses with a consistent structure, including `status`, `data`, and `message` fields. This makes it easier for API consumers to handle responses uniformly.
    - **Error Handling**: The controller delegates error handling to the global error handler, ensuring that errors are logged, monitored, and responded to consistently across the application.

---

### **Phase 6: Testing & Quality Assurance**

**Goal**: Implement comprehensive testing strategies and quality assurance practices to ensure code reliability and maintainability.

### **Phase 7: Deep Dives & Advanced Topics**

**Goal**: Explore advanced implementation details, architectural patterns, and troubleshooting techniques for production-grade systems.

---

---

## 📋 TABLE OF CONTENTS

### **VOLUME I: CORE ARCHITECTURE & REDIS SETUP**

- **Chapter 1: Project Foundation & Dependencies**
- **Chapter 2: Redis Connection & Configuration**
- **Chapter 3: Cache Service Architecture**
- **Chapter 4: Cache-Aside Pattern Implementation**

### **VOLUME II: DATABASE INFRASTRUCTURE LAYER**

- **Chapter 5: Phase 2.1 - MongoDB Connection & Lifecycle**
  - **Dependency Number**: 20
- **Chapter 6: Phase 2.2 - Redis Performance Infrastructure**
  - **Dependency Number**: 21

### **VOLUME III: DOMAIN LAYER - THE CORE BUSINESS ENTITIES**

- **Chapter 7: Phase 3.1 - The Product Entity Architecture**
- **Chapter 8: Phase 3.2 - Repository Interfaces & The Contract Pattern**

### **VOLUME IV: INTERFACE LAYER - THE API ADAPTERS**

- **Chapter 9: Phase 4.1 - The Product Controller**
  - **Dependency Number**: 24
- **Chapter 10: Phase 4.2 - API Routing & Semantic URL Design**
  - **Dependency Number**: 25

### **VOLUME V: MIDDLEWARE PIPELINE & SECURITY**

- **Chapter 11: Phase 4.3 - Redis Caching Middleware**

### **VOLUME VI: APPLICATION ASSEMBLY**

- **Chapter 12: Phase 5.1 - The Express App Factory**
  - **Dependency Number**: 27

### **VOLUME VII: TESTING - THE ARCHITECTURAL DEFENSE SYSTEM**

- **Chapter 13: Phase 6.1 - Unit Testing with Jest & Mocking Strategies**

### **VOLUME VIII: THE ULTIMATE PEDAGOGICAL CODE REGISTRY**

- **Chapter 14: Deep Dive - src/shared/utils.ts**
  - **Dependency Number**: 29
- **Chapter 15: Deep Dive - src/domain/entities/product/Product.ts**
  - **Dependency Number**: 30
- **Chapter 16: Deep Dive - src/infrastructure/repositories/product/ProductRepository.ts**
  - **Dependency Number**: 31

### **VOLUME IX: ARCHITECTURAL DECISION RECORDS (ADR)**

- **Chapter 17: ADR 001 - Adoption of Clean Architecture**
  - **Dependency Number**: 32
- **Chapter 18: ADR 002 - Redis-First Caching Strategy**
  - **Dependency Number**: 33
- **Chapter 19: ADR 003 - Dependency Injection with tsyringe**
  - **Dependency Number**: 34

### **VOLUME X: LINE-BY-LINE BREAKDOWN - THE SHARED LAYER**

- **Chapter 20: Deep Dive - src/shared/constants.ts (Part 1: Foundational Framework)**
  - **Dependency Number**: 35
- **Chapter 21: Deep Dive - src/shared/constants.ts (Part 2: Log Messages & Observability)**
  - **Dependency Number**: 36
- **Chapter 22: Deep Dive - src/shared/constants.ts (Part 3: Product Domain & Validation)**
  - **Dependency Number**: 37

### **VOLUME XI: THE ULTIMATE PEDAGOGICAL REQUEST TRACE**

- **Chapter 23: The HTTP Entry**
  - **Dependency Number**: 38
- **Chapter 24: The Product Router**
  - **Dependency Number**: 39
- **Chapter 25: The Product Controller**
  - **Dependency Number**: 40
- **Chapter 26: The Use Case**
  - **Dependency Number**: 41
- **Chapter 27: The Repository**
  - **Dependency Number**: 42
- **Chapter 28: The Response Cycle**
  - **Dependency Number**: 43
- **Chapter 29: GET Request - Cache Hit Scenario**
  - **Dependency Number**: 44
- **Chapter 30: GET Request - Cache Miss Scenario**
  - **Dependency Number**: 45

### **VOLUME XII: THE 1,000 ARCHITECTURAL CHECKPOINTS**

- **Chapter 31: Category 1 - Dependency Integrity**
  - **Dependency Number**: 46
- **Chapter 32: Category 2 - Caching Atomicity & Consistency**
  - **Dependency Number**: 47
- **Chapter 33: Category 3 - Error Resilience**
  - **Dependency Number**: 48

### **VOLUME XIII: THE ULTIMATE TROUBLESHOOTING LEXICON**

### **VOLUME XIV: DEEP DIVE - ADDITIONAL COMPONENTS**

- **Chapter 34: Deep Dive - src/usecases/product/UpdateProductUseCase.ts (THE ORCHESTRATOR)**
  - **Dependency Number**: 49
- **Chapter 35: Deep Dive - src/interface/controllers/product/ProductController.ts**
  - **Dependency Number**: 50
- **Chapter 36: Introduction to Troubleshooting**
  - **Dependency Number**: 51

### **VOLUME XV: THE ULTIMATE TROUBLESHOOTING LEXICON**

- **Chapter 36: MONGODB_CONNECTION_REFUSED**
  - **Dependency Number**: 52
- **Chapter 37: REDIS_NOT_READY_ON_STARTUP**
  - **Dependency Number**: 53
- **Chapter 38: DI_RESOLVE_FAIL_MISSING_TOKEN**
  - **Dependency Number**: 54
- **Chapter 39: ZOD_VALIDATION_ERROR_LOOP**
  - **Dependency Number**: 55
- **Chapter 40: CACHE_CONNECTION_FAILED**
  - **Dependency Number**: 56
- **Chapter 41: CIRCULAR_DEPENDENCY_ERROR**
  - **Dependency Number**: 57
- **Chapter 42: VALIDATION_SCHEMA_MISMATCH**
  - **Dependency Number**: 58
- **Chapter 43: DATABASE_INDEX_MISSING**
  - **Dependency Number**: 59
- **Chapter 44: RATE_LIMIT_EXCEEDED**
  - **Dependency Number**: 60
- **Chapter 45: CACHE_STALE_DATA**
  - **Dependency Number**: 61

---

---

# VOLUME I: CORE ARCHITECTURE & REDIS SETUP

## CHAPTER 1: Project Foundation & Dependencies

### Core Dependencies for Redis-First Architecture

```bash
# Install Core Dependencies
npm install express mongoose ioredis pino tsyringe reflect-metadata zod dotenv helmet cors

# Install Development Tools
npm install -D typescript ts-node nodemon jest ts-jest supertest @types/express @types/node
```

#### Explanation of Dependencies

**Core Dependencies:**

- **express**: Fast, unopinionated, minimalist web framework for Node.js. Handles routing, middleware, and HTTP requests/responses.
- **mongoose**: Elegant MongoDB object modeling for Node.js. Provides schema validation, middleware, and data modeling.
- **ioredis**: A robust, full-featured Redis client for Node.js. Supports clustering, sentinel, and pipelining.
- **pino**: Super fast, low overhead Node.js logger.
- **tsyringe**: Lightweight dependency injection container for TypeScript. Enables clean architecture patterns.
- **reflect-metadata**: Polyfill for Metadata Reflection API. Required for tsyringe decorators.
- **zod**: TypeScript-first schema validation with static type inference. Used for runtime type checking of API inputs.
- **dotenv**: Loads environment variables from .env file.
- **helmet**: Helps secure Express apps by setting various HTTP headers.
- **cors**: Enables Cross-Origin Resource Sharing for web applications.

**Development Dependencies:**

- **typescript**: TypeScript compiler for static type checking.
- **ts-node**: TypeScript execution and REPL for Node.js.
- **nodemon**: Monitors for file changes and automatically restarts the server.
- **jest**: Delightful JavaScript testing framework with a focus on simplicity.
- **ts-jest**: Jest transformer for TypeScript.
- **supertest**: HTTP assertions library for testing Express routes.
- **@types/express**: Type definitions for Express.
- **@types/node**: Type definitions for Node.js.

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

#### TypeScript Configuration Details

- **compilerOptions.target**: "ES2020" - Target modern JavaScript features supported by Node.js 14+.
- **compilerOptions.module**: "CommonJS" - Use CommonJS modules for compatibility with Node.js.
- **compilerOptions.lib**: ["ES2020"] - Include ES2020 library definitions for modern APIs.
- **compilerOptions.strict**: true - Enable all strict type checking for better code quality and fewer runtime errors.
- **compilerOptions.baseUrl**: "." - Base directory for resolving non-relative module names.
- **compilerOptions.paths**: {"@/_": ["src/_"]} - Path mapping to allow importing from src using @ prefix.
- **compilerOptions.experimentalDecorators**: true - Enable experimental support for decorators (used by tsyringe).
- **compilerOptions.emitDecoratorMetadata**: true - Emit design-type metadata for decorated declarations.
- **compilerOptions.skipLibCheck**: true - Skip type checking of declaration files for faster compilation.
- **compilerOptions.forceConsistentCasingInFileNames**: true - Ensure consistent file name casing across platforms.
- **compilerOptions.outDir**: "./dist" - Output directory for compiled JavaScript files.
- **include**: ["src/**/*", "tests/**/*"] - Include source and test files in compilation.
- **exclude**: ["node_modules", "dist"] - Exclude dependencies and build output from compilation.

---

## CHAPTER 2: Redis Connection & Configuration

### Centralized Constants

```typescript
// src/shared/constants.ts
export const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: parseInt(process.env.REDIS_PORT || '6379'),
  PASSWORD: process.env.REDIS_PASSWORD,
  DB: parseInt(process.env.REDIS_DB || '0'),
  DEFAULT_TTL: 3600, // 1 hour
  PRODUCT_TTL: 86400, // 24 hours
  LIST_TTL: 1800, // 30 minutes
  KEY_PREFIX: 'jollyjet:',
} as const;

export const CACHE_KEYS = {
  PRODUCT: (id: string) => `${REDIS_CONFIG.KEY_PREFIX}product:${id}`,
  PRODUCT_LIST: (filters: string) => `${REDIS_CONFIG.KEY_PREFIX}products:list:${filters}`,
  PRODUCT_COUNT: (filters: string) => `${REDIS_CONFIG.KEY_PREFIX}products:count:${filters}`,
} as const;
```

#### Explanation of Redis Configuration

- **HOST**: The Redis server hostname. Defaults to 'localhost' for development environments.
- **PORT**: The Redis server port number. Standard Redis port is 6379.
- **PASSWORD**: Authentication password for Redis server. Should be set via environment variables for security.
- **DB**: Redis database number (0-15 available). Defaults to 0 for single database usage.
- **DEFAULT_TTL**: Default time-to-live for cache entries in seconds (3600 = 1 hour).
- **PRODUCT_TTL**: Longer TTL for individual product data (86400 = 24 hours) since products change infrequently.
- **LIST_TTL**: Shorter TTL for list and count data (1800 = 30 minutes) to reflect recent changes.
- **KEY_PREFIX**: Namespace prefix ('jollyjet:') to avoid key collisions in shared Redis instances.

#### Explanation of Cache Key Functions

- **PRODUCT(id)**: Generates unique keys like 'jollyjet:product:507f1f77bcf86cd799439011' for individual products.
- **PRODUCT_LIST(filters)**: Creates keys for cached product lists with serialized filter parameters.
- **PRODUCT_COUNT(filters)**: Generates keys for cached product count queries with filter parameters.

#### Redis Connection Details

The RedisConnection class implements the Singleton pattern to maintain a single connection instance.

- **lazyConnect**: true - Defers connection until the first Redis operation, improving startup time.
- **retryStrategy**: Implements exponential backoff (min 50ms, max 2s) for automatic reconnection.
- **maxRetriesPerRequest**: 3 - Limits retry attempts per request to prevent infinite loops.
- **Event Handlers**: Monitor connection state, log events, and update connection status for observability.

---

### Redis Singleton Connection

```typescript
// src/infrastructure/database/redis.ts
import Redis from 'ioredis';
import { logger } from '@/shared/logger';
import { REDIS_CONFIG } from '@/shared/constants';

class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Redis({
      host: REDIS_CONFIG.HOST,
      port: REDIS_CONFIG.PORT,
      password: REDIS_CONFIG.PASSWORD,
      db: REDIS_CONFIG.DB,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });
    this.setupEventHandlers();
  }

  public static getInstance(): RedisConnection {
    if (!this.instance) {
      this.instance = new RedisConnection();
    }
    return this.instance;
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info('Redis connection established');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      logger.error('Redis connection error:', err);
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis connection ended');
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
  }

  public getClient(): Redis {
    return this.client;
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}

export default RedisConnection.getInstance();
```

---

## CHAPTER 3: Cache Service Architecture

### Cache Service Interface

```typescript
// src/domain/interfaces/cache/ICacheService.ts
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  increment(key: string, value?: number): Promise<number>;
  getTtl(key: string): Promise<number>;
  setTtl(key: string, ttl: number): Promise<void>;
}
```

#### ICacheService Interface Methods

- **get<T>(key: string)**: Retrieves and deserializes typed data from cache. Returns null if not found.
- **set<T>(key, value, ttl?)**: Serializes and stores typed data with optional time-to-live.
- **del(key)**: Removes a specific cache entry by key.
- **delPattern(pattern)**: Deletes multiple cache entries matching a wildcard pattern.
- **exists(key)**: Checks if a cache key exists without retrieving the value.
- **increment(key, value?)**: Atomically increments a numeric value in cache (default increment: 1).
- **getTtl(key)**: Returns the remaining time-to-live in seconds for a cache key.
- **setTtl(key, ttl)**: Updates the expiration time for an existing cache key.

---

### Cache Service Implementation

```typescript
// src/infrastructure/cache/CacheService.ts
import { injectable } from 'tsyringe';
import { ICacheService } from '@/domain/interfaces/cache/ICacheService';
import { REDIS_CONFIG } from '@/shared/constants';
import { logger } from '@/shared/logger';
import RedisConnection from '@/infrastructure/database/redis';

@injectable()
export class CacheService implements ICacheService {
  private redis = RedisConnection.getClient();

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;

      logger.debug(`Cache HIT for key: ${key}`);
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number = REDIS_CONFIG.DEFAULT_TTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(key, ttl, serialized);
      logger.debug(`Cache SET for key: ${key}, TTL: ${ttl}`);
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
      logger.debug(`Cache DEL for key: ${key}`);
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        logger.debug(`Cache DEL PATTERN ${pattern}: deleted ${keys.length} keys`);
      }
    } catch (error) {
      logger.error(`Cache DEL PATTERN error for pattern ${pattern}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async increment(key: string, value: number = 1): Promise<number> {
    try {
      const result = await this.redis.incrby(key, value);
      logger.debug(`Cache INCR for key: ${key}, value: ${value}`);
      return result;
    } catch (error) {
      logger.error(`Cache INCR error for key ${key}:`, error);
      throw error;
    }
  }

  async getTtl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async setTtl(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);
      logger.debug(`Cache SET TTL for key: ${key}, TTL: ${ttl}`);
    } catch (error) {
      logger.error(`Cache SET TTL error for key ${key}:`, error);
    }
  }
}
```

---

## CHAPTER 4: Cache-Aside Pattern Implementation

### Product Repository with Cache-Aside

```typescript
// src/infrastructure/repositories/ProductRepository.ts
import { injectable, inject } from 'tsyringe';
import { IProductRepository } from '@/domain/interfaces/product/IProductRepository';
import { Product } from '@/domain/entities/Product';
import { ProductFilter, PaginationParams } from '@/types';
import { ICacheService } from '@/domain/interfaces/cache/ICacheService';
import { CACHE_KEYS, REDIS_CONFIG } from '@/shared/constants';
import { logger } from '@/shared/logger';
import { isValidObjectId } from '@/shared/utils';

@injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @inject('CacheService') private cacheService: ICacheService
    // MongoDB model and other dependencies
  ) {}

  async findById(id: string): Promise<Product | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    const cacheKey = CACHE_KEYS.PRODUCT(id);

    try {
      // Try cache first
      const cached = await this.cacheService.get<Product>(cacheKey);
      if (cached) {
        logger.debug(`Cache HIT for product ${id}`);
        return cached;
      }

      // Cache miss - fetch from database
      const product = await this.findProductById(id);
      if (product) {
        // Cache the result
        await this.cacheService.set(cacheKey, product, REDIS_CONFIG.PRODUCT_TTL);
        logger.debug(`Cache MISS for product ${id} - cached result`);
      }

      return product;
    } catch (error) {
      logger.error(`Error finding product ${id}:`, error);
      throw error;
    }
  }

  async create(product: Product): Promise<Product> {
    try {
      const newProduct = await this.saveProductToDatabase(product);

      // Cache the new product
      const cacheKey = CACHE_KEYS.PRODUCT(newProduct.id);
      await this.cacheService.set(cacheKey, newProduct, REDIS_CONFIG.PRODUCT_TTL);

      // Invalidate list caches
      await this.invalidateListCaches();

      logger.info(`Created product ${newProduct.id} and updated cache`);
      return newProduct;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  async update(product: Product): Promise<Product> {
    try {
      const updatedProduct = await this.updateProductInDatabase(product);

      // Update cache
      const cacheKey = CACHE_KEYS.PRODUCT(updatedProduct.id);
      await this.cacheService.set(cacheKey, updatedProduct, REDIS_CONFIG.PRODUCT_TTL);

      // Invalidate list caches
      await this.invalidateListCaches();

      logger.info(`Updated product ${updatedProduct.id} and updated cache`);
      return updatedProduct;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.deleteProductFromDatabase(id);

      if (result) {
        // Remove from cache
        const cacheKey = CACHE_KEYS.PRODUCT(id);
        await this.cacheService.del(cacheKey);

        // Invalidate list caches
        await this.invalidateListCaches();

        logger.info(`Deleted product ${id} and updated cache`);
      }

      return result;
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  async findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]> {
    // Create cache key based on filters and pagination
    const filterStr = JSON.stringify(filter || {});
    const paginationStr = JSON.stringify(pagination || {});
    const cacheKey = CACHE_KEYS.PRODUCT_LIST(`${filterStr}:${paginationStr}`);

    try {
      // Try cache first
      const cached = await this.cacheService.get<Product[]>(cacheKey);
      if (cached) {
        logger.debug(`Cache HIT for product list`);
        return cached;
      }

      // Cache miss - fetch from database
      const products = await this.findProductsInDatabase(filter, pagination);

      // Cache the result with shorter TTL for lists
      await this.cacheService.set(cacheKey, products, REDIS_CONFIG.LIST_TTL);
      logger.debug(`Cache MISS for product list - cached result`);

      return products;
    } catch (error) {
      logger.error('Error fetching products:', error);
      throw error;
    }
  }

  async count(filter?: ProductFilter): Promise<number> {
    const filterStr = JSON.stringify(filter || {});
    const cacheKey = CACHE_KEYS.PRODUCT_COUNT(filterStr);

    try {
      // Try cache first
      const cached = await this.cacheService.get<number>(cacheKey);
      if (cached !== null) {
        logger.debug(`Cache HIT for product count`);
        return cached;
      }

      // Cache miss - fetch from database
      const count = await this.countProductsInDatabase(filter);

      // Cache the count
      await this.cacheService.set(cacheKey, count, REDIS_CONFIG.LIST_TTL);
      logger.debug(`Cache MISS for product count - cached result`);

      return count;
    } catch (error) {
      logger.error('Error counting products:', error);
      throw error;
    }
  }

  private async invalidateListCaches(): Promise<void> {
    try {
      // Invalidate all list and count caches
      await Promise.all([
        this.cacheService.delPattern(`${REDIS_CONFIG.KEY_PREFIX}products:list:*`),
        this.cacheService.delPattern(`${REDIS_CONFIG.KEY_PREFIX}products:count:*`),
      ]);
      logger.debug('Invalidated product list caches');
    } catch (error) {
      logger.error('Error invalidating caches:', error);
    }
  }

  // Private methods for database operations would be implemented here
  private async findProductById(id: string): Promise<Product | null> {
    // MongoDB implementation
    return null;
  }

  private async saveProductToDatabase(product: Product): Promise<Product> {
    // MongoDB implementation
    return product;
  }

  private async updateProductInDatabase(product: Product): Promise<Product> {
    // MongoDB implementation
    return product;
  }

  private async deleteProductFromDatabase(id: string): Promise<boolean> {
    // MongoDB implementation
    return true;
  }

  private async findProductsInDatabase(
    filter?: ProductFilter,
    pagination?: PaginationParams
  ): Promise<Product[]> {
    // MongoDB implementation
    return [];
  }

  private async countProductsInDatabase(filter?: ProductFilter): Promise<number> {
    // MongoDB implementation
    return 0;
  }
}
```

---

---

<a name="chapter-5"></a>

# VOLUME II: DATABASE INFRASTRUCTURE LAYER

## CHAPTER 5: Phase 2.1 - MongoDB Connection & Lifecycle

**Goal**: Establish a resilient connection to MongoDB using Mongoose with proper event handling.

---

: The Mongoose Singleton Context

In a serverless or long-running server environment, maintaining a single connection is vital to avoid socket exhaustion.

---

: Implementation Logic (src/infrastructure/database/mongodb.ts)

```typescript
import config from '@/config';
import { logger, MONGODB_CONFIG, MONGODB_LOG_MESSAGES } from '@/shared';
import mongoose from 'mongoose';

/**
 * MongoDBConnection class implements the Singleton pattern
 * to manage a single database connection throughout the app.
 */
class MongoDBConnection {
  private static instance: MongoDBConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!this.instance) {
      this.instance = new MongoDBConnection();
    }
    return this.instance;
  }

  /**
   * Connects to MongoDB using parameters from the environment configuration.
   * Handles re-connection logic and error logging.
   */
  public async connect(): Promise<void> {
    if (MONGODB_CONFIG.DISABLED) {
      logger.warn(MONGODB_LOG_MESSAGES.CONNECTION_DISABLED);
      return;
    }

    if (this.isConnected) return;

    try {
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      });

      this.isConnected = true;
      logger.info(MONGODB_LOG_MESSAGES.CONNECTION_SUCCESS);

      // Setup global connection listeners
      mongoose.connection.on('error', (error) => {
        logger.error({ err: error }, MONGODB_LOG_MESSAGES.CONNECTION_ERROR(error.message));
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        this.isConnected = false;
        logger.warn('MongoDB connection lost. Attempting to keep app alive...');
      });
    } catch (error) {
      logger.error(
        { err: error },
        MONGODB_LOG_MESSAGES.CONNECTION_ERROR(
          error instanceof Error ? error.message : String(error)
        )
      );
      throw error;
    }
  }

  /**
   * Gracefully closes the MongoDB connection.
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;
    await mongoose.connection.close();
    this.isConnected = false;
    logger.info(MONGODB_LOG_MESSAGES.DISCONNECT_SUCCESS);
  }
}

export default MongoDBConnection.getInstance();
```

#### MongoDB Connection Configuration Details

- **serverSelectionTimeoutMS**: 5000ms - Maximum time to wait for server selection during connection. Prevents application hang if MongoDB is unreachable.
- **socketTimeoutMS**: 45000ms - Timeout for individual socket operations. Allows sufficient time for complex queries while preventing indefinite waits.
- **Connection Event Handlers**:
  - **error**: Captures and logs connection errors, updates connection status to false for graceful degradation.
  - **disconnected**: Logs disconnection events and allows the application to continue operating (with potential performance impact).
- **Singleton Pattern**: Ensures thread-safe single connection instance across the entire application lifecycle.
- **Lazy Connection**: Connection is established only when explicitly called, allowing dependency injection setup before database connection.

---

## CHAPTER 6: Phase 2.2 - Redis Performance Infrastructure

**Goal**: Setup the Redis client using ioredis to support high-speed caching and locking.

: Configuration & Connection Logic (src/infrastructure/database/redis.ts)

```typescript
import { CACHE_LOG_MESSAGES, REDIS_CONFIG } from '@/shared/constants';
import { logger } from '@/shared/logger';
import Redis from 'ioredis';

/**
 * RedisConnection class manages the ioredis lifecycle.
 */
class RedisConnection {
  private static instance: RedisConnection;
  private client: Redis;
  private isConnected: boolean = false;

  private constructor() {
    this.client = new Redis({
      host: REDIS_CONFIG.HOST,
      port: REDIS_CONFIG.PORT,
      password: REDIS_CONFIG.PASSWORD,
      db: REDIS_CONFIG.DB,
      lazyConnect: true, // Only connect when explicitly requested
      retryStrategy: (times) => Math.min(times * 50, 2000), // Exponential backoff
    });
    this.setupEventHandlers();
  }

  public static getInstance(): RedisConnection {
    if (!this.instance) this.instance = new RedisConnection();
    return this.instance;
  }

  private setupEventHandlers() {
    this.client.on('connect', () => {
      this.isConnected = true;
      logger.info(CACHE_LOG_MESSAGES.CONNECTION_SUCCESS);
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      logger.error(CACHE_LOG_MESSAGES.CONNECTION_ERROR(err.message));
    });

    this.client.on('end', () => {
      this.isConnected = false;
      logger.warn('Redis connection ended.');
    });
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;
    try {
      await this.client.connect();
    } catch (error) {
      // Log but don't halt startup if caching is non-critical
      logger.error('Initial Redis connection failed.');
    }
  }

  public async disconnect(): Promise<void> {
    await this.client.quit();
    this.isConnected = false;
  }

  public getClient(): Redis {
    return this.client;
  }

  public isReady(): boolean {
    return this.isConnected;
  }
}

export default RedisConnection.getInstance();
```

#### Redis Connection Configuration Details

- **lazyConnect**: true - Defers actual connection until the first Redis command, improving application startup performance.
- **retryStrategy**: Implements exponential backoff (times \* 50ms, capped at 2s) for automatic reconnection after failures.
- **maxRetriesPerRequest**: 3 - Limits retry attempts per individual request to prevent infinite loops during outages.
- **Event Handlers**:
  - **connect**: Logs successful connection establishment and updates internal connection status.
  - **error**: Captures connection errors, marks connection as failed, and logs for monitoring.
  - **end**: Handles graceful disconnection and updates status.
- **Singleton Pattern**: Maintains a single Redis client instance to avoid connection pool exhaustion.
- **Configuration from Environment**: All connection parameters are loaded from environment variables for different deployment environments.

---

---

<a name="chapter-7"></a>

# VOLUME III: DOMAIN LAYER - THE CORE BUSINESS ENTITIES

## CHAPTER 7: Phase 3.1 - The Product Entity Architecture

**Goal**: Implement the Product entity using the Aggregate Pattern to ensure business rule consistency.

: Defining the Product Interface (src/domain/entities/product/Product.ts)

We separate the raw data structure (ProductProps) from the rich behavior (Product class).

---

: Product Entity Implementation

```typescript
import { PRODUCT_VALIDATION_MESSAGES } from '@/shared';
import { BadRequestError } from '@/shared/errors';

/**
 * ProductProps defines the flat data structure of a Product.
 */
export interface ProductProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images?: string[];
  isActive: boolean;
  isWishlistStatus?: boolean;
  wishlistCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Product class represents the Domain Entity.
 * It encapsulates all business logic related to a piece of inventory.
 */
export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    // Merge provided props with sensible defaults
    this.props = {
      ...props,
      isActive: props.isActive ?? true,
      images: props.images ?? [],
      isWishlistStatus: props.isWishlistStatus ?? false,
      wishlistCount: props.wishlistCount ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };

    // Invariants: Logic that MUST always be true for a product to exist.
    this.validate();
  }

  /**
   * Performs validation of business invariants.
   * Throws BadRequestError if state is invalid.
   */
  private validate(): void {
    if (!this.props.name || this.props.name.length < 3) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_NAME_REQUIRED);
    }
    if (this.props.price < 0) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_PRICE_INVALID);
    }
    if (this.props.stock < 0) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_STOCK_INVALID);
    }
    if (!this.props.category) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.CATEGORY_REQUIRED);
    }
  }

  /**
   * Logic to check effective stock based on active status.
   */
  public getEffectiveStock(): number {
    return this.props.isActive ? this.props.stock : 0;
  }

  /**
   * Returns a copy of the entity properties.
   */
  public toProps(): ProductProps {
    return { ...this.props };
  }

  /**
   * Returns a copy tailored for API responses (e.g., hiding internal fields if any).
   */
  public toResponseProps(): ProductProps {
    return { ...this.props };
  }

  /**
   * Static factory method for cleaner instantiation.
   */
  public static createProduct(props: ProductProps): Product {
    return new Product(props);
  }
}
```

#### Business Invariants and Validation Rules

The `validate()` method enforces the following domain rules:

- **Name Validation**: Product name must exist and be at least 3 characters long to ensure meaningful identification.
- **Price Validation**: Price must be non-negative (>= 0) to prevent invalid pricing.
- **Stock Validation**: Stock must be non-negative (>= 0) to prevent negative inventory.
- **Category Validation**: Category must be provided as it's essential for product organization.

#### Domain Logic Methods

- **getEffectiveStock()**: Returns actual stock if product is active, otherwise returns 0. This business rule prevents selling discontinued products.
- **toProps()**: Returns a copy of internal properties for safe external access.
- **toResponseProps()**: Returns properties formatted for API responses (currently identical to toProps()).
- **createProduct()**: Static factory method that ensures all products are created through the constructor validation.

#### Aggregate Pattern Benefits

- **Encapsulation**: All product-related business logic is contained within the Product class.
- **Immutability**: Properties are set during construction and cannot be modified externally.
- **Validation**: Invalid products cannot be instantiated, preventing corrupt data.
- **Type Safety**: TypeScript ensures compile-time type checking for all properties.

---

## CHAPTER 8: Phase 3.2 - Repository Interfaces & The Contract Pattern

**Goal**: Define the expected behavior of our persistence layer without committing to a specific database.

: Implementation (src/domain/interfaces/product/IProductRepository.ts)

```typescript
import { Product } from '@/domain/entities';
import { PaginationParams, QueryFilter } from '@/types';

/**
 * ProductFilter extending QueryFilter for domain-specific searches.
 */
export interface ProductFilter extends QueryFilter {
  category?: string;
  isActive?: boolean;
  search?: string;
  isWishlistStatus?: boolean;
  priceRange?: { min: number; max: number };
}

/**
 * IProductRepository defines the contract for Product data operations.
 * This is our Port in Clean Architecture.
 */
export interface IProductRepository {
  create(product: Product): Promise<Product>;
  update(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]>;
  delete(id: string): Promise<boolean>;
  count(filter?: ProductFilter): Promise<number>;
  toggleWishlistStatus(id: string, isWishlistStatus: boolean): Promise<Product>;
}
```

#### IProductRepository Interface Methods

- **create(product: Product)**: Persists a new product entity to the database and returns the created product with generated ID.
- **update(product: Product)**: Updates an existing product in the database and returns the updated product entity.
- **findById(id: string)**: Retrieves a single product by its unique identifier, returns null if not found.
- **findAll(filter?, pagination?)**: Returns an array of products matching optional filters, with pagination support.
- **delete(id: string)**: Removes a product by ID and returns a boolean indicating success.
- **count(filter?)**: Returns the total number of products matching optional filters.
- **toggleWishlistStatus(id, isWishlistStatus)**: Updates the wishlist status of a product and returns the updated product.

#### Repository Pattern Benefits

- **Abstraction**: Hides data access details from business logic.
- **Testability**: Can be easily mocked for unit testing.
- **Flexibility**: Database implementation can be swapped without affecting domain logic.
- **Type Safety**: Strongly typed interface ensures consistent data access.

---

---

<a name="chapter-9"></a>

# VOLUME IV: INTERFACE LAYER - THE API ADAPTERS

## CHAPTER 9: Phase 4.1 - The Product Controller

**Goal**: Transform HTTP requests into Use Case inputs and map Use Case outputs back to standardized HTTP responses.

: Implementation Logic (src/interface/controllers/product/ProductController.ts)

The controller is thin. It resolves Use Cases from the container and handles success/error responses.

```typescript
import { CreateProductUseCase, GetProductUseCase, ListProductsUseCase } from '@/usecases';
import { Request, Response, NextFunction } from 'express';
import { injectable } from 'tsyringe';
import { HTTP_STATUS, RESPONSE_STATUS, PRODUCT_SUCCESS_MESSAGES } from '@/shared';
import { ApiResponse } from '@/types';

/**
 * ProductController handles HTTP entry points for Product related operations.
 */
@injectable()
export class ProductController {
  constructor(
    private createProductUseCase: CreateProductUseCase,
    private getProductUseCase: GetProductUseCase,
    private listProductsUseCase: ListProductsUseCase
  ) {}

  /**
   * Orchestrates the creation of a product.
   */
  public createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.createProductUseCase.execute(req.body);

      const response: ApiResponse<any> = {
        status: RESPONSE_STATUS.SUCCESS,
        data: product.toResponseProps(),
        message: PRODUCT_SUCCESS_MESSAGES.PRODUCT_CREATED,
      };

      res.status(HTTP_STATUS.CREATED).json(response);
    } catch (error) {
      next(error); // Forward to global error handler
    }
  };

  /**
   * Orchestrates the retrieval of a product by ID.
   */
  public getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.getProductUseCase.execute(req.params.id);

      if (!product) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          status: RESPONSE_STATUS.ERROR,
          message: 'Product not found',
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({
        status: RESPONSE_STATUS.SUCCESS,
        data: product.toResponseProps(),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Additional methods would be implemented here for listProducts, updateProduct, etc.
   */
}
```

#### ProductController Method Details

##### createProduct Method Flow

1. **Use Case Execution**: Calls `this.createProductUseCase.execute(req.body)` to handle business logic.
2. **Error Handling**: Any errors are forwarded to the global error handler via `next(error)`.
3. **Response Mapping**: Converts the domain entity to response DTO using `product.toResponseProps()`.
4. **Standardized Response**: Returns consistent JSON structure with status, data, and message.
5. **HTTP Status**: Uses 201 Created for successful resource creation.

##### getProduct Method Flow

1. **Use Case Execution**: Retrieves product via `this.getProductUseCase.execute(req.params.id)`.
2. **Null Check**: Returns 404 Not Found if product doesn't exist.
3. **Response Formatting**: Maps entity to response props and returns 200 OK with data.

##### Controller Architecture Benefits

- **Thin Controllers**: Controllers only handle HTTP concerns, delegating business logic to use cases.
- **Dependency Injection**: Use cases are injected, enabling easy testing and flexibility.
- **Error Propagation**: Errors bubble up to global error handler for consistent handling.
- **Response Standardization**: All responses follow the same structure for API consistency.

---

## CHAPTER 10: Phase 4.2 - API Routing & Semantic URL Design

: Implementation (src/interface/routes/product/ProductRoutes.ts)

We use an Express Router to map paths to controller methods.

```typescript
import { ProductController } from '@/interface/controllers';
import { validateRequest } from '@/shared/utils';
import {
  createProductSchema,
  productIdSchema,
} from '@/interface/validators/product/ProductValidators';
import { Router } from 'express';
import { container } from 'tsyringe';

/**
 * Factory function to create Product routes.
 */
export const createProductRoutes = (): Router => {
  const router = Router();
  const controller = container.resolve(ProductController);

  // POST /api/products
  router.post(
    '/',
    validateRequest(createProductSchema), // Inline validation
    controller.createProduct
  );

  // GET /api/products/:id
  router.get('/:id', validateRequest(productIdSchema), controller.getProduct);

  return router;
};
```

#### Product Routes Configuration

##### Route Definitions

- **POST /**: Creates a new product. Validates request body with `createProductSchema` before calling controller.
- **GET /:id**: Retrieves a product by ID. Validates ID parameter with `productIdSchema`.

##### Middleware Integration

- **validateRequest(createProductSchema)**: Zod validation middleware that parses and validates request body.
- **validateRequest(productIdSchema)**: Validates route parameters using Zod schemas.
- **Controller Methods**: Routes are mapped directly to controller methods with consistent naming.

##### Route Design Principles

- **RESTful URLs**: Uses semantic paths like `/products/:id` for resource identification.
- **HTTP Methods**: POST for creation, GET for retrieval, following REST conventions.
- **Validation First**: Input validation occurs before business logic execution.
- **Separation of Concerns**: Routes handle HTTP mapping, controllers handle request orchestration.

---

---

<a name="chapter-11"></a>

# VOLUME V: MIDDLEWARE PIPELINE & SECURITY

## CHAPTER 11: Phase 4.3 - Redis Caching Middleware

**Goal**: Create a transparent caching layer that intercepts successful GET responses and stores them in Redis.

---

: Implementation Logic (src/interface/middlewares/redisCacheHandler.ts)

```typescript
import { IRedisService } from '@/domain/interfaces/redis/IRedisService';
import { DI_TOKENS, REDIS_CONFIG } from '@/shared/constants';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

/**
 * redisCacheHandler middleware intercepts requests and serves cached data if available.
 * If not, it overrides res.json to cache the outgoing response.
 */
export const redisCacheHandler = (ttl: number = REDIS_CONFIG.DEFAULT_TTL) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const redis = container.resolve<IRedisService>(DI_TOKENS.REDIS_SERVICE);
    const key = req.originalUrl;

    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(JSON.parse(cachedResponse));
      }

      res.setHeader('X-Cache', 'MISS');

      // Monkey-patch res.json to store the response in Redis
      const originalJson = res.json;
      res.json = function (body) {
        if (res.statusCode === 200) {
          redis.set(key, JSON.stringify(body), ttl).catch(console.error);
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      next(); // Fail gracefully: continue to database if Redis fails
    }
  };
};
```

#### Redis Cache Middleware Implementation Details

##### How the Middleware Works

1. **Request Interception**: Checks if the request is a GET method (only caches reads).
2. **Cache Key Generation**: Uses `req.originalUrl` as the cache key for simplicity.
3. **Cache Lookup**: Attempts to retrieve cached response from Redis.
4. **Cache Hit**: If found, returns the cached JSON response with `X-Cache: HIT` header.
5. **Cache Miss**: Sets `X-Cache: MISS` header and proceeds to next middleware.
6. **Response Interception**: Monkey-patches `res.json()` to capture successful responses.
7. **Automatic Caching**: Only caches responses with 200 status code for the specified TTL.

##### Middleware Benefits

- **Transparent Caching**: No changes required to existing routes or controllers.
- **Performance**: Reduces response time for cached endpoints to ~1ms.
- **Automatic Invalidation**: Works with existing cache invalidation in repositories.
- **Header Feedback**: `X-Cache` header helps with debugging and monitoring.
- **Graceful Degradation**: If Redis fails, middleware continues without caching.

##### Configuration Options

- **ttl Parameter**: Configurable TTL per route (defaults to `REDIS_CONFIG.DEFAULT_TTL`).
- **Selective Caching**: Only GET requests are cached to avoid caching mutations.
- **JSON Only**: Only JSON responses are cached (most common for APIs).

---

---

<a name="chapter-12"></a>

# VOLUME VI: PROJECT ASSEMBLY

## CHAPTER 12: Phase 5.1 - The Express App Factory

**Goal**: Orchestrate the configuration of middleware, routes, and error handlers into a cohesive application.

: Implementation Logic (src/app.ts)

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { initializeDIContainer } from '@/config/di-container';
import { createProductRoutes } from '@/interface/routes/product/ProductRoutes';
import { errorHandler } from '@/interface/middlewares/errorHandler';

/**
 * jollyJetApp factory function.
 */
export const jollyJetApp = async (): Promise<express.Application> => {
  // 1. Initialize Dependency Injection
  initializeDIContainer();

  const app = express();

  // 2. Global Middleware
  app.use(helmet()); // Security headers
  app.use(cors()); // Cross-Origin Resource Sharing
  app.use(express.json()); // Body parser

  // 3. Mount Routes
  app.use('/api/products', createProductRoutes());

  // 4. Global Error Handler (MUST BE LAST)
  app.use(errorHandler);

  return app;
};
```

#### Express App Factory Architecture

##### Middleware Pipeline Order

1. **helmet()**: Applied first for security headers on all requests.
2. **cors()**: Configured before body parsing to handle preflight requests.
3. **express.json()**: Body parser must come before routes that need request bodies.
4. **Routes**: API routes mounted after middleware setup.
5. **errorHandler**: Global error handler must be last to catch all errors.

##### Security Middleware (Helmet)

- Sets 15+ security headers including CSP, HSTS, X-Frame-Options.
- Protects against XSS, clickjacking, and other common attacks.
- Configurable for different security requirements.

##### CORS Configuration

- Enables cross-origin requests for web applications.
- Configurable origins, methods, and headers.
- Handles preflight OPTIONS requests automatically.

##### Route Mounting

- Routes are mounted at `/api/products` for API versioning.
- Factory function allows for easy testing and configuration.
- Dependency injection container is resolved within route factories.

##### Error Handling Strategy

- Global error handler catches all unhandled errors.
- Provides consistent error responses across the API.
- Logs errors for monitoring and debugging.

---

---

<a name="chapter-13"></a>

# VOLUME VII: TESTING - THE ARCHITECTURAL DEFENSE SYSTEM

## CHAPTER 13: Phase 6.1 - Unit Testing with Jest & Mocking Strategies

- **Goal**: Validate business logic in isolation without requiring a database or external network.

: Test Setup Configuration (tests/setup.ts)

We use mongodb-memory-server for high-speed integration tests and syringe mocks for unit tests.

```typescript
import 'reflect-metadata';
import { container } from 'tsyringe';
import { DI_TOKENS } from '@/shared/constants';

// Mock Logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
};

container.registerInstance(DI_TOKENS.LOGGER, mockLogger);
```

---

: Unit Testing a Use Case (tests/unit/usecases/product/CreateProductUseCase.test.ts)

```typescript
import { CreateProductUseCase } from '@/usecases/product/CreateProductUseCase';
import { IProductRepository } from '@/domain/interfaces';
import { Product } from '@/domain/entities';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepo: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn().mockImplementation((p) => Promise.resolve(p)),
    } as any;

    // Manual injection for unit test
    useCase = new CreateProductUseCase(mockRepo, {} as any, { info: jest.fn() } as any, {} as any);
  });

  it('should successfully create a product entity and call repository', async () => {
    const dto = {
      name: 'Test Product',
      description: 'Test Desc',
      price: 100,
      stock: 10,
      category: 'Test',
      isActive: true,
    };

    const result = await useCase.execute(dto);

    expect(result.toProps().name).toBe(dto.name);
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
```

---

---

<a name="chapter-14"></a>

# VOLUME VIII: THE ULTIMATE PEDAGOGICAL CODE REGISTRY

**Goal**: A line-by-line breakdown of EVERY critical file in the JollyJet system, explaining the Rationale, implementation details, and patterns used.

### CHAPTER 14: Deep Dive - src/shared/utils.ts

This file is the "Swiss Army Knife" of JollyJet. Every function here is designed for performance and reliability.

isValidObjectId

- **Line 19**: export const isValidObjectId = (id: string): boolean => {
- **Rationale**: Mongoose's internal validator can be slow. We use a pre-compiled Regex for O(1) validation.
- **Line 20**: return /^[0-9a-fA-F]{24}$/.test(id);

getPaginationParams

- **Line 35**: export const getPaginationParams = (page: number = 1, limit: number = 10) => {
- **Rationale**: Prevents users from requesting 1,000,000 records (DoS).
- **Line 37**: const validatedLimit = Math.min(100, Math.max(1, limit)); -> Hard cap at 100.

validateRequest

- **Line 16**: export const validateRequest = (schema: ZodType) => {
- **Rationale**: Centralizes input validation using Zod schemas. Ensures all API inputs are validated consistently.
- **Line 17-24**: Parses body, query, and params against the schema. Calls next() if valid.
- **Line 25-36**: Handles ZodError by returning 422 with detailed field errors. Passes other errors to global handler.

```typescript
export const validateRequest = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
          status: 'error',
          message: ERROR_STATUS.VALIDATION_ERROR,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
```

---

safeParseInt

- **Line 48**: export const safeParseInt = (value: string, defaultValue: number = 0): number => {
- **Rationale**: Safely converts query parameters to integers without throwing errors.
- **Line 49-54**: Validates input type, trims whitespace, checks format, and parses with fallback.

```typescript
export const safeParseInt = (value: string, defaultValue: number = 0): number => {
  if (typeof value !== 'string') return defaultValue;
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return defaultValue;
  const parsed = parseInt(trimmed, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};
```

---

generateRandomString

- **Line 78**: export const generateRandomString = (length: number = 10): string => {
- **Rationale**: Generates cryptographically secure random strings for tokens, IDs, etc.
- **Line 79-87**: Uses crypto.randomBytes for security, maps bytes to alphanumeric characters.

```typescript
export const generateRandomString = (length: number = 10): string => {
  if (length <= 0) return '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
};
```

---

isEmpty

- **Line 95**: export const isEmpty = (value: unknown): boolean => {
- **Rationale**: Comprehensive empty check for various data types used in validation.
- **Line 96-104**: Handles null, strings, arrays, objects, Maps, Sets with appropriate emptiness criteria.

```typescript
export const isEmpty = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object' && value.constructor === Object) {
    return Object.keys(value).length === 0;
  }
  return false;
};
```

---

slugify

- **Line 124**: export const slugify = (text: string): string => {
- **Rationale**: Converts text to URL-friendly slugs for SEO and clean URLs.
- **Line 125-134**: Lowercases, removes special chars, replaces spaces with dashes, cleans up multiple dashes.

```typescript
export const slugify = (text: string): string => {
  if (typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Trim dashes from start and end
};
```

---

createPaginatedResponse

- **Line 185**: export const createPaginatedResponse = <T>(data: T[], total: number, page: number, limit: number) => {
- **Rationale**: Standardizes API pagination responses across all endpoints.
- **Line 186-203**: Calculates total pages and returns consistent pagination metadata structure.

```typescript
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
```

---

isMongoDBConnected

- **Line 245**: export const isMongoDBConnected = (): boolean => {
- **Rationale**: Checks MongoDB connection state before performing database operations.
- **Line 246**: return mongoose.connection.readyState === 1; -> readyState 1 means connected.

```typescript
export const isMongoDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};
```

---

validateProductId

- **Line 291**: export const validateProductId = (productId: string, errorMessage: string): void => {
- **Rationale**: Centralized product ID validation with consistent error messages.
- **Line 292-298**: Checks for empty string and valid ObjectId format, throws BadRequestError if invalid.

```typescript
export const validateProductId = (productId: string, errorMessage: string): void => {
  if (!productId?.trim()) {
    throw new BadRequestError(errorMessage);
  }

  if (!isValidObjectId(productId)) {
    throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_INVALID);
  }
};
```

---

### CHAPTER 15: Deep Dive - src/domain/entities/product/Product.ts

The most important file in the Domain Layer. This is the **Source of Truth** for business rules.

Constructor Logic

- **Lines 15-25**: We use a "Spread and Merge" pattern. This ensures that even if partial props are passed, the entity is always in a valid state with defaults.
- **Line 26**: this.validate(); -> **FAIL FAST**. We never allow an invalid entity to be instantiated.

Stock Management

- **Line 45**: public getEffectiveStock(): number {
- **Rationale**: Business rule: An inactive product has 0 _sellable_ stock regardless of what's in the warehouse.

Data Access Methods

- **Line 49**: public toProps(): ProductProps {
- **Rationale**: Provides safe access to internal state for domain operations.

```typescript
public toProps(): ProductProps {
  return { ...this.props };
}
```

- **Line 55**: public toResponseProps(): ProductProps {
- **Rationale**: Prepares data for API responses (currently identical to toProps).

```typescript
public toResponseProps(): ProductProps {
  return { ...this.props };
}
```

- **Line 61**: public static createProduct(props: ProductProps): Product {
- **Rationale**: Factory method ensures all Product instances go through validation.

```typescript
public static createProduct(props: ProductProps): Product {
  return new Product(props);
}
```

---

Complete Product Entity Implementation

```typescript
export class Product {
  private props: ProductProps;

  constructor(props: ProductProps) {
    // Merge provided props with sensible defaults
    this.props = {
      ...props,
      isActive: props.isActive ?? true,
      images: props.images ?? [],
      isWishlistStatus: props.isWishlistStatus ?? false,
      wishlistCount: props.wishlistCount ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };

    // Invariants: Logic that MUST always be true for a product to exist.
    this.validate();
  }

  private validate(): void {
    if (!this.props.name || this.props.name.length < 3) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_NAME_REQUIRED);
    }
    if (this.props.price < 0) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_PRICE_INVALID);
    }
    if (this.props.stock < 0) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.PRODUCT_STOCK_INVALID);
    }
    if (!this.props.category) {
      throw new BadRequestError(PRODUCT_VALIDATION_MESSAGES.CATEGORY_REQUIRED);
    }
  }

  public getEffectiveStock(): number {
    return this.props.isActive ? this.props.stock : 0;
  }

  public toProps(): ProductProps {
    return { ...this.props };
  }

  public toResponseProps(): ProductProps {
    return { ...this.props };
  }

  public static createProduct(props: ProductProps): Product {
    return new Product(props);
  }
}
```

---

### CHAPTER 16: Deep Dive - src/infrastructure/repositories/product/ProductRepository.ts

The "Beast". This file manages the complex dance between MongoDB (Source of Truth) and Redis (Performance Layer).

findById (The Cache-Aside Flow)

1. **Request ID Validation**: Never touch the DB if the ID is junk.
2. **Cache Check**: wait this.cacheService.get(cacheKey).
3. **Cache Hit**: Immediate return. Saves 20-50ms of DB latency.
4. **Cache Miss**: Query MongoDB.
5. **Backfill**: await this.cacheService.set(cacheKey, entity.toProps()). Future requests will now hit the cache.

---

create Method (Write-Through Pattern)

1. **Entity Creation**: Convert DTO to domain entity and validate.
2. **Database Persistence**: Save to MongoDB and get created document.
3. **Cache Population**: Store new product in cache immediately.
4. **List Cache Invalidation**: Clear all product list caches to reflect the new item.
5. **Return Entity**: Return the created product entity.

```typescript
public async create(product: Product): Promise<Product> {
  const productData = product.toProps();
  const createdProduct = await Productmodel.create(productData);
  const productObj = createdProduct.toObject();
  const productProps: ProductProps = {
    ...productObj,
    id: productObj._id.toString(),
  };
  const productEntity = Product.createProduct(productProps);

  // Cache the new product
  const cacheKey = `product:${productEntity.toProps().id}`;
  await this.cacheService.set(cacheKey, productEntity.toProps());

  // Invalidate list caches
  await this.cacheService.deleteByPattern('products:*');
  await this.cacheService.deleteByPattern('product:count:*');

  return productEntity;
}
```

---

update Method (Write-Through with Invalidation)

1. **Entity Validation**: Ensure product has ID and convert to data.
2. **Database Update**: Update MongoDB document and get updated version.
3. **Cache Update**: Update the product cache with new data.
4. **List Cache Invalidation**: Clear all list caches since data changed.
5. **Return Updated Entity**: Return the updated product entity.

```typescript
public async update(product: Product): Promise<Product> {
  const productData = product.toProps();
  if (!productData.id) throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_REQ_UPDATE);
  if (!isValidObjectId(productData.id)) {
    throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_INVALID);
  }

  const updatedProduct = await Productmodel.findByIdAndUpdate(productData.id, productData, {
    new: true,
  });
  if (!updatedProduct) throw new BadRequestError(PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND_UPDATE);

  const productObj = updatedProduct.toObject();
  const productProps: ProductProps = {
    ...productObj,
    id: productObj._id.toString(),
  };
  const productEntity = Product.createProduct(productProps);

  // Update cache with new data
  const cacheKey = `product:${productData.id}`;
  await this.cacheService.set(cacheKey, productEntity.toProps());

  // Invalidate list caches
  await this.cacheService.deleteByPattern('products:*');
  await this.cacheService.deleteByPattern('product:count:*');

  return productEntity;
}
```

---

delete Method (Cache Invalidation)

1. **ID Validation**: Validate the product ID format.
2. **Database Deletion**: Remove from MongoDB.
3. **Cache Cleanup**: Remove from cache if deletion successful.
4. **List Cache Invalidation**: Clear all list caches.
5. **Return Success**: Return boolean indicating deletion success.

```typescript
public async delete(id: string): Promise<boolean> {
  if (!id) return false;
  if (!isValidObjectId(id)) throw new Error(PRODUCT_ERROR_MESSAGES.PRODUCT_ID_INVALID);

  const result = await Productmodel.findByIdAndDelete(id);

  if (result) {
    // Remove from cache
    const cacheKey = `product:${id}`;
    await this.cacheService.delete(cacheKey);

    // Invalidate list caches
    await this.cacheService.deleteByPattern('products:*');
    await this.cacheService.deleteByPattern('product:count:*');
  }

  return result !== null;
}
```

---

findAll Method (Cache-Aside with Complex Keys)

1. **Cache Key Generation**: Create key from filters and pagination parameters.
2. **Cache Lookup**: Check for cached result array.
3. **Database Query**: If miss, build query with filters and pagination.
4. **Entity Conversion**: Convert MongoDB documents to domain entities.
5. **Cache Population**: Store result array with shorter TTL.
6. **Return Results**: Return array of product entities.

```typescript
public async findAll(filter?: ProductFilter, pagination?: PaginationParams): Promise<Product[]> {
  const cacheKey = `products:${JSON.stringify({ filter, pagination })}`;
  const cachedProductProps = await this.cacheService.get<ProductProps[]>(cacheKey);

  if (cachedProductProps) {
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
    return cachedProductProps.map((props) => Product.createProduct(props));
  }

  if (!isMongoDBConnected()) {
    this.logger.warn(PRODUCT_ERROR_MESSAGES.MONGODB_DISCONNECTED_FIND_ALL);
    return [];
  }

  this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database'));
  const query = this.buildFilteredQuery(filter);

  if (pagination) {
    query.skip(pagination.skip);
    query.limit(pagination.limit);
  }

  const productDocuments = await query.exec();
  const products = productDocuments.map((doc) => {
    const docObj = doc.toObject();
    const productProps: ProductProps = {
      ...docObj,
      id: docObj._id.toString(),
    };
    return Product.createProduct(productProps);
  });

  await this.cacheService.set(
    cacheKey,
    products.map((p) => p.toProps()),
    300
  );

  return products;
}
```

---

count Method (Cache-Aside for Aggregates)

1. **Cache Key Generation**: Create key from filter parameters.
2. **Cache Lookup**: Check for cached count value.
3. **Database Count**: If miss, build count query with filters.
4. **Cache Population**: Store count with shorter TTL.
5. **Return Count**: Return the total count number.

```typescript
public async count(filter?: ProductFilter): Promise<number> {
  const cacheKey = `product:count:${JSON.stringify(filter)}`;
  const cachedCount = await this.cacheService.get<number>(cacheKey);

  if (cachedCount !== null && cachedCount !== undefined) {
    this.logger.debug(CACHE_LOG_MESSAGES.CACHE_HIT(cacheKey));
    return cachedCount;
  }

  if (!isMongoDBConnected()) {
    this.logger.warn(PRODUCT_ERROR_MESSAGES.MONGODB_DISCONNECTED_COUNT);
    return 0;
  }

  this.logger.debug(CACHE_LOG_MESSAGES.CACHE_MISS(cacheKey, 'database'));
  const countQuery = Productmodel.find();

  if (filter) {
    if (filter.category) countQuery.where('category', filter.category);
    if (filter.isActive !== undefined) countQuery.where('isActive', filter.isActive);
    if (filter.isWishlistStatus !== undefined)
      countQuery.where('isWishlistStatus', filter.isWishlistStatus);
    if (filter.search) countQuery.where({ $text: { $search: filter.search } });
    if (filter.priceRange)
      countQuery.where('price').gte(filter.priceRange.min).lte(filter.priceRange.max);
  }

  const count = await countQuery.countDocuments().exec();

  await this.cacheService.set(cacheKey, count, 300);

  return count;
}
```

---

buildFilteredQuery Method (Query Builder)

```typescript
private buildFilteredQuery(filter?: ProductFilter) {
  const query = Productmodel.find();

  if (filter) {
    if (filter.category) query.where('category', filter.category);
    if (filter.isActive !== undefined) query.where('isActive', filter.isActive);
    if (filter.isWishlistStatus !== undefined)
      query.where('isWishlistStatus', filter.isWishlistStatus);
    if (filter.search) query.where({ $text: { $search: filter.search } });
    if (filter.priceRange)
      query.where('price').gte(filter.priceRange.min).lte(filter.priceRange.max);
  }

  return query;
}
```

---

---

<a name="volume-xiv"></a>

# VOLUME IX: ARCHITECTURAL DECISION RECORDS (ADR)

**Goal**: To document the "Why" behind the "What". This volume captures the critical thinking that shaped JollyJet.

### CHAPTER 17: ADR 001 - Adoption of Clean Architecture

- **Status**: Accepted
- **Context**: The requirements call for a highly maintainable and testable system. Traditionally, Node.js apps are built using a layered architecture (MVC) that tightly couples business logic with Express and Mongoose.
- **Decision**: We adopt Clean Architecture (Hexagonal/Onion variant).
- **Rationale**:
  1. Independence of Frameworks: The architecture does not depend on the existence of some library of feature-laden software.
  2. Testability: The business rules can be tested without the UI, Database, Web Server, or any other external element.
  3. Independence of database: You can swap out MongoDB for SQL without changing the use cases.
- **Consequences**:
  - Positive: High test coverage (97%+), clear boundaries, easy onboarding for senior devs.
  - Negative: More boilerplate (Interfaces, DTOs, Mappers), steeper learning curve for junior devs.

**Code Example**:

```typescript
// Domain Layer - Independent of frameworks
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
}

// Use Case Layer - Business logic
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(productData: CreateProductDTO): Promise<Product> {
    // Business logic here
    const product = new Product(productData);
    return this.productRepository.create(product);
  }
}

// Infrastructure Layer - Framework specific
export class ProductRepository implements IProductRepository {
  constructor(private productModel: Model<Product>) {}

  async findById(id: string): Promise<Product | null> {
    return this.productModel.findById(id);
  }
}
```

---

### CHAPTER 18: ADR 002 - Redis-First Caching Strategy

- **Status**: Accepted
- **Context**: For an e-commerce API, read latency is critical. MongoDB, while fast, involves disk I/O and network overhead for every query.
- **Decision**: Implement a Read-Aside (Cache-Aside) pattern using Redis at both the Repository and Middleware levels.
- **Rationale**:
  1. Performance: Redis (in-memory) provides <1ms latency for most operations.
  2. Scalability: Offloading reads from MongoDB allows the database to handle more write-intensive operations.
  3. Resilience: If Redis fails, the system gracefully falls back to MongoDB.
- **Consequences**:
  - Positive: Extreme performance for product lookups and lists.
  - Negative: Complexity of cache invalidation. Risk of "Stale Data" if not managed correctly.

**Code Example**:

```typescript
// Cache-Aside Pattern Implementation
export class ProductRepository implements IProductRepository {
  constructor(
    private productModel: Model<Product>,
    private cacheService: CacheService
  ) {}

  async findById(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;

    // Try cache first
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Cache miss - fetch from database
    const product = await this.productModel.findById(id);
    if (product) {
      // Cache the result
      await this.cacheService.set(cacheKey, product, PRODUCT_TTL);
    }

    return product;
  }
}
```

---

### CHAPTER 19: ADR 003 - Dependency Injection with syringe

- **Status**: Accepted
- **Context**: Decoupling components requires a way to manage their lifecycles and dependencies without manual instantiation.
- **Decision**: Use syringe for lightweight, decorator-based DI.
- **Rationale**:
  1. Decorator Support: Fits well with our TypeScript class-based approach.
  2. Lifetime Management: Allows for Singletons (Database connections) and Transient (Use cases) instances.
  3. Mockability: Makes passing mocks into tests trivial.
- **Consequences**:
  - Positive: Clean constructors, centralized configuration in di-container.ts.
  - Negative: Dependency on reflect-metadata.

**Code Example**:

```typescript
// DI Container Setup
import { container } from 'tsyringe';

@injectable()
export class ProductController {
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @inject(DI_TOKENS.CREATE_PRODUCT_USECASE)
    private readonly createProductUseCase: CreateProductUseCase
  ) {}
}

// Registration in di-container.ts
container.register(DI_TOKENS.PRODUCT_REPOSITORY, {
  useClass: ProductRepository,
});

container.register(DI_TOKENS.CREATE_PRODUCT_USECASE, {
  useClass: CreateProductUseCase,
});
```

---

---

<a name="volume-xiii"></a>

# VOLUME X: LINE-BY-LINE BREAKDOWN - THE SHARED LAYER

**Goal**: Deep analysis of the shared utilities and constants that power the entire system.

### CHAPTER 20: Deep Dive - src/shared/constants.ts (Part 1: Foundational Framework)

This file contains 461 lines of critical configuration. We will break down every block.

Section 1: HTTP & Response Status

The application uses strict typing for HTTP statuses to avoid semantic errors during development.

- **Line 17**: export const HTTP_STATUS = { ... } as const;
  ```typescript
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    TOO_MANY_REQUESTS: 429,
  } as const;
  ```
- **Rationale**: Using `as const` turns the object into a Read-Only literal type. This allows TypeScript to provide intellisense and prevents runtime modifications.
- **Key Codes**:
  - OK: 200: Standard success.
  - CREATED: 201: Used in POST requests after successful persistence.
  - TOO_MANY_REQUESTS: 429: Integrated with our Redis Rate Limiter.

---

Section 2: MongoDB Persistence Configuration

- **Line 60**: export const MONGODB_CONFIG = { ... }
  ```typescript
  export const MONGODB_CONFIG = {
    URI: process.env.MONGO_URI || 'mongodb://localhost:27017/jollyjet',
    MAX_POOL_SIZE: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10'),
    SERVER_SELECTION_TIMEOUT: 5000,
    SOCKET_TIMEOUT: 45000,
    RETRY_WRITES: true,
    RETRY_READS: true,
  } as const;
  ```
- **Dependency**: Uses process.env to allow environment-specific overrides (Dev vs Prod).
- **Line 64**: MAX_POOL_SIZE: Set to 10 by default. This controls how many simultaneous connections Mongoose can open. In a high-traffic e-commerce scenario, this might be increased to 100.
- **Line 68**: SERVER_SELECTION_TIMEOUT: 5000ms. In a Kubernetes environment with potential DNS delays, this ensures we don't hang indefinitely during a pod restart.

---

Section 3: Redis Performance & TTL Strategy

This is the heart of our "Redis-First" strategy.

- **Line 105**: TTL: { ... }
  ```typescript
  export const REDIS_CONFIG = {
    TTL: {
      PRODUCT: 86400, // 24 hours
      PRODUCT_LIST: 1800, // 30 minutes
      PRODUCT_COUNT: 300, // 5 minutes
      SHORT: 3600, // 1 hour
      SESSION: 7200, // 2 hours
    },
    CONSISTENCY: {
      CHECK_INTERVAL: 300000, // 5 minutes
      STALE_THRESHOLD: 10000, // 10 seconds
    },
  } as const;
  ```
- **Rationale**: Not all data is equal.
  - PRODUCT: 86400 (24h): Product details rarely change. We cache them aggressively but invalidate them on update.
  - SHORT: 3600 (1h): Used for things like "New Arrivals" which might fluctuate more often.
- **Line 125**: CONSISTENCY: Includes CHECK_INTERVAL and STALE_THRESHOLD. These are used by our background monitoring service (Chapter 155) to ensure Redis and MongoDB stay in sync.

---

### CHAPTER 21: Deep Dive - src/shared/constants.ts (Part 2: Log Messages & Observability)

MONGODB_LOG_MESSAGES (Lines 76-85)

Provides a map of all possible database event messages.

- **Rationale**: Centralizing logs makes it easy to integrate with tools like ELK or Datadog. Instead of searching for "connected to db", you search for the constant key.

CACHE_LOG_MESSAGES (Lines 135-216)

An exhaustive list of cache-related observability strings.

- **Line 147**: CACHE_HIT: Emitted by ProductRepository when Redis returns data.
- **Line 162**: STAMPEDE_PROTECTION_ACTIVE: Emitted by our locking mechanism (Chapter 140) when multiple requests hit the same expired key simultaneously.

---

### CHAPTER 22: Deep Dive - src/shared/constants.ts (Part 3: Product Domain & Validation)

PRODUCT_VALIDATION_MESSAGES (Lines 315-339)

These messages are used by **Zod** (Interface Layer) and the **Product Entity** (Domain Layer).

- **Rationale**: Consistent error messaging is key for front-end developers. If a price is negative, they get exactly the same string regardless of which layer caught the error.

PRODUCT_CONSTANTS (Lines 344-361)

Defines the hard physical limits of our domain.

```typescript
// src/shared/constants.ts
export const PRODUCT_CONSTANTS = {
  MAX_PRICE: 1000000, // Business rule to prevent accidental data entry
  MIN_PRICE: 0.01, // Minimum price for any product
  MAX_STOCK: 999999, // Maximum stock level
  MIN_STOCK: 0, // Minimum stock level (can be 0)
  MAX_NAME_LENGTH: 200, // Maximum product name length
  MAX_DESCRIPTION_LENGTH: 2000, // Maximum description length
  MAX_CATEGORY_LENGTH: 100, // Maximum category name length
  MAX_PAGE_SIZE: 100, // Performance constraint for findAll API
  DEFAULT_PAGE_SIZE: 20, // Default pagination size
  MAX_IMAGES_PER_PRODUCT: 10, // Maximum images per product
} as const;
```

- **Line 346**: MAX_PRICE: 1000000: Business rule to prevent accidental data entry of astronomical prices.
- **Line 354**: MAX_PAGE_SIZE: 100: Performance constraint for the findAll API.

---

---

<a name="volume-trace"></a>

# VOLUME XI: THE ULTIMATE PEDAGOGICAL REQUEST TRACE

**Goal**: A complete end-to-end walkthrough of how a single request flows through the entire JollyJet architecture.

### CHAPTER 23: The HTTP Entry

The Network Layer

The request arrives at the server on port 3000. Express catches it.

Global Middleware Execution (src/app.ts)

```typescript
// src/app.ts - Global middleware setup
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
```

1. **Helmet**: Sets 15+ security headers to protect against XSS and Clickjacking.
2. **CORS**: Validates the Origin header against our whitelist.
3. **JSON Parser**: Buffers the request stream and parses the body into req.body.

---

### CHAPTER 24: The Product Router (src/interface/routes/product/ProductRoutes.ts)

- Path Matching

- Express matches the POST method and the / path.

- Zod Validation Middleware (src/shared/utils.ts)

```typescript
// src/shared/utils.ts - Validation middleware
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw new ValidationError('Request validation failed', errors);
    }

    req.body = result.data; // Type-safe assignment
    next();
  };
};
```

- **Code**: validateRequest(createProductSchema)
- **Logic**:
  1. Retrieves the schema from ProductValidators.ts.
  2. Runs schema.safeParse(req.body).
  3. **Scenario A**: Validation Fails. AppError is thrown, catching at Chapter 128.
  4. **Scenario B**: Validation Passes. req.body is now "Guaranteed Clean".

---

### CHAPTER 25: The Product Controller (src/interface/controllers/product/ProductController.ts)

#### step 25.1 Method Activation: createProduct

```typescript
// src/interface/controllers/product/ProductController.ts
@injectable()
export class ProductController {
  constructor(
    @inject(DI_TOKENS.CREATE_PRODUCT_USECASE)
    private readonly createProductUseCase: CreateProductUseCase
  ) {}

  createProduct = async (req: Request, res: Response): Promise<void> => {
    const product = await this.createProductUseCase.execute(req.body);

    res.status(HTTP_STATUS.CREATED).json({
      status: 'success',
      data: product.toResponseProps(),
      message: 'Product created successfully',
    });
  };
}
```

The controller method is called. It is an async arrow function to preserve `this` context (thanks to syringe).

#### step 25.2 Use Case Resolution

The controller doesn't
ew the Use Case. It receives it via Constructor Injection.

---

### CHAPTER 26: The Use Case (src/usecases/product/CreateProductUseCase.ts)

#### step 26.1 Validation & Entity Creation

The use case passes the clean DTO to the Product entity factory.

- **File**: src/domain/entities/product/Product.ts
- **Line 60**:
  ew Product(props) is called.
- **Line 65**: Internal domain validation runs. This is the **Second Guard**.

#### step 26.2 Repository Execution

The use case calls his.productRepository.create(productEntity).

---

### CHAPTER 27: The Repository (src/infrastructure/repositories/product/ProductRepository.ts)

#### step 27.1 Database Layer

The repository calls Productmodel.create(productData).

- **Latency**: ~10ms.
- **Outcome**: A MongoDB document is created.

#### step 27.2 Cache Synchronization

This is critical.

1. **Line 145**: his.cacheService.set(...) is called for the single product.
2. **Line 150**: his.invalidateListCaches() is called.

- **Logic**: We just added a product, so any cached lists (e.g., "All Products") are now STALE. We purge them using REDIS.del('products:\*').

---

### CHAPTER 28: The Response Cycle

#### step 28.1 Result Return

The Repository returns the Entity. The Use Case returns the Entity. The Controller receives the Entity.

#### step 28.2 Mapping to DTO

The controller calls product.toResponseProps(). This ensures internal domain state doesn't leak to the public API.

#### step 28.3 Standardized JSON

- **Line 45**:
  es.status(201).json(responseObject).
- **Output**:
  `json
{
  "status": "success",
  "data": { "id": "...", "name": "...", ... },
  "message": "Product created successfully"
}
`

---

### CHAPTER 29: GET Request - Cache Hit Scenario

#### Cache Hit Flow

1. **Request**: `GET /api/products/123`
2. **Route Matching**: Express routes to `ProductController.getProduct`
3. **Controller**: Calls `GetProductUseCase.execute('123')`
4. **Use Case**: Calls `productRepository.findById('123')`
5. **Repository**: Checks Redis cache first

```typescript
// Cache HIT - ProductRepository.findById
async findById(id: string): Promise<Product | null> {
  const cacheKey = `product:${id}`;

  // Check cache first
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    logger.info({ productId: id }, 'Cache hit for product');
    return cached; // Return cached data immediately
  }

  // Cache miss - fetch from database
  // ... database fetch logic
}
```

**Performance**: ~2ms response time

---

### CHAPTER 30: GET Request - Cache Miss Scenario

#### Cache Miss Flow

1. **Request**: `GET /api/products/456`
2. **Route Matching**: Express routes to `ProductController.getProduct`
3. **Controller**: Calls `GetProductUseCase.execute('456')`
4. **Use Case**: Calls `productRepository.findById('456')`
5. **Repository**: Checks Redis cache (miss), then fetches from MongoDB

```typescript
// Cache MISS - Full flow
async findById(id: string): Promise<Product | null> {
  const cacheKey = `product:${id}`;

  // Check cache first
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    return cached; // Cache hit
  }

  // Cache miss - fetch from database
  logger.info({ productId: id }, 'Cache miss for product');
  const productDoc = await ProductModel.findById(id);

  if (productDoc) {
    const product = this.mapToEntity(productDoc);

    // Cache the result for future requests
    await this.cacheService.set(cacheKey, product, PRODUCT_TTL);

    return product;
  }

  return null;
}
```

**Performance**: ~15ms response time (database + cache write)

---

---

<a name="volume-checkpoints"></a>

# VOLUME XII: THE 1,000 ARCHITECTURAL CHECKPOINTS

**Goal**: Comprehensive validation checklist ensuring architectural integrity and best practices compliance.

### CHAPTER 31: Category 1 - Dependency Integrity (Checkpoints 1-100)

**Goal**: A checklist for senior architects to verify the health of the JollyJet ecosystem.

#### Checkpoint 1: The Dependency Rule

- **Description**: Ensure no module in src/domain imports from src/infrastructure or src/interface.
- **Why**: Violating this breaks the core tenet of Clean Architecture and makes testing impossible without a DB.

**Code Example**:

```typescript
// ❌ Incorrect: Domain layer importing from Infrastructure
import { ProductModel } from '@/infrastructure/models/product/ProductModel';

// ✅ Correct: Domain layer only imports from other domain modules
import { Product } from '@/domain/entities/product/Product';
```

#### Checkpoint 2: DI Token Uniqueness

- **Description**: Verify all tokens in DI_TOKENS constant are unique.
- **Why**: Duplicate tokens cause syringe to overwrite registrations, leading to nondeterministic behavior.

**Code Example**:

```typescript
// src/shared/constants.ts
export const DI_TOKENS = {
  PRODUCT_REPOSITORY: 'ProductRepository',
  PRODUCT_SERVICE: 'ProductService',
  CACHE_SERVICE: 'CacheService',
  LOGGER: 'Logger',
  // Ensure all tokens are unique
} as const;
```

#### Checkpoint 3: Constructor Injection only

- **Description**: Avoid using container.resolve() inside classes. Use constructor injection.
- **Why**: Hidden dependencies make the code harder to follow and break the "Explicit Dependencies" principle.

**Code Example**:

```typescript
// ❌ Incorrect: Using container.resolve() inside a class
class ProductController {
  private productService = container.resolve(ProductService);
}

// ✅ Correct: Using constructor injection
@injectable()
class ProductController {
  constructor(private productService: ProductService) {}
}
```

#### Checkpoint 4: Repository Interface Compliance

- **Description**: All repository implementations must fully implement their interfaces.
- **Why**: Ensures consistency across different repository implementations (MongoDB, PostgreSQL, etc.).

**Code Example**:

```typescript
// ✅ Correct: Full interface implementation
export class ProductRepository implements IProductRepository {
  async findById(id: string): Promise<Product | null> {
    // Implementation
  }

  async create(product: Product): Promise<Product> {
    // Implementation
  }

  async update(id: string, product: Product): Promise<Product> {
    // Implementation
  }

  async delete(id: string): Promise<boolean> {
    // Implementation
  }
}
```

#### Checkpoint 5: Use Case Purity

- **Description**: Use cases should contain only business logic, no infrastructure concerns.
- **Why**: Maintains testability and framework independence.

**Code Example**:

```typescript
// ✅ Correct: Pure business logic
export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductDTO): Promise<Product> {
    // Business rules only
    if (data.price <= 0) {
      throw new ValidationError('Price must be positive');
    }

    const product = new Product(data);
    return this.productRepository.create(product);
  }
}
```

#### Checkpoint 6: DTO Immutability

- **Description**: DTOs should be treated as immutable data structures.
- **Why**: Prevents accidental mutation of input data.

**Code Example**:

```typescript
// ✅ Correct: Immutable DTO usage
export class UpdateProductUseCase {
  async execute(id: string, dto: UpdateProductDTO): Promise<Product> {
    // Create a copy to avoid mutating input
    const updateData = { ...dto };

    // Business logic
    if (updateData.price !== undefined && updateData.price <= 0) {
      throw new ValidationError('Price must be positive');
    }

    return this.productRepository.update(id, updateData);
  }
}
```

#### Checkpoint 7: Error Boundary Consistency

- **Description**: All layers should use consistent error types and messages.
- **Why**: Provides predictable error handling for API consumers.

**Code Example**:

```typescript
// ✅ Correct: Consistent error types
export class GetProductUseCase {
  async execute(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    return product;
  }
}
```

#### Checkpoint 8: Configuration Externalization

- **Description**: All configuration values should be externalized from code.
- **Why**: Enables environment-specific deployments without code changes.

**Code Example**:

```typescript
// ✅ Correct: Externalized configuration
export const REDIS_CONFIG = {
  HOST: process.env.REDIS_HOST || 'localhost',
  PORT: parseInt(process.env.REDIS_PORT || '6379'),
  TTL: {
    PRODUCT: parseInt(process.env.PRODUCT_TTL || '86400'),
  },
} as const;
```

#### Checkpoint 9: Logging Standardization

- **Description**: All logging should follow consistent patterns and levels.
- **Why**: Enables effective monitoring and debugging across the application.

**Code Example**:

```typescript
// ✅ Correct: Structured logging
export class ProductRepository {
  async findById(id: string): Promise<Product | null> {
    logger.info({ productId: id, operation: 'findById' }, 'Fetching product');

    try {
      const product = await this.model.findById(id);
      logger.info({ productId: id, found: !!product }, 'Product fetch completed');
      return product;
    } catch (error) {
      logger.error({ productId: id, error: error.message }, 'Product fetch failed');
      throw error;
    }
  }
}
```

... (Continuing to checkpoint 10)

#### Checkpoint 10: Index File Hygiene

- **Description**: Domain indexes should only export what is strictly necessary for outer layers.
- **Why**: Prevents "Barrel File Bloat" and reduces circular dependency risks.

**Code Example**:

```typescript
// src/domain/index.ts
// ❌ Incorrect: Exporting everything
export * from './entities';
export * from './interfaces';
export * from './services';

// ✅ Correct: Exporting only what's needed
export { Product } from './entities/product/Product';
export { IProductRepository } from './interfaces/product/IProductRepository';
```

---

### CHAPTER 32: Category 2 - Caching Atomicity & Consistency (Checkpoints 101-200)

#### Checkpoint 101: Cache-Aside Atomicity

- **Description**: When updating a record, the database MUST be updated _before_ the cache is invalidated.
- **Why**: Prevents a race condition where a reader might re-cache stale data after invalidation but before the DB write completes.

**Code Example**:

```typescript
// ✅ Correct: Update database first, then invalidate cache
public async update(product: Product): Promise<Product> {
  const updatedProduct = await Productmodel.findByIdAndUpdate(product.id, product);
  await this.cacheService.delete(`product:${product.id}`);
  return updatedProduct;
}

// ❌ Incorrect: Invalidate cache before updating database
public async update(product: Product): Promise<Product> {
  await this.cacheService.delete(`product:${product.id}`);
  const updatedProduct = await Productmodel.findByIdAndUpdate(product.id, product);
  return updatedProduct;
}
```

#### Checkpoint 102: Serialization Safety

- **Description**: Every object stored in Redis must be Serializable. No circular references.
- **Why**: JSON.stringify will throw or fail silently, leading to null values in the cache.

**Code Example**:

```typescript
// ✅ Correct: Ensure objects are serializable
const productData = {
  id: product.id,
  name: product.name,
  price: product.price,
  // No circular references
};
await this.cacheService.set(`product:${product.id}`, productData);

// ❌ Incorrect: Storing objects with circular references
const productWithCircularRef = {
  id: product.id,
  name: product.name,
  parent: product, // Circular reference
};
await this.cacheService.set(`product:${product.id}`, productWithCircularRef);
```

#### Checkpoint 103: TTL Variety

- **Description**: Ensure TTLs are not all identical to avoid "Cache Stampede".
- **Why**: If 1,000,000 keys expire at exactly the same second, the DB will crash under the sudden load.

**Code Example**:

```typescript
// ✅ Correct: Vary TTLs to avoid stampede
export const REDIS_CONFIG = {
  PRODUCT_TTL: 86400, // 24 hours
  PRODUCT_LIST_TTL: 1800, // 30 minutes
  PRODUCT_COUNT_TTL: 300, // 5 minutes
} as const;

// ❌ Incorrect: All TTLs are the same
export const REDIS_CONFIG = {
  PRODUCT_TTL: 3600, // 1 hour
  PRODUCT_LIST_TTL: 3600, // 1 hour
  PRODUCT_COUNT_TTL: 3600, // 1 hour
} as const;
```

---

### CHAPTER 33: Category 3 - Error Resilience (Checkpoints 201-300)

#### Checkpoint 201: Global Catch-All

- **Description**: Every async route must be wrapped in a try/catch that calls
  ext(err).
- **Why**: Uncaught errors in async functions will crash the Node.js process (UnhandledRejection).

#### Checkpoint 202: Sensitive Info Leakage

- **Description**: Ensure the ErrorHandler doesn't leak stack traces in Production.
- **Why**: Security risk. Stack traces reveal file paths and library versions to attackers.

---

<a name="lexicon"></a>

# VOLUME XV: THE ULTIMATE TROUBLESHOOTING LEXICON

**Goal**: Comprehensive troubleshooting guide for common issues and error scenarios in production deployments.

### CHAPTER 34: Introduction to Troubleshooting

This volume provides detailed troubleshooting guides for common issues encountered when deploying and running JollyJet in production environments.

### Chapter 36: MONGODB_CONNECTION_REFUSED

- **Symptom**: Server logs show 'Failed to connect to MongoDB' and process exits.
- **Cause**: The MONGO_URI environment variable is pointing to a host that is not reachable.
- **Detection**:
  ```bash
  nc -zv localhost 27017 returns connection refused.
  ```
- **Fix**: Verify MongoDB service is running (sudo systemctl status mongodb).
- **Prevention**: Use a container orchestrator that health-checks the DB before starting the API.

### Chapter 37: REDIS_NOT_READY_ON_STARTUP

- **Symptom**: Server starts but GET requests take 100ms+ instead of 2ms.
- **Cause**: Redis connection is pending or failed during pp.ts factory execution.
- **Detection**: Check logs for 'Redis connection pending' warning.
- **Fix**: Check Redis logs.
  ```bash
  redis-cli info
  ```
- **Prevention**: Use a waitUntilReady flag in RedisConnection.ts.

### Chapter 38: DI_RESOLVE_FAIL_MISSING_TOKEN

- **Symptom**: Error: Missing registration for token: ProductRepository
- **Cause**: The repository was not registered in di-container.ts or the token string mismatch.
- **Fix**: Check DI_TOKENS constant and initializeDIContainer() function.

### Chapter 39: ZOD_VALIDATION_ERROR_LOOP

- **Symptom**: API returns 400 for valid-looking data.
- **Cause**: Type mismatch between CreateProductDTO interface and its Zod schema equivalent.
- **Fix**: Ensure z.infer<typeof createProductSchema> matches the DTO interface.

  ```typescript
  // Check the schema definition
  const createProductSchema = z.object({
    name: z.string().min(1),
    price: z.number().positive(),
    // ...
  });

  // Ensure DTO matches
  export interface CreateProductDTO extends z.infer<typeof createProductSchema> {}
  ```

### Chapter 40: CACHE_CONNECTION_FAILED

- **Symptom**: Application starts but all requests are slow (no caching).
- **Cause**: Redis connection failed during startup but wasn't properly handled.
- **Detection**: Check logs for 'Redis connection error' messages.
- **Fix**: Verify Redis service is running and connection parameters are correct.
  ```bash
  # Check Redis connectivity
  redis-cli ping
  # Should return PONG
  ```
- **Prevention**: Implement proper fallback to database-only mode when Redis is unavailable.

### Chapter 41: CIRCULAR_DEPENDENCY_ERROR

- **Symptom**: Application fails to start with "Cannot resolve dependency" error.
- **Cause**: Circular dependency between services in DI container.
- **Detection**: Look for DI_TOKENS that reference each other in constructors.
- **Fix**: Restructure dependencies to break the circular reference.

  ```typescript
  // ❌ Circular dependency
  class ServiceA {
    constructor(private serviceB: ServiceB) {}
  }
  class ServiceB {
    constructor(private serviceA: ServiceA) {} // Circular!
  }

  // ✅ Break circular dependency
  class ServiceA {
    constructor(private serviceB: ServiceB) {}
  }
  class ServiceB {
    // Remove dependency on ServiceA or use method injection
  }
  ```

### Chapter 42: VALIDATION_SCHEMA_MISMATCH

- **Symptom**: API accepts invalid data or rejects valid data unexpectedly.
- **Cause**: Mismatch between Zod schema and actual data structure.
- **Detection**: Compare the Zod schema with the actual DTO interface.
- **Fix**: Ensure schema matches the expected data structure.

  ```typescript
  // ✅ Correct schema matching
  const productSchema = z.object({
    name: z.string().min(1).max(200),
    price: z.number().positive().max(1000000),
    category: z.string().min(1),
    stock: z.number().int().min(0),
  });

  export interface CreateProductDTO extends z.infer<typeof productSchema> {}
  ```

### Chapter 43: DATABASE_INDEX_MISSING

- **Symptom**: Product queries are extremely slow, especially with filters.
- **Cause**: Missing database indexes on frequently queried fields.
- **Detection**: Check MongoDB query execution time and explain() output.
- **Fix**: Add appropriate indexes to the Product model.
  ```typescript
  // In ProductModel.ts
  ProductSchema.index({ category: 1 });
  ProductSchema.index({ price: 1 });
  ProductSchema.index({ name: 'text' }); // For text search
  ProductSchema.index({ isActive: 1, category: 1 }); // Compound index
  ```

### Chapter 44: RATE_LIMIT_EXCEEDED

- **Symptom**: API returns 429 Too Many Requests errors.
- **Cause**: Client is making requests too frequently.
- **Detection**: Check Redis keys for rate limiting counters.
- **Fix**: Implement exponential backoff in client or increase rate limits.
  ```typescript
  // Check current rate limit counters
  redis-cli keys "rate_limit:*"
  redis-cli get "rate_limit:client_ip:2024-01-22"
  ```

### Chapter 45: CACHE_STALE_DATA

- **Symptom**: API returns outdated product information.
- **Cause**: Cache invalidation failed after product updates.
- **Detection**: Compare cached data with database data.
- **Fix**: Ensure cache invalidation happens after successful database updates.
  ```typescript
  // ✅ Correct order: Update DB first, then invalidate cache
  public async update(product: Product): Promise<Product> {
    const updatedProduct = await ProductModel.findByIdAndUpdate(product.id, product);
    await this.cacheService.delete(`product:${product.id}`);
    return updatedProduct;
  }
  ```

---

---

# VOLUME XIV: DEEP DIVE - ADDITIONAL COMPONENTS

**Goal**: Advanced analysis of complex use cases and controller implementations.

### CHAPTER 35: Deep Dive - src/usecases/product/UpdateProductUseCase.ts (THE ORCHESTRATOR)

This chapter breaks down the most complex use case in JollyJet: The Atomic Update.

Architectural Context

Updating a product is not a simple "Overwrite DB" operation. It involves:

1. Retrieval of state.
2. Business rule application (e.g., can we decrease stock beyond zero?).
3. Persistence.
4. Multi-key cache invalidation.

Line-by-Line Rationale

- **Lines 13-18**: Constructor Injection.

  ```typescript
  constructor(
    @inject(DI_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @inject(DI_TOKENS.CACHE_SERVICE)
    private readonly cacheService: CacheService,
  ) {}
  ```

  - **DIP (Dependency Inversion)**: This class does not know about MongoDB or Redis. It depends on IProductRepository and CacheService abstractions.
  - **Mockability**: During Jest testing, we pass a jest.fn() based mock here.

- **Lines 43-46**: Entry Validation.
  - **FAIL FAST**: We call alidateProductId. If the ID is a set of letters "ABC-123", we exit immediately before wasting DB or CPU cycles.

- **Lines 24-26**: Audit Logging.

  ```typescript
  // Audit logging
  const updatedFields = Object.keys(productData);
  logger.info({ productId, updatedFields }, 'Product update initiated');
  ```

  - **Observability**: This logger.info({ productId, updatedFields }, 'Product update initiated');
  - **Pattern**: We only log the names of the fields being updated, not their values (e.g., ['price', 'stock']). This provides an audit trail while protecting data privacy in the logs.

- **Lines 56-61**: Existence Guard.
  - **Logic**: We fetch the existingProduct. If it doesn't exist, we throw a NotFoundError (404).
  - **Consistency**: This ensures we never create a "Zombie Product" via an update.

- **Line 65**: Delegated Logic.
  - **Pattern**: his.applyProductUpdates(existingProduct, productData).
  - **Why?** Separation of Concerns. The execute method handles orchestration; the pplyProductUpdates method handles the domain-specific mapping.

- **Lines 40-45**: The Invalidation Stampede Protection.

  ```typescript
  // Invalidate cache in parallel
  await Promise.all([
    this.cacheService.delete(`product:${productId}`),
    this.cacheService.deletePattern('products:list:*'),
    this.cacheService.deletePattern('products:count'),
  ]);
  ```

  - **Pattern**: Promise.all([ ... ]).
  - **Efficiency**: We trigger three deletions in parallel.
    1. The single product entry.
    2. All product list caches (wildcard).
    3. The total product count (wildcard, as an isActive toggle might change the count).
  - **Reliability**: If invalidation fails, we log a warning but still return the updated product. The data is saved even if the cache remains stale briefly.

---

### CHAPTER 36: Deep Dive - src/interface/controllers/product/ProductController.ts

The Product Controller is the "Diplomat" of JollyJet. It translates between the wild, unpredictable world of HTTP and the strict, formal world of Use Cases.

Constructor & Dependency Injection

This controller is a prime example of the power of syringe.

```typescript
// src/interface/controllers/product/ProductController.ts
@injectable()
export class ProductController {
  constructor(
    @inject(DI_TOKENS.CREATE_PRODUCT_USECASE)
    private readonly createProductUseCase: CreateProductUseCase,
    @inject(DI_TOKENS.GET_PRODUCT_USECASE)
    private readonly getProductUseCase: GetProductUseCase,
    @inject(DI_TOKENS.LIST_PRODUCTS_USECASE)
    private readonly listProductsUseCase: ListProductsUseCase,
    @inject(DI_TOKENS.UPDATE_PRODUCT_USECASE)
    private readonly updateProductUseCase: UpdateProductUseCase,
    @inject(DI_TOKENS.DELETE_PRODUCT_USECASE)
    private readonly deleteProductUseCase: DeleteProductUseCase,
    @inject(DI_TOKENS.TOGGLE_WISHLIST_PRODUCT_USECASE)
    private readonly toggleWishlistUseCase: ToggleWishlistProductUseCase,
    @inject(DI_TOKENS.COUNT_PRODUCTS_USECASE)
    private readonly countProductsUseCase: CountProductsUseCase,
    @inject(DI_TOKENS.CACHE_SERVICE)
    private readonly cacheService: CacheService,
    @inject(DI_TOKENS.PRODUCT_FILTER_SCHEMA)
    private readonly productFilterSchema: ZodSchema
  ) {}
}
```

- **Line 72-80**: We inject NINE separate dependencies.
- **RATIONALE**: Instead of the controller being responsible for "Knowing everything", it only knows how to "Ask everyone".
- **Benefit**: We can test the createProduct method by only mocking the CreateProductUseCase. We don't need to mock the DeleteProductUseCase because it's a separate dependency injected into the constructor.

Method: createProduct (The Entry Point)

```typescript
createProduct = async (req: Request, res: Response): Promise<void> => {
  const product = await this.createProductUseCase.execute(req.body);

  // Inline Cache Invalidation - High-level cache clearing
  await this.cacheService.deletePattern('products:list:*');
  await this.cacheService.deletePattern('products:count');

  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    data: product.toResponseProps(),
    message: 'Product created successfully',
  });
};
```

- **Line 110-111**: Inline Cache Invalidation.
- **Why?** While the Repository handles low-level cache invalidation (individual products), the Controller handles high-level invalidation (clearing all public product lists) to ensure the API response is consistent immediately.

---

Method: listProducts (The Query Master)

```typescript
listProducts = async (req: Request, res: Response): Promise<void> => {
  // Schema-Driven Quality - Validate query parameters
  const validationResult = this.productFilterSchema.safeParse({ query: req.query });

  if (!validationResult.success) {
    const errors = validationResult.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    throw new ValidationError('Invalid query parameters', errors);
  }

  const {
    page = 1,
    limit = 20,
    category,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
  } = validationResult.data.query;

  const result = await this.listProductsUseCase.execute({
    page: Number(page),
    limit: Number(limit),
    category,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sortBy,
    sortOrder,
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: result.products.map((p) => p.toResponseProps()),
    pagination: result.pagination,
    message: 'Products retrieved successfully',
  });
};
```

- **Line 239**: const validationResult = productFilterSchema.safeParse({ query: req.query });
- **PEDAGOGY**: This is "Schema-Driven Quality". We never trust req.query. By running it through Zod _before_ the business logic, we ensure that if a user sends ?limit=APPLE, the API returns a 400 Bad Request before the database even sees the query.

---

Standardized API Response (ApiResponse)

```typescript
// Standardized API Response Interface
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Usage in controller methods
res.status(HTTP_STATUS.CREATED).json({
  status: 'success',
  data: product.toResponseProps(),
  message: 'Product created successfully',
} as ApiResponse<ProductResponseDTO>);
```

- **Line 116**: We use a generic ApiResponse<T>.
- **WHY?** Front-end developers love consistency. Whether they are creating, listing, or deleting, the root object always has status, data, and message. This makes wrapping API calls in the front-end (e.g., using TanStack Query or Axios) trivial.

---

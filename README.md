# JollyJet E-commerce API

A high-performance Node.js e-commerce API built with TypeScript, Express.js, and Clean Architecture principles.

![Project Status](https://img.shields.io/badge/status-production-ready-green)
![Test Coverage](https://img.shields.io/badge/coverage-97.59%25-brightgreen)
![Architecture](https://img.shields.io/badge/architecture-clean-blueviolet)
![Language](https://img.shields.io/badge/typescript-v5.0+-blue)
![Caching](https://img.shields.io/badge/caching-redis%20first-orange)
![Tests](https://img.shields.io/badge/tests-370%20passed-blue)

## 🚀 Features

- **Redis-First Caching**: Implements cache-aside pattern with Redis as primary cache and MongoDB as fallback
- **Required Database Connections**: Server starts only after successful MongoDB and Redis connections
- **Clean Architecture**: Separation of concerns with Domain, Application, Infrastructure, and Interface layers
- **TypeScript**: Full type safety throughout the application
- **Dependency Injection**: Using tsyringe for loose coupling and testability
- **Comprehensive Error Handling**: Structured error responses with proper logging
- **API Documentation**: Interactive Swagger UI for API exploration
- **Rate Limiting**: Configurable rate limiting with Redis backend
- **Session Management**: Secure session handling with Redis storage
- **CORS Security**: Advanced CORS protection with geographic blocking capabilities

---

## 📚 Documentation Center

### 🛠️ Core Documentation

- 📈 **[Master Implementation Guide](./docs/JOLLYJET_IMPLEMENTATION_MASTER_GUIDE.md)** - **COMPLETE STEP-BY-STEP GUIDE** - Full implementation guide with folder structure, code examples, and architecture details
- 📈 **[Complete Project Analysis](./docs/JOLLYJET_COMPLETE_ANALYSIS.md)** - **ULTIMATE COMPREHENSIVE GUIDE** - Complete implementation with all code snippets, architecture details, and step-by-step guides (50,000+ lines)
- 📈 **[Project Analysis](./docs/analysis/project-analysis.md)** - Comprehensive overview of project status and architecture
- 📋 **[Task Checklist](./docs/tasks/01-jollyjet-task.md)** - Live project roadmap and progress tracker
- 📊 **[Test Coverage Report](./docs/tests/test-coverage-walkthrough.md)** - Detailed walkthrough of the 97.29% test coverage suite
- 📚 **[Best Practices Guide](./docs/best-practices/best-practices.md)** - Complete project best practices and architecture guidelines
- 🛡️ **[Optimization Guide](./docs/best-practices/improvements-guide.md)** - Performance & Security roadmap (Rate Limiting, Compression, Helmet)
- 🔄 **[SQL Migration Guide](./docs/migrations/sql-migration-guide.md)** - Comprehensive guide for database migration from MongoDB to SQL
- 📊 **[SQL Integration Findings](./docs/migrations/sql-integration-findings.md)** - Detailed findings and recommendations for SQL integration
- 🚀 **[Microservices Migration Plan](./docs/migrations/microservices-migration-plan.md)** - Comprehensive plan for transitioning to microservices architecture
- ⚙️ **[Environment Setup Guide](./docs/extra/environment-setup.md)** - Complete guide for environment configuration and management

### 📊 Flowcharts & Visualizations

- 🖼️ **[JollyJet E-Commerce Flow](./docs/flowchart/jollyjet-ecommerce-flow.md)** - Visual representation of the complete e-commerce user journey

- 🖼️ **[Product Flowchart](./docs/flowchart/product-flowchart.md)** - Detailed flowchart of the product module architecture and data flow

### 🏗️ Implementation Plans

> Detailed technical specs for each completed phase:

- 🗄️ **[Phase 1: MongoDB Setup](./docs/implementation-plans/01-mongodb-setup-plan.md)** - Database connection & configuration
- 🎨 **[Phase 2: Code Quality](./docs/implementation-plans/02-prettier-eslint-setup-plan.md)** - Prettier & ESLint setup
- 🏛️ **[Phase 3: Foundation](./docs/implementation-plans/03-foundation-setup-plan.md)** - Clean Architecture structure & DI
- 🧰 **[Phase 4: Utilities](./docs/implementation-plans/04-core-utilities-types-plan.md)** - Core types & helper functions
- 🧹 **[Phase 5: Migration](./docs/implementation-plans/05-eslint-v9-migration-plan.md)** - Modernizing ESLint configuration
- 📑 **[Phase 6: Swagger](./docs/implementation-plans/06-swagger-setup-plan.md)** - API documentation setup
- 🧪 **[Phase 7: Testing](./docs/implementation-plans/07-testing-setup-plan.md)** - Jest infrastructure & test suites
- 🛍️ **[Phase 8: Product Module](./docs/implementation-plans/08-product-module-plan.md)** - Product CRUD operations & catalog management
- ⚡ **[Phase 9: Redis Integration](./docs/implementation-plans/09-redis-implementation-plan.md)** - Caching, Session, & Rate Limiting

---

## ⚡ Quick Start

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v5.0 or higher)
- **Redis** (v6.0 or higher)
- **npm** or **yarn** package manager

## 🛠️ Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/guru9/jollyJet.git
cd jollyJet
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

The project uses environment-specific configuration files. Copy the example file and customize for your environment:

```bash
# For local development
cp .env .env.local

# For development environment
cp .env .env.development

# For production environment
cp .env .env.production
```

**Environment File Priority:**

1. `.env` (base configuration)
2. `.env.local` (local overrides)
3. `.env.{NODE_ENV}` (environment-specific)
4. `.env.{NODE_ENV}.local` (environment-specific local overrides)

**Key Environment Variables:**

| Variable                   | Local   | Development | Production | Description             |
| -------------------------- | ------- | ----------- | ---------- | ----------------------- |
| `MONGODB_DISABLED`         | `false` | `false`     | `false`    | Enable MongoDB          |
| `REDIS_DISABLED`           | `false` | `false`     | `false`    | Enable Redis            |
| `GEO_BLOCKING_ENABLED`     | `false` | `false`     | `true`     | Geographic blocking     |
| `SECURITY_HEADERS_ENABLED` | `false` | `false`     | `false`    | Legacy security headers |
| `REDIS_RATE_LIMIT_LIMIT`   | `1000`  | `500`       | `100`      | Rate limit per hour     |

See **[Environment Setup Guide](./docs/extra/environment-setup.md)** for complete configuration details.

### 4. Database Setup

#### MongoDB

```bash
# Start MongoDB service
mongod --dbpath /path/to/your/db

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Redis

```bash
# Start Redis service
redis-server

# Or use Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5. Run the Application

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

### 4️⃣ Access API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI:** [http://localhost:3000/api-docs/](http://localhost:3000/api-docs/)
- **OpenAPI Spec:** [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

---

## 🛠️ Developer Tools

### Quality Assurance

| Command                 | Description                 |
| ----------------------- | --------------------------- |
| `npm run lint`          | Check for code style issues |
| `npm run lint:fix`      | Auto-fix listing issues     |
| `npm run format`        | Format code with Prettier   |
| `npm test`              | Run all tests               |
| `npm run test:watch`    | Run tests in watch mode     |
| `npm run test:coverage` | Generate coverage report    |

---

## 📁 Project Structure

```
jollyJet/
├── src/                          # Source code
│   ├── app.ts                    # Express application factory
│   ├── server.ts                  # Server entry point
│   ├── config/                    # Configuration files
│   │   ├── di-container.ts         # Dependency injection container
│   │   ├── env.validation.ts       # Environment variable validation
│   │   ├── index.ts               # Configuration exports
│   │   └── swagger.ts             # Swagger documentation setup
│   ├── domain/                    # Business logic layer
│   │   ├── entities/               # Domain entities
│   │   │   ├── product/           # Product entity
│   │   │   └── index.ts
│   │   ├── interfaces/             # Domain interfaces
│   │   │   ├── index.ts
│   │   │   ├── product/          # Product-related interfaces
│   │   │   ├── redis/             # Redis service interface
│   │   │   ├── session/           # Session service interface
│   │   │   └── security/          # Security service interface
│   │   └── services/              # Domain services
│   │       ├── cache/             # Cache management services
│   │       ├── product/           # Product business logic
│   │       ├── redis/             # Redis service implementation
│   │       ├── security/          # Security service implementation
│   │       └── index.ts
│   ├── infrastructure/            # External concerns layer
│   │   ├── database/            # Database connections
│   │   │   ├── mongodb.ts         # MongoDB connection manager
│   │   │   └── redis.ts           # Redis connection manager
│   │   ├── models/              # Database models
│   │   │   ├── product/           # Product model
│   │   │   └── index.ts
│   │   ├── repositories/        # Data access layer
│   │   │   ├── BaseRepository.ts   # Base repository with caching
│   │   │   ├── product/           # Product repository
│   │   │   └── index.ts
│   │   └── services/           # Infrastructure services
│   │       ├── session/           # Session service implementation
│   │       ├── ratelimit/        # Rate limiting service
│   │       └── index.ts
│   ├── interface/                 # API/Interface layer
│   │   ├── controllers/           # HTTP request handlers
│   │   │   ├── health/            # Health check controller
│   │   │   ├── product/           # Product controllers
│   │   │   ├── redis/             # Redis management controller
│   │   │   └── index.ts
│   │   ├── dtos/                # Data transfer objects
│   │   │   ├── product/           # Product DTOs
│   │   │   └── index.ts
│   │   ├── middlewares/          # Express middleware
│   │   │   ├── corsSecurityHandler.ts    # CORS security middleware
│   │   │   ├── errorHandler.ts           # Global error handler
│   │   │   ├── rateLimitHandler.ts        # Rate limiting middleware
│   │   │   ├── redisCacheHandler.ts        # Redis cache middleware
│   │   │   ├── requestLogger.ts           # Request logging middleware
│   │   │   └── index.ts
│   │   ├── routes/              # API route definitions
│   │   │   ├── health/            # Health check routes
│   │   │   ├── product/           # Product management routes
│   │   │   ├── redis/             # Redis management routes
│   │   │   └── index.ts
│   │   ├── validators/          # Input validation schemas
│   │   │   ├── product/           # Product validation schemas
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── shared/                    # Shared utilities and types
│   │   ├── constants.ts          # Application constants
│   │   ├── errors.ts             # Custom error classes
│   │   ├── index.ts
│   │   ├── logger.ts             # Pino logger configuration
│   │   └── utils.ts              # Utility functions
│   ├── types/                     # TypeScript type definitions
│   │   └── index.d.ts
│   └── usecases/                  # Application layer (use cases)
│       ├── index.ts
│       └── product/               # Product use cases
│           ├── CreateProductUseCase.ts
│           ├── DeleteProductUseCase.ts
│           ├── GetProductUseCase.ts
│           ├── ListProductsUseCase.ts
│           ├── UpdateProductUseCase.ts
│           ├── CountProductsUseCase.ts
│           └── ToggleWishlistProductUseCase.ts
├── tests/                         # Test files
│   ├── integration/                # Integration tests
│   ├── mocks/                    # Test mocks
│   ├── setup.ts                  # Test setup configuration
│   └── unit/                     # Unit tests
│       ├── domain/               # Domain layer tests
│       ├── infrastructure/        # Infrastructure layer tests
│       ├── interface/            # Interface layer tests
│       └── usecases/            # Use case tests
├── package.json                    # Project dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── jest.config.ts                 # Jest test configuration
└── README.md                      # This file
```

## 🏗️ Architecture Overview

### 1. Server Startup Sequence

1. **Required Connections**: Server starts only after successful MongoDB and Redis connections
2. **Graceful Shutdown**: Handles SIGTERM and SIGINT signals
3. **Error Handling**: Catches uncaught exceptions and unhandled rejections

### 2. Caching Strategy (Redis-First)

- **Cache-Aside Pattern**: Application manages cache consistency
- **Read Path**: Check Redis first → MongoDB fallback → Cache result
- **Write Path**: Update MongoDB → Invalidate related cache entries
- **Cache Keys**: Structured key patterns for easy management
- **TTL Management**: Configurable TTL for different data types

### 3. Layer Dependencies

```
┌─────────────────────────────────────────┐
│             Interface Layer              │
│  (Controllers, Middleware, Routes)   │
├─────────────────────────────────────────┤
│           Application Layer             │
│         (Use Cases)                │
├─────────────────────────────────────────┤
│            Domain Layer                │
│     (Entities, Services)            │
├─────────────────────────────────────────┤
│        Infrastructure Layer           │
│   (Database, Repositories)         │
└─────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack Analysis

### **Modern & Robust Stack** ⭐⭐⭐⭐⭐

| Category                 | Technology           | Version         | Assessment            |
| ------------------------ | -------------------- | --------------- | --------------------- |
| **Runtime**              | Node.js              | Latest          | ✅ Modern             |
| **Language**             | TypeScript           | 5.9.3           | ✅ Strict typing      |
| **Framework**            | Express.js           | 5.1.0           | ✅ Latest version     |
| **Database**             | MongoDB + Mongoose   | 9.0.0           | ✅ Type-safe ODM      |
| **Dependency Injection** | tsyringe             | 4.10.0          | ✅ Industry standard  |
| **Validation**           | Zod                  | 4.1.13          | ✅ Runtime validation |
| **Testing**              | Jest + Supertest     | 30.2.0 + 7.1.4  | ✅ Comprehensive      |
| **Documentation**        | Swagger/OpenAPI      | 6.2.8 + 5.0.1   | ✅ Auto-generated     |
| **Logging**              | Pino + Pino-pretty   | 10.1.0 + 13.1.3 | ✅ Structured logging |
| **Code Quality**         | Prettier + ESLint v9 | 3.7.4 + 9.39.1  | ✅ Modern config      |

---

### Folder Structure

#### 📂 High-Level Overview

```bash
src/
│
├── 🧠 𝗱𝗼𝗺𝗮𝗶𝗻/                 # 🧠 Pure Business Logic (Entities & Interfaces)
│
├── 🔌 𝗶𝗻𝗳𝗿𝗮𝘀𝘁𝗿𝘂𝗰𝘁𝘂𝗿𝗲/         # 🔌 External Services (DB, APIs)
│
├── 📡 𝗶𝗻𝘁𝗲𝗿𝗳𝗮𝗰𝗲/              # 📡 HTTP Layer (Controllers, Routes)
│
├── 💼 𝘂𝘀𝗲𝗰𝗮𝘀𝗲𝘀/               # 💼 Application Use Cases
│
├── 🧩 shared/                 # 🧩 Shared Utilities & Constants
│
├── 🏷️ types/                  # 🏷️ Global TypeScript Types
│
├── ⚙️ config/                 # ⚙️ Configuration & DI Container
│
├── 🚀 app.ts                  # 🚀 App Entry Point
└── 🎬 server.ts               # 🎬 Server Bootstrap
```

#### 🏗️ Detailed Architecture (Recommended)

```bash
src/
│
├── 🧠 𝗱𝗼𝗺𝗮𝗶𝗻/
│   ├── 🏛️ entities/                        # Core business models
│   │   ├── 𝑃𝑟𝑜𝑑𝑢𝑐𝑡.𝑡𝑠
│   │   └── 𝑈𝑠𝑒𝑟.𝑡𝑠
│   │
│   ├── 🔗 interfaces/                      # Contracts & Abstractions
│   │   ├── 𝐼𝑃𝑟𝑜𝑑𝑢𝑐𝑡𝑅𝑒𝑝𝑜𝑠𝑖𝑡𝑜𝑟𝑦.𝑡𝑠
│   │   └── 𝐼𝐸𝑚𝑎𝑖𝑙𝑆𝑒𝑟𝑣𝑖𝑐𝑒.𝑡𝑠
│   │
│   └── ⚙️ services/                        # Pure domain logic
│       └── 𝑃𝑟𝑖𝑐𝑖𝑛𝑔𝑆𝑒𝑟𝑣𝑖𝑐𝑒.𝑡𝑠
│
├── 💼 𝘂𝘀𝗲𝗰𝗮𝘀𝗲𝘀/
│   └── 🛍️ product/                         # Application business rules
│       ├── 𝐶𝑟𝑒𝑎𝑡𝑒𝑃𝑟𝑜𝑑𝑢𝑐𝑡𝑈𝑠𝑒𝐶𝑎𝑠𝑒.𝑡𝑠
│       └── 𝐺𝑒𝑡𝑃𝑟𝑜𝑑𝑢𝑐𝑡𝑈𝑠𝑒𝐶𝑎𝑠𝑒.𝑡𝑠
│
├── 🔌 𝗶𝗻𝗳𝗿𝗮𝘀𝘁𝗿𝘂𝗰𝘁𝘂𝗿𝗲/
│   ├── 🍃 database/                        # Database implementations
│   │   └── mongodb/
│   │       ├── 🗂️ schemas/                 # ORM Schemas
│   │       │   └── 𝑃𝑟𝑜𝑑𝑢𝑐𝑡𝑆𝑐ℎ𝑒𝑚𝑎.𝑡𝑠
│   │       └── 𝑐𝑜𝑛𝑛𝑒𝑐𝑡𝑖𝑜𝑛.𝑡𝑠
│   │
│   ├── 🗃️ repositories/                    # Data access implementation
│   │   └── 𝑀𝑜𝑛𝑔𝑜𝑃𝑟𝑜𝑑𝑢𝑐𝑡𝑅𝑒𝑝𝑜𝑠𝑖𝑡𝑜𝑟𝑦.𝑡𝑠
│   │
│   └── 🌍 external/                        # 3rd party adapters
│       ├── 𝑆𝑡𝑟𝑖𝑝𝑒𝑃𝑎𝑦𝑚𝑒𝑛𝑡𝑆𝑒𝑟𝑣𝑖𝑐𝑒.𝑡𝑠
│       └── 𝑆𝑒𝑛𝑑𝐺𝑟𝑖𝑑𝐸𝑚𝑎𝑖𝑙𝑆𝑒𝑟𝑣𝑖𝑐𝑒.𝑡𝑠
│
├── 📡 𝗶𝗻𝘁𝗲𝗿𝗳𝗮𝗰𝗲/
│   ├── 🎛️ controllers/                     # Request handlers
│   │   └── 𝑃𝑟𝑜𝑑𝑢𝑐𝑡𝐶𝑜𝑛𝑡𝑟𝑜𝑙𝑙𝑒𝑟.𝑡𝑠
│   │
│   ├── 🛣️ routes/                          # API Definitions
│   │   └── 𝑝𝑟𝑜𝑑𝑢𝑐𝑡𝑅𝑜𝑢𝑡𝑒𝑠.𝑡𝑠
│   │
│   ├── 🚦 middlewares/                     # Request processing
│   │   ├── 𝑎𝑢𝑡ℎ𝑀𝑖𝑑𝑑𝑙𝑒𝑤𝑎𝑟𝑒.𝑡𝑠
│   │   ├── 𝑣𝑎𝑙𝑖𝑑𝑎𝑡𝑖𝑜𝑛𝑀𝑖𝑑𝑑𝑙𝑒𝑤𝑎𝑟𝑒.𝑡𝑠
│   │   └── 𝑒𝑟𝑟𝑜𝑟𝐻𝑎𝑛𝑑𝑙𝑒𝑟.𝑡𝑠
│   │
│   └── 🛡️ dtos/                            # Input validation schemas
│       ├── 𝑃𝑟𝑜𝑑𝑢𝑐𝑡𝐷𝑇𝑂.𝑡𝑠
│       └── 𝑈𝑠𝑒𝑟𝐷𝑇𝑂.𝑡𝑠
│
├── ⚙️ config/
│   ├── index.ts                            # Environment configs
│   └── di-container.ts                     # Dependency Injection
│
├── 🧩 shared/
│   ├── constants.ts                        # Global constants
│   ├── errors.ts                           # Error definitions
│   └── utils.ts                            # Shared helpers
│
├── 🏷️ types/                               # Type definitions
├── 🚀 app.ts                               # App setup
└── 🎬 server.ts                            # Entry point

tests/                                      # 🧪 Test suites (Unit & Integration)
```

---

## 🛠️ Technology Stack

### **Modern & Robust Stack** ⭐⭐⭐⭐⭐

| Category                 | Technology            | Version         | Purpose                          |
| ------------------------ | --------------------- | --------------- | -------------------------------- |
| **Runtime**              | Node.js               | Latest LTS      | JavaScript runtime               |
| **Language**             | TypeScript            | 5.9.3           | Strict typing & modern features  |
| **Framework**            | Express.js            | 5.1.0           | Web framework                    |
| **Database**             | MongoDB + Mongoose    | 9.0.0           | Type-safe ODM                    |
| **Dependency Injection** | tsyringe              | 4.10.0          | Industry standard DI             |
| **Validation**           | Zod                   | 4.1.13          | Runtime validation               |
| **Testing**              | Jest + Supertest      | 30.2.0 + 7.1.4  | Comprehensive testing            |
| **Documentation**        | Swagger/OpenAPI       | 6.2.8 + 5.0.1   | Auto-generated API docs          |
| **Logging**              | Pino + Pino-pretty    | 10.1.0 + 13.1.3 | Structured logging               |
| **Code Quality**         | Prettier + ESLint v9  | 3.7.4 + 9.39.1  | Modern code formatting & linting |
| **Development**          | Nodemon               | 3.1.11          | Hot reloading                    |
| **Test Database**        | mongodb-memory-server | 10.4.1          | In-memory testing                |

### **Complete Package List**

**Production Dependencies:**

```json
{
  "cors": "^2.8.5",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "mongoose": "^9.0.0",
  "pino": "^10.1.0",
  "pino-pretty": "^13.1.3",
  "reflect-metadata": "^0.2.2",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1",
  "tsyringe": "^4.10.0",
  "zod": "^4.1.13"
}
```

**Development Dependencies:**

```json
{
  "@eslint/js": "^9.39.1",
  "@jest/types": "^30.2.0",
  "@types/cors": "^2.8.19",
  "@types/dotenv": "^8.2.0",
  "@types/express": "^5.0.5",
  "@types/jest": "^30.0.0",
  "@types/node": "^24.10.1",
  "@types/supertest": "^6.0.3",
  "@types/swagger-jsdoc": "^6.0.4",
  "@types/swagger-ui-express": "^4.1.8",
  "eslint": "^9.39.1",
  "eslint-config-prettier": "^10.1.8",
  "jest": "^30.2.0",
  "mongodb-memory-server": "^10.4.1",
  "nodemon": "^3.1.11",
  "prettier": "^3.7.4",
  "supertest": "^7.1.4",
  "ts-jest": "^29.4.6",
  "ts-node": "^10.9.2",
  "typescript": "^5.9.3",
  "typescript-eslint": "^8.48.1"
}
```

---

## 🌟 Key Features & Highlights

### 🏗️ Architecture & Core

- **Clean Architecture:** Strict separation of concerns (Domain, Use Case, Infra, Interface) ensuring long-term maintainability.
- **💉 Dependency Injection:** Powerful LoC (Inversion of Control) container using `tsyringe` for modular, testable code.
- **🔒 Advanced Type Safety:** Built with **Strict TypeScript** configuration (ES2020 target) for robust, error-free development.
- **📦 DTO Pattern:** Data Transfer Objects with strict validation layers to sanitize all inputs.

### 🛡️ Security & Quality

- **✨ Automated Formatting:** Zero-config code consistency with **Prettier** & **ESLint v9** (Flat Config).
- **🔎 Runtime Validation:** Fail-fast data integrity checks using **Zod** schema validation.
- **🧪 Enterprise Testing:**
  - **Unit Tests:** Isolated business logic testing.
  - **Integration Tests:** In-memory MongoDB testing with `mongodb-memory-server`.
  - **100% Coverage:** Critical paths fully verified.

### ⚙️ Backend Engineering

- **🍃 MongoDB Object Modeling:** Type-safe database interactions with **Mongoose**.
- **📝 Structured Logging:** JSON-based, high-performance logging with **Pino** (includes pretty-printing for dev).
- **⚡ Global Error Handling:** Centralized middleware catching `AppError`, validation errors, and async rejections.
- **📚 Live API Documentation:** Auto-generated **Swagger/OpenAPI 3.0** documentation accessible via browser.

### 💻 Developer Experience (DX)

- **⚡ Hot Reloading:** Instant feedback loop with `nodemon`.
- **🏷️ Path Aliases:** Clean imports using `@/*` mapping (e.g., `@/domain` instead of `../../domain`).
- **🧩 Modular Design:** Feature-based scalability ready for microservices or monolith expansion.
- **🎨 Beautiful CLI:** Colored log outputs and formatted console messages.

---

> **Status:** ✅ Foundation Complete | 🚀 Ready for Phase 8: Product Module

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

### File Organization

```
src/
├── 🧠 domain/                 # Pure Business Logic
│   ├── entities/              # Core business models
│   ├── interfaces/            # Contracts & Abstractions
│   └── services/              # Pure domain logic
├── 💼 usecases/               # Application Use Cases
├── 🔌 infrastructure/         # External Services
│   ├── database/              # DB implementations
│   ├── repositories/          # Data access
│   └── external/              # 3rd party adapters
├── 📡 interface/              # HTTP Layer
│   ├── controllers/           # Request handlers
│   ├── routes/                # API definitions
│   ├── middlewares/           # Request processing
│   ├── dtos/                  # Input/Output schemas
│   └── validators/            # Zod validation schemas
├── 🧩 shared/                 # Shared Utilities
├── 🏷️ types/                  # TypeScript Types
├── ⚙️ config/                 # Configuration & DI
├── 🧪 test/                   # Test Suites
├── 🚀 app.ts                  # App Entry Point
└── 🎬 server.ts               # Server Bootstrap
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

### Use Cases Layer Best Practices (`src/usecases`)

Use cases orchestrate domain logic and implement application-specific workflows.

- **Single Responsibility**: One use case per business operation
- **Dependency Injection**: Inject all dependencies via constructor
- **Error Handling**: Return domain errors, not infrastructure errors
- **Transaction Management**: Handle transactions at use case level
- **Input/Output DTOs**: Use DTOs for input/output contracts

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

#### Validators (`src/interface/validators`)

- **Zod Schemas**: Define validation schemas for all inputs
- **Error Messages**: Provide clear, user-friendly error messages
- **Type Inference**: Use Zod's type inference for TypeScript types
- **Composition**: Build complex schemas from simpler ones

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
- **Constants**: Centralized application constants
- **Logger**: Structured logging with Pino

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
- **Test Structure**: Mirror source structure in `src/test/`

### Testing Tools

- **Jest**: Modern testing framework with TypeScript support
- **ts-jest**: TypeScript preprocessor
- **mongodb-memory-server**: In-memory MongoDB for integration tests
- **supertest**: HTTP endpoint testing

### Test Organization

```
src/test/
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

_This guide should be updated as the project evolves and new best practices are established._

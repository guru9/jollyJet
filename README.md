# jollyJet

### npm cmd steps to start the app

Here are the **npm commands step-by-step to start your Node.js + TypeScript app (jollyJet)**:

***

### 1. Initialize project and install dependencies (one-time)

```bash
npm install
```

***

### 2. Development mode (run with automatic TypeScript interpretation)

```bash
npm run dev
```

This runs your app directly from `src/index.ts` via `ts-node` (no need to build first).

***

### 3. Production mode

Build the project (compile TypeScript to JavaScript):

```bash
npm run build
```

Run the built JavaScript from `dist`:

```bash
npm start
```


***

### 4. Environment variables

Make sure you have `.env` with env variables (e.g., MongoDB URI)

***

## Summary

- `npm run dev` for development (auto-run TS code)
- `npm run build` + `npm start` for production
- Install all dependencies first with `npm install`
- Use `.env` for secrets/configs via `dotenv`

***



## --------------------- 🧠 Clean Architecture Overview -----------------------


### 📁 Recommended Folder Structureaca

```
src/
├── domain/
│   ├── entities/               # Core models (Product.ts, Order.ts)
│   ├── interfaces/             # Repository ainterfaces (IProductRepository.ts)
│   └── services/               # Domain services and business rules
│
├── usecases/
│   ├── product/
│   │   ├── CreateProductUseCase.ts
│   │   ├── UpdateProductUseCase.ts
│   │   └── ListProductsUseCase.ts
│   └── order/
│       ├── CreateOrderUseCase.ts
│       └── CancelOrderUseCase.ts
│
├── infrastructure/
│   ├── database/
│   │   └── mongodb/
│   │       ├── MongoClient.ts
│   │       └── schemas/
│   │           └── ProductSchema.ts
│   ├── repositories/
│   │   └── MongoProductRepository.ts
│   └── external/               # Payment, emails, etc.
│
├── interface/
│   ├── controllers/            # ProductController.ts, OrderController.ts
│   ├── routes/                 # productRoutes.ts, orderRoutes.ts
│   ├── middlewares/            # errorHandler.ts, requestLogger.ts
│   └── dtos/                   # Zod DTO validation schemas
│
├── config/
│   ├── index.ts                # Application config
│   └── di-container.ts         # Dependency Injection setup (tsyringe)
│
├── shared/
│   ├── constants.ts            # HTTP status codes etc.
│   ├── errors.ts               # Custom error classes (e.g., AppError)
│   └── utils.ts
│
├── app.ts                      # Express app setup
├── server.ts                   # Server bootstrap
└── types/
    └── index.d.ts              # Global TypeScript types
```



### Clean Architecture Layers

The project is organized into four main layers, each with its responsibility:

- **Domain Layer:** Contains core business logic, including Entities (core models like `Product`), Repository Interfaces (e.g., `IProductRepository`), and Domain Services encapsulating business rules. This layer has no dependencies on external frameworks or databases, ensuring purity and testability.
- **Use Cases Layer(application layer):** Defines application-specific logic or workflows that orchestrate domain services and infrastructure interactions. For example, use cases such as `CreateProductUseCase` and `CancelOrderUseCase`.
- **Infrastructure Layer:** Contains actual implementations interfacing with external systems like databases (e.g., MongoDB clients and schemas), third-party APIs (payment gateways), and repository implementations (`MongoProductRepository`). This layer depends on domain interfaces but not vice versa.
- **Interface Layer:** The entry points of the application such as API controllers, route definitions, DTOs for input validation (using Zod), and middleware like error handlers. It deals with HTTP concerns and delegates business logic to use cases.


### Key Best Practices

- **Dependency Injection (DI):** Use `tsyringe` to register and inject dependencies by interfaces (e.g., inject `IProductRepository` with a concrete `MongoProductRepository` implementation), enabling loose coupling and easy mocking in tests.
- **DTO Validation with Zod:** Place validation schemas in `interface/dtos/` to validate API input cleanly and consistently before passing data down to use cases.
- **Repository Abstraction:** Keep database logic hidden behind repository interfaces defined in the domain layer, implemented concretely in the infrastructure layer.
- **Controllers:** Only handle HTTP request/response logic. Validate inputs using DTOs, then delegate business logic to use cases.
- **Use Cases:** Encapsulate all business workflows and orchestrate between domain services and repositories.
- **Domain Layer Purity:** The domain layer is pure and does not depend on frameworks or databases, facilitating isolated business rules testing.
- **Middleware:** Implement reusable middleware such as error handlers and request loggers in the interface layer.
- **Centralized HTTP Status Codes:** Define status codes as constants (`shared/constants.ts`) and use them throughout the app to avoid magic numbers.
- **Custom Error Handling:** Create a custom `AppError` class extending the native `Error`, including HTTP status and operational flags, to standardize error responses in middleware.


### ✅ Best Practices Summary
- **Tsyringe DI:** Use tsyringe to inject dependencies via interfaces.
- **Zod DTOs:** Validate incoming data in dtos/ using Zod schemas.
- **MongoDB:** Abstract MongoDB logic behind repository interfaces.
- **Controllers:** Only handle HTTP logic and delegate to use cases.
- **Use Cases:** Encapsulate business logic and orchestrate domain/repo calls.
- **Domain Layer:** Stay pure—no framework or database dependencies.
- **Infrastructure Layer:** Implement external integrations and data access.
- **Testing:** Mock dependencies via DI for unit testing each layers.

**This structured approach fosters clear separation of concerns, making the application scalable, maintainable, and test-friendly.**




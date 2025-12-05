# 🚀 jollyJet

> **A High-Performance Shopping Application** - _Because Speed and Happiness Matter :)_

![Project Status](https://img.shields.io/badge/status-foundation%20complete-success.svg)
![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Architecture](https://img.shields.io/badge/architecture-clean-blueviolet)
![Language](https://img.shields.io/badge/typescript-v5.0+-blue)

---

## 📚 Documentation Center

### 🛠️ Core Documentation

- 📈 **[Project Analysis](./docs/analysis/01-project-analysis.md)** - Comprehensive overview of project status and architecture
- 📋 **[Task Checklist](./docs/tasks/00-task.md)** - Live project roadmap and progress tracker
- 📊 **[Test Coverage Report](./docs/tests/02-test-coverage-walkthrough.md)** - Detailed walkthrough of the 100% test coverage suite

### 🏗️ Implementation Plans

> Detailed technical specs for each completed phase:

- 🗄️ **[Phase 1: MongoDB Setup](./docs/implementation-plans/01-mongodb-setup-plan.md)** - Database connection & configuration
- 🎨 **[Phase 2: Code Quality](./docs/implementation-plans/02-prettier-eslint-setup-plan.md)** - Prettier & ESLint setup
- 🏛️ **[Phase 3: Foundation](./docs/implementation-plans/03-foundation-setup-plan.md)** - Clean Architecture structure & DI
- 🧰 **[Phase 4: Utilities](./docs/implementation-plans/04-core-utilities-types-plan.md)** - Core types & helper functions
- 🧹 **[Phase 5: Migration](./docs/implementation-plans/05-eslint-v9-migration-plan.md)** - Modernizing ESLint configuration
- 📑 **[Phase 6: Swagger](./docs/implementation-plans/06-swagger-setup-plan.md)** - API documentation setup
- 🧪 **[Phase 7: Testing](./docs/implementation-plans/07-testing-setup-plan.md)** - Jest infrastructure & test suites

---

## ⚡ Quick Start

### 1️⃣ Installation

```bash
# Clone and install dependencies
git clone <repo-url>
cd jollyJet
npm install
```

### 2️⃣ Environment Setup

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/jollyjet
LOG_LEVEL=info
```

### 3️⃣ Run Application

```bash
# Development Mode (with hot-reload)
npm run dev

# Production Build
npm run build
npm start
```

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

## 🏛️ Clean Architecture

The project follows strict Clean Architecture principles to separate concerns and ensure scalability.

### Layers Overview

- **🖥️ Interface Layer** (`src/interface`)
  - Controllers, Routes, DTOs (Zod schemas), Middlewares.
  - Entry point for HTTP requests.
- **🎯 Use Cases Layer** (`src/usecases`)
  - Application specific business rules.
  - Orchestrates domain entities and interfaces.
- **🏛️ Domain Layer** (`src/domain`)
  - **Pure** business logic (Entities, Repository Interfaces).
  - _No external dependencies._
- **🌐 Infrastructure Layer** (`src/infrastructure`)
  - External implementations (Database, External APIs).
  - Implements repository interfaces.

### Folder Structure

#### 📂 High-Level Overview

```bash
src/
│
├── ⚙️ config/                 # ⚙️ Configuration & DI Container
│
├── 🧠 𝗱𝗼𝗺𝗮𝗶𝗻/                 # 🧠 Pure Business Logic (Entities & Interfaces)
│
├── 🔌 𝗶𝗻𝗳𝗿𝗮𝘀𝘁𝗿𝘂𝗰𝘁𝘂𝗿𝗲/         # 🔌 External Services (DB, APIs)
│
├── 📡 𝗶𝗻𝘁𝗲𝗿𝗳𝗮𝗰𝗲/              # 📡 HTTP Layer (Controllers, Routes)
│
├── 🧩 shared/                 # 🧩 Shared Utilities & Constants
│
├── 💼 𝘂𝘀𝗲𝗰𝗮𝘀𝗲𝘀/               # 💼 Application Use Cases
│
├── 🏷️ types/                  # 🏷️ Global TypeScript Types
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
├── 🧪 test/                                # Test suites (Unit & Integration)
│
├── 🏷️ types/                               # Type definitions
│
├── 🚀 app.ts                               # App setup
└── 🎬 server.ts                            # Entry point
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

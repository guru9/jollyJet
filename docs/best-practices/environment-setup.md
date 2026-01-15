# 🔧 Environment Setup Guide

> **Last Updated:** January 14, 2026  
> **Purpose:** Complete environment setup for JollyJet development

---

## 📁 File Structure - ✅ IMPLEMENTED

### **Step 1: Understand Project Structure**

#### **Core Directory Layout:**

```
jollyJet/
├── 📂 src/                          # Source code (60+ files)
│   ├── 📂 domain/                   # Business logic layer
│   │   ├── 📂 entities/            # Domain entities
│   │   │   └── product/Product.ts
│   │   ├── 📂 services/            # Domain services
│   │   │   ├── cache/CacheConsistencyService.ts
│   │   │   ├── product/ProductService.ts
│   │   │   └── security/CorsSecurityService.ts
│   │   ├── 📂 interfaces/         # Domain interfaces
│   │   │   ├── cache/ICacheService.ts
│   │   │   ├── product/IProductService.ts
│   │   │   └── security/ICorsSecurityService.ts
│   │   └── 📂 use-cases/          # Application use cases
│   │       ├── product/
│   │       ├── user/
│   │       └── order/
│   ├── 📂 infrastructure/          # External integrations
│   │   ├── 📂 database/           # Database connections
│   │   └── 📂 external/           # External APIs
│   ├── 📂 interface/              # API layer
│   │   ├── 📂 controllers/        # HTTP controllers
│   │   │   └── product/ProductController.ts
│   │   ├── 📂 middlewares/        # Express middleware
│   │   │   ├── corsSecurity.ts
│   │   │   └── index.ts
│   │   ├── 📂 routes/            # Route definitions
│   │   └── 📂 validators/        # Request validation
│   │       └── product/ProductValidators.ts
│   ├── 📂 shared/               # Shared utilities
│   │   ├── constants.ts
│   │   ├── logger.ts
│   │   └── types.ts
│   ├── 📂 config/              # Configuration files
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── di-container.ts
│   └── 📂 app.ts               # Main application file
├── 📂 tests/                   # Test files (25+ files)
│   ├── 📂 unit/               # Unit tests
│   ├── 📂 integration/        # Integration tests
│   ├── 📂 setup.ts           # Test setup configuration
│   └── 📂 jest.config.js     # Jest configuration
├── 📂 docs/                  # Documentation (40+ files)
│   ├── 📂 best-practices/    # Development guidelines
│   ├── 📂 implementation-plans/  # Feature plans
│   ├── 📂 analysis/         # Code analysis reports
│   ├── 📂 tests/            # Testing documentation
│   ├── 📂 migrations/       # Migration guides
│   └── 📂 flowchart/       # System diagrams
├── 📂 logs/                 # Application logs
├── 📄 package.json         # Dependencies & scripts
├── 📄 tsconfig.json       # TypeScript configuration
├── 📄 jest.config.js      # Test configuration
├── 📄 .env.example        # Environment template
├── 📄 .gitignore          # Git ignore rules
├── 📄 .eslintrc.json      # ESLint configuration
├── 📄 .prettierrc         # Prettier configuration
└── 📄 README.md           # Project documentation
```

#### **Architecture Layers:**

```
┌─────────────────────────────────────────┐
│              Interface Layer            │  ← HTTP Controllers, Routes, Validators
├─────────────────────────────────────────┤
│           Use Cases Layer               │  ← Business logic implementation
├─────────────────────────────────────────┤
│           Domain Layer                  │  ← Entities, Services, Interfaces
├─────────────────────────────────────────┤
│        Infrastructure Layer            │  ← Database, External APIs
└─────────────────────────────────────────┘
```

### **Step 2: Key Configuration Files**

#### **Essential Files:**

- `src/app.ts` - Express application setup
- `src/config/di-container.ts` - Dependency injection
- `src/shared/constants.ts` - Application constants
- `src/shared/logger.ts` - Logging configuration
- `tests/setup.ts` - Test environment setup

#### **Configuration Files:**

- `package.json` - Dependencies and npm scripts
- `tsconfig.json` - TypeScript compiler options
- `jest.config.js` - Test framework configuration
- `.env.example` - Environment variables template

### **Step 3: Development Entry Points**

#### **Start Development:**

```bash
# 1. Navigate to project root
cd jollyJet

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 4. Start development server
npm run dev
```

#### **Run Tests:**

```bash
# All tests
npm test

# Coverage report
npm run test:coverage

# Watch mode
npm run test:watch
```

### **Step 4: Understanding the Codebase**

#### **Clean Architecture Pattern:**

- **Domain Layer**: Core business logic (entities, interfaces)
- **Use Cases Layer**: Application-specific business rules
- **Interface Layer**: External interfaces (controllers, routes)
- **Infrastructure Layer**: External concerns (database, APIs)

#### **Key Concepts:**

- **Dependency Injection**: Uses `tsyringe` for DI
- **TypeScript**: Strict typing throughout
- **Jest**: Testing framework with comprehensive coverage
- **MongoDB**: Primary database with Mongoose ODM
- **Redis**: Caching and session management
- **Express**: Web framework for REST API
- **Pino**: Structured logging
- **Zod**: Runtime type validation

---

## 📋 Prerequisites

### **System Requirements**

#### **Operating Systems:**

- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+ / Linux distributions

#### **Required Software:**

- **Node.js**: v18.0.0+ (check `package.json` for exact version)
- **npm**: v8.0.0+ (comes with Node.js)
- **Git**: v2.30.0+
- **MongoDB**: v5.0+ (local or Atlas account)
- **Redis**: v6.0+ (local or Redis Labs account)

#### **Optional but Recommended:**

- **VS Code**: Latest version with extensions
- **Postman**: For API testing
- **MongoDB Compass**: For database management
- **Redis Desktop Manager**: For Redis management

---

## 🛠️ Installation Guide

### **1. Node.js Setup**

#### **Install Node.js:**

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18

# Or download from https://nodejs.org/
```

#### **Verify Installation:**

```bash
node --version  # Should be v18.x.x
npm --version   # Should be 8.x.x or higher
```

### **2. Git Setup**

#### **Install Git:**

```bash
# Windows: Download from https://git-scm.com/
# macOS: brew install git
# Ubuntu: sudo apt-get install git
```

#### **Configure Git:**

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

### **3. MongoDB Setup**

#### **Option A: MongoDB Atlas (Cloud - Recommended)**

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create free account
3. Create new cluster (free tier available)
4. Get connection string
5. Create database user and password

#### **Option B: Local MongoDB**

```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew tap mongodb/brew && brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/your/db

# Verify connection
mongosh --eval "db.runCommand('ping')"
```

### **4. Redis Setup**

#### **Option A: Redis Labs (Cloud - Recommended)**

1. Go to [Redis Labs](https://redis.com/try-free/)
2. Create free account
3. Create new database
4. Get connection details

#### **Option B: Local Redis**

```bash
# Windows: Download from https://redis.io/download
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-server

# Start Redis
redis-server

# Test connection
redis-cli ping
```

---

## 🚀 Project Setup

### **1. Clone Repository**

```bash
# Clone the repository
git clone <repository-url>
cd jollyJet

# Or if you already have the repo
cd jollyJet
git pull origin main
```

### **2. Install Dependencies**

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### **3. Environment Configuration**

#### **Copy Environment Template:**

```bash
# Copy the example file
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

#### **Environment Variables Explanation:**

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jollyjet
DB_NAME=jollyjet

# Redis Configuration
REDIS_URL=redis://username:password@host:port
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security Configuration
BCRYPT_ROUNDS=12
```

### **4. Verify Environment Setup**

#### **Validate Configuration:**

```bash
# Run validation script (if available)
npm run validate:env

# Or manually check
node -e "
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('REDIS_URL exists:', !!process.env.REDIS_URL);
"
```

#### **Test Database Connections:**

```bash
# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));
"

# Test Redis connection
node -e "
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect()
  .then(() => console.log('✅ Redis connected'))
  .catch(err => console.error('❌ Redis error:', err));
"
```

---

## 🧪 Verification Steps

### **1. Run Development Server**

```bash
# Start development server
npm run dev

# Expected output:
# Server running on port 3000
# MongoDB connected
# Redis connected
```

### **2. Run Tests**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Expected: All tests pass
```

### **3. Check Code Quality**

```bash
# Run linting
npm run lint

# Format check
npm run format:check

# Build TypeScript
npm run build

# Expected: No errors or warnings
```

### **4. Test API Endpoints**

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test products endpoint
curl http://localhost:3000/api/products

# Expected: Proper JSON responses
```

---

## 🛠️ Development Tools Setup

### **VS Code Setup**

#### **Install Extensions:**

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "mongodb.mongodb-vscode",
    "humao.rest-client"
  ]
}
```

#### **VS Code Settings:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

### **Postman Setup**

#### **Import Collection:**

1. Open Postman
2. Click "Import"
3. Select `docs/postman-collection.json` (if available)
4. Or manually create requests:

```json
{
  "info": {
    "name": "JollyJet API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ]
}
```

### **Database Tools**

#### **MongoDB Compass:**

1. Install [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect using your MONGO_URI
3. Browse collections and data

#### **Redis Desktop Manager:**

1. Install Redis GUI tool
2. Connect using your Redis URL
3. Monitor cache data

---

## 🐛 Common Setup Issues

### **Port Already in Use**

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### **MongoDB Connection Issues**

```bash
# Check connection string format
# Correct: mongodb+srv://user:pass@cluster.mongodb.net/dbname
# Wrong: mongodb://user:pass@localhost:27017/dbname

# Test connection manually
mongosh "your-connection-string"

# Common fixes:
# - Check user credentials
# - Verify network access (IP whitelist)
# - Ensure user has database permissions
```

### **Redis Connection Issues**

```bash
# Test connection manually
redis-cli -u "your-redis-url"

# Common fixes:
# - Check password
# - Verify port and host
# - Check firewall settings
```

### **Dependency Issues**

```bash
# Clear npm cache
npm cache clean --force

# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Use exact Node.js version
nvm use 18
npm install
```

### **TypeScript Compilation Issues**

```bash
# Check TypeScript version
npx tsc --version

# Recompile
npm run build

# Watch mode
npm run build:watch
```

---

## 🔧 Advanced Setup

### **Docker Setup (Optional)**

#### **Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

#### **Docker Compose:**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://mongo:27017/jollyjet
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

  mongo:
    image: mongo:5.0
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:6.0
    ports:
      - '6379:6379'

volumes:
  mongo_data:
```

### **Development Scripts**

#### **Package.json Scripts:**

```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write src/**/*.ts",
    "format:check": "prettier --check src/**/*.ts",
    "validate": "npm run lint && npm run test && npm run build",
    "db:seed": "ts-node scripts/seed.ts",
    "db:reset": "ts-node scripts/reset.ts"
  }
}
```

---

## 📋 Setup Verification Checklist

### **Initial Setup:**

- [ ] Node.js v18+ installed
- [ ] Git configured with user details
- [ ] MongoDB account/instance ready
- [ ] Redis account/instance ready
- [ ] Repository cloned successfully

### **Project Configuration:**

- [ ] Dependencies installed without errors
- [ ] .env file created and configured
- [ ] Database connections tested and working
- [ ] Development server starts successfully

### **Development Tools:**

- [ ] VS Code with extensions installed
- [ ] Linting and formatting working
- [ ] Tests running successfully
- [ ] Build process working

### **Final Verification:**

- [ ] Health endpoint responding
- [ ] API endpoints accessible
- [ ] Code quality checks passing
- [ ] All tests passing

---

## 🔗 Related Documentation

- [Development Process Guide](./development-process.md)
- [Debugging Guide](./debugging-guide.md)
- [Security Checklist](./security-checklist.md)

---

## 📞 Support Resources

### **Official Documentation:**

- [Node.js Docs](https://nodejs.org/docs/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Redis Docs](https://redis.io/documentation)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### **Community Support:**

- [Stack Overflow](https://stackoverflow.com/)
- [GitHub Issues](https://github.com/mongodb/node-mongodb-native/issues)
- [Node.js Discord](https://discord.gg/nodejs)

---

**Generated by:** Antigravity AI  
**Environment Setup Guide:** v1.0  
**Last Updated:** 2026-01-14

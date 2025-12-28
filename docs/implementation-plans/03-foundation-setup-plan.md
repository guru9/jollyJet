# Implementation Plan #03 - Foundation Setup

**Plan:** 03-foundation-setup-plan  
**Branch:** `feature/jollyjet-03-foundation-setup`  
**Status:** ✅ Completed

---

## Overview

This phase establishes the foundational structure of the JollyJet application using Clean Architecture principles, including Express setup, middleware, configuration, and dependency injection.

---

## Folder Structure Changes

```
jollyJet/
├── src/
│   ├── app.ts                        # ✅ NEW - Express application setup
│   ├── server.ts                     # ✅ NEW - Server entry point
│   │
│   ├── config/
│   │   ├── index.ts                  # ✅ NEW - Configuration exports
│   │   ├── env.validation.ts         # ✅ NEW - Environment validation
│   │   └── di-container.ts           # ✅ NEW - Dependency injection
│   │
│   ├── domain/
│   │   ├── entities/                 # ✅ NEW - Domain entities folder
│   │   ├── interfaces/               # ✅ NEW - Domain interfaces folder
│   │   └── services/                 # ✅ NEW - Domain services folder
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   ├── repositories/             # ✅ NEW - Repositories folder
│   │   └── external/                 # ✅ NEW - External services folder
│   │
│   ├── interface/
│   │   ├── controllers/              # ✅ NEW - Controllers folder
│   │   ├── routes/                   # ✅ NEW - Routes folder
│   │   ├── dtos/                     # ✅ NEW - DTOs folder
│   │   └── middlewares/
│   │       ├── index.ts              # ✅ NEW - Middleware exports
│   │       ├── errorHandler.ts       # ✅ NEW - Error handler
│   │       └── requestLogger.ts      # ✅ NEW - Request logger
│   │
│   ├── usecases/
│   │   ├── product/                  # ✅ NEW - Product use cases folder
│   │   └── order/                    # ✅ NEW - Order use cases folder
│   │
│   └── types/
│       └── index.d.ts                # ✅ NEW - Global type declarations
│
├── .env                              # ✅ NEW - Environment variables
├── tsconfig.json                     # ✅ NEW - TypeScript configuration
└── package.json                      # ✅ MODIFIED - Added dependencies
```

---

## Proposed Changes

### ✅ NEW: `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import { errorHandler, requestLogger } from './interface/middlewares';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

---

### ✅ NEW: `src/config/index.ts`

```typescript
import dotenv from 'dotenv';
import { validateEnv } from './env.validation';

dotenv.config();

const env = validateEnv();

const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI,
  logLevel: env.LOG_LEVEL,
};

export default config;
```

---

### ✅ NEW: `src/config/env.validation.ts`

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  MONGODB_URI: z.string(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}
```

---

### ✅ NEW: `src/config/di-container.ts`

```typescript
import 'reflect-metadata';
import { container } from 'tsyringe';

export function initializeDIContainer() {
  // Register dependencies here
  // Example: container.register('IUserRepository', { useClass: UserRepository });
}

export { container };
```

---

### ✅ NEW: `src/interface/middlewares/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../../shared/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, req: { method: req.method, url: req.url } }, 'Error occurred');

  res.status(500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
```

---

### ✅ NEW: `src/interface/middlewares/requestLogger.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import logger from '../../shared/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const { method, path, ip } = req;
  const { statusCode } = res;
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.info(
      {
        method,
        path,
        statusCode,
        ip,
        duration: `${duration}ms`,
      },
      `${method} ${path} ${statusCode} - ${ip} - ${duration}ms`
    );
  });

  next();
};
```

---

### ✅ NEW: `src/interface/middlewares/index.ts`

```typescript
export { errorHandler } from './errorHandler';
export { requestLogger } from './requestLogger';
```

---

### ✅ MODIFIED: `package.json`

**Added Dependencies**:

```json
{
  "dependencies": {
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "pino": "^10.1.0",
    "pino-pretty": "^13.1.3",
    "tsyringe": "^4.10.0",
    "zod": "^4.1.13",
    "reflect-metadata": "^0.2.2"
  },
  "devDependencies": {
    "@types/express": "^5.0.5",
    "@types/cors": "^2.8.19",
    "@types/node": "^24.10.1"
  }
}
```

---

## Verification Plan

### 1. Install Dependencies

```bash
npm install
```

### 2. Create .env File

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/jollyjet
LOG_LEVEL=info
```

### 3. Start Server

```bash
npm run dev
```

Expected output:

```
🛫 jollyJet Server listening on port 3000
```

### 4. Test Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-12-04T18:00:00.000Z"
}
```

---

## Clean Architecture Layers

```
┌─────────────────────────────────────────┐
│         Interface Layer (API)           │
│  controllers/ routes/ middlewares/      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│        Use Cases Layer (Business)       │
│         usecases/ (application)         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Domain Layer (Core Business)       │
│   entities/ services/ interfaces/       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Infrastructure Layer (External)      │
│  database/ repositories/ external/      │
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

---

## Status

✅ Clean Architecture structure created  
✅ Express application configured  
✅ Middleware setup completed  
✅ Environment validation implemented  
✅ Dependency injection configured  
✅ Health endpoint working

**Phase 03 Complete!** 🎉




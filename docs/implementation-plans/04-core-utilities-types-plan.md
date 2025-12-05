# Implementation Plan #04 - Core Utilities & Types

**Plan:** 04-core-utilities-types-plan  
**Branch:** `feature/jollyjet-04-core-utilities-types`  
**Status:** ✅ Completed

---

## Overview

This phase implements core shared utilities, custom error classes, logger configuration, application constants, and TypeScript type definitions that will be used throughout the JollyJet application.

---

## Folder Structure Changes

```
jollyJet/
├── src/
│   ├── shared/
│   │   ├── logger.ts                 # ✅ NEW - Pino logger configuration
│   │   ├── errors.ts                 # ✅ NEW - Custom error classes
│   │   ├── utils.ts                  # ✅ NEW - Utility functions
│   │   └── constants.ts              # ✅ NEW - Application constants
│   │
│   └── types/
│       └── index.d.ts                # ✅ MODIFIED - Added type definitions
│
└── package.json                      # ✅ MODIFIED - Added utility dependencies
```

**Files Added**:

- `src/shared/logger.ts` - Centralized logging with Pino
- `src/shared/errors.ts` - Custom error classes
- `src/shared/utils.ts` - Reusable utility functions
- `src/shared/constants.ts` - Application-wide constants

**Files Modified**:

- `src/types/index.d.ts` - Added global type definitions
- `package.json` - Added pino, pino-pretty

---

## Proposed Changes

### ✅ NEW: `src/shared/logger.ts`

```typescript
import pino from 'pino';
import config from '../config';

const logger = pino({
  level: config.logLevel,
  transport:
    config.env === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'dd-mm-yyyy HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export default logger;
```

---

### ✅ NEW: `src/shared/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409);
  }
}
```

---

### ✅ NEW: `src/shared/utils.ts`

```typescript
/**
 * Delay execution for specified milliseconds
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Format price to currency string
 */
export const formatPrice = (price: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Sanitize string for safe usage
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '');
};
```

---

### ✅ NEW: `src/shared/constants.ts`

```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
```

---

### ✅ MODIFIED: `src/types/index.d.ts`

```typescript
// Global type definitions

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type UserRole = 'admin' | 'customer' | 'vendor';

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
```

---

### ✅ MODIFIED: `package.json`

**Added Dependencies**:

```json
{
  "dependencies": {
    "pino": "^10.1.0",
    "pino-pretty": "^13.1.3"
  }
}
```

---

## Verification Plan

### 1. Install Dependencies

```bash
npm install
```

### 2. Test Logger

Create a test file or add to existing code:

```typescript
import logger from './shared/logger';

logger.info('Test info message');
logger.error('Test error message');
logger.debug('Test debug message');
```

### 3. Test Error Classes

```typescript
import { ValidationError, NotFoundError } from './shared/errors';

throw new ValidationError('Invalid input');
throw new NotFoundError('User not found');
```

### 4. Test Utilities

```typescript
import { formatPrice, isEmpty, delay } from './shared/utils';

console.log(formatPrice(1234.56)); // $1,234.56
console.log(isEmpty('')); // true
await delay(1000); // Wait 1 second
```

### 5. Start Server

```bash
npm run dev
```

Verify logger output is formatted correctly in development mode.

---

## Usage Examples

### Logger

```typescript
import logger from '@/shared/logger';

logger.info({ userId: '123' }, 'User logged in');
logger.error({ err: error }, 'Failed to process payment');
logger.debug({ data }, 'Processing request');
```

### Custom Errors

```typescript
import { ValidationError, NotFoundError } from '@/shared/errors';

// In a controller
if (!user) {
  throw new NotFoundError('User not found');
}

if (!isValid) {
  throw new ValidationError('Invalid email format');
}
```

### Utilities

```typescript
import { formatPrice, isEmpty, sanitizeString } from '@/shared/utils';

const price = formatPrice(99.99); // "$99.99"
const empty = isEmpty([]); // true
const safe = sanitizeString(userInput);
```

### Constants

```typescript
import { HTTP_STATUS, ORDER_STATUS } from '@/shared/constants';

res.status(HTTP_STATUS.OK).json({ status: ORDER_STATUS.PENDING });
```

---

## Next Steps

- [ ] Add more utility functions as needed
- [ ] Implement error handling middleware
- [ ] Add request/response logging
- [ ] Create validation helpers
- [ ] Add date/time utilities
- [ ] Implement caching utilities

---

## Status

✅ Logger configured with Pino  
✅ Custom error classes created  
✅ Utility functions implemented  
✅ Application constants defined  
✅ Global types defined

**Phase 04 Complete!** 🎉

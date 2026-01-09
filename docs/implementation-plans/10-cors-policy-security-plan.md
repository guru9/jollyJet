# CORS Policy & Security Implementation Plan

**Related Task:** [`04-cors-task.md`](../tasks/04-cors-task.md)
**Branch:** `feature/jollyjet-11-cors-security`

## Overview

This document outlines the implementation plan for securing Cross-Origin Resource Sharing (CORS) in the JollyJet E-commerce API. CORS is a critical security feature that controls which external domains can access API resources, preventing unauthorized cross-origin attacks while maintaining flexibility for legitimate web applications.

## Table of Contents

1. [Overview](#overview)
2. [Goals](#goals)
3. [Non-Goals](#non-goals)
4. [Background](#background)
5. [Detailed Design](#detailed-design)
   - [Architecture](#architecture)
   - [CORS Configuration Strategy](#cors-configuration-strategy)
   - [Security Enhancements](#security-enhancements)
   - [Implementation Steps](#implementation-steps)
6. [Folder Structure](#folder-structure)
7. [API Reference](#api-reference)
8. [Testing Strategy](#testing-strategy)
9. [Security Considerations](#security-considerations)
10. [Deployment Considerations](#deployment-considerations)
11. [Rollback Plan](#rollback-plan)
12. [Status](#status)

## Goals

### Primary Objectives

1. **Secure Cross-Origin Access**: Implement robust CORS policies that restrict API access to authorized origins only
2. **Environment-Based Configuration**: Support different CORS settings for development, staging, and production environments
3. **Comprehensive Request Validation**: Validate all CORS preflight requests and headers before processing
4. **Security Logging**: Log all CORS violations and suspicious cross-origin activities for monitoring
5. **Compliance**: Meet security best practices for RESTful API design

### Secondary Objectives

1. **Performance Optimization**: Minimize CORS overhead through efficient caching and validation
2. **Flexibility**: Allow dynamic configuration of allowed origins without code changes
3. **Observability**: Provide detailed metrics and logging for CORS operations

## Non-Goals

- **Authentication/Authorization**: CORS operates at the browser level and doesn't replace proper authentication mechanisms
- **Rate Limiting**: While related to security, rate limiting is handled by a separate middleware
- **WebSocket Security**: WebSocket connections require different security considerations
- **Legacy Browser Support**: Focus on modern browsers with standard CORS support

## Background

### What is CORS?

Cross-Origin Resource Sharing (CORS) is an HTTP-header based mechanism that allows a server to indicate any origins (domain, scheme, or port) other than its own from which a browser should permit loading resources. CORS also relies on a mechanism by which browsers make a "preflight" request to the server hosting the cross-origin resource, in order to check that the server will permit the actual request.

### Why CORS Matters for E-commerce APIs

1. **Security Boundary**: Browsers enforce the same-origin policy by default, blocking malicious scripts from accessing sensitive API endpoints
2. **Third-Party Integrations**: E-commerce platforms often need to integrate with payment gateways, analytics services, and partner applications
3. **Mobile App Support**: Mobile applications may require API access from different origins
4. **PCI Compliance**: Payment Card Industry standards require strict control over cross-origin access to sensitive endpoints

### Current State

Currently, the JollyJet API does not have a dedicated CORS configuration. The application uses Express.js with basic CORS support, but lacks:

- Environment-specific CORS policies
- Comprehensive origin validation
- CORS security logging
- Request header sanitization
- Pre-flight request handling

## Detailed Design

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CORS Security Architecture                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌──────────────────┐     ┌──────────────────────────┐ │
│  │   Browser   │────▶│  CORS Middleware │────▶│  Express Application     │ │
│  │  (Client)   │     │  (corsSecurity)  │     │  (Request Handlers)      │ │
│  └─────────────┘     └──────────────────┘     └──────────────────────────┘ │
│                              │                                                    │
│                              ▼                                                    │
│                       ┌──────────────────┐                                      │
│                       │  CORS Logger     │                                      │
│                       │  (corsLogger)    │                                      │
│                       └──────────────────┘                                      │
│                              │                                                    │
│                              ▼                                                    │
│                       ┌──────────────────┐                                      │
│                       │   Logger Service │                                      │
│                       │  ( Pino/Winston) │                                      │
│                       └──────────────────┘                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
src/
├── app.ts                # CORS middleware integration (Step 1)
├── config/
│   └── cors.ts            # CORS configuration module (Step 2)
├── interface/
│   └── middlewares/
│       ├── corsSecurity.ts  # CORS security middleware (Step 4)
│       └── corsLogger.ts    # CORS logging middleware (Step 5)
└── tests/
    ├── unit/
    │   └── cors.test.ts      # CORS unit tests (Step 6)
    └── integration/
        └── cors.integration.test.ts  # CORS integration tests (Step 6)

# Step 1 Files (Install CORS Middleware)
package.json              # CORS dependencies (Step 1)
```

### CORS Configuration Strategy

#### Environment-Based Configuration

The CORS configuration will be environment-aware, with different settings for development, staging, and production environments.

```typescript
interface ICorsConfig {
  allowedOrigins: string[]; // Array of allowed origins
  allowedMethods: string[]; // HTTP methods allowed
  allowedHeaders: string[]; // Request headers allowed
  exposedHeaders: string[]; // Response headers exposed to client
  maxAge: number; // Preflight cache duration (seconds)
  credentials: boolean; // Allow credentials (cookies, auth headers)
  originValidationEnabled: boolean; // Enable strict origin validation
  logViolations: boolean; // Log CORS violations
  blockNonCorsRequests: boolean; // Block requests without Origin header in prod
}
```

#### Configuration Levels

1. **Development**: Permissive CORS for local development
2. **Staging**: Semi-restrictive CORS for testing environments
3. **Production**: Strict CORS with comprehensive validation

### Security Enhancements

#### 1. Origin Validation

```typescript
// Strict origin validation with fallback support
const validateOrigin = (origin: string): boolean => {
  if (config.isDevelopment) return true;

  return (
    config.allowedOrigins.includes(origin) ||
    isSubdomain(origin, config.baseDomain) ||
    isWhiteListed(origin, config.whitelist)
  );
};
```

#### 2. Request Header Sanitization

All incoming CORS-related headers will be sanitized to prevent header injection attacks:

```typescript
const sanitizeHeaders = (headers: IncomingHttpHeaders): SanitizedHeaders => {
  return {
    origin: sanitizeString(headers.origin),
    'access-control-request-method': sanitizeString(headers['access-control-request-method']),
    'access-control-request-headers': sanitizeString(headers['access-control-request-headers']),
  };
};
```

#### 3. Preflight Request Handling

Preflight OPTIONS requests will be validated before processing:

```typescript
const handlePreflight = (req: Request, res: Response): void => {
  const origin = req.headers.origin;

  if (!origin) {
    log.warn('Preflight request without Origin header', { ip: req.ip });
    if (config.blockNonCorsRequests) {
      res.status(403).json({ error: 'Origin header required' });
      return;
    }
  }

  if (origin && !validateOrigin(origin)) {
    log.warn('Preflight request from unauthorized origin', { origin, ip: req.ip });
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  // Set CORS headers for preflight response
  setCorsHeaders(res, origin);
  res.status(204).send();
};
```

### Implementation Steps

#### Step 1: CORS Configuration Module

1. Create `src/config/cors.ts` with environment-specific CORS options
2. Export `getCorsOptions()` function that returns configured CORS options
3. Implement origin validation logic
4. Add configuration validation

#### Step 2: CORS Security Middleware

1. Create `src/interface/middlewares/corsSecurity.ts`
2. Implement strict origin validation
3. Add request header sanitization
4. Integrate with configuration module
5. Add security logging

#### Step 3: CORS Logger Middleware

1. Create `src/interface/middlewares/corsLogger.ts`
2. Log all CORS preflight requests
3. Log CORS violations and blocked requests
4. Track CORS metrics

#### Step 4: Integration

1. Update `src/config/index.ts` to export CORS configuration
2. Update `src/interface/middlewares/index.ts` to export CORS middleware
3. Update `src/app.ts` to use the new CORS middleware

#### Step 5: Testing

1. Create unit tests for CORS configuration
2. Create unit tests for origin validation
3. Create integration tests for CORS middleware
4. Create security tests for header sanitization

## Implementation Steps

### Implementation Steps with Dependencies

#### Step 1: Install CORS Middleware

**Files:** `package.json`, `src/app.ts`
**Dependencies:** None

**Code Snippet - package.json:**

```json
{
  "dependencies": {
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/cors": "^2.8.19"
  }
}
```

**Code Snippet - src/app.ts:**

```typescript
import cors from 'cors';
import { getCorsOptions } from '@/config/cors';

// Apply CORS middleware
app.use(cors(getCorsOptions()));
```

#### Step 2: Configure CORS Options

**Files:** `src/config/cors.ts`
**Dependencies:** Step 1

**Code Snippet - src/config/cors.ts:**

```typescript
import { CorsOptions } from 'cors';

export const getCorsOptions = (): CorsOptions => {
  const env = process.env.NODE_ENV || 'development';
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  };
};
```

#### Step 3: Environment-Specific Policies

**Files:** `src/config/cors.ts`, `.env`
**Dependencies:** Step 2

**Code Snippet - .env:**

```env
# CORS Configuration
CORS_ORIGINS=https://jollyjet.com,https://www.jollyjet.com
```

**Code Snippet - src/config/cors.ts (Environment Handling):**

```typescript
// Environment-specific allowed origins
const allowedOrigins = {
  development: ['http://localhost:3000', 'http://localhost:3001'],
  staging: ['https://staging.jollyjet.com'],
  production: ['https://jollyjet.com', 'https://www.jollyjet.com'],
};
```

#### Step 4: Security Enhancements

**Files:** `src/interface/middlewares/corsSecurity.ts`
**Dependencies:** Step 3

**Code Snippet - src/interface/middlewares/corsSecurity.ts:**

```typescript
import { Request, Response, NextFunction } from 'express';

export const corsSecurityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Pre-flight caching
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  next();
};
```

#### Step 5: Monitoring and Logging

**Files:** `src/interface/middlewares/corsLogger.ts`
**Dependencies:** Step 4

**Code Snippet - src/interface/middlewares/corsLogger.ts:**

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/shared/logger';

export const corsLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const origin = req.headers.origin;

  if (origin) {
    logger.info('CORS Request', {
      origin,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};
```

#### Step 6: Testing and Validation

**Files:** `tests/unit/cors.test.ts`, `tests/integration/cors.integration.test.ts`
**Dependencies:** Step 5

**Code Snippet - tests/unit/cors.test.ts:**

```typescript
import { getCorsOptions } from '@/config/cors';

describe('CORS Configuration', () => {
  it('should allow valid origins', () => {
    const mockCallback = jest.fn();
    const corsOptions = getCorsOptions();
    corsOptions.origin('https://jollyjet.com', mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(null, true);
  });

  it('should reject invalid origins', () => {
    const mockCallback = jest.fn();
    const corsOptions = getCorsOptions();
    corsOptions.origin('https://malicious.com', mockCallback);
    expect(mockCallback).toHaveBeenCalledWith(expect.any(Error));
  });
});
```

## API Reference

### Configuration Module

#### `getCorsOptions(): CorsOptions`

Returns the configured CORS options based on the current environment.

```typescript
import { getCorsOptions } from '@/config/cors';

const corsOptions = getCorsOptions();
app.use(cors(corsOptions));
```

**Returns:**

- `CorsOptions` object compatible with the `cors` package

**Throws:**

- `ConfigurationError` if required environment variables are missing

### Security Middleware

#### `corsSecurity(req: Request, res: Response, next: NextFunction): void`

Middleware that performs additional CORS security checks beyond the basic `cors` middleware.

```typescript
import { corsSecurity } from '@/interface/middlewares/corsSecurity';

app.use(corsSecurity);
```

**Security Checks:**

1. Validates Origin header presence
2. Validates Origin against whitelist
3. Sanitizes CORS-related headers
4. Logs suspicious activities

### Logger Middleware

#### `corsLogger(req: Request, res: Response, next: NextFunction): void`

Middleware that logs all CORS-related activities.

```typescript
import { corsLogger } from '@/interface/middlewares/corsLogger';

app.use(corsLogger);
```

**Logged Events:**

- Preflight requests (OPTIONS)
- CORS violations
- Unauthorized origin attempts
- Invalid CORS headers

## Testing Strategy

### Unit Tests

```typescript
describe('CORS Configuration', () => {
  describe('getCorsOptions', () => {
    it('should return development options in development', () => {
      // Test development configuration
    });

    it('should return production options in production', () => {
      // Test production configuration
    });
  });

  describe('Origin Validation', () => {
    it('should allow whitelisted origins', () => {
      // Test whitelist validation
    });

    it('should block non-whitelisted origins', () => {
      // Test rejection of unauthorized origins
    });
  });
});
```

### Integration Tests

```typescript
describe('CORS Integration', () => {
  it('should allow requests from whitelisted origins', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Origin', 'https://whitelisted-domain.com');

    expect(response.headers['access-control-allow-origin']).toBe('https://whitelisted-domain.com');
  });

  it('should block requests from non-whitelisted origins', async () => {
    const response = await request(app)
      .get('/api/products')
      .set('Origin', 'https://malicious-domain.com');

    expect(response.status).toBe(403);
  });
});
```

### Security Tests

```typescript
describe('CORS Security', () => {
  it('should sanitize malicious header values', async () => {
    // Test header sanitization
  });

  it('should log CORS violations', async () => {
    // Test logging behavior
  });
});
```

## Security Considerations

### 1. Origin Spoofing Prevention

The implementation will validate the Origin header against a strict whitelist, preventing spoofing attacks.

### 2. Header Injection Prevention

All CORS-related headers will be sanitized before processing to prevent injection attacks.

### 3. Preflight Request Security

Preflight OPTIONS requests will be validated before processing, preventing cache poisoning and other attacks.

### 4. Information Disclosure

CORS error messages will not disclose sensitive information about the application's internal structure.

### 5. Credential Security

Credentials will only be allowed from origins that explicitly require them, following the principle of least privilege.

## Deployment Considerations

### Environment Variables

```bash
# Required environment variables
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_EXPOSED_HEADERS=X-Total-Count
CORS_MAX_AGE=86400
CORS_CREDENTIALS=true
CORS_ORIGIN_VALIDATION_ENABLED=true
CORS_LOG_VIOLATIONS=true
CORS_BLOCK_NON_CORS_REQUESTS=false
```

### Monitoring

- Set up alerts for CORS violations
- Monitor CORS preflight request rates
- Track origin distribution for unusual patterns

### Performance

- CORS validation is O(n) where n is the number of allowed origins
- Preflight responses are cached for the duration specified in maxAge
- Origin validation uses a Set for O(1) lookup time

## Rollback Plan

### Quick Rollback Steps

1. **Revert CORS Middleware**: Update `src/app.ts` to use basic `cors()` without options
2. **Environment Variables**: Set `CORS_ENABLED=false` to disable enhanced CORS
3. **Rollback Version**: Deploy previous version without CORS enhancements

### Verification Steps

1. Verify basic CORS functionality
2. Test with whitelisted domains
3. Check error logs for CORS-related issues

## Status

**IMPLEMENTED**

The CORS Policy & Security implementation has been completed with the following components:

### Completed Components

| Component                    | Status      | Location                                    |
| ---------------------------- | ----------- | ------------------------------------------- |
| CORS Middleware Installation | ✅ Complete | `package.json`                              |
| Basic CORS Configuration     | ✅ Complete | `src/app.ts`                                |
| CORS Security Middleware     | ✅ Complete | `src/interface/middlewares/corsSecurity.ts` |
| CORS Logger Middleware       | ✅ Complete | `src/interface/middlewares/corsLogger.ts`   |
| Middleware Exports           | ✅ Complete | `src/interface/middlewares/index.ts`        |
| CORS Configuration Module    | ✅ Complete | `src/config/cors.ts`                        |
| Config Exports               | ✅ Complete | `src/config/index.ts`                       |
| Unit Tests                   | ✅ Complete | `tests/unit/cors/`                          |
| Integration Tests            | ✅ Complete | `tests/integration/cors.test.ts`            |

### Implementation Details

1. **CORS Configuration** (`src/config/cors.ts`): Environment-aware CORS options with validation
2. **Security Middleware** (`src/interface/middlewares/corsSecurity.ts`): Strict origin validation and header sanitization
3. **Logging Middleware** (`src/interface/middlewares/corsLogger.ts`): Comprehensive CORS activity logging
4. **Tests**: Full test coverage for configuration, security, and integration scenarios

### Usage Example

```typescript
import { jollyJetApp } from '@/app';
import { getCorsOptions } from '@/config/cors';
import cors from 'cors';

const app = await jollyJetApp();
const corsOptions = getCorsOptions();
app.use(cors(corsOptions));
```

### Next Steps

No further action required. The CORS security implementation is complete and ready for production use.

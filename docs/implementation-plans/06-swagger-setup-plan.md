# Implementation Plan #06 - Swagger Setup

**Plan:** 06-swagger-setup-plan  
**Branch:** `feature/jollyjet-06-swagger-setup`  
**Status:** ✅ Completed

---

## Overview

This phase implements Swagger/OpenAPI documentation for the JollyJet API, providing interactive API documentation accessible via browser.

---

## Folder Structure Changes

```
jollyJet/
├── src/
│   ├── app.ts                        # ✅ MODIFIED - Added Swagger middleware
│   ├── server.ts                     # Existing - Server entry point
│   │
│   ├── config/
│   │   ├── index.ts                  # Existing - Config exports
│   │   ├── env.validation.ts         # Existing - Zod validation
│   │   ├── swagger.ts                # ✅ NEW - Swagger configuration
│   │   └── di-container.ts           # Existing - DI container
│   │
│   ├── domain/
│   │   ├── entities/
│   │   ├── interfaces/
│   │   └── services/
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── mongodb.ts
│   │   ├── repositories/
│   │   └── external/
│   │
│   ├── interface/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── dtos/
│   │   └── middlewares/
│   │       ├── index.ts
│   │       ├── errorHandler.ts
│   │       └── requestLogger.ts
│   │
│   ├── usecases/
│   │   ├── product/
│   │   └── order/
│   │
│   ├── shared/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   │
│   └── types/
│       └── index.d.ts
│
├── node_modules/
├── dist/
│
├── .env                              # Environment variables
├── .gitignore
├── package.json                      # ✅ MODIFIED - Added Swagger dependencies
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
└── README.md
```

---

## Proposed Changes

### ✅ NEW: `src/config/swagger.ts`

**Purpose**: Swagger/OpenAPI configuration and specification

```typescript
import { SwaggerOptions } from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JollyJet API',
      version: '1.0.0',
      description: 'E-commerce API - When Speed and Happiness Matters :)',
      contact: {
        name: 'JollyJet Team',
        url: 'https://github.com/guru9/jollyJet',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {},
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
        NotFoundError: {
          description: 'Resource not found',
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/interface/routes/*.ts', './src/interface/dtos/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'JollyJet API Docs',
};
```

---

### ✅ MODIFIED: `src/app.ts`

**Changes**:

- Import `swagger-ui-express`
- Import `swaggerSpec` from config
- Add `/api-docs` route for Swagger UI
- Add `/api-docs.json` route for OpenAPI spec
- Add OpenAPI JSDoc comments to `/health` endpoint

```typescript
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { errorHandler, requestLogger } from './interface/middlewares';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check route
/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
```

---

### ✅ MODIFIED: `package.json`

**Added Dependencies**:

**Production**:

```json
{
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1"
}
```

**Development**:

```json
{
  "@types/swagger-jsdoc": "^6.0.4",
  "@types/swagger-ui-express": "^4.1.8"
}
```

---

## API Endpoints

### Documentation

- **`GET /api-docs/`** - Swagger UI interface (interactive documentation)
- **`GET /api-docs.json`** - OpenAPI JSON specification

### Application

- **`GET /health`** - Health check endpoint
  - Returns: `{ status: "ok", timestamp: ISO8601 }`

---

## Verification Plan

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Expected output:

```
🛫 jollyJet Server listening on port 3000.
```

### 3. Test Health Endpoint

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

### 4. Access Swagger UI

Open browser to: **`http://localhost:3000/api-docs/`**

You should see:

- ✅ JollyJet API title and description
- ✅ Health endpoint under "Health" tag
- ✅ Interactive "Try it out" button
- ✅ Request/response schemas

### 5. Test Interactive Documentation

1. Click on **GET /health** to expand
2. Click **"Try it out"**
3. Click **"Execute"**
4. Verify 200 response with correct JSON

### 6. Verify OpenAPI Spec

```bash
curl http://localhost:3000/api-docs.json
```

Should return valid OpenAPI 3.0 JSON specification.

---

## Troubleshooting

### Server Not Running

If you get "Cannot connect" errors:

```bash
npm run dev
```

### Port Already in Use

> [!IMPORTANT] > **Default Port**: 3000 (configured in `.env` file)
>
> **If port 3000 doesn't work**:
>
> 1. Open `src/config/index.ts`
> 2. Change `port: env.PORT` to `port: 3001`
> 3. Restart server: `npm run dev`
> 4. Access Swagger at: `http://localhost:3001/api-docs/`
>
> **Permanent change**: Update `PORT=3001` in your `.env` file

### Swagger UI Not Loading

1. Check terminal for errors
2. Verify import in `src/app.ts`:
   ```typescript
   import swaggerUi from 'swagger-ui-express';
   ```
3. Check route configuration:
   ```typescript
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   ```
4. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)

### MongoDB Connection Issues

If server fails to start:

- Check `MONGODB_URI` in `.env`
- Ensure MongoDB is running locally or connection string is correct

---

## How to Document New Endpoints

Add OpenAPI JSDoc comments above route handlers:

```typescript
/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 */
app.get('/api/products', (req, res) => {
  // handler code
});
```

The Swagger spec will automatically pick up these comments based on the `apis` configuration in `src/config/swagger.ts`.

---

## Next Steps

### API Documentation

- [ ] Document product routes with OpenAPI comments
- [ ] Document order routes with OpenAPI comments
- [ ] Add request/response schemas in `components.schemas`
- [ ] Document authentication requirements
- [ ] Add error response examples

### API Development

- [ ] Implement product routes
- [ ] Implement order routes
- [ ] Add authentication middleware
- [ ] Add validation middleware

---

## Current Status

✅ Swagger UI Express installed  
✅ Swagger configuration created (`src/config/swagger.ts`)  
✅ Swagger routes configured in `app.ts`  
✅ Health endpoint documented with OpenAPI comments  
✅ Interactive documentation accessible at `/api-docs/`  
✅ OpenAPI JSON spec available at `/api-docs.json`  
✅ Server running on port 3000

**Phase 06 Complete!** 🎉

---

## Quick Reference

### Access Swagger UI

```
http://localhost:3000/api-docs/
```

### Get OpenAPI Spec

```
http://localhost:3000/api-docs.json
```

### Test Health Endpoint

```bash
curl http://localhost:3000/health
```




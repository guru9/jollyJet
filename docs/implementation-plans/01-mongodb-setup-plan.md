# Implementation Plan #01 - MongoDB Setup

**Plan:** 01-mongodb-setup-plan  
**Branch:** `feature/jollyjet-01-mongodb-setup`  
**Status:** ✅ Completed

---

## Overview

This phase implements MongoDB database connection for the JollyJet application, including connection management, environment configuration, and graceful shutdown handling.

---

## Folder Structure Changes

```
jollyJet/
├── src/
│   ├── config/
│   │   └── index.ts                  # ✅ MODIFIED - Added Configuration management
│   │   └── env.validation.ts         # ✅ MODIFIED - Added Env variable validation
|   |
│   ├── infrastructure/
│   │   └── database/
│   │       └── mongodb.ts            # ✅ NEW - MongoDB connection
│   │
│   └── server.ts                     # ✅ MODIFIED - Added MongoDB connection
│
├── .env                              # ✅ MODIFIED - Added MONGODB_URI
└── package.json                      # ✅ MODIFIED - Added mongoose dependency
```

**Files Added**:

- `src/infrastructure/database/mongodb.ts` - MongoDB connection management
- `src/config/index.ts` - Configuration management for MongoDB and other settings
- `src/config/env.validation.ts` - Environment variable validation using Zod schema

**Files Modified**:

- `src/server.ts` - Import and initialize MongoDB connection
- `.env` - Add `MONGO_URI` variable
- `package.json` - Add `mongoose` dependency

**Files Added**:

- `src/infrastructure/database/mongodb.ts` - MongoDB connection management

**Files Modified**:

- `src/server.ts` - Import and initialize MongoDB connection
- `.env` - Add `MONGODB_URI` variable
- `package.json` - Add `mongoose` dependency

---

## Proposed Changes

### ✅ NEW: `src/infrastructure/database/mongodb.ts`

```typescript
import mongoose from 'mongoose';
import config from '../../config';
import logger from '../../shared/logger';

class MongoDBConnection {
  async connect(): Promise<void> {
    try {
      await mongoose.connect(config.mongoUri);
      logger.info('MongoDB connected successfully');
    } catch (error) {
      logger.error({ err: error }, 'MongoDB connection failed');
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error({ err: error }, 'MongoDB disconnection failed');
      throw error;
    }
  }

  getConnection() {
    return mongoose.connection;
  }
}

export default new MongoDBConnection();
```

---

### ✅ MODIFIED: `src/server.ts`

**Changes**: Import and initialize MongoDB connection

```typescript
import 'reflect-metadata';
import app from './app';
import config from './config';
import { initializeDIContainer } from './config/di-container';
import mongoDBConnection from './infrastructure/database/mongodb';
import logger from './shared/logger';

// Initialize DI container
initializeDIContainer();

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, 'Received signal. Closing gracefully...');
  try {
    await mongoDBConnection.disconnect();
    logger.info('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle SIGHUP for configuration reload (optional)
process.on('SIGHUP', () => {
  logger.info('Received SIGHUP signal. Reloading configuration...');
  // Add logic to reload configuration if needed
});

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  logger.error({ err: error }, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled Rejection');
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await mongoDBConnection.connect();
    logger.info('MongoDB connected successfully');

    app.listen(config.port, () => {
      logger.info(`🛫 jollyJet Server listening on port ${config.port}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
```

### ✅ NEW: `src/config/index.ts`

**Purpose**: Centralized configuration management for the application.

```typescript
import dotenv from 'dotenv';
import { validateEnv } from './env.validation';

// Load environment variables
dotenv.config({ path: '.env' });

// Define config
const env = validateEnv();

const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  logLevel: env.LOG_LEVEL,
};

export default config;
```

**Key Features**:

- Loads environment variables from `.env` file.
- Validates environment variables using Zod schema.
- Exports a centralized configuration object for use throughout the application.
- Includes MongoDB connection URI, server port, environment, and log level.

---

### ✅ NEW: `src/config/env.validation.ts`

**Purpose**: Environment variable validation using Zod schema.

```typescript
import z from 'zod';
import logger from '../shared/logger';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  MONGO_URI: z.preprocess(
    (val) => {
      // prefer MONGO_URI, fall back to MONGODB_URI from .env
      if (typeof val === 'string' && val.length) return val;
      if (typeof process.env.MONGODB_URI === 'string' && process.env.MONGODB_URI.length)
        return process.env.MONGODB_URI;
      return val;
    },
    z
      .string()
      .min(1, 'MongoDB URI is required')
      .refine((uri) => /^mongodb(\+srv)?:\/\/.+/.test(uri), {
        message:
          'MONGO_URI must be a valid MongoDB connection string (mongodb:// or mongodb+srv://)',
      })
  ),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export const validateEnv = (): EnvConfig => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    logger.error({ error: result }, 'Invalid environment variables.');
    throw new Error(
      `Invalid environment configuration: ${result.error?.issues.map((i) => `${i.path.join('.')} - ${i.message}`).join(', ')}`
    );
  }
  return result.data;
};
```

**Key Features**:

- Validates environment variables using Zod schema.
- Provides detailed error messages for invalid configurations.
- Supports fallback to `MONGODB_URI` if `MONGO_URI` is not provided.
- Ensures MongoDB connection string is valid and properly formatted.

---

### Signal Handling

The server includes comprehensive signal handling to ensure graceful shutdown and optional configuration reload:

- **SIGTERM**: Sent by the system or process manager (e.g., Docker, Kubernetes) to request termination. The server responds by disconnecting from MongoDB and exiting gracefully.
- **SIGINT**: Sent when the user presses `Ctrl+C` in the terminal. The server responds by disconnecting from MongoDB and exiting gracefully.
- **SIGHUP**: Sent when the terminal is closed or to request configuration reload. The server can be configured to reload settings without restarting.
- **SIGUSR1** and **SIGUSR2**: Custom signals that can be used for application-specific actions, such as toggling debug mode or triggering log rotation.

### Graceful Shutdown Process

When a termination signal (`SIGTERM` or `SIGINT`) is received:

1. The server logs the received signal.
2. The MongoDB connection is closed gracefully.
3. The server logs the successful disconnection.
4. The process exits with a status code of `0` (success).

If an error occurs during shutdown:

1. The error is logged.
2. The process exits with a status code of `1` (failure).

---

### ✅ MODIFIED: `.env`

**Added Variables**:

```env
# For local MongoDB connection
MONGO_URI_DEFAULT=mongodb://localhost:27017/jollyjet

# For MongoDB Atlas (SRV URI)
# MONGO_URI=Mongodb srv url with credentials

# PORT
PORT=3000

# Log Level
LOG_LEVEL=info
```

---

### ✅ MODIFIED: `package.json`

**Added Dependencies**:

```json
{
  "dependencies": {
    "mongoose": "^9.0.0"
  }
}
```

---

## Verification Plan

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB

Ensure MongoDB is running locally:

```bash
# If using MongoDB locally
mongod

# Or if using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Connecting to Local MongoDB in VS Code

1. Install the MongoDB extension for VS Code.
2. Open the MongoDB extension panel.
3. Click on "Add Connection" and enter the following details:
   - Connection String: `mongodb://localhost:27017/jollyjet`
   - Connection Name: `Local JollyJet DB`
4. Click "Connect" to establish the connection.

#### Connecting to MongoDB SRV in VS Code

1. Open the MongoDB extension panel.
2. Click on "Add Connection" and enter the following details:
   - Connection String: `mongodb+srv://...` Mongodb srv url with credentials.
   - Connection Name: `JollyJet Atlas DB`
3. Replace `<username>` and `<password>` with your MongoDB Atlas credentials.
4. Click "Connect" to establish the connection.

### 3. Configure Environment

Update `.env` with your MongoDB connection string:

```env
# For local MongoDB connection
MONGO_URI_DEFAULT=mongodb://localhost:27017/jollyjet

# For MongoDB Atlas (SRV URI)
# MONGO_URI=Mongodb srv url with credentials

# PORT
PORT=3000

# Log Level
LOG_LEVEL=info
```

### 4. Start Server

```bash
npm run dev
```

Expected output:

```
MongoDB connected successfully
🛫 jollyJet Server listening on port 3000
```

### 5. Verify Connection

Check MongoDB connection in logs. You should see:

- "MongoDB connected successfully" on startup
- No connection errors

### 6. Test Graceful Shutdown

Press `Ctrl+C` to stop the server.

Expected output:

```
Received signal SIGINT. Closing gracefully...
MongoDB disconnected
```

### 7. Test Signal Handling

You can test signal handling by sending signals to the running server process:

- **SIGTERM**: Send a termination signal to the server process.

  ```bash
  kill -TERM <PID>
  ```

- **SIGINT**: Send an interrupt signal to the server process (equivalent to pressing `Ctrl+C`).

  ```bash
  kill -INT <PID>
  ```

- **SIGHUP**: Send a hangup signal to the server process to test configuration reload.
  ```bash
  kill -HUP <PID>
  ```

Replace `<PID>` with the process ID of the running server. You can find the PID using:

```bash
ps aux | grep "node dist/src/server.js"
```

---

## Troubleshooting

### Connection Failed

If you see "MongoDB connection failed" or "MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017":

1. **Verify MongoDB is running**:
   - Open a terminal and run `mongosh` or `mongo`. If MongoDB is not running, you will see an error.
   - If MongoDB is not installed, download and install it from [MongoDB's official website](https://www.mongodb.com/try/download/community).

2. **Start MongoDB Service**:
   - On Windows, start the MongoDB service:
     ```bash
     net start MongoDB
     ```
   - On macOS/Linux, start MongoDB using:
     ```bash
     mongod
     ```

3. **Check `MONGO_URI` in `.env`**:
   - Ensure the URI is correct: `mongodb://localhost:27017/jollyjet`.

4. **Ensure port 27017 is not blocked**:
   - Check if another application is using port 27017.
   - Run `netstat -ano | findstr 27017` on Windows or `lsof -i :27017` on macOS/Linux to check for conflicts.

5. **Verify MongoDB Configuration**:
   - Ensure MongoDB is configured to listen on the correct IP address. Check the `mongod.conf` file for:
     ```yaml
     net:
       bindIp: 127.0.0.1
       port: 27017
     ```

6. **Restart MongoDB**:
   - After making changes, restart MongoDB:
     ```bash
     mongod --config /path/to/mongod.conf
     ```

### Authentication Error

If using authentication:

```env
MONGODB_URI=mongodb://username:password@localhost:27017/jollyjet
```

### Connection Timeout

Increase timeout in connection options if needed.

---

## Next Steps

- Create MongoDB models for entities
- Implement repository pattern
- Add database migrations
- Set up database seeding
- Configure connection pooling
- Add database health check endpoint

---

## Status

✅ MongoDB connection class created  
✅ Server integration completed  
✅ Graceful shutdown implemented  
✅ Environment configuration added  
✅ Error handling implemented

**Phase 01 Complete!** 🎉

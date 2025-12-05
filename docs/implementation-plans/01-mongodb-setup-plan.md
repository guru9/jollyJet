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

---

### ✅ MODIFIED: `.env`

**Added Variables**:

```env
MONGODB_URI=mongodb://localhost:27017/jollyjet
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

### 3. Configure Environment

Update `.env` with your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/jollyjet
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

---

## Troubleshooting

### Connection Failed

If you see "MongoDB connection failed":

1. Verify MongoDB is running: `mongosh` or `mongo`
2. Check `MONGODB_URI` in `.env`
3. Ensure port 27017 is not blocked

### Authentication Error

If using authentication:

```env
MONGODB_URI=mongodb://username:password@localhost:27017/jollyjet
```

### Connection Timeout

Increase timeout in connection options if needed.

---

## Next Steps

- [ ] Create MongoDB models for entities
- [ ] Implement repository pattern
- [ ] Add database migrations
- [ ] Set up database seeding
- [ ] Configure connection pooling
- [ ] Add database health check endpoint

---

## Status

✅ MongoDB connection class created  
✅ Server integration completed  
✅ Graceful shutdown implemented  
✅ Environment configuration added  
✅ Error handling implemented

**Phase 01 Complete!** 🎉

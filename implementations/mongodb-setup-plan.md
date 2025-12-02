# MongoDB Connection Setup - Step-by-Step Implementation Guide

## Overview
This guide will walk you through setting up MongoDB connection for the JollyJet e-commerce application with proper error handling, graceful shutdown, and environment configuration.

---

## Prerequisites

### Install MongoDB Community Server

1. **Download MongoDB:**
   - Visit: https://www.mongodb.com/try/download/community
   - Download MongoDB Community Server for Windows
   - Choose the latest stable version

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation:**
   ```bash
   mongod --version
   ```
   You should see the MongoDB version information.

4. **Check MongoDB Service:**
   - Open Windows Services (Win + R, type `services.msc`)
   - Look for "MongoDB Server" - it should be running
   - If not, right-click and select "Start"

---

## Step 1: Create Database Connection Module

**File:** `src/infrastructure/database/mongodb.ts`

Create this new file with the following content:

```typescript
// Import mongoose library for MongoDB operations
import mongoose from 'mongoose';
// Import configuration that contains MONGO_URI from .env file
import { config } from '../../config';

/**
 * MongoDBConnection Class
 * 
 * This class manages the MongoDB database connection for the entire application.
 * It uses the Singleton Pattern to ensure only ONE database connection exists
 * throughout the application lifecycle.
 * 
 * Why Singleton Pattern?
 * - Prevents multiple database connections (which wastes resources)
 * - Provides a single point of access to the database connection
 * - Ensures consistent connection state across the application
 */
class MongoDBConnection {
    // Static instance - holds the single instance of this class
    // 'static' means it belongs to the class itself, not to individual objects
    private static instance: MongoDBConnection;
    
    // Tracks whether we're currently connected to MongoDB
    // 'private' means only this class can access this variable
    private isConnected: boolean = false;

    /**
     * Private Constructor
     * 
     * Making the constructor private prevents code outside this class
     * from creating new instances using 'new MongoDBConnection()'.
     * This enforces the Singleton pattern - only getInstance() can create instances.
     */
    private constructor() {}

    /**
     * Get Instance Method (Singleton Pattern)
     * 
     * This is the ONLY way to get the MongoDBConnection object.
     * 
     * How it works:
     * 1. First call: Creates a new instance and stores it in 'instance'
     * 2. Subsequent calls: Returns the same instance created earlier
     * 
     * Example usage:
     *   const db1 = MongoDBConnection.getInstance();
     *   const db2 = MongoDBConnection.getInstance();
     *   // db1 and db2 are the SAME object!
     */
    public static getInstance(): MongoDBConnection {
        // Check if instance already exists
        if (!MongoDBConnection.instance) {
            // If not, create it (only happens once)
            MongoDBConnection.instance = new MongoDBConnection();
        }
        // Return the single instance
        return MongoDBConnection.instance;
    }

    /**
     * Connect to MongoDB
     * 
     * Establishes connection to MongoDB database and sets up event listeners
     * to monitor the connection health.
     * 
     * This is an async function because connecting to a database takes time.
     * We use 'await' to wait for the connection to complete.
     */
    public async connect(): Promise<void> {
        // Guard clause: If already connected, don't connect again
        if (this.isConnected) {
            console.log('📦 MongoDB already connected');
            return; // Exit early
        }

        try {
            /**
             * mongoose.connect() - Connects to MongoDB
             * 
             * Parameters:
             * - config.mongoUri: Connection string from .env (e.g., mongodb://localhost:27017/jollyjet)
             * - Options object:
             *   - serverSelectionTimeoutMS: 5000 (5 seconds)
             *     How long to wait when trying to find a MongoDB server
             *   - socketTimeoutMS: 45000 (45 seconds)
             *     How long to wait for a response from MongoDB
             */
            await mongoose.connect(config.mongoUri, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            // Connection successful! Update our status
            this.isConnected = true;
            console.log('✅ MongoDB connected successfully');

            /**
             * Event Listeners
             * 
             * These monitor the connection and react to different events.
             * Think of them as "watchers" that run code when something happens.
             */

            /**
             * 'error' event - Fires when there's a connection error
             * 
             * Example scenarios:
             * - Network issues
             * - MongoDB server crashes
             * - Authentication failures
             */
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
                this.isConnected = false; // Update status
            });

            /**
             * 'disconnected' event - Fires when connection is lost
             * 
             * Example scenarios:
             * - MongoDB server stops
             * - Network connection lost
             * - Manual disconnect
             */
            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️  MongoDB disconnected');
                this.isConnected = false; // Update status
            });

            /**
             * 'reconnected' event - Fires when connection is restored
             * 
             * Mongoose automatically tries to reconnect when connection is lost.
             * This event fires when reconnection succeeds.
             */
            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
                this.isConnected = true; // Update status
            });

        } catch (error) {
            /**
             * Catch Block - Handles connection failures
             * 
             * If mongoose.connect() fails, we:
             * 1. Log the error for debugging
             * 2. Throw the error so the calling code knows connection failed
             */
            console.error('❌ MongoDB connection error:', error);
            throw error; // Re-throw so server.ts can handle it
        }
    }

    /**
     * Disconnect from MongoDB
     * 
     * Gracefully closes the database connection.
     * Should be called when shutting down the application.
     * 
     * Why graceful shutdown matters:
     * - Ensures all pending database operations complete
     * - Prevents data corruption
     * - Releases system resources properly
     */
    public async disconnect(): Promise<void> {
        // Guard clause: If not connected, nothing to disconnect
        if (!this.isConnected) {
            return; // Exit early
        }

        try {
            // Close the mongoose connection
            await mongoose.connection.close();
            
            // Update our status
            this.isConnected = false;
            console.log('🔌 MongoDB connection closed');
        } catch (error) {
            // If closing fails, log and throw the error
            console.error('❌ Error closing MongoDB connection:', error);
            throw error;
        }
    }

    /**
     * Get Connection Status
     * 
     * Returns whether we're currently connected to MongoDB.
     * Useful for health checks or debugging.
     * 
     * @returns true if connected, false otherwise
     */
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

/**
 * Export the singleton instance
 * 
 * We immediately call getInstance() and export the result.
 * This means other files can import and use the connection like:
 * 
 *   import { mongoDBConnection } from './infrastructure/database/mongodb';
 *   await mongoDBConnection.connect();
 * 
 * They don't need to call getInstance() themselves - we do it here once.
 */
export const mongoDBConnection = MongoDBConnection.getInstance();
```

**What this does:**
- ✅ Singleton pattern ensures only one database connection
- ✅ Automatic reconnection handling
- ✅ Connection status monitoring
- ✅ Graceful shutdown support
- ✅ Detailed logging for debugging

---

## Step 2: Update Server Configuration

**File:** `src/server.ts`

Replace the entire content with:

```typescript
import app from "./app";
import { mongoDBConnection } from "./infrastructure/database/mongodb";

const PORT = process.env.PORT || 3000;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Closing gracefully...`);
    try {
        await mongoDBConnection.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
    try {
        // Connect to MongoDB first
        await mongoDBConnection.connect();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`🛫 jollyJet API ready at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
```

**What changed:**
- ✅ Import MongoDB connection module
- ✅ Connect to database before starting server
- ✅ Graceful shutdown on SIGTERM/SIGINT (Ctrl+C)
- ✅ Error handling for startup failures
- ✅ Async startup pattern

---

## Step 3: Configure Environment Variables

**File:** `.env`

Your `.env` file should already exist (it's in `.gitignore`). Update it to include:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/jollyjet
```

**For MongoDB Atlas (cloud alternative):**
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jollyjet?retryWrites=true&w=majority
```

> **Note:** The `.env` file is gitignored for security. Never commit credentials!

---

## Step 4: Verify Configuration Module

**File:** `src/config/index.ts`

Make sure your config file looks like this:

```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/jollyjet',
    env: process.env.NODE_ENV || 'development',
};

export default config;
```

**What this does:**
- ✅ Loads environment variables from `.env`
- ✅ Provides default values if env vars are missing
- ✅ Exports config for use throughout the app

---

## Step 5: Test the Connection

### Start the Development Server

```bash
npm run dev
```

### Expected Output

If everything is configured correctly, you should see:

```
✅ MongoDB connected successfully
🛫 jollyJet API ready at http://localhost:3000
```

### Troubleshooting

**Error: "MongooseServerSelectionError"**
- ❌ MongoDB service is not running
- ✅ Solution: Start MongoDB service in Windows Services

**Error: "Cannot find module"**
- ❌ Missing imports or file paths incorrect
- ✅ Solution: Check file paths match exactly

**Error: "MONGO_URI is undefined"**
- ❌ `.env` file not loaded or missing
- ✅ Solution: Verify `.env` file exists in project root

---

## Step 6: Test Graceful Shutdown

1. Start the server: `npm run dev`
2. Press `Ctrl+C` to stop
3. You should see:
   ```
   SIGINT received. Closing gracefully...
   🔌 MongoDB connection closed
   ```

This ensures database connections are properly closed when stopping the server.

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│           server.ts                     │
│  (Application Entry Point)              │
│                                         │
│  1. Load environment config             │
│  2. Connect to MongoDB                  │
│  3. Start Express server                │
│  4. Handle graceful shutdown            │
└─────────────────────────────────────────┘
                    │
                    ├──────────────────────────┐
                    │                          │
         ┌──────────▼──────────┐    ┌─────────▼────────┐
         │  config/index.ts    │    │  infrastructure/ │
         │                     │    │  database/       │
         │  - PORT             │    │  mongodb.ts      │
         │  - MONGO_URI        │    │                  │
         │  - NODE_ENV         │    │  - Singleton     │
         └─────────────────────┘    │  - Connect       │
                                    │  - Disconnect    │
                                    │  - Events        │
                                    └──────────────────┘
```

---

## Files Created/Modified Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/infrastructure/database/mongodb.ts` | **CREATE** | Database connection module |
| `src/server.ts` | **MODIFY** | Add MongoDB integration |
| `src/config/index.ts` | **VERIFY** | Ensure proper exports |
| `.env` | **UPDATE** | Add MongoDB connection string |

---

## Next Steps

After completing this setup, you're ready to:

1. ✅ Create Mongoose schemas/models
2. ✅ Build repositories for data access
3. ✅ Implement use cases with database operations
4. ✅ Create API endpoints that interact with MongoDB

---

## Common MongoDB Operations Reference

### Create a Model (Example)

```typescript
// src/domain/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    createdAt: Date;
}

const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
```

### Create a Repository (Example)

```typescript
// src/infrastructure/repositories/UserRepository.ts
import { User, IUser } from '../../domain/models/User';

export class UserRepository {
    async create(userData: Partial<IUser>): Promise<IUser> {
        const user = new User(userData);
        return await user.save();
    }

    async findByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email });
    }

    async findAll(): Promise<IUser[]> {
        return await User.find();
    }
}
```

---

## Additional Resources

- **MongoDB Documentation:** https://docs.mongodb.com/
- **Mongoose Documentation:** https://mongoosejs.com/docs/
- **MongoDB Compass:** GUI tool for viewing/managing data
- **MongoDB Atlas:** Free cloud database option

---

## Support

If you encounter issues:

1. Check MongoDB service is running
2. Verify `.env` file has correct `MONGO_URI`
3. Ensure all files are in correct locations
4. Check console for detailed error messages

Happy coding! 🚀

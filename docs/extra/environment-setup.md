# Environment Setup Guide (Cloud First)

## Overview

JollyJet follows a **Cloud First Architecture**. This means we use persistent cloud services (MongoDB Atlas, Upstash/Redis Cloud) even for local development. This ensures consistency between dev, test, and production environments and simplifies local setup.

## Environment Files Structure

```
.env                    # Base configuration (Primary for local dev)
.env.development        # Development environment template
.env.production         # Production environment template
```

## Quick Setup

### For Local Development

1. **Check your `.env` file**: It is already pre-configured to use the development cloud instances for MongoDB and Redis.
2. **Start development**:
   ```bash
   npm run dev
   ```

### For Production Environment

1. **Use `.env.production` as a template**.
2. **Configure secrets**: In production, secrets should ideally be injected via environment variables in your deployment platform (e.g., AWS, Azure, Railway, etc.).

## Environment Configuration

### MongoDB (Atlas)

We use Atlas SRV connection strings.

- **MONGODB_SRV**: `true`
- **MONGODB_HOST**: Your Atlas cluster host.
- **MONGODB_DB_NAME**: Database name (e.g., `jollyjet`).

### Redis (Upstash / Cloud)

We use SSL-enabled Redis connections.

- **REDIS_HOST**: Your Redis host (e.g., `xxx.upstash.io`).
- **REDIS_PASSWORD**: Your Redis password.
- **REDIS_TLS**: `true` (use `rediss` protocol).
- **REDIS_DISABLED**: `false`

## Using Docker

If you prefer running the application in a container:

1. **Start the app**: `npm run docker:up`
2. **Logs**: `npm run docker:logs`

The container will connect to the cloud databases specified in your `.env` file.

## Troubleshooting

- **Whitelist IP**: Ensure your local IP is whitelisted in MongoDB Atlas and Upstash.
- **SRV Issues**: Some networks block DNS for SRV records. If you have issues, use the standard connection string format.
- **SSL**: Always use `rediss://` for cloud Redis connections.

---

**Last Updated:** 2026-01-31  
**Architecture:** Cloud First  
**Maintainer:** Gururaj Moger

# Environment Setup Guide

## Overview

JollyJet uses environment-specific configuration files to manage different deployment environments. This guide explains how to set up and use environment files for local development, development, and production environments.

## Environment Files Structure

```
.env          # Template file (committed to git)
.env.local            # Local development (not committed)
.env.development      # Development environment (not committed)
.env.production       # Production environment (not committed)
```

**Current Status:** ✅ All environment files created and configured

## Quick Setup

### For Local Development

1. **Copy the example file:**

   ```bash
   cp .env .env.local
   ```

2. **Update the local configuration:**
   - Set `MONGODB_DISABLED=false` to enable MongoDB
   - Set `REDIS_DISABLED=false` to enable Redis
   - Adjust database URLs and ports as needed

3. **Start development:**
   ```bash
   npm run dev
   ```

### For Development Environment

1. **Copy and configure:**

   ```bash
   cp .env .env.development
   # Edit .env.development with development-specific values
   ```

2. **Key development settings:**
   - Use development database URLs
   - Enable debugging features
   - Set appropriate log levels

### For Production Environment

1. **Copy and configure:**

   ```bash
   cp .env .env.production
   # Edit .env.production with production-specific values
   ```

2. **Key production settings:**
   - Use production database URLs
   - Enable security features (GEO_BLOCKING_ENABLED=true)
   - Set restrictive rate limits
   - Use production log levels (warn/error)

## Environment Configurations Overview

### Local Development (.env.local)

**Purpose:** Full-featured development with all services enabled

```env
# Database & Cache: Enabled for full functionality
MONGODB_DISABLED=false
REDIS_DISABLED=false

# Security: Relaxed for development
GEO_BLOCKING_ENABLED=false
SECURITY_HEADERS_ENABLED=false

# Rate Limiting: Higher limits for development
REDIS_RATE_LIMIT_LIMIT=1000

# Logging: Detailed for debugging
LOG_LEVEL=debug
```

### Development Environment (.env.development)

**Purpose:** Staging environment with moderate security

```env
# Database: Separate dev instances
MONGO_URI=mongodb://dev-db:27017/jollyjet
REDIS_HOST=dev-redis

# Security: Basic geographic filtering
GEO_BLOCKING_ENABLED=false
GEO_ALLOWED_COUNTRIES=US,CA,GB,DE,FR

# Rate Limiting: Moderate limits
REDIS_RATE_LIMIT_LIMIT=500

# Logging: Info level
LOG_LEVEL=info
```

### Production Environment (.env.production)

**Purpose:** High-security production deployment

```env
# Database: Production clusters with replica sets
MONGO_URI=mongodb://prod-db-cluster:27017,prod-db-cluster:27018,prod-db-cluster:27019/jollyjet?replicaSet=rs0
REDIS_HOST=prod-redis-cluster

# Security: Maximum security enabled
GEO_BLOCKING_ENABLED=true
GEO_ALLOWED_COUNTRIES=US,CA,GB,DE,FR,AU,NZ,JP,SG,HK,TW,KR,IN
GEO_BLOCKED_COUNTRIES=CN,RU,KP,IR,SY,VE,CU

# Rate Limiting: Strict production limits
REDIS_RATE_LIMIT_WINDOW=900
REDIS_RATE_LIMIT_LIMIT=100

# Logging: Production level
LOG_LEVEL=warn
```

## Environment Variables Reference

### Database Configuration

```env
MONGO_URI=mongodb://localhost:27017/jollyjet
MONGODB_DISABLED=false  # Set to true to disable MongoDB
```

### Redis Configuration

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_DISABLED=false
REDIS_TTL_DEFAULT=86400  # 24 hours
REDIS_TTL_SHORT=3600     # 1 hour
REDIS_TTL_LONG=604800    # 7 days
```

### Security Configuration

```env
# Security Headers (legacy - now handled by Helmet)
SECURITY_HEADERS_ENABLED=false

# Geographic Blocking
GEO_BLOCKING_ENABLED=false
GEO_ALLOWED_COUNTRIES=US,CA,GB
GEO_BLOCKED_COUNTRIES=CN,RU,KP,IR

# IP Filtering
IP_WHITELIST=192.168.1.0/24,10.0.0.0/8
IP_BLACKLIST=
```

### Rate Limiting

```env
REDIS_RATE_LIMIT_WINDOW=3600  # 1 hour window
REDIS_RATE_LIMIT_LIMIT=100    # Max requests per window
```

## Environment Comparison Table

| Feature                 | Local                                | Development                       | Production           |
| ----------------------- | ------------------------------------ | --------------------------------- | -------------------- |
| **MongoDB**             | `mongodb://localhost:27017/jollyjet` | `mongodb://dev-db:27017/jollyjet` | Replica set cluster  |
| **Redis**               | `localhost:6379`                     | `dev-redis`                       | `prod-redis-cluster` |
| **Geographic Blocking** | ❌ Disabled                          | ❌ Disabled                       | ✅ Enabled           |
| **Rate Limit**          | 1000/hr                              | 500/hr                            | 100/15min            |
| **Log Level**           | `debug`                              | `info`                            | `warn`               |
| **Security Headers**    | Legacy disabled                      | Legacy disabled                   | Legacy disabled      |
| **IP Filtering**        | Basic whitelist                      | CIDR ranges                       | Strict filtering     |

## Environment Loading Priority

The application loads environment files in this order (later files override earlier ones):

1. `.env` (base configuration)
2. `.env.local` (local overrides)
3. `.env.{NODE_ENV}` (environment-specific)
4. `.env.{NODE_ENV}.local` (environment-specific local overrides)

## Security Best Practices

### Local Development (.env.local)

- ✅ **Services Enabled:** Full MongoDB and Redis for complete functionality
- ✅ **Security Relaxed:** Geographic blocking disabled for easier testing
- ✅ **High Rate Limits:** 1000 requests/hour for development convenience
- ✅ **Detailed Logging:** Debug level for troubleshooting

### Development Environment (.env.development)

- ✅ **Separate Infrastructure:** Dedicated dev databases and Redis instances
- ✅ **Moderate Security:** Geographic filtering enabled but permissive
- ✅ **Balanced Rate Limits:** 500 requests/hour for realistic testing
- ✅ **Info Logging:** Appropriate level for development monitoring

### Production Environment (.env.production)

- ✅ **High Availability:** MongoDB replica sets and Redis clusters
- ✅ **Maximum Security:** Geographic blocking with strict country lists
- ✅ **Strict Rate Limits:** 100 requests/15min to prevent abuse
- ✅ **Production Logging:** Warn level for security and performance monitoring
- ✅ **Never Commit:** Environment files are gitignored for security

## Troubleshooting

### Environment Variables Not Loading

- Check that the file exists and has correct syntax
- Ensure NODE_ENV is set correctly
- Restart the application after changing environment files

### Database Connection Issues

- Verify MONGO_URI format
- Check network connectivity
- Ensure MongoDB is running

### Redis Connection Issues

- Verify REDIS_HOST and REDIS_PORT
- Check Redis authentication if enabled
- Ensure Redis service is running

## Migration from Single .env File

**✅ COMPLETED:** Migration to environment-specific files has been completed.

**What was done:**

1. ✅ **Created environment-specific files:**
   - `.env.local` - Local development configuration
   - `.env.development` - Development environment configuration
   - `.env.production` - Production environment configuration

2. ✅ **Updated .gitignore:**
   - Added comprehensive patterns for all environment variations
   - Ensured sensitive files are never committed

3. ✅ **Configured security levels:**
   - Local: Relaxed security for development
   - Development: Moderate security for staging
   - Production: Maximum security for live environment

4. ✅ **Updated documentation:**
   - Complete environment setup guide
   - Security best practices for each environment
   - Troubleshooting and migration guides

**Current Status:** All environment files are properly configured and documented.

## Validation

The application validates environment variables on startup. If required variables are missing or invalid, the application will fail to start with clear error messages indicating what needs to be configured.

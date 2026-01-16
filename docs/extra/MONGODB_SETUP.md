# MongoDB Setup Guide

## Option 1: Start MongoDB with Docker (Recommended)

```bash
# Start MongoDB service only
docker-compose up -d mongodb

# Enable MongoDB in .env
# Change: MONGODB_DISABLED=true → MONGODB_DISABLED=false

# Start development server
npm run dev
```

## Option 2: Start Both Redis and MongoDB with Docker

```bash
# Start both services
docker-compose up -d redis mongodb

# Enable both in .env
# REDIS_DISABLED=false
# MONGODB_DISABLED=false

# Start development server
npm run dev
```

## Option 3: Full Stack with GUIs

```bash
# Start all services including GUI tools
docker-compose up -d

# Access GUIs:
# Redis Commander: http://localhost:8081 (Redis GUI)
# Mongo Express:   http://localhost:8082 (MongoDB GUI)

# Enable databases in .env
# REDIS_DISABLED=false
# MONGODB_DISABLED=false

# Start development server
npm run dev
```

## Option 4: Disable Both Databases (Current Setup)

Current .env configuration:

```env
REDIS_DISABLED=true
MONGODB_DISABLED=true
```

This allows development without database connections.

## MongoDB Connection Details

When enabled via Docker:

- **Host**: localhost
- **Port**: 27017
- **Database**: jollyjet
- **Admin User**: admin / admin123
- **App User**: jollyjet_user / jollyjet_password
- **Auth Source**: jollyjet (for app user), admin (for admin)

## Environment Variables

```env
# MongoDB Configuration
MONGO_URI=mongodb://jollyjet_user:jollyjet_password@localhost:27017/jollyjet?authSource=jollyjet
MONGODB_DISABLED=true  # Set to false to enable

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_DISABLED=true  # Set to false to enable
```

## Health Check Statuses

- **connected**: Database is healthy and reachable
- **disconnected**: Database exists but not connected
- **error**: Connection failed
- **disabled**: Database is intentionally disabled in config

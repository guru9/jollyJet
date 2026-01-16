# JollyJet Development Setup

## Quick Start with Redis & MongoDB

### Option 1: Start with Docker (Recommended)

```bash
# Start Redis and MongoDB services
docker-compose up -d redis mongodb

# Start the development server
npm run dev
```

### Option 2: Disable Redis for Development

Redis is already disabled in `.env` file:

```env
REDIS_DISABLED=true
```

### Option 3: Enable Redis with Docker GUIs

```bash
# Start all services including GUI tools
docker-compose up -d

# Access GUIs:
# Redis Commander: http://localhost:8081
# Mongo Express:   http://localhost:8082

# Start the development server
npm run dev
```

## Environment Variables

The following environment variables are available in `.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_DB=0
REDIS_DISABLED=true  # Set to false to enable Redis
```

## Docker Services

- **Redis**: `localhost:6379` with password `redis123`
- **MongoDB**: `localhost:27017`
- **Redis Commander**: GUI for Redis at `http://localhost:8081`
- **Mongo Express**: GUI for MongoDB at `http://localhost:8082`

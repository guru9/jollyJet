# JollyJet Development Setup Guide

This comprehensive guide covers setting up MongoDB and Redis for local development with best practices, VS Code integration, and complete development workflow.

## 🚀 Quick Start

```bash
# Clone and setup the project
git clone <your-repo-url>
cd jollyJet

# Setup and start databases
npm run setup:dev

# Start the development server
npm run dev
```

## 📋 Prerequisites

### Required Software

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **VS Code** (recommended IDE)
- **Git** for version control

### VS Code Extensions (Recommended)

See [VS Code Extensions Guide](./docs/vs-code-extensions.md) for the complete list of recommended extensions.

## 🏗️ Project Structure

```
jollyJet/
├── docker-compose.yml          # Docker services configuration
├── scripts/
│   ├── db.sh                  # Linux/macOS database management script
│   ├── db.bat                 # Windows database management script
│   └── mongo-init.js          # MongoDB initialization script
├── src/
│   ├── config/
│   ├── domain/
│   ├── infrastructure/
│   │   └── database/
│   │       ├── mongodb.ts     # MongoDB connection
│   │       └── redis.ts       # Redis connection
│   └── interface/
├── docs/
│   └── vs-code-extensions.md  # VS Code setup guide
└── .env                       # Environment variables
```

## 🐳 Docker Services

### Services Included

- **MongoDB 7.0** - Primary database
- **Redis 7.2** - Caching and session storage
- **MongoDB Express** - MongoDB GUI (Port 8082)
- **Redis Commander** - Redis GUI (Port 8081)

### Default Configuration

- **MongoDB**: `mongodb://jollyjet_user:jollyjet_password@localhost:27017/jollyjet`
- **Redis**: `redis://:redis123@localhost:6379/0`

## 🔧 Setup Steps

### 1. Environment Configuration

The `.env` file is pre-configured for local development:

```env
# MongoDB Configuration
MONGO_URI=mongodb://jollyjet_user:jollyjet_password@localhost:27017/jollyjet?authSource=jollyjet

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_DB=0
REDIS_DISABLED=false
```

### 2. Start Databases

```bash
# Start MongoDB and Redis only
npm run db:start

# Start all services including GUI tools
npm run db:start-all

# Alternative: Use docker-compose directly
docker-compose up -d
```

### 3. Verify Installation

```bash
# Check database status
npm run db:status

# Check health endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/live
curl http://localhost:3000/api/health/ready
```

## 🎯 Development Workflow

### Daily Development Commands

```bash
# Start databases (if not already running)
npm run db:start

# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run format

# Build for production
npm run build
```

### Database Management

```bash
# View database logs
npm run db:logs

# Access database shells
npm run db:shell:mongo    # MongoDB shell
npm run db:shell:redis    # Redis CLI

# Open GUI tools
npm run db:gui:mongo      # MongoDB Express: http://localhost:8082
npm run db:gui:redis      # Redis Commander: http://localhost:8081

# Database backup
npm run db:backup

# Database restore
npm run db:restore <backup-directory>

# Reset databases (delete all data)
npm run db:reset
```

## 🔍 Database Setup Details

### MongoDB Setup

**Features:**

- Authentication enabled with dedicated user
- Automatic database and collection creation
- Pre-configured indexes for performance
- Sample data for development
- Validation schemas for data integrity

**Collections:**

- `products` - Product catalog with full-text search
- `sessions` - User session data

**Indexes:**

- Text search on product names and descriptions
- Category, price, and stock indexes
- Compound indexes for common queries

### Redis Setup

**Features:**

- Password authentication
- Persistent storage (AOF enabled)
- Health checks and auto-restart
- Connection pooling and retry logic

**Key Patterns:**

- `product:{id}` - Individual product cache
- `product:list:{filter}` - Product list cache
- `session:{id}` - User sessions
- `rate_limit:{client}` - Rate limiting

## 🔌 VS Code Integration

### Database Extensions Setup

1. **Install Extensions:**

   ```
   MongoDB for VS Code (Microsoft)
   Redis for VS Code (Microsoft)
   Docker (Microsoft)
   ```

2. **Configure Connections:**

   ```json
   {
     "mongodb.connections": [
       {
         "name": "JollyJet Local",
         "connectionString": "mongodb://jollyjet_user:jollyjet_password@localhost:27017/jollyjet?authSource=jollyjet"
       }
     ],
     "redis.connections": [
       {
         "name": "JollyJet Redis",
         "host": "localhost",
         "port": 6379,
         "password": "redis123"
       }
     ]
   }
   ```

3. **Access Tools:**
   - Press `Ctrl+Shift+P` → "MongoDB: Connect"
   - Press `Ctrl+Shift+P` → "Redis: Connect"

### Debugging Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug JollyJet",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ProductController.test.ts
```

### Test Database Setup

Tests use `mongodb-memory-server` for isolated testing:

```typescript
// Tests automatically create in-memory MongoDB instance
// No external setup required for testing
```

## 📊 Monitoring and Health Checks

### Health Endpoints

- **Complete Health**: `GET /api/health`
  - Checks MongoDB and Redis connections
  - Returns response times and status
  - Includes application metrics

- **Liveness**: `GET /api/health/live`
  - Simple check if process is running
  - Used by Kubernetes/container orchestrators

- **Readiness**: `GET /api/health/ready`
  - Checks if application is ready to serve requests
  - Used by load balancers and service discovery

### Cache Management

- **Cache Stats**: `GET /api/cache/stats`
- **Check Key**: `GET /api/cache/check?key={key}`
- **Invalidate**: `DELETE /api/cache/invalidate?pattern={pattern}`
- **Cache Status**: `GET /api/cache/status`

## 🔄 Database Operations

### MongoDB Operations

**Sample Queries:**

```javascript
// Find products by category
db.products.find({ category: 'electronics' });

// Text search
db.products.find({ $text: { $search: 'wireless' } });

// Aggregation pipeline
db.products.aggregate([
  { $match: { price: { $gte: 50 } } },
  { $group: { _id: '$category', avgPrice: { $avg: '$price' } } },
]);
```

### Redis Operations

**Sample Commands:**

```bash
# Set cache
SET product:123 '{"name":"Laptop","price":999}'

# Get cache
GET product:123

# Set with TTL
SETEX product:123 3600 '{"name":"Laptop","price":999}'

# Pattern matching
KEYS product:*

# Monitor operations
MONITOR
```

## 🚨 Troubleshooting

### Common Issues

1. **Docker Containers Not Starting**

   ```bash
   # Check Docker is running
   docker info

   # Check for port conflicts
   netstat -an | grep 27017
   netstat -an | grep 6379

   # Reset Docker
   docker system prune -f
   ```

2. **Database Connection Errors**

   ```bash
   # Check container status
   docker-compose ps

   # View logs
   docker-compose logs mongodb
   docker-compose logs redis

   # Restart services
   docker-compose restart
   ```

3. **Permission Issues**

   ```bash
   # On Linux/macOS, fix permissions
   sudo chown -R $USER:$USER ./data
   ```

4. **Memory Issues**
   ```bash
   # Increase Docker memory allocation
   # Docker Desktop → Settings → Resources → Memory
   ```

### Health Check Failures

```bash
# Check individual services
curl http://localhost:27017  # MongoDB
curl http://localhost:6379    # Redis

# Check application health
curl http://localhost:3000/api/health
```

## 📁 Backup and Recovery

### Automatic Backups

```bash
# Create backup
npm run db:backup

# Results stored in ./backups/YYYYMMDD_HHMMSS/
# - mongodb/ (MongoDB dump)
# - redis.rdb (Redis snapshot)
```

### Manual Backups

```bash
# MongoDB backup
docker exec jollyjet-mongodb mongodump --db jollyjet --out /tmp/backup
docker cp jollyjet-mongodb:/tmp/backup ./backup/

# Redis backup
docker exec jollyjet-redis redis-cli BGSAVE
docker cp jollyjet-redis:/data/dump.rdb ./redis-backup.rdb
```

### Restore from Backup

```bash
# Restore using npm script
npm run db:restore ./backups/20231215_143000

# Manual restore
docker cp ./backup/mongodb jollyjet-mongodb:/tmp/restore
docker exec jollyjet-mongodb mongorestore --db jollyjet --drop /tmp/restore/jollyjet
```

## 🏭 Production Considerations

### Environment Variables

```env
# Production MongoDB (use Atlas or managed service)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jollyjet

# Production Redis (use managed service)
REDIS_HOST=your-redis-cluster.redis.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
```

### Security Checklist

- [ ] Use strong passwords for databases
- [ ] Enable SSL/TLS connections
- [ ] Use environment-specific configurations
- [ ] Implement proper backup strategies
- [ ] Monitor connection health and performance
- [ ] Use connection pooling in production

### Performance Optimization

- [ ] Configure appropriate cache TTLs
- [ ] Use database indexes effectively
- [ ] Monitor memory usage
- [ ] Implement connection pooling
- [ ] Use read replicas for scaling

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [VS Code Extensions Guide](./docs/vs-code-extensions.md)

## 🤝 Contributing

When contributing to the project:

1. Ensure all tests pass
2. Follow the existing code style
3. Update documentation as needed
4. Test database operations work correctly
5. Verify VS Code extensions work properly

---

**Happy coding with JollyJet! 🚀**

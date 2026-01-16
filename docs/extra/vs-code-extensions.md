# VS Code Extensions Guide for JollyJet Database Development

This guide covers the best VS Code extensions for MongoDB and Redis development with the JollyJet project.

## 🚀 Essential Extensions

### 1. MongoDB Extension (Microsoft)

**Extension ID**: `ms-vscode.vscode-mongodb`

**Features**:

- Connect to MongoDB databases
- Browse collections and documents
- Execute queries using MongoDB Shell syntax
- Visualize data in JSON format
- Create, edit, and delete documents
- Import/export data

**Setup for JollyJet**:

```json
{
  "mongodb.connections": [
    {
      "name": "JollyJet Local",
      "connectionString": "mongodb://jollyjet_user:jollyjet_password@localhost:27017/jollyjet?authSource=jollyjet",
      "defaultDatabase": "jollyjet"
    },
    {
      "name": "JollyJet Admin",
      "connectionString": "mongodb://admin:admin123@localhost:27017/jollyjet?authSource=admin",
      "defaultDatabase": "jollyjet"
    }
  ]
}
```

**Usage**:

1. Install the extension from VS Code marketplace
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "MongoDB: Connect" and select your connection
4. Browse the `jollyjet` database and its collections

**Common Commands**:

- `MongoDB: Connect` - Connect to a MongoDB instance
- `MongoDB: Disconnect` - Disconnect from current connection
- `MongoDB: Create Database` - Create a new database
- `MongoDB: Drop Database` - Drop a database
- `MongoDB: Create Collection` - Create a new collection
- `MongoDB: Drop Collection` - Drop a collection
- `MongoDB: Insert Document` - Insert a new document
- `MongoDB: Execute Query` - Run MongoDB queries

### 2. Redis Extension (Microsoft)

**Extension ID**: `ms-vscode.vscode-redis`

**Features**:

- Connect to Redis servers
- Browse keys and values
- Execute Redis commands
- View data in different formats (string, hash, list, set, zset)
- Set TTL on keys
- Mass delete operations

**Setup for JollyJet**:

```json
{
  "redis.connections": [
    {
      "name": "JollyJet Redis",
      "host": "localhost",
      "port": 6379,
      "password": "redis123",
      "database": 0
    }
  ]
}
```

**Usage**:

1. Install the extension from VS Code marketplace
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "Redis: Connect" and select your connection
4. Browse Redis keys and execute commands

**Common Commands**:

- `Redis: Connect` - Connect to a Redis instance
- `Redis: Disconnect` - Disconnect from current connection
- `Redis: Execute Command` - Run Redis commands
- `Redis: Add Key` - Add a new key-value pair
- `Redis: Delete Key` - Delete a key
- `Redis: Set TTL` - Set time-to-live on a key

## 🛠️ Additional Useful Extensions

### 3. MongoDB Playground

**Extension ID**: `ms-vscode.vscode-mongodb-playground`

**Features**:

- Write and execute MongoDB queries in JavaScript-like syntax
- IntelliSense for MongoDB commands
- Run multiple queries at once
- Export query results

**Example Query**:

```javascript
// MongoDB Playground for JollyJet

// Find all active products
db.products.find({ isActive: true });

// Find products by category
db.products.find({ category: 'electronics' });

// Count products by category
db.products.aggregate([
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]);

// Find products in price range
db.products.find({
  price: { $gte: 50, $lte: 200 },
});

// Text search
db.products.find({
  $text: { $search: 'wireless headphones' },
});
```

### 4. Docker Extension

**Extension ID**: `ms-azuretools.vscode-docker`

**Features**:

- Manage Docker containers and images
- View container logs
- Start/stop/restart containers
- Access container shells

**Usage for JollyJet**:

1. Install the Docker extension
2. Open the Docker explorer sidebar
3. Find the `jollyjet-mongodb` and `jollyjet-redis` containers
4. Right-click to access logs, shell, or restart services

### 5. Thunder Client (API Testing)

**Extension ID**: `rangav.vscode-thunder-client`

**Features**:

- Test API endpoints
- Save and organize requests
- View response headers and body
- Environment variables

**Testing JollyJet API**:

```http
### Health Check
GET http://localhost:3000/api/health

### Get All Products
GET http://localhost:3000/api/products

### Create Product
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "Test Product",
  "description": "A test product for development",
  "price": 29.99,
  "category": "electronics",
  "stock": 10
}

### Get Cache Stats
GET http://localhost:3000/api/cache/stats
```

## ⚙️ VS Code Configuration

Create `.vscode/settings.json` for optimal development:

```json
{
  // MongoDB Settings
  "mongodb.connections": [
    {
      "name": "JollyJet Local",
      "connectionString": "mongodb://jollyjet_user:jollyjet_password@localhost:27017/jollyjet?authSource=jollyjet",
      "defaultDatabase": "jollyjet"
    }
  ],

  // Redis Settings
  "redis.connections": [
    {
      "name": "JollyJet Redis",
      "host": "localhost",
      "port": 6379,
      "password": "redis123",
      "database": 0
    }
  ],

  // TypeScript Settings
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",

  // Editor Settings
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.rulers": [80, 120],

  // File Explorer Settings
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  },

  // Docker Integration
  "docker.images.defaultRegistry": "",
  "docker.compose.downDetached": false
}
```

## 🎯 Recommended VS Code Extensions List

### Database Extensions

- MongoDB for VS Code (`ms-vscode.vscode-mongodb`)
- Redis for VS Code (`ms-vscode.vscode-redis`)
- MongoDB Playground (`ms-vscode.vscode-mongodb-playground`)

### Development Tools

- Docker (`ms-azuretools.vscode-docker`)
- Thunder Client (`rangav.vscode-thunder-client`)
- REST Client (`humao.rest-client`)

### Code Quality

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Importer (`pmneo.ts-importer`)

### Productivity

- GitLens (`eamodio.gitlens`)
- Path Intellisense (`christian-kohler.path-intellisense`)
- Auto Rename Tag (`formulahendry.auto-rename-tag`)

## 🔧 Workflow Integration

### 1. Database Development Workflow

```bash
# Start databases
npm run db:start

# Connect with VS Code extensions
# 1. Open MongoDB extension, connect to JollyJet
# 2. Open Redis extension, connect to JollyJet
# 3. Start development server
npm run dev
```

### 2. Query Testing Workflow

```javascript
// Create .vscode/mongo-playground.js
db.products.find({ category: 'electronics' });
db.products.countDocuments({ isActive: true });
db.getCollectionNames();
```

### 3. Redis Debugging Workflow

```bash
# Monitor Redis operations
redis-cli -h localhost -p 6379 -a redis123 MONITOR

# Check specific keys
redis-cli -h localhost -p 6379 -a redis123 KEYS "product:*"
redis-cli -h localhost -p 6379 -a redis123 GET "product:list:all"
```

## 📊 Advanced Features

### MongoDB Extension Advanced Usage

**Aggregation Pipelines**:

```javascript
// Find top-rated products by wishlist count
db.products.aggregate([
  { $match: { isActive: true } },
  { $sort: { wishlistCount: -1 } },
  { $limit: 10 },
  { $project: { name: 1, price: 1, wishlistCount: 1 } },
]);
```

**Index Analysis**:

```javascript
// Show index usage
db.products.getIndexes();
db.products.explain('executionStats').find({ category: 'electronics' });
```

### Redis Extension Advanced Usage

**Pattern Matching**:

```bash
# Find all product-related keys
KEYS product:*

# Analyze memory usage
MEMORY USAGE product:12345
```

**Batch Operations**:

```bash
# Set multiple keys
MSET product:1:name "Laptop" product:1:price "999.99"

# Get multiple keys
MGET product:1:name product:1:price
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed**:
   - Ensure Docker containers are running
   - Check connection strings in VS Code settings
   - Verify firewall settings

2. **Extension Not Working**:
   - Restart VS Code
   - Clear extension cache
   - Update to latest version

3. **Performance Issues**:
   - Use appropriate indexes in MongoDB
   - Monitor Redis memory usage
   - Set appropriate TTL values

### Debug Commands

```bash
# Check container status
docker ps

# View logs
docker logs jollyjet-mongodb
docker logs jollyjet-redis

# Restart services
docker-compose restart mongodb redis
```

## 📚 Additional Resources

- [VS Code MongoDB Extension Documentation](https://code.visualstudio.com/docs/azure/mongodb)
- [VS Code Redis Extension Documentation](https://code.visualstudio.com/docs/azure/redis)
- [MongoDB Shell Commands](https://docs.mongodb.com/manual/reference/mongo-shell/)
- [Redis Commands Reference](https://redis.io/commands)

## 🎉 Productivity Tips

1. **Keyboard Shortcuts**:
   - `Ctrl+Shift+P` - Open command palette
   - `Ctrl+`` - Open terminal
   - `F5` - Start debugging

2. **Workspace Setup**:
   - Use workspace settings for team consistency
   - Create code snippets for common queries
   - Set up tasks for database operations

3. **Debugging**:
   - Use breakpoints in TypeScript code
   - Monitor Redis operations with MONITOR
   - Use MongoDB explain() for query optimization

This setup provides a complete development environment for JollyJet with optimal VS Code integration for both MongoDB and Redis development.

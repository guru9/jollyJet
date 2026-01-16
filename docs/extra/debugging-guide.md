# 🐛 Debugging Guide for JollyJet

> **Last Updated:** January 14, 2026  
> **Purpose:** Systematic approach to debugging issues in the JollyJet application

---

## 🔍 Debugging Methodology

### 1. **Systematic Debugging Process**

Follow this structured approach when encountering issues:

```
1. Identify the Problem
   ↓
2. Reproduce the Issue
   ↓
3. Gather Information
   ↓
4. Form Hypothesis
   ↓
5. Test Hypothesis
   ↓
6. Fix & Verify
```

### 2. **Information Gathering Checklist**

Before debugging, collect this information:

- [ ] Error messages (full stack traces)
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] Environment details (dev/staging/prod)
- [ ] Recent changes that might be related
- [ ] Logs from relevant components
- [ ] Browser developer tools output
- [ ] Database connection status
- [ ] Redis connection status

---

## 🔧 Common Debugging Scenarios

### **Scenario 1: Application Won't Start**

#### **Symptoms:**

- `npm run dev` fails
- Server crashes immediately
- Port already in use error

#### **Debugging Steps:**

1. **Check Environment Variables:**

   ```bash
   # Verify .env file exists and is valid
   ls -la .env
   cat .env

   # Check for missing required variables
   npm run validate-env  # if available
   ```

2. **Check Port Availability:**

   ```bash
   # Check if port is in use
   netstat -tulpn | grep :3000
   lsof -i :3000

   # Kill process using the port
   kill -9 <PID>
   ```

3. **Check Dependencies:**

   ```bash
   # Verify all dependencies are installed
   npm install

   # Check for corrupted node_modules
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check MongoDB Connection:**

   ```bash
   # Test MongoDB connection string
   node -e "
   const mongoose = require('mongoose');
   mongoose.connect(process.env.MONGO_URI)
     .then(() => console.log('MongoDB connected'))
     .catch(err => console.error('MongoDB error:', err));
   "
   ```

5. **Check Redis Connection:**
   ```bash
   # Test Redis connection
   node -e "
   const redis = require('redis');
   const client = redis.createClient({
     url: process.env.REDIS_URL
   });
   client.connect()
     .then(() => console.log('Redis connected'))
     .catch(err => console.error('Redis error:', err));
   "
   ```

### **Scenario 2: API Endpoints Not Working**

#### **Symptoms:**

- 404 errors
- 500 Internal Server Error
- Request timeouts

#### **Debugging Steps:**

1. **Check Route Registration:**

   ```bash
   # Verify routes are properly registered
   grep -r "app\." src/app.ts
   grep -r "router\." src/interface/
   ```

2. **Test with Curl:**

   ```bash
   # Basic GET request
   curl -v http://localhost:3000/api/products

   # POST request with body
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Product"}' \
     http://localhost:3000/api/products
   ```

3. **Check Middleware Stack:**

   ```bash
   # Look for middleware errors
   grep -r "app\.use" src/app.ts
   grep -r "middleware" src/
   ```

4. **Check Request Validation:**
   ```bash
   # Look for Zod schema issues
   grep -r "z\." src/
   grep -r "validate" src/
   ```

### **Scenario 3: Database Issues**

#### **Symptoms:**

- "Database connection failed"
- "Collection not found"
- Slow query performance

#### **Debugging Steps:**

1. **Check Connection Status:**

   ```bash
   # Test MongoDB connection manually
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/jollyjet"

   # Check if database exists
   show dbs
   use jollyjet
   show collections
   ```

2. **Check Model Definitions:**

   ```bash
   # Verify mongoose models
   find src -name "*.ts" -exec grep -l "mongoose.model\|Schema" {} \;

   # Check model registration
   grep -r "model(" src/
   ```

3. **Check Database Logs:**

   ```bash
   # Enable MongoDB logging
   tail -f /var/log/mongodb/mongod.log

   # Check MongoDB Atlas logs via dashboard
   # https://cloud.mongodb.com/
   ```

### **Scenario 4: Redis/Caching Issues**

#### **Symptoms:**

- "Redis connection failed"
- Cache not working
- Session data lost

#### **Debugging Steps:**

1. **Check Redis Connection:**

   ```bash
   # Test Redis CLI
   redis-cli -u redis://user:pass@host:port

   # Basic Redis commands
   PING
   INFO server
   KEYS *
   ```

2. **Check Cache Implementation:**

   ```bash
   # Look for cache-related code
   grep -r "redis" src/
   grep -r "cache" src/
   grep -r "set\|get" src/domain/services/cache/
   ```

3. **Monitor Redis Memory:**
   ```bash
   # Check Redis memory usage
   redis-cli info memory
   redis-cli info stats
   ```

### **Scenario 5: Test Failures**

#### **Symptoms:**

- Jest tests failing
- Integration test timeouts
- Mock issues

#### **Debugging Steps:**

1. **Run Tests with Verbose Output:**

   ```bash
   # Run specific test file
   npm test -- --verbose path/to/test.test.ts

   # Run with coverage
   npm test -- --coverage

   # Run in debug mode
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

2. **Check Test Environment:**

   ```bash
   # Verify test database setup
   npm run test:db:setup

   # Check MongoDB Memory Server
   npm run test:db:start
   ```

3. **Debug Test with Console:**
   ```typescript
   // Add to test file for debugging
   console.log('Test data:', testData);
   console.log('Mock calls:', mockFn.mock.calls);
   console.log('Expected result:', expectedResult);
   ```

---

## 🛠️ Debugging Tools & Techniques

### **1. Logging Strategies**

#### **Structured Logging:**

```typescript
import logger from '@/shared/logger';

// Good: Structured logging
logger.info({
  message: 'Product created successfully',
  productId: product._id,
  userId: req.user.id,
  timestamp: new Date().toISOString(),
});

// Avoid: Console logging
console.log('Product created'); // Not recommended
```

#### **Error Logging:**

```typescript
import logger from '@/shared/logger';

try {
  // Your code here
} catch (error) {
  logger.error({
    message: 'Failed to create product',
    error: error.message,
    stack: error.stack,
    userId: req.user?.id,
    requestBody: req.body,
  });
}
```

### **2. Debugging with VS Code (Recommended Workflow)**

#### **🔴 Important Note: Breakpoint Behavior**

**Breakpoints trigger only on uncached requests or new query parameters**

- **Cached requests**: May not trigger breakpoints due to middleware caching(Redis)
- **Solution**: Add unique query parameters or clear cache
- **Example**: Use `?timestamp=${Date.now()}` or `?debug=true`
- **Tip**: Restart the server after setting breakpoints for the first time

#### **Step 1: Start the debug server:**

```bash
npm run debug
```

This starts the server with Node.js inspector on port 9229.

#### **Step 2: Attach VS Code Debugger:**

- Open VS Code
- Go to Run and Debug panel (Ctrl+Shift+D)
- Select "🔄 Debug App (Attach)" from the dropdown
- Click the green play button to attach the debugger
- The debugger will connect to the running server process

#### **Step 3: Set Breakpoints:**

- Open your TypeScript files (e.g., ProductController.ts, ProductRepository.ts)
- Click in the gutter next to line numbers to set breakpoints
- Make requests to trigger the code execution

#### **Step 4: Access API Documentation:**

- Swagger UI: `http://localhost:3000/api-docs`
- API JSON Schema: `http://localhost:3000/api-docs.json`

#### **Step 5: Test API Endpoints:**

- Use Swagger UI for interactive API testing
- Or use curl/Postman to test endpoints directly
- Example: `GET http://localhost:3000/api/products?page=1&limit=10`
- With cache bypass: `GET http://localhost:3000/api/products?page=1&limit=10&timestamp=${Date.now()}`

#### **Launch Configuration (.vscode/launch.json):**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "🚀 Debug App (Start)",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/app.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "🔄 Debug App (Attach)",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "${workspaceFolder}",
      "restart": true,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "🧪 Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      },
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

#### **Breakpoints & Watch Variables:**

- Set breakpoints by clicking in gutter
- Add watch expressions for variables
- Use debug console for evaluation
- Step through code execution
- Use conditional breakpoints for complex scenarios

### **3. Chrome DevTools Debugging (Alternative)**

#### **Step 1: Start the debug server:**

```bash
npm run debug
```

This starts the server with Node.js inspector on port 9229.

#### **Step 2: Open Chrome DevTools:**

- Open Chrome browser
- Navigate to `chrome://inspect/#devices`
- For Edge users: `edge://inspect/#devices`
- Click "Open dedicated DevTools for Node" under "Remote Target"

#### **Step 3: Access API Documentation:**

- Swagger UI: `http://localhost:3000/api-docs`
- API JSON Schema: `http://localhost:3000/api-docs.json`

#### **Step 4: Test API Endpoints:**

- Use Swagger UI for interactive API testing
- Or use curl/Postman to test endpoints directly
- Example: `GET http://localhost:3000/api/products/69510e18403ebf023a6c3edf`
- With cache bypass: `GET http://localhost:3000/api/products/69510e18403ebf023a6c3edf?debug=true`

#### **Chrome DevTools Features:**

- **Sources Tab**: Set breakpoints and view source code
- **Console Tab**: Execute JavaScript commands
- **Network Tab**: Monitor network requests
- **Memory Tab**: Analyze memory usage
- **Profiler Tab**: Performance analysis

### **4. Browser Debugging (Frontend/Client-Side)**

#### **Network Tab:**

- Check API requests and responses
- Verify HTTP status codes
- Inspect request/response headers
- Check response times
- Look for failed requests

#### **Console Tab:**

- Look for JavaScript errors
- Use console.log() for debugging
- Check for async/await issues
- Monitor performance warnings
- Debug client-side code

#### **API Testing with Postman/Thunder Client:**

```json
// Example product creation request
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "Debug Product",
  "price": 99.99,
  "category": "electronics",
  "description": "Testing product creation"
}
```

### **5. Advanced Debugging Techniques**

#### **Cache Bypassing for Debugging:**

Since breakpoints trigger only on uncached requests, use these techniques:

```typescript
// Method 1: Add timestamp to API calls
const API_URL = `http://localhost:3000/api/products?timestamp=${Date.now()}`;

// Method 2: Add debug parameter
const API_URL = `http://localhost:3000/api/products?debug=true&nocache=1`;

// Method 3: Use different HTTP methods
// GET with debug parameter vs regular GET
```

#### **Conditional Breakpoints:**

```typescript
// In VS Code, right-click breakpoint → Edit Breakpoint
// Condition example:
req.params.id === '69510e18403ebf023a6c3edf';

// Log point example:
console.log('Product ID:', req.params.id, 'Cache key:', `product:${req.params.id}`);

// Hit count example:
// Stop only on 3rd hit
```

#### **Debug Console Usage:**

```typescript
// In debug console, you can execute:
req.body; // View request body
res.locals; // Check response locals
process.env.NODE_ENV; // Check environment
await Product.findById(id); // Execute database queries
typeof req.user; // Check variable types
```

#### **Advanced Logging:**

```typescript
// Debug-specific logging
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('DEBUG: Entering getProduct with ID:', id);
  console.log('DEBUG: Cache key:', `product:${id}`);
}

// Request debugging middleware
if (process.env.DEBUG_REQUESTS === 'true') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
  });
}
```

### **6. Database Debugging**

#### **MongoDB Debugging:**

```bash
# Enable query logging
mongoose.set('debug', true);

# Check query execution time
db.products.find({}).explain('executionStats');

# Monitor slow queries
db.setProfilingLevel(2, {slowms: 100});
db.system.profile.find().sort({ts:-1}).limit(5);
```

#### **Redis Debugging:**

```bash
# Monitor Redis commands
redis-cli monitor

# Check key patterns
redis-cli --scan --pattern "product:*"

# Check TTL for keys
redis-cli --scan --pattern "*" | xargs redis-cli ttl
```

---

### **7. Performance Debugging**

### **1. CPU & Memory Profiling**

#### **Node.js Profiling:**

```bash
# Generate CPU profile
node --prof src/app.ts

# Analyze profile
node --prof-process isolate-*.log > processed.txt

# Memory heap snapshot
node --inspect src/app.ts
# Open Chrome DevTools, go to Memory tab, take snapshot
```

#### **Monitor Performance:**

```bash
# Check process stats
ps aux | grep node
top -p <node-pid>

# Memory usage
node -e "
const used = process.memoryUsage();
console.log({
  rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
  heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
  heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
  external: Math.round(used.external / 1024 / 1024 * 100) / 100
});
"
```

### **2. API Performance**

#### **Response Time Debugging:**

```typescript
import logger from '@/shared/logger';

// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
});
```

#### **Database Query Performance:**

```typescript
// Log query execution time
mongoose.set('debug', (collectionName, method, query, doc) => {
  logger.info({
    collection: collectionName,
    method: method,
    query: query,
    timestamp: new Date().toISOString(),
  });
});
```

---

## 🚨 Emergency Debugging

### **When Production is Down**

1. **Quick Health Check:**

   ```bash
   # Check if server is running
   curl http://localhost:3000/health

   # Check process status
   pm2 status  # if using PM2
   systemctl status jollyjet  # if using systemd
   ```

2. **Check Logs:**

   ```bash
   # Application logs
   tail -f logs/app.log
   tail -f logs/error.log

   # System logs
   journalctl -u jollyjet -f
   dmesg | tail
   ```

3. **Database Connectivity:**

   ```bash
   # Test database connections
   node -e "require('./src/app').testDB()"
   ```

4. **Quick Fix Checklist:**
   - [ ] Restart the application
   - [ ] Check environment variables
   - [ ] Verify database connections
   - [ ] Check disk space
   - [ ] Check memory usage
   - [ ] Look for recent deployments

---

## 📝 Debugging Checklist

### **Before Debugging:**

- [ ] Reproduce the issue
- [ ] Check recent changes
- [ ] Review error logs
- [ ] Verify environment setup
- [ ] Check configuration files

### **During Debugging:**

- [ ] Use systematic approach
- [ ] Document findings
- [ ] Test hypotheses
- [ ] Use appropriate tools
- [ ] Log debugging steps

### **After Debugging:**

- [ ] Document root cause
- [ ] Implement fix
- [ ] Add regression tests
- [ ] Update documentation
- [ ] Share learnings

---

## 🔗 Related Documentation

- [Security Checklist](./security-checklist.md)
- [Testing Guide](../tests/test-coverage-walkthrough.md)
- [Implementation Plans](../implementation-plans/)
- [Project Analysis](../analysis/project-analysis.md)

---

**Generated by:** Antigravity AI  
**Debugging Guide:** v1.0  
**Last Updated:** 2026-01-14

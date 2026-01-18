# 🐛 Debugging Guide for JollyJet

> **Last Updated:** January 17, 2026
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

The application includes comprehensive response timing logging through multiple middleware layers. Here are the actual log formats you'll see:

### **📊 Real Log Examples from Your API:**

**CORS Security Validation:**

```json
{
  "level": "info",
  "time": 1768651579375,
  "env": "production",
  "port": 3000,
  "type": "SECURITY_VALIDATION_SUCCESS",
  "timestamp": "2026-01-17T12:06:19.375Z",
  "ip": "::1",
  "details": {
    "method": "GET",
    "path": "/api/products/count",
    "origin": "unknown"
  },
  "msg": "CORS Security Event"
}
```

**Cache Hit (Fast Response):**

```json
{
  "level": "info",
  "time": 1768652561083,
  "env": "production",
  "port": 3000,
  "key": "products:GET:/api/products/count",
  "msg": "Cache hit for key: products:GET:/api/products/count"
}
```

**Response Timing (Cached):**

```json
{
  "level": "info",
  "time": 1768652561104,
  "env": "production",
  "port": 3000,
  "method": "GET",
  "path": "/api/products/count",
  "statusCode": 200,
  "ip": "::1",
  "duration": "41ms",
  "msg": "Message: GET /api/products/count 200 - ::1 - 41ms"
}
```

**Cache Miss (Database Query):**

```json
{
  "level": "info",
  "time": 1768652121602,
  "env": "production",
  "port": 3000,
  "key": "products:GET:/api/products/count",
  "source": "database",
  "msg": "Cache miss for key: products:GET:/api/products/count, fetching from database"
}
```

**Database Operations:**

```json
{
  "level": "debug",
  "time": 1768652121639,
  "env": "production",
  "port": 3000,
  "msg": "Cache miss for key: products:count:{\"isActive\":false,\"isWishlistStatus\":false}, fetching from upstream"
}
```

**Response Timing (Database Query):**

```json
{
  "level": "info",
  "time": 1768652121729,
  "env": "production",
  "port": 3000,
  "method": "GET",
  "path": "/api/products/count",
  "statusCode": 200,
  "ip": "::1",
  "duration": "166ms",
  "msg": "Message: GET /api/products/count 200 - ::1 - 166ms"
}
```

**Cache Storage:**

```json
{
  "level": "debug",
  "time": 1768652121728,
  "env": "production",
  "port": 3000,
  "key": "products:count:{\"isActive\":false,\"isWishlistStatus\":false}",
  "ttl": 1800,
  "msg": "Data cached successfully for key: products:count:{\"isActive\":false,\"isWishlistStatus\":false}, ttl: 1800"
}
```

### **Log Interpretation:**

- **Response Timing**: `"duration": "166ms"` shows total request processing time
- **Cache Status**: Cache hit/miss logs indicate data source (Redis vs Database)
- **Security**: CORS validation events logged for security monitoring
- **Database Operations**: Cache set/get operations logged for performance analysis

### **Timing Differences:**

- **Cached Requests**: 37-60ms (Redis retrieval time)
- **Non-Cached Requests**: 150-200ms (Database query + caching time)

### **Current Implementation:**

The timing is handled by multiple middleware layers:

1. **`requestLogger`**: Logs HTTP request details when response finishes
2. **`responseTimingHandler`**: Sets timing headers for all responses
3. **`redisCacheHandler`**: Includes timing for cached responses and logs cache operations
4. **`corsSecurityHandler`**: Logs CORS security validation events

### **🔍 Middleware Logging Flow:**

When you make an API call to `/api/products`, you should see this exact logging sequence:

#### **1. CORS Security Validation:**

```json
{
  "level": "info",
  "time": 1768651579375,
  "env": "production",
  "port": 3000,
  "type": "SECURITY_VALIDATION_SUCCESS",
  "timestamp": "2026-01-17T12:06:19.375Z",
  "ip": "::1",
  "details": {
    "method": "GET",
    "path": "/api/products",
    "origin": "unknown"
  },
  "msg": "CORS Security Event"
}
```

#### **2. Cache Operations (if using Redis caching):**

```json
// Cache Hit
{
  "level": "info",
  "time": 1768652561083,
  "env": "production",
  "port": 3000,
  "key": "products:GET:/api/products?page=1&limit=10",
  "msg": "Cache hit for key: products:GET:/api/products?page=1&limit=10"
}

// Cache Miss
{
  "level": "info",
  "time": 1768652121602,
  "env": "production",
  "port": 3000,
  "key": "products:GET:/api/products?page=1&limit=10",
  "source": "database",
  "msg": "Cache miss for key: products:GET:/api/products?page=1&limit=10, fetching from database"
}
```

#### **3. Database Operations (if cache miss):**

```json
{
  "level": "debug",
  "time": 1768652121639,
  "env": "production",
  "port": 3000,
  "msg": "Cache miss for key: products:list:{\"page\":1,\"limit\":10,\"isActive\":false,\"isWishlistStatus\":false}, fetching from upstream"
}
```

#### **4. Final Response Logging:**

```json
{
  "level": "info",
  "time": 1768652121729,
  "env": "production",
  "port": 3000,
  "method": "GET",
  "path": "/api/products",
  "statusCode": 200,
  "ip": "::1",
  "duration": "166ms",
  "msg": "Message: GET /api/products 200 - ::1 - 166ms"
}
```

### **🚨 Debugging Middleware Issues:**

#### **Expected Log Sequence for GET /api/products:**

1. **MIDDLEWARE HIT**: `corsSecurityHandler` validates request
2. **FINISH EVENT FIRED**: `requestLogger` responds to 'finish' event
3. **RESPONSE FINISHED**: Final response log with timing
4. **Cache Logs**: Cache hit/miss operations from `redisCacheHandler`

#### **Troubleshooting Missing Logs:**

**❌ No "MIDDLEWARE HIT" logs:**

- Middleware not registered properly in `src/app.ts`
- Check `app.use(corsSecurityHandler(...))` is present
- Verify middleware import is correct

**❌ No "FINISH EVENT FIRED" logs:**

- `requestLogger` middleware not working
- Check `res.on('finish', ...)` event listener
- Verify response is actually finishing (no hanging requests)

**❌ No "RESPONSE FINISHED" logs:**

- Response not completing properly
- Check for unhandled errors or hanging promises
- Verify no middleware is calling `res.send()` multiple times

**❌ Missing Cache Logs:**

- `redisCacheHandler` not applied to route
- Check route configuration in `src/interface/routes/product/productRoutes.ts`
- Verify Redis service is connected

### **🧪 Testing API Call with Logging:**

**✅ VERIFIED - Working API Call Examples:**

```bash
# 1. Cached request (fast - returns cached data)
curl "http://localhost:3000/api/products?page=1&limit=10"
# Response shows: "cacheStatus":"hit"

# 2. Fresh request (slower - triggers database query)
curl "http://localhost:3000/api/products?page=1&limit=10&timestamp=$(date +%s)"
# Response shows: "cacheStatus":"miss"

# 3. Test different endpoint
curl "http://localhost:3000/api/products/count"
```

**📊 Actual Test Results:**

**Cached Request (First call):**

- ✅ `"cacheStatus":"hit"`
- ✅ `"ttl":83239` (cache remaining time)
- ✅ Faster response time
- ✅ Returns cached product data

**Fresh Request (With timestamp):**

- ✅ `"cacheStatus":"miss"`
- ✅ `"ttl":86400` (fresh cache duration)
- ✅ Triggers database query
- ✅ Sets new cache entry

**What You Should See in Terminal Logs:**

```
[INFO] CORS Security Event
[INFO] Cache miss for key: products:GET:/api/products?page=1&limit=10&timestamp=1234567890, fetching from database
[DEBUG] Cache miss for key: products:list:{"page":1,"limit":10,"isActive":false,"isWishlistStatus":false}, fetching from upstream
[DEBUG] Data cached successfully for key: products:list:{"page":1,"limit":10,"isActive":false,"isWishlistStatus":false}, ttl: 1800
[INFO] Message: GET /api/products 200 - ::1 - 166ms
```

**🎯 Key Success Indicators:**

1. **✅ MIDDLEWARE HIT**: `corsSecurityHandler` logs CORS Security Event
2. **✅ FINISH EVENT FIRED**: `requestLogger` logs response completion
3. **✅ RESPONSE FINISHED**: Final timing log with duration
4. **✅ Cache Operations**: Both hit/miss scenarios working correctly
5. **✅ JSON Responses**: Properly formatted API responses with cacheInfo

**🔍 Cache Behavior Verification:**

- **First request**: Cache miss → Database query → Cache set → Response
- **Second request (same params)**: Cache hit → Response (no database query)
- **Third request (with timestamp)**: Cache miss → Database query → New cache set → Response

### **🚨 Quick Troubleshooting Checklist:**

**If you don't see expected logs:**

1. **✅ Check Server Terminal**: Make sure you're looking at the terminal running `npm run start` or `npm run dev`
2. **✅ Verify API Response**: If you get JSON data, middleware is working (logs may be in different terminal)
3. **✅ Test Cache Bypass**: Use `?timestamp=$(date +%s)` to force fresh requests and see full logging
4. **✅ Check Log Levels**: Development shows pretty logs, production shows JSON logs
5. **✅ Middleware Registration**: All middleware registered in `src/app.ts:82-86`

**Expected middleware chain order:**

1. `corsSecurityHandler` → Logs CORS validation
2. `express.json()` → Body parsing (no logs)
3. `requestLogger` → Sets up finish event listener
4. `responseTimingHandler` → Sets timing headers (no logs)
5. Route handlers → Process request
6. `requestLogger` finish event → Logs response completion

**✅ VERIFICATION SUCCESS:**

The API calls demonstrate that:

- All middleware is properly registered and functioning
- CORS security logging is working
- Request/response timing is being tracked
- Cache hit/miss logic is operating correctly
- Database queries trigger appropriately
- Response logs include accurate timing information

**Expected Output in Terminal:**

```
[INFO] CORS Security Event
[INFO] Cache miss for key: products:GET:/api/products?page=1&limit=10, fetching from database
[DEBUG] Cache miss for key: products:list:{"page":1,"limit":10,"isActive":false,"isWishlistStatus":false}, fetching from upstream
[DEBUG] Data cached successfully for key: products:list:{"page":1,"limit":10,"isActive":false,"isWishlistStatus":false}, ttl: 1800
[INFO] Message: GET /api/products 200 - ::1 - 166ms
```

### **Important: Log Visibility**

**🔍 Where to Find API Logs:**

- **Terminal Output**: API logs appear in the terminal where you ran `npm run start` or `npm run dev`
- **Real-time Streaming**: Logs are streamed live as requests are processed
- **Multiple Terminals**: If you have multiple terminals running, check the one with the server process
- **Structured JSON**: All logs are now properly structured using Pino logger (no more console.log)
- **Pretty Printing**: `npm run dev` shows beautifully formatted logs with timestamps, colors, and structured data
- **Production JSON**: `npm run start` outputs clean JSON logs with all fields (level, time, env, port, method, path, statusCode, ip, duration, msg)
- **Development vs Production**: Development uses pretty printing, production uses JSON format

### **Current API Behavior Notes:**

**✅ Count API Fixed:**

- Default query: No filters (counts all products)
- Returns: 10 products (all products in database)
- Filtering: Use `?isActive=true` for active only, `?isActive=false` for inactive only
- Cache: Properly invalidated on product creation/update/deletion

### **Testing Response Times:**

```bash
# Test cached endpoint (fast)
curl "http://localhost:3000/api/products?page=1&limit=10"

# Test non-cached endpoint (slower, shows full processing)
curl "http://localhost:3000/api/products/count"

# Test with different filters
curl "http://localhost:3000/api/products/count?isActive=true"  # Count active products
```

### **Debugging Log Issues:**

If you don't see logs when making API calls:

1. **Check the correct terminal** - Look for the terminal running `npm run start` or `npm run dev`
2. **Verify server is running** - Check if the server process is active
3. **Try a fresh request** - Make sure you're hitting the correct endpoint
4. **Check for errors** - Look for any error messages in the terminal
5. **Check log levels** - Ensure your environment has appropriate log levels (debug/info)
6. **Cache behavior** - Cached requests may not trigger full middleware stack

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

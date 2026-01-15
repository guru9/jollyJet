# 🔄 Development Process Guide

> **Last Updated:** January 14, 2026  
> **Purpose:** Standardized development workflow and best practices for JollyJet

---

## 🚀 Development Workflow

### **1. Setup Your Development Environment**

#### **Prerequisites:**

```bash
# Node.js version check
node --version  # Should be v18+ (check package.json engines)

# Git configuration
git --version
git config --list | grep user

# Database tools (optional but recommended)
mongosh --version
redis-cli --version
```

#### **Initial Setup:**

```bash
# 1. Clone repository (if not already)
git clone <repository-url>
cd jollyJet

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Update .env with your credentials
nano .env

# 5. Verify setup
npm run validate  # Run validation checks
npm run lint      # Check code quality
npm run test      # Run tests
```

### **2. Daily Development Process**

#### **Start of Day:**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run tests to ensure everything works
npm run test
```

#### **During Development:**

```bash
# Make changes to code
# Run linting frequently
npm run lint

# Run relevant tests
npm test -- --testNamePattern="your-test"

# Check TypeScript compilation
npm run build
```

#### **End of Day:**

```bash
# 1. Stage your changes
git add .

# 2. Commit with descriptive message
git commit -m "feat: add user authentication endpoint"

# 3. Push to feature branch
git push origin feature-branch-name

# 4. Create pull request (if working in team)
```

---

## 🌿 Git Workflow

### **Branch Strategy**

#### **Main Branches:**

- `main` - Production-ready code
- `develop` - Integration branch for features

#### **Feature Branches:**

```
feature/user-authentication
feature/product-search
bugfix/login-validation-issue
hotfix/critical-security-patch
```

#### **Branch Naming Convention:**

```bash
# Features
feature/<feature-name>

# Bug fixes
bugfix/<issue-description>

# Hot fixes (urgent)
hotfix/<urgent-fix-description>

# Releases
release/<version-number>
```

### **Commit Message Standards**

#### **Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### **Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### **Examples:**

```bash
# Good commit messages
git commit -m "feat(auth): add JWT token validation middleware"
git commit -m "fix(products): resolve product listing pagination bug"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(products): add unit tests for product service"

# Bad commit messages
git commit -m "fixed stuff"
git commit -m "wip"
git commit -m "update file"
```

### **Pull Request Process**

#### **Before Creating PR:**

```bash
# 1. Update your branch
git fetch origin
git rebase origin/main

# 2. Run full test suite
npm run test
npm run lint
npm run build

# 3. Ensure coverage is maintained
npm run test:coverage
```

#### **PR Template:**

```markdown
## Description

Brief description of changes made

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated if necessary
- [ ] Environment variables validated
```

---

## 🧪 Testing Process

### **Testing Pyramid**

```
E2E Tests (10%)
     ↓
Integration Tests (20%)
     ↓
Unit Tests (70%)
```

### **Unit Testing**

#### **When to Write Unit Tests:**

- For all new functions/methods
- When fixing bugs (add regression tests)
- For utility functions
- For business logic

#### **Unit Test Structure:**

```typescript
describe('ProductService', () => {
  describe('createProduct', () => {
    it('should create a product with valid data', async () => {
      // Arrange
      const productData = { name: 'Test Product', price: 99.99 };

      // Act
      const result = await productService.createProduct(productData);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(productData.name);
    });

    it('should throw error for invalid data', async () => {
      // Arrange
      const invalidData = { name: '', price: -10 };

      // Act & Assert
      await expect(productService.createProduct(invalidData)).rejects.toThrow(ValidationError);
    });
  });
});
```

### **Integration Testing**

#### **When to Write Integration Tests:**

- Database operations
- API endpoints
- External service integrations
- Middleware functionality

#### **Integration Test Example:**

```typescript
describe('Product API Integration', () => {
  let app: Express;
  let db: MongoMemoryServer;

  beforeAll(async () => {
    db = await MongoMemoryServer.create();
    app = createApp();
  });

  it('POST /api/products should create product', async () => {
    const response = await request(app)
      .post('/api/products')
      .send({ name: 'Test Product', price: 99.99 })
      .expect(201);

    expect(response.body.name).toBe('Test Product');
  });
});
```

### **Running Tests**

#### **Test Commands:**

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- products.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Product"

# Run tests with verbose output
npm test -- --verbose
```

---

## 🔧 Code Quality Process

### **Code Review Checklist**

#### **Functionality:**

- [ ] Code works as expected
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No obvious bugs

#### **Code Quality:**

- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] No commented-out code
- [ ] No console.log statements (use logger)

#### **Performance:**

- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] No memory leaks
- [ ] Proper error handling

#### **Security:**

- [ ] No hardcoded secrets
- [ ] Input validation is present
- [ ] Proper authentication/authorization
- [ ] No SQL injection vulnerabilities

### **Linting and Formatting**

#### **ESLint Configuration:**

```bash
# Check linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint src/path/to/file.ts
```

#### **Prettier Formatting:**

```bash
# Check formatting
npm run format:check

# Format code
npm run format

# Format specific file
npx prettier --write src/path/to/file.ts
```

### **TypeScript Best Practices**

#### **Type Safety:**

```typescript
// Good: Explicit typing
const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
};

// Good: Interface definitions
interface ProductCreateRequest {
  name: string;
  price: number;
  description?: string;
}

// Good: Generic types
const apiResponse = await fetch<ApiResponse<Product[]>>('/api/products');
```

#### **Error Handling:**

```typescript
// Good: Specific error types
try {
  const product = await productService.createProduct(data);
  return product;
} catch (error) {
  if (error instanceof ValidationError) {
    throw new BadRequestError(error.message);
  }
  throw new InternalServerError('Failed to create product');
}
```

---

## 🚀 Deployment Process

### **Pre-Deployment Checklist**

#### **Code Quality:**

```bash
# 1. Run full test suite
npm run test
npm run test:coverage

# 2. Check linting
npm run lint

# 3. Build project
npm run build

# 4. Validate environment
npm run validate:env
```

#### **Security Checks:**

```bash
# Check for vulnerabilities
npm audit

# Check for secrets
git log -p | grep -i "password\|secret\|key\|token"

# Validate environment variables
node -e "console.log('ENV check:', Object.keys(process.env))"
```

### **Deployment Steps**

#### **Development Deployment:**

```bash
# 1. Build the application
npm run build

# 2. Run database migrations (if any)
npm run migrate

# 3. Start the application
npm start
```

#### **Production Deployment:**

```bash
# 1. Prepare production build
npm run build:prod

# 2. Set production environment
export NODE_ENV=production

# 3. Run production database migrations
npm run migrate:prod

# 4. Start production server
npm run start:prod
```

### **Post-Deployment Verification**

#### **Health Checks:**

```bash
# Check application health
curl http://localhost:3000/health

# Check API endpoints
curl http://localhost:3000/api/products

# Check database connectivity
curl http://localhost:3000/health/db
```

#### **Monitoring:**

```bash
# Check application logs
tail -f logs/app.log

# Monitor error rates
grep ERROR logs/app.log | wc -l

# Check performance metrics
curl http://localhost:3000/metrics
```

---

## 📋 Daily Development Checklist

### **Morning Routine:**

- [ ] Pull latest changes from main branch
- [ ] Run `npm install` for any new dependencies
- [ ] Start development server
- [ ] Run quick test suite to verify setup
- [ ] Check project board for tasks

### **During Development:**

- [ ] Write tests before code (TDD when possible)
- [ ] Run linting frequently
- [ ] Commit changes often with descriptive messages
- [ ] Run tests after each significant change
- [ ] Check code quality metrics

### **End of Day:**

- [ ] Commit all changes
- [ ] Push to feature branch
- [ ] Update task tracker
- [ ] Note any blockers or issues
- [ ] Plan next day's work

---

## 🛠️ Troubleshooting Common Issues

### **Development Issues**

#### **Port Already in Use:**

```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### **Dependency Issues:**

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Database Connection Issues:**

```bash
# Check MongoDB connection
mongosh "connection-string"

# Check Redis connection
redis-cli -u "redis-url"

# Reset database
npm run db:reset
```

### **Testing Issues**

#### **Test Timeouts:**

```bash
# Increase test timeout
npm test -- --testTimeout=10000

# Run tests one by one
npm test -- --runInBand
```

#### **Memory Issues:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

---

## 🔗 Related Documentation

- [Debugging Guide](./debugging-guide.md)
- [Security Checklist](./security-checklist.md)
- [Testing Walkthrough](../tests/test-coverage-walkthrough.md)
- [Implementation Plans](../implementation-plans/)

---

**Generated by:** Antigravity AI  
**Development Process Guide:** v1.0  
**Last Updated:** 2026-01-14

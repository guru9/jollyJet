# 🧹 Code Maintenance & Refactoring Guide

> **Last Updated:** January 14, 2026  
> **Purpose:** Guidelines for maintaining and improving code quality over time

---

## 📊 Code Health Monitoring

### **1. Regular Health Checks**

#### **Weekly Checks:**

```bash
# Check for dependency vulnerabilities
npm audit

# Check for outdated dependencies
npm outdated

# Run full test suite
npm run test:coverage

# Check bundle size (if applicable)
npm run analyze:bundle

# Check code complexity
npm run complexity:check
```

#### **Monthly Reviews:**

- Review code quality metrics
- Analyze test coverage trends
- Check performance benchmarks
- Review error rates and patterns
- Assess technical debt

### **2. Code Quality Metrics**

#### **Metrics to Track:**

```bash
# Cyclomatic complexity
npm run complexity:analyze

# Test coverage percentage
npm run test:coverage

# Code duplication
npm run duplication:check

# Maintainability index
npm run maintainability:check
```

#### **Target Benchmarks:**

- Test Coverage: > 90%
- Complexity Score: < 10 per function
- Duplication: < 3% of codebase
- Maintainability Index: > 70

---

## 🔄 Refactoring Strategies

### **1. When to Refactor**

#### **Code Smells to Look For:**

- Long methods (>50 lines)
- Large classes (>300 lines)
- Deep nesting (>3 levels)
- Repeated code patterns
- Complex conditional logic
- Poor naming conventions
- Lack of error handling
- Missing or outdated tests

#### **Refactoring Triggers:**

- Before adding new features
- After fixing bugs
- During code reviews
- When extending functionality
- Performance optimization needs
- Security vulnerability fixes

### **2. Refactoring Process**

#### **SAFE Refactoring Method:**

```
S - Solid Tests: Ensure test coverage before refactoring
A - Atomic Changes: Make small, incremental changes
F - Frequent Commits: Commit often with clear messages
E - Execute Tests: Run tests after each change
```

#### **Refactoring Steps:**

```bash
# 1. Create feature branch
git checkout -b refactor/component-name

# 2. Write or update tests
npm test -- --testPathPattern="component-name"

# 3. Make refactoring changes
# (small, incremental changes)

# 4. Run tests after each change
npm test

# 5. Commit each logical change
git add .
git commit -m "refactor: extract validation logic from service"

# 6. Create pull request
# 7. Code review
# 8. Merge to main
```

---

## 🧹 Specific Refactoring Patterns

### **1. Extract Method**

#### **Before:**

```typescript
class ProductService {
  async createProduct(data: ProductData): Promise<Product> {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Product name is required');
    }
    if (!data.price || data.price < 0) {
      throw new ValidationError('Product price must be positive');
    }
    if (!data.category || !Object.values(ProductCategory).includes(data.category)) {
      throw new ValidationError('Invalid product category');
    }

    const product = new Product({
      name: data.name.trim(),
      price: Number(data.price),
      category: data.category,
      description: data.description?.trim() || '',
      createdAt: new Date(),
    });

    return await this.productRepository.save(product);
  }
}
```

#### **After:**

```typescript
class ProductService {
  async createProduct(data: ProductData): Promise<Product> {
    this.validateProductData(data);

    const product = this.createProductEntity(data);

    return await this.productRepository.save(product);
  }

  private validateProductData(data: ProductData): void {
    if (!data.name || data.name.trim() === '') {
      throw new ValidationError('Product name is required');
    }
    if (!data.price || data.price < 0) {
      throw new ValidationError('Product price must be positive');
    }
    if (!data.category || !Object.values(ProductCategory).includes(data.category)) {
      throw new ValidationError('Invalid product category');
    }
  }

  private createProductEntity(data: ProductData): Product {
    return new Product({
      name: data.name.trim(),
      price: Number(data.price),
      category: data.category,
      description: data.description?.trim() || '',
      createdAt: new Date(),
    });
  }
}
```

### **2. Extract Class**

#### **Before:**

```typescript
class ProductController {
  async createProduct(req: Request, res: Response): Promise<void> {
    // Validation logic
    const { name, price, category, description } = req.body;
    const errors: string[] = [];

    if (!name || name.trim() === '') {
      errors.push('Product name is required');
    }
    if (!price || price < 0) {
      errors.push('Product price must be positive');
    }
    // ... more validation

    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    // Business logic
    const product = await this.productService.createProduct({
      name: name.trim(),
      price: Number(price),
      category,
      description: description?.trim() || '',
    });

    // Response formatting
    res.status(201).json({
      success: true,
      data: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
      },
    });
  }
}
```

#### **After:**

```typescript
class ProductValidator {
  validateCreateProductRequest(data: any): ValidationResult {
    const errors: string[] = [];

    if (!data.name || data.name.trim() === '') {
      errors.push('Product name is required');
    }
    if (!data.price || data.price < 0) {
      errors.push('Product price must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

class ProductResponseFormatter {
  formatCreateProductResponse(product: Product): ApiResponse {
    return {
      success: true,
      data: {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
      },
    };
  }
}

class ProductController {
  constructor(
    private validator: ProductValidator,
    private responseFormatter: ProductResponseFormatter,
    private productService: ProductService
  ) {}

  async createProduct(req: Request, res: Response): Promise<void> {
    // Validation
    const validation = this.validator.validateCreateProductRequest(req.body);
    if (!validation.isValid) {
      res.status(400).json({ errors: validation.errors });
      return;
    }

    // Business logic
    const product = await this.productService.createProduct(req.body);

    // Response formatting
    const response = this.responseFormatter.formatCreateProductResponse(product);
    res.status(201).json(response);
  }
}
```

### **3. Replace Magic Strings/Numbers**

#### **Before:**

```typescript
class UserService {
  async createUser(userData: any): Promise<User> {
    if (userData.age < 18) {
      throw new ValidationError('User must be at least 18 years old');
    }

    const user = new User({
      ...userData,
      status: 'active',
      role: userData.isAdmin ? 'admin' : 'user',
    });

    return await this.userRepository.save(user);
  }
}
```

#### **After:**

```typescript
const USER_CONSTANTS = {
  MINIMUM_AGE: 18,
  STATUSES: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    PENDING: 'pending',
  },
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
  },
} as const;

class UserService {
  async createUser(userData: any): Promise<User> {
    if (userData.age < USER_CONSTANTS.MINIMUM_AGE) {
      throw new ValidationError('User must be at least 18 years old');
    }

    const user = new User({
      ...userData,
      status: USER_CONSTANTS.STATUSES.ACTIVE,
      role: userData.isAdmin ? USER_CONSTANTS.ROLES.ADMIN : USER_CONSTANTS.ROLES.USER,
    });

    return await this.userRepository.save(user);
  }
}
```

---

## 🧪 Testing During Refactoring

### **1. Test-Driven Refactoring**

#### **Golden Rule:**

> "Never refactor without tests"

#### **Process:**

```bash
# 1. Ensure test coverage
npm run test:coverage

# 2. Add missing tests for refactored code
npm test -- --testPathPattern="code-to-refactor"

# 3. Run tests before refactoring
npm test

# 4. Make refactoring changes
# 5. Run tests after each change
npm test

# 6. Ensure no test failures
```

### **2. Characterization Tests**

#### **For Legacy Code:**

```typescript
describe('LegacyService', () => {
  it('should behave consistently with current implementation', async () => {
    const service = new LegacyService();
    const input = {
      /* test data */
    };
    const result = await service.process(input);

    // This test characterizes current behavior
    // Refactoring should not change these expectations
    expect(result).toEqual(expectedResult);
  });
});
```

---

## 📈 Performance Optimization

### **1. Database Query Optimization**

#### **Before:**

```typescript
// N+1 query problem
async getProducts(): Promise<Product[]> {
  const products = await Product.find({});

  for (const product of products) {
    product.category = await Category.findById(product.categoryId);
    product.reviews = await Review.find({ productId: product._id });
  }

  return products;
}
```

#### **After:**

```typescript
// Optimized with population and aggregation
async getProducts(): Promise<Product[]> {
  return await Product.find({})
    .populate('categoryId', 'name description')
    .populate({
      path: 'reviews',
      select: 'rating comment',
      match: { isApproved: true }
    })
    .lean(); // Return plain JavaScript objects
}
```

### **2. Caching Optimization**

#### **Before:**

```typescript
async getProductById(id: string): Promise<Product> {
  return await Product.findById(id);
}
```

#### **After:**

```typescript
async getProductById(id: string): Promise<Product> {
  const cacheKey = `product:${id}`;

  // Try cache first
  const cached = await this.cacheService.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Load from database
  const product = await Product.findById(id);
  if (!product) {
    return null;
  }

  // Cache for 1 hour
  await this.cacheService.set(cacheKey, JSON.stringify(product), 3600);

  return product;
}
```

---

## 🔄 Dependency Management

### **1. Regular Dependency Updates**

#### **Monthly Update Process:**

```bash
# Check for outdated packages
npm outdated

# Update patch versions
npm update

# Update minor versions (carefully)
npm install package@latest

# Test after updates
npm test

# Check for security vulnerabilities
npm audit
npm audit fix
```

#### **Version Pinning Strategy:**

```json
{
  "dependencies": {
    "express": "^4.18.0", // Minor/patch updates allowed
    "mongoose": "~6.0.0", // Only patch updates allowed
    "redis": "4.0.0" // Exact version for stability
  }
}
```

### **2. Security Patch Management**

#### **Security Audit Process:**

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (when possible)
npm audit fix

# Review manual fixes
npm audit --json
```

---

## 📋 Refactoring Checklist

### **Before Refactoring:**

- [ ] Test coverage is adequate (>90%)
- [ ] Current behavior is documented
- [ ] Performance baseline is measured
- [ ] Branch created for refactoring
- [ ] Stakeholders are informed

### **During Refactoring:**

- [ ] Changes are made incrementally
- [ ] Tests are run after each change
- [ ] Code is committed frequently
- [ ] Performance is monitored
- [ ] Documentation is updated

### **After Refactoring:**

- [ ] All tests pass
- [ ] Code quality metrics improved
- [ ] Performance is maintained or improved
- [ ] Documentation is current
- [ ] Code review completed

---

## 🎯 Long-term Maintenance Strategy

### **1. Technical Debt Management**

#### **Debt Categories:**

- **Code Quality**: Poor naming, long methods, complexity
- **Architecture**: Tight coupling, lack of separation
- **Testing**: Missing tests, flaky tests
- **Performance**: Slow queries, memory leaks
- **Security**: Vulnerabilities, outdated dependencies

#### **Debt Prioritization:**

```bash
# High Priority (Security/Critical)
- Security vulnerabilities
- Production bugs
- Performance bottlenecks

# Medium Priority (Maintenance)
- Code complexity > threshold
- Test coverage < target
- Outdated major dependencies

# Low Priority (Improvement)
- Code style inconsistencies
- Minor performance tweaks
- Documentation gaps
```

### **2. Continuous Improvement**

#### **Weekly Routines:**

- Code quality metrics review
- Test coverage analysis
- Security audit
- Dependency updates

#### **Monthly Routines:**

- Architecture review
- Performance benchmarking
- Technical debt assessment
- Documentation updates

#### **Quarterly Routines:**

- Major dependency upgrades
- Architecture refactoring
- Security audit
- Training and skill development

---

## 🔗 Related Documentation

- [Development Process Guide](./development-process.md)
- [Debugging Guide](./debugging-guide.md)
- [Security Checklist](./security-checklist.md)
- [Environment Setup Guide](./environment-setup.md)

---

**Generated by:** Antigravity AI  
**Code Maintenance Guide:** v1.0  
**Last Updated:** 2026-01-14

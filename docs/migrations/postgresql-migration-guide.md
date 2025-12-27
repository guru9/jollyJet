# PostgreSQL Database Migration Guide

## 🎯 Current Status & Recommendation

**✅ No Immediate Migration Needed** - The JollyJet e-commerce project is currently using MongoDB successfully and does not require switching to PostgreSQL at this time.

**📋 This Guide Purpose:** This document serves as a **contingency plan** and **preparedness resource** for potential future scenarios where PostgreSQL might become beneficial.

### Why MongoDB is Excellent for JollyJet (Current Choice):

- ✅ **Schema Flexibility**: Perfect for e-commerce products with varying attributes
- ✅ **Scalability**: Handles product catalog growth efficiently
- ✅ **Performance**: Fast reads/writes for product listings and searches
- ✅ **Document Structure**: Natural fit for product data with nested attributes
- ✅ **Development Speed**: Rapid iteration with schema-less design
- ✅ **Cost-Effective**: Lower infrastructure costs for current scale

### When to Consider PostgreSQL Migration (Future Scenarios):

- **Complex Transactions**: If order processing requires ACID transactions
- **Advanced Reporting**: For complex analytical queries with multiple joins
- **Relational Data**: If user relationships become highly complex
- **Enterprise Requirements**: For advanced data integrity constraints
- **Legacy Integration**: When connecting to existing SQL systems
- **Specific Performance Needs**: If MongoDB limitations emerge for particular use cases

**🎯 Current Recommendation:** Continue with MongoDB and use this guide as reference if future requirements change. For detailed findings and recommendations, refer to the [SQL Integration Findings](./sql-integration-findings.md) document.

## Overview

This guide provides step-by-step instructions for migrating the JollyJet application from MongoDB to PostgreSQL while maintaining the Clean Architecture principles.

## Architecture Benefits

The current architecture is designed for database flexibility:

- **Repository Pattern**: `IProductRepository` interface abstracts database operations
- **Dependency Inversion**: Use cases depend on abstractions, not concrete implementations
- **Clean Separation**: Domain layer is completely database-agnostic

## Migration Options

### Option 1: TypeORM (Recommended)

TypeORM is a mature ORM that works well with Clean Architecture and provides:

- Active Record and Data Mapper patterns
- Database-agnostic syntax
- Migrations support
- Relations and transactions

### Option 2: Sequelize

Sequelize is another popular Node.js ORM with:

- Promise-based API
- Transaction support
- Model associations
- Migrations

### Option 3: Prisma

Prisma offers a modern data layer with:

- Type-safe database access
- Auto-generated query builder
- Migrations
- Introspection

## Step-by-Step Migration Guide

### 1. Install Required Packages

```bash
# For TypeORM
npm install typeorm @types/typeorm pg

# For Sequelize
npm install sequelize sequelize-typescript pg pg-hstore

# For Prisma
npm install prisma @prisma/client
```

### 2. Create PostgreSQL Models

Create PostgreSQL model that maps to your domain entity:

```typescript
// src/infrastructure/models/PostgresProductModel.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../domain/entities/Product';

@Entity('products')
export class PostgresProductModel {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column('integer')
  stock!: number;

  @Column({ length: 100 })
  category!: string;

  @Column('boolean', { default: true })
  isActive!: boolean;

  @Column('boolean', { default: false })
  isInWishlist!: boolean;

  @Column('integer', { default: 0 })
  wishlistCount!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Convert PostgreSQL model to domain entity
  toEntity(): Product {
    return new Product({
      id: this.id,
      name: this.name,
      description: this.description,
      price: Number(this.price),
      stock: this.stock,
      category: this.category,
      isActive: this.isActive,
      isInWishlist: this.isInWishlist,
      wishlistCount: this.wishlistCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }

  // Create PostgreSQL model from domain entity
  static fromEntity(product: Product): PostgresProductModel {
    const model = new PostgresProductModel();
    model.id = product.id || undefined; // Let database generate if new
    model.name = product.name;
    model.description = product.description;
    model.price = product.price;
    model.stock = product.stock;
    model.category = product.category;
    model.isActive = product.isActive;
    model.isInWishlist = product.isInWishlist;
    model.wishlistCount = product.wishlistCount;
    return model;
  }
}
```

### 3. Create PostgreSQL Repository Implementation

```typescript
// src/infrastructure/repositories/PostgresProductRepository.ts
import { IProductRepository } from '../../domain/interfaces/IProductRepository';
import { Product } from '../../domain/entities/Product';
import { PostgresProductModel } from '../models/PostgresProductModel';
import { DataSource, Repository } from 'typeorm';
import { DI_TOKENS } from '../../shared/constants';
import { injectable, inject } from 'tsyringe';

@injectable()
export class PostgresProductRepository implements IProductRepository {
  private repository: Repository<PostgresProductModel>;

  constructor(@inject(DI_TOKENS.DATA_SOURCE) private dataSource: DataSource) {
    this.repository = dataSource.getRepository(PostgresProductModel);
  }

  async create(product: Product): Promise<Product> {
    const model = PostgresProductModel.fromEntity(product);
    const saved = await this.repository.save(model);
    return saved.toEntity();
  }

  async findById(id: string): Promise<Product | null> {
    const model = await this.repository.findOne({ where: { id } });
    return model ? model.toEntity() : null;
  }

  async findAll(filters?: any): Promise<Product[]> {
    // Build query based on filters
    const query = this.repository.createQueryBuilder('product');

    if (filters?.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('product.isActive = :isActive', { isActive: filters.isActive });
    }

    const models = await query.getMany();
    return models.map((model) => model.toEntity());
  }

  async update(product: Product): Promise<Product> {
    const model = PostgresProductModel.fromEntity(product);
    const updated = await this.repository.save(model);
    return updated.toEntity();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async count(filters?: any): Promise<number> {
    const query = this.repository.createQueryBuilder('product');

    if (filters?.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    return query.getCount();
  }

  async toggleWishlistStatus(productId: string, isInWishlist: boolean): Promise<Product> {
    const product = await this.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    product.isInWishlist = isInWishlist;
    product.wishlistCount = isInWishlist ? (product.wishlistCount || 0) + 1 : 0;

    return this.update(product);
  }
}
```

### 4. Update Database Connection

```typescript
// src/infrastructure/database/typeorm.ts
import { DataSource } from 'typeorm';
import { PostgresProductModel } from '../models/PostgresProductModel';
import { config } from 'dotenv';

config();

export const createTypeORMConnection = async (): Promise<DataSource> => {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'jollyjet',
    entities: [PostgresProductModel],
    synchronize: process.env.NODE_ENV === 'development', // Auto-create tables in dev
    migrations: ['src/infrastructure/migrations/*.ts'],
    migrationsTableName: 'migrations',
    logging: process.env.NODE_ENV === 'development',
  }).initialize();
};
```

### 5. Update DI Container

```typescript
// src/config/di-container.ts
import { container } from 'tsyringe';
import { IProductRepository } from '../domain/interfaces/IProductRepository';
import { PostgresProductRepository } from '../infrastructure/repositories/PostgresProductRepository';
import { DI_TOKENS } from '../shared/constants';
import { createTypeORMConnection } from '../infrastructure/database/typeorm';

// Initialize database connection
const initializeDatabase = async () => {
  const dataSource = await createTypeORMConnection();
  container.register(DI_TOKENS.DATA_SOURCE, { useValue: dataSource });
};

// Register repositories
container.register<IProductRepository>(DI_TOKENS.PRODUCT_REPOSITORY, {
  useClass: PostgresProductRepository,
});

export { initializeDatabase };
```

### 6. Create Database Tables

```typescript
// src/infrastructure/tables/CreateProductsTable.ts
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductsTable implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'stock',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'isInWishlist',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'wishlistCount',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('products');
  }
}
```

### 7. Update Application Bootstrap

```typescript
// src/app.ts
import express from 'express';
import { initializeDatabase } from './config/di-container';
import { errorHandler } from './interface/middlewares/errorHandler';
import { requestLogger } from './interface/middlewares/requestLogger';
import { router } from './interface/routes';

const bootstrap = async () => {
  // Initialize database connection first
  await initializeDatabase();

  const app = express();

  // Middlewares
  app.use(express.json());
  app.use(requestLogger);

  // Routes
  app.use('/api', router);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handling
  app.use(errorHandler);

  return app;
};

export { bootstrap };
```

### 8. Update Environment Variables

```env
# .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=jollyjet
DB_TYPE=postgres
```

### 9. Update Tests for PostgreSQL Repository

```typescript
// src/__tests__/unit/products/postgresProductRepository.test.ts
import { PostgresProductRepository } from '../../../infrastructure/repositories/PostgresProductRepository';
import { Product } from '../../../domain/entities/Product';
import { DataSource } from 'typeorm';
import { createTestConnection } from '../../test-utils';

describe('PostgresProductRepository', () => {
  let repository: PostgresProductRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createTestConnection();
    repository = new PostgresProductRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  // Test cases similar to MongoDB repository tests
  // but with PostgreSQL-specific assertions
});
```

## Migration Checklist

• Install TypeORM/Sequelize/Prisma  
• Create PostgreSQL models mapping to domain entities  
• Implement PostgreSQL repository for each domain interface  
• Update database connection configuration  
• Update DI container registrations
• Create database migrations  
• Update application bootstrap to initialize PostgreSQL connection  
• Update environment variables  
• Update repository tests  
• Test all use cases with new PostgreSQL implementation  
• Update documentation

## Benefits of This Approach

1. **Zero Changes to Business Logic**: All use cases, services, and domain entities remain unchanged
2. **Type Safety**: PostgreSQL models provide compile-time type checking
3. **Transactions**: Easy to implement ACID transactions
4. **Relations**: Support for complex relationships between entities
5. **Migrations**: Structured database schema management
6. **Performance**: PostgreSQL databases often perform better for complex queries

## Common Pitfalls to Avoid

1. **Leaking PostgreSQL Details**: Keep PostgreSQL-specific code in infrastructure layer only
2. **Bypassing Repository**: Always use repository methods, never raw queries in use cases
3. **Tight Coupling**: Ensure repositories depend on abstractions, not concrete models
4. **Ignoring Transactions**: Implement proper transaction handling for data consistency
5. **Over-optimizing**: Start with simple implementation, optimize later if needed

This migration guide ensures a smooth transition from MongoDB to PostgreSQL while maintaining all the benefits of Clean Architecture.

import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerOptions } from 'swagger-ui-express';
import config from '.';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JollyJet API',
      version: '1.0.0',
      description: 'E-commerce API - When Speed and Happiness Matters :)',
      contact: {
        name: 'JollyJet Team',
        url: 'https://github.com/guru9/jollyJet',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: [
            'id',
            'name',
            'description',
            'price',
            'stock',
            'category',
            'images',
            'isActive',
            'createdAt',
            'updatedAt',
            'isWishlistStatus',
            'wishlistCount',
          ],
          properties: {
            id: {
              type: 'string',
              description: 'Product unique identifier',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Product name',
              example: 'Wireless Headphones',
            },
            description: {
              type: 'string',
              description: 'Product description',
              example: 'High-quality wireless headphones with noise cancellation',
            },
            price: {
              type: 'number',
              description: 'Product price',
              minimum: 0,
              example: 199.99,
            },
            stock: {
              type: 'integer',
              description: 'Available stock quantity (shows 0 for inactive products)',
              minimum: 0,
              example: 50,
            },
            category: {
              type: 'string',
              description: 'Product category',
              example: 'Electronics',
            },
            images: {
              type: 'array',
              description: 'Product image URLs',
              items: {
                type: 'string',
                format: 'uri',
              },
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
            },
            isActive: {
              type: 'boolean',
              description: 'Product active status',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2023-12-01T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
              example: '2023-12-01T10:00:00.000Z',
            },
            isWishlistStatus: {
              type: 'boolean',
              description: 'Wishlist status',
              example: false,
            },
            wishlistCount: {
              type: 'integer',
              description: 'Number of users who added this to wishlist',
              minimum: 0,
              example: 25,
            },
          },
        },
        CacheInfo: {
          type: 'object',
          properties: {
            cacheStatus: {
              type: 'string',
              description: 'Cache status (hit/miss)',
              enum: ['hit', 'miss', 'bypass'],
              example: 'hit',
            },
            cacheKey: {
              type: 'string',
              description: 'Redis cache key used',
              example: 'products:page:1:limit:10',
            },
            ttl: {
              type: 'integer',
              description: 'Time-to-live in seconds',
              example: 86400,
            },
            cachedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the cache was created',
              example: '2023-12-01T10:00:00.000Z',
            },
          },
        },
        CacheStatistics: {
          type: 'object',
          properties: {
            hitRate: {
              type: 'number',
              description: 'Cache hit rate percentage',
              minimum: 0,
              maximum: 100,
              example: 95.5,
            },
            totalRequests: {
              type: 'integer',
              description: 'Total number of cache requests',
              minimum: 0,
              example: 1000,
            },
            cacheHits: {
              type: 'integer',
              description: 'Number of cache hits',
              minimum: 0,
              example: 955,
            },
            cacheMisses: {
              type: 'integer',
              description: 'Number of cache misses',
              minimum: 0,
              example: 45,
            },
            memoryUsage: {
              type: 'string',
              description: 'Redis memory usage',
              example: '10.5 MB',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
        NotFoundError: {
          description: 'Resource not found',
        },
        CacheResponse: {
          description: 'Cached response with cache metadata',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'success',
                  },
                  data: {
                    type: 'object',
                    description: 'The actual response data',
                  },
                  message: {
                    type: 'string',
                    example: 'Data retrieved successfully',
                  },
                  cacheInfo: {
                    $ref: '#/components/schemas/CacheInfo',
                  },
                },
              },
            },
          },
        },
        ProductListResponse: {
          description: 'Product list response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'success',
                  },
                  data: {
                    type: 'object',
                    properties: {
                      products: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Product',
                        },
                      },
                      total: {
                        type: 'integer',
                        example: 8,
                      },
                      page: {
                        type: 'integer',
                        example: 1,
                      },
                      limit: {
                        type: 'integer',
                        example: 10,
                      },
                      totalPages: {
                        type: 'integer',
                        example: 1,
                      },
                    },
                  },
                  message: {
                    type: 'string',
                    example: 'Products retrieved successfully',
                  },
                },
              },
            },
          },
        },
        CacheStatisticsResponse: {
          description: 'Redis cache statistics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    example: 'success',
                  },
                  data: {
                    $ref: '#/components/schemas/CacheStatistics',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    './src/app.ts',
    './src/interface/routes/**/*.ts',
    './src/interface/dtos/**/*.ts',
    './src/interface/controllers/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'JollyJet API Docs',
};

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
              description: 'Available stock quantity',
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
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
        },
        NotFoundError: {
          description: 'Resource not found',
        },
      },
    },
  },
  apis: ['./src/app.ts', './src/interface/routes/**/*.ts', './src/interface/dtos/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'JollyJet API Docs',
};

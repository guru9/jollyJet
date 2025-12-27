import { SwaggerOptions } from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
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
      schemas: {},
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
  apis: ['./src/app.ts', './src/interface/routes/*.ts', './src/interface/dtos/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export const swaggerUiOptions: SwaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'JollyJet API Docs',
};




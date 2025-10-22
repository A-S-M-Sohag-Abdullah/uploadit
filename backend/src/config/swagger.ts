import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UploadIt API Documentation',
      version: '1.0.0',
      description: 'API documentation for UploadIt video streaming platform',
      contact: {
        name: 'API Support',
        email: 'support@uploadit.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Videos',
        description: 'Video management endpoints',
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints',
      },
      {
        name: 'Likes',
        description: 'Like/Dislike management endpoints',
      },
      {
        name: 'Subscriptions',
        description: 'Subscription management endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
---
name: swagger-openapi
description: OpenAPI 3.0 + Swagger documentation for Express/Node.js APIs. Use when documenting REST APIs or designing API contracts.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Swagger / OpenAPI Patterns

> **Philosophy:** API spec is a contract. Write it alongside code, not after.
> **Core Principle:** Define schemas once in `components`, reference everywhere.

---

## Setup

```bash
npm install swagger-ui-express swagger-jsdoc
```

```javascript
// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'MyApp API', version: '1.0.0' },
    servers: [{ url: process.env.API_URL }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error:   { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],  // Global JWT auth
  },
  apis: ['./src/routes/*.js'],
});

export function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));
}
```

---

## JSDoc Route Annotations

```javascript
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/User' }
 *       404:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     security: []   # Override global — public endpoint
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 */
```

---

## Reusable Schema Template

```javascript
// In components.schemas:
User: {
  type: 'object',
  properties: {
    _id:       { type: 'string', example: '507f1f77bcf86cd799439011' },
    name:      { type: 'string', example: 'Nguyen Van A' },
    email:     { type: 'string', format: 'email' },
    role:      { type: 'string', enum: ['user', 'admin'] },
    createdAt: { type: 'string', format: 'date-time' },
  },
},
Pagination: {
  type: 'object',
  properties: {
    total: { type: 'integer' }, page: { type: 'integer' },
    pageSize: { type: 'integer' }, totalPages: { type: 'integer' },
  },
},
```

---

## Best Practices

| Do | Don't |
|---|---|
| `$ref` to components.schemas | Copy-paste schemas across routes |
| `security: []` for public routes | Forget global auth applies by default |
| Add `example` values to properties | Leave examples empty |
| Tag routes by feature/resource | Put all routes in one tag |

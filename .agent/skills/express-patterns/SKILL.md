---
name: express-patterns
description: Express.js architecture — router structure, middleware stack, EJS templating, validation, error handling. Use when building Express APIs or server-rendered apps.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Express Patterns

> **Philosophy:** Middleware is composition. Route handlers should be thin.
> **Core Principle:** Business logic in services, not in controllers or routes.

---

## 🎯 Selective Reading Rule

| Section | When to Read |
|---------|-------------|
| Project Structure | New Express project |
| App Setup | Global middleware configuration |
| Router Architecture | Feature-based routing |
| Validation | Request body validation |
| Error Handling | Global error middleware |
| EJS Templating | Server-rendered views |

---

## Project Structure

```
src/
├── app.js            # Express app (no listen)
├── server.js         # Entry point
├── config/           # db.js, redis.js, session.js
├── routes/           # Route files + index.js aggregator
├── controllers/      # Thin: req→service→res
├── services/         # Business logic (no req/res)
├── models/           # Mongoose models
├── middleware/        # auth, error, validate
├── validators/       # Zod schemas
├── views/            # EJS templates + layouts + partials
└── public/           # Static assets
```

---

## App Setup

```javascript
// app.js
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

// ⚠️ MIDDLEWARE ORDER IS CRITICAL
app.use(helmet());                          // 1. Security headers
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));                      // 3. Logging
app.use(express.json({ limit: '10mb' }));   // 4. Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);                 // 5. Sessions
app.use('/api', routes);                    // 6. Routes
app.use(notFound);                          // 7. 404 (AFTER routes)
app.use(errorHandler);                      // 8. Error (LAST, 4 params)

app.set('view engine', 'ejs');
app.set('views', './src/views');

export default app;
```

---

## Router Architecture

```javascript
// routes/index.js — Aggregator
import { Router } from 'express';
const router = Router();
router.use('/auth',  authRoutes);
router.use('/users', userRoutes);
export default router;

// routes/user.routes.js
const router = Router();
router.use(requireAuth);  // Apply auth to all user routes
router.get('/:id',   getUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
export default router;
```

---

## Controller Pattern (Thin)

```javascript
// asyncHandler: wraps async, forwards errors to errorHandler
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const getUser = asyncHandler(async (req, res) => {
  const user = await UserService.findById(req.params.id);
  res.json({ success: true, data: user });
});
```

---

## Validation (Zod)

```javascript
// middleware/validate.middleware.js
import { z } from 'zod';
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
    }
    next(err);
  }
};

// validators/user.validator.js
export const updateUserSchema = z.object({
  name:  z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
}).strict();
```

---

## Error Handling Middleware

```javascript
export const notFound = (req, res) =>
  res.status(404).json({ success: false, error: `Route ${req.path} not found` });

export const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError')
    return res.status(400).json({ success: false, errors: Object.values(err.errors).map(e => e.message) });
  if (err.code === 11000)
    return res.status(409).json({ success: false, error: `${Object.keys(err.keyValue)[0]} already exists` });
  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ success: false, error: 'Invalid token' });

  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
};
```

---

## EJS Templating

```ejs
<!-- views/layouts/main.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <title><%= title %> | App</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body>
  <%- include('../partials/navbar') %>
  <main><%- body %></main>
  <%- include('../partials/footer') %>
</body>
</html>

<!-- Render from controller -->
res.render('pages/dashboard', { title: 'Dashboard', user: req.user });
```

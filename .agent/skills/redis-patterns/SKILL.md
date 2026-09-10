---
name: redis-patterns
description: Redis caching strategies, session management, rate limiting, and pub/sub patterns. Use when implementing caching, user sessions, or real-time features with Redis/ioredis.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Redis Patterns

> **Philosophy:** Cache what's expensive to compute, expire what becomes stale.
> **Core Principle:** Every cache decision needs a TTL and an invalidation strategy.

---

## 🎯 Selective Reading Rule

| Section | When to Read |
|---------|-------------|
| Cache-Aside | API response caching, DB query caching |
| Sessions | User authentication, JWT storage |
| Rate Limiting | API protection, abuse prevention |
| Pub/Sub | Real-time events, notifications |
| Key Design | Naming conventions, namespace planning |

---

## Connection Setup (ioredis)

```javascript
// config/redis.js
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy: (times) => Math.min(times * 100, 3000), // Exponential backoff
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export default redis;
```

---

## Cache-Aside Pattern

### Basic Implementation

```javascript
// Generic cache wrapper
async function withCache(key, ttlSeconds, fetchFn) {
  // 1. Try cache first
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // 2. Cache miss — fetch from source
  const data = await fetchFn();

  // 3. Store in cache
  await redis.setex(key, ttlSeconds, JSON.stringify(data));

  return data;
}

// Usage
const user = await withCache(
  `user:${userId}`,
  300,              // 5 min TTL
  () => User.findById(userId).lean()
);
```

### Cache Invalidation

```javascript
// Strategy: Delete cache when data changes
async function updateUser(userId, updates) {
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });

  // Invalidate related cache keys
  await redis.del(`user:${userId}`);
  await redis.del(`user:profile:${userId}`);

  return user;
}

// Pattern: Wildcard invalidation with SCAN (non-blocking)
async function invalidateUserCache(userId) {
  const stream = redis.scanStream({ match: `user:${userId}:*`, count: 100 });
  const pipeline = redis.pipeline();

  stream.on('data', (keys) => keys.forEach(k => pipeline.del(k)));
  stream.on('end', () => pipeline.exec());
}
```

---

## Session Management

### Express Session with Redis

```javascript
// config/session.js
import session from 'express-session';
import RedisStore from 'connect-redis';
import redis from './redis.js';

export const sessionMiddleware = session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    httpOnly: true,     // Prevent XSS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax',
  },
  name: 'sid', // Don't use default 'connect.sid'
});
```

### JWT Denylist (Logout)

```javascript
// Add token to denylist on logout
async function logout(token) {
  const decoded = jwt.decode(token);
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(`denylist:${token}`, ttl, '1');
  }
}

// Check denylist in auth middleware
async function authMiddleware(req, res, next) {
  const token = extractToken(req);
  const isDenied = await redis.exists(`denylist:${token}`);
  if (isDenied) return res.status(401).json({ error: 'Token revoked' });
  // ... verify token
  next();
}
```

---

## Rate Limiting

### Sliding Window Rate Limiter

```javascript
// Allows N requests per window, uses sliding window algorithm
async function rateLimit(key, limit, windowSeconds) {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);  // Remove old entries
  pipeline.zadd(key, now, `${now}`);               // Add current request
  pipeline.zcard(key);                              // Count requests in window
  pipeline.expire(key, windowSeconds);             // Reset TTL

  const results = await pipeline.exec();
  const requestCount = results[2][1];

  return {
    allowed: requestCount <= limit,
    remaining: Math.max(0, limit - requestCount),
    resetAt: new Date(now + windowSeconds * 1000),
  };
}

// Express middleware
function rateLimitMiddleware(limit = 100, windowSeconds = 60) {
  return async (req, res, next) => {
    const key = `rate:${req.ip}:${req.path}`;
    const { allowed, remaining } = await rateLimit(key, limit, windowSeconds);

    res.setHeader('X-RateLimit-Remaining', remaining);
    if (!allowed) return res.status(429).json({ error: 'Rate limit exceeded' });
    next();
  };
}
```

---

## Pub/Sub (Real-time Events)

```javascript
// publisher.js
async function publishEvent(channel, data) {
  await redis.publish(channel, JSON.stringify({ ...data, timestamp: Date.now() }));
}

// subscriber.js — use separate connection for subscribe
const subscriber = redis.duplicate();

await subscriber.subscribe('notifications', 'orders');

subscriber.on('message', (channel, message) => {
  const data = JSON.parse(message);
  // Handle event by channel
  eventHandlers[channel]?.(data);
});
```

---

## Key Design Conventions

```
Format: {namespace}:{entity}:{id}:{field?}

Examples:
  user:123              → User object cache
  user:123:posts        → User's posts cache
  session:abc123        → Session data
  rate:192.168.1.1:/api → Rate limit counter
  denylist:jwt.token.here → Revoked token
  lock:order:456        → Distributed lock

TTL Guidelines:
  Static data (config, enums)    → 1 hour to 24 hours
  User profile                   → 5-15 minutes
  API response (list)            → 30-60 seconds
  Rate limit windows             → = window duration
  Sessions                       → = session timeout
  JWT denylist                   → = token expiry remaining
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| No TTL on keys | Memory leak, stale data | Always use `setex` or `expire` |
| Cache large objects | Memory waste, slow serialization | Store only IDs, fetch in batch |
| Synchronous cache miss cascade | Thundering herd | Use lock or `SETNX` |
| Same connection for pub/sub + commands | Blocks commands | Duplicate connection for sub |
| Storing sensitive data unencrypted | Security risk | Hash or encrypt before storing |

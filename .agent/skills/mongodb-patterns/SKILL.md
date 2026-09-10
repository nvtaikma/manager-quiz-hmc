---
name: mongodb-patterns
description: MongoDB + Mongoose design patterns. Schema design, aggregation pipelines, indexing strategy, and performance optimization. Use when designing data models or writing MongoDB queries.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# MongoDB Patterns

> **Philosophy:** Schema design is architecture. Index wrong, everything is slow.
> **Core Principle:** Model data for how you READ it, not how it exists.

---

## 🎯 Selective Reading Rule

| Section | When to Read |
|---------|-------------|
| Schema Design | Designing models / new collections |
| Query Patterns | Writing find/update operations |
| Aggregation | Complex data transformations |
| Indexing | Performance issues / slow queries |
| Anti-Patterns | Code review / refactoring |

---

## Schema Design — Mongoose

### Embedding vs Referencing Decision

```
EMBED when:
  ✅ Data is always accessed together (user + address)
  ✅ Child data doesn't grow unboundedly (< 100 items)
  ✅ Child data has no independent lifecycle

REFERENCE when:
  ✅ Data accessed independently (user, posts, comments)
  ✅ Many-to-many relationships
  ✅ Child data > 100 items (array bloat risk)
  ✅ Child data shared across parents
```

### Mongoose Schema Best Practices

```javascript
// ✅ GOOD: Typed, validated, with hooks
const UserSchema = new Schema({
  email:    { type: String, required: true, lowercase: true, index: true },
  password: { type: String, required: true, select: false }, // Never return by default
  role:     { type: String, enum: ['user','admin'], default: 'user' },
  profile: {
    name:   { type: String, trim: true },
    avatar: String,
  },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,          // Auto-adds createdAt, updatedAt
  toJSON: { virtuals: true }, // Include virtuals in JSON output
});

// Mongoose middleware for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method
UserSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};
```

### Soft Delete Pattern

```javascript
// Soft delete — never hard delete user data
const schema = new Schema({
  deletedAt: { type: Date, default: null },
});

// Filter deleted by default
schema.pre(/^find/, function() {
  this.where({ deletedAt: null });
});

Model.softDelete = async (id) =>
  Model.findByIdAndUpdate(id, { deletedAt: new Date() });
```

---

## Query Patterns

### Lean Queries (Performance)

```javascript
// ❌ SLOW: Returns full Mongoose documents with methods
const users = await User.find({ role: 'admin' });

// ✅ FAST: Plain JS objects, 2-5x faster, less memory
const users = await User.find({ role: 'admin' }).lean();

// Use .lean() when: read-only, no need to save, API responses
// Skip .lean() when: need to call .save(), use virtuals, middleware
```

### Projection (Fetch Only What You Need)

```javascript
// ❌ Returns all fields including sensitive ones
const user = await User.findById(id);

// ✅ Only fetch needed fields
const user = await User.findById(id)
  .select('name email profile.avatar')
  .lean();
```

### Pagination

```javascript
// Cursor-based (preferred for large datasets)
const feed = await Post.find({ createdAt: { $lt: cursor } })
  .sort({ createdAt: -1 })
  .limit(20)
  .lean();

// Offset-based (simple, ok for small datasets)
const page = await Post.find()
  .sort({ createdAt: -1 })
  .skip((pageNum - 1) * pageSize)
  .limit(pageSize)
  .lean();
```

---

## Aggregation Pipeline

### Pattern: Stats Dashboard

```javascript
const stats = await Order.aggregate([
  // Stage 1: Filter
  { $match: { status: 'completed', createdAt: { $gte: startDate } } },

  // Stage 2: Group and compute
  { $group: {
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
    totalRevenue: { $sum: '$amount' },
    orderCount:   { $sum: 1 },
    avgOrder:     { $avg: '$amount' },
  }},

  // Stage 3: Sort
  { $sort: { _id: 1 } },

  // Stage 4: Reshape output
  { $project: {
    date: '$_id',
    totalRevenue: { $round: ['$totalRevenue', 2] },
    orderCount: 1,
    avgOrder: { $round: ['$avgOrder', 2] },
    _id: 0,
  }},
]);
```

### Pattern: Lookup (JOIN)

```javascript
const postsWithAuthors = await Post.aggregate([
  { $match: { published: true } },
  { $lookup: {
    from:         'users',
    localField:   'authorId',
    foreignField: '_id',
    as:           'author',
    pipeline: [  // Sub-pipeline to filter fields
      { $project: { name: 1, email: 1, 'profile.avatar': 1 } }
    ],
  }},
  { $unwind: '$author' },  // Convert array to object
]);
```

---

## Indexing Strategy

### Index Decision Tree

```
Query filters on field X?
  YES → Create index on X
  NO  → Skip

Multiple fields in query?
  → Compound index — order matters: { filterField: 1, sortField: 1 }

Text search?
  → Text index: { $text: { $search: "..." } }

Geo queries?
  → 2dsphere index

TTL (auto-expire)?
  → TTL index: { expireAfterSeconds: 3600 }
```

### Common Indexes

```javascript
// Compound: supports queries on email alone AND email+role
UserSchema.index({ email: 1, role: 1 });

// Sparse: only index documents where field exists
UserSchema.index({ googleId: 1 }, { sparse: true });

// TTL: auto-delete sessions after 7 days
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

// Text search
ProductSchema.index({ name: 'text', description: 'text' });
```

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| `find().where(id)` in loop | N+1 queries | Use `$in` or aggregation |
| No `.lean()` on read-only | 2-5x slower, more memory | Add `.lean()` |
| Unbounded array growth | Document > 16MB limit | Use separate collection |
| No indexes on filter fields | Full collection scan | Add compound index |
| `findOne({})` without filter | Random document returned | Always pass filter |
| Storing passwords in plain text | Security breach | bcrypt before save |

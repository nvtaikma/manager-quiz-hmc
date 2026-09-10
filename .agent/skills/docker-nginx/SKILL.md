---
name: docker-nginx
description: Docker containerization and Nginx reverse proxy patterns. Dockerfile best practices, Docker Compose multi-service setup, Nginx config for Next.js/Node apps, SSL termination.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Docker + Nginx Patterns

> **Philosophy:** Build once, run anywhere. Infrastructure as code.
> **Core Principle:** Containers for isolation, Nginx for traffic management.

---

## 🎯 Selective Reading Rule

| Section | When to Read |
|---------|-------------|
| Dockerfile | Containerizing an app |
| Docker Compose | Multi-service local dev |
| Nginx Config | Reverse proxy, SSL setup |
| Production Stack | Deploy to VPS |

---

## Dockerfile Best Practices

### Next.js Multi-Stage Build

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Runner (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Express API Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]
```

---

## Docker Compose (Full Stack)

```yaml
# docker-compose.yml
version: '3.9'

services:
  frontend:
    build:
      context: ./frontend
      target: runner
    env_file: ./frontend/.env
    depends_on:
      - api
    restart: unless-stopped

  api:
    build: ./api
    env_file: ./api/.env
    environment:
      - MONGODB_URI=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      mongo:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  mongo:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/sites:/etc/nginx/conf.d:ro
      - certbot_certs:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - api
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
  certbot_certs:
```

---

## Nginx Configuration

### Reverse Proxy for Next.js + API

```nginx
# nginx/sites/app.conf
upstream nextjs  { server frontend:3000; }
upstream express { server api:5000; }

server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;  # Force HTTPS
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_session_cache   shared:SSL:10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000" always;

    # API routes → Express
    location /api {
        proxy_pass         http://express;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js static files → cache aggressively
    location /_next/static {
        proxy_pass http://nextjs;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # All other routes → Next.js
    location / {
        proxy_pass         http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/m;
    location /api/auth {
        limit_req zone=api burst=5 nodelay;
        proxy_pass http://express;
    }
}
```

---

## .dockerignore

```
node_modules
.next
.git
*.log
.env
.env.*
!.env.example
coverage
dist
README.md
```

---

## Useful Commands

```bash
# Dev: build + start all services
docker compose up --build -d

# View logs
docker compose logs -f api

# Exec into container
docker compose exec api sh

# Validate Nginx config
docker compose exec nginx nginx -t

# Reload Nginx without restart
docker compose exec nginx nginx -s reload

# Remove all containers + volumes (DANGER: deletes data)
docker compose down -v
```

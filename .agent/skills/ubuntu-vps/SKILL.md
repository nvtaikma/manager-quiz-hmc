---
name: ubuntu-vps
description: Ubuntu VPS setup, security hardening, Nginx configuration, PM2 process management, SSL certificates, and basic monitoring. Use when deploying to a Linux VPS.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Ubuntu VPS Management

> **Philosophy:** Secure by default. Every open port is an attack surface.
> **Core Principle:** Automate repetitive ops. Document everything that's manual.

---

## 🎯 Selective Reading Rule

| Section | When to Read |
|---------|-------------|
| Initial Setup | First-time VPS configuration |
| UFW Firewall | Security hardening |
| Nginx | Web server + reverse proxy |
| PM2 | Node.js process management |
| SSL | HTTPS with Let's Encrypt |
| Monitoring | Health checks, logs |

---

## Initial Server Setup

```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Create non-root user
adduser deploy
usermod -aG sudo deploy

# 3. Copy SSH key to new user
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# 4. Disable root login + password auth
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no
# Set: PubkeyAuthentication yes
systemctl restart sshd

# 5. Install essentials
apt install -y git curl wget unzip fail2ban

# 6. Install Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 20
nvm use 20
npm install -g pm2
```

---

## UFW Firewall

```bash
# Default deny all incoming
ufw default deny incoming
ufw default allow outgoing

# Allow essential ports only
ufw allow 22/tcp      # SSH (consider changing to non-standard port)
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS

# Enable
ufw enable
ufw status verbose

# If using Docker (manage ports via Docker, not UFW)
# Docker bypasses UFW — use iptables rules or ufw-docker
```

---

## Nginx Setup

```bash
apt install -y nginx
systemctl enable nginx

# Test config
nginx -t

# Reload without downtime
systemctl reload nginx
```

```nginx
# /etc/nginx/sites-available/myapp
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req zone=general burst=20 nodelay;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## SSL with Let's Encrypt (Certbot)

```bash
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d example.com -d www.example.com

# Auto-renewal (already scheduled by certbot, verify)
systemctl status certbot.timer

# Test renewal
certbot renew --dry-run
```

---

## PM2 Process Management

```bash
# Start app
pm2 start src/server.js --name api --env production

# Ecosystem file (recommended)
pm2 start ecosystem.config.cjs

# Auto-start on reboot
pm2 startup
pm2 save

# Common commands
pm2 status         # List processes
pm2 logs api       # Stream logs
pm2 restart api    # Restart
pm2 reload api     # Zero-downtime reload
pm2 stop api       # Stop
```

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'api',
    script: 'src/server.js',
    instances: 'max',      // Use all CPU cores
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
    },
    error_file: './logs/error.log',
    out_file:   './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '512M',
  }],
};
```

---

## Basic Monitoring

```bash
# System resources
htop
df -h           # Disk usage
free -m         # Memory

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs --lines 100

# Check open ports
ss -tlnp

# Fail2ban status (blocks brute force)
fail2ban-client status sshd
```

---

## Deployment Script

```bash
#!/bin/bash
# deploy.sh — Run on VPS to update app

set -e  # Exit on any error

APP_DIR="/var/www/myapp"
cd $APP_DIR

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🔄 Reloading app (zero-downtime)..."
pm2 reload ecosystem.config.cjs --env production

echo "🧪 Health check..."
sleep 3
curl -f http://localhost:5000/health || { echo "❌ Health check failed!"; pm2 logs --lines 20; exit 1; }

echo "✅ Deploy successful!"
```

---

## Security Checklist

```
[ ] Root SSH login disabled
[ ] Password auth disabled (SSH keys only)
[ ] UFW enabled with minimal open ports
[ ] fail2ban installed and running
[ ] Nginx rate limiting configured
[ ] SSL certificate installed and auto-renewing
[ ] .env file not in git, readable by app user only (chmod 600 .env)
[ ] Node.js running as non-root user
[ ] MongoDB/Redis not exposed to public (bind to localhost only)
```

# Deployment Guide

## Overview

This guide covers deploying the Visitor Management System using Docker on an on-premise server with Cloudflare Tunnel for secure public access.

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- **RAM**: Minimum 4GB, recommended 8GB
- **Storage**: Minimum 20GB free space
- **CPU**: 2+ cores recommended
- **Network**: Static IP address

### Software Requirements

- Docker 24.0+
- Docker Compose 2.20+
- Git
- Cloudflared (for Cloudflare Tunnel)

## Installation

### 1. Install Docker

```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install -y docker.io docker-compose-plugin

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (logout and login after)
sudo usermod -aG docker $USER
```

### 2. Install Cloudflared

```bash
# Download cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared

# Make executable
chmod +x cloudflared

# Move to PATH
sudo mv cloudflared /usr/local/bin/

# Verify installation
cloudflared --version
```

### 3. Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd visitor-management-system
```

### 4. Configure Environment

```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit environment files
nano apps/api/.env
nano apps/web/.env
```

**Important Environment Variables:**

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/vms_prod
JWT_SECRET=<generate-strong-secret>
NEXTAUTH_SECRET=<generate-strong-secret>
CORS_ORIGIN=https://your-domain.com

# apps/web/.env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXTAUTH_SECRET=<same-as-api>
NEXTAUTH_URL=https://your-domain.com
```

Generate secrets:

```bash
# Generate random secret
openssl rand -base64 32
```

## Docker Deployment

### 1. Build and Start Services

```bash
# Build all services
docker-compose -f docker/docker-compose.yml build

# Start services in detached mode
docker-compose -f docker/docker-compose.yml up -d

# Verify services are running
docker-compose -f docker/docker-compose.yml ps
```

### 2. Initialize Database

```bash
# Run database migrations
docker-compose -f docker/docker-compose.yml exec api npm run db:migrate

# Seed database with initial data (optional)
docker-compose -f docker/docker-compose.yml exec api npm run db:seed
```

### 3. Verify Deployment

```bash
# Check API health
curl http://localhost:3001/health

# Check web app
curl http://localhost:3000
```

## Cloudflare Tunnel Setup

### 1. Authenticate with Cloudflare

```bash
# Login to Cloudflare
cloudflared tunnel login

# This will open a browser for authentication
# Select the domain you want to use
```

### 2. Create a Tunnel

```bash
# Create a new tunnel
cloudflared tunnel create vms-tunnel

# Note the tunnel ID from the output
```

### 3. Configure Tunnel

Create a configuration file:

```bash
# Create config directory
mkdir -p ~/.cloudflared

# Create config file
nano ~/.cloudflared/config.yml
```

Add the following configuration:

```yaml
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  # Web app
  - hostname: vms.yourdomain.com
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true

  # API
  - hostname: api.vms.yourdomain.com
    service: http://localhost:3001
    originRequest:
      noTLSVerify: true

  # Catch-all rule (required)
  - service: http_status:404
```

### 4. Add DNS Records

```bash
# Route traffic to your tunnel
cloudflared tunnel route dns vms-tunnel vms.yourdomain.com
cloudflared tunnel route dns vms-tunnel api.vms.yourdomain.com
```

### 5. Start the Tunnel

```bash
# Run the tunnel
cloudflared tunnel run vms-tunnel

# Or run as a service
sudo cloudflared service install
sudo systemctl start cloudflared
```

### 6. Verify Tunnel

```bash
# Test web app
curl https://vms.yourdomain.com

# Test API
curl https://api.vms.yourdomain.com/health
```

## Production Configuration

### 1. Update Environment Variables

```bash
# apps/api/.env
DATABASE_URL=postgresql://postgres:<strong-password>@postgres:5432/vms_prod
JWT_SECRET=<strong-random-secret>
NEXTAUTH_SECRET=<strong-random-secret>
CORS_ORIGIN=https://vms.yourdomain.com
NODE_ENV=production

# apps/web/.env
NEXT_PUBLIC_API_URL=https://api.vms.yourdomain.com
NEXTAUTH_SECRET=<same-as-api>
NEXTAUTH_URL=https://vms.yourdomain.com
```

### 2. Update Docker Compose for Production

Create a production docker-compose file:

```bash
cp docker/docker-compose.yml docker/docker-compose.prod.yml
```

Edit `docker/docker-compose.prod.yml`:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    container_name: vms-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: vms_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vms-network

  redis:
    image: redis:7-alpine
    container_name: vms-redis
    restart: always
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - vms-network

  api:
    build:
      context: .
      dockerfile: docker/Dockerfile.api
    container_name: vms-api
    restart: always
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/vms_prod
      - API_PORT=3001
      - CORS_ORIGIN=https://vms.yourdomain.com
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NODE_ENV=production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - vms-network

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.web
    container_name: vms-web
    restart: always
    environment:
      - NEXT_PUBLIC_API_URL=https://api.vms.yourdomain.com
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=https://vms.yourdomain.com
      - NODE_ENV=production
    depends_on:
      - api
    networks:
      - vms-network

volumes:
  postgres_data:
  redis_data:

networks:
  vms-network:
    driver: bridge
```

### 3. Deploy Production

```bash
# Set strong passwords
export POSTGRES_PASSWORD=$(openssl rand -base64 32)
export JWT_SECRET=$(openssl rand -base64 32)
export NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Build and start production services
docker-compose -f docker/docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker/docker-compose.prod.yml exec api npm run db:migrate
```

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose -f docker/docker-compose.prod.yml exec postgres pg_dump -U postgres vms_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker/docker-compose.prod.yml exec -T postgres psql -U postgres vms_prod < backup.sql
```

### Automated Backups

Create a backup script:

```bash
nano /opt/vms-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/vms"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f /path/to/docker-compose.prod.yml exec -T postgres pg_dump -U postgres vms_prod > $BACKUP_DIR/vms_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/vms_$DATE.sql

# Delete old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$KEEP_DAYS -delete
```

Make executable and add to cron:

```bash
chmod +x /opt/vms-backup.sh
crontab -e
# Add: 0 2 * * * /opt/vms-backup.sh
```

## Monitoring

### View Logs

```bash
# All services
docker-compose -f docker/docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker/docker-compose.prod.yml logs -f api
docker-compose -f docker/docker-compose.prod.yml logs -f web
```

### Health Checks

```bash
# API health
curl https://api.vms.yourdomain.com/health

# Web app
curl -I https://vms.yourdomain.com
```

### Resource Usage

```bash
# Docker stats
docker stats

# Disk usage
df -h
docker system df
```

## Troubleshooting

### Common Issues

**Database Connection Error**

```bash
# Check PostgreSQL is running
docker-compose -f docker/docker-compose.prod.yml ps postgres

# Check logs
docker-compose -f docker/docker-compose.prod.yml logs postgres

# Test connection
docker-compose -f docker/docker-compose.prod.yml exec postgres psql -U postgres -d vms_prod
```

**API Not Starting**

```bash
# Check API logs
docker-compose -f docker/docker-compose.prod.yml logs api

# Check environment variables
docker-compose -f docker/docker-compose.prod.yml exec api env
```

**Cloudflare Tunnel Issues**

```bash
# Check tunnel status
cloudflared tunnel info vms-tunnel

# Restart tunnel
sudo systemctl restart cloudflared

# Check tunnel logs
sudo journalctl -u cloudflared
```

**SSL Certificate Issues**

```bash
# Cloudflare handles SSL automatically
# If using custom certificates, ensure they're valid
openssl x509 -in cert.pem -text -noout
```

### Performance Issues

**High Memory Usage**

```bash
# Check container memory
docker stats --format "table {{.Name}}\t{{.MemUsage}}"

# Restart services
docker-compose -f docker/docker-compose.prod.yml restart
```

**Slow Database Queries**

```bash
# Check slow queries
docker-compose -f docker/docker-compose.prod.yml exec postgres psql -U postgres -d vms_prod -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

## Updates

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker/docker-compose.prod.yml up -d --build

# Run migrations if needed
docker-compose -f docker/docker-compose.prod.yml exec api npm run db:migrate
```

### Updating Docker Images

```bash
# Pull latest images
docker-compose -f docker/docker-compose.prod.yml pull

# Restart with new images
docker-compose -f docker/docker-compose.prod.yml up -d
```

## Security Checklist

- [ ] Use strong, unique passwords for database
- [ ] Generate secure JWT secrets
- [ ] Enable HTTPS via Cloudflare
- [ ] Restrict API access with rate limiting
- [ ] Regular database backups
- [ ] Monitor server resources
- [ ] Keep Docker and dependencies updated
- [ ] Review access logs regularly

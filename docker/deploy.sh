#!/bin/bash
# Deployment script for Aptech Group VMS
# Run this script on the production server

set -e

# Configuration
APP_DIR="/opt/vms"
BACKUP_DIR="/opt/vms/backups"
LOG_FILE="/var/log/vms-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
  echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Pre-flight checks
log "${YELLOW}=== Aptech Group VMS Deployment ===${NC}"
log ""

# Check required commands
for cmd in docker docker-compose git; do
  if ! command_exists $cmd; then
    log "${RED}Error: $cmd is not installed${NC}"
    exit 1
  fi
done

# Navigate to app directory
cd "$APP_DIR" || {
  log "${RED}Error: Cannot access $APP_DIR${NC}"
  exit 1
}

# Pull latest changes
log "${YELLOW}Pulling latest changes...${NC}"
git pull origin main

# Create backup
log "${YELLOW}Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql.gz"
docker-compose -f docker/docker-compose.yml exec -T postgres pg_dump -U postgres vms_prod | gzip > "$BACKUP_FILE"
log "Backup created: $BACKUP_FILE"

# Stop existing containers
log "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker/docker-compose.yml down

# Build and start containers
log "${YELLOW}Building and starting containers...${NC}"
docker-compose -f docker/docker-compose.yml up -d --build

# Wait for services to be healthy
log "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 30

# Run database migrations
log "${YELLOW}Running database migrations...${NC}"
docker-compose -f docker/docker-compose.yml exec -T api npx prisma db push

# Check health
log "${YELLOW}Checking health...${NC}"
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  log "${GREEN}API is healthy!${NC}"
else
  log "${RED}API health check failed!${NC}"
  log "Response: $HEALTH"
  exit 1
fi

# Clean up old backups (keep last 7 days)
log "${YELLOW}Cleaning old backups...${NC}"
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

log "${GREEN}=== Deployment Complete ===${NC}"
log ""
log "Services:"
log "  - Web: http://localhost:3000"
log "  - API: http://localhost:3001"
log "  - Health: http://localhost:3001/health"

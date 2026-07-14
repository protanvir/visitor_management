#!/bin/bash
# Rollback script for Aptech Group VMS
# Use this script to rollback to a previous version

set -e

# Configuration
APP_DIR="/opt/vms"
BACKUP_DIR="/opt/vms/backups"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
  echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file> [git_commit_hash]"
  echo ""
  echo "Options:"
  echo "  backup_file      - Path to database backup file"
  echo "  git_commit_hash  - Optional: Git commit hash to rollback to"
  echo ""
  echo "Available backups:"
  ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null || echo "No backups found"
  echo ""
  echo "Recent git commits:"
  cd "$APP_DIR" && git log --oneline -10
  exit 1
fi

BACKUP_FILE="$1"
GIT_COMMIT="${2:-HEAD}"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  log "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
  exit 1
fi

log "${YELLOW}=== Aptech Group VMS Rollback ===${NC}"
log "Backup file: $BACKUP_FILE"
log "Git commit: $GIT_COMMIT"
log ""

# Confirm rollback
read -p "⚠️  This will rollback the application. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log "Rollback cancelled."
  exit 1
fi

cd "$APP_DIR"

# Stop existing containers
log "${YELLOW}Stopping existing containers...${NC}"
docker-compose -f docker/docker-compose.yml down

# Rollback git
log "${YELLOW}Rolling back git to $GIT_COMMIT...${NC}"
git checkout "$GIT_COMMIT"

# Restore database
log "${YELLOW}Restoring database...${NC}"
gunzip -c "$BACKUP_FILE" | docker-compose -f docker/docker-compose.yml exec -T postgres psql -U postgres -d vms_prod

# Build and start containers
log "${YELLOW}Building and starting containers...${NC}"
docker-compose -f docker/docker-compose.yml up -d --build

# Wait for services
log "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 30

# Check health
log "${YELLOW}Checking health...${NC}"
HEALTH=$(curl -s http://localhost:3001/health)
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  log "${GREEN}Rollback successful! API is healthy.${NC}"
else
  log "${RED}Rollback may have issues - API health check failed!${NC}"
  log "Response: $HEALTH"
fi

log "${GREEN}=== Rollback Complete ===${NC}"

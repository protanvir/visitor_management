#!/bin/bash
# Database backup script for Aptech Group VMS
# Run this script regularly to backup your PostgreSQL database

# Configuration
BACKUP_DIR="/backups/vms"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="vms_dev"
DB_USER="postgres"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/vms_backup_$TIMESTAMP.sql.gz"

echo "=== Aptech Group VMS Database Backup ==="
echo "Timestamp: $TIMESTAMP"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""

# Perform backup
echo "Starting backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✅ Backup completed successfully!"
    echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo "❌ Backup failed!"
    exit 1
fi

# Clean old backups
echo ""
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "vms_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "✅ Cleanup completed!"

# List current backups
echo ""
echo "Current backups:"
ls -lh "$BACKUP_DIR"/vms_backup_*.sql.gz 2>/dev/null | tail -5

echo ""
echo "=== Backup Complete ==="

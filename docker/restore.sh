#!/bin/bash
# Database restore script for Aptech Group VMS
# Use this script to restore from a backup

# Configuration
BACKUP_DIR="/backups/vms"
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="vms_dev"
DB_USER="postgres"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/vms_backup_*.sql.gz 2>/dev/null
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "=== Aptech Group VMS Database Restore ==="
echo "Backup file: $BACKUP_FILE"
echo "Target database: $DB_NAME"
echo ""

# Confirm restore
read -p "⚠️  This will overwrite the current database. Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

# Drop existing database
echo "Dropping existing database..."
dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME --if-exists

# Create new database
echo "Creating new database..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

# Restore from backup
echo "Restoring from backup..."
gunzip -c "$BACKUP_FILE" | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Restore completed successfully!"
else
    echo ""
    echo "❌ Restore failed!"
    exit 1
fi

echo ""
echo "=== Restore Complete ==="

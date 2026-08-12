#!/usr/bin/env bash
# Nightly backup of the Postgres database and uploaded files.
# Dumps go to BACKUP_DIR, kept for RETENTION_DAYS and then rotated out.
#
# Setup on the server (run once): chmod +x scripts/backup.sh
# Cron (daily at 03:00):
#   0 3 * * * /path/to/Baumgertner/scripts/backup.sh >> /var/log/portfolio-backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/baumgertner}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
UPLOADS_VOLUME="${UPLOADS_VOLUME:-baumgertner_uploads}"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR"

echo "[$TIMESTAMP] Starting backup..."

docker compose exec -T db pg_dump -U postgres portfolio | gzip > "$BACKUP_DIR/db-$TIMESTAMP.sql.gz"
echo "  Database dumped: db-$TIMESTAMP.sql.gz"

docker run --rm \
  -v "$UPLOADS_VOLUME":/data:ro \
  -v "$BACKUP_DIR":/backup \
  alpine tar czf "/backup/uploads-$TIMESTAMP.tar.gz" -C /data .
echo "  Uploads archived: uploads-$TIMESTAMP.tar.gz"

find "$BACKUP_DIR" -name "db-*.sql.gz" -mtime "+$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -mtime "+$RETENTION_DAYS" -delete

echo "[$TIMESTAMP] Backup complete. Kept: $(ls -1 "$BACKUP_DIR" | wc -l) file(s), retention ${RETENTION_DAYS}d."

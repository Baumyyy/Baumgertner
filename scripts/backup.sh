#!/usr/bin/env bash
# Nightly backup of the Postgres database.
# Dumps go to BACKUP_DIR, kept for RETENTION_DAYS and then rotated out.
#
# It used to archive an uploads volume too. The upload routes were removed
# and nothing writes there any more - but `docker run -v` CREATES a named
# volume that does not exist, so the step kept succeeding and kept writing
# an empty tarball every night: silent, pointless growth in the very
# directory disk-alert.sh watches.
#
# Setup on the server (run once): chmod +x scripts/backup.sh
# Cron (daily at 03:00):
#   0 3 * * * /path/to/Baumgertner/scripts/backup.sh >> /var/log/portfolio-backup.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/baumgertner}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

mkdir -p "$BACKUP_DIR"
cd "$PROJECT_DIR"

echo "[$TIMESTAMP] Starting backup..."

docker compose exec -T db pg_dump -U postgres portfolio | gzip > "$BACKUP_DIR/db-$TIMESTAMP.sql.gz"
echo "  Database dumped: db-$TIMESTAMP.sql.gz"

find "$BACKUP_DIR" -name "db-*.sql.gz" -mtime "+$RETENTION_DAYS" -delete

# Rotates out the empty uploads tarballs this script used to write, so an
# existing server does not keep them for ever once it picks up this change.
find "$BACKUP_DIR" -name "uploads-*.tar.gz" -delete

echo "[$TIMESTAMP] Backup complete. Kept: $(ls -1 "$BACKUP_DIR" | wc -l) file(s), retention ${RETENTION_DAYS}d."

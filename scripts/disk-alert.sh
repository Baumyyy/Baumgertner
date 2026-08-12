#!/usr/bin/env bash
# Emails an alert if disk usage on MOUNT crosses THRESHOLD percent.
# Reuses the same Resend account already configured for contact-form
# notifications (RESEND_API_KEY / NOTIFICATION_EMAIL in .env).
#
# Setup on the server (run once): chmod +x scripts/disk-alert.sh
# Cron (hourly):
#   0 * * * * /path/to/Baumgertner/scripts/disk-alert.sh >> /var/log/disk-alert.log 2>&1

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_DIR/.env" ]; then
  # Read as plain KEY=VALUE lines rather than sourcing, so a value
  # containing $, backticks, etc. is never interpreted as shell code.
  # Strips \r too, in case the file has Windows (CRLF) line endings.
  while IFS='=' read -r key value; do
    key="${key%$'\r'}"
    value="${value%$'\r'}"
    [[ -z "$key" || "$key" == \#* ]] && continue
    export "$key=$value"
  done < "$PROJECT_DIR/.env"
fi

THRESHOLD="${DISK_ALERT_THRESHOLD:-80}"
MOUNT="${DISK_ALERT_MOUNT:-/}"

USAGE=$(df --output=pcent "$MOUNT" | tail -1 | tr -d ' %')

if [ "$USAGE" -lt "$THRESHOLD" ]; then
  echo "OK: disk usage on $MOUNT is ${USAGE}% (threshold ${THRESHOLD}%)"
  exit 0
fi

echo "WARNING: disk usage on $MOUNT is ${USAGE}% (threshold ${THRESHOLD}%)"

if [ -z "${RESEND_API_KEY:-}" ] || [ -z "${NOTIFICATION_EMAIL:-}" ]; then
  echo "Cannot send email alert: RESEND_API_KEY or NOTIFICATION_EMAIL not set"
  exit 1
fi

curl -s -X POST 'https://api.resend.com/emails' \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H 'Content-Type: application/json' \
  -d "{\"from\":\"${RESEND_FROM:-Portfolio <onboarding@resend.dev>}\",\"to\":\"$NOTIFICATION_EMAIL\",\"subject\":\"Disk usage warning: ${USAGE}%\",\"html\":\"<p>Disk usage on <strong>$MOUNT</strong> is at <strong>${USAGE}%</strong>, above the ${THRESHOLD}% threshold.</p><p>Check the server before it fills up.</p>\"}" \
  > /dev/null

echo "Alert email sent to $NOTIFICATION_EMAIL"

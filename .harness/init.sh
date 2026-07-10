#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$REPO_ROOT/web"
BASE_URL="http://127.0.0.1:3000"
LOG_FILE="${TMPDIR:-/tmp}/infini-web.log"
PID_FILE="$REPO_ROOT/.harness/dev.pid"

cd "$WEB_DIR"

if [ ! -d node_modules ]; then
    bun install --frozen-lockfile
fi

if curl -sf "$BASE_URL" >/dev/null 2>&1; then
    echo "dev server already running at $BASE_URL"
    exit 0
fi

echo "starting dev server..."
nohup bun run dev >"$LOG_FILE" 2>&1 &
DEV_PID=$!
echo "$DEV_PID" >"$PID_FILE"

for _ in $(seq 1 30); do
    if curl -sf "$BASE_URL" >/dev/null 2>&1; then
        echo "dev server ready at $BASE_URL (pid $DEV_PID; recorded in $PID_FILE)"
        exit 0
    fi
    sleep 1
done

kill "$DEV_PID" >/dev/null 2>&1 || true
rm -f "$PID_FILE"
echo "ERROR: dev server did not become ready at $BASE_URL within 30s; see $LOG_FILE" >&2
exit 1

#!/usr/bin/env bash
set -euo pipefail
umask 077

REPO_ROOT="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)"
WEB_DIR="$REPO_ROOT/web"
AGENT_DIR="$REPO_ROOT/canvas-agent"
WEB_URL="http://127.0.0.1:51309"
AGENT_URL="http://127.0.0.1:17371"
LOG_DIR="$REPO_ROOT/.harness/logs"
WEB_LOG="$LOG_DIR/web.log"
AGENT_LOG="$LOG_DIR/canvas-agent.log"
WEB_PID_FILE="$REPO_ROOT/.harness/web.pid"
AGENT_PID_FILE="$REPO_ROOT/.harness/canvas-agent.pid"

mkdir -p "$LOG_DIR"

port_owned_by() {
    local port="$1"
    local expected_dir="$2"
    local pid line

    while IFS= read -r pid; do
        [ -n "$pid" ] || continue
        while IFS= read -r line; do
            if [[ "$line" == n* ]] && [ "${line#n}" = "$expected_dir" ]; then
                return 0
            fi
        done < <(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null)
    done < <(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null)

    return 1
}

if [ ! -d "$WEB_DIR/node_modules" ]; then
    bun install --cwd "$WEB_DIR" --frozen-lockfile --ignore-scripts
fi

if [ ! -d "$AGENT_DIR/node_modules" ]; then
    bun install --cwd "$AGENT_DIR" --frozen-lockfile --ignore-scripts
fi

if curl -sf "$WEB_URL" >/dev/null 2>&1; then
    if ! port_owned_by 51309 "$WEB_DIR"; then
        echo "ERROR: port 51309 is occupied by a process outside $WEB_DIR" >&2
        exit 1
    fi
    echo "web server already running at $WEB_URL"
else
    echo "starting web server..."
    nohup bun run --cwd "$WEB_DIR" dev >"$WEB_LOG" 2>&1 &
    WEB_PID=$!
    echo "$WEB_PID" >"$WEB_PID_FILE"
    for _ in $(seq 1 30); do
        if curl -sf "$WEB_URL" >/dev/null 2>&1; then
            echo "web server ready at $WEB_URL (pid $WEB_PID)"
            break
        fi
        sleep 1
    done
    if ! curl -sf "$WEB_URL" >/dev/null 2>&1; then
        kill "$WEB_PID" >/dev/null 2>&1 || true
        rm -f "$WEB_PID_FILE"
        echo "ERROR: web server did not become ready; see $WEB_LOG" >&2
        exit 1
    fi
fi

if curl -sf "$AGENT_URL/health" >/dev/null 2>&1; then
    if ! port_owned_by 17371 "$AGENT_DIR"; then
        echo "ERROR: port 17371 is occupied by a process outside $AGENT_DIR" >&2
        exit 1
    fi
    echo "Canvas Agent already running at $AGENT_URL"
else
    echo "starting Canvas Agent..."
    nohup bun --cwd "$AGENT_DIR" src/index.ts >"$AGENT_LOG" 2>&1 &
    AGENT_PID=$!
    echo "$AGENT_PID" >"$AGENT_PID_FILE"
    for _ in $(seq 1 30); do
        if curl -sf "$AGENT_URL/health" >/dev/null 2>&1; then
            echo "Canvas Agent ready at $AGENT_URL (pid $AGENT_PID)"
            break
        fi
        sleep 1
    done
    if ! curl -sf "$AGENT_URL/health" >/dev/null 2>&1; then
        kill "$AGENT_PID" >/dev/null 2>&1 || true
        rm -f "$AGENT_PID_FILE"
        echo "ERROR: Canvas Agent did not become ready; see $AGENT_LOG" >&2
        exit 1
    fi
fi

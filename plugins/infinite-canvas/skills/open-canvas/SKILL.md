---
name: open-canvas
description: Open the Infinite Canvas web canvas and auto-connect to the local Canvas Agent. Use when the user asks to open, start, enter, or use Infinite Canvas or the canvas.
---

# Open Infinite Canvas

When the user asks to open, start, enter, or use Infinite Canvas, do not hand the URL to the user to copy manually, and do not click "New Canvas" in the browser. Prefer to quickly launch the local canvas and local Canvas Agent, then directly open the URL with `mode`, `agentUrl`, and `agentToken` so the web page auto-creates or selects a canvas and connects the Agent.

## Default Opening Method

- New canvas: `<canvas-web-address>/canvas?mode=new#agentUrl=<Local URL>&agentToken=<Connect token>`
- Recent canvas: `<canvas-web-address>/canvas?mode=recent#agentUrl=<Local URL>&agentToken=<Connect token>`
- Choose: `<canvas-web-address>/canvas?mode=choose#agentUrl=<Local URL>&agentToken=<Connect token>`

Default opens a new local canvas; only switch to the corresponding mode when the user explicitly requests an online address, recent canvas, or manual selection.

## Workflow

1. If the current repo is the Infinite Canvas project, prefer using the current repo's `web/` frontend.
2. First check local port ownership: if the default port `51309` is already occupied, you must use `lsof`/`ps` or service output to confirm the listening process's working directory belongs to the current repo's `web/`; do not treat it as the local canvas just because the port exists.
3. If a Vite dev server for the current repo already exists, reuse it and record the real canvas address, e.g. `http://localhost:51309`.
4. If no current repo service is running, start the local canvas dev server, default by running `bun run dev` under `web/`; if the default port is occupied by another project, start with a free port, e.g. `bunx vite --host 0.0.0.0 --port <free-port>`. Do not run builds or tests.
5. Before starting the local Canvas Agent, if `canvas-agent/node_modules` does not exist, first run `bun install --cwd canvas-agent --frozen-lockfile --ignore-scripts`; do not rely on Bun runtime to auto-install; then run with the real canvas address from steps 3/4: `CANVAS_URL=<real-canvas-address> bun --cwd canvas-agent src/index.ts`. If the Agent is already running, read `~/.infinite-canvas/canvas-agent.json` or `/config` to get the `Local URL` and token.
6. Read the `Local URL` and `Connect token` from the Agent output or config; do not ask the user to copy manually.
7. Do not use the local Agent's `/open` redirect; directly construct and open the final URL: `<real-canvas-address>/canvas?mode=new#agentUrl=<Local URL>&agentToken=<Connect token>`.
8. The canvas web page will auto-create a specific canvas, open the local Agent panel, and connect to the local Agent; do not use browser clicks to create a new canvas.
9. After opening, use `canvas_get_state` to check whether the canvas is connected; if not yet connected, wait a moment and check again; do not switch to the online site unless the user explicitly requests it.

## Plugin-Only Installation

- If the current workspace is not the Infinite Canvas source repo, first prompt the user to open or start the Infinite Canvas web page, then connect to the local Agent.
- You can use the online canvas address or a user-provided local address as `<canvas-web-address>`, but still obtain the token through the local Canvas Agent before opening the final URL.
- Do not assume the user has installed this repo's dependencies; the plugin's MCP uses the published Canvas Agent via `npx -y @basketikun/canvas-agent@0.1.0 mcp`.

Do not ask the user to manually fill in URLs, tokens, or copy JSON.

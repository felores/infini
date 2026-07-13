# Infinite Canvas Agent

The local Canvas Agent connects the canvas web page to Codex / Claude Code on the user's computer. During local development, connect to `http://localhost:51309` first; no need to use the online site beforehand.

## Startup

For local development, prefer running the current source directly with Bun:

```bash
cd canvas-agent
bun install
bun src/index.ts
```

After startup, it outputs the local address and token:

```txt
Local URL: http://127.0.0.1:17371
Connect token: xxxxxx
```

Click `Agent` in the top-right corner of the canvas, enter the address and token, then connect.

The Codex app plugin reads the Local URL and Connect token from the startup output and directly opens the canvas web address; the Canvas Agent does not generate the canvas open URL.

The Canvas Agent only listens on `127.0.0.1` by default. After the web page connects with the correct token for the first time, the Canvas Agent records that page's Origin; subsequently, other Origins cannot reuse this local Agent unless the user clears `origins` in `~/.infinite-canvas/canvas-agent.json`.

## Publishing

`canvas-agent` uses its own `package.json` version number, independent of the repo root `VERSION`. After pushing to `main`, GitHub Actions checks whether the current package version already exists on npm; it only publishes `@basketikun/canvas-agent` if it does not exist.

Before publishing, configure `NPM_TOKEN` in the GitHub repo Secrets.

## Codex MCP

If you want the Codex terminal to directly operate the canvas, you must first register the Canvas Agent as a Codex MCP.

Running the current repo source directly only starts the local Agent service; it does not install the MCP, nor does it increase the Codex tool context. The published `@basketikun/canvas-agent@0.1.0` is reserved for plugin MCP use only; the Agent source version with the latest security hardening is `0.1.1`; do not use the old package to start the local Agent before publishing. Only after installing the Codex app plugin, or manually running `codex mcp add`, will the `infinite-canvas` tools enter the Codex context; since there are many tools, it is recommended to remove them when not in use.

Remove via plugin installation:

```bash
codex plugin remove infinite-canvas
```

Remove manually added MCP:

```bash
codex mcp remove infinite-canvas
```

### Codex App Plugin

A Codex app plugin is provided in the repo: `plugins/infinite-canvas`. After adding this repo's marketplace in the Codex app, you can install the `Infinite Canvas` plugin; the plugin registers the same `infinite-canvas` MCP and includes canvas operation instructions.

When adding a local marketplace, use the repo's absolute path to avoid Codex failing to resolve from other working directories:

```bash
cd /path/to/infinite-canvas
codex plugin marketplace add "$(pwd)"
codex plugin add infinite-canvas@infinite-canvas-local
```

The plugin starts the MCP via npm by default; this command only provides MCP tools, does not write the MCP to global config, and does not auto-uninstall on exit:

```bash
npx -y @basketikun/canvas-agent@0.1.0 mcp
```

When using, you can simply say "Open Infinite Canvas" in Codex; the plugin will prioritize starting the local canvas and local Agent, read the Local URL and Connect token, then directly open the canvas web address to create and connect a canvas. If auto-connection fails, check whether both the local canvas service and Canvas Agent are running.

After the Canvas Agent starts, add the MCP to Codex:

```bash
codex mcp add infinite-canvas -- npx -y @basketikun/canvas-agent@0.1.0 mcp
```

For development in this repo, you can change it to (for actual use, replace with your machine's absolute path):

```bash
codex mcp add infinite-canvas -- bun /path/to/infinite-canvas/canvas-agent/src/index.ts mcp
```

The Canvas Agent source is written in TypeScript; the MCP protocol layer uses the official `@modelcontextprotocol/sdk`, and tool parameters are described with `zod`.

If you want the terminal Codex to not get stuck on MCP approval, you can set auto-approval for this MCP in `~/.codex/config.toml`:

```toml
[mcp_servers.infinite-canvas]
command = "npx"
args = ["-y", "@basketikun/canvas-agent@0.1.0", "mcp"]
default_tools_approval_mode = "approve"
```

Available tools:

- `canvas_get_state`
- `canvas_get_selection`
- `canvas_export_snapshot`
- `canvas_apply_ops`
- `canvas_create_text_node`
- `canvas_create_image_prompt_flow`

`canvas_apply_ops` example:

```json
{
  "ops": [
    {
      "type": "add_node",
      "nodeType": "text",
      "title": "Title",
      "position": { "x": 0, "y": 0 },
      "metadata": { "content": "Text content" }
    }
  ]
}
```

## Sidebar Codex

The local panel sends prompts to the Canvas Agent. The Canvas Agent uses the official `@openai/codex` CLI's `codex app-server --stdio` to start and reuse the same Codex thread; on startup it injects the `infinite-canvas` MCP config and auto-approves MCP approvals, while actual canvas modifications are still confirmed a second time by the web sidebar.

The sidebar displays structured events returned by Codex such as `thread.started`, `turn.started`, `item.*`, `turn.completed`; when it receives the app-server's `item/agentMessage/delta`, the Canvas Agent converts it to `item.updated`, and the web page uses the same message for real streaming updates, with tool details collected into the run log.

Images uploaded or pasted in the sidebar are first sent to the local Canvas Agent, which temporarily writes them to local files and passes them to Codex as app-server `localImage` input; the frontend shows attachment size, with a single request body limit of 30MB.

## Claude Code

The Claude Code Adapter code is temporarily retained, but the current web sidebar only exposes Codex. When the Claude entry is opened in the future, the Canvas Agent will call the local `claude -p --output-format stream-json` and forward streaming JSON events to the sidebar.

If you want Claude Code to also operate the canvas, you must add the same MCP to Claude Code. Use user scope to avoid the Canvas Agent not finding the config when started from different directories:

```bash
claude mcp add --scope user --transport stdio infinite-canvas -- npx -y @basketikun/canvas-agent@0.1.0 mcp
```

For development in this repo, you can change to:

```bash
claude mcp add --scope user --transport stdio infinite-canvas -- bun /path/to/infinite-canvas/canvas-agent/src/index.ts mcp
```

The Canvas Agent calls Claude Code with `--allowedTools mcp__infinite-canvas__*` by default; canvas write operations are still confirmed by the web sidebar.

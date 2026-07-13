# Infinite Canvas Codex Plugin

This plugin packages Infinite Canvas's local Canvas Agent MCP for use with the Codex app, allowing Codex to open local canvases, read current nodes, create content, and trigger generation flows.

## Installation

### AI Auto-Install

Send the following to Codex:

```text
Please install the Infinite Canvas Codex plugin from https://github.com/basketikun/infinite-canvas.git.
Clone the repository to ~/plugins/infinite-canvas, confirm plugins/infinite-canvas/.codex-plugin/plugin.json exists,
add plugins/infinite-canvas to the personal marketplace, first run codex plugin marketplace add ~,
then run codex plugin add infinite-canvas@personal.
After installation, verify the plugin and tell me whether I need to start a new conversation to load the new skill and MCP tools.
```

### Manual Install

Recommended: clone the repository to the location Codex's personal marketplace references by default:

```bash
mkdir -p ~/plugins
git clone https://github.com/basketikun/infinite-canvas.git ~/plugins/infinite-canvas
```

Ensure `~/.agents/plugins/marketplace.json` has an Infinite Canvas entry, noting that `path` points to the plugin subdirectory inside the repo:

```json
{
  "name": "personal",
  "interface": {
    "displayName": "Personal"
  },
  "plugins": [
    {
      "name": "infinite-canvas",
      "source": {
        "source": "local",
        "path": "./plugins/infinite-canvas/plugins/infinite-canvas"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

Then register the personal marketplace and install the plugin:

```bash
codex plugin marketplace add ~
codex plugin add infinite-canvas@personal
```

After installation, it is recommended to start a new Codex conversation so the new skill and MCP tools load fully.

Installing the Codex plugin loads the `infinite-canvas` MCP. This MCP has many built-in tools, which increase Codex context and token consumption; when not using the plugin, it is recommended to remove it:

```bash
codex plugin remove infinite-canvas
```

If you also manually ran `codex mcp add`, remove the manually added MCP as well:

```bash
codex mcp remove infinite-canvas
```

### Dev Debug in This Repo

If you are debugging the plugin within the Infinite Canvas repo, you can directly add the repo's own marketplace. Use the repo's absolute path to avoid Codex failing to resolve from other working directories:

```bash
cd /path/to/infinite-canvas
codex plugin marketplace add "$(pwd)"
codex plugin add infinite-canvas@infinite-canvas-local
```

## Usage

1. After creating a new Codex thread, say "Open Infinite Canvas".
2. The plugin checks whether the local canvas service for the current repo is running; if the port is occupied, it checks the process owner and will not treat another project's `51309` as Infinite Canvas.
3. After confirming or starting, the plugin directly opens the new canvas URL and auto-connects to the local Agent.
4. Once the canvas is open, ask Codex to read or operate on the current canvas.

Common prompts:

```text
Open Infinite Canvas
Read the current canvas and summarize the node structure
Create a set of image generation prompts based on selected nodes
```

## How It Works

The plugin starts the MCP via the following command by default; this command only provides MCP tools, does not write the MCP to global config, and does not auto-uninstall on exit. When the canvas needs to be opened, the `open-canvas` skill additionally starts the local Agent:

```bash
npx -y @basketikun/canvas-agent@0.1.0 mcp
```

## Manual Troubleshooting

Start the local canvas first:

```bash
cd web
bun install
bun run dev
```

Then start the local Agent. If the port is not `51309`, replace `CANVAS_URL` with the real local canvas address:

```bash
CANVAS_URL=http://localhost:51309 bun --cwd canvas-agent src/index.ts
```

For manual troubleshooting, first read the local address and token from the Agent output or `http://127.0.0.1:17371/config`, then directly open `<canvas-web-address>/canvas?mode=new#agentUrl=<Local URL>&agentToken=<Connect token>`. Do not create a canvas via page clicks; `mode=new` makes the web page auto-create a specific canvas and connect to the local Agent.

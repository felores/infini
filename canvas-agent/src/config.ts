import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const DEFAULT_PORT = 17371;
export const CONFIG_DIR = path.join(os.homedir(), ".infinite-canvas");
export const CONFIG_FILE = path.join(CONFIG_DIR, "canvas-agent.json");
export const VERSION = readPackageVersion();
export const AGENT_PROMPT = "You are helping the user operate the Infinite Canvas website. To switch site pages use site_navigate; you can jump to / (home), /canvas (my canvases), /canvas/:id (a specific canvas), /image, /video, /prompts, /assets, /config. When you need to modify the canvas, prefer the configured infinite-canvas MCP tools: first use canvas_get_state to read the current canvas, then use canvas_create_text_node, canvas_generate_text, canvas_generate_image, canvas_generate_video, canvas_generate_audio, canvas_create_generation_flow, canvas_create_config_node, canvas_run_generation, canvas_update_node, canvas_connect_nodes, etc.; for complex batch changes use canvas_apply_ops; to delete connections use delete_connections. If you are not currently on a canvas page, canvas tools will error, so use site_navigate to open a canvas first. To browse or open existing user canvases, use canvas_list_projects to get the canvas list and ids, then use site_navigate to jump to /canvas/:id. For the image workbench use workbench_image_get_config to see options and workbench_image_generate to fill a prompt and generate; the video workbench has workbench_video_get_config and workbench_video_generate; use prompts_search to search the prompt library; use assets_list to browse My Assets and assets_add to add text or image assets. When content generation is needed, call the corresponding generation tool directly without tying it to a specific business scenario. Do not simulate mouse clicks; do not ask the user to manually copy JSON.";

export type SiteWorkspaceConfig = { workspacePath: string; activeThreadId?: string; pinnedThreadIds?: string[] };
export type CanvasAgentConfig = { url: string; token: string; origins?: string[]; workspace?: SiteWorkspaceConfig };

export function loadConfig(create = false): CanvasAgentConfig {
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")) as CanvasAgentConfig;
    } catch {
        const config = { url: `http://127.0.0.1:${Number(process.env.PORT) || DEFAULT_PORT}`, token: crypto.randomBytes(18).toString("hex") };
        if (create) saveConfig(config);
        return config;
    }
}

export function saveConfig(config: CanvasAgentConfig) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
    fs.chmodSync(CONFIG_DIR, 0o700);
    fs.chmodSync(CONFIG_FILE, 0o600);
}

export function ensureSiteWorkspace(config: CanvasAgentConfig) {
    const current = config.workspace;
    if (current?.workspacePath) {
        const workspacePath = resolveWorkspacePath(current.workspacePath);
        fs.mkdirSync(workspacePath, { recursive: true });
        return { ...current, workspacePath };
    }
    const workspacePath = path.join(CONFIG_DIR, "codex-workspaces", "site");
    config.workspace = { workspacePath };
    fs.mkdirSync(workspacePath, { recursive: true });
    saveConfig(config);
    return { workspacePath };
}

export function updateSiteWorkspace(config: CanvasAgentConfig, patch: Partial<SiteWorkspaceConfig>) {
    const current = ensureSiteWorkspace(config);
    const workspacePath = patch.workspacePath ? resolveWorkspacePath(patch.workspacePath) : current.workspacePath;
    const next = { ...current, ...patch, workspacePath };
    config.workspace = { workspacePath: next.workspacePath, activeThreadId: next.activeThreadId, pinnedThreadIds: next.pinnedThreadIds };
    fs.mkdirSync(workspacePath, { recursive: true });
    saveConfig(config);
    return config.workspace;
}

function resolveWorkspacePath(value: string) {
    if (value === "~") return os.homedir();
    if (value.startsWith("~/")) return path.join(os.homedir(), value.slice(2));
    return path.resolve(value);
}

function readPackageVersion() {
    try {
        const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { version?: string };
        return pkg.version || "0.0.0";
    } catch {
        return "0.0.0";
    }
}

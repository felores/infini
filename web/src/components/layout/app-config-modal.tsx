import { App, Button, Form, Input, Modal, Progress, Select, Switch, Tabs } from "antd";
import { CircleAlert, Cloud, KeyRound, Link2, Plus, RefreshCw, ShieldCheck, Trash2, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

import { ModelPicker } from "@/components/model-picker";
import { fetchChannelModels } from "@/services/api/image";
import { syncAppDataToWebdav, type AppSyncDomainKey, type AppSyncProgressEvent } from "@/services/app-sync";
import { testWebdavConnection, WEBDAV_MANIFEST_FILE_NAME } from "@/services/webdav-sync";
import { audioFormatOptions, audioVoiceOptions, normalizeAudioSpeedValue } from "@/lib/audio-generation";
import { useAgentStore } from "@/stores/use-agent-store";
import { createLocalKieChannel, createModelChannel, defaultBaseUrlForApiFormat, filterModelsByCapability, modelOptionLabel, modelOptionsFromChannels, normalizeModelOptionValue, useConfigStore, type AiConfig, type ApiCallFormat, type ConfigTabKey, type ModelCapability, type ModelChannel } from "@/stores/use-config-store";

type ModelGroup = {
    capability: ModelCapability;
    modelKey: "imageModel" | "videoModel" | "textModel" | "audioModel";
    modelsKey: "imageModels" | "videoModels" | "textModels" | "audioModels";
    defaultLabel: string;
    optionsLabel: string;
};

type WebdavDomainProgress = {
    label: string;
    stage: string;
    current?: number;
    total?: number;
    status?: "active" | "success" | "exception";
};

const modelGroups: ModelGroup[] = [
    { capability: "image", modelKey: "imageModel", modelsKey: "imageModels", defaultLabel: "Default image model", optionsLabel: "Image model selectable options" },
    { capability: "video", modelKey: "videoModel", modelsKey: "videoModels", defaultLabel: "Default video model", optionsLabel: "Video model selectable options" },
    { capability: "text", modelKey: "textModel", modelsKey: "textModels", defaultLabel: "Default text model", optionsLabel: "Text model selectable options" },
    { capability: "audio", modelKey: "audioModel", modelsKey: "audioModels", defaultLabel: "Default audio model", optionsLabel: "Audio model selectable options" },
];

const apiFormatOptions: Array<{ label: string; value: ApiCallFormat }> = [
    { label: "OpenAI", value: "openai" },
    { label: "Gemini", value: "gemini" },
];

const webdavDomainKeys: AppSyncDomainKey[] = ["canvas", "assets", "image-workbench", "video-workbench"];
const webdavDomainLabels: Record<AppSyncDomainKey, string> = {
    canvas: "Canvas",
    assets: "My Assets",
    "image-workbench": "Image Workbench",
    "video-workbench": "Video Workbench",
};
const codexSetupSteps = [
    { title: "Option 1: Use the Codex plugin", text: "Install the Infinite Canvas plugin in the Codex app, then launch the canvas via the plugin. It will automatically start the local Canvas Agent with connection details." },
    { title: "Option 2: Run the current source", text: "Without the Codex plugin, run the command below from the repo root, then return to the web page to connect or manually enter the Local URL and Connect token.", command: "bun --cwd canvas-agent src/index.ts" },
];
const codexPluginRemoveCommand = "codex plugin remove infinite-canvas";
const codexMcpRemoveCommand = "codex mcp remove infinite-canvas";

function createWebdavDomainProgress(): Record<AppSyncDomainKey, WebdavDomainProgress> {
    return webdavDomainKeys.reduce(
        (progress, key) => ({
            ...progress,
            [key]: { label: webdavDomainLabels[key], stage: "Pending sync" },
        }),
        {} as Record<AppSyncDomainKey, WebdavDomainProgress>,
    );
}

export function AppConfigPanel({ showDoneButton = false, initialTab = "channels" }: { showDoneButton?: boolean; initialTab?: ConfigTabKey }) {
    const { message } = App.useApp();
    const [activeTab, setActiveTab] = useState<ConfigTabKey>(initialTab);
    const [loadingChannelId, setLoadingChannelId] = useState("");
    const [testingWebdav, setTestingWebdav] = useState(false);
    const [syncingWebdav, setSyncingWebdav] = useState(false);
    const [webdavSyncStatus, setWebdavSyncStatus] = useState("");
    const [webdavDomainProgress, setWebdavDomainProgress] = useState(createWebdavDomainProgress);
    const config = useConfigStore((state) => state.config);
    const webdav = useConfigStore((state) => state.webdav);
    const updateConfig = useConfigStore((state) => state.updateConfig);
    const updateWebdavConfig = useConfigStore((state) => state.updateWebdavConfig);
    const shouldPromptContinue = useConfigStore((state) => state.shouldPromptContinue);
    const setConfigDialogOpen = useConfigStore((state) => state.setConfigDialogOpen);
    const clearPromptContinue = useConfigStore((state) => state.clearPromptContinue);
    const agentUrl = useAgentStore((state) => state.url);
    const agentToken = useAgentStore((state) => state.token);
    const agentConnected = useAgentStore((state) => state.connected);
    const agentEnabled = useAgentStore((state) => state.enabled);
    const agentActivity = useAgentStore((state) => state.activity);
    const agentConnectError = useAgentStore((state) => state.connectError);
    const agentConfirmTools = useAgentStore((state) => state.confirmTools);
    const setAgentState = useAgentStore((state) => state.setAgentState);
    const connectAgent = useAgentStore((state) => state.connectAgent);
    const disconnectAgent = useAgentStore((state) => state.disconnectAgent);
    const modelOptions = config.models.map((model) => ({ label: modelOptionLabel(config, model), value: model }));
    const webdavReady = Boolean(webdav.url.trim());
    useEffect(() => setActiveTab(initialTab), [initialTab]);

    const saveConfig = (nextConfig: AiConfig) => {
        (Object.keys(nextConfig) as Array<keyof AiConfig>).forEach((key) => updateConfig(key, nextConfig[key]));
    };

    const finishConfig = () => {
        const ready = config.channels.some((channel) => channel.baseUrl.trim() && channel.apiKey.trim() && channel.models.length);
        setConfigDialogOpen(false);
        if (!ready) return;
        message.success(shouldPromptContinue ? "Settings saved. Please continue the previous request." : "Settings saved");
        clearPromptContinue();
    };

    const updateChannels = (channels: ModelChannel[]) => {
        const nextConfig = withChannels(config, channels);
        saveConfig(nextConfig);
    };

    const updateChannel = (id: string, patch: Partial<ModelChannel>) => {
        updateChannels(config.channels.map((channel) => (channel.id === id ? { ...channel, ...patch, models: patch.models ? uniqueModels(patch.models) : channel.models } : channel)));
    };

    const updateChannelApiFormat = (channel: ModelChannel, apiFormat: ApiCallFormat) => {
        const baseUrl = !channel.baseUrl.trim() || channel.baseUrl.trim() === defaultBaseUrlForApiFormat(channel.apiFormat) ? defaultBaseUrlForApiFormat(apiFormat) : channel.baseUrl;
        updateChannel(channel.id, { apiFormat, baseUrl });
    };

    const addChannel = () => {
        updateChannels([...config.channels, createModelChannel({ name: `Channel ${config.channels.length + 1}` })]);
    };

    const addLocalKieChannel = async () => {
        const agentUrl = useAgentStore.getState().url || localStorage.getItem("canvas-agent-url") || "";
        const agentToken = useAgentStore.getState().token || localStorage.getItem("canvas-agent-token") || "";
        if (!agentUrl || !agentToken) {
            message.error("Connect the Canvas Agent first (it provides the URL and token for the local KIE channel)");
            return;
        }

        // Check if KIE is already configured on the agent
        let kieKey = "";
        try {
            const health = await fetch(`${agentUrl}/health`, { headers: { "x-canvas-agent-token": agentToken } });
            const healthData = await health.json();
            if (!healthData?.kie?.configured) {
                // Prompt the user for their KIE API key
                const input = window.prompt("Enter your KIE API key (from kie.ai):");
                if (!input) return;
                kieKey = input.trim();
                // Send the key to the agent — it stores it server-side, never in browser
                const resp = await fetch(`${agentUrl}/kie/config`, {
                    method: "POST",
                    headers: { "x-canvas-agent-token": agentToken, "Content-Type": "application/json" },
                    body: JSON.stringify({ apiKey: kieKey }),
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(() => ({}));
                    message.error(`Failed to configure KIE: ${err.error || resp.statusText}`);
                    return;
                }
            }
        } catch {
            message.error("Cannot reach the Canvas Agent — is it running?");
            return;
        }

        const channel = createLocalKieChannel(agentUrl, agentToken);
        updateChannels([...config.channels, channel]);
        message.success("KIE channel added");
    };

    const deleteChannel = (id: string) => {
        if (config.channels.length <= 1) {
            message.warning("Keep at least one channel");
            return;
        }
        updateChannels(config.channels.filter((channel) => channel.id !== id));
    };

    const refreshChannelModels = async (channel: ModelChannel) => {
        if (!channel.baseUrl.trim() || !channel.apiKey.trim()) {
            message.error("Please fill in this channel's Base URL and API Key");
            return;
        }
        setLoadingChannelId(channel.id);
        try {
            const models = await fetchChannelModels(channel);
            updateChannels(config.channels.map((item) => (item.id === channel.id ? { ...item, models } : item)));
            message.success(`${channel.name} Model list updated`);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "Failed to read models");
        } finally {
            setLoadingChannelId("");
        }
    };

    const refreshAllModels = async () => {
        const runnable = config.channels.filter((channel) => channel.baseUrl.trim() && channel.apiKey.trim());
        if (!runnable.length) {
            message.error("Please fill in at least one channel's Base URL and API Key");
            return;
        }
        setLoadingChannelId("all");
        try {
            const entries = await Promise.all(runnable.map(async (channel) => [channel.id, await fetchChannelModels(channel)] as const));
            const modelMap = new Map(entries);
            updateChannels(config.channels.map((channel) => (modelMap.has(channel.id) ? { ...channel, models: modelMap.get(channel.id) || [] } : channel)));
            message.success("Model list updated");
        } catch (error) {
            message.error(error instanceof Error ? error.message : "Failed to read models");
        } finally {
            setLoadingChannelId("");
        }
    };

    const updateCapabilityModels = (group: ModelGroup, models: string[]) => {
        const next = uniqueModels(models.map((model) => normalizeModelOptionValue(model, config.channels)).filter(Boolean));
        updateConfig(group.modelsKey, next);
        if (!next.includes(config[group.modelKey])) updateConfig(group.modelKey, next[0] || "");
    };

    const testWebdav = async () => {
        if (!webdavReady) {
            message.error("Please fill in the WebDAV address first");
            return;
        }
        setTestingWebdav(true);
        try {
            await testWebdavConnection(webdav);
            message.success("WebDAV connection is available");
        } catch (error) {
            message.error(error instanceof Error ? error.message : "WebDAV Connection test failed");
        } finally {
            setTestingWebdav(false);
        }
    };

    const updateWebdavProgress = (event: AppSyncProgressEvent) => {
        setWebdavSyncStatus(event.stage);
        if (!event.domain) return;
        setWebdavDomainProgress((current) => ({
            ...current,
            [event.domain as AppSyncDomainKey]: {
                label: event.label || webdavDomainLabels[event.domain as AppSyncDomainKey],
                stage: event.stage,
                current: event.current,
                total: event.total,
                status: event.status,
            },
        }));
    };

    const syncWebdav = async () => {
        if (!webdavReady) {
            message.error("Please fill in the WebDAV address first");
            return;
        }
        setSyncingWebdav(true);
        setWebdavDomainProgress(createWebdavDomainProgress());
        setWebdavSyncStatus("Preparing sync");
        try {
            const result = await syncAppDataToWebdav(webdav, updateWebdavProgress);
            updateWebdavConfig("lastSyncedAt", result.syncedAt);
            message.success(`Sync done: ${result.projects} canvases, ${result.assets} assets, ${result.imageLogs + result.videoLogs} log entries, uploaded ${result.uploadedFiles} files ${formatBytes(result.uploadedBytes)}`);
        } catch (error) {
            setWebdavSyncStatus(error instanceof Error ? error.message : "WebDAV Sync failed");
            message.error(error instanceof Error ? error.message : "WebDAV Sync failed");
        } finally {
            setSyncingWebdav(false);
        }
    };

    const updateAgentConfig = (patch: { url?: string; token?: string }) => {
        setAgentState({ ...patch, connectError: "" });
        if (patch.url !== undefined) localStorage.setItem("canvas-agent-url", patch.url.trim().replace(/\/$/, ""));
        if (patch.token !== undefined) localStorage.setItem("canvas-agent-token", patch.token);
    };

    const toggleAgentConnection = () => (agentEnabled ? disconnectAgent({ connectError: "" }) : connectAgent());

    return (
        <>
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key as ConfigTabKey)}
                items={[
                    {
                        key: "channels",
                        label: "Channel",
                        children: (
                            <Form layout="vertical" requiredMark={false}>
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-stone-200 p-3 dark:border-stone-800">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex w-fit max-w-full flex-wrap items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                                            <CircleAlert className="size-3.5 shrink-0" />
                                            <span className="font-semibold">Important:</span>
                                            <span>After adding or fetching models, go to the "Models" tab to select which to display.</span>
                                            <Button type="link" size="small" className="h-auto p-0 text-xs font-semibold text-amber-900 dark:text-amber-100" onClick={() => setActiveTab("models")}>
                                                Go to model settings
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <Button icon={<RefreshCw className="size-4" />} loading={Boolean(loadingChannelId)} onClick={() => void refreshAllModels()}>
                                            Fetch all
                                        </Button>
                                        <Button type="primary" icon={<Plus className="size-4" />} onClick={addChannel}>
                                            Add Channel
                                        </Button>
                                        <Button icon={<Wifi className="size-4" />} loading={loadingChannelId === "all"} onClick={() => void addLocalKieChannel()}>
                                            Add KIE API Key
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {config.channels.map((channel) => (
                                        <section key={channel.id} className="rounded-lg border border-stone-200 p-3 dark:border-stone-800">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold">{channel.name || "Untitled Channel"}</div>
                                                    <div className="mt-1 text-xs text-stone-500">
                                                        {apiFormatLabel(channel.apiFormat)} · {channel.models.length} models saved
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 gap-2">
                                                    <Button size="small" loading={loadingChannelId === channel.id} onClick={() => void refreshChannelModels(channel)}>
                                                        fetch models
                                                    </Button>
                                                    <Button size="small" danger icon={<Trash2 className="size-3.5" />} onClick={() => deleteChannel(channel.id)} />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <Form.Item label="Channel name" className="mb-0">
                                                    <Input value={channel.name} onChange={(event) => updateChannel(channel.id, { name: event.target.value })} />
                                                </Form.Item>
                                                <Form.Item label="API format" className="mb-0">
                                                    <Select value={channel.apiFormat} options={apiFormatOptions} onChange={(value: ApiCallFormat) => updateChannelApiFormat(channel, value)} />
                                                </Form.Item>
                                                <Form.Item label="Base URL" className="mb-0">
                                                    <Input value={channel.baseUrl} onChange={(event) => updateChannel(channel.id, { baseUrl: event.target.value })} />
                                                </Form.Item>
                                                <Form.Item label="API Key" className="mb-0">
                                                    <Input.Password value={channel.apiKey} onChange={(event) => updateChannel(channel.id, { apiKey: event.target.value })} />
                                                </Form.Item>
                                                <Form.Item label="Model list" className="mb-0 md:col-span-2">
                                                    <Select mode="tags" showSearch allowClear maxTagCount="responsive" placeholder="Enter model names, or click to fetch models" value={channel.models} onChange={(models) => updateChannel(channel.id, { models })} />
                                                </Form.Item>
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </Form>
                        ),
                    },
                    {
                        key: "models",
                        label: "Model",
                        children: (
                            <Form layout="vertical" requiredMark={false}>
                                <div className="mb-4 rounded-lg border border-stone-200 p-3 dark:border-stone-800">
                                    <div className="text-sm font-semibold">Default models and selectable options</div>
                                    <div className="mt-1 text-xs leading-5 text-stone-500">Selectable options determine which models appear in dropdowns everywhere. Models with the same name are distinguished by their channel name in parentheses.</div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {modelGroups.map((group) => (
                                        <Form.Item key={group.modelsKey} label={group.optionsLabel} className="mb-0">
                                            <Select
                                                mode="tags"
                                                showSearch
                                                allowClear
                                                maxTagCount="responsive"
                                                placeholder={config.models.length ? `Please select or enter ${group.optionsLabel}` : "Fill in or fetch models in Channels first"}
                                                value={config[group.modelsKey]}
                                                options={modelOptions}
                                                onChange={(models) => updateCapabilityModels(group, models)}
                                            />
                                        </Form.Item>
                                    ))}
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {modelGroups.map((group) => (
                                        <Form.Item key={group.modelKey} label={group.defaultLabel} className="mb-0">
                                            <ModelPicker config={config} value={config[group.modelKey]} onChange={(model) => updateConfig(group.modelKey, model)} capability={group.capability} fullWidth />
                                        </Form.Item>
                                    ))}
                                </div>
                            </Form>
                        ),
                    },
                    {
                        key: "preferences",
                        label: "Generation Preferences",
                        children: (
                            <Form layout="vertical" requiredMark={false}>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <Form.Item label="Default canvas image generation count" extra="New canvas generation and config nodes use this by default; individual nodes can still override." className="mb-4">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={15}
                                            value={config.canvasImageCount}
                                            onChange={(event) => updateConfig("canvasImageCount", event.target.value)}
                                            onBlur={(event) => updateConfig("canvasImageCount", normalizeImageCount(event.target.value))}
                                        />
                                    </Form.Item>
                                    <Form.Item label="Default audio voice" className="mb-4">
                                        <Select value={config.audioVoice} options={audioVoiceOptions} onChange={(value) => updateConfig("audioVoice", value)} />
                                    </Form.Item>
                                    <Form.Item label="Default audio format" className="mb-4">
                                        <Select value={config.audioFormat} options={audioFormatOptions} onChange={(value) => updateConfig("audioFormat", value)} />
                                    </Form.Item>
                                    <Form.Item label="Default audio speed" className="mb-4">
                                        <Input
                                            type="number"
                                            min={0.25}
                                            max={4}
                                            step={0.05}
                                            value={config.audioSpeed}
                                            onChange={(event) => updateConfig("audioSpeed", event.target.value)}
                                            onBlur={(event) => updateConfig("audioSpeed", normalizeAudioSpeedValue(event.target.value))}
                                        />
                                    </Form.Item>
                                </div>
                                <Form.Item label="Default audio instructions" className="mb-4">
                                    <Input.TextArea rows={2} value={config.audioInstructions} placeholder="e.g. natural, warm, suitable for narration." onChange={(event) => updateConfig("audioInstructions", event.target.value)} />
                                </Form.Item>
                                <Form.Item label="System prompt" className="mb-0">
                                    <Input.TextArea rows={4} value={config.systemPrompt} placeholder="e.g. You are a visual director specializing in cinematic realistic photography." onChange={(event) => updateConfig("systemPrompt", event.target.value)} />
                                </Form.Item>
                            </Form>
                        ),
                    },
                    {
                        key: "webdav",
                        label: "WebDAV",
                        children: (
                            <Form layout="vertical" requiredMark={false}>
                                <section className="rounded-lg border border-stone-200 p-3 dark:border-stone-800">
                                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <Cloud className="size-4" />
                                                WebDAV Sync
                                            </div>
                                            <div className="mt-1 text-xs text-stone-500">Sync canvases, My Assets, generation logs, and local media files. Does not include the AI API key. The browser connects directly to the WebDAV service.</div>
                                        </div>
                                        <div className="text-xs text-stone-500">{webdav.lastSyncedAt ? `Last sync ${formatWebdavTime(webdav.lastSyncedAt)}` : "Not synced yet"}</div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Form.Item label="WebDAV address" className="mb-4">
                                            <Input value={webdav.url} placeholder="https://nas.example.com/webdav" onChange={(event) => updateWebdavConfig("url", event.target.value)} />
                                        </Form.Item>
                                        <Form.Item label="Remote directory" extra={`Data is saved in per-domain subdirectories under this directory; each directory contains ${WEBDAV_MANIFEST_FILE_NAME} and files/`} className="mb-4">
                                            <Input value={webdav.directory} placeholder="infinite-canvas" onChange={(event) => updateWebdavConfig("directory", event.target.value)} />
                                        </Form.Item>
                                        <Form.Item label="Username" className="mb-0">
                                            <Input value={webdav.username} autoComplete="username" onChange={(event) => updateWebdavConfig("username", event.target.value)} />
                                        </Form.Item>
                                        <Form.Item label="Password / app password" className="mb-0">
                                            <Input.Password value={webdav.password} autoComplete="current-password" onChange={(event) => updateWebdavConfig("password", event.target.value)} />
                                        </Form.Item>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        <Button icon={<Wifi className="size-4" />} disabled={!webdavReady || syncingWebdav} loading={testingWebdav} onClick={() => void testWebdav()}>
                                            Test connection
                                        </Button>
                                        <Button type="primary" icon={<RefreshCw className="size-4" />} disabled={!webdavReady || testingWebdav} loading={syncingWebdav} onClick={() => void syncWebdav()}>
                                            {syncingWebdav ? "Syncing" : "Sync now"}
                                        </Button>
                                        {webdavSyncStatus ? <span className="text-xs text-stone-500">{webdavSyncStatus}</span> : null}
                                    </div>
                                    {syncingWebdav || webdavSyncStatus ? <WebdavProgressGrid progress={webdavDomainProgress} /> : null}
                                </section>
                            </Form>
                        ),
                    },
                    {
                        key: "codex",
                        label: "Codex",
                        children: (
                            <Form layout="vertical" requiredMark={false}>
                                <section className="rounded-lg border border-stone-200 p-3 dark:border-stone-800">
                                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm font-semibold">
                                                <Link2 className="size-4" />
                                                Connect Local Codex
                                            </div>
                                            <div className="mt-1 text-xs text-stone-500">Used to connect the Canvas Agent to the local Codex. The Codex plugin launches the Canvas Agent.</div>
                                        </div>
                                        <div className={agentConnectError ? "text-xs text-red-600" : "text-xs text-stone-500"}>{agentConnectError ? "Connection failed" : agentConnected ? agentActivity || "Connected" : agentEnabled ? "Connecting" : "Not connected"}</div>
                                    </div>
                                    <div className="mb-4 grid gap-2 md:grid-cols-2">
                                        {codexSetupSteps.map((step, index) => (
                                            <div key={step.title} className="rounded-md border border-stone-200 p-3 dark:border-stone-800">
                                                <div className="text-xs font-semibold text-stone-500">connection method {index + 1}</div>
                                                <div className="mt-1 text-sm font-medium">{step.title}</div>
                                                <div className="mt-1 text-xs leading-5 text-stone-500">{step.text}</div>
                                                {step.command ? <code className="mt-2 block overflow-x-auto rounded bg-stone-100 px-2 py-1.5 text-[11px] text-stone-700 dark:bg-stone-900 dark:text-stone-200">{step.command}</code> : null}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                                        <div className="font-semibold">Codex plugin note</div>
                                        <div className="mt-1">Installing the Codex plugin or manually adding MCP is the only way tools enter the Codex context and increase token consumption; running the local Agent from source alone does not install MCP.</div>
                                        <code className="mt-2 block overflow-x-auto rounded bg-white/70 px-2 py-1.5 text-[11px] text-amber-900 dark:bg-black/20 dark:text-amber-100">Remove plugin: {codexPluginRemoveCommand}</code>
                                        <code className="mt-1 block overflow-x-auto rounded bg-white/70 px-2 py-1.5 text-[11px] text-amber-900 dark:bg-black/20 dark:text-amber-100">Remove manual MCP: {codexMcpRemoveCommand}</code>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Form.Item label="Local URL" className="mb-4">
                                            <Input prefix={<Link2 className="mr-1 size-4 text-stone-400" />} value={agentUrl} placeholder="http://127.0.0.1:17371" onChange={(event) => updateAgentConfig({ url: event.target.value })} />
                                        </Form.Item>
                                        <Form.Item label="Connect token" className="mb-4">
                                            <Input.Password prefix={<KeyRound className="mr-1 size-4 text-stone-400" />} value={agentToken} placeholder="Auto-discovered, or manually enter Connect token" onChange={(event) => updateAgentConfig({ token: event.target.value })} />
                                        </Form.Item>
                                    </div>
                                    {agentConnectError ? <div className="mb-3 rounded-md border border-red-200 px-3 py-2 text-xs text-red-600 dark:border-red-900/60">{agentConnectError}</div> : null}
                                    <div className="mb-3 flex justify-end">
                                        <Button type={agentEnabled ? "default" : "primary"} icon={<Wifi className="size-4" />} onClick={toggleAgentConnection}>
                                            {agentConnected ? "Disconnect" : agentEnabled ? "Cancel connection" : "Connect"}
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-stone-200 px-3 py-2 dark:border-stone-800">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <ShieldCheck className="size-4 text-stone-500" />
                                            <div>
                                                <div className="text-sm font-medium">Confirm before executing canvas operations</div>
                                                <div className="mt-0.5 text-xs text-stone-500">When enabled, Local Codex can execute canvas tool calls directly without manual confirmation.</div>
                                            </div>
                                        </div>
                                        <Switch checked={agentConfirmTools} onChange={(confirmTools) => setAgentState({ confirmTools })} />
                                    </div>
                                </section>
                            </Form>
                        ),
                    },
                ]}
            />
            {showDoneButton ? (
                <div className="mt-4 flex justify-end">
                    <Button type="primary" onClick={finishConfig}>
                        Done
                    </Button>
                </div>
            ) : null}
        </>
    );
}

export function AppConfigModal() {
    const isConfigOpen = useConfigStore((state) => state.isConfigOpen);
    const configTab = useConfigStore((state) => state.configTab);
    const setConfigDialogOpen = useConfigStore((state) => state.setConfigDialogOpen);
    return (
        <Modal
            title={
                <div>
                    <div className="text-lg font-semibold">Settings & Preferences</div>
                    <div className="mt-1 text-xs font-normal text-stone-500">Channel aggregation, model selection, and sync preferences</div>
                </div>
            }
            open={isConfigOpen}
            width={980}
            centered
            onCancel={() => setConfigDialogOpen(false)}
            styles={{ body: { maxHeight: "72vh", overflowY: "auto", paddingRight: 12 } }}
            footer={null}
        >
            <AppConfigPanel showDoneButton initialTab={configTab} />
        </Modal>
    );
}

function withChannels(config: AiConfig, channels: ModelChannel[]): AiConfig {
    const models = modelOptionsFromChannels(channels);
    const imageModels = keepOrSuggest(config.imageModels, filterModelsByCapability(models, "image"), models);
    const videoModels = keepOrSuggest(config.videoModels, filterModelsByCapability(models, "video"), models);
    const textModels = keepOrSuggest(config.textModels, filterModelsByCapability(models, "text"), models);
    const audioModels = keepOrSuggest(config.audioModels, filterModelsByCapability(models, "audio"), models);
    return {
        ...config,
        channels,
        models,
        baseUrl: channels[0]?.baseUrl || config.baseUrl,
        apiKey: channels[0]?.apiKey || config.apiKey,
        apiFormat: channels[0]?.apiFormat || config.apiFormat,
        imageModels,
        videoModels,
        textModels,
        audioModels,
        imageModel: normalizeDefaultModel(config.imageModel, imageModels),
        videoModel: normalizeDefaultModel(config.videoModel, videoModels),
        textModel: normalizeDefaultModel(config.textModel, textModels),
        audioModel: normalizeDefaultModel(config.audioModel, audioModels),
    };
}

function keepOrSuggest(current: string[], suggested: string[], allModels: string[]) {
    const available = new Set(allModels);
    const kept = uniqueModels(current).filter((model) => available.has(model));
    return kept.length ? kept : suggested;
}

function normalizeDefaultModel(value: string, options: string[]) {
    if (options.includes(value)) return value;
    return options[0] || value;
}

function normalizeImageCount(value: string) {
    return String(Math.max(1, Math.min(15, Math.floor(Math.abs(Number(value)) || 3))));
}

function uniqueModels(models: string[]) {
    return Array.from(new Set(models.map((model) => model.trim()).filter(Boolean)));
}

function apiFormatLabel(apiFormat: ApiCallFormat) {
    return apiFormat === "gemini" ? "Gemini" : "OpenAI";
}

function formatWebdavTime(value: string) {
    return new Date(value).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function WebdavProgressGrid({ progress }: { progress: Record<AppSyncDomainKey, WebdavDomainProgress> }) {
    return (
        <div className="mt-3 grid gap-2">
            {webdavDomainKeys.map((key) => {
                const item = progress[key];
                const count = item.total ? `${item.current || 0}/${item.total}` : "";
                return (
                    <div key={key} className="rounded-md border border-stone-200 px-3 py-2 dark:border-stone-800">
                        <div className="mb-1 flex min-w-0 items-center justify-between gap-3 text-xs">
                            <span className="shrink-0 font-medium text-stone-700 dark:text-stone-200">{item.label}</span>
                            <span className="min-w-0 truncate text-right text-stone-500">
                                {item.stage}
                                {count ? ` · ${count}` : ""}
                            </span>
                        </div>
                        <Progress percent={getWebdavProgressPercent(item)} size="small" status={getWebdavProgressStatus(item)} showInfo={false} />
                    </div>
                );
            })}
        </div>
    );
}

function getWebdavProgressPercent(item: WebdavDomainProgress) {
    if (item.status === "success") return 100;
    if (item.total) return Math.min(100, Math.round(((item.current || 0) / item.total) * 100));
    if (item.status === "exception") return 100;
    if (item.stage === "Pending sync") return 0;
    if (item.stage === "Reading remote manifest") return 12;
    if (item.stage === "Reading local data") return 24;
    if (item.stage === "Downloading missing media") return 36;
    if (item.stage === "Writing local merge result") return 58;
    if (item.stage === "Uploading new media") return 66;
    if (item.stage === "All media present" || item.stage === "No media to upload") return 74;
    if (item.stage.startsWith("Uploading manifest")) return 90;
    return item.status === "active" ? 30 : 0;
}

function getWebdavProgressStatus(item: WebdavDomainProgress): "normal" | "active" | "success" | "exception" {
    if (item.status === "success" || item.status === "exception") return item.status;
    return item.status === "active" ? "active" : "normal";
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

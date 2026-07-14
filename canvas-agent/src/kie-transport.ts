import http from "node:http";
import { createRequire } from "node:module";
import { CONTRACT_VERSION, PACKAGE_VERSION, createKieOpenAiRouter } from "@felores/kie-ai-openai-server";
import { loadConfig, saveConfig } from "./config.js";

const require4 = createRequire(import.meta.url);
const kieEntryPath = require4.resolve("@felores/kie-ai-openai-server");
const kiePkgDir = require4("path").dirname(kieEntryPath);
const express4: typeof import("express") = require4(require4.resolve("express", { paths: [kiePkgDir] }));

export type KieTransportInfo = {
    configured: boolean;
    packageVersion: string;
    contractVersion: string;
};

export type KieTransport = {
    proxy: (req: unknown, res: unknown, next: unknown) => void;
    close: () => void;
};

export function kieTransportInfo(): KieTransportInfo {
    const config = loadConfig();
    return {
        configured: Boolean(config.kieApiKey || process.env.KIE_AI_API_KEY),
        packageVersion: PACKAGE_VERSION,
        contractVersion: CONTRACT_VERSION,
    };
}

export function loadKieTransport(): KieTransport | null {
    const config = loadConfig();
    const apiKey = config.kieApiKey || process.env.KIE_AI_API_KEY;
    if (!apiKey) return null;
    const router = createKieOpenAiRouter({ apiKey, baseUrl: process.env.KIE_AI_BASE_URL, dataDir: process.env.KIE_AI_DATA_DIR });
    const app = express4();
    app.use(express4.json({ limit: "30mb" }));
    app.use(router as unknown as Parameters<typeof app.use>[0]);
    const server = app.listen(0, "127.0.0.1");
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    return {
        proxy: (req: unknown, res: unknown, _next: unknown) => {
            const r = req as { method?: string; path?: string; headers?: Record<string, string | string[]>; body?: unknown };
            const body = r.body !== undefined ? JSON.stringify(r.body) : "";
            const headers: Record<string, string> = {};
            if (r.headers) for (const [k, v] of Object.entries(r.headers)) if (typeof v === "string") headers[k] = v;
            if (body) { headers["content-type"] = "application/json"; headers["content-length"] = String(Buffer.byteLength(body)); }
            const proxyReq = http.request(
                { hostname: "127.0.0.1", port, path: r.path || "/", method: r.method || "GET", headers },
                (proxyRes) => {
                    const w = res as { status: (code: number) => void; setHeader: (name: string, value: string) => void };
                    w.status(proxyRes.statusCode || 200);
                    for (const [k, v] of Object.entries(proxyRes.headers)) if (typeof v === "string") w.setHeader(k, v);
                    proxyRes.pipe(res as NodeJS.WritableStream);
                },
            );
            proxyReq.on("error", () => {
                const e = res as { status: (code: number) => { json: (body: unknown) => void } };
                e.status(502).json({ error: { message: "KIE transport unavailable", type: "server_error", param: null, code: "internal_error" } });
            });
            if (body) proxyReq.write(body);
            proxyReq.end();
        },
        close: () => { router.close(); server.close(); },
    };
}

export function setKieApiKey(key: string): KieTransport | null {
    const config = loadConfig();
    config.kieApiKey = key.trim() || undefined;
    saveConfig(config);
    return loadKieTransport();
}

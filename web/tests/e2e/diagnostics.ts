import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Page, Request, Response, TestInfo } from "@playwright/test";

export type DiagnosticType = "console.error" | "pageerror" | "requestfailed" | "http-5xx";

export interface DiagnosticEntry {
    type: DiagnosticType;
    message: string;
    url?: string;
    status?: number;
    body?: string;
}

export type AllowFn = (entry: DiagnosticEntry) => boolean;

export function filterFailures(entries: DiagnosticEntry[], allow: AllowFn = () => false): DiagnosticEntry[] {
    return entries.filter((entry) => !allow(entry));
}

export function redactDiagnosticText(text: string) {
    return text
        .replace(/(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, "$1[REDACTED]")
        .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g, "[REDACTED]")
        .replace(/((?:api[_-]?key|token|authorization)\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, "$1[REDACTED]");
}

export interface DiagnosticsCollector {
    entries: DiagnosticEntry[];
    attach(page: Page): void;
    finalize(): Promise<DiagnosticEntry[]>;
}

export function createDiagnostics(testInfo: TestInfo, allow: AllowFn = () => false, outputDir = "test-results"): DiagnosticsCollector {
    const entries: DiagnosticEntry[] = [];
    const pending: Promise<void>[] = [];

    function attach(page: Page) {
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                entries.push({ type: "console.error", message: redactDiagnosticText(msg.text()), url: page.url() });
            }
        });
        page.on("pageerror", (err: Error) => {
            entries.push({ type: "pageerror", message: redactDiagnosticText(err.stack ?? err.message), url: page.url() });
        });
        page.on("requestfailed", (req: Request) => {
            entries.push({ type: "requestfailed", message: redactDiagnosticText(req.failure()?.errorText ?? "request failed"), url: req.url() });
        });
        page.on("response", (res: Response) => {
            if (res.status() >= 500) {
                const entry: DiagnosticEntry = { type: "http-5xx", message: `HTTP ${res.status()}`, url: res.url(), status: res.status() };
                entries.push(entry);
                pending.push(
                    res
                        .text()
                        .then((body) => {
                            entry.body = redactDiagnosticText(body).slice(0, 4096);
                        })
                        .catch(() => undefined),
                );
            }
        });
    }

    async function finalize(): Promise<DiagnosticEntry[]> {
        await Promise.all(pending);
        const failures = filterFailures(entries, allow);
        const body = JSON.stringify({ test: testInfo.title, entries, failures }, null, 2);
        const dir = resolve(process.cwd(), outputDir);
        await mkdir(dir, { recursive: true });
        await writeFile(resolve(dir, "browser-diagnostics.json"), body, "utf8");
        await testInfo.attach("browser-diagnostics", { body, contentType: "application/json" });
        return failures;
    }

    return { entries, attach, finalize };
}

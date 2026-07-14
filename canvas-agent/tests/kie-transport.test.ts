import assert from "node:assert/strict";
import test from "node:test";

import { kieTransportInfo, loadKieTransport } from "../src/kie-transport.js";
import { sanitizedAgentEnv } from "../src/agents.js";

test("kieTransportInfo reports unconfigured when KIE_AI_API_KEY is absent", () => {
    const prior = process.env.KIE_AI_API_KEY;
    delete process.env.KIE_AI_API_KEY;
    try {
        const info = kieTransportInfo();
        assert.equal(info.configured, false);
        assert.ok(info.packageVersion.length > 0, "packageVersion is populated from the pinned transport");
        assert.ok(info.contractVersion.length > 0, "contractVersion is populated from the pinned transport");
    } finally {
        if (prior !== undefined) process.env.KIE_AI_API_KEY = prior;
    }
});

test("kieTransportInfo reports configured when KIE_AI_API_KEY is set, without leaking the key", () => {
    const prior = process.env.KIE_AI_API_KEY;
    process.env.KIE_AI_API_KEY = "test-key-do-not-send";
    try {
        const info = kieTransportInfo();
        assert.equal(info.configured, true);
        assert.equal(JSON.stringify(info).includes("test-key-do-not-send"), false, "info surface must not leak the API key");
    } finally {
        if (prior === undefined) delete process.env.KIE_AI_API_KEY;
        else process.env.KIE_AI_API_KEY = prior;
    }
});

test("loadKieTransport returns null when unconfigured and a router when configured", () => {
    const prior = process.env.KIE_AI_API_KEY;
    const priorDataDir = process.env.KIE_AI_DATA_DIR;
    delete process.env.KIE_AI_API_KEY;
    try {
        assert.equal(loadKieTransport(), null);
    } finally {
        if (prior !== undefined) process.env.KIE_AI_API_KEY = prior;
    }

    process.env.KIE_AI_API_KEY = "test-key-do-not-send";
    process.env.KIE_AI_DATA_DIR = `/tmp/kie-test-${Date.now()}`;
    try {
        const router = loadKieTransport();
        assert.ok(router, "router is instantiated when configured");
        assert.equal(typeof router!.close, "function", "router exposes close() for shutdown");
        router!.close();
    } finally {
        if (prior === undefined) delete process.env.KIE_AI_API_KEY;
        else process.env.KIE_AI_API_KEY = prior;
        if (priorDataDir === undefined) delete process.env.KIE_AI_DATA_DIR;
        else process.env.KIE_AI_DATA_DIR = priorDataDir;
    }
});

test("sanitizedAgentEnv strips KIE_AI_* and KIE_MCP_* but preserves the rest", () => {
    const prior = { ...process.env };
    process.env.KIE_AI_API_KEY = "secret-key";
    process.env.KIE_MCP_TOKEN = "secret-token";
    process.env.KIE_AI_BASE_URL = "https://kie.test";
    process.env.PATH = prior.PATH || "/usr/bin";
    try {
        const env = sanitizedAgentEnv();
        assert.equal(env.KIE_AI_API_KEY, undefined, "KIE_AI_API_KEY stripped");
        assert.equal(env.KIE_MCP_TOKEN, undefined, "KIE_MCP_TOKEN stripped");
        assert.equal(env.KIE_AI_BASE_URL, undefined, "KIE_AI_BASE_URL stripped");
        assert.equal(env.PATH, prior.PATH || "/usr/bin", "non-KIE env preserved");
    } finally {
        for (const key of ["KIE_AI_API_KEY", "KIE_MCP_TOKEN", "KIE_AI_BASE_URL"]) {
            if (prior[key] === undefined) delete process.env[key];
            else (process.env as NodeJS.ProcessEnv)[key] = prior[key];
        }
    }
});

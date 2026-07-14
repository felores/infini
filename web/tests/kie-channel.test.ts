import { describe, expect, it } from "vitest";

import { defaultConfig, createLocalKieChannel, isLocalKieChannel, resolveModelChannel, type AiConfig } from "../src/stores/use-config-store";

describe("createLocalKieChannel", () => {
    it("builds a channel with baseUrl ending in /kie and the agent token as apiKey", () => {
        const channel = createLocalKieChannel("http://127.0.0.1:51310", "agent-token-abc");
        expect(channel.source).toBe("local-kie");
        expect(channel.baseUrl).toBe("http://127.0.0.1:51310/kie");
        expect(channel.apiKey).toBe("agent-token-abc");
        expect(channel.apiFormat).toBe("openai");
        expect(channel.models).toEqual([]);
    });

    it("trims trailing slashes from the agent URL", () => {
        const channel = createLocalKieChannel("http://127.0.0.1:51310/", "tok");
        expect(channel.baseUrl).toBe("http://127.0.0.1:51310/kie");
    });

    it("accepts an initial model list", () => {
        const channel = createLocalKieChannel("http://localhost:17371", "tok", ["nano-banana", "gpt-image-2"]);
        expect(channel.models).toEqual(["nano-banana", "gpt-image-2"]);
    });
});

describe("isLocalKieChannel", () => {
    it("returns true for a channel with source local-kie", () => {
        const channel = createLocalKieChannel("http://127.0.0.1:51310", "tok");
        expect(isLocalKieChannel(channel)).toBe(true);
    });

    it("returns false for a regular user channel", () => {
        const config: AiConfig = { ...defaultConfig };
        const channel = resolveModelChannel(config, config.imageModel);
        expect(isLocalKieChannel(channel)).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(isLocalKieChannel(undefined)).toBe(false);
    });
});

describe("resolveModelChannel with local KIE channel", () => {
    it("resolves the KIE channel when the active image model belongs to it", () => {
        const kieChannel = createLocalKieChannel("http://127.0.0.1:51310", "tok", ["nano-banana"]);
        const config: AiConfig = {
            ...defaultConfig,
            channels: [...defaultConfig.channels, kieChannel],
            imageModel: `${kieChannel.id}::nano-banana`,
        };
        const resolved = resolveModelChannel(config, config.imageModel);
        expect(isLocalKieChannel(resolved)).toBe(true);
        expect(resolved.baseUrl).toBe("http://127.0.0.1:51310/kie");
    });

    it("resolves the default channel when the model is not on a KIE channel", () => {
        const config: AiConfig = { ...defaultConfig };
        const resolved = resolveModelChannel(config, config.imageModel);
        expect(isLocalKieChannel(resolved)).toBe(false);
    });
});

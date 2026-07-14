import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { appendImageFiles, imageResponseOptions, requestEdit } from "../src/services/api/image";
import { defaultConfig, useConfigStore } from "../src/stores/use-config-store";
import { uniquePromptTags } from "../src/services/api/prompts";

beforeEach(() => {
    vi.restoreAllMocks();
});

describe("imageResponseOptions", () => {
    it("uses output_format for GPT Image models", () => {
        expect(imageResponseOptions("gpt-image-2")).toEqual({ output_format: "png" });
    });

    it("uses response_format for DALL-E models", () => {
        expect(imageResponseOptions("dall-e-3")).toEqual({ response_format: "b64_json" });
    });
});

describe("appendImageFiles", () => {
    const files = [new File(["one"], "one.png"), new File(["two"], "two.png"), new File(["three"], "three.png")];

    it("uses image for a single input", () => {
        const formData = new FormData();
        appendImageFiles(formData, files.slice(0, 1));
        expect(formData.getAll("image")).toHaveLength(1);
        expect(formData.getAll("image[]")).toHaveLength(0);
    });

    it("uses image[] for multiple inputs", () => {
        const formData = new FormData();
        appendImageFiles(formData, files);
        expect(formData.getAll("image")).toHaveLength(0);
        expect(formData.getAll("image[]")).toHaveLength(3);
    });
});

it("removes duplicate prompt tags", () => {
    expect(uniquePromptTags(["open-design", "open-design", "freestylefly"])).toEqual(["open-design", "freestylefly"]);
});

it("sends image edits as multipart to /images/edits with prompt, model, image, and mask", async () => {
    const postSpy = vi.spyOn(axios, "post").mockResolvedValue({
        data: {
            data: [{ b64_json: "aW1hZ2Uw" }],
        },
    });

    useConfigStore.setState({
        ...useConfigStore.getState(),
        config: {
            ...defaultConfig,
            channels: [
                {
                    id: "default",
                    name: "Default Channel",
                    baseUrl: "https://example.test",
                    apiKey: "test-key",
                    apiFormat: "openai",
                    models: ["gpt-image-2"],
                },
            ],
            model: "default::gpt-image-2",
            imageModel: "default::gpt-image-2",
            models: ["default::gpt-image-2"],
            imageModels: ["default::gpt-image-2"],
            baseUrl: "https://example.test",
            apiKey: "test-key",
            count: 1,
            quality: "standard",
            size: "1024x1024",
        },
    });

    const config = useConfigStore.getState().config;

    const image = {
        id: "img-1",
        name: "source.png",
        type: "image/png",
        dataUrl: "data:image/png;base64,Zm9v",
    };

    const mask = {
        id: "mask-1",
        name: "mask.png",
        type: "image/png",
        dataUrl: "data:image/png;base64,Zm9v",
    };

    await requestEdit(config, "paint a cat", [image], mask);

    const [url, payload, options] = postSpy.mock.calls[0];
    expect(url).toBe("https://example.test/v1/images/edits");
    expect(options?.headers?.Authorization).toBe("Bearer test-key");
    const prompt = (payload as FormData).get("prompt");
    expect(typeof prompt).toBe("string");
    expect(prompt).toContain("paint a cat");
    expect((payload as FormData).get("model")).toBe("gpt-image-2");
    expect((payload as FormData).get("n")).toBe("1");
    expect((payload as FormData).get("quality")).toBe("standard");
    expect((payload as FormData).get("size")).toBe("1024x1024");
    expect((payload as FormData).get("output_format")).toBe("png");
    expect((payload as FormData).get("image")).toBeInstanceOf(File);
    expect((payload as FormData).get("mask")).toBeInstanceOf(File);
});

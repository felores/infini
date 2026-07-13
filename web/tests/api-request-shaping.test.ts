import { describe, expect, it } from "vitest";

import { appendImageFiles, imageResponseOptions } from "../src/services/api/image";
import { uniquePromptTags } from "../src/services/api/prompts";

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

import { describe, expect, it } from "vitest";

import { normalizeLoopbackUrl } from "../src/lib/agent/agent-url-guard";

describe("normalizeLoopbackUrl", () => {
    it("accepts 127.0.0.1", () => {
        expect(normalizeLoopbackUrl("http://127.0.0.1:17371")).toBe("http://127.0.0.1:17371");
    });
    it("accepts localhost", () => {
        expect(normalizeLoopbackUrl("http://localhost:17371")).toBe("http://localhost:17371");
    });
    it("accepts https loopback and normalizes default port", () => {
        expect(normalizeLoopbackUrl("https://127.0.0.1:443")).toBe("https://127.0.0.1");
    });
    it("accepts IPv6 ::1", () => {
        expect(normalizeLoopbackUrl("http://[::1]:17371")).toBe("http://[::1]:17371");
    });
    it("strips trailing slash", () => {
        expect(normalizeLoopbackUrl("http://127.0.0.1:17371/")).toBe("http://127.0.0.1:17371");
    });
    it("trims whitespace", () => {
        expect(normalizeLoopbackUrl("  http://127.0.0.1:17371  ")).toBe("http://127.0.0.1:17371");
    });
    it("rejects private IP", () => {
        expect(normalizeLoopbackUrl("http://192.168.1.1:17371")).toBeNull();
    });
    it("rejects remote host", () => {
        expect(normalizeLoopbackUrl("http://example.com:17371")).toBeNull();
    });
    it("rejects non-http protocol", () => {
        expect(normalizeLoopbackUrl("ftp://127.0.0.1:17371")).toBeNull();
    });
    it("rejects empty", () => {
        expect(normalizeLoopbackUrl("")).toBeNull();
    });
    it("rejects invalid URL", () => {
        expect(normalizeLoopbackUrl("not a url")).toBeNull();
    });
    it("rejects javascript protocol", () => {
        expect(normalizeLoopbackUrl("javascript:alert(1)")).toBeNull();
    });
});

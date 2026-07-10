import { describe, expect, it } from "vitest";

import { filterFailures, type DiagnosticEntry } from "./e2e/diagnostics";

const sample: DiagnosticEntry[] = [
    { type: "console.error", message: "err1", url: "/" },
    { type: "pageerror", message: "boom" },
    { type: "requestfailed", message: "net::ERR", url: "http://x" },
    { type: "http-5xx", message: "HTTP 500", url: "http://x", status: 500 },
];

describe("filterFailures", () => {
    it("returns all entries with no allowlist", () => {
        expect(filterFailures(sample)).toHaveLength(4);
    });
    it("filters out allowlisted type", () => {
        const result = filterFailures(sample, (e) => e.type === "console.error");
        expect(result).toHaveLength(3);
        expect(result.every((e) => e.type !== "console.error")).toBe(true);
    });
    it("filters by message substring", () => {
        const result = filterFailures(sample, (e) => e.message.includes("boom"));
        expect(result).toHaveLength(3);
    });
    it("returns empty when everything is allowed", () => {
        expect(filterFailures(sample, () => true)).toHaveLength(0);
    });
    it("handles empty input", () => {
        expect(filterFailures([])).toHaveLength(0);
    });
});

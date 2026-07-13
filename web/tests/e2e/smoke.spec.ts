import { expect, test } from "@playwright/test";

import { createDiagnostics } from "./diagnostics";

test("canvas page loads with visible heading", async ({ page }) => {
    const diagnostics = createDiagnostics(test.info());
    diagnostics.attach(page);
    try {
        await page.goto("/canvas");
        await expect(page.locator("h1")).toContainText("Infinite Canvas");
    } finally {
        const failures = await diagnostics.finalize();
        expect(failures, `unallowlisted browser diagnostics: ${JSON.stringify(failures)}`).toEqual([]);
    }
});

test("captures server error response bodies", async ({ page }) => {
    await page.route("**/diagnostic-500", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "diagnostic failure" }) }));
    const diagnostics = createDiagnostics(test.info(), (entry) => entry.url?.includes("/diagnostic-500") === true || (entry.type === "console.error" && entry.message.includes("500")));
    diagnostics.attach(page);
    try {
        await page.goto("/canvas");
        await page.evaluate(() => fetch("/diagnostic-500"));
    } finally {
        expect(await diagnostics.finalize()).toEqual([]);
        expect(diagnostics.entries.find((entry) => entry.type === "http-5xx")).toMatchObject({ status: 500, body: JSON.stringify({ error: "diagnostic failure" }) });
    }
});

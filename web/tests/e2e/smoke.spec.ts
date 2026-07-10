import { expect, test } from "@playwright/test";

import { createDiagnostics } from "./diagnostics";

test("canvas page loads with visible heading", async ({ page }) => {
    const diagnostics = createDiagnostics(test.info());
    diagnostics.attach(page);
    try {
        await page.goto("/canvas");
        await expect(page.locator("h1")).toContainText("无限画布");
    } finally {
        const failures = await diagnostics.finalize();
        expect(failures, `unallowlisted browser diagnostics: ${JSON.stringify(failures)}`).toEqual([]);
    }
});

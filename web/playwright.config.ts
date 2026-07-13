import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    workers: 1,
    reporter: "html",
    outputDir: "test-results",
    use: {
        baseURL: "http://127.0.0.1:51309",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "bun run dev",
        url: "http://127.0.0.1:51309",
        reuseExistingServer: true,
        timeout: 120_000,
    },
});

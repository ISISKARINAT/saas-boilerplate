import { defineConfig, devices } from "@playwright/test";
import path from "path";

/**
 * Playwright E2E configuration.
 * Reads environment from .env.local via dotenv in global-setup.
 * Starts the Next.js dev server automatically when running tests.
 */

const BASE_URL = process.env["PLAYWRIGHT_BASE_URL"] ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Start Next.js dev server before running tests */
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
    env: {
      NODE_ENV: "test",
    },
    stdout: "ignore",
    stderr: "pipe",
  },

  globalSetup: path.resolve(__dirname, "tests/global-setup.ts"),
  globalTeardown: path.resolve(__dirname, "tests/global-teardown.ts"),
});

import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT || 5199);
/** Set to run the read-only tests against a deployed site instead (no local server is started; see e2e/helpers.ts). */
const external = process.env.E2E_BASE_URL;

/**
 * Browser tests against the local development server (it provides the simulated sign-in).
 * They use the installed Chrome, so no browser has to be downloaded. One worker only: all windows share one demo state.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 12_000 },
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: external ?? `http://127.0.0.1:${port}`,
    channel: "chrome",
    navigationTimeout: 60_000,
    trace: "retain-on-failure",
  },
  webServer: external ? undefined : {
    command: `npm run dev -- --port ${port} --strictPort`,
    url: `http://127.0.0.1:${port}/api/waterlink`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

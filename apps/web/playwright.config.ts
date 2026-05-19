import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
const viteCli = path.resolve(packageDir, "node_modules/vite/bin/vite.js");

const distIndex = path.join(packageDir, "dist", "index.html");
const distPresent = existsSync(distIndex);

/**
 * Prefer preview (4173) when `dist/` exists (typical after `pnpm run build`), matching CI stability.
 * Set PLAYWRIGHT_FORCE_DEV=1 to always use the Vite dev server (5173).
 */
const usePreview =
  process.env.PLAYWRIGHT_FORCE_DEV === "1"
    ? false
    : !!process.env.CI ||
      process.env.PLAYWRIGHT_USE_PREVIEW === "1" ||
      distPresent;
const port = usePreview ? 4173 : 5173;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;

const viteEntry = viteCli.replace(/\\/g, "/");
const webServerCommand = usePreview
  ? `node ${viteEntry} preview --host 127.0.0.1 --port ${port} --strictPort`
  : `node ${viteEntry} --host 127.0.0.1 --port ${port} --strictPort`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  timeout: 60_000,
  snapshotPathTemplate: "{testDir}/{testFileName}-snapshots/{arg}{ext}",
  expect: {
    timeout: 20_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.015,
    },
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 60_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: webServerCommand,
        url: baseURL,
        /** If something already serves `baseURL` (e.g. leftover preview), reuse it; CI still starts when URL is down. */
        reuseExistingServer: true,
        timeout: 180_000,
      },
});

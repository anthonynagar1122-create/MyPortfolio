import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

/**
 * Two projects, one per fixture value, each with its own dev server (and its
 * own distDir so the two `next dev` processes do not fight over `.next/dev`).
 * E2E_FIXTURE only ever applies to these servers; lib/db/fixture.ts refuses
 * to run it in production.
 */
// The sandbox ships a Chromium build that does not match this Playwright
// version's expected revision; use it directly when present (never run
// `playwright install` here).
const sandboxChromium = "/opt/pw-browsers/chromium";
const launchOptions = existsSync(sandboxChromium) ? { executablePath: sandboxChromium } : {};

export default defineConfig({
  testDir: "__tests__/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  webServer: [
    {
      command: "next dev -p 3000",
      url: "http://localhost:3000",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { E2E_FIXTURE: "1", NEXT_DIST_DIR: ".next-e2e-seeded" },
    },
    {
      command: "next dev -p 3001",
      url: "http://localhost:3001",
      reuseExistingServer: false,
      timeout: 120_000,
      env: { E2E_FIXTURE: "empty", NEXT_DIST_DIR: ".next-e2e-empty" },
    },
  ],
  projects: [
    {
      name: "seeded",
      testMatch: /(home|detail|forms|nav|admin|theme|heartbeat)\.spec\.ts/,
      grep: /@seeded/,
      use: { baseURL: "http://localhost:3000", launchOptions },
    },
    {
      name: "empty",
      testMatch: /home\.spec\.ts/,
      grep: /@empty/,
      use: { baseURL: "http://localhost:3001", launchOptions },
    },
  ],
});

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./__tests__",
  testMatch: "**/*.test.ts",
  reporter: "list",
  workers: 1,
});

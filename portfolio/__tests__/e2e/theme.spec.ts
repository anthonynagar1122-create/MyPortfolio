import { expect, test } from "@playwright/test";
import { contrastRatio } from "../../lib/contrast";

test.describe("theme @seeded", () => {
  test("dark colour scheme paints the dark background and muted text passes contrast @seeded", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe("rgb(15, 17, 21)");
    const muted = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--muted").trim(),
    );
    expect(contrastRatio(muted, bg)).toBeGreaterThanOrEqual(4.5);
    await context.close();
  });

  test("status colours meet 4.5:1 on the dark surface @seeded", async ({ browser }) => {
    const context = await browser.newContext({ colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto("/");
    const vars = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      const get = (n: string) => s.getPropertyValue(n).trim();
      return { surface: get("--surface"), live: get("--live"), idea: get("--idea"), building: get("--building"), danger: get("--danger") };
    });
    for (const k of ["live", "idea", "building", "danger"] as const) {
      expect(contrastRatio(vars[k], vars.surface), k).toBeGreaterThanOrEqual(4.5);
    }
    await context.close();
  });

  test("toggle switches theme, persists it, and survives reload @seeded", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    const toggle = page.getByRole("button", { name: /dark mode/i });
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe("dark");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(15, 17, 21)");
  });
});

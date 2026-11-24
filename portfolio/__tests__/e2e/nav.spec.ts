import { expect, test } from "@playwright/test";

test.describe("site navigation @seeded", () => {
  test("desktop nav links to suggest and sign-in, and navigates @seeded", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await expect(nav.locator('a[href="/suggest"]')).toBeVisible();
    await expect(nav.locator('a[href="/sign-in"]')).toBeVisible();
    await expect(nav.getByRole("link", { name: "Stats" })).toHaveAttribute("href", "/#stats");
    await nav.getByRole("link", { name: "Suggest an idea" }).click();
    await expect(page).toHaveURL(/\/suggest$/);
    await expect(page.getByRole("heading", { name: "Suggest an idea" })).toBeVisible();
  });

  test("no horizontal scroll at 375px @seeded", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 });
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );
    expect(fits).toBe(true);
  });
});

import { expect, test } from "@playwright/test";

// Signed-in admin flows cannot run here (no Clerk keys); owner-only logic and
// validation are covered by unit tests. This only proves the signed-out path.
test.describe("admin signed out @seeded", () => {
  test("/admin redirects to sign-in and ships no admin content @seeded", async ({ page, request }) => {
    const raw = await request.get("/admin", { maxRedirects: 0 });
    const html = await raw.text();
    for (const marker of ["Admin dashboard", "Download subscribers", "Confirmed subscribers", "Publish as idea"]) {
      expect(html).not.toContain(marker);
    }
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByText("Admin dashboard")).toHaveCount(0);
  });

  test("admin sub-pages redirect too @seeded", async ({ page }) => {
    for (const path of ["/admin/items", "/admin/items/new", "/admin/comments", "/admin/suggestions"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sign-in/);
    }
  });

  test("CSV export is refused when signed out @seeded", async ({ request }) => {
    const res = await request.get("/admin/subscribers/export");
    expect(res.status()).toBe(401);
    expect(await res.text()).not.toContain("@");
  });
});

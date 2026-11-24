import { expect, test } from "@playwright/test";

test.describe("item detail @seeded", () => {
  test("unknown or unpublished slug is a 404 @seeded", async ({ page }) => {
    // Status stays 200 because the shell streams before the lookup (PPR);
    // the not-found UI and a noindex robots tag are what the visitor gets.
    await page.goto("/item/not-a-real-slug");
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    await expect(page.getByText(/could not be found|not found/i).first()).toBeVisible();
    await expect(page.getByTestId("item-detail")).toHaveCount(0);
  });

  test("script comment is literal text and creates no script element @seeded", async ({ page }) => {
    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });
    await page.goto("/item/fixture-idea");
    const list = page.getByTestId("comment-list");
    await expect(list).toContainText("<script>alert(1)</script>");
    expect(await list.locator("script").count()).toBe(0);
    expect(dialogs).toEqual([]);
  });

  test("javascript: comment is plain text, not a link @seeded", async ({ page }) => {
    await page.goto("/item/fixture-idea");
    const list = page.getByTestId("comment-list");
    await expect(list).toContainText("javascript:alert(1)");
    expect(await list.locator("a").count()).toBe(0);
  });

  test("signed-out visitor sees sign-in prompts and disabled vote @seeded", async ({ page }) => {
    await page.goto("/item/fixture-idea");
    await expect(page.getByText("Sign in to comment")).toBeVisible();
    await expect(page.getByRole("textbox")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /I want this/ })).toBeDisabled();
    await expect(page.getByRole("link", { name: "Sign in to vote" })).toBeVisible();
    await expect(page.getByText("What would you pay?")).toHaveCount(0);
  });

  test("project detail links to live_url and shows header @seeded", async ({ page }) => {
    await page.goto("/item/fixture-project");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fixture project");
    const link = page.getByRole("link", { name: /Open project/ });
    await expect(link).toHaveAttribute("href", "https://example.com/fixture-project");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});

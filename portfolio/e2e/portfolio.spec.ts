import { expect, test } from "@playwright/test";

test("homepage presents the corporate portfolio", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Independent products.");
  await expect(page.getByRole("link", { name: /Explore our products/i })).toBeVisible();
});

for (const [slug, productName] of [
  ["routemaster", "RouteMaster"],
  ["fufaji", "Fufaji"],
  ["funds-for-family", "Funds for Family"],
] as const) {
  test(`product page /apps/${slug} renders`, async ({ page }) => {
    const response = await page.goto(`/apps/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(productName);
  });
}

test("product directory links to canonical app routes", async ({ page }) => {
  const response = await page.goto("/products");
  expect(response?.status()).toBe(200);
  await expect(page.locator('a[href="/apps/routemaster"]')).toBeVisible();
  await expect(page.locator('a[href="/apps/fufaji"]')).toBeVisible();
});

test("contact page exposes a usable enquiry form", async ({ page }) => {
  const response = await page.goto("/contact");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toContainText("Let's build something useful.");
  await expect(page.getByLabel("Name *")).toBeVisible();
  await expect(page.getByLabel("Email *")).toBeVisible();
  await expect(page.getByLabel("Message *")).toBeVisible();
});

test("privacy and terms pages render", async ({ page }) => {
  for (const path of ["/privacy", "/terms"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("mobile navigation opens and exposes product links", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.locator("#mobile-navigation").getByRole("link", { name: "Products" })).toBeVisible();
});

import { expect, test } from "@playwright/test";

test("a page load POSTs a heartbeat @seeded", async ({ page }) => {
  const req = page.waitForRequest((r) => r.url().endsWith("/api/heartbeat") && r.method() === "POST");
  await page.goto("/");
  const request = await req;
  expect(request.postData()).toBe("{}");
});

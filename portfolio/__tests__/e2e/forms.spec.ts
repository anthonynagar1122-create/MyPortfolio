import { expect, test } from "@playwright/test";

test.describe("suggest form @seeded", () => {
  test("title only shows an inline description error and sends no request @seeded", async ({ page }) => {
    const calls: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/suggestions")) calls.push(r.url());
    });
    await page.goto("/suggest");
    await page.getByLabel("Title").fill("An idea");
    await page.getByRole("button", { name: "Send suggestion" }).click();
    const desc = page.getByLabel("Description");
    await expect(desc).toHaveAttribute("aria-invalid", "true");
    const ids = ((await desc.getAttribute("aria-describedby")) ?? "").split(" ");
    expect(ids).toContain("description-error");
    await expect(page.locator("#description-error")).toContainText(/description/i);
    expect(calls).toEqual([]);
  });

  test("valid suggestion posts the fields and shows the success message @seeded", async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route("**/api/suggestions", async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ status: 201, json: { ok: true } });
    });
    await page.goto("/suggest");
    await page.getByLabel("Title").fill("Offline maps");
    await page.getByLabel("Description").fill("Maps that work without signal.");
    await page.getByLabel("Contact email").fill("me@example.com");
    await page.getByLabel("Budget range").selectOption("under_10");
    await page.getByRole("button", { name: "Send suggestion" }).click();
    await expect(page.getByRole("status")).toContainText(/thanks/i);
    expect(body).toMatchObject({
      title: "Offline maps",
      description: "Maps that work without signal.",
      contact_email: "me@example.com",
      budget_range: "under_10",
      credit_ok: false,
    });
  });

  test("server field errors are shown inline @seeded", async ({ page }) => {
    await page.route("**/api/suggestions", (route) =>
      route.fulfill({ status: 400, json: { ok: false, error: "Please fix the highlighted fields", fields: { title: "Title must be 1-100 characters" } } }),
    );
    await page.goto("/suggest");
    await page.getByLabel("Title").fill("x");
    await page.getByLabel("Description").fill("y");
    await page.getByRole("button", { name: "Send suggestion" }).click();
    await expect(page.getByText("Title must be 1-100 characters")).toBeVisible();
  });
});

test.describe("subscribe form @seeded", () => {
  test("unticked consent sends no request @seeded", async ({ page }) => {
    const calls: string[] = [];
    page.on("request", (r) => {
      if (r.url().includes("/api/subscribe")) calls.push(r.url());
    });
    await page.goto("/suggest");
    const form = page.getByRole("form", { name: "Subscribe to updates" });
    await form.getByLabel("Email", { exact: true }).fill("a@example.com");
    await form.getByRole("button", { name: "Subscribe" }).click();
    const consent = form.getByRole("checkbox");
    await expect(consent).toHaveAttribute("aria-invalid", "true");
    await expect(consent).toHaveAttribute("aria-describedby", /.+/);
    await expect(form.getByRole("link", { name: /privacy/i })).toHaveAttribute("href", "/privacy");
    expect(calls).toEqual([]);
  });

  test("new and existing emails show identical text @seeded", async ({ page }) => {
    const message = "Thanks! If this address can be subscribed, a confirmation email is on its way.";
    const emails: string[] = [];
    await page.route("**/api/subscribe", async (route) => {
      emails.push(route.request().postDataJSON().email);
      await route.fulfill({ status: 200, json: { ok: true, message } });
    });
    const texts: string[] = [];
    for (const email of ["new@example.com", "existing@example.com"]) {
      await page.goto("/suggest");
      const form = page.getByRole("form", { name: "Subscribe to updates" });
      await form.getByLabel("Email", { exact: true }).fill(email);
      await form.getByRole("checkbox").check();
      await form.getByRole("button", { name: "Subscribe" }).click();
      texts.push((await form.getByRole("status").innerText()).trim());
    }
    expect(emails).toEqual(["new@example.com", "existing@example.com"]);
    expect(texts[0]).toBe(texts[1]);
    expect(texts[0]).toContain("confirmation email");
  });

  test("confirmed page renders @seeded", async ({ page }) => {
    await page.goto("/subscribe/confirmed");
    await expect(page.getByRole("heading", { name: /subscri/i })).toBeVisible();
  });
});

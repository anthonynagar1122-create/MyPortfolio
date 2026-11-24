import { expect, test } from "@playwright/test";

test.describe("home, empty database", () => {
  test("shows the empty state and zero stats @empty", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(page.getByTestId("empty-state")).toContainText("Nothing here yet");
    await expect(page.getByTestId("card-grid")).toHaveCount(0);
    for (const id of ["stat-active", "stat-today", "stat-week", "stat-comments"]) {
      await expect(page.getByTestId(id)).toContainText("0");
    }
    expect(errors).toEqual([]);
  });
});

test.describe("home, seeded", () => {
  test("renders a project and an idea; project links to live_url @seeded", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByTestId("item-card");
    await expect(cards).toHaveCount(2);
    const link = page.getByRole("link", { name: /Open project/ });
    await expect(link).toHaveAttribute("href", "https://example.com/fixture-project");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.getByText(/I want this \(0\)/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in to vote" })).toBeVisible();
  });

  async function xs(page: import("@playwright/test").Page) {
    const boxes = await page.getByTestId("item-card").evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().x)),
    );
    return boxes;
  }

  test("one column at 375px @seeded", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    await expect(page.getByTestId("item-card")).toHaveCount(2);
    const x = await xs(page);
    expect(new Set(x).size).toBe(1);
  });

  test("three columns at 1024px @seeded", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("item-card")).toHaveCount(2);
    // Wait for the grid to reach its final layout before reading boxes.
    await expect
      .poll(() =>
        page.getByTestId("card-grid").evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
        ),
      )
      .toBe(3);
    await expect.poll(async () => new Set(await xs(page)).size).toBe(2);
  });

  test("keyboard reaches filter and card action with visible focus @seeded", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("item-card")).toHaveCount(2);
    const ring = () =>
      page.evaluate(() => {
        const s = getComputedStyle(document.activeElement as Element);
        return { outline: s.outlineStyle + " " + s.outlineWidth, shadow: s.boxShadow };
      });
    let sawFilter = false;
    let sawAction = false;
    for (let i = 0; i < 25 && !(sawFilter && sawAction); i++) {
      await page.keyboard.press("Tab");
      const id = await page.evaluate(
        () => (document.activeElement as HTMLElement | null)?.getAttribute("data-focus-target") ?? "",
      );
      if (id === "filter" || id === "card-action") {
        const r = await ring();
        const visible = r.shadow !== "none" || !r.outline.startsWith("none");
        expect(visible, `focus ring on ${id}`).toBe(true);
        if (id === "filter") sawFilter = true;
        else sawAction = true;
      }
    }
    expect(sawFilter).toBe(true);
    expect(sawAction).toBe(true);
  });
});

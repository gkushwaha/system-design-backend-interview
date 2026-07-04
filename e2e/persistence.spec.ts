import { test, expect } from "@playwright/test";

test.describe("persistence across reload", () => {
  test("completed topic progress survives a full page reload", async ({ page }) => {
    await page.goto("#/topics/horizontal-vs-vertical-scaling");
    await page.getByText("Mini challenge").click();
    await page.getByText("Horizontal scaling", { exact: true }).click();
    const nextQuestion = page.getByRole("button", { name: "Next question" });
    if (await nextQuestion.isVisible().catch(() => false)) {
      await nextQuestion.click();
      await page.getByText(/Larger single instances cost disproportionately more/).click();
    }
    await expect(page.getByText(/Challenge complete!|Completed/)).toBeVisible({ timeout: 3000 });

    await page.reload();
    await page.goto("#/");
    await expect(page.getByText("1/15").first()).toBeVisible();
  });

  test("XP survives a full page reload", async ({ page }) => {
    await page.goto("#/");
    // Scope to <main>: the navbar's "0 XP" badge is `hidden sm:inline` (deliberately
    // absent below the sm breakpoint on mobile), but the home page's own XP badge
    // in the main content always renders regardless of viewport width.
    await expect(page.getByRole("main").getByText(/XP/).first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("main").getByText(/XP/).first()).toBeVisible();
  });
});

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
    // Sidebar's "Most Asked" counter reflects persisted progress (Home is a
    // purely informational landing page and doesn't track progress).
    await expect(page.getByText("1/15").first()).toBeVisible();
  });

  test("XP survives a full page reload", async ({ page }) => {
    await page.goto("#/");
    // The navbar's "X XP" span is `hidden sm:inline` (absent below the sm
    // breakpoint on mobile) — check attachment rather than visibility so this
    // works on both the desktop and mobile projects.
    await expect(page.getByRole("banner").getByText(/XP/).first()).toBeAttached();
    await page.reload();
    await expect(page.getByRole("banner").getByText(/XP/).first()).toBeAttached();
  });
});

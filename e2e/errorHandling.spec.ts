import { test, expect } from "@playwright/test";

test.describe("error handling", () => {
  test("unknown topic slug shows a 'not found' message, not a crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("#/topics/this-topic-does-not-exist-xyz");
    await expect(page.getByText(/Topic not found/i)).toBeVisible();
    await expect(page.getByText(/Back to skill tree/i)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("unknown problem slug shows a 'not found' message, not a crash", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("#/problems/this-problem-does-not-exist-xyz");
    await expect(page.getByText(/Problem not found/i)).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("direct deep-link to a tier-locked Expert topic still renders (locking is a discovery gate in the sidebar/skill tree, not page-level access control), without crashing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // Expert topic, locked in the sidebar/skill tree by default (requires 20 Advanced complete).
    await page.goto("#/topics/crdts");
    await expect(page.getByRole("heading", { name: "CRDTs" })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

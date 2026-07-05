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

  test("direct deep-link to an Expert topic renders without crashing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("#/topics/crdts");
    await expect(page.getByRole("heading", { name: "CRDTs" })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

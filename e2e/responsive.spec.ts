import { test, expect } from "@playwright/test";

test.describe("responsive layout", () => {
  test("mobile — home page has no horizontal overflow and sidebar is hidden behind a hamburger", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("#/");

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for subpixel rounding

    const hamburger = page.getByLabel("Toggle menu");
    await expect(hamburger).toBeVisible();
    // The closed drawer is translated off-screen (not display:none, so it can
    // slide in), so assert the real user-facing signals instead of toBeHidden():
    // it's positioned off-canvas and marked inert/aria-hidden for AT + keyboard.
    const sidebarText = page.getByText("Backend Interview Prep");
    const box = await sidebarText.boundingBox();
    expect(box && box.x < 0).toBe(true);
    await expect(page.locator("aside")).toHaveAttribute("aria-hidden", "true");

    await hamburger.click();
    await expect(page.getByText("Backend Interview Prep")).toBeVisible();
    await expect(page.locator("aside")).not.toHaveAttribute("aria-hidden", "true");
  });

  test("mobile — topic page tab bar is scrollable, not overflowing the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("#/topics/circuit-breaker");
    await expect(page.getByRole("heading", { name: "Circuit breaker pattern" })).toBeVisible();
    for (const tab of ["Visual", "How it works", "Tradeoffs", "Interview answer", "Mini challenge"]) {
      await expect(page.getByText(tab, { exact: true })).toBeAttached();
    }
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("tablet — layout renders the static sidebar without overflow", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("#/");
    await expect(page.getByText("Backend Interview Prep")).toBeVisible();
    // In-app navigation (not a full reload) triggers App.tsx's AnimatePresence
    // crossfade, which keeps the outgoing and incoming route both mounted for
    // ~150ms — .first() avoids a strict-mode clash with the departing page.
    await page.goto("#/map");
    await expect(page.getByRole("heading", { name: "Skill Tree" }).first()).toBeVisible();
  });
});

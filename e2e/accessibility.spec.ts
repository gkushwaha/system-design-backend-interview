import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["#/", "#/map", "#/topics/load-balancers", "#/problems/url-shortener", "#/reference", "#/interview"];

test.describe("accessibility", () => {
  test("keyboard navigation on home page reaches interactive elements with visible focus", async ({ page }) => {
    await page.goto("#/");
    // On touch-emulated devices (mobile project), the very first Tab sometimes
    // lands on <body> instead of advancing focus — a known Chromium touch-emulation
    // quirk, not an app bug. Press again if that happens before asserting.
    await page.keyboard.press("Tab");
    let active = await page.evaluate(() => document.activeElement?.tagName);
    if (active === "BODY") {
      await page.keyboard.press("Tab");
      active = await page.evaluate(() => document.activeElement?.tagName);
    }
    expect(["A", "BUTTON"]).toContain(active);
  });

  for (const route of routes) {
    test(`axe accessibility scan — ${route}`, async ({ page }) => {
      // MotionConfig reducedMotion="user" (src/main.tsx) makes framer-motion honor this,
      // so continuously-looping decorative animations (packet flight, pulse effects) hold
      // a steady frame instead of axe sampling colors mid-transition.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      await page.waitForLoadState("networkidle"); // lazy-loaded route chunks finish fetching
      // App.tsx's outer PageTransition still fades content in via opacity (not a transform,
      // so reducedMotion doesn't suppress it) — a fixed timeout raced this on slow chunk
      // loads and let axe sample a mid-fade frame, where every foreground/background pair
      // converges toward black and produces flaky false-positive color-contrast violations.
      // Poll actual computed opacity instead of guessing a delay.
      await page.waitForFunction(() => {
        const el = document.querySelector("main > div");
        return !el || getComputedStyle(el).opacity === "1";
      });
      const results = await new AxeBuilder({ page }).analyze();

      const critical = results.violations.filter((v) => v.impact === "critical");
      const serious = results.violations.filter((v) => v.impact === "serious");
      const moderate = results.violations.filter((v) => v.impact === "moderate");

      if (moderate.length > 0) {
        console.log(
          `[LOW] axe moderate violations on ${route}:`,
          moderate.map((v) => v.id).join(", "),
        );
      }

      expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });
  }

  test("icon-only buttons have an accessible name", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("#/");
    const hamburger = page.getByLabel("Toggle menu");
    await expect(hamburger).toBeVisible();
  });
});

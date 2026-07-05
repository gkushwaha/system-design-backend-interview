import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Every bug fixed during the QA loop gets a permanent regression test added here,
// named `REGRESSION BUG-XXX: <description>`, so it can never silently reappear.
//
// BUG-001 (addXP accepted negative/NaN/Infinity/fractional input) and BUG-002
// (streak bonus miscalculated after a gap reset) are pure Zustand-store logic
// bugs with no distinct DOM behavior to assert at the E2E layer — their
// permanent regression coverage lives in the unit suite instead:
//   src/test/unit/stores/xpStore.test.ts     ("BUG-001: ..." cases)
//   src/test/unit/stores/streakStore.test.ts ("BUG-002: ..." case)

test("REGRESSION BUG-004: MiniChallenge shows Correct! feedback before flipping to completion screen", async ({
  page,
}) => {
  // circuit-breaker's mini challenge has 2 questions, both with correctIndex 1
  // (src/data/topicContent/circuitBreaker.tsx) — driving real clicks instead of
  // guessing, since the correct answer isn't marked in the DOM before revealing.
  await page.goto("#/topics/circuit-breaker");
  await page.getByRole("button", { name: /mini challenge/i }).click();

  // Click by the actual correct-answer text (from circuitBreaker.tsx's challenge
  // array) rather than a positional index, since option order in the DOM isn't
  // guaranteed and other buttons (tabs, "Mark as complete") share the page.
  await page.getByRole("button", { name: "They fail immediately without calling the downstream dependency at all" }).click();
  await expect(page.getByText(/^Correct!/)).toBeVisible();
  await page.getByRole("button", { name: /next question/i }).click();

  await page
    .getByRole("button", {
      name: "To let a single probe request test whether the downstream has recovered, before fully reopening traffic",
    })
    .click();
  // The "Correct!" feedback for the final question must render before the
  // 900ms-delayed onComplete() swaps this view to "Challenge complete!" — it
  // was previously skipped entirely due to React state batching (BUG-004).
  await expect(page.getByText(/^Correct!/)).toBeVisible();
  await expect(page.getByText(/Challenge complete!/i)).toBeVisible({ timeout: 2000 });
});

test("REGRESSION BUG-003: circuit breaker content does not claim Netflix currently uses Hystrix", async ({
  page,
}) => {
  await page.goto("#/topics/circuit-breaker");
  const bodyText = await page.locator("main").innerText();
  expect(bodyText).not.toMatch(/Netflix'?s? Hystrix (protecting|protects|uses)/i);
});

test("REGRESSION BUG-005: no critical or serious axe violations survive an animation-settled scan", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("#/topics/load-balancers");
  await page.waitForLoadState("networkidle");
  await page.waitForFunction(() => {
    const el = document.querySelector("main > div");
    return !el || getComputedStyle(el).opacity === "1";
  });
  const results = await new AxeBuilder({ page }).analyze();
  const bad = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(bad, JSON.stringify(bad, null, 2)).toEqual([]);
});

test("REGRESSION BUG-006: the very first route render is never stuck at partial/zero opacity", async ({
  page,
}) => {
  // App.tsx's AnimatePresence page-transition fade used `initial={false}` to
  // skip the fade on first paint, but that raced the lazy-loaded route chunk
  // and could leave real content invisible (opacity stuck below 1) forever on
  // a real network — reproduced by loading a lazy route directly, repeatedly,
  // and checking opacity immediately rather than after it would have settled.
  for (let i = 0; i < 8; i++) {
    await page.goto(`#/topics/cdn?_r=${i}`);
    const opacity = await page.evaluate(() => {
      const el = document.querySelector("main > div");
      return el ? getComputedStyle(el).opacity : "1";
    });
    expect(opacity).toBe("1");
  }
});

test("REGRESSION BUG-007: navigating to a new topic resets scroll position instead of carrying over the old page's scrollTop", async ({
  page,
}) => {
  // <main> never unmounts between in-app route changes, so its scrollTop was
  // carrying over from whatever page you navigated away from — scrolling deep
  // into one topic, then clicking a different (shorter) topic in the sidebar,
  // landed on the new page already scrolled down, looking like a big blank gap
  // above the content (reported by a user against the deployed site).
  await page.setViewportSize({ width: 1280, height: 400 }); // force overflow reliably
  await page.goto("#/topics/database-sharding");
  await expect(page.getByRole("heading", { name: "Database sharding" })).toBeVisible();
  await page.evaluate(() => document.querySelector("main")?.scrollTo(0, 800));
  await expect
    .poll(() => page.evaluate(() => document.querySelector("main")?.scrollTop ?? 0))
    .toBeGreaterThan(0);

  // Not `exact: true` — the link's accessible name also includes its sidebar
  // order number ("2 Load balancers"), not just the title text.
  await page.getByRole("link", { name: "Load balancers" }).click();
  // Wait for the new route's own content to mount (not just the URL to change)
  // before checking scrollTop — the scroll-reset effect runs on that commit.
  // AnimatePresence's crossfade briefly keeps the outgoing and incoming pages
  // both mounted, which can transiently duplicate this heading — .first() plus
  // a brief settle avoids catching that mid-transition moment.
  await expect(page.getByRole("heading", { name: "Load balancers" }).first()).toBeVisible();
  await page.waitForTimeout(250);
  await expect.poll(() => page.evaluate(() => document.querySelector("main")?.scrollTop ?? -1)).toBe(0);
});

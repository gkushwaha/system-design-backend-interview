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

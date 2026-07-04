import { test, expect } from "@playwright/test";

test.describe("critical happy paths", () => {
  test("home page loads correctly", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("#/");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    // The navbar's "0 XP" is `hidden sm:inline` (absent below the sm breakpoint on
    // mobile) — scope to <main>, where the home page's own XP badge always renders.
    await expect(page.getByRole("main").getByText("0 XP", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Junior Engineer").first()).toBeVisible();
    await expect(page.getByText("Most Asked").first()).toBeVisible();
    await expect(page.getByText("Today's Challenge")).toBeVisible();

    expect(errors, `console/page errors: ${errors.join("; ")}`).toEqual([]);
  });

  test("complete topic 1's mini challenge end to end", async ({ page }) => {
    await page.goto("#/topics/horizontal-vs-vertical-scaling");
    await expect(page.getByRole("heading", { name: "Horizontal vs vertical scaling" })).toBeVisible();
    await expect(page.getByText(/Most Asked/).first()).toBeVisible();

    await page.getByText("How it works").click();
    for (let i = 0; i < 6; i++) {
      const next = page.getByRole("button", { name: /Next/ });
      if (await next.isDisabled()) break;
      await next.click();
    }

    await page.getByText("Mini challenge").click();
    await page.getByText("Horizontal scaling", { exact: true }).click();
    await expect(page.getByText(/Correct!/)).toBeVisible();
    const nextQuestion = page.getByRole("button", { name: "Next question" });
    if (await nextQuestion.isVisible().catch(() => false)) {
      await nextQuestion.click();
      await page.getByText(/Larger single instances cost disproportionately more/).click();
    }

    await expect(page.getByText(/Challenge complete!|Completed/)).toBeVisible({ timeout: 3000 });

    await page.goto("#/");
    await expect(page.getByText("1/15").first()).toBeVisible();
  });

  test("skill tree renders and a node navigates to its topic", async ({ page }) => {
    await page.goto("#/map");
    await expect(page.getByRole("heading", { name: "Skill Tree" })).toBeVisible();
    // Same topic titles legitimately appear both in the sidebar and the skill tree
    // canvas, so scope to the main canvas area.
    const canvas = page.getByRole("main");
    await expect(canvas.getByText("Horizontal vs vertical scaling")).toBeVisible();
    await canvas.getByText("Load balancers").click();
    await expect(page).toHaveURL(/#\/topics\/load-balancers/);
  });

  test("quick reference renders all core sections", async ({ page }) => {
    await page.goto("#/reference");
    await expect(page.getByText("Database Comparison")).toBeVisible();
    await expect(page.getByText("Cassandra").first()).toBeVisible();
    await expect(page.getByText("Latency Numbers Cheat Sheet")).toBeVisible();
    await expect(page.getByText("0.5 ns")).toBeVisible();
    await expect(page.getByText("HTTP Status Codes")).toBeVisible();
    await expect(page.getByText("429")).toBeVisible();
  });

  test("system design problem page renders requirements and capacity calculator", async ({ page }) => {
    await page.goto("#/problems/url-shortener");
    await expect(page.getByRole("heading", { name: /URL shortener/i })).toBeVisible();
    await expect(page.getByText("Functional requirements", { exact: true })).toBeVisible();
    await page.getByText("Capacity", { exact: true }).click();
    await expect(page.getByText("Adjust assumptions")).toBeVisible();
  });

  test("interview simulation flow: start, timer counts down, end shows score", async ({ page }) => {
    await page.goto("#/interview");
    await expect(page.getByRole("heading", { name: "Interview Simulation" })).toBeVisible();
    await page.getByText("Start interview").click();
    const timer = page.getByText(/^\d{1,2}:\d{2}$/);
    await expect(timer).toBeVisible();
    const firstReading = await timer.textContent();
    await page.waitForTimeout(1500);
    const secondReading = await timer.textContent();
    expect(secondReading).not.toBe(firstReading);

    await page.getByRole("button", { name: "End interview" }).click();
    await expect(page.getByRole("heading", { name: "Interview complete" })).toBeVisible();
    await expect(page.getByText("components covered")).toBeVisible();
  });
});

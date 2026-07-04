import { test, expect } from "@playwright/test";

const routes = ["#/", "#/map", "#/topics/cdn", "#/problems/url-shortener", "#/reference", "#/interview"];

test.describe("dark theme consistency", () => {
  for (const route of routes) {
    test(`body background is dark on ${route}`, async ({ page }) => {
      await page.goto(route);
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      // #0a0a0f -> rgb(10, 10, 15)
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      expect(match, `unexpected background: ${bg}`).toBeTruthy();
      const [, r, g, b] = match!.map(Number) as unknown as [never, number, number, number];
      // dark background: all channels low
      expect(r).toBeLessThan(40);
      expect(g).toBeLessThan(40);
      expect(b).toBeLessThan(40);
    });
  }

  test("no pure-white full-bleed background elements clash with the dark theme", async ({ page }) => {
    await page.goto("#/");
    const html = await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor);
    expect(html).not.toBe("rgb(255, 255, 255)");
  });
});

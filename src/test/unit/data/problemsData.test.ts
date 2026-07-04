import { describe, expect, it } from "vitest";
import { problems } from "@/data/problems";
import { hasProblemContent, loadProblemContent } from "@/data/problemContent";

describe("problems list", () => {
  it("exactly 30 problems exist", () => {
    expect(problems).toHaveLength(30);
  });

  it("first 7 problems (by order) are tier=most-asked", () => {
    const sorted = [...problems].sort((a, b) => a.order - b.order);
    expect(sorted.slice(0, 7).every((p) => p.tier === "most-asked")).toBe(true);
  });

  it("problem order 1 is URL shortener", () => {
    expect(problems.find((p) => p.order === 1)?.title).toMatch(/URL shortener/i);
  });
  it("problem order 2 is rate limiter", () => {
    expect(problems.find((p) => p.order === 2)?.title).toMatch(/rate limiter/i);
  });
  it("problem order 3 is notification system", () => {
    expect(problems.find((p) => p.order === 3)?.title).toMatch(/notification system/i);
  });
  it("problem order 4 is key-value store", () => {
    expect(problems.find((p) => p.order === 4)?.title).toMatch(/key-value store/i);
  });
  it("problem order 5 is unique ID generator", () => {
    expect(problems.find((p) => p.order === 5)?.title).toMatch(/unique ID generator/i);
  });
  it("problem order 6 is Twitter/X feed", () => {
    expect(problems.find((p) => p.order === 6)?.title).toMatch(/Twitter\/X feed/i);
  });
  it("problem order 7 is WhatsApp", () => {
    expect(problems.find((p) => p.order === 7)?.title).toMatch(/WhatsApp/i);
  });

  it("no duplicate problem ids", () => {
    const ids = problems.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no duplicate problem slugs", () => {
    const slugs = problems.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no duplicate problem titles", () => {
    const titles = problems.map((p) => p.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("problem data shape", () => {
  it("every problem has id, order, slug, title, tier, estimatedMinutes, company", () => {
    for (const p of problems) {
      expect(p.id).toMatch(/^P\d+$/);
      expect(typeof p.order).toBe("number");
      expect(typeof p.slug).toBe("string");
      expect(typeof p.title).toBe("string");
      expect(["most-asked", "advanced", "expert"]).toContain(p.tier);
      expect(p.estimatedMinutes).toBeGreaterThan(0);
      expect(typeof p.company).toBe("string");
      expect(p.company.length).toBeGreaterThan(0);
    }
  });
});

describe("problems with full bespoke content (problemContentBySlug loaders)", () => {
  const slugsWithContent = [
    "url-shortener",
    "rate-limiter",
    "notification-system",
    "key-value-store",
    "unique-id-generator",
    "twitter-feed",
    "whatsapp",
    "uber",
    "instagram",
    "payment-system",
    "distributed-message-queue",
    "netflix",
    "distributed-job-scheduler",
  ];

  it("every slug with content resolves to a real problem entry", () => {
    for (const slug of slugsWithContent) {
      expect(problems.find((p) => p.slug === slug)).toBeTruthy();
      expect(hasProblemContent(slug)).toBe(true);
    }
  });

  it.each(slugsWithContent)("content for '%s' has the full required shape", async (slug) => {
    const content = await loadProblemContent(slug);
    expect(content).toBeTruthy();
    expect(content!.requirements.functional.length).toBeGreaterThanOrEqual(3);
    expect(content!.requirements.nonFunctional.length).toBeGreaterThanOrEqual(2);
    expect(content!.solutionSteps.length).toBeGreaterThanOrEqual(4);
    expect(content!.capacity.inputs.length).toBeGreaterThan(0);
    expect(content!.keyDecisions.length).toBeGreaterThan(0);
    expect(content!.commonMistakes.length).toBeGreaterThan(0);
    expect(content!.companyNote.company.length).toBeGreaterThan(0);
    expect(content!.companyNote.note.length).toBeGreaterThan(0);
  });

  it("a slug with no content returns null from loadProblemContent", () => {
    expect(hasProblemContent("youtube")).toBe(false);
    expect(loadProblemContent("youtube")).toBeNull();
  });
});

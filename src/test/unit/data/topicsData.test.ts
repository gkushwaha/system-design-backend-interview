import { describe, expect, it } from "vitest";
import { topics, MOST_ASKED_COUNT, ADVANCED_COUNT, EXPERT_COUNT } from "@/data/topics";

describe("topic list completeness", () => {
  it("exactly 15 Most Asked topics exist", () => {
    expect(topics.filter((t) => t.tier === "most-asked")).toHaveLength(15);
    expect(MOST_ASKED_COUNT).toBe(15);
  });

  it("exactly 67 Advanced topics exist", () => {
    expect(topics.filter((t) => t.tier === "advanced")).toHaveLength(67);
    expect(ADVANCED_COUNT).toBe(67);
  });

  it("exactly 31 Expert topics exist", () => {
    expect(topics.filter((t) => t.tier === "expert")).toHaveLength(31);
    expect(EXPERT_COUNT).toBe(31);
  });

  it("total topic count is 113", () => {
    expect(topics).toHaveLength(113);
  });

  it("no duplicate topic ids", () => {
    const ids = topics.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no duplicate topic slugs", () => {
    const slugs = topics.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("no duplicate topic titles", () => {
    const titles = topics.map((t) => t.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("topic ids are sequential 1..113 with no gaps", () => {
    const ids = [...topics.map((t) => t.id)].sort((a, b) => a - b);
    expect(ids).toEqual(Array.from({ length: 113 }, (_, i) => i + 1));
  });
});

describe("topic data shape", () => {
  it("every topic has id, slug, title, tier, group, estimatedMinutes, example", () => {
    for (const t of topics) {
      expect(typeof t.id).toBe("number");
      expect(typeof t.slug).toBe("string");
      expect(t.slug.length).toBeGreaterThan(0);
      expect(typeof t.title).toBe("string");
      expect(t.title.length).toBeGreaterThan(0);
      expect(["most-asked", "advanced", "expert"]).toContain(t.tier);
      expect(typeof t.group).toBe("string");
      expect(Number.isInteger(t.estimatedMinutes)).toBe(true);
      expect(t.estimatedMinutes).toBeGreaterThan(0);
      expect(typeof t.example).toBe("string");
    }
  });
});

describe("topic order", () => {
  it("first 15 topics are all tier=most-asked, in id order", () => {
    const first15 = topics.slice(0, 15);
    expect(first15.every((t) => t.tier === "most-asked")).toBe(true);
    expect(first15.map((t) => t.id)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  });

  it("topics 16-82 are all tier=advanced", () => {
    const advancedSlice = topics.filter((t) => t.id >= 16 && t.id <= 82);
    expect(advancedSlice).toHaveLength(67);
    expect(advancedSlice.every((t) => t.tier === "advanced")).toBe(true);
  });

  it("topics 83-113 are all tier=expert", () => {
    const expertSlice = topics.filter((t) => t.id >= 83 && t.id <= 113);
    expect(expertSlice).toHaveLength(31);
    expect(expertSlice.every((t) => t.tier === "expert")).toBe(true);
  });

  it("topic 1 is Horizontal vs vertical scaling", () => {
    expect(topics.find((t) => t.id === 1)?.title).toMatch(/Horizontal vs vertical scaling/i);
  });

  it("topic 2 is Load balancers", () => {
    expect(topics.find((t) => t.id === 2)?.title).toMatch(/Load balancers/i);
  });

  it("topic 15 is JWT and OAuth2", () => {
    expect(topics.find((t) => t.id === 15)?.title).toMatch(/JWT and OAuth2/i);
  });
});

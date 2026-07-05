import { beforeEach, describe, expect, it } from "vitest";
import { useProgressStore } from "@/store/useProgressStore";

function resetStore() {
  useProgressStore.getState().reset();
}

describe("useProgressStore — initial state", () => {
  beforeEach(resetStore);

  it("no topics complete initially", () => {
    expect(useProgressStore.getState().completedTopicIds).toEqual([]);
  });
  it("recentTopicIds is empty initially", () => {
    expect(useProgressStore.getState().recentTopicIds).toEqual([]);
  });
  it("streak starts at 0 with null lastStudyDate", () => {
    expect(useProgressStore.getState().streak).toEqual({ count: 0, lastStudyDate: null });
  });
});

describe("completeTopic", () => {
  beforeEach(resetStore);

  it("marks the correct topic complete", () => {
    useProgressStore.getState().completeTopic(1);
    expect(useProgressStore.getState().isTopicComplete(1)).toBe(true);
  });

  it("does not affect other topics", () => {
    useProgressStore.getState().completeTopic(1);
    expect(useProgressStore.getState().isTopicComplete(2)).toBe(false);
  });

  it("is idempotent — calling twice produces the same result", () => {
    useProgressStore.getState().completeTopic(1);
    useProgressStore.getState().completeTopic(1);
    expect(useProgressStore.getState().completedTopicIds).toEqual([1]);
  });

  it("calling 100 times on the same topic still counts once", () => {
    for (let i = 0; i < 100; i++) useProgressStore.getState().completeTopic(1);
    expect(useProgressStore.getState().completedTopicIds).toEqual([1]);
  });
});

describe("visitTopic — recently visited", () => {
  beforeEach(resetStore);

  it("adds topic to the front of recentTopicIds", () => {
    useProgressStore.getState().visitTopic(1);
    useProgressStore.getState().visitTopic(2);
    expect(useProgressStore.getState().recentTopicIds[0]).toBe(2);
  });

  it("caps recently visited at 5 items", () => {
    for (const id of [1, 2, 3, 4, 5, 6]) useProgressStore.getState().visitTopic(id);
    expect(useProgressStore.getState().recentTopicIds).toHaveLength(5);
  });

  it("moves an existing entry to the front instead of duplicating it", () => {
    useProgressStore.getState().visitTopic(1);
    useProgressStore.getState().visitTopic(2);
    useProgressStore.getState().visitTopic(1);
    const ids = useProgressStore.getState().recentTopicIds;
    expect(ids).toEqual([1, 2]);
  });

  it("records a lastVisitedAt timestamp for the topic", () => {
    useProgressStore.getState().visitTopic(1);
    expect(useProgressStore.getState().lastVisitedAt[1]).toBeTruthy();
  });
});

describe("streak transitions (touchStreak)", () => {
  beforeEach(resetStore);

  it("first ever visit sets streak to 1", () => {
    useProgressStore.getState().touchStreak();
    expect(useProgressStore.getState().streak.count).toBe(1);
  });

  it("visiting again the same day does not increment streak", () => {
    useProgressStore.getState().touchStreak();
    useProgressStore.getState().touchStreak();
    expect(useProgressStore.getState().streak.count).toBe(1);
  });

  it("visiting the next calendar day increments streak", () => {
    useProgressStore.setState({ streak: { count: 3, lastStudyDate: "2026-01-01" } });
    const realToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = () => "2026-01-02T10:00:00.000Z";
    useProgressStore.getState().touchStreak();
    Date.prototype.toISOString = realToISOString;
    expect(useProgressStore.getState().streak.count).toBe(4);
  });

  it("skipping a day resets streak to 1", () => {
    useProgressStore.setState({ streak: { count: 5, lastStudyDate: "2026-01-01" } });
    const realToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = () => "2026-01-05T10:00:00.000Z";
    useProgressStore.getState().touchStreak();
    Date.prototype.toISOString = realToISOString;
    expect(useProgressStore.getState().streak.count).toBe(1);
  });

  it("a future lastStudyDate (clock tamper) resets streak to 1", () => {
    useProgressStore.setState({ streak: { count: 9, lastStudyDate: "2099-01-01" } });
    useProgressStore.getState().touchStreak();
    expect(useProgressStore.getState().streak.count).toBe(1);
  });

  it("an invalid date string resets streak gracefully without crashing", () => {
    useProgressStore.setState({ streak: { count: 4, lastStudyDate: "not-a-date" } });
    expect(() => useProgressStore.getState().touchStreak()).not.toThrow();
    expect(useProgressStore.getState().streak.count).toBe(1);
  });
});

describe("reset", () => {
  it("clears all completed topics, recent topics, and streak", () => {
    useProgressStore.getState().completeTopic(1);
    useProgressStore.getState().visitTopic(1);
    useProgressStore.getState().touchStreak();
    useProgressStore.getState().reset();
    expect(useProgressStore.getState().completedTopicIds).toEqual([]);
    expect(useProgressStore.getState().recentTopicIds).toEqual([]);
    expect(useProgressStore.getState().streak).toEqual({ count: 0, lastStudyDate: null });
  });
});

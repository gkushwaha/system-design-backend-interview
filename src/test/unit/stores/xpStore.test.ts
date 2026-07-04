import { beforeEach, describe, expect, it } from "vitest";
import { useXPStore, levelForXP, nextLevelThreshold, XP_REWARDS } from "@/store/useXPStore";

function resetStore() {
  useXPStore.setState({ xp: 0, lastGain: 0 });
}

describe("useXPStore — initial state", () => {
  beforeEach(resetStore);

  it("XP starts at 0", () => {
    expect(useXPStore.getState().xp).toBe(0);
  });

  it("level starts at Junior Engineer", () => {
    expect(levelForXP(useXPStore.getState().xp)).toBe("Junior Engineer");
  });
});

describe("useXPStore — XP_REWARDS constants", () => {
  it("topic completion is exactly 50 XP", () => {
    expect(XP_REWARDS.topic).toBe(50);
  });
  it("mini challenge is exactly 30 XP", () => {
    expect(XP_REWARDS.miniChallenge).toBe(30);
  });
  it("system design problem is exactly 100 XP", () => {
    expect(XP_REWARDS.systemDesignProblem).toBe(100);
  });
  it("interview simulation is exactly 200 XP", () => {
    expect(XP_REWARDS.interviewSimulation).toBe(200);
  });
  it("7-day streak bonus is exactly 500 XP", () => {
    expect(XP_REWARDS.sevenDayStreak).toBe(500);
  });
});

describe("useXPStore — addXP", () => {
  beforeEach(resetStore);

  it("accumulates correctly across multiple calls", () => {
    const { addXP } = useXPStore.getState();
    addXP(50);
    addXP(30);
    addXP(100);
    expect(useXPStore.getState().xp).toBe(180);
  });

  it("addXP(0) changes nothing", () => {
    const { addXP } = useXPStore.getState();
    addXP(50);
    addXP(0);
    expect(useXPStore.getState().xp).toBe(50);
  });

  // The following document real gaps found by reading useXPStore.ts: addXP has
  // no input validation at all (`xp: state.xp + amount`), so these currently FAIL
  // against the naive implementation. See BUG-001 in the QA report.
  it("BUG-001: negative amount is a no-op, does not decrease XP", () => {
    const { addXP } = useXPStore.getState();
    addXP(50);
    addXP(-50);
    expect(useXPStore.getState().xp).toBe(50);
  });

  it("BUG-001: NaN is a no-op, does not poison XP", () => {
    const { addXP } = useXPStore.getState();
    addXP(50);
    addXP(NaN);
    expect(useXPStore.getState().xp).toBe(50);
    expect(Number.isFinite(useXPStore.getState().xp)).toBe(true);
  });

  it("BUG-001: Infinity is a no-op, does not poison XP", () => {
    const { addXP } = useXPStore.getState();
    addXP(50);
    addXP(Infinity);
    expect(useXPStore.getState().xp).toBe(50);
    expect(Number.isFinite(useXPStore.getState().xp)).toBe(true);
  });

  it("BUG-001: fractional amount floors to an integer", () => {
    const { addXP } = useXPStore.getState();
    addXP(1.9);
    expect(useXPStore.getState().xp).toBe(1);
  });

  it("BUG-001: XP total never becomes negative under any sequence of calls", () => {
    const { addXP } = useXPStore.getState();
    addXP(10);
    addXP(-1000);
    expect(useXPStore.getState().xp).toBeGreaterThanOrEqual(0);
  });
});

describe("levelForXP — exact boundary conditions", () => {
  it.each([
    [0, "Junior Engineer"],
    [499, "Junior Engineer"],
    [500, "Mid-level Engineer"],
    [501, "Mid-level Engineer"],
    [1999, "Mid-level Engineer"],
    [2000, "Senior Engineer"],
    [4999, "Senior Engineer"],
    [5000, "Staff Engineer"],
    [9999, "Staff Engineer"],
    [10000, "Principal Engineer"],
    [999999, "Principal Engineer"],
  ] as const)("XP = %i → %s", (xp, expected) => {
    expect(levelForXP(xp)).toBe(expected);
  });
});

describe("nextLevelThreshold", () => {
  it("at 0 XP, next threshold is 500", () => {
    expect(nextLevelThreshold(0)).toBe(500);
  });
  it("at 250 XP, next threshold is 500", () => {
    expect(nextLevelThreshold(250)).toBe(500);
  });
  it("at 500 XP, next threshold is 2000", () => {
    expect(nextLevelThreshold(500)).toBe(2000);
  });
  it("at Principal level (10000+), there is no next threshold (null)", () => {
    expect(nextLevelThreshold(10000)).toBeNull();
    expect(nextLevelThreshold(50000)).toBeNull();
  });
});

describe("useXPStore — persistence", () => {
  beforeEach(resetStore);

  it("XP survives a fresh read from the store after being set", () => {
    useXPStore.getState().addXP(80);
    expect(useXPStore.getState().xp).toBe(80);
  });

  it("reset() zeroes XP and lastGain", () => {
    useXPStore.getState().addXP(500);
    useXPStore.getState().reset();
    expect(useXPStore.getState().xp).toBe(0);
    expect(useXPStore.getState().lastGain).toBe(0);
  });
});

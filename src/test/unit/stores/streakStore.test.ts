import { beforeEach, describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProgressStore } from "@/store/useProgressStore";
import { useXPStore, XP_REWARDS } from "@/store/useXPStore";
import { useStreak } from "@/hooks/useStreak";

function resetStores() {
  useProgressStore.getState().reset();
  useXPStore.getState().reset();
}

describe("useStreak hook — bonus XP trigger", () => {
  beforeEach(resetStores);

  it("does NOT award bonus XP on day 6", () => {
    useProgressStore.setState({ streak: { count: 5, lastStudyDate: "2026-01-01" } });
    const realToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = () => "2026-01-02T10:00:00.000Z";
    renderHook(() => useStreak());
    Date.prototype.toISOString = realToISOString;
    expect(useXPStore.getState().xp).toBe(0);
  });

  it("awards bonus XP once streak reaches exactly 7", () => {
    useProgressStore.setState({ streak: { count: 6, lastStudyDate: "2026-01-01" } });
    const realToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = () => "2026-01-02T10:00:00.000Z";
    renderHook(() => useStreak());
    Date.prototype.toISOString = realToISOString;
    expect(useProgressStore.getState().streak.count).toBe(7);
    expect(useXPStore.getState().xp).toBe(XP_REWARDS.sevenDayStreak);
  });

  it("does NOT re-award bonus XP at day 8", () => {
    useProgressStore.setState({ streak: { count: 7, lastStudyDate: "2026-01-01" } });
    const realToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = () => "2026-01-02T10:00:00.000Z";
    renderHook(() => useStreak());
    Date.prototype.toISOString = realToISOString;
    expect(useProgressStore.getState().streak.count).toBe(8);
    expect(useXPStore.getState().xp).toBe(0);
  });

  // BUG-002: useStreak.ts predicts the bonus with `(streak.count + 1) % 7 === 0`
  // BEFORE calling touchStreak(), assuming touchStreak always increments by 1.
  // But touchStreak() actually RESETS the count to 1 when the gap since the last
  // visit is more than a day. If the pre-reset count happened to make
  // (count + 1) % 7 === 0 (e.g. count = 6), the hook awards the streak bonus
  // even though the real, post-touch streak is just 1 — not 7.
  it("BUG-002: does NOT award bonus XP when a gap resets the streak, even if the old count was 6", () => {
    // Old streak was 6, but the user skipped several days — lastStudyDate is 4 days ago.
    useProgressStore.setState({ streak: { count: 6, lastStudyDate: "2026-01-01" } });
    const realToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = () => "2026-01-05T10:00:00.000Z"; // 4-day gap, not consecutive
    renderHook(() => useStreak());
    Date.prototype.toISOString = realToISOString;

    // The real post-touch streak must be 1 (reset), not 7.
    expect(useProgressStore.getState().streak.count).toBe(1);
    // No bonus should have been awarded since the streak did not actually reach 7.
    expect(useXPStore.getState().xp).toBe(0);
  });
});

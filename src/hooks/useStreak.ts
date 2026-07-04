import { useEffect } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { useXPStore, XP_REWARDS } from "@/store/useXPStore";

export function useStreak() {
  const streak = useProgressStore((s) => s.streak);
  const touchStreak = useProgressStore((s) => s.touchStreak);
  const addXP = useXPStore((s) => s.addXP);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const wasAlreadyToday = streak.lastStudyDate === today;
    touchStreak();
    if (!wasAlreadyToday) {
      // Read the post-touch count rather than assuming streak.count + 1 — a gap
      // resets the streak to 1 inside touchStreak, so pre-computing off the stale
      // count would still award the bonus after a reset (BUG-002).
      const updatedCount = useProgressStore.getState().streak.count;
      if (updatedCount % 7 === 0) addXP(XP_REWARDS.sevenDayStreak);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return streak;
}

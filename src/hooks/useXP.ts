import { useXPStore, levelForXP, nextLevelThreshold, XP_REWARDS } from "@/store/useXPStore";

export function useXP() {
  const xp = useXPStore((s) => s.xp);
  const lastGain = useXPStore((s) => s.lastGain);
  const addXP = useXPStore((s) => s.addXP);

  const level = levelForXP(xp);
  const nextThreshold = nextLevelThreshold(xp);
  const prevThreshold = [0, 500, 2000, 5000, 10000]
    .filter((t) => t <= xp)
    .pop()!;
  const progressToNext =
    nextThreshold === null
      ? 1
      : (xp - prevThreshold) / (nextThreshold - prevThreshold);

  return { xp, lastGain, level, nextThreshold, progressToNext, addXP, XP_REWARDS };
}

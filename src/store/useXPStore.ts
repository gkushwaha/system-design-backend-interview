import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LevelName =
  | "Junior Engineer"
  | "Mid-level Engineer"
  | "Senior Engineer"
  | "Staff Engineer"
  | "Principal Engineer";

export const XP_REWARDS = {
  topic: 50,
  miniChallenge: 30,
  systemDesignProblem: 100,
  interviewSimulation: 200,
  sevenDayStreak: 500,
} as const;

const LEVEL_THRESHOLDS: [number, LevelName][] = [
  [0, "Junior Engineer"],
  [500, "Mid-level Engineer"],
  [2000, "Senior Engineer"],
  [5000, "Staff Engineer"],
  [10000, "Principal Engineer"],
];

export function levelForXP(xp: number): LevelName {
  let current: LevelName = "Junior Engineer";
  for (const [threshold, name] of LEVEL_THRESHOLDS) {
    if (xp >= threshold) current = name;
  }
  return current;
}

export function nextLevelThreshold(xp: number): number | null {
  for (const [threshold] of LEVEL_THRESHOLDS) {
    if (xp < threshold) return threshold;
  }
  return null;
}

interface XPState {
  xp: number;
  lastGain: number;
  addXP: (amount: number) => void;
  reset: () => void;
}

export const useXPStore = create<XPState>()(
  persist(
    (set) => ({
      xp: 0,
      lastGain: 0,
      addXP: (amount: number) =>
        set((state) => {
          if (!Number.isFinite(amount) || amount <= 0) return state;
          const floored = Math.floor(amount);
          return { xp: state.xp + floored, lastGain: floored };
        }),
      reset: () => set({ xp: 0, lastGain: 0 }),
    }),
    { name: "aura-sysdesign-xp" },
  ),
);

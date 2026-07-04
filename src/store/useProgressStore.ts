import { create } from "zustand";
import { persist } from "zustand/middleware";

const RECENT_LIMIT = 5;

interface StreakState {
  count: number;
  lastStudyDate: string | null; // YYYY-MM-DD
}

interface ProgressState {
  completedTopicIds: number[];
  completedChallengeIds: number[];
  completedProblemIds: string[];
  recentTopicIds: number[];
  lastTopicId: number | null;
  lastVisitedAt: Record<number, string>; // topicId -> ISO timestamp
  streak: StreakState;

  isTopicComplete: (id: number) => boolean;
  isChallengeComplete: (id: number) => boolean;
  isProblemComplete: (id: string) => boolean;

  completeTopic: (id: number) => void;
  completeChallenge: (id: number) => void;
  completeProblem: (id: string) => void;
  visitTopic: (id: number) => void;
  touchStreak: () => void;
  reset: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.round((Date.parse(b) - Date.parse(a)) / msPerDay);
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedTopicIds: [],
      completedChallengeIds: [],
      completedProblemIds: [],
      recentTopicIds: [],
      lastTopicId: null,
      lastVisitedAt: {},
      streak: { count: 0, lastStudyDate: null },

      isTopicComplete: (id) => get().completedTopicIds.includes(id),
      isChallengeComplete: (id) => get().completedChallengeIds.includes(id),
      isProblemComplete: (id) => get().completedProblemIds.includes(id),

      completeTopic: (id) =>
        set((state) =>
          state.completedTopicIds.includes(id)
            ? state
            : { completedTopicIds: [...state.completedTopicIds, id] },
        ),

      completeChallenge: (id) =>
        set((state) =>
          state.completedChallengeIds.includes(id)
            ? state
            : { completedChallengeIds: [...state.completedChallengeIds, id] },
        ),

      completeProblem: (id) =>
        set((state) =>
          state.completedProblemIds.includes(id)
            ? state
            : { completedProblemIds: [...state.completedProblemIds, id] },
        ),

      visitTopic: (id) =>
        set((state) => {
          const withoutId = state.recentTopicIds.filter((t) => t !== id);
          return {
            lastTopicId: id,
            recentTopicIds: [id, ...withoutId].slice(0, RECENT_LIMIT),
            lastVisitedAt: { ...state.lastVisitedAt, [id]: new Date().toISOString() },
          };
        }),

      touchStreak: () =>
        set((state) => {
          const today = todayISO();
          const { lastStudyDate, count } = state.streak;
          if (lastStudyDate === today) return state;
          if (lastStudyDate === null) {
            return { streak: { count: 1, lastStudyDate: today } };
          }
          const diff = daysBetween(lastStudyDate, today);
          if (diff === 1) {
            return { streak: { count: count + 1, lastStudyDate: today } };
          }
          return { streak: { count: 1, lastStudyDate: today } };
        }),

      reset: () =>
        set({
          completedTopicIds: [],
          completedChallengeIds: [],
          completedProblemIds: [],
          recentTopicIds: [],
          lastTopicId: null,
          lastVisitedAt: {},
          streak: { count: 0, lastStudyDate: null },
        }),
    }),
    { name: "aura-sysdesign-progress" },
  ),
);

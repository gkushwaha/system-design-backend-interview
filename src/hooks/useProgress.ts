import { useProgressStore } from "@/store/useProgressStore";
import {
  MOST_ASKED_COUNT,
  ADVANCED_COUNT,
  EXPERT_COUNT,
  ADVANCED_UNLOCK_THRESHOLD,
  EXPERT_UNLOCK_THRESHOLD,
  topics,
} from "@/data/topics";

export function useProgress() {
  const completedTopicIds = useProgressStore((s) => s.completedTopicIds);
  const recentTopicIds = useProgressStore((s) => s.recentTopicIds);
  const lastTopicId = useProgressStore((s) => s.lastTopicId);
  const completeTopic = useProgressStore((s) => s.completeTopic);
  const completeChallenge = useProgressStore((s) => s.completeChallenge);
  const completeProblem = useProgressStore((s) => s.completeProblem);
  const isProblemComplete = useProgressStore((s) => s.isProblemComplete);
  const visitTopic = useProgressStore((s) => s.visitTopic);

  const completedByTier = (tier: "most-asked" | "advanced" | "expert") =>
    topics.filter((t) => t.tier === tier && completedTopicIds.includes(t.id))
      .length;

  const mostAskedDone = completedByTier("most-asked");
  const advancedDone = completedByTier("advanced");
  const expertDone = completedByTier("expert");

  const advancedUnlocked = mostAskedDone >= ADVANCED_UNLOCK_THRESHOLD;
  const expertUnlocked = advancedDone >= EXPERT_UNLOCK_THRESHOLD;

  return {
    completedTopicIds,
    recentTopicIds,
    lastTopicId,
    completeTopic,
    completeChallenge,
    completeProblem,
    isProblemComplete,
    visitTopic,
    rings: {
      mostAsked: { done: mostAskedDone, total: MOST_ASKED_COUNT },
      advanced: { done: advancedDone, total: ADVANCED_COUNT },
      expert: { done: expertDone, total: EXPERT_COUNT },
    },
    advancedUnlocked,
    expertUnlocked,
  };
}

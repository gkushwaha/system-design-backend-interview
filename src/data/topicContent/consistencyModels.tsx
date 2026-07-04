import { ConsistencyModels } from "@/components/visualizations/ConsistencyModels";
import type { TopicContent } from "./types";

export const consistencyModels: TopicContent = {
  visual: ConsistencyModels,
  howItWorks: [
    {
      title: "Strong consistency",
      description:
        "A write is not acknowledged as successful until every replica has applied it. Every subsequent read, from any replica, sees the latest value. Simple to reason about, but limits availability and adds latency.",
    },
    {
      title: "Read-your-writes consistency",
      description:
        "A weaker, pragmatic guarantee: a user always sees their own writes immediately (typically by pinning their session's reads to the replica or leader that handled their write), even if other users see it later.",
    },
    {
      title: "Causal consistency",
      description:
        "Operations that are causally related (a comment can't appear before the post it comments on) are guaranteed to be seen in that order everywhere. Unrelated operations may still be seen in different orders on different replicas.",
      code: "// causally related — must be seen in this order everywhere\npost = createPost()\ncomment = createComment(post.id)",
    },
    {
      title: "Eventual consistency",
      description:
        "The weakest common guarantee: if no new writes occur, all replicas will eventually converge to the same value — but with no bound on how long, and no ordering guarantee in the meantime.",
    },
    {
      title: "Choosing a model is a product decision, not just technical",
      description:
        "The 'right' model depends on what a stale read actually costs the user — a stale follower count is harmless; a stale bank balance is not.",
    },
  ],
  tradeoffs: {
    pros: [
      "Weaker models (eventual, causal) enable higher availability and lower latency",
      "Read-your-writes gives a strong-feeling user experience without full strong consistency's cost",
      "Causal consistency prevents confusing 'effect before cause' bugs cheaply",
    ],
    cons: [
      "Strong consistency limits availability during partitions and adds cross-replica coordination latency",
      "Eventual consistency can surface confusing, hard-to-reproduce bugs if the UI doesn't account for staleness",
      "Read-your-writes requires session affinity or clever routing, adding infrastructure complexity",
    ],
    whenToUse: [
      "Strong — financial balances, inventory counts, anything where staleness causes real harm",
      "Read-your-writes — social apps where users expect to see their own actions reflected instantly",
      "Causal — comment threads, chat, anything with clear cause-effect relationships",
      "Eventual — like counts, view counts, presence indicators where slight staleness is invisible to users",
    ],
    whenNotToUse: [
      "Don't default to strong consistency everywhere — it's the most expensive option and most data doesn't need it",
      "Don't use pure eventual consistency for anything where a user would notice or be harmed by seeing stale data",
    ],
    alternatives: [
      { name: "Quorum consistency (R+W>N)", note: "A tunable middle ground between strong and eventual, configurable per operation" },
      { name: "CRDTs", note: "Data structures designed to merge conflicting concurrent writes automatically without central coordination" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd pick the consistency model per piece of data, not for the whole system. For a bank balance or inventory count, I'd want strong consistency even at some latency cost. For a social feed's like count, eventual consistency is invisible to users and much cheaper. For a user's own posts or comments, I'd specifically call out read-your-writes — routing a user's reads to the replica that handled their write, or the leader, so they never see their own action appear to 'disappear'. I'd also mention causal consistency for anything with clear cause-effect ordering, like a comment thread, since users would immediately notice a comment appearing before the post it replies to.",
    mistakes: [
      "Treating consistency as one global system-wide setting instead of a per-data-type decision",
      "Not knowing what read-your-writes means or why it matters for perceived UX quality",
      "Assuming eventual consistency means data is ever actually 'wrong' rather than just temporarily stale",
    ],
    followUps: [
      "How would you implement read-your-writes without routing every read to the leader?",
      "What's a concrete example of a causal consistency violation a user would notice?",
      "How does quorum consistency let you tune between strong and eventual?",
    ],
    redFlags: [
      "Insisting everything should just use strong consistency 'to be safe'",
      "Not being able to give a concrete user-facing example of why consistency choice matters",
    ],
  },
  challenge: [
    {
      question: "Which consistency model specifically guarantees a user always sees their own submitted comment immediately, even if other users see it moments later?",
      options: ["Eventual consistency", "Read-your-writes consistency", "Causal consistency", "None of these guarantee this"],
      correctIndex: 1,
      explanation:
        "Read-your-writes consistency specifically guarantees that a client sees the effects of its own writes immediately, typically via session-pinned routing.",
    },
    {
      question: "What does causal consistency guarantee that plain eventual consistency does not?",
      options: [
        "That all replicas are always perfectly in sync",
        "That causally related operations (like a post and its comment) are seen in the same relative order by every replica",
        "That writes are never lost",
        "That reads are always faster",
      ],
      correctIndex: 1,
      explanation:
        "Causal consistency specifically preserves the relative order of operations that have a cause-effect relationship, even though unrelated operations may still be seen in different orders across replicas.",
    },
  ],
};

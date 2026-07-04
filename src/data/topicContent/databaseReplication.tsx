import { DatabaseReplication } from "@/components/visualizations/DatabaseReplication";
import type { TopicContent } from "./types";

export const databaseReplication: TopicContent = {
  visual: DatabaseReplication,
  howItWorks: [
    {
      title: "One leader, many followers",
      description:
        "Writes go to a single leader node. The leader streams its write-ahead log to one or more follower (replica) nodes, which apply the same changes in order.",
    },
    {
      title: "Followers serve reads",
      description:
        "Read traffic can be spread across followers to scale read capacity horizontally, offloading the leader — as long as the application can tolerate slightly stale data.",
      code: "-- App routes writes here\nWRITE → primary-db.internal\n\n-- App routes reads here (load balanced)\nREAD  → replica-1.internal, replica-2.internal",
    },
    {
      title: "Replication lag causes stale reads",
      description:
        "Because replication is asynchronous by default, there's a window (milliseconds to seconds) where a follower hasn't yet applied the latest write. A read during that window returns old data.",
    },
    {
      title: "Leader failure triggers election",
      description:
        "If the leader dies, the cluster needs to detect the failure and promote a follower to be the new leader — either automatically (Raft-based systems) or via a manual/orchestrated failover.",
    },
    {
      title: "Synchronous vs asynchronous replication",
      description:
        "Synchronous replication waits for a follower to confirm before acknowledging the write (safer, slower). Asynchronous acknowledges immediately (faster, risk of losing the last few writes on failover).",
    },
  ],
  tradeoffs: {
    pros: [
      "Scales read throughput horizontally by adding more followers",
      "Provides redundancy — a follower can be promoted if the leader fails",
      "Enables geographically distributed reads closer to users",
    ],
    cons: [
      "Asynchronous replication means followers can serve stale data",
      "Synchronous replication adds write latency proportional to the slowest replica",
      "Failover isn't instant — there's a detection + election window with no leader",
    ],
    whenToUse: [
      "Read-heavy workloads where read replicas can absorb most traffic",
      "Systems needing high availability against single-node failure",
    ],
    whenNotToUse: [
      "Workloads requiring every read to reflect the absolute latest write (route those specifically to the leader instead)",
      "Very small workloads where a single instance's downtime risk is acceptable",
    ],
    alternatives: [
      { name: "Multi-leader replication", note: "Multiple nodes accept writes; requires conflict resolution but removes the single-leader bottleneck" },
      { name: "Leaderless (Dynamo-style)", note: "Any node accepts writes; uses quorums (R+W>N) instead of a fixed leader" },
      { name: "Synchronous quorum replication", note: "Spanner-style — wait for a majority of replicas before acknowledging, trading latency for durability" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd use leader-follower replication to scale reads and provide redundancy: writes go to the leader, and read traffic gets spread across followers. I'd be explicit that this is asynchronous by default, so there's a replication lag window where followers can serve stale data — for any read that must reflect a just-completed write, like showing a user their own just-submitted comment, I'd route that specific read to the leader. For failover, I'd rely on a consensus-based system (like Patroni for Postgres, or a managed RDS Multi-AZ setup) to detect leader failure and promote a follower automatically, rather than building manual failover.",
    mistakes: [
      "Assuming replication is always synchronous and reads are always fresh",
      "Not having a plan for 'read-your-writes' consistency on follower reads",
      "Underestimating the failover detection window as an availability gap",
    ],
    followUps: [
      "How would you guarantee a user sees their own write immediately after submitting it?",
      "What happens to in-flight writes during a leader failover?",
      "How is this different from multi-leader or leaderless replication?",
    ],
    redFlags: [
      "Not knowing what replication lag is",
      "Assuming replicas are always perfectly in sync",
    ],
  },
  challenge: [
    {
      question: "Why might a user briefly not see their own comment immediately after posting it, in a leader-follower setup?",
      options: [
        "The database deleted it",
        "Their read request was served by a follower that hasn't yet received the write via replication",
        "Comments are never replicated",
        "This can never happen with replication",
      ],
      correctIndex: 1,
      explanation:
        "Asynchronous replication lag means a follower can lag slightly behind the leader — reading from a follower right after a write can return stale data.",
    },
    {
      question: "What must happen when a leader node fails in a leader-follower cluster?",
      options: [
        "Nothing — followers automatically become leaders instantly with zero downtime",
        "The cluster detects the failure and elects/promotes a follower to become the new leader",
        "All data is lost",
        "The application must be restarted manually",
      ],
      correctIndex: 1,
      explanation:
        "Leader failure requires a detection + election process before a new leader can accept writes — this window is a real (if brief) availability gap.",
    },
  ],
};

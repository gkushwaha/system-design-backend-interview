import { RaftConsensus } from "@/components/visualizations/RaftConsensus";
import type { TopicContent } from "./types";

export const raftConsensus: TopicContent = {
  visual: RaftConsensus,
  howItWorks: [
    {
      title: "Nodes start as followers",
      description:
        "Every node begins as a follower. Each has a randomized election timeout — if it doesn't hear from a leader within that window, it assumes there isn't one and starts an election.",
    },
    {
      title: "Election: candidate requests votes",
      description:
        "A follower whose timeout fires increments its term number, becomes a candidate, votes for itself, and requests votes from every other node.",
      code: "term += 1\nstate = CANDIDATE\nrequestVoteFrom(allOtherNodes, term)",
    },
    {
      title: "Majority vote wins",
      description:
        "Each node votes for at most one candidate per term, on a first-come basis (as long as the candidate's log is at least as up to date). Whichever candidate gets votes from a majority becomes leader for that term.",
    },
    {
      title: "Log replication via AppendEntries",
      description:
        "The leader appends client commands to its own log, then sends them to followers via AppendEntries RPCs. Once a majority of nodes have replicated an entry, the leader commits it and applies it to its state machine.",
    },
    {
      title: "Leader failure triggers re-election",
      description:
        "If the leader stops sending heartbeats (crash, network partition), followers' election timeouts fire and a new election begins with an incremented term — Raft guarantees at most one leader per term.",
    },
  ],
  tradeoffs: {
    pros: [
      "Provides strong consistency and a single, unambiguous leader per term without split-brain",
      "Designed to be understandable — Raft was explicitly created as a more approachable alternative to Paxos",
      "Well-suited to systems needing a strongly consistent replicated log (config stores, metadata services)",
    ],
    cons: [
      "Requires a majority of nodes to be reachable to make progress — cannot tolerate more than (N-1)/2 failures",
      "Leader-based writes mean write throughput is bounded by a single node's capacity",
      "Election and failover introduce a brief unavailability window while a new leader is chosen",
    ],
    whenToUse: [
      "Systems needing strongly consistent replicated state: etcd, Consul, distributed config/coordination services",
      "Any system where 'exactly one leader, ever' matters more than raw write throughput",
    ],
    whenNotToUse: [
      "High write-throughput systems where a single-leader bottleneck is unacceptable (consider leaderless/quorum-based systems instead)",
      "Systems that can tolerate eventual consistency and want to avoid consensus overhead entirely",
    ],
    alternatives: [
      { name: "Paxos", note: "Older, more general but notoriously harder to understand and implement correctly" },
      { name: "Multi-Paxos / Viewstamped Replication", note: "Similar leader-based consensus predating Raft" },
      { name: "Leaderless quorum systems", note: "Dynamo-style R+W>N quorums trade strict consensus for higher availability" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd reach for Raft when I need a small cluster of nodes to agree on a single, strongly consistent source of truth — like etcd backing Kubernetes' control plane. I'd explain the two core mechanisms: leader election, where nodes with expired timeouts become candidates and need a majority vote to become leader for a term; and log replication, where the leader only commits an entry once a majority of followers have it. I'd emphasize that Raft tolerates up to (N-1)/2 node failures and guarantees at most one leader per term, which is what prevents split-brain.",
    mistakes: [
      "Confusing Raft with a leaderless system — Raft is explicitly leader-based",
      "Not knowing that a majority (not all) of nodes must acknowledge an entry before it's committed",
      "Underestimating the brief unavailability window during leader election as a real tradeoff",
    ],
    followUps: [
      "How does Raft prevent two nodes from both believing they're the leader in the same term?",
      "What happens if a network partition splits the cluster into two groups?",
      "How does Raft compare to Paxos in terms of implementation complexity?",
    ],
    redFlags: [
      "Not knowing what 'term' means in Raft",
      "Claiming Raft can tolerate a majority of node failures (it's the opposite — it needs a majority alive)",
    ],
  },
  challenge: [
    {
      question: "How many nodes must acknowledge a log entry before the Raft leader considers it committed?",
      options: ["Just the leader itself", "All nodes in the cluster", "A majority of nodes", "Exactly one follower"],
      correctIndex: 2,
      explanation:
        "Raft only requires a majority (quorum) of nodes to replicate an entry before committing it — this is what allows the cluster to make progress even if a minority of nodes are down.",
    },
    {
      question: "What prevents two different nodes from both acting as leader within the same term?",
      options: [
        "Nothing — split-brain is possible in Raft",
        "Each node can cast at most one vote per term, so only one candidate can win a majority in a given term",
        "Raft has no concept of terms",
        "Followers refuse to ever vote",
      ],
      correctIndex: 1,
      explanation:
        "Because each node votes for only one candidate per term and a majority is required to win, at most one candidate can secure a majority in any single term.",
    },
  ],
};

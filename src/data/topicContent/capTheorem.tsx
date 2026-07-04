import { CapTheorem } from "@/components/visualizations/CapTheorem";
import type { TopicContent } from "./types";

export const capTheorem: TopicContent = {
  visual: CapTheorem,
  howItWorks: [
    {
      title: "Three properties, pick two",
      description:
        "CAP theorem states a distributed system can provide at most two of: Consistency (every read gets the latest write), Availability (every request gets a response), and Partition tolerance (survives network splits).",
    },
    {
      title: "Partition tolerance isn't optional",
      description:
        "In any real distributed system spanning multiple nodes or regions, network partitions WILL happen. So P is mandatory — the real choice is between C and A when a partition occurs.",
    },
    {
      title: "CP: choose consistency during a partition",
      description:
        "When nodes can't communicate, a CP system refuses requests on the minority side rather than risk serving stale data. HBase and MongoDB (in certain configurations) behave this way.",
    },
    {
      title: "AP: choose availability during a partition",
      description:
        "An AP system keeps serving requests on both sides of the partition, accepting that the two sides may temporarily disagree. Cassandra and DynamoDB take this approach, reconciling conflicts later.",
    },
    {
      title: "PACELC extends the model",
      description:
        "PACELC adds: even without a Partition, there's a tradeoff between Latency and Consistency. This explains why systems like DynamoDB offer tunable consistency even during normal operation.",
    },
  ],
  tradeoffs: {
    pros: [
      "CAP gives a simple mental model for reasoning about distributed database behavior under failure",
      "Forces explicit, informed tradeoffs instead of accidental ones",
    ],
    cons: [
      "Often oversimplified — real systems are tunable per-operation, not fixed at one point on the triangle",
      "Doesn't account for latency tradeoffs during normal operation (that's what PACELC is for)",
    ],
    whenToUse: [
      "CP — when incorrect data is worse than an error message (payments, inventory counts)",
      "AP — when being reachable matters more than perfect freshness (social feeds, shopping carts)",
    ],
    whenNotToUse: [
      "Don't use CAP theorem as the sole justification for a database choice — it's a starting point, not a full requirements analysis",
    ],
    alternatives: [
      { name: "PACELC", note: "Extends CAP to also reason about the latency/consistency tradeoff absent a partition" },
      { name: "Tunable consistency", note: "DynamoDB/Cassandra let you choose consistency level per read/write (quorum, one, all)" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd explain that partition tolerance isn't really optional in a distributed system — network splits happen — so the real decision CAP forces is Consistency versus Availability during a partition. For something like a payments ledger, I'd pick CP: refuse writes rather than risk double-spending. For something like a social media feed or shopping cart, I'd pick AP: keep serving users even if they briefly see slightly stale data, since availability matters more than perfect freshness there. I'd also mention that most production systems, like DynamoDB, let you tune this per-operation rather than picking one mode globally.",
    mistakes: [
      "Saying you can pick any 2 of 3 as if partition tolerance were optional in a real distributed system",
      "Not being able to name a real CP and a real AP database",
      "Treating CAP as static rather than something tunable per-request in modern systems",
    ],
    followUps: [
      "What is PACELC and how does it extend CAP?",
      "How does DynamoDB let you choose consistency per read?",
      "Can a single database be both CP and AP depending on configuration?",
    ],
    redFlags: [
      "Claiming a single-node database is 'CA' as if that were a meaningful, distributed system classification",
    ],
  },
  challenge: [
    {
      question: "Why is partition tolerance considered mandatory rather than optional in real distributed systems?",
      options: [
        "It isn't mandatory — you can simply disable it",
        "Network partitions are an unavoidable fact of life across multiple nodes/regions",
        "It only matters for single-node databases",
        "Partition tolerance is the same thing as availability",
      ],
      correctIndex: 1,
      explanation:
        "Any system spanning multiple nodes over a real network will eventually experience partitions, so realistically you must design for P — the actual choice is between C and A.",
    },
    {
      question: "A payments system that refuses writes during a network partition rather than risk inconsistent balances is prioritizing:",
      options: ["Availability", "Consistency", "Partition tolerance only", "Latency"],
      correctIndex: 1,
      explanation:
        "Refusing to serve potentially-stale or conflicting writes during a partition is the defining behavior of a CP (Consistency + Partition tolerance) system.",
    },
  ],
};

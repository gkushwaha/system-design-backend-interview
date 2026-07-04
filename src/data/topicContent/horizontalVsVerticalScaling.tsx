import { HorizontalVsVerticalScaling } from "@/components/visualizations/HorizontalVsVerticalScaling";
import type { TopicContent } from "./types";

export const horizontalVsVerticalScaling: TopicContent = {
  visual: HorizontalVsVerticalScaling,
  howItWorks: [
    {
      title: "Start with one server",
      description:
        "Every system starts here: one machine running the app and the database. It's simple and fast to build, but it has a single point of failure and a hard capacity ceiling.",
    },
    {
      title: "Vertical scaling: make the box bigger",
      description:
        "When traffic grows, the first instinct is to upgrade the machine — more CPU, RAM, faster disks. No architecture changes needed, but you're bounded by the biggest instance your cloud provider sells, and cost grows faster than capacity near the top of the range.",
      code: "# Before\ndb.t3.medium   →  2 vCPU, 4GB RAM\n\n# After\ndb.r6g.16xlarge → 64 vCPU, 512GB RAM  ($$$$)",
    },
    {
      title: "Horizontal scaling: add more boxes",
      description:
        "Instead of one bigger machine, run many identical smaller ones behind a load balancer. Capacity grows linearly with cost, and you get redundancy for free — if one node dies, the others keep serving.",
    },
    {
      title: "The tradeoff: statelessness",
      description:
        "Horizontal scaling only works cleanly if servers are stateless — session data, uploaded files, and caches need to live in a shared store (Redis, S3, a database) rather than on any one instance's local disk.",
    },
    {
      title: "In practice: both, at different layers",
      description:
        "Real systems combine both: vertically size each database replica appropriately, then scale the number of replicas and app servers horizontally as traffic grows.",
    },
  ],
  tradeoffs: {
    pros: [
      "Horizontal: near-linear cost scaling, built-in redundancy, no hard ceiling",
      "Vertical: zero architectural complexity, easiest to reason about and debug",
    ],
    cons: [
      "Horizontal: requires stateless design, load balancing, and distributed coordination",
      "Vertical: single point of failure, hits a hard hardware ceiling, cost grows non-linearly at the top end",
    ],
    whenToUse: [
      "Horizontal — once traffic exceeds a single machine's practical ceiling",
      "Horizontal — when you need high availability, not just raw capacity",
      "Vertical — early-stage products where simplicity beats scalability",
      "Vertical — stateful systems that are hard to shard (e.g. a single-writer database)",
    ],
    whenNotToUse: [
      "Don't scale horizontally before you've identified and externalized state",
      "Don't scale vertically past the point where cost curves cross — you're burning money",
    ],
    alternatives: [
      { name: "Auto-scaling groups", note: "Horizontal scaling automated based on real-time load metrics" },
      { name: "Read replicas", note: "Vertical primary + horizontal read replicas — a common hybrid for databases" },
      { name: "Serverless", note: "Provider handles scaling entirely; you pay per invocation instead of per box" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd start by identifying the bottleneck — is it CPU-bound, I/O-bound, or memory-bound? For stateless services like API servers, I default to horizontal scaling behind a load balancer since it gives both capacity and redundancy. For stateful components like a primary database, vertical scaling is often simpler first, then I'd add horizontally-scaled read replicas once read traffic dominates. I'd also mention the cost curve — vertical scaling cost tends to grow faster than linear near the top instance tiers, so past a certain point horizontal is strictly cheaper.",
    mistakes: [
      "Jumping straight to \"just add more servers\" without checking if the app is stateless",
      "Ignoring that vertical scaling has a hard ceiling (the biggest instance type)",
      "Forgetting to mention load balancing and health checks as prerequisites for horizontal scaling",
    ],
    followUps: [
      "How do you handle session state across horizontally scaled servers?",
      "At what point would you choose to shard the database instead of just adding read replicas?",
      "How does auto-scaling decide when to add or remove instances?",
    ],
    redFlags: [
      "Saying horizontal scaling has no downsides",
      "Not knowing that databases are harder to scale horizontally than stateless app servers",
    ],
  },
  challenge: [
    {
      question: "Which scaling approach requires the application to be stateless to work cleanly?",
      options: ["Vertical scaling", "Horizontal scaling", "Both equally", "Neither"],
      correctIndex: 1,
      explanation:
        "Horizontal scaling spreads requests across many servers, so any server-local state (sessions, uploaded files) breaks unless externalized to shared storage.",
    },
    {
      question: "Why does vertical scaling eventually become more expensive than horizontal scaling?",
      options: [
        "Cloud providers charge a flat rate regardless of size",
        "Larger single instances cost disproportionately more than the capacity they add",
        "Horizontal scaling is always more expensive at small scale",
        "Vertical scaling requires a load balancer",
      ],
      correctIndex: 1,
      explanation:
        "Instance pricing tends to grow faster than linear at the high end, so past a crossover point, adding more small servers is cheaper than one bigger one.",
    },
  ],
};

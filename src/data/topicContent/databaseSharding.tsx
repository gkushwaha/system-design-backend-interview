import { DatabaseSharding } from "@/components/visualizations/DatabaseSharding";
import type { TopicContent } from "./types";

export const databaseSharding: TopicContent = {
  visual: DatabaseSharding,
  howItWorks: [
    {
      title: "Sharding splits data across independent database nodes",
      description:
        "Unlike replication (copies of the same data), sharding partitions the data itself — each shard holds a distinct subset of rows, and together they form the whole dataset.",
    },
    {
      title: "Range sharding: split by key range",
      description:
        "Rows are assigned to shards based on contiguous ranges of the shard key (e.g. A-F, G-M, N-S, T-Z). Simple and supports efficient range scans, but prone to hotspots if data or access isn't uniform.",
    },
    {
      title: "Hash sharding: split by hash(key)",
      description:
        "Applying a hash function before assigning to a shard spreads data (and load) roughly evenly, at the cost of losing efficient range queries — adjacent keys land on unrelated shards.",
      code: "shard_id = hash(user_id) % num_shards",
    },
    {
      title: "Directory-based sharding: explicit lookup",
      description:
        "A separate lookup service maps each key to its shard explicitly. Most flexible (can rebalance individual keys), but adds an extra network hop and a potential single point of failure for the directory itself.",
    },
    {
      title: "Cross-shard queries and joins get harder",
      description:
        "Once data is sharded, a query needing data from multiple shards (a join across users on different shards) requires application-level fan-out and merging — this is the real cost of sharding.",
    },
  ],
  tradeoffs: {
    pros: [
      "Enables horizontal scaling of storage and write throughput beyond a single node's limits",
      "Each shard can be scaled and tuned somewhat independently",
    ],
    cons: [
      "Cross-shard joins and transactions become significantly harder",
      "Resharding (changing the number of shards) is a genuinely difficult, often risky migration",
      "Range sharding specifically risks hotspots on skewed access patterns",
    ],
    whenToUse: [
      "When a single database node's storage or write throughput ceiling has been reached",
      "When data has a natural partition key with roughly even access (e.g. tenant_id in a multi-tenant SaaS)",
    ],
    whenNotToUse: [
      "Before you've exhausted vertical scaling and read replicas — sharding adds real complexity",
      "When most queries need to join data across what would become different shards",
    ],
    alternatives: [
      { name: "Vertical partitioning", note: "Split by table/column rather than by rows — different tables on different databases" },
      { name: "Managed distributed SQL", note: "CockroachDB/Spanner/Vitess handle sharding transparently under a single SQL interface" },
      { name: "Read replicas first", note: "Often solves the scaling problem without the complexity of sharding writes" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd only reach for sharding once vertical scaling and read replicas are no longer enough — it's the most disruptive scaling option since it complicates transactions and joins. For the shard key, I'd pick something with even access patterns and that matches the dominant query pattern — for Instagram, sharding by user_id hash means a user's own data always lives on one shard, avoiding cross-shard joins for the most common queries. I'd explicitly flag range sharding's hotspot risk if the key isn't uniformly accessed, like sequential IDs or timestamps clustering on one shard.",
    mistakes: [
      "Jumping to sharding before exhausting simpler options like read replicas or better indexing",
      "Picking a shard key without checking whether it matches the dominant query pattern",
      "Not acknowledging that resharding later is one of the hardest migrations in a system's life",
    ],
    followUps: [
      "How would you handle a query that needs data from multiple shards?",
      "What happens when one shard grows much larger than the others?",
      "How would you migrate from 4 shards to 8 without downtime?",
    ],
    redFlags: [
      "Not knowing the difference between sharding and replication",
      "Suggesting range sharding without acknowledging the hotspot risk",
    ],
  },
  challenge: [
    {
      question: "Why is range sharding more susceptible to hotspots than hash sharding?",
      options: [
        "Range sharding requires more disk space",
        "Contiguous, related keys (e.g. sequential IDs or a popular alphabetical range) can cluster onto the same shard, overloading it",
        "Range sharding doesn't support any queries",
        "Hash sharding is always slower",
      ],
      correctIndex: 1,
      explanation:
        "Because range sharding groups nearby key values together, any skew in access to a particular range concentrates load on a single shard — hash sharding spreads that same data more evenly.",
    },
    {
      question: "What is the main cost of sharding a database that wasn't present with a single node or simple replication?",
      options: [
        "Storage becomes more expensive",
        "Queries that need data spanning multiple shards require application-level fan-out and merging",
        "Writes become impossible",
        "You can no longer use SQL",
      ],
      correctIndex: 1,
      explanation:
        "Once data is split across shards, any operation that needs data from more than one shard must be composed in application code rather than a single database query.",
    },
  ],
};

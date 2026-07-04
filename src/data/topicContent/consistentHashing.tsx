import { ConsistentHashing } from "@/components/visualizations/ConsistentHashing";
import type { TopicContent } from "./types";

export const consistentHashing: TopicContent = {
  visual: ConsistentHashing,
  howItWorks: [
    {
      title: "The naive approach: key % N",
      description:
        "A simple way to shard keys across N nodes is hash(key) % N. It works — until N changes. Adding or removing a single node changes the modulo for almost every key, forcing a massive remap.",
      code: "node = hash(key) % num_nodes  // breaks badly when num_nodes changes",
    },
    {
      title: "Consistent hashing: a ring instead of a modulo",
      description:
        "Both nodes and keys are hashed onto the same circular space (0 to 2^32-1). Each key belongs to the first node found going clockwise from its position on the ring.",
    },
    {
      title: "Adding a node only affects its neighbor",
      description:
        "When a new node is inserted at some point on the ring, it only takes over the keys between itself and the previous node in that clockwise arc — roughly 1/N of all keys, not all of them.",
    },
    {
      title: "Virtual nodes smooth out the distribution",
      description:
        "A single physical node is mapped to many points ('virtual nodes') around the ring, so key distribution stays roughly even even with few physical nodes or uneven random hash placement.",
    },
    {
      title: "Used everywhere in distributed storage",
      description:
        "DynamoDB, Cassandra, and Memcached client libraries all use consistent hashing (with virtual nodes) to distribute data or requests across a changing set of nodes with minimal disruption.",
    },
  ],
  tradeoffs: {
    pros: [
      "Adding/removing a node only remaps ~1/N of keys instead of nearly all of them",
      "Enables graceful, low-disruption horizontal scaling of stateful systems",
      "Virtual nodes give even load distribution without manual tuning",
    ],
    cons: [
      "More complex to implement and reason about than simple modulo hashing",
      "Still causes some hot-spotting without enough virtual nodes",
      "Ring rebalancing still requires actually moving data, just less of it",
    ],
    whenToUse: [
      "Distributed caches (Memcached, Redis Cluster) where nodes are added/removed over time",
      "Sharded databases where the node count isn't fixed forever",
    ],
    whenNotToUse: [
      "Small, fixed-size clusters that never change — the extra complexity isn't worth it",
    ],
    alternatives: [
      { name: "Rendezvous hashing (HRW)", note: "Alternative to consistent hashing, simpler and equally minimal-disruption, used in some CDNs" },
      { name: "Static sharding + resharding jobs", note: "Fixed shard count with an explicit, planned data migration when resharding" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd use consistent hashing anywhere the number of nodes changes over time — a distributed cache cluster or a sharded key-value store. The key insight I'd highlight is that naive `hash(key) % N` reshuffles nearly all keys whenever N changes, causing a cache stampede or massive data movement. Consistent hashing instead maps both nodes and keys onto a ring, so adding or removing a node only affects the keys in that node's immediate neighborhood — about 1/N of the total. I'd also mention virtual nodes, since without them a small number of physical nodes can get an uneven share of the keyspace.",
    mistakes: [
      "Not knowing why plain modulo hashing breaks when the node count changes",
      "Forgetting to mention virtual nodes as the fix for uneven distribution",
      "Confusing consistent hashing with simple round-robin load balancing",
    ],
    followUps: [
      "How do virtual nodes improve load distribution?",
      "What happens to a key's data when a node is removed — who takes ownership?",
      "How does DynamoDB use consistent hashing internally?",
    ],
    redFlags: [
      "Not being able to explain what happens to a hash % N scheme when N changes",
    ],
  },
  challenge: [
    {
      question: "What is the core problem with using hash(key) % N to assign keys to nodes?",
      options: [
        "It's too slow to compute",
        "Changing N (adding/removing a node) forces nearly all keys to be remapped to different nodes",
        "It only works with string keys",
        "It requires a database",
      ],
      correctIndex: 1,
      explanation:
        "Because the modulo depends directly on the total node count, any change to N shifts almost every key's assigned node — a massive, disruptive remap.",
    },
    {
      question: "In consistent hashing, roughly how many keys move when a single node is added to a cluster of N nodes?",
      options: ["All of them", "None", "Roughly 1/N of the keys", "Exactly half"],
      correctIndex: 2,
      explanation:
        "Only the keys in the arc between the new node and its counterclockwise neighbor are reassigned — roughly a 1/N share of the total keyspace.",
    },
  ],
};

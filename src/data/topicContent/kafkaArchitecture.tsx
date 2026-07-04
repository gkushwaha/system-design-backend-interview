import { KafkaArchitecture } from "@/components/visualizations/KafkaArchitecture";
import type { TopicContent } from "./types";

export const kafkaArchitecture: TopicContent = {
  visual: KafkaArchitecture,
  howItWorks: [
    {
      title: "Topics are split into partitions",
      description:
        "A Kafka topic is divided into multiple partitions, each an independent, ordered, append-only log. Splitting into partitions is what enables parallel writes and reads across a cluster.",
    },
    {
      title: "Producers choose a partition per message",
      description:
        "Producers typically hash a message key to consistently route related messages (e.g. all events for one user) to the same partition, preserving per-key order.",
      code: "partition = hash(key) % numPartitions",
    },
    {
      title: "Consumer groups split partitions among consumers",
      description:
        "Each partition is consumed by exactly one consumer within a given consumer group at a time. Multiple consumer groups can independently read the same topic from their own offsets.",
    },
    {
      title: "Offsets track progress per partition",
      description:
        "Each consumer tracks (and periodically commits) its offset — the position of the last message it processed — per partition, so it can resume exactly where it left off after a restart.",
    },
    {
      title: "In-Sync Replicas (ISR) balance durability and availability",
      description:
        "Each partition has a leader and follower replicas. A write is acknowledged once the ISR set (replicas caught up within an allowed lag) has it — a replica lagging too far behind is temporarily dropped from the ISR rather than blocking every write.",
    },
  ],
  tradeoffs: {
    pros: [
      "Partitioning enables massive horizontal scalability for both writes and reads",
      "Per-partition ordering combined with key-based routing gives useful ordering guarantees without a global lock",
      "Consumer groups allow independent, parallel consumption patterns without any coordination overhead per message",
    ],
    cons: [
      "No global ordering across partitions — only per-partition order is guaranteed",
      "Rebalancing (when consumers join/leave a group) briefly pauses consumption while partitions are reassigned",
      "Choosing the right number of partitions upfront is important — it can't be trivially reduced later",
    ],
    whenToUse: [
      "High-throughput event streaming: clickstreams, trip events, log aggregation",
      "Any system needing multiple independent consumers to replay the same event stream",
    ],
    whenNotToUse: [
      "Workloads needing strict global message ordering across all keys",
      "Simple point-to-point task queues where SQS's simplicity is a better fit",
    ],
    alternatives: [
      { name: "SQS", note: "Simpler managed point-to-point queue without partition/offset semantics" },
      { name: "Pulsar", note: "Similar partitioned log model with a more explicit separation of storage and serving layers" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd explain Kafka's core model as a partitioned, ordered, append-only log. I'd pick the partition key carefully — hashing on something like user_id or driver_id — so events for the same entity land on the same partition and stay ordered relative to each other, even though there's no global ordering across partitions. For consumption, I'd use consumer groups so multiple instances can process the topic in parallel, each owning a disjoint subset of partitions, with offsets committed periodically for fault tolerance. I'd also mention ISR: a write is only acknowledged once the in-sync replica set has it, which is how Kafka balances durability against waiting on a slow or dead replica.",
    mistakes: [
      "Assuming Kafka guarantees global message ordering across an entire topic",
      "Not knowing that the number of partitions constrains the maximum parallelism of a consumer group",
      "Confusing offset commits with message deletion — Kafka retains messages for a configured period regardless of consumption",
    ],
    followUps: [
      "What happens when a consumer group has more consumers than partitions?",
      "How would you choose the number of partitions for a new topic?",
      "What's the difference between at-least-once and exactly-once delivery in Kafka?",
    ],
    redFlags: [
      "Not knowing what a consumer group is",
      "Believing Kafka is a simple point-to-point queue like SQS",
    ],
  },
  challenge: [
    {
      question: "If a topic has 4 partitions and a consumer group has 6 consumers, what happens to the 2 extra consumers?",
      options: [
        "They process partitions twice as fast",
        "They sit idle — a partition can only be owned by one consumer per group at a time",
        "Kafka automatically creates 2 more partitions",
        "The extra consumers cause an error",
      ],
      correctIndex: 1,
      explanation:
        "Since each partition can only be assigned to one consumer within a group, having more consumers than partitions leaves the extras idle with nothing to consume.",
    },
    {
      question: "What is the purpose of the In-Sync Replica (ISR) set?",
      options: [
        "To decide which consumer gets which partition",
        "To acknowledge writes once a caught-up subset of replicas has them, without waiting on a lagging replica",
        "To compress messages before sending",
        "To assign partition keys to producers",
      ],
      correctIndex: 1,
      explanation:
        "The ISR lets Kafka acknowledge writes durably once the currently caught-up replicas have them, dropping a too-far-behind replica from the ISR rather than blocking every write on it.",
    },
  ],
};

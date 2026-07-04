import { MessageQueues } from "@/components/visualizations/MessageQueues";
import type { TopicContent } from "./types";

export const messageQueues: TopicContent = {
  visual: MessageQueues,
  howItWorks: [
    {
      title: "Producers and consumers are decoupled",
      description:
        "Instead of a producer calling a consumer directly (tight coupling, requires both to be up simultaneously), it publishes a message to a queue and moves on immediately.",
    },
    {
      title: "The queue buffers bursts",
      description:
        "If the producer temporarily outpaces the consumer, messages simply pile up in the queue instead of being dropped or blocking the producer — the consumer drains it at its own pace.",
    },
    {
      title: "Kafka: partitioned commit log",
      description:
        "Kafka stores messages in an ordered, append-only log split into partitions. Consumers track their own offset into the log, so multiple independent consumer groups can replay the same data.",
      code: "producer.send('trips-topic', partition=hash(driver_id) % N, value=event)\nconsumer.poll() // reads from its last committed offset",
    },
    {
      title: "SQS: visibility timeout + explicit ack",
      description:
        "SQS hides a message from other consumers for a configurable visibility timeout once it's received. If the consumer doesn't explicitly delete it before the timeout expires, it becomes visible again for redelivery — giving at-least-once delivery.",
    },
    {
      title: "RabbitMQ: flexible routing",
      description:
        "RabbitMQ routes messages through exchanges to one or more queues based on routing rules (direct, topic, fanout), making it well suited for pub/sub and complex routing topologies.",
    },
  ],
  tradeoffs: {
    pros: [
      "Decouples producers and consumers — either can be down without losing the other's work",
      "Absorbs traffic bursts and smooths out load spikes",
      "Enables async processing, retries, and horizontal scaling of consumers",
    ],
    cons: [
      "Adds an extra moving part and potential source of latency",
      "Message ordering guarantees vary and require care (Kafka: per-partition only)",
      "Requires reasoning about delivery semantics: at-least-once, at-most-once, exactly-once",
    ],
    whenToUse: [
      "Any workload where the producer and consumer operate at different speeds",
      "Event-driven architectures needing multiple independent consumers of the same event",
      "Background job processing (emails, image resizing, notifications)",
    ],
    whenNotToUse: [
      "Synchronous request/response flows needing an immediate answer (use direct RPC/HTTP instead)",
      "Extremely simple systems where the operational overhead of a queue isn't justified yet",
    ],
    alternatives: [
      { name: "Kafka", note: "High-throughput distributed log, best for event streaming and replayability" },
      { name: "SQS", note: "Fully managed, simple point-to-point queue with visibility timeouts" },
      { name: "RabbitMQ", note: "Flexible routing via exchanges, good for complex pub/sub topologies" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd introduce a message queue anywhere the producer and consumer run at different speeds, or need to be decoupled for reliability — for example, ingesting Uber trip events where downstream analytics shouldn't block the trip-completion API. I'd pick Kafka if I need high throughput, ordered replay, and multiple independent consumer groups reading the same stream; I'd pick SQS if I want a simple, fully-managed point-to-point queue without operating Kafka myself. I'd also explicitly discuss delivery semantics — most queues give at-least-once delivery, so consumers need to be idempotent.",
    mistakes: [
      "Not mentioning that most queues provide at-least-once delivery, requiring idempotent consumers",
      "Confusing Kafka's offset-based model with SQS's delete-based acknowledgment model",
      "Assuming a queue guarantees global ordering across all partitions/consumers",
    ],
    followUps: [
      "How do you handle a message that repeatedly fails processing (dead-letter queue)?",
      "How does Kafka guarantee ordering, and within what scope?",
      "What happens if a consumer crashes mid-processing in SQS vs Kafka?",
    ],
    redFlags: [
      "Not knowing what 'at-least-once delivery' means",
      "Claiming queues guarantee messages are processed exactly once with no extra work",
    ],
  },
  challenge: [
    {
      question: "What is the primary benefit of putting a queue between a fast producer and a slow consumer?",
      options: [
        "It makes the consumer faster",
        "It buffers the burst so messages aren't dropped, letting the consumer drain at its own pace",
        "It removes the need for the consumer entirely",
        "It guarantees zero latency",
      ],
      correctIndex: 1,
      explanation:
        "The queue decouples producer and consumer speeds — the producer can burst without overwhelming or blocking on the consumer.",
    },
    {
      question: "In SQS, what happens if a consumer receives a message but crashes before deleting it?",
      options: [
        "The message is permanently lost",
        "The message becomes visible again after the visibility timeout expires, for redelivery",
        "SQS automatically retries on the same consumer instance",
        "Nothing — it stays invisible forever",
      ],
      correctIndex: 1,
      explanation:
        "SQS's visibility timeout hides a message temporarily; if it isn't explicitly deleted in time, it reappears in the queue for another consumer to pick up.",
    },
  ],
};

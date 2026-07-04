import { OutboxPattern } from "@/components/visualizations/OutboxPattern";
import type { TopicContent } from "./types";

export const outboxPattern: TopicContent = {
  visual: OutboxPattern,
  howItWorks: [
    {
      title: "The dual write problem",
      description:
        "A service often needs to both update its own database AND publish an event about that change (e.g. save an order, then publish 'OrderCreated'). These are two separate systems — there's no way to make them succeed or fail together with a naive approach.",
    },
    {
      title: "Write the event to an outbox table, in the same transaction",
      description:
        "Instead of publishing directly to the message broker, the service writes the event as a row in an 'outbox' table, inside the exact same database transaction as the business data change.",
      code: "BEGIN;\n  INSERT INTO orders (...) VALUES (...);\n  INSERT INTO outbox (event_type, payload) VALUES ('OrderCreated', ...);\nCOMMIT;",
    },
    {
      title: "A separate relay process publishes outbox rows",
      description:
        "A background process (or a CDC tool like Debezium reading the database's write-ahead log) polls the outbox table for unpublished rows, publishes them to the message broker, and marks them as sent.",
    },
    {
      title: "At-least-once delivery, deduplicated downstream",
      description:
        "If the relay crashes after publishing but before marking a row as sent, it might publish the same event twice on restart — so downstream consumers need to handle duplicate events idempotently.",
    },
    {
      title: "Why this solves the dual write problem",
      description:
        "Because the business data and the outbox event are written in one atomic database transaction, they can never diverge — either both happen, or neither does. The message broker publish becomes a reliable, retryable background step instead of a fragile inline call.",
    },
  ],
  tradeoffs: {
    pros: [
      "Eliminates the silent-data-loss window where a DB write succeeds but the event publish fails",
      "Keeps the event log durable and replayable even if the message broker is temporarily down",
      "Works with any database that supports transactions — no exotic infrastructure required",
    ],
    cons: [
      "Adds an extra table and a relay process that must itself be monitored and kept running",
      "Introduces latency between the DB write and the event actually being published",
      "Consumers must handle duplicate events (at-least-once delivery), adding idempotency requirements downstream",
    ],
    whenToUse: [
      "Any service that must reliably publish an event whenever it changes its own data (order creation, payment processing, inventory updates)",
      "Systems already using CDC (Debezium) where reading the outbox table via the WAL is nearly free",
    ],
    whenNotToUse: [
      "Simple internal tools where an occasional missed event is genuinely inconsequential",
      "Systems that can tolerate using a full distributed transaction (2PC) instead, though that has its own costs",
    ],
    alternatives: [
      { name: "Change Data Capture (CDC)", note: "Tools like Debezium read the DB's write-ahead log directly, treating the whole table as an implicit outbox" },
      { name: "Two-phase commit (2PC)", note: "A more general but heavier-weight distributed transaction protocol across the DB and broker" },
      { name: "Event sourcing", note: "Skips the dual-write problem structurally by making the event log itself the source of truth" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd use the outbox pattern anywhere a service needs to atomically update its own data and reliably notify other services — for example, an order service that must publish 'OrderCreated' once an order is saved. Rather than calling the message broker directly after the DB commit (which can silently fail, losing the event), I'd write the event as a row in an outbox table within the same database transaction as the order insert. A separate relay process — ideally a CDC tool like Debezium reading the database's write-ahead log — then publishes outbox rows to Kafka and marks them sent. I'd flag that this gives at-least-once delivery, so downstream consumers need to be idempotent against duplicate events.",
    mistakes: [
      "Publishing directly to the message broker right after the DB commit, without acknowledging the dual-write failure window",
      "Not having a plan for what happens if the relay process crashes after publishing but before marking the row sent",
      "Assuming the outbox pattern gives exactly-once delivery rather than at-least-once",
    ],
    followUps: [
      "How would you prevent the relay process from becoming a bottleneck or single point of failure?",
      "How do downstream consumers handle a duplicate event caused by an outbox relay retry?",
      "How does using Debezium/CDC differ from a custom polling relay process?",
    ],
    redFlags: [
      "Not recognizing the dual-write problem as a real, distinct failure mode",
      "Proposing a distributed transaction across the DB and message broker as if that were simple to implement",
    ],
  },
  challenge: [
    {
      question: "What specific problem does the transactional outbox pattern solve?",
      options: [
        "It makes database writes faster",
        "The dual-write problem — ensuring a DB update and a message publish either both happen or neither does",
        "It replaces the need for a message queue entirely",
        "It encrypts messages in transit",
      ],
      correctIndex: 1,
      explanation:
        "The outbox pattern makes the event-publishing step part of the same atomic database transaction as the business data change, closing the window where one could succeed while the other silently fails.",
    },
    {
      question: "Why must downstream consumers of outbox-relayed events be idempotent?",
      options: [
        "They don't need to be — outbox guarantees exactly-once delivery",
        "The relay process can publish the same event more than once if it crashes between publishing and marking it sent, giving at-least-once delivery",
        "Idempotency is unrelated to the outbox pattern",
        "Because the outbox table has no primary key",
      ],
      correctIndex: 1,
      explanation:
        "If the relay crashes after successfully publishing but before recording that success, it will retry and publish the same event again on restart — consumers need to handle that duplicate safely.",
    },
  ],
};

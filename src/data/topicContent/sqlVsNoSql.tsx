import { SqlVsNoSql } from "@/components/visualizations/SqlVsNoSql";
import type { TopicContent } from "./types";

export const sqlVsNoSql: TopicContent = {
  visual: SqlVsNoSql,
  howItWorks: [
    {
      title: "SQL: define the schema first",
      description:
        "Relational databases require a fixed schema up front — tables, columns, types, and foreign key relationships. Every row must conform.",
      code: "CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email TEXT UNIQUE NOT NULL,\n  plan_id INT REFERENCES plans(id)\n);",
    },
    {
      title: "SQL: query with joins",
      description:
        "Because data is normalized across tables, complex questions ('all users on a paid plan who logged in this week') are expressed with joins and are enforced for correctness by the query planner.",
      code: "SELECT u.email FROM users u\nJOIN plans p ON p.id = u.plan_id\nWHERE p.tier = 'pro';",
    },
    {
      title: "NoSQL: store denormalized documents",
      description:
        "Document stores like MongoDB embed related data directly in one document, trading normalization for read speed — no join needed to render a user's profile page.",
    },
    {
      title: "NoSQL: scale by partitioning",
      description:
        "Wide-column stores like Cassandra partition data across many nodes by a partition key, enabling near-linear write throughput as you add nodes — at the cost of ad-hoc query flexibility.",
    },
    {
      title: "The real decision: access patterns, not preference",
      description:
        "The right choice depends on how data will be read and written, not personal taste. Design the schema (or document shape) around your query patterns, not the other way around.",
    },
  ],
  tradeoffs: {
    pros: [
      "SQL: strong consistency (ACID), rich query language, mature tooling and joins",
      "NoSQL: horizontal scale, flexible schema, often lower latency for simple key-based lookups",
    ],
    cons: [
      "SQL: harder to shard horizontally, schema migrations can be painful at scale",
      "NoSQL: weaker consistency guarantees by default, joins must be done in application code",
    ],
    whenToUse: [
      "SQL — financial systems, anything needing multi-row transactions",
      "SQL — complex reporting and ad-hoc analytical queries",
      "NoSQL — massive write-heavy workloads (IoT, event streams, time series)",
      "NoSQL — rapidly evolving schemas early in a product's life",
    ],
    whenNotToUse: [
      "Don't pick NoSQL just because it's trendy — most apps fit comfortably on Postgres",
      "Don't pick SQL if you genuinely need multi-region, multi-master writes at massive scale",
    ],
    alternatives: [
      { name: "NewSQL (CockroachDB, Spanner)", note: "SQL semantics with horizontal scalability — best of both, at operational cost" },
      { name: "Multi-model (Postgres + JSONB)", note: "Use a relational DB with JSON columns for the flexible parts of your schema" },
      { name: "Polyglot persistence", note: "Use SQL for the source of truth and a NoSQL cache/search index alongside it" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd start from the access patterns, not the label. If the system needs multi-row transactions, complex joins, or strict consistency — like a banking ledger — I reach for a relational database. If the dominant pattern is high-volume writes with simple key-based reads, or the schema will change frequently early on, a document or wide-column store fits better. I'd also mention that many real systems are polyglot: Postgres as the source of truth, with Redis or Elasticsearch alongside for specific access patterns.",
    mistakes: [
      "Treating this as a binary religious choice instead of an access-pattern decision",
      "Not knowing that NoSQL databases can still support transactions (just differently, e.g. MongoDB multi-document transactions)",
      "Ignoring that most products never actually need NoSQL-scale write throughput",
    ],
    followUps: [
      "How would you migrate a schema in a NoSQL system if the shape of your data changes?",
      "How do you handle a `JOIN`-like query in a document store?",
      "What does eventual consistency mean for a NoSQL system, concretely?",
    ],
    redFlags: [
      "Claiming SQL 'doesn't scale' as a blanket statement",
      "Not being able to name a single NoSQL database or its consistency model",
    ],
  },
  challenge: [
    {
      question: "Which factor most strongly pushes you toward a NoSQL database?",
      options: [
        "You need strict multi-table transactional consistency",
        "You expect massive, horizontally distributed write throughput",
        "You need complex ad-hoc joins across many entities",
        "Your team has never used a database before",
      ],
      correctIndex: 1,
      explanation:
        "NoSQL databases like Cassandra are purpose-built to scale write throughput horizontally across many commodity nodes, at the cost of join flexibility.",
    },
    {
      question: "What's the main tradeoff when denormalizing data into a single NoSQL document?",
      options: [
        "Reads become slower",
        "You gain read speed but must keep duplicated data consistent yourself",
        "You lose the ability to store any relationships at all",
        "It only works with SQL databases",
      ],
      correctIndex: 1,
      explanation:
        "Denormalization trades write-time complexity (keeping copies in sync) for read-time simplicity (no join needed).",
    },
  ],
};

import { DatabaseIndexing } from "@/components/visualizations/DatabaseIndexing";
import type { TopicContent } from "./types";

export const databaseIndexing: TopicContent = {
  visual: DatabaseIndexing,
  howItWorks: [
    {
      title: "Without an index: full table scan",
      description:
        "The database has no shortcut — it reads every single row to find matches. Cost grows linearly (O(n)) with table size.",
      code: "SELECT * FROM users WHERE email = 'ada@x.com';\n-- Seq Scan on users (cost=0.00..18334.00 rows=1)",
    },
    {
      title: "B-tree index: a sorted lookup structure",
      description:
        "An index maintains a separate, sorted tree structure mapping column values to row locations. Finding a value takes O(log n) — a handful of node hops instead of scanning millions of rows.",
      code: "CREATE INDEX idx_users_email ON users(email);\n-- Index Scan using idx_users_email (cost=0.43..8.45 rows=1)",
    },
    {
      title: "Composite indexes follow left-to-right rules",
      description:
        "An index on (last_name, first_name) speeds up queries filtering by last_name, or by last_name AND first_name — but NOT queries filtering by first_name alone.",
    },
    {
      title: "Covering indexes avoid a second lookup",
      description:
        "If an index contains every column the query needs (via INCLUDE or just being part of the index), the database never has to go back to the actual table row — a pure index-only scan.",
    },
    {
      title: "Indexes aren't free",
      description:
        "Every index speeds up reads but slows down writes (insert/update/delete must maintain the index too) and takes extra disk space. Index what you query, not everything.",
    },
  ],
  tradeoffs: {
    pros: [
      "Turns O(n) lookups into O(log n) — orders of magnitude faster on large tables",
      "Composite and covering indexes can eliminate table lookups entirely",
    ],
    cons: [
      "Every write (INSERT/UPDATE/DELETE) must also update all relevant indexes, adding overhead",
      "Indexes consume additional disk space, sometimes more than the table itself",
      "Too many indexes on a write-heavy table can hurt more than it helps",
    ],
    whenToUse: [
      "Columns frequently used in WHERE, JOIN, or ORDER BY clauses",
      "High-cardinality columns (many distinct values) benefit the most",
    ],
    whenNotToUse: [
      "Low-cardinality columns (e.g. a boolean flag) rarely benefit from a standalone index",
      "Write-heavy tables where read patterns are rare or unpredictable",
    ],
    alternatives: [
      { name: "Partial index", note: "Index only rows matching a condition (e.g. WHERE active = true) to save space" },
      { name: "Full-text index", note: "Specialized index type for text search instead of exact-match B-tree lookups" },
      { name: "Materialized view", note: "Precompute an entire query result instead of speeding up the lookup itself" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd identify the columns used in the app's most frequent WHERE/JOIN/ORDER BY clauses and index those first, since indexing everything hurts write performance. For multi-column filters I'd use a composite index ordered by selectivity and query pattern — remembering it only helps left-to-right. If a query only needs a few columns, I'd consider a covering index so Postgres never touches the underlying table row. I'd also mention EXPLAIN ANALYZE as the tool to confirm the planner is actually using the index I expect.",
    mistakes: [
      "Adding an index to every column 'just in case' without considering write overhead",
      "Not knowing that composite indexes only help queries filtering the leftmost columns",
      "Forgetting to verify with EXPLAIN that the index is actually being used",
    ],
    followUps: [
      "How would you decide the column order in a composite index?",
      "What's the tradeoff of adding an index on a write-heavy table?",
      "How do you find which queries are missing an index in production?",
    ],
    redFlags: [
      "Claiming indexes have no downside",
      "Not knowing the difference between a B-tree and a full-text index",
    ],
  },
  challenge: [
    {
      question: "Why does an index speed up lookups from O(n) to roughly O(log n)?",
      options: [
        "It stores a duplicate of the entire table in memory",
        "It maintains a sorted tree structure that narrows the search space at each step",
        "It compresses the table data",
        "It disables write operations",
      ],
      correctIndex: 1,
      explanation:
        "A B-tree index is a sorted structure — each comparison eliminates roughly half the remaining candidates, giving logarithmic lookup time.",
    },
    {
      question: "A composite index on (last_name, first_name) will speed up a query filtering only by:",
      options: ["first_name alone", "last_name alone, or last_name AND first_name", "Neither column alone", "Any column in the table"],
      correctIndex: 1,
      explanation:
        "Composite indexes are usable left-to-right — filtering by the leading column(s) benefits, but skipping the leading column does not.",
    },
  ],
};

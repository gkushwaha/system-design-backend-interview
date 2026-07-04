import { CachingPatterns } from "@/components/visualizations/CachingPatterns";
import type { TopicContent } from "./types";

export const cachingPatterns: TopicContent = {
  visual: CachingPatterns,
  howItWorks: [
    {
      title: "Cache-aside (lazy loading)",
      description:
        "The application checks the cache first. On a miss, it reads from the database and writes the result into the cache for next time. Simple and the most common pattern in practice.",
      code: "value = cache.get(key)\nif value is None:\n    value = db.query(key)\n    cache.set(key, value, ttl=300)\nreturn value",
    },
    {
      title: "Write-through",
      description:
        "Every write goes to the cache, and the cache synchronously writes through to the database before returning. Keeps cache and DB perfectly in sync, at the cost of write latency.",
    },
    {
      title: "Write-back (write-behind)",
      description:
        "Writes land in the cache immediately and are asynchronously flushed to the database later, often batched. Very fast writes, but a cache crash before flush means data loss.",
    },
    {
      title: "Read-through",
      description:
        "Similar to cache-aside, but the loading logic lives inside the caching library itself rather than the application — the app just asks the cache, and the cache handles the DB fetch transparently.",
    },
    {
      title: "Invalidation is the hard part",
      description:
        "\"There are only two hard things in Computer Science: cache invalidation and naming things.\" TTLs, explicit invalidation on write, and versioned keys are the three main strategies.",
    },
  ],
  tradeoffs: {
    pros: [
      "Dramatically reduces database load for read-heavy workloads",
      "Sub-millisecond response times for cached data vs tens of milliseconds for a DB round trip",
      "Write-back absorbs write bursts without hammering the database",
    ],
    cons: [
      "Cache invalidation bugs cause stale data — one of the hardest classes of bugs to debug",
      "Write-back risks data loss if the cache crashes before flushing to durable storage",
      "Adds an extra moving part (and failure mode) to the system",
    ],
    whenToUse: [
      "Read-heavy workloads with data that doesn't change every request (feeds, product catalogs, sessions)",
      "Write-back specifically — high write volume where slight durability risk is acceptable (analytics counters)",
    ],
    whenNotToUse: [
      "Data that must always be perfectly fresh (real-time account balances)",
      "Very low read volume where the cache overhead isn't worth the complexity",
    ],
    alternatives: [
      { name: "CDN caching", note: "Cache at the edge for static or semi-static content, closer to the user" },
      { name: "Materialized views", note: "Precompute expensive queries inside the database itself instead of an external cache" },
      { name: "No cache, faster DB", note: "Sometimes proper indexing + read replicas solve the problem without adding a cache layer" },
    ],
  },
  interviewAnswer: {
    script:
      "For most read-heavy features I default to cache-aside with Redis: check the cache, fall back to the DB on a miss, and set a TTL so stale data self-heals even if I miss an invalidation. For write-through I'd only reach for it if I need the cache and DB to always agree, and can tolerate the write latency. Write-back is for very high write throughput where I control durability trade-offs, like ad-click counters. I'd also explicitly mention invalidation strategy — TTL versus explicit invalidation on write — since that's usually the actual hard part of caching, not which pattern to pick.",
    mistakes: [
      "Not mentioning cache invalidation at all — it's usually the crux of the design",
      "Assuming a cache removes the need to think about database indexing",
      "Choosing write-back without acknowledging the durability risk",
    ],
    followUps: [
      "How do you avoid a cache stampede when a hot key expires?",
      "How would you invalidate a cached value when the underlying row changes?",
      "What happens to your system if the cache goes down entirely?",
    ],
    redFlags: [
      "Not knowing what a TTL is",
      "Suggesting caching is a substitute for a properly indexed database",
    ],
  },
  challenge: [
    {
      question: "In cache-aside, who is responsible for loading data into the cache on a miss?",
      options: [
        "The cache itself, automatically",
        "The application code",
        "The database",
        "A separate background cron job only",
      ],
      correctIndex: 1,
      explanation:
        "Cache-aside means the application explicitly checks the cache, and on a miss, loads from the DB and populates the cache itself.",
    },
    {
      question: "What is the main risk of the write-back (write-behind) caching pattern?",
      options: [
        "It's too slow for high write volume",
        "Data can be lost if the cache crashes before flushing to the database",
        "It requires no cache at all",
        "It can never be used with Redis",
      ],
      correctIndex: 1,
      explanation:
        "Because writes are acknowledged before reaching durable storage, a cache crash before the async flush means those writes are gone.",
    },
  ],
};

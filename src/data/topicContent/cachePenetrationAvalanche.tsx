import { CachePenetrationAvalanche } from "@/components/visualizations/CachePenetrationAvalanche";
import type { TopicContent } from "./types";

export const cachePenetrationAvalanche: TopicContent = {
  visual: CachePenetrationAvalanche,
  howItWorks: [
    {
      title: "Penetration: requests for data that doesn't exist anywhere",
      description:
        "A malicious or buggy client repeatedly requests a key that isn't in the cache and isn't in the database either. Every request pointlessly falls through to the DB since there's nothing to cache.",
      code: "// fix: cache the 'not found' result too, or use a Bloom filter\nif not bloomFilter.mightExist(key): return NOT_FOUND  // never even queries DB",
    },
    {
      title: "Avalanche: mass simultaneous expiration",
      description:
        "Many keys were cached at the same time with the same TTL, so they all expire at the same instant — sending a simultaneous flood of requests to the database.",
      code: "ttl = baseTtl + random(0, 300) // jitter prevents synchronized expiry",
    },
    {
      title: "Breakdown: one hot key expires",
      description:
        "A single extremely popular key (a trending post, a celebrity's profile) expires, and thousands of concurrent requests all miss the cache simultaneously, hammering the DB with the same query.",
    },
    {
      title: "Fix: mutex / single-flight rebuild",
      description:
        "When a hot key misses, only the first request is allowed to query the DB and repopulate the cache; concurrent requests for the same key wait for that result instead of all hitting the DB independently.",
    },
    {
      title: "Fix: jittered TTLs + Bloom filters",
      description:
        "Adding random jitter to TTLs prevents synchronized avalanches. A Bloom filter in front of the cache cheaply rejects requests for keys that provably don't exist, preventing penetration.",
    },
  ],
  tradeoffs: {
    pros: [
      "These mitigations add real resilience against both malicious traffic and unlucky timing",
      "Bloom filters are extremely cheap (memory and CPU) relative to the DB load they prevent",
      "Mutex/single-flight rebuild is simple to implement and dramatically reduces DB spikes",
    ],
    cons: [
      "Bloom filters have false positives (rarely let through a request for a truly nonexistent key)",
      "Mutex-based rebuild adds latency for the unlucky first request, and complexity for distributed locks across app servers",
      "Jittered TTLs make cache expiry timing less predictable for debugging",
    ],
    whenToUse: [
      "Any public-facing cache layer that could be probed with invalid keys",
      "Any system with 'hot key' access patterns (viral content, celebrity accounts)",
    ],
    whenNotToUse: [
      "Low-traffic internal caches where a DB spike from simultaneous expiry is inconsequential",
    ],
    alternatives: [
      { name: "Never-expire + async refresh", note: "Serve stale data while refreshing in the background instead of letting keys ever fully miss" },
      { name: "Request coalescing at the load balancer", note: "Deduplicate identical in-flight requests before they even reach the cache layer" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd distinguish the three failure modes clearly. For cache penetration — requests for keys that don't exist anywhere — I'd use a Bloom filter in front of the cache to cheaply reject requests for provably nonexistent keys, or cache the 'not found' result briefly. For cache avalanche — many keys expiring simultaneously — I'd add random jitter to TTLs so expirations spread out instead of clustering. For cache breakdown on a single hot key, I'd use a mutex or single-flight pattern so only one request rebuilds the cache while others wait, instead of all of them hammering the database at once.",
    mistakes: [
      "Treating penetration, avalanche, and breakdown as the same problem with the same fix",
      "Not knowing that TTL jitter is the standard fix for avalanche",
      "Forgetting that a naive cache-aside implementation has no protection against a hot key stampede",
    ],
    followUps: [
      "How would you implement single-flight/mutex rebuild across multiple app server instances?",
      "What's the tradeoff of using a Bloom filter to prevent cache penetration?",
      "How would you detect a cache avalanche is happening in production?",
    ],
    redFlags: [
      "Not knowing what a cache stampede is",
      "Suggesting a longer TTL as the fix for all three problems",
    ],
  },
  challenge: [
    {
      question: "Which technique specifically prevents 'cache avalanche' (many keys expiring at once)?",
      options: ["A Bloom filter", "Adding random jitter to TTLs", "A mutex on cache rebuild", "Using a bigger cache"],
      correctIndex: 1,
      explanation:
        "Jittering TTLs spreads out expiration times so keys don't all expire simultaneously, preventing a synchronized flood of DB requests.",
    },
    {
      question: "What problem does a mutex/single-flight pattern solve when a hot key expires?",
      options: [
        "It prevents the key from ever expiring",
        "It ensures only one request rebuilds the cache while concurrent requests for the same key wait, instead of all hitting the DB",
        "It encrypts the cached value",
        "It makes the database faster",
      ],
      correctIndex: 1,
      explanation:
        "Cache breakdown happens when many concurrent requests for the same expired hot key all miss simultaneously; a mutex ensures only one rebuilds the cache while the rest wait for that result.",
    },
  ],
};

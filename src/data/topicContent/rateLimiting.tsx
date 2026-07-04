import { RateLimiting } from "@/components/visualizations/RateLimiting";
import type { TopicContent } from "./types";

export const rateLimiting: TopicContent = {
  visual: RateLimiting,
  howItWorks: [
    {
      title: "Token bucket: the most common algorithm",
      description:
        "A bucket holds up to N tokens. Each request consumes one token; tokens refill continuously at a fixed rate. If the bucket is empty, the request is rejected with a 429.",
      code: "if bucket.tokens >= 1:\n    bucket.tokens -= 1\n    return allow()\nreturn reject(429)",
    },
    {
      title: "Bursts are allowed, sustained rate is capped",
      description:
        "Because tokens can accumulate up to the bucket's capacity while idle, a client can burst up to that capacity instantly, but is capped to the refill rate over any sustained period.",
    },
    {
      title: "Sliding window vs fixed window",
      description:
        "Fixed window (e.g. 'max 100 requests per calendar minute') is simple but allows a 2x burst at window boundaries. Sliding window log/counter algorithms smooth this out at the cost of more memory or computation.",
    },
    {
      title: "Rate limiting must be centralized across nodes",
      description:
        "If each app server keeps its own in-memory counter, a client can get N times the intended limit by spreading requests across N servers. A shared store (Redis) with an atomic INCR + TTL fixes this.",
      code: "local key = KEYS[1]\nlocal count = redis.call('INCR', key)\nif count == 1 then redis.call('EXPIRE', key, 60) end\nreturn count <= tonumber(ARGV[1])",
    },
    {
      title: "Where to enforce it",
      description:
        "Rate limiting can live at the API gateway/edge (protects the whole system, coarse-grained), or per-service/per-endpoint (fine-grained, e.g. stricter limits on expensive endpoints).",
    },
  ],
  tradeoffs: {
    pros: [
      "Protects backend services from being overwhelmed by a single client or bug",
      "Enables fair usage across customers on shared infrastructure",
      "Token bucket specifically allows reasonable bursts without being overly strict",
    ],
    cons: [
      "Adds a dependency (Redis or similar) if enforced consistently across many nodes",
      "Poorly tuned limits create false positives that frustrate legitimate users",
      "Fixed window algorithms allow boundary bursts if not carefully designed",
    ],
    whenToUse: [
      "Any public API to prevent abuse and ensure fair usage",
      "Protecting expensive downstream operations (search, ML inference, third-party API calls)",
    ],
    whenNotToUse: [
      "Purely internal, trusted, low-traffic service-to-service calls where the operational overhead isn't justified",
    ],
    alternatives: [
      { name: "Leaky bucket", note: "Processes requests at a constant output rate regardless of input burstiness" },
      { name: "Fixed window counter", note: "Simplest to implement, but allows a 2x burst at window boundaries" },
      { name: "Sliding window log", note: "Most accurate, tracks exact timestamps, but higher memory cost per key" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd implement rate limiting with a token bucket per API key, stored in Redis so the limit is enforced consistently regardless of which app server handles the request — using an atomic Lua script or Redis's INCR+EXPIRE to avoid race conditions. I'd pick token bucket specifically because it allows reasonable bursts (useful for legitimate clients doing batch operations) while still capping the sustained rate. For a multi-tenant API like Stripe's, I'd also expose the remaining quota via response headers so clients can back off proactively instead of hitting 429s blindly.",
    mistakes: [
      "Implementing rate limiting with per-server in-memory counters in a multi-server deployment",
      "Not handling the race condition when multiple requests check-then-decrement the counter concurrently",
      "Choosing a fixed window without acknowledging the boundary-burst problem",
    ],
    followUps: [
      "How do you avoid a race condition when two requests check the counter at the same time?",
      "How would you rate limit per-user versus per-IP, and why might you need both?",
      "What should the API return when a client is rate limited?",
    ],
    redFlags: [
      "Not knowing what a 429 status code means",
      "Suggesting per-server counters work fine in a horizontally scaled deployment",
    ],
  },
  challenge: [
    {
      question: "Why does a token bucket algorithm allow short bursts of traffic while still enforcing a long-term rate limit?",
      options: [
        "It doesn't — it always rejects any burst",
        "Tokens accumulate up to the bucket's capacity while idle, so a client can spend them all at once, but refill rate caps sustained throughput",
        "It only limits requests during business hours",
        "It ignores request rate entirely",
      ],
      correctIndex: 1,
      explanation:
        "The bucket's capacity allows instantaneous bursts up to that size, while the refill rate governs the maximum sustained rate over time.",
    },
    {
      question: "Why is a per-server, in-memory rate limit counter problematic in a horizontally scaled deployment?",
      options: [
        "It's not problematic at all",
        "A client can bypass the intended global limit by spreading requests across multiple servers, each with its own independent counter",
        "In-memory counters are always slower than Redis",
        "It only works for GET requests",
      ],
      correctIndex: 1,
      explanation:
        "Without a shared, centralized counter (like Redis), each server enforces its own local limit, letting a client multiply their effective global limit by the number of servers.",
    },
  ],
};

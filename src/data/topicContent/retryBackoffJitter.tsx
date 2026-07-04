import { RetryBackoffJitter } from "@/components/visualizations/RetryBackoffJitter";
import type { TopicContent } from "./types";

export const retryBackoffJitter: TopicContent = {
  visual: RetryBackoffJitter,
  howItWorks: [
    {
      title: "Naive retry: fixed delay",
      description:
        "Retrying immediately (or after a fixed delay) after a failure seems reasonable, but if the downstream service is struggling under load, an immediate retry from every failed client just adds to the pile-on.",
    },
    {
      title: "Exponential backoff: give the dependency room to recover",
      description:
        "Each retry waits longer than the last — typically doubling — capped at some maximum, so a struggling service gets progressively more breathing room instead of constant hammering.",
      code: "delay = min(cap, base * 2^(attempt - 1))",
    },
    {
      title: "Jitter: avoid synchronized retries",
      description:
        "If every client computes the exact same exponential delay, they all retry at the same instant — recreating the exact spike that caused the failure. Adding randomness (jitter) to each client's delay spreads retries out over time.",
      code: "delay = random(0, min(cap, base * 2^(attempt - 1)))  // 'full jitter'",
    },
    {
      title: "Cap the maximum delay and retry count",
      description:
        "Without a cap, exponential backoff can grow delays absurdly large. Real implementations cap the maximum delay and give up after a bounded number of attempts, surfacing a clear failure instead of retrying forever.",
    },
    {
      title: "Only retry idempotent (or idempotency-keyed) operations",
      description:
        "Retrying a non-idempotent operation (like a payment charge) without an idempotency key risks duplicating the side effect — retries are only safe when the operation can be repeated without unintended consequences.",
    },
  ],
  tradeoffs: {
    pros: [
      "Exponential backoff meaningfully reduces load on a recovering dependency compared to fixed-interval retries",
      "Jitter prevents the retry storm from recreating the very outage it's recovering from",
      "Simple to implement as a wrapper around any outbound call",
    ],
    cons: [
      "Retries add latency to the calling code path, which needs a sensible overall timeout budget",
      "Blind retries on non-idempotent operations can cause duplicate side effects",
      "Too aggressive a retry policy can still overwhelm a genuinely down dependency",
    ],
    whenToUse: [
      "Calls to external services or dependencies that can have transient failures (network blips, brief overload)",
      "Any client library making outbound calls to another service — this should almost always be the default",
    ],
    whenNotToUse: [
      "Non-idempotent operations without an idempotency key — retrying blindly there risks duplicated side effects",
      "When a circuit breaker has already tripped open — retrying into a known-down dependency just wastes resources; fail fast instead",
    ],
    alternatives: [
      { name: "Circuit breaker", note: "Complementary — stops retrying entirely once failures cross a sustained threshold" },
      { name: "Retry budgets", note: "Cap the total fraction of traffic that can be retries cluster-wide, preventing retry amplification" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd wrap any outbound call to another service with exponential backoff plus full jitter — doubling the delay each attempt, capped at some maximum, and randomizing the actual delay within that range so many clients failing at once don't all retry in lockstep and recreate the exact spike that caused the outage. I'd cap both the maximum delay and the number of attempts, so a client fails clearly rather than retrying indefinitely. I'd also be careful to only apply this to idempotent operations, or pair it with an idempotency key for things like payments, since blind retries on non-idempotent calls risk duplicating side effects. And I'd pair this with a circuit breaker — once failures are sustained rather than transient, I'd rather fail fast than keep retrying into a dependency that's clearly down.",
    mistakes: [
      "Using a fixed retry delay, which can recreate a synchronized 'thundering herd' against a recovering service",
      "Not adding jitter, even with exponential backoff",
      "Retrying non-idempotent operations without considering duplicate side effects",
    ],
    followUps: [
      "What's the difference between 'full jitter' and 'equal jitter'?",
      "How would you decide the maximum number of retry attempts and overall timeout budget?",
      "How does this interact with a circuit breaker in the same call path?",
    ],
    redFlags: [
      "Not knowing what a 'thundering herd' is",
      "Suggesting infinite retries with no cap",
    ],
  },
  challenge: [
    {
      question: "Why is jitter added on top of exponential backoff, rather than using exponential backoff alone?",
      options: [
        "Jitter makes retries happen faster",
        "Without jitter, many clients retrying after the same failure compute identical delays and retry in a synchronized spike",
        "Jitter is only cosmetic and has no functional purpose",
        "It reduces the number of retry attempts needed",
      ],
      correctIndex: 1,
      explanation:
        "Pure exponential backoff still lets many clients compute the exact same delay after a shared failure, causing them all to retry simultaneously — jitter randomizes each client's delay to spread that load out.",
    },
    {
      question: "Why is it risky to blindly retry a non-idempotent operation like a payment charge?",
      options: [
        "It isn't risky at all",
        "A retry after a partial failure could duplicate the side effect, e.g. charging the customer twice",
        "Retries always fail for non-idempotent operations",
        "It has no relationship to idempotency",
      ],
      correctIndex: 1,
      explanation:
        "If the original request actually succeeded server-side but the client didn't receive confirmation, a blind retry could trigger the operation again — hence the need for idempotency keys on sensitive operations.",
    },
  ],
};

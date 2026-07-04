import { CircuitBreaker } from "@/components/visualizations/CircuitBreaker";
import type { TopicContent } from "./types";

export const circuitBreaker: TopicContent = {
  visual: CircuitBreaker,
  howItWorks: [
    {
      title: "Closed: requests flow normally",
      description:
        "In the closed state, every request passes through to the downstream dependency as usual. The breaker counts recent failures in the background.",
    },
    {
      title: "Threshold crossed → Open",
      description:
        "Once failures cross a configured threshold (e.g. 3 consecutive failures, or 50% error rate over a window), the breaker trips to Open. All subsequent requests fail immediately without calling the downstream service at all.",
      code: "if consecutive_failures >= threshold:\n    state = OPEN\n    open_until = now() + cooldown",
    },
    {
      title: "Open: fail fast",
      description:
        "While open, requests return an error (or a fallback) instantly — no network call, no timeout wait. This protects the caller's own resources (threads, connections) from being consumed waiting on a service that's already down.",
    },
    {
      title: "Cooldown expires → Half-Open",
      description:
        "After a cooldown period, the breaker allows a single 'probe' request through to test if the downstream has recovered, without yet committing to fully reopening traffic.",
    },
    {
      title: "Half-Open: one probe decides the outcome",
      description:
        "If the probe request succeeds, the breaker closes and traffic resumes normally. If it fails, the breaker reopens and the cooldown starts again.",
    },
  ],
  tradeoffs: {
    pros: [
      "Prevents cascading failures by failing fast instead of exhausting resources waiting on a dead dependency",
      "Gives a failing service breathing room to recover instead of being hammered with retries",
      "Enables graceful degradation via fallback responses instead of a hard user-facing error",
    ],
    cons: [
      "Adds state and configuration complexity (thresholds, cooldown windows) that need tuning",
      "A poorly tuned threshold can trip on transient blips, or fail to trip during a real outage",
      "Fallback behavior must be designed thoughtfully — a bad fallback can mask real problems",
    ],
    whenToUse: [
      "Calls to external services or dependencies that can be slow or fail (third-party APIs, other microservices)",
      "Any system where one failing dependency could otherwise exhaust shared resources (thread pools, connection pools)",
    ],
    whenNotToUse: [
      "Calls to fully local, in-process logic with no network or external failure mode",
      "One-off scripts or batch jobs where a hard failure and manual retry is acceptable",
    ],
    alternatives: [
      { name: "Bulkhead pattern", note: "Isolates resources per-dependency so one slow dependency can't starve others, often paired with circuit breakers" },
      { name: "Retry with backoff", note: "Complementary — retries handle transient blips, circuit breakers handle sustained outages" },
      { name: "Timeouts alone", note: "Simpler but doesn't prevent a slow-but-not-yet-failed dependency from still consuming resources on every call" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd add a circuit breaker around any call to a dependency that can fail or slow down — the pattern Netflix pioneered with Hystrix, though Netflix has since moved to resilience4j and it's now the standard library on the JVM. The key behavior I'd describe is the three states: closed (normal), open (fail fast once failures cross a threshold, protecting our own thread pool from being exhausted), and half-open (a single probe request after a cooldown to test recovery before fully reopening). I'd also pair it with a sensible fallback — a cached or default response — so users see graceful degradation instead of a hard error, and with a bulkhead so one failing dependency's exhausted connections don't starve calls to other, healthy dependencies.",
    mistakes: [
      "Confusing a circuit breaker with a simple retry mechanism — they solve different problems",
      "Not mentioning the half-open probe state, jumping straight from open back to closed",
      "Forgetting to design a sensible fallback for when the circuit is open",
    ],
    followUps: [
      "How would you choose the failure threshold and cooldown duration?",
      "What's the difference between a circuit breaker and a bulkhead?",
      "How do you avoid the half-open probe itself getting overwhelmed by concurrent requests?",
    ],
    redFlags: [
      "Not knowing the three states of a circuit breaker",
      "Suggesting retries alone are a substitute for a circuit breaker under sustained failure",
    ],
  },
  challenge: [
    {
      question: "What happens to requests while a circuit breaker is in the OPEN state?",
      options: [
        "They wait the full timeout and then get retried automatically",
        "They fail immediately without calling the downstream dependency at all",
        "They are queued indefinitely until the circuit closes",
        "Nothing changes — open has no effect on requests",
      ],
      correctIndex: 1,
      explanation:
        "The whole point of the open state is to fail fast — avoid the cost (time, resources) of calling a dependency that's already known to be failing.",
    },
    {
      question: "What is the purpose of the HALF-OPEN state?",
      options: [
        "To permanently disable the downstream service",
        "To let a single probe request test whether the downstream has recovered, before fully reopening traffic",
        "To double the failure threshold",
        "It serves no real purpose and can be skipped",
      ],
      correctIndex: 1,
      explanation:
        "Half-open cautiously tests recovery with one request rather than immediately flooding a possibly-still-broken dependency with full traffic again.",
    },
  ],
};

import { DistributedTracing } from "@/components/visualizations/DistributedTracing";
import type { TopicContent } from "./types";

export const distributedTracing: TopicContent = {
  visual: DistributedTracing,
  howItWorks: [
    {
      title: "A trace ID follows a request across every service",
      description:
        "When a request enters the system, it's assigned a trace ID. That ID is propagated through every downstream call (usually via an HTTP header), letting you reconstruct the entire request's journey later.",
      code: "traceparent: 00-7f3a9c21e8b4...-a1b2c3-01",
    },
    {
      title: "Each unit of work is a span",
      description:
        "A span represents one operation — an HTTP call, a DB query, a function — with a start time, duration, and its own span ID. Spans reference a parent span ID, forming a tree that mirrors the actual call graph.",
    },
    {
      title: "Spans are collected and stitched together",
      description:
        "Each service reports its spans to a tracing backend (Jaeger, Zipkin, Tempo). Since every span carries the shared trace ID and its parent span ID, the backend can reassemble the full waterfall after the fact.",
    },
    {
      title: "The waterfall view reveals where time actually went",
      description:
        "Visualizing spans as a waterfall (like a Gantt chart) makes it immediately obvious which service was the bottleneck, and whether calls happened sequentially or in parallel — something logs alone can't easily show.",
    },
    {
      title: "Sampling keeps overhead manageable",
      description:
        "Tracing every single request in a high-traffic system is expensive. Most systems sample a percentage of requests (or specifically trace slow/error requests) rather than tracing 100% of traffic.",
    },
  ],
  tradeoffs: {
    pros: [
      "Makes cross-service latency bottlenecks immediately visible, unlike logs scattered across services",
      "Reveals the actual call graph and parallelism, not just each service's isolated view",
      "Essential for debugging latency issues in a microservices architecture with many hops",
    ],
    cons: [
      "Requires trace context propagation to be correctly implemented in every single service — one gap breaks the chain",
      "Full tracing of all traffic adds real overhead; sampling trades completeness for cost",
      "Another piece of infrastructure (collector, storage, UI) to operate and maintain",
    ],
    whenToUse: [
      "Any system with more than a couple of services calling each other, especially microservices",
      "Debugging latency (not just error) issues that logs and metrics alone can't pinpoint",
    ],
    whenNotToUse: [
      "A monolith with no cross-service calls — logs and profiling are usually sufficient",
      "Extremely cost-sensitive systems where even sampled tracing overhead isn't justified — though this is increasingly rare",
    ],
    alternatives: [
      { name: "Structured logging + correlation ID", note: "A lighter-weight partial substitute — ties logs together but without span timing/waterfall visualization" },
      { name: "APM tools (Datadog, New Relic)", note: "Often bundle tracing with metrics and logs in one integrated product" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd propagate a trace ID through every service call via a header, and have each service emit spans — timed units of work with a parent span ID — to a tracing backend like Jaeger. This lets me look at a single slow request as a waterfall: which service took the longest, whether calls to Payment and Inventory happened in parallel or serially, and exactly where the latency budget went. I'd also mention sampling — tracing 100% of traffic is often too expensive, so most systems sample a percentage of normal traffic while always tracing errors and slow requests.",
    mistakes: [
      "Confusing distributed tracing with plain centralized logging — tracing specifically captures timing and the call graph, not just text messages",
      "Not mentioning trace context propagation as the hard part that has to be correct in every service",
      "Assuming you should trace 100% of requests without discussing sampling tradeoffs",
    ],
    followUps: [
      "How does trace context get propagated across an async message queue instead of a direct HTTP call?",
      "How would you decide a sampling rate for a high-traffic system?",
      "What's the difference between a trace, a span, and a log line?",
    ],
    redFlags: [
      "Not knowing what a span is",
      "Thinking distributed tracing is the same thing as just aggregating logs",
    ],
  },
  challenge: [
    {
      question: "What allows a tracing backend like Jaeger to reconstruct the full path of a request across many services?",
      options: [
        "Each service writes to the same log file",
        "Every span shares a common trace ID, and each span references its parent span ID, forming a reconstructable tree",
        "Services are all restarted at the same time",
        "It guesses based on timestamps alone",
      ],
      correctIndex: 1,
      explanation:
        "The shared trace ID groups all spans belonging to one request, while each span's parent span ID lets the backend reconstruct the exact call hierarchy and timing.",
    },
    {
      question: "Why do most production systems sample traces instead of tracing every single request?",
      options: [
        "Sampling is required by law",
        "Tracing 100% of high-volume traffic adds significant overhead and storage cost",
        "Sampling makes traces more accurate",
        "It's not possible to trace every request technically",
      ],
      correctIndex: 1,
      explanation:
        "Full tracing of every request at high traffic volumes is expensive in both overhead and storage, so most systems sample a percentage of normal traffic while prioritizing errors and slow requests.",
    },
  ],
};

import type { ProblemContent } from "./types";

export const notificationSystem: ProblemContent = {
  requirements: {
    functional: [
      "Send notifications across multiple channels: push, email, and SMS",
      "Respect per-user preferences and opt-outs per channel",
      "Support templated, localized message content",
      "Retry failed deliveries without sending duplicates",
    ],
    nonFunctional: [
      "High throughput — hundreds of millions of notifications per day at peak",
      "At-least-once delivery with idempotency to avoid duplicate sends on retry",
      "Must not let a slow or down third-party provider block the app's core request path",
      "Must avoid overwhelming or getting rate-limited by upstream providers (FCM, SES, Twilio)",
    ],
  },
  diagramNodes: [
    { id: "producer", label: "App Service", x: 8, y: 50, kind: "server" },
    { id: "queue", label: "Kafka Queue", x: 32, y: 50, kind: "queue" },
    { id: "workers", label: "Notification Workers", x: 58, y: 50, kind: "server" },
    { id: "providers", label: "Push / Email / SMS Providers", x: 88, y: 20, kind: "external" },
    { id: "db", label: "Delivery Log DB", x: 88, y: 80, kind: "db" },
  ],
  diagramEdges: [
    { id: "e1", from: "producer", to: "queue" },
    { id: "e2", from: "queue", to: "workers" },
    { id: "e3", from: "workers", to: "providers" },
    { id: "e4", from: "workers", to: "db" },
  ],
  solutionSteps: [
    {
      title: "An app service publishes a notification event",
      description:
        "Instead of calling a provider directly, a service (e.g. order-service on shipment) publishes an event like 'order shipped' — decoupling it entirely from delivery mechanics.",
      revealNodeIds: ["producer"],
      revealEdgeIds: [],
    },
    {
      title: "The event lands in a durable queue",
      description:
        "Publishing to Kafka means the app's request path returns immediately — it never waits on a slow email or SMS provider. The queue also absorbs bursts during traffic spikes.",
      revealNodeIds: ["queue"],
      revealEdgeIds: ["e1"],
    },
    {
      title: "Workers render templates and check preferences",
      description:
        "A pool of notification workers consumes events, checks the user's channel preferences and quiet hours, renders the localized template, and decides which channel(s) to actually send on.",
      revealNodeIds: ["workers"],
      revealEdgeIds: ["e2"],
    },
    {
      title: "Workers call the right provider per channel",
      description:
        "Each channel has its own adapter and its own outbound rate limiter, so a burst that would overwhelm the SMS provider doesn't affect push or email delivery.",
      revealNodeIds: ["providers"],
      revealEdgeIds: ["e3"],
    },
    {
      title: "Delivery status is logged for retries and analytics",
      description:
        "Every attempt's outcome is recorded. Failures go to a retry queue (with backoff); an idempotency key derived from the event ensures a retried send never results in a duplicate notification reaching the user.",
      revealNodeIds: ["db"],
      revealEdgeIds: ["e4"],
    },
  ],
  capacity: {
    inputs: [
      { key: "notificationsPerDay", label: "Notifications per day", min: 100_000, max: 500_000_000, step: 100_000, default: 100_000_000, unit: "" },
      { key: "peakMultiplier", label: "Peak-to-average multiplier", min: 1, max: 10, step: 1, default: 5, unit: "x" },
      { key: "avgChannels", label: "Avg channels per notification", min: 1, max: 3, step: 0.5, default: 1.5, unit: "" },
    ],
    compute: (v) => {
      const avgQps = v.notificationsPerDay / 86_400;
      const peakQps = avgQps * v.peakMultiplier;
      const providerCallsPerSec = peakQps * v.avgChannels;
      return [
        { label: "Average QPS", value: avgQps.toFixed(0) },
        { label: "Peak QPS", value: peakQps.toFixed(0) },
        { label: "Peak provider calls/sec", value: providerCallsPerSec.toFixed(0) },
      ];
    },
    chartData: (v) => {
      const avgQps = v.notificationsPerDay / 86_400;
      const peakQps = avgQps * v.peakMultiplier;
      const providerCallsPerSec = peakQps * v.avgChannels;
      return [
        { name: "Avg QPS", value: Math.round(avgQps) },
        { name: "Peak QPS", value: Math.round(peakQps) },
        { name: "Provider calls/s", value: Math.round(providerCallsPerSec) },
      ];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Decouple sending from the app's request path via a queue",
      why: "Third-party providers (email, SMS) are slow and occasionally down. A queue means a provider outage delays notifications instead of breaking the core product flow that triggered them.",
    },
    {
      decision: "Idempotency keys on every notification event",
      why: "At-least-once delivery means retries are inevitable. Without an idempotency key derived from the source event, a retry after a partial failure could send the same notification twice.",
    },
    {
      decision: "Per-provider outbound rate limiting",
      why: "Providers like Twilio and FCM enforce their own rate limits. Without our own outbound throttling, a traffic spike could get our account rate-limited or banned by the provider entirely.",
    },
  ],
  commonMistakes: [
    "Calling the email/SMS provider synchronously from the request path that triggers the notification",
    "Not deduplicating retried sends, resulting in users receiving the same notification multiple times",
    "Ignoring user notification preferences and quiet hours",
    "Treating all channels as equally reliable instead of isolating failures per-channel",
  ],
  companyNote: {
    company: "Uber",
    note: "Uber's notification infrastructure publishes trip-lifecycle events (driver assigned, arriving, trip complete) onto Kafka, which fan out to channel-specific worker pools for push, SMS, and email — decoupling the trip service entirely from notification delivery mechanics and provider outages.",
  },
};

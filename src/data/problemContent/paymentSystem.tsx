import type { ProblemContent } from "./types";

export const paymentSystem: ProblemContent = {
  requirements: {
    functional: [
      "Process a payment charge against a card or other payment method",
      "Support refunds against a previous charge",
      "Maintain a complete, auditable transaction ledger",
      "Safely handle client retries without double-charging",
    ],
    nonFunctional: [
      "Strong consistency — a charge must never be double-processed or silently lost",
      "Full auditability — every state change must be traceable after the fact",
      "High availability, since this is directly revenue-critical",
      "Minimize PCI compliance scope — never store raw card numbers internally",
    ],
  },
  diagramNodes: [
    { id: "client", label: "Client", x: 6, y: 25, kind: "client" },
    { id: "api", label: "Payment API", x: 30, y: 25, kind: "server" },
    { id: "idempotency", label: "Idempotency Key Store (Redis)", x: 30, y: 80, kind: "cache" },
    { id: "paymentSvc", label: "Payment Service", x: 56, y: 25, kind: "server" },
    { id: "ledger", label: "Ledger DB (append-only)", x: 56, y: 80, kind: "db" },
    { id: "processor", label: "Payment Processor (Stripe/Visa)", x: 90, y: 25, kind: "external" },
    { id: "outbox", label: "Outbox → Event Bus", x: 90, y: 80, kind: "queue" },
  ],
  diagramEdges: [
    { id: "e1", from: "client", to: "api" },
    { id: "e2", from: "api", to: "idempotency" },
    { id: "e3", from: "api", to: "paymentSvc" },
    { id: "e4", from: "paymentSvc", to: "ledger" },
    { id: "e5", from: "paymentSvc", to: "processor" },
    { id: "e6", from: "ledger", to: "outbox" },
  ],
  solutionSteps: [
    {
      title: "Client sends a charge request with an idempotency key",
      description:
        "Every charge request includes a client-generated idempotency key, so a network retry can never accidentally trigger a second real charge.",
      revealNodeIds: ["client", "api"],
      revealEdgeIds: ["e1"],
    },
    {
      title: "Check for a duplicate request first",
      description:
        "Before doing anything else, the API checks the idempotency key store. If this exact key was already processed, it returns the original cached result instead of charging again.",
      revealNodeIds: ["idempotency"],
      revealEdgeIds: ["e2"],
    },
    {
      title: "Call the external payment processor",
      description:
        "The payment service calls out to the actual payment processor (Stripe, a card network) — this is the one genuinely uncertain step, since the network call itself can fail or time out ambiguously.",
      revealNodeIds: ["paymentSvc", "processor"],
      revealEdgeIds: ["e3", "e5"],
    },
    {
      title: "Append an immutable ledger entry",
      description:
        "Regardless of the processor's outcome, an append-only ledger entry records exactly what was attempted and what happened — the ledger is never updated or deleted, only appended to, for full auditability.",
      revealNodeIds: ["ledger"],
      revealEdgeIds: ["e4"],
    },
    {
      title: "Reliably notify other services via the outbox pattern",
      description:
        "Rather than calling order fulfillment or notification services directly (risking the dual-write problem), a 'PaymentProcessed' event is written to an outbox in the same transaction as the ledger entry, then relayed asynchronously.",
      revealNodeIds: ["outbox"],
      revealEdgeIds: ["e6"],
    },
  ],
  capacity: {
    inputs: [
      { key: "paymentsPerDay", label: "Payments per day", min: 100_000, max: 100_000_000, step: 100_000, default: 10_000_000, unit: "" },
      { key: "peakMultiplier", label: "Peak-to-average multiplier", min: 1, max: 10, step: 1, default: 4, unit: "x" },
    ],
    compute: (v) => {
      const avgQps = v.paymentsPerDay / 86_400;
      const peakQps = avgQps * v.peakMultiplier;
      return [
        { label: "Average QPS", value: avgQps.toFixed(1) },
        { label: "Peak QPS", value: peakQps.toFixed(0) },
        { label: "Payments / day", value: (v.paymentsPerDay / 1e6).toFixed(1) + "M" },
      ];
    },
    chartData: (v) => {
      const avgQps = v.paymentsPerDay / 86_400;
      const peakQps = avgQps * v.peakMultiplier;
      return [
        { name: "Avg QPS", value: Math.round(avgQps) },
        { name: "Peak QPS", value: Math.round(peakQps) },
      ];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Idempotency keys are mandatory on every charge request",
      why: "Network failures between client and server are inevitable at scale; without an idempotency key, a client's safe retry after a timeout could trigger a real second charge.",
    },
    {
      decision: "An append-only, immutable ledger as the source of truth",
      why: "Financial systems need a complete, tamper-evident audit trail. Corrections are made via new compensating entries, never by editing or deleting history.",
    },
    {
      decision: "The outbox pattern for notifying other services",
      why: "Calling order fulfillment or notifications synchronously and directly risks the dual-write problem — the payment could succeed while the notification silently fails, or vice versa.",
    },
    {
      decision: "Never store raw card numbers — tokenize via the processor",
      why: "Storing raw card data internally massively expands PCI-DSS compliance scope; using the processor's tokenization keeps sensitive card data out of your own systems entirely.",
    },
  ],
  commonMistakes: [
    "Not requiring an idempotency key, leaving the system vulnerable to duplicate charges on retry",
    "Allowing ledger rows to be updated or deleted instead of only ever appended to",
    "Calling other services directly and synchronously from within the payment transaction instead of using an outbox",
    "Proposing to store raw card numbers rather than tokenizing through the payment processor",
  ],
  companyNote: {
    company: "Stripe",
    note: "Stripe's public API is built around exactly this idempotency-key pattern for every mutating request, and its internal accounting is built on an immutable, append-only ledger — both of which are considered industry-standard practice specifically because of the failure modes this design addresses.",
  },
};

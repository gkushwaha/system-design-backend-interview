import type { ProblemContent } from "./types";

export const uniqueIdGenerator: ProblemContent = {
  requirements: {
    functional: [
      "Generate a globally unique ID for every request, across any number of nodes",
      "IDs should be roughly sortable by creation time (k-sortable)",
      "IDs must fit in 64 bits for efficient storage and indexing",
    ],
    nonFunctional: [
      "No coordination between nodes on the hot path — generation must be fully local and sub-millisecond",
      "No single point of failure — unlike an auto-increment counter in one database",
      "Support extremely high throughput across many app server instances simultaneously",
    ],
  },
  diagramNodes: [
    { id: "client", label: "Client", x: 6, y: 50, kind: "client" },
    { id: "server1", label: "App Server (worker=1)", x: 38, y: 15, kind: "server" },
    { id: "server2", label: "App Server (worker=2)", x: 38, y: 50, kind: "server" },
    { id: "server3", label: "App Server (worker=3)", x: 38, y: 85, kind: "server" },
    { id: "zk", label: "Worker ID Registry (ZooKeeper)", x: 75, y: 50, kind: "storage" },
  ],
  diagramEdges: [
    { id: "e1", from: "client", to: "server2" },
    { id: "e2", from: "server1", to: "zk" },
    { id: "e3", from: "server2", to: "zk" },
    { id: "e4", from: "server3", to: "zk" },
  ],
  solutionSteps: [
    {
      title: "A client requests an ID from any app server",
      description:
        "Any app server instance can generate an ID for the client — there's no central ID service to call for every single request.",
      revealNodeIds: ["client", "server2"],
      revealEdgeIds: ["e1"],
    },
    {
      title: "Each server has a unique worker ID assigned at startup",
      description:
        "On boot, each server instance registers with a coordination service (ZooKeeper/etcd) to claim a unique worker ID (e.g. 0-1023) — this is the only coordination in the whole system, and it happens once, not per request.",
      revealNodeIds: ["server1", "server3", "zk"],
      revealEdgeIds: ["e2", "e3", "e4"],
    },
    {
      title: "Compose the ID from three parts, locally",
      description:
        "Each ID is 64 bits: a 41-bit millisecond timestamp, a 10-bit worker ID, and a 12-bit per-millisecond sequence number — all computed locally with zero network calls.",
      revealNodeIds: [],
      revealEdgeIds: [],
    },
    {
      title: "Time as the leading bits makes IDs roughly sortable",
      description:
        "Because the timestamp occupies the most significant bits, IDs generated later are numerically larger — enabling efficient range queries and avoiding the random-insert index fragmentation that plain UUIDs cause.",
      revealNodeIds: [],
      revealEdgeIds: [],
    },
    {
      title: "Handle clock rollback carefully",
      description:
        "If the system clock moves backward (NTP correction), the generator must detect it and either wait until the clock catches up or reject requests briefly — otherwise it risks generating a duplicate ID.",
      revealNodeIds: [],
      revealEdgeIds: [],
    },
  ],
  capacity: {
    inputs: [
      { key: "numWorkers", label: "Number of worker nodes", min: 1, max: 1024, step: 1, default: 100, unit: "" },
      { key: "targetIdsPerSec", label: "Target IDs / second (global)", min: 1_000, max: 500_000_000, step: 1_000, default: 1_000_000, unit: "/s" },
    ],
    compute: (v) => {
      const perWorkerMax = 4096 * 1000; // 12 sequence bits per millisecond
      const totalMax = v.numWorkers * perWorkerMax;
      const utilization = (v.targetIdsPerSec / totalMax) * 100;
      const yearsUntilOverflow = Math.pow(2, 41) / (1000 * 3600 * 24 * 365);
      return [
        { label: "Max theoretical throughput", value: `${(totalMax / 1e6).toFixed(1)}M/s` },
        { label: "Utilization at target load", value: `${utilization.toFixed(2)}%` },
        { label: "Years until timestamp overflow", value: `~${yearsUntilOverflow.toFixed(0)} yrs` },
      ];
    },
    chartData: (v) => {
      const perWorkerMax = 4096 * 1000;
      const totalMax = v.numWorkers * perWorkerMax;
      return [
        { name: "Target IDs/s", value: Math.round(v.targetIdsPerSec) },
        { name: "Max capacity/s", value: Math.round(totalMax) },
      ];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Snowflake-style bit layout: timestamp + worker ID + sequence",
      why: "This gives every node a way to generate IDs completely independently, with global uniqueness guaranteed by the combination of a unique worker ID and a local per-millisecond sequence counter — no cross-node coordination on the hot path.",
    },
    {
      decision: "Coordination only happens once, at startup",
      why: "Worker ID assignment via ZooKeeper/etcd happens when a server boots, not per request — keeping the actual ID generation path completely local and sub-millisecond.",
    },
    {
      decision: "Time-ordered IDs instead of random UUIDs",
      why: "Putting the timestamp in the most significant bits keeps IDs roughly sortable by creation time, which keeps database B-tree indexes append-friendly instead of fragmenting from random inserts.",
    },
  ],
  commonMistakes: [
    "Reaching for a random UUID when rough time-ordering is actually needed for efficient indexing",
    "Using a single centralized counter service, reintroducing the coordination bottleneck this design is meant to avoid",
    "Not handling system clock rollback, risking duplicate IDs",
    "Hardcoding worker IDs by instance count without a plan for what happens when you scale beyond the allotted bit range",
  ],
  companyNote: {
    company: "Twitter",
    note: "Twitter's original Snowflake service was built exactly for this purpose — generating unique, roughly time-sortable Tweet IDs across a large, horizontally scaled fleet without any centralized bottleneck.",
  },
};

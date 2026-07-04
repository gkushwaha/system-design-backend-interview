import type { ProblemContent } from "./types";

export const urlShortener: ProblemContent = {
  requirements: {
    functional: [
      "Given a long URL, generate a short, unique alias",
      "Given a short alias, redirect to the original long URL",
      "Support optional custom aliases chosen by the user",
      "Support optional expiration for links",
    ],
    nonFunctional: [
      "Redirects must be extremely low latency (this is on the critical path of every click)",
      "High availability — a shortener going down breaks every link that uses it",
      "100M new URLs/day, with reads far outnumbering writes (~100:1)",
      "Short codes must be effectively unguessable to avoid enumeration",
    ],
  },
  diagramNodes: [
    { id: "client", label: "Client", x: 8, y: 50, kind: "client" },
    { id: "lb", label: "Load Balancer", x: 25, y: 50, kind: "server" },
    { id: "api", label: "API Servers", x: 45, y: 50, kind: "server" },
    { id: "idgen", label: "ID Generator", x: 45, y: 12, kind: "server" },
    { id: "cache", label: "Redis Cache", x: 68, y: 78, kind: "cache" },
    { id: "db", label: "Key-Value DB", x: 92, y: 50, kind: "db" },
  ],
  diagramEdges: [
    { id: "e1", from: "client", to: "lb" },
    { id: "e2", from: "lb", to: "api" },
    { id: "e3", from: "api", to: "idgen" },
    { id: "e4", from: "api", to: "cache" },
    { id: "e5", from: "cache", to: "db" },
  ],
  solutionSteps: [
    {
      title: "Client submits a long URL",
      description: "A client sends the long URL to be shortened via a POST request to the API.",
      revealNodeIds: ["client"],
      revealEdgeIds: [],
    },
    {
      title: "Load balancer routes to a stateless API tier",
      description:
        "The request hits a load balancer, which routes to one of many stateless API servers — this tier can scale horizontally with traffic.",
      revealNodeIds: ["lb", "api"],
      revealEdgeIds: ["e1", "e2"],
    },
    {
      title: "Generate a unique short code",
      description:
        "An ID generator produces a unique numeric ID (e.g. via a Snowflake-style generator or a counter service), which is base62-encoded into a short 7-character code.",
      revealNodeIds: ["idgen"],
      revealEdgeIds: ["e3"],
    },
    {
      title: "Store the mapping, cache hot redirects",
      description:
        "The (short_code → long_url) mapping is written to a key-value store. Since reads vastly outnumber writes, a Redis cache sits in front of the DB to serve hot redirects without a database round trip.",
      revealNodeIds: ["cache", "db"],
      revealEdgeIds: ["e4", "e5"],
    },
    {
      title: "Redirect flow",
      description:
        "On GET /{code}, the API checks Redis first; on a cache miss it falls back to the database, then populates the cache and issues a 302 redirect to the original URL.",
      revealNodeIds: [],
      revealEdgeIds: [],
    },
  ],
  capacity: {
    inputs: [
      { key: "newUrlsPerDay", label: "New URLs per day", min: 100_000, max: 200_000_000, step: 100_000, default: 100_000_000, unit: "" },
      { key: "readWriteRatio", label: "Read : write ratio", min: 1, max: 1000, step: 1, default: 100, unit: ":1" },
      { key: "retentionYears", label: "Data retention", min: 1, max: 10, step: 1, default: 5, unit: "yrs" },
    ],
    compute: (v) => {
      const writeQps = v.newUrlsPerDay / 86_400;
      const readQps = writeQps * v.readWriteRatio;
      const recordBytes = 500;
      const totalStorageGB = (v.newUrlsPerDay * 365 * v.retentionYears * recordBytes) / 1e9;
      return [
        { label: "Write QPS", value: writeQps.toFixed(1) },
        { label: "Read QPS", value: readQps.toFixed(0) },
        { label: "Total storage", value: `${totalStorageGB.toFixed(1)} GB` },
      ];
    },
    chartData: (v) => {
      const writeQps = v.newUrlsPerDay / 86_400;
      const readQps = writeQps * v.readWriteRatio;
      const recordBytes = 500;
      const totalStorageGB = (v.newUrlsPerDay * 365 * v.retentionYears * recordBytes) / 1e9;
      return [
        { name: "Write QPS", value: Math.round(writeQps) },
        { name: "Read QPS", value: Math.round(readQps) },
        { name: "Storage (GB)", value: Math.round(totalStorageGB) },
      ];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Base62 encode a counter-based ID instead of hashing the URL",
      why: "Hashing (e.g. MD5 truncated) risks collisions and requires a check-and-retry loop. A monotonically increasing ID (from a Snowflake-style generator) encoded in base62 guarantees uniqueness with no collision handling needed.",
    },
    {
      decision: "Cache-aside with Redis in front of the database",
      why: "Reads outnumber writes by ~100:1 — caching hot redirects avoids hitting the database for the vast majority of traffic, which is the dominant cost driver at scale.",
    },
    {
      decision: "302 (temporary) redirect instead of 301 (permanent)",
      why: "A 301 gets cached by the browser, meaning subsequent clicks never hit our servers again — losing click analytics and the ability to change the destination later. A 302 keeps every click observable.",
    },
  ],
  commonMistakes: [
    "Not addressing hash collisions when using a hash-based short code generation scheme",
    "Forgetting that a 301 redirect gets cached by the browser, breaking click analytics",
    "Not considering custom alias support and how it interacts with the ID generation scheme",
    "Ignoring the read-heavy nature of the workload and not proposing a cache layer",
  ],
  companyNote: {
    company: "Bitly",
    note: "Bitly's core service is fundamentally this design: a distributed ID generation scheme (to avoid coordination on every write), base62 encoding, and heavy caching of redirect lookups, since the vast majority of traffic is reads, not new link creation.",
  },
};

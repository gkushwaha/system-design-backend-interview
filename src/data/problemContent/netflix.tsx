import type { ProblemContent } from "./types";

export const netflix: ProblemContent = {
  requirements: {
    functional: [
      "Browse a personalized catalog of shows and movies",
      "Stream video with adaptive quality based on network conditions",
      "Resume playback from where a user left off, across devices",
      "Personalized recommendation rows on the home screen",
    ],
    nonFunctional: [
      "Massive, globally distributed bandwidth — video is the overwhelming majority of internet traffic during peak hours in many regions",
      "Low startup latency and zero rebuffering under normal conditions",
      "High availability — famously validated via chaos engineering (Chaos Monkey)",
      "Support a huge range of device types and network conditions",
    ],
  },
  diagramNodes: [
    { id: "client", label: "Client (TV/App)", x: 6, y: 50, kind: "client" },
    { id: "gateway", label: "API Gateway", x: 30, y: 20, kind: "server" },
    { id: "recs", label: "Recommendation Service", x: 30, y: 80, kind: "server" },
    { id: "openconnect", label: "Open Connect CDN (in-ISP)", x: 60, y: 50, kind: "external" },
    { id: "encoding", label: "Encoding Pipeline", x: 88, y: 20, kind: "server" },
    { id: "metadata", label: "Metadata + Catalog DB", x: 88, y: 80, kind: "db" },
  ],
  diagramEdges: [
    { id: "e1", from: "client", to: "gateway" },
    { id: "e2", from: "gateway", to: "recs" },
    { id: "e3", from: "gateway", to: "metadata" },
    { id: "e4", from: "client", to: "openconnect" },
    { id: "e5", from: "encoding", to: "openconnect" },
    { id: "e6", from: "encoding", to: "metadata" },
  ],
  solutionSteps: [
    {
      title: "Client browses the catalog via the API gateway",
      description:
        "Home screen requests hit an API gateway, which pulls catalog metadata and calls the recommendation service to personalize which rows and titles are shown.",
      revealNodeIds: ["client", "gateway"],
      revealEdgeIds: ["e1"],
    },
    {
      title: "Recommendations personalize the experience",
      description:
        "A dedicated recommendation service (backed by ML models trained on viewing history) ranks and selects which titles appear, separate from the core catalog data path.",
      revealNodeIds: ["recs"],
      revealEdgeIds: ["e2"],
    },
    {
      title: "Video is pre-encoded into many renditions",
      description:
        "Before a title ever streams, an encoding pipeline transcodes it into dozens of bitrate/resolution combinations ahead of time — never transcoding on-demand during playback.",
      revealNodeIds: ["encoding", "metadata"],
      revealEdgeIds: ["e3", "e6"],
    },
    {
      title: "Encoded video is pushed to Open Connect, Netflix's own CDN",
      description:
        "Rather than relying purely on third-party CDNs, Netflix operates Open Connect — purpose-built CDN appliances installed directly inside ISP networks, dramatically reducing the distance video has to travel.",
      revealNodeIds: ["openconnect"],
      revealEdgeIds: ["e5"],
    },
    {
      title: "The client streams adaptively from the nearest Open Connect node",
      description:
        "The client continuously measures buffer health and bandwidth, switching between pre-encoded quality renditions in real time (adaptive bitrate streaming) to avoid rebuffering.",
      revealNodeIds: [],
      revealEdgeIds: ["e4"],
    },
  ],
  capacity: {
    inputs: [
      { key: "concurrentStreams", label: "Concurrent streams", min: 100_000, max: 20_000_000, step: 100_000, default: 5_000_000, unit: "" },
      { key: "avgBitrateMbps", label: "Avg bitrate per stream", min: 1, max: 15, step: 0.5, default: 5, unit: "Mbps" },
    ],
    compute: (v) => {
      const totalGbps = (v.concurrentStreams * v.avgBitrateMbps) / 1000;
      return [
        { label: "Total bandwidth", value: `${totalGbps.toFixed(0)} Gbps` },
        { label: "Concurrent streams", value: (v.concurrentStreams / 1e6).toFixed(1) + "M" },
        { label: "Avg bitrate", value: `${v.avgBitrateMbps} Mbps` },
      ];
    },
    chartData: (v) => {
      const totalGbps = (v.concurrentStreams * v.avgBitrateMbps) / 1000;
      return [{ name: "Total bandwidth (Gbps)", value: Math.round(totalGbps) }];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Pre-transcode into many renditions ahead of time, never on-demand",
      why: "Transcoding is CPU-intensive; doing it once per title in advance rather than per-playback is the only way to serve millions of concurrent streams economically.",
    },
    {
      decision: "Operate a purpose-built CDN (Open Connect) embedded inside ISPs",
      why: "Since video dominates all other traffic at Netflix's scale, owning the last-mile delivery infrastructure and placing it as close as possible to end users is worth the investment that a generic third-party CDN wouldn't justify.",
    },
    {
      decision: "Adaptive bitrate streaming, client-driven",
      why: "Network conditions vary constantly; letting the client measure its own buffer and bandwidth in real time and switch renditions avoids both wasted bandwidth (too high quality) and rebuffering (too low).",
    },
  ],
  commonMistakes: [
    "Not mentioning adaptive bitrate streaming as a core requirement of video delivery",
    "Assuming a generic third-party CDN is an adequate answer without discussing Netflix's specific Open Connect strategy",
    "Forgetting the encoding/transcoding pipeline as a first-class, expensive component of the system",
    "Focusing only on compute capacity while underestimating bandwidth as the true dominant cost and scaling constraint",
  ],
  companyNote: {
    company: "Netflix",
    note: "Netflix built Open Connect, its own CDN with appliances installed directly inside ISP data centers worldwide, specifically because video bandwidth is such an overwhelming share of their traffic that owning last-mile delivery infrastructure was worth the enormous investment.",
  },
};

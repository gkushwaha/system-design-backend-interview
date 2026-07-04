import type { ProblemContent } from "./types";

export const whatsapp: ProblemContent = {
  requirements: {
    functional: [
      "Send and receive 1:1 text messages in real time",
      "Show delivery status: sent, delivered, read",
      "Deliver messages sent while the recipient was offline, once they reconnect",
      "Support group conversations",
    ],
    nonFunctional: [
      "Real-time delivery latency — messages should arrive in under a second when both parties are online",
      "Support hundreds of millions of concurrent persistent connections",
      "Messages must never be lost, even if the recipient is offline for days",
      "Preserve message order within a single conversation",
    ],
  },
  diagramNodes: [
    { id: "clientA", label: "Client A", x: 6, y: 25, kind: "client" },
    { id: "gateway", label: "Connection Server (Gateway)", x: 30, y: 25, kind: "server" },
    { id: "messageService", label: "Message Service", x: 56, y: 55, kind: "server" },
    { id: "presence", label: "Presence / Routing Service", x: 56, y: 15, kind: "storage" },
    { id: "msgStore", label: "Message Store", x: 82, y: 25, kind: "db" },
    { id: "clientB", label: "Client B", x: 94, y: 85, kind: "client" },
  ],
  diagramEdges: [
    { id: "e1", from: "clientA", to: "gateway" },
    { id: "e2", from: "gateway", to: "messageService" },
    { id: "e3", from: "messageService", to: "msgStore" },
    { id: "e4", from: "messageService", to: "presence" },
    { id: "e5", from: "messageService", to: "clientB" },
  ],
  solutionSteps: [
    {
      title: "Client A holds a persistent connection",
      description:
        "Instead of polling over HTTP, Client A maintains a long-lived WebSocket (or similar) connection to one of many connection servers — this makes real-time push delivery possible at scale.",
      revealNodeIds: ["clientA", "gateway"],
      revealEdgeIds: ["e1"],
    },
    {
      title: "The gateway forwards to the message service",
      description:
        "When Client A sends a message, the gateway it's connected to forwards it to the message service, which owns the actual send/store/deliver logic.",
      revealNodeIds: ["messageService"],
      revealEdgeIds: ["e2"],
    },
    {
      title: "Store the message before attempting delivery",
      description:
        "The message service durably persists the message first — this store-and-forward guarantee means the message is never lost, regardless of whether the recipient is currently reachable.",
      revealNodeIds: ["msgStore"],
      revealEdgeIds: ["e3"],
    },
    {
      title: "Look up where the recipient is connected",
      description:
        "With potentially thousands of gateway servers, the message service asks a presence/routing service which specific gateway (if any) Client B is currently connected to.",
      revealNodeIds: ["presence"],
      revealEdgeIds: ["e4"],
    },
    {
      title: "Deliver now, or wait for reconnection",
      description:
        "If Client B is online, the message is pushed instantly through their gateway. If offline, a push notification is sent and the message waits durably in the store until Client B reconnects and syncs.",
      revealNodeIds: ["clientB"],
      revealEdgeIds: ["e5"],
    },
  ],
  capacity: {
    inputs: [
      { key: "dau", label: "Daily active users", min: 1_000_000, max: 1_000_000_000, step: 1_000_000, default: 500_000_000, unit: "" },
      { key: "messagesPerUserPerDay", label: "Messages per user per day", min: 1, max: 200, step: 1, default: 40, unit: "" },
    ],
    compute: (v) => {
      const messagesPerDay = v.dau * v.messagesPerUserPerDay;
      const messagesPerSec = messagesPerDay / 86_400;
      const storagePerDayGB = (messagesPerDay * 200) / 1e9; // ~200 bytes per message record
      return [
        { label: "Messages / day", value: (messagesPerDay / 1e9).toFixed(1) + "B" },
        { label: "Messages / sec", value: messagesPerSec.toFixed(0) },
        { label: "Storage / day", value: `${storagePerDayGB.toFixed(1)} GB` },
      ];
    },
    chartData: (v) => {
      const messagesPerDay = v.dau * v.messagesPerUserPerDay;
      const messagesPerSec = messagesPerDay / 86_400;
      const storagePerDayGB = (messagesPerDay * 200) / 1e9;
      return [
        { name: "Msgs/sec", value: Math.round(messagesPerSec) },
        { name: "Storage/day (GB)", value: Math.round(storagePerDayGB) },
      ];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Persistent connections (WebSocket) instead of HTTP polling",
      why: "Real-time delivery at sub-second latency for hundreds of millions of concurrent users requires the server to push to clients directly — polling would be both too slow and prohibitively expensive at this scale.",
    },
    {
      decision: "Store-and-forward: persist before attempting delivery",
      why: "Guarantees zero message loss even if the recipient is offline for an extended period, or if the delivery attempt itself fails partway through.",
    },
    {
      decision: "A dedicated presence/routing layer",
      why: "With connections spread across thousands of gateway servers, the message service needs a fast way to find exactly which server (if any) currently holds the recipient's connection.",
    },
  ],
  commonMistakes: [
    "Proposing HTTP polling for real-time delivery instead of persistent connections",
    "Attempting delivery before durably storing the message, risking loss on failure",
    "Forgetting that a presence/routing layer is needed once connections are spread across many gateway servers",
    "Not addressing message ordering within a single conversation",
  ],
  companyNote: {
    company: "WhatsApp",
    note: "WhatsApp famously served over a billion users with a small engineering team, built on Erlang/FreeBSD specifically for their ability to handle millions of concurrent persistent connections per server, combined with a strict store-and-forward guarantee for message durability.",
  },
};

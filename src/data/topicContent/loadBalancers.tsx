import { LoadBalancers } from "@/components/visualizations/LoadBalancers";
import type { TopicContent } from "./types";

export const loadBalancers: TopicContent = {
  visual: LoadBalancers,
  howItWorks: [
    {
      title: "Client sends a request",
      description:
        "Instead of connecting directly to a server, the client connects to a load balancer's single IP/DNS name. The LB is the only thing the outside world knows about.",
    },
    {
      title: "The LB picks a healthy backend",
      description:
        "Using an algorithm (round robin, least connections, weighted, or IP hash), the load balancer picks one of the servers behind it that is currently passing health checks.",
      code: "GET /api/users  →  LB  →  algorithm picks Server 2  →  forwarded",
    },
    {
      title: "Health checks run continuously",
      description:
        "The LB pings each backend on an interval (e.g. every 5s). Three consecutive failures and the server is pulled out of rotation automatically — no human intervention needed.",
    },
    {
      title: "Failure is invisible to the client",
      description:
        "If a server dies mid-request, the LB can retry on another healthy server (for idempotent requests). The client never needs to know a backend went down.",
    },
    {
      title: "Layer 4 vs Layer 7",
      description:
        "L4 load balancers route based on IP/port only (fast, protocol-agnostic). L7 load balancers (like an ALB) can inspect HTTP headers/paths and route '/api' to one service and '/static' to another.",
    },
  ],
  tradeoffs: {
    pros: [
      "Removes single point of failure from any one backend server",
      "Enables horizontal scaling transparently to clients",
      "Health checks provide automatic failure detection and recovery",
    ],
    cons: [
      "The load balancer itself can become a bottleneck or single point of failure (mitigated with LB redundancy/DNS round robin)",
      "Adds a network hop of latency",
      "Sticky sessions (IP hash) can create hotspots if one client sends disproportionate traffic",
    ],
    whenToUse: [
      "Any system with more than one backend instance",
      "When you need zero-downtime deployments (drain + replace one instance at a time)",
    ],
    whenNotToUse: [
      "Single-instance internal tools with no availability requirements",
      "When you need true session affinity to local in-memory state (fix the state instead of relying on IP hash)",
    ],
    alternatives: [
      { name: "DNS round robin", note: "Simpler but no health checks — dead IPs stay in rotation until TTL expires" },
      { name: "Client-side LB", note: "Client (or service mesh sidecar) picks the backend itself, e.g. gRPC client-side LB" },
      { name: "Service mesh", note: "Envoy/Istio handle LB, retries, and circuit breaking at the infrastructure layer" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd put a load balancer in front of any tier with more than one instance. For algorithm choice, round robin is a reasonable default for uniform backends; least-connections is better when requests have variable processing time; weighted round robin lets me account for heterogeneous instance sizes. I'd also configure active health checks so failed instances are automatically removed from rotation, and make sure the LB itself is redundant — usually via a managed service like an ALB/NLB that's inherently highly available, or DNS-based failover between multiple LB nodes.",
    mistakes: [
      "Forgetting that the load balancer itself needs to be highly available",
      "Not distinguishing L4 (fast, IP/port only) from L7 (can route by path/header, more overhead)",
      "Assuming round robin is always fine even when backend request costs vary wildly",
    ],
    followUps: [
      "How would you handle a slow health check causing false negatives?",
      "How do you do a zero-downtime deploy through a load balancer?",
      "What happens to in-flight requests when a backend is marked unhealthy?",
    ],
    redFlags: [
      "Not knowing what a health check is",
      "Suggesting the load balancer is unnecessary once you have DNS",
    ],
  },
  challenge: [
    {
      question: "Which load balancing algorithm is best when backend servers have very different processing times per request?",
      options: ["Round robin", "Least connections", "IP hash", "Random"],
      correctIndex: 1,
      explanation:
        "Least connections routes new requests to whichever server currently has the fewest in-flight requests, adapting to variable load automatically.",
    },
    {
      question: "What happens when a backend server fails 3 consecutive health checks?",
      options: [
        "Nothing, health checks are informational only",
        "It is automatically removed from the rotation until it passes checks again",
        "The load balancer crashes",
        "All traffic is redirected to it to test recovery",
      ],
      correctIndex: 1,
      explanation:
        "Health checks let the load balancer automatically pull unhealthy servers out of rotation without any human intervention, then re-add them once they recover.",
    },
  ],
};

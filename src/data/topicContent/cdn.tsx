import { Cdn } from "@/components/visualizations/Cdn";
import type { TopicContent } from "./types";

export const cdn: TopicContent = {
  visual: Cdn,
  howItWorks: [
    {
      title: "Points of Presence (PoPs) sit close to users",
      description:
        "A CDN operates hundreds of edge locations (PoPs) around the world, each caching a copy of static (and sometimes dynamic) content, physically closer to end users than the origin server.",
    },
    {
      title: "DNS or anycast routes to the nearest PoP",
      description:
        "When a user requests content, DNS resolution (or anycast IP routing) directs them to the geographically or network-topologically nearest PoP, not the origin server directly.",
    },
    {
      title: "Cache hit: served instantly from the edge",
      description:
        "If the requested content is already cached at that PoP, it's returned immediately — no round trip to the origin, often single-digit to low-double-digit milliseconds.",
    },
    {
      title: "Cache miss: origin pull, then cache",
      description:
        "If the PoP doesn't have the content (or its TTL expired), it fetches from the origin server once, serves that response to the user, and caches it locally for subsequent requests.",
      code: "Cache-Control: public, max-age=86400\nETag: \"abc123\"",
    },
    {
      title: "Cache invalidation and purging",
      description:
        "When origin content changes before the TTL expires, you either purge the CDN cache explicitly (API call) or use versioned URLs (e.g. /app.a1b2c3.js) so new deployments naturally bypass stale caches.",
    },
  ],
  tradeoffs: {
    pros: [
      "Dramatically reduces latency for geographically distributed users",
      "Absorbs traffic spikes and DDoS load away from the origin server",
      "Reduces origin bandwidth costs since most requests never reach it",
    ],
    cons: [
      "Cache invalidation adds complexity — stale content can be served if not handled carefully",
      "Not useful for highly dynamic, per-user content that can't be cached",
      "Adds an operational dependency on a third-party provider",
    ],
    whenToUse: [
      "Static assets: JS/CSS bundles, images, video, fonts",
      "Semi-static API responses that are the same for all users (public catalog data)",
      "Global audiences where origin latency would otherwise be high",
    ],
    whenNotToUse: [
      "Highly personalized, per-user dynamic content with no shared cacheable value",
      "Small, single-region applications with a local user base only",
    ],
    alternatives: [
      { name: "Regional origin replicas", note: "Deploy the origin itself in multiple regions instead of caching at the edge" },
      { name: "Edge compute", note: "Run logic at the edge (Cloudflare Workers, Lambda@Edge) instead of just caching static content" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd put static assets — JS bundles, images, video — behind a CDN with long cache TTLs and versioned filenames, so cache invalidation is handled by the URL changing rather than active purging. For semi-dynamic content that's the same across users, like a public product catalog, I'd cache it at the edge with a short TTL and explicit purge-on-update. I'd explicitly call out that a CDN also protects the origin from traffic spikes and absorbs a large share of DDoS traffic before it ever reaches our infrastructure — that's often as valuable as the latency win.",
    mistakes: [
      "Only thinking of CDNs as 'faster static file hosting' and missing the DDoS-absorption benefit",
      "Not having a cache invalidation strategy for content that changes before the TTL expires",
      "Trying to cache highly personalized, per-user dynamic content at the edge",
    ],
    followUps: [
      "How do you invalidate a cached asset before its TTL expires?",
      "How would you cache API responses that differ slightly per user (e.g. by locale)?",
      "What's the difference between caching at a CDN edge vs an application-level cache like Redis?",
    ],
    redFlags: [
      "Not knowing what a TTL or Cache-Control header is",
      "Thinking a CDN is only for video streaming",
    ],
  },
  challenge: [
    {
      question: "What is the primary reason a CDN reduces latency for a user in Mumbai accessing a US-hosted origin?",
      options: [
        "The CDN makes the origin server faster",
        "The request is served from a nearby edge PoP instead of traveling all the way to the origin",
        "CDNs compress all traffic automatically",
        "CDNs eliminate the need for DNS",
      ],
      correctIndex: 1,
      explanation:
        "A CDN caches content at edge locations physically close to users, avoiding the long round trip to a distant origin server for cached content.",
    },
    {
      question: "Why do many production apps use versioned filenames (e.g. app.a1b2c3.js) for cached static assets?",
      options: [
        "It's required by all CDNs",
        "It lets them set a very long cache TTL while still instantly invalidating old versions on deploy — new content gets a new URL",
        "It makes files smaller",
        "It's only for SEO purposes",
      ],
      correctIndex: 1,
      explanation:
        "A content-hashed filename changes whenever the file changes, so browsers/CDNs never serve a stale version — no active cache purge needed.",
    },
  ],
};

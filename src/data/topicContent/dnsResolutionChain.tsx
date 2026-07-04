import { DnsResolutionChain } from "@/components/visualizations/DnsResolutionChain";
import type { TopicContent } from "./types";

export const dnsResolutionChain: TopicContent = {
  visual: DnsResolutionChain,
  howItWorks: [
    {
      title: "Check local caches first",
      description:
        "The browser checks its own DNS cache, then the OS checks its resolver cache/hosts file. Most everyday lookups never leave the machine because of these caches.",
    },
    {
      title: "Recursive resolver takes over",
      description:
        "If nothing is cached locally, the query goes to a recursive resolver (your ISP's, or a public one like 8.8.8.8), which does the multi-hop lookup on your behalf.",
    },
    {
      title: "Root → TLD → Authoritative, one referral at a time",
      description:
        "The resolver asks a root server which TLD server handles .com, asks that TLD server which name server is authoritative for example.com, then asks that authoritative server for the actual IP.",
      code: "resolver → root: \"who handles .com?\"\nresolver → .com TLD: \"who handles example.com?\"\nresolver → example.com NS: \"what's the A record?\"",
    },
    {
      title: "The resolver caches the answer",
      description:
        "Once resolved, the recursive resolver caches the result for the record's TTL, so the next request for the same domain (from any client using that resolver) is instant.",
    },
    {
      title: "Resolution is just the first step",
      description:
        "Once the browser has an IP address, it still needs to complete a TCP handshake (and TLS handshake for HTTPS) before the actual HTTP request can be sent — DNS resolution happens before any of that.",
    },
  ],
  tradeoffs: {
    pros: [
      "Caching at every layer (browser, OS, resolver) makes the overwhelming majority of lookups nearly instant",
      "The hierarchical root/TLD/authoritative structure scales to the entire internet without any single server needing to know everything",
    ],
    cons: [
      "A cold cache lookup adds real, user-visible latency (multiple network round trips) before a page can even start loading",
      "DNS TTL misconfigurations can cause stale records to be cached far longer (or shorter) than intended",
      "Plain DNS queries are unencrypted, which DoH/DoT (DNS-over-HTTPS/TLS) address",
    ],
    whenToUse: [
      "Every internet-facing system relies on this chain implicitly — the relevant design decision is usually TTL tuning",
      "Lower TTLs when you need fast failover/changes; higher TTLs to reduce load and lookup latency when records are stable",
    ],
    whenNotToUse: [
      "N/A — this is a foundational internet mechanism, not an optional component to include or exclude",
    ],
    alternatives: [
      { name: "DNS-over-HTTPS (DoH)", note: "Encrypts DNS queries to prevent ISP-level snooping or tampering" },
      { name: "Anycast DNS", note: "Multiple physical servers share one IP; the network routes to the nearest one, reducing resolution latency" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd walk through the chain: browser cache, OS cache, then the recursive resolver, which — if it has nothing cached — queries a root server, then a TLD server, then the authoritative name server, one referral at a time, before returning and caching the final IP. I'd emphasize that this whole chain only runs on a cache miss; the reason DNS scales to the entire internet is aggressive caching at every layer combined with TTL-based expiry. For a system design context, I'd mention that TTL is a real tuning knob — low TTLs give faster failover during an incident, at the cost of more frequent lookups and higher latency for end users.",
    mistakes: [
      "Not knowing the root → TLD → authoritative hierarchy and just saying 'DNS looks it up somehow'",
      "Forgetting that DNS resolution happens before the TCP/TLS handshake, not as part of it",
      "Not connecting TTL choice to a real operational tradeoff (failover speed vs lookup load/latency)",
    ],
    followUps: [
      "What happens if the authoritative name server for a domain is down?",
      "How does a lower DNS TTL help during a failover, and what does it cost?",
      "What is DNS-over-HTTPS and what problem does it solve?",
    ],
    redFlags: [
      "Not knowing what a TTL is in the context of DNS",
      "Confusing DNS resolution with the TLS handshake",
    ],
  },
  challenge: [
    {
      question: "In a full (uncached) DNS resolution, what is the correct order of servers the recursive resolver queries?",
      options: [
        "Authoritative → TLD → Root",
        "Root → TLD → Authoritative",
        "TLD → Root → Authoritative",
        "There's no fixed order",
      ],
      correctIndex: 1,
      explanation:
        "The resolver starts at a root server, which refers it to the TLD server (e.g. .com), which refers it to the domain's authoritative name server, which finally returns the actual record.",
    },
    {
      question: "Why does lowering a DNS record's TTL help during a planned failover, but at a cost?",
      options: [
        "It has no real effect on failover",
        "Clients pick up the new IP faster after a change, but at the cost of more frequent lookups and slightly higher average latency",
        "It makes the authoritative server faster",
        "It permanently disables caching",
      ],
      correctIndex: 1,
      explanation:
        "A lower TTL means cached records expire and get re-queried sooner, so clients see a DNS change faster — but this also means resolvers cache less and query the authoritative server more often.",
    },
  ],
};

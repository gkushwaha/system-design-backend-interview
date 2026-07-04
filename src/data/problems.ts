import type { Tier } from "./topics";

export interface Problem {
  id: string; // "P1".."P30"
  order: number;
  slug: string;
  title: string;
  tier: Tier;
  estimatedMinutes: number;
  company: string;
}

type ProblemSeed = [order: number, slug: string, title: string, company: string];

const mostAskedSeeds: ProblemSeed[] = [
  [1, "url-shortener", "Design a URL shortener (TinyURL)", "Bitly"],
  [2, "rate-limiter", "Design a rate limiter", "Stripe / GitHub"],
  [3, "notification-system", "Design a notification system", "Uber"],
  [4, "key-value-store", "Design a key-value store", "Amazon DynamoDB"],
  [5, "unique-id-generator", "Design a unique ID generator (Snowflake)", "Twitter"],
  [6, "twitter-feed", "Design Twitter/X feed", "Twitter/X"],
  [7, "whatsapp", "Design WhatsApp", "WhatsApp"],
];

const advancedSeeds: ProblemSeed[] = [
  [8, "youtube", "Design YouTube", "YouTube"],
  [9, "uber", "Design Uber", "Uber"],
  [10, "google-drive", "Design Google Drive / Dropbox", "Dropbox"],
  [11, "instagram", "Design Instagram", "Instagram"],
  [12, "distributed-cache", "Design a distributed cache (Redis-like)", "Redis Labs"],
  [13, "search-autocomplete", "Design search autocomplete", "Google"],
  [14, "payment-system", "Design a payment system", "Stripe"],
  [15, "ticket-booking", "Design a ticket booking system", "Ticketmaster"],
  [16, "leaderboard", "Design a leaderboard", "Riot Games"],
  [17, "location-based-service", "Design a location-based service", "Yelp / Uber"],
  [18, "metrics-monitoring", "Design a metrics/monitoring system", "Datadog"],
  [19, "web-crawler", "Design a web crawler", "Google"],
  [20, "distributed-message-queue", "Design a distributed message queue (Kafka-like)", "Apache Kafka"],
  [21, "ad-click-aggregator", "Design an ad click aggregator", "Google Ads"],
  [22, "pastebin", "Design a pastebin", "Pastebin"],
];

const expertSeeds: ProblemSeed[] = [
  [23, "google-search", "Design Google Search", "Google"],
  [24, "netflix", "Design Netflix", "Netflix"],
  [25, "slack", "Design Slack", "Slack"],
  [26, "distributed-job-scheduler", "Design a distributed job scheduler", "Airbnb (Chronos)"],
  [27, "distributed-transaction-system", "Design a distributed transaction system", "Google Spanner"],
  [28, "multiregion-conflict-db", "Design a multi-region DB with conflict resolution", "CockroachDB"],
  [29, "fraud-detection", "Design a fraud detection system", "PayPal"],
  [30, "live-streaming", "Design a live streaming platform (Twitch-like)", "Twitch"],
];

function toProblems(seeds: ProblemSeed[], tier: Tier, estimatedMinutes: number): Problem[] {
  return seeds.map(([order, slug, title, company]) => ({
    id: `P${order}`,
    order,
    slug,
    title,
    tier,
    estimatedMinutes,
    company,
  }));
}

export const problems: Problem[] = [
  ...toProblems(mostAskedSeeds, "most-asked", 30),
  ...toProblems(advancedSeeds, "advanced", 40),
  ...toProblems(expertSeeds, "expert", 50),
];

export const problemsById = new Map(problems.map((p) => [p.id, p]));
export const problemBySlug = new Map(problems.map((p) => [p.slug, p]));

export function problemsByTier(tier: Tier): Problem[] {
  return problems.filter((p) => p.tier === tier);
}

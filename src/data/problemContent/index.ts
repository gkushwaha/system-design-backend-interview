import type { ProblemContent } from "./types";

type Loader = () => Promise<ProblemContent>;

const loaders: Record<string, Loader> = {
  "url-shortener": () => import("./urlShortener").then((m) => m.urlShortener),
  "rate-limiter": () => import("./rateLimiterProblem").then((m) => m.rateLimiterProblem),
  "notification-system": () => import("./notificationSystem").then((m) => m.notificationSystem),
  "key-value-store": () => import("./keyValueStore").then((m) => m.keyValueStore),
  "unique-id-generator": () => import("./uniqueIdGenerator").then((m) => m.uniqueIdGenerator),
  "twitter-feed": () => import("./twitterFeed").then((m) => m.twitterFeed),
  whatsapp: () => import("./whatsapp").then((m) => m.whatsapp),
  uber: () => import("./uber").then((m) => m.uber),
  instagram: () => import("./instagram").then((m) => m.instagram),
  "payment-system": () => import("./paymentSystem").then((m) => m.paymentSystem),
  "distributed-message-queue": () => import("./distributedMessageQueue").then((m) => m.distributedMessageQueue),
  netflix: () => import("./netflix").then((m) => m.netflix),
  "distributed-job-scheduler": () => import("./distributedJobScheduler").then((m) => m.distributedJobScheduler),
};

export function hasProblemContent(slug: string): boolean {
  return slug in loaders;
}

export function loadProblemContent(slug: string): Promise<ProblemContent> | null {
  const loader = loaders[slug];
  return loader ? loader() : null;
}

export type { ProblemContent };

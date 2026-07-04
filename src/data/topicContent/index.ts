import type { TopicContent } from "./types";

type Loader = () => Promise<TopicContent>;

const loaders: Record<string, Loader> = {
  "horizontal-vs-vertical-scaling": () => import("./horizontalVsVerticalScaling").then((m) => m.horizontalVsVerticalScaling),
  "load-balancers": () => import("./loadBalancers").then((m) => m.loadBalancers),
  "sql-vs-nosql": () => import("./sqlVsNoSql").then((m) => m.sqlVsNoSql),
  "caching-patterns": () => import("./cachingPatterns").then((m) => m.cachingPatterns),
  "cap-theorem": () => import("./capTheorem").then((m) => m.capTheorem),
  "database-indexing": () => import("./databaseIndexing").then((m) => m.databaseIndexing),
  "database-replication": () => import("./databaseReplication").then((m) => m.databaseReplication),
  "message-queues": () => import("./messageQueues").then((m) => m.messageQueues),
  "rest-vs-grpc": () => import("./restVsGrpc").then((m) => m.restVsGrpc),
  "rate-limiting": () => import("./rateLimiting").then((m) => m.rateLimiting),
  cdn: () => import("./cdn").then((m) => m.cdn),
  "consistent-hashing": () => import("./consistentHashing").then((m) => m.consistentHashing),
  "database-sharding": () => import("./databaseSharding").then((m) => m.databaseSharding),
  "api-design": () => import("./apiDesign").then((m) => m.apiDesign),
  "circuit-breaker": () => import("./circuitBreaker").then((m) => m.circuitBreaker),
  "consistency-models": () => import("./consistencyModels").then((m) => m.consistencyModels),
  "raft-consensus": () => import("./raftConsensus").then((m) => m.raftConsensus),
  "btree-vs-lsm": () => import("./btreeVsLsm").then((m) => m.btreeVsLsm),
  "cache-penetration-avalanche": () => import("./cachePenetrationAvalanche").then((m) => m.cachePenetrationAvalanche),
  "kafka-architecture": () => import("./kafkaArchitecture").then((m) => m.kafkaArchitecture),
  "geospatial-indexing": () => import("./geospatialIndexing").then((m) => m.geospatialIndexing),
  "bloom-filter": () => import("./bloomFilter").then((m) => m.bloomFilter),
  "jwt-oauth2": () => import("./jwtOauth2").then((m) => m.jwtOauth2),
  "dns-resolution-chain": () => import("./dnsResolutionChain").then((m) => m.dnsResolutionChain),
  "outbox-pattern": () => import("./outboxPattern").then((m) => m.outboxPattern),
  "s3-internals": () => import("./s3Internals").then((m) => m.s3Internals),
  "retry-backoff-jitter": () => import("./retryBackoffJitter").then((m) => m.retryBackoffJitter),
  "distributed-tracing": () => import("./distributedTracing").then((m) => m.distributedTracing),
  crdts: () => import("./crdts").then((m) => m.crdts),
  "column-oriented-storage": () => import("./columnOrientedStorage").then((m) => m.columnOrientedStorage),
  mtls: () => import("./mtls").then((m) => m.mtls),
  "blue-green-canary-shadow": () => import("./deploymentStrategies").then((m) => m.deploymentStrategies),
  "lambda-vs-kappa": () => import("./lambdaVsKappa").then((m) => m.lambdaVsKappa),
  "data-lakes-warehouses-lakehouses": () => import("./dataLakesWarehouses").then((m) => m.dataLakesWarehouses),
};

export function hasTopicContent(slug: string): boolean {
  return slug in loaders;
}

export function loadTopicContent(slug: string): Promise<TopicContent> | null {
  const loader = loaders[slug];
  return loader ? loader() : null;
}

export type { TopicContent };

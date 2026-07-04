export type Tier = "most-asked" | "advanced" | "expert";

export interface Topic {
  id: number;
  slug: string;
  title: string;
  tier: Tier;
  group: string;
  estimatedMinutes: number;
  example: string;
  /** ids of topics that must be completed before this one unlocks (advanced/expert only) */
  prerequisites: number[];
}

const MOST_ASKED_GROUP = "Most Asked";

// ─────────────────────────────────────────────────────────────
// MOST ASKED (1-15) — always unlocked
// ─────────────────────────────────────────────────────────────
const mostAsked: Topic[] = [
  { id: 1, slug: "horizontal-vs-vertical-scaling", title: "Horizontal vs vertical scaling", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 15, example: "How Instagram scaled from 1 server to 1 billion users", prerequisites: [] },
  { id: 2, slug: "load-balancers", title: "Load balancers", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 18, example: "AWS ALB routing to EC2 instances", prerequisites: [] },
  { id: 3, slug: "sql-vs-nosql", title: "SQL vs NoSQL", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 18, example: "SQL for banking, Cassandra for time series, Redis for sessions", prerequisites: [] },
  { id: 4, slug: "caching-patterns", title: "Caching (cache-aside, write-through, write-back)", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 20, example: "Twitter caches timelines in Redis — 95% reads never touch DB", prerequisites: [] },
  { id: 5, slug: "cap-theorem", title: "CAP theorem", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 15, example: "Cassandra (AP) vs HBase (CP) vs traditional SQL (CA)", prerequisites: [] },
  { id: 6, slug: "database-indexing", title: "Database indexing", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 18, example: "Finding user by email — 50ms full scan → 0.1ms with index", prerequisites: [] },
  { id: 7, slug: "database-replication", title: "Database replication", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 18, example: "MySQL primary/replica at Facebook scale", prerequisites: [] },
  { id: 8, slug: "message-queues", title: "Message queues (Kafka / SQS / RabbitMQ)", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 20, example: "Uber trip events flowing through Kafka", prerequisites: [] },
  { id: 9, slug: "rest-vs-grpc", title: "REST vs gRPC", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 15, example: "REST for public API, gRPC between internal microservices", prerequisites: [] },
  { id: 10, slug: "rate-limiting", title: "Rate limiting", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 18, example: "GitHub API 5000 req/hour, Stripe per-customer limits", prerequisites: [] },
  { id: 11, slug: "cdn", title: "CDN", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 15, example: "Netflix serves 99% of traffic from CDN edge nodes", prerequisites: [] },
  { id: 12, slug: "consistent-hashing", title: "Consistent hashing", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 20, example: "Memcached cluster, DynamoDB partitioning", prerequisites: [] },
  { id: 13, slug: "database-sharding", title: "Database sharding", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 20, example: "Instagram shards by user_id hash", prerequisites: [] },
  { id: 14, slug: "api-design", title: "API design (REST + pagination + idempotency)", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 20, example: "Stripe API — idempotency keys prevent double charges", prerequisites: [] },
  { id: 15, slug: "circuit-breaker", title: "Circuit breaker pattern", tier: "most-asked", group: MOST_ASKED_GROUP, estimatedMinutes: 18, example: "Netflix pioneered the pattern with Hystrix; today's equivalent is resilience4j", prerequisites: [] },
];

// ─────────────────────────────────────────────────────────────
// ADVANCED (16-82) — unlock after completing 8 Most Asked
// ─────────────────────────────────────────────────────────────
type AdvancedSeed = [id: number, slug: string, title: string, example: string];

const advancedGroups: [string, AdvancedSeed[]][] = [
  ["Distributed Systems Core", [
    [16, "cap-theorem-pacelc", "CAP theorem deep dive + PACELC extension", "Comparing Cassandra, DynamoDB, and Spanner tradeoffs"],
    [17, "consistency-models", "Consistency models (strong, causal, eventual, read-your-writes)", "DynamoDB eventual consistency vs Spanner strong consistency"],
    [18, "distributed-transactions-2pc", "Distributed transactions — 2PC and blocking failure modes", "Bank transfer across two microservice-owned databases"],
    [19, "saga-pattern", "Saga pattern — choreography vs orchestration", "E-commerce checkout: payment, inventory, shipping sagas"],
    [20, "idempotency-distributed", "Idempotency in distributed systems", "Payment retries after network timeout"],
    [21, "distributed-locking-redlock", "Distributed locking — Redlock algorithm", "Preventing double-processing of a scheduled job across nodes"],
    [22, "fencing-tokens", "Fencing tokens", "Preventing a paused GC'd node from corrupting storage"],
    [23, "split-brain", "Split-brain problem", "Two nodes both believing they are leader during a partition"],
    [24, "vector-clocks", "Vector clocks and Lamport timestamps", "Riak conflict detection across replicas"],
    [25, "gossip-protocol", "Gossip protocol", "Cassandra cluster membership propagation"],
    [26, "quorum-reads-writes", "Quorum reads and writes (R + W > N)", "DynamoDB tunable consistency per request"],
    [27, "leader-election", "Leader election", "Kafka controller election via ZooKeeper/KRaft"],
  ]],
  ["Consensus Algorithms", [
    [28, "raft-consensus", "Raft — leader election + log replication (full stepper)", "etcd's Raft implementation backing Kubernetes"],
    [29, "paxos-consensus", "Paxos — conceptual animated walkthrough", "Google Chubby lock service"],
    [30, "etcd-zookeeper", "etcd and Zookeeper use cases", "Kubernetes control plane state in etcd"],
  ]],
  ["Database Internals", [
    [31, "btree-vs-lsm", "B-tree vs LSM-tree — write amplification tradeoff", "Postgres B-tree vs Cassandra/RocksDB LSM-tree"],
    [32, "write-ahead-log", "Write-Ahead Log (WAL) and crash recovery", "Postgres WAL replay after a crash"],
    [33, "mvcc", "MVCC — multi-version concurrency control", "Postgres and MySQL InnoDB snapshot isolation"],
    [34, "isolation-levels", "Transaction isolation levels — all 4 with anomaly demos", "Read committed vs serializable in a banking ledger"],
    [35, "optimistic-vs-pessimistic-locking", "Optimistic vs pessimistic locking", "E-commerce inventory decrement under high contention"],
    [36, "change-data-capture", "Change Data Capture (CDC)", "Debezium streaming MySQL binlog into Kafka"],
    [37, "partitioning-vs-sharding", "Partitioning vs sharding (they are different)", "Postgres table partitioning vs Vitess sharding"],
    [38, "materialized-views", "Materialized views", "Precomputed analytics dashboards refreshed on schedule"],
  ]],
  ["Advanced Caching", [
    [39, "redis-cluster", "Redis Cluster — slot distribution, failover", "16384 hash slots across a Redis Cluster deployment"],
    [40, "cache-penetration-avalanche", "Cache penetration, avalanche, breakdown + solutions", "Black Friday cache stampede protection"],
    [41, "cache-warming", "Cache warming strategies", "Pre-loading product catalog cache before a sale"],
    [42, "distributed-cache-consistent-hashing", "Distributed cache with consistent hashing", "Memcached client-side sharding"],
  ]],
  ["Kafka Internals", [
    [43, "kafka-architecture", "Kafka architecture — partitions, offsets, consumer groups, ISR", "LinkedIn's original Kafka deployment"],
    [44, "kafka-exactly-once", "Kafka exactly-once semantics", "Idempotent producers + transactional consumers"],
    [45, "log-compaction", "Log compaction", "Kafka compacted topic for a changelog of latest state"],
    [46, "kafka-streams", "Kafka Streams basics", "Real-time fraud scoring pipeline"],
  ]],
  ["Search and Geospatial", [
    [47, "inverted-index", "Inverted index — how Elasticsearch works", "Elasticsearch full-text search over product catalog"],
    [48, "trie-autocomplete", "Trie for autocomplete", "Google Search query autocomplete"],
    [49, "geospatial-indexing", "Geospatial indexing — GeoHash + QuadTree", "Uber's H3 hexagonal grid for driver matching"],
    [50, "fulltext-vs-fuzzy-search", "Full-text search vs fuzzy search", "Typo-tolerant search on an e-commerce site"],
  ]],
  ["Probabilistic Data Structures", [
    [51, "bloom-filter", "Bloom filter", "Chrome's Safe Browsing malicious URL check"],
    [52, "hyperloglog", "HyperLogLog", "Redis PFCOUNT for unique visitor estimation"],
    [53, "count-min-sketch", "Count-Min Sketch", "Estimating heavy hitters in a traffic stream"],
    [54, "merkle-tree", "Merkle tree", "Git object integrity and Dynamo anti-entropy repair"],
  ]],
  ["API and Protocol Depth", [
    [55, "graphql-n-plus-one", "GraphQL — queries, mutations, N+1 problem, DataLoader", "GitHub's public GraphQL API"],
    [56, "websockets-vs-sse-vs-polling", "WebSockets vs SSE vs Long Polling vs Webhooks", "Slack real-time messaging vs Stripe webhooks"],
    [57, "http1-vs-http2-vs-http3", "HTTP/1.1 vs HTTP/2 vs HTTP/3 — head-of-line blocking, QUIC", "Google's adoption of QUIC/HTTP3 for Search"],
    [58, "jwt-oauth2", "JWT and OAuth2 — full animated token flow", "\"Sign in with Google\" OAuth2 flow"],
    [59, "api-versioning", "API versioning strategies", "Stripe's dated API version headers"],
    [60, "webhooks-design", "Webhooks design and delivery guarantees", "Stripe webhook retries with exponential backoff"],
  ]],
  ["Networking Depth", [
    [61, "tcp-vs-udp", "TCP vs UDP", "Video calls over UDP vs file transfer over TCP"],
    [62, "tls-handshake", "TLS handshake step by step", "HTTPS connection setup to any website"],
    [63, "dns-resolution-chain", "DNS resolution chain — full animated lookup", "Resolving www.example.com from a cold cache"],
    [64, "reverse-proxy-vs-gateway", "Reverse proxy vs API gateway", "Nginx reverse proxy vs Kong API gateway"],
    [65, "service-discovery", "Service discovery — Consul, etcd, DNS-based", "Netflix Eureka service registry"],
  ]],
  ["Scalability Patterns", [
    [66, "cqrs", "CQRS", "Separating read models from write models at scale"],
    [67, "event-sourcing", "Event sourcing", "Banking ledger rebuilt from an immutable event log"],
    [68, "outbox-pattern", "Outbox pattern — solving the dual write problem", "Reliably publishing an order-created event with the DB write"],
    [69, "fanout-write-vs-read", "Fan-out on write vs fan-out on read", "Twitter timeline generation for celebrities vs regular users"],
    [70, "backpressure", "Backpressure handling", "Reactive streams slowing a fast producer"],
  ]],
  ["Storage Systems", [
    [71, "object-vs-block-vs-file", "Object vs block vs file storage", "S3 (object) vs EBS (block) vs EFS (file)"],
    [72, "s3-internals", "S3 internals — multipart upload, consistency model", "Uploading a 10GB video in parallel chunks"],
    [73, "time-series-databases", "Time series databases", "Prometheus and InfluxDB for metrics storage"],
  ]],
  ["Reliability Patterns", [
    [74, "retry-backoff-jitter", "Retry with exponential backoff and jitter", "AWS SDK's default retry policy"],
    [75, "bulkhead-pattern", "Bulkhead pattern", "Isolating thread pools per downstream dependency"],
    [76, "timeout-patterns", "Timeout patterns", "Setting client timeouts shorter than server timeouts"],
    [77, "health-checks", "Health checks — liveness vs readiness vs startup", "Kubernetes pod probes"],
    [78, "chaos-engineering", "Chaos engineering basics", "Netflix Chaos Monkey randomly killing instances"],
  ]],
  ["Observability", [
    [79, "metrics-logs-traces", "Metrics, logs, traces — three pillars", "Datadog's unified observability stack"],
    [80, "distributed-tracing", "Distributed tracing — trace ID, spans, Jaeger waterfall", "Tracing a request across 12 microservices"],
    [81, "sli-slo-sla", "SLI, SLO, SLA and error budgets", "Google SRE error budget policy"],
    [82, "alerting-symptom-vs-cause", "Alerting — symptom-based vs cause-based", "PagerDuty alert routing for on-call engineers"],
  ]],
];

const advanced: Topic[] = advancedGroups.flatMap(([group, seeds]) =>
  seeds.map(([id, slug, title, example]) => ({
    id,
    slug,
    title,
    tier: "advanced" as const,
    group,
    estimatedMinutes: 14,
    example,
    prerequisites: [],
  })),
);

// ─────────────────────────────────────────────────────────────
// EXPERT (83-113) — unlock after completing 20 Advanced
// ─────────────────────────────────────────────────────────────
type ExpertSeed = [id: number, slug: string, title: string, example: string];

const expertGroups: [string, ExpertSeed[]][] = [
  ["Advanced Distributed Systems", [
    [83, "crdts", "CRDTs", "Figma/Google Docs collaborative editing conflict-free merges"],
    [84, "dynamo-architecture", "Dynamo architecture — consistent hashing + sloppy quorum + hinted handoff", "Amazon DynamoDB's original paper design"],
    [85, "spanner-architecture", "Spanner architecture — TrueTime, external consistency", "Google Spanner globally consistent transactions"],
    [86, "flp-impossibility", "FLP impossibility theorem", "Why no consensus algorithm can guarantee termination async"],
    [87, "pacelc-theorem", "PACELC theorem", "Extending CAP to reason about latency-consistency tradeoffs"],
  ]],
  ["Advanced Databases", [
    [88, "column-oriented-storage", "Column-oriented storage — Parquet vs row stores", "Data warehouse analytics on Parquet files"],
    [89, "distributed-sql", "Distributed SQL — CockroachDB, YugabyteDB, Vitess", "YouTube's Vitess sharding MySQL at scale"],
    [90, "multiregion-active-active-db", "Multi-region active-active databases", "Global e-commerce writes accepted in every region"],
    [91, "multimaster-conflict-resolution", "Conflict resolution in multi-master replication", "Last-write-wins vs CRDT merge in multi-master Postgres"],
    [92, "htap", "HTAP — hybrid transactional/analytical processing", "TiDB serving both OLTP and OLAP workloads"],
  ]],
  ["Security at Scale", [
    [93, "mtls", "mTLS — mutual TLS for service-to-service auth", "Istio service mesh enforcing mTLS between pods"],
    [94, "zero-trust", "Zero trust architecture", "Google BeyondCorp eliminating the network perimeter"],
    [95, "ddos-mitigation", "DDoS mitigation", "Cloudflare absorbing a multi-Tbps volumetric attack"],
    [96, "secret-management", "Secret management — Vault, AWS Secrets Manager", "Rotating database credentials automatically"],
    [97, "ssrf-injection-infra", "SSRF and injection at infrastructure level", "Cloud metadata endpoint SSRF exploitation"],
  ]],
  ["Infrastructure and Deployment", [
    [98, "kubernetes-internals", "Kubernetes internals — scheduler, etcd, kubelet, HPA", "How a Deployment rollout actually schedules pods"],
    [99, "serverless-tradeoffs", "Serverless tradeoffs — cold start, cost model", "AWS Lambda cold starts under bursty traffic"],
    [100, "cell-based-architecture", "Cell-based architecture", "AWS's cell-based isolation to limit blast radius"],
    [101, "blue-green-canary-shadow", "Blue-green vs canary vs shadow deployments", "Gradual canary rollout with automatic rollback"],
    [102, "multiregion-active-passive", "Multi-region active-active vs active-passive", "Disaster recovery failover between AWS regions"],
    [103, "disaster-recovery-rto-rpo", "Disaster recovery — RTO vs RPO", "Defining acceptable data loss and downtime windows"],
  ]],
  ["Streaming at Scale", [
    [104, "lambda-vs-kappa", "Lambda architecture vs Kappa architecture", "LinkedIn's shift from Lambda to Kappa architecture"],
    [105, "apache-flink", "Apache Flink — stateful processing, watermarks, checkpoints", "Real-time fraud detection with event-time windows"],
    [106, "exactly-once-streaming", "Exactly-once in stream processing", "Flink checkpointing with two-phase commit sinks"],
    [107, "stream-table-joins", "Stream-table joins", "Enriching a clickstream with a slowly-changing user table"],
    [108, "schema-registry", "Schema registry — Avro + Confluent", "Enforcing backward-compatible schema evolution in Kafka"],
  ]],
  ["Data Engineering", [
    [109, "etl-vs-elt", "ETL vs ELT pipelines", "Modern ELT with dbt on a cloud data warehouse"],
    [110, "data-lakes-warehouses-lakehouses", "Data lakes vs warehouses vs lakehouses", "Databricks Delta Lake lakehouse architecture"],
    [111, "batch-vs-stream-tradeoffs", "Batch vs stream processing tradeoffs", "Nightly batch reports vs real-time dashboards"],
    [112, "cdc-in-pipelines", "Change Data Capture in pipelines", "Streaming Postgres changes into a data lake"],
    [113, "slowly-changing-dimensions", "Slowly changing dimensions", "Tracking historical address changes in a dimension table"],
  ]],
];

const expert: Topic[] = expertGroups.flatMap(([group, seeds]) =>
  seeds.map(([id, slug, title, example]) => ({
    id,
    slug,
    title,
    tier: "expert" as const,
    group,
    estimatedMinutes: 18,
    example,
    prerequisites: [],
  })),
);

export const topics: Topic[] = [...mostAsked, ...advanced, ...expert];

export const topicsById = new Map(topics.map((t) => [t.id, t]));
export const topicBySlug = new Map(topics.map((t) => [t.slug, t]));

export const MOST_ASKED_COUNT = mostAsked.length; // 15
export const ADVANCED_COUNT = advanced.length; // 67
export const EXPERT_COUNT = expert.length; // 31

export const ADVANCED_UNLOCK_THRESHOLD = 8; // Most Asked topics required
export const EXPERT_UNLOCK_THRESHOLD = 20; // Advanced topics required

export const tierBadge: Record<Tier, string> = {
  "most-asked": "Most Asked",
  advanced: "Advanced",
  expert: "Expert",
};

export function topicsByTier(tier: Tier): Topic[] {
  return topics.filter((t) => t.tier === tier);
}

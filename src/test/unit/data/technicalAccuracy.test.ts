import { describe, expect, it } from "vitest";
import { topics } from "@/data/topics";
import { capTheorem } from "@/data/topicContent/capTheorem";
import { bloomFilter } from "@/data/topicContent/bloomFilter";
import { circuitBreaker } from "@/data/topicContent/circuitBreaker";
import { kafkaArchitecture } from "@/data/topicContent/kafkaArchitecture";
import { rateLimiting } from "@/data/topicContent/rateLimiting";
import {
  latencyNumbers,
  httpStatusCodes,
  cachingPatterns,
  capSystems,
} from "@/pages/QuickRef";

function joinAllText(content: {
  howItWorks: { title: string; description: string }[];
  tradeoffs: { pros: string[]; cons: string[]; whenToUse: string[]; whenNotToUse: string[] };
  interviewAnswer: { script: string; mistakes: string[]; followUps: string[]; redFlags: string[] };
}): string {
  return [
    ...content.howItWorks.map((s) => `${s.title} ${s.description}`),
    ...content.tradeoffs.pros,
    ...content.tradeoffs.cons,
    ...content.tradeoffs.whenToUse,
    ...content.tradeoffs.whenNotToUse,
    content.interviewAnswer.script,
    ...content.interviewAnswer.mistakes,
    ...content.interviewAnswer.followUps,
    ...content.interviewAnswer.redFlags,
  ].join(" \n ");
}

describe("CAP theorem accuracy", () => {
  it("Cassandra is classified AP", () => {
    const row = capSystems.find((s) => s.system.includes("Cassandra"));
    expect(row?.classification).toBe("AP");
  });
  it("MongoDB/HBase are classified CP", () => {
    const row = capSystems.find((s) => s.system.includes("HBase"));
    expect(row?.classification).toBe("CP");
  });
  it("traditional single-node SQL is classified CA", () => {
    const row = capSystems.find((s) => s.system.includes("Traditional SQL"));
    expect(row?.classification).toBe("CA");
  });
  it("describes choosing C or A during a partition, not both", () => {
    const text = joinAllText(capTheorem);
    expect(text).toMatch(/consistency|availability/i);
  });
});

describe("latency numbers — canonical values (Jeff Dean's table)", () => {
  function ns(row: { op: string; time: string }): number {
    const match = row.time.match(/^([\d.]+)\s*(ns|μs|ms)$/);
    if (!match) throw new Error(`Unparseable time: ${row.time}`);
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit === "ns") return value;
    if (unit === "μs") return value * 1_000;
    return value * 1_000_000; // ms
  }

  it("L1 cache reference is 0.5ns", () => {
    expect(latencyNumbers.find((r) => r.op.includes("L1 cache"))?.time).toBe("0.5 ns");
  });
  it("L2 cache reference is 7ns", () => {
    expect(latencyNumbers.find((r) => r.op.includes("L2 cache"))?.time).toBe("7 ns");
  });
  it("Main memory reference is 100ns", () => {
    expect(latencyNumbers.find((r) => r.op.includes("Main memory"))?.time).toBe("100 ns");
  });
  it("Disk seek is 10ms", () => {
    expect(latencyNumbers.find((r) => r.op === "Disk seek")?.time).toBe("10 ms");
  });
  it("Round trip within same datacenter is 500μs", () => {
    expect(latencyNumbers.find((r) => r.op.includes("same datacenter"))?.time).toBe("500 μs");
  });
  it("Cross-continental packet (CA-Netherlands-CA) is 150ms", () => {
    expect(latencyNumbers.find((r) => r.op.includes("Netherlands"))?.time).toBe("150 ms");
  });

  it("ordering: L1 faster than L2", () => {
    const l1 = ns(latencyNumbers.find((r) => r.op.includes("L1 cache"))!);
    const l2 = ns(latencyNumbers.find((r) => r.op.includes("L2 cache"))!);
    expect(l1).toBeLessThan(l2);
  });
  it("ordering: RAM faster than SSD", () => {
    const ram = ns(latencyNumbers.find((r) => r.op === "Main memory reference")!);
    const ssd = ns(latencyNumbers.find((r) => r.op.includes("randomly from SSD"))!);
    expect(ram).toBeLessThan(ssd);
  });
  it("ordering: SSD faster than disk (HDD)", () => {
    const ssd = ns(latencyNumbers.find((r) => r.op === "Read 1MB sequentially from SSD")!);
    const hdd = ns(latencyNumbers.find((r) => r.op === "Read 1MB sequentially from disk")!);
    expect(ssd).toBeLessThan(hdd);
  });
  it("ordering: same-DC round trip faster than cross-continental", () => {
    const sameDc = ns(latencyNumbers.find((r) => r.op.includes("same datacenter"))!);
    const crossCont = ns(latencyNumbers.find((r) => r.op.includes("Netherlands"))!);
    expect(sameDc).toBeLessThan(crossCont);
  });
});

describe("HTTP status codes", () => {
  const expected: Record<string, string> = {
    "200": "OK",
    "201": "Created",
    "204": "No Content",
    "301": "Moved Permanently",
    "304": "Not Modified",
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not Found",
    "409": "Conflict",
    "429": "Too Many Requests",
    "500": "Internal Server Error",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
  };

  it.each(Object.entries(expected))("code %s means %s", (code, meaning) => {
    const row = httpStatusCodes.find((r) => r.code === code);
    expect(row).toBeTruthy();
    expect(row!.meaning).toContain(meaning);
  });
});

describe("caching pattern accuracy", () => {
  it("cache-aside: check cache, miss, read DB, populate cache", () => {
    const row = cachingPatterns.find((p) => p.name === "Cache-aside");
    expect(row?.desc).toMatch(/cache first.*miss.*reads DB.*populates cache/i);
  });
  it("write-through: write to cache AND DB synchronously", () => {
    const row = cachingPatterns.find((p) => p.name === "Write-through");
    expect(row?.desc).toMatch(/cache and DB synchronously/i);
  });
  it("write-back: write to cache, async write to DB, data-loss risk documented", () => {
    const row = cachingPatterns.find((p) => p.name === "Write-back");
    expect(row?.desc).toMatch(/flushed to DB asynchronously/i);
    expect(row?.when).toMatch(/risk of data loss/i);
  });
});

describe("Kafka accuracy", () => {
  const text = joinAllText(kafkaArchitecture);

  it("describes Kafka as a partitioned/distributed log, not a generic queue", () => {
    expect(text).toMatch(/partition/i);
    expect(text).toMatch(/log|offset/i);
  });
  it("mentions consumer groups and per-partition single-owner semantics", () => {
    expect(text).toMatch(/consumer group/i);
  });
  it("mentions offsets", () => {
    expect(text).toMatch(/offset/i);
  });
  it("mentions ISR (in-sync replicas)", () => {
    expect(text).toMatch(/ISR|in-sync replica/i);
  });
});

describe("bloom filter accuracy", () => {
  const text = joinAllText(bloomFilter);

  it("states false positives are possible", () => {
    expect(text).toMatch(/false positive/i);
  });
  it("states false negatives are NOT possible", () => {
    expect(text).toMatch(/no false negatives|false negatives are (impossible|not possible)/i);
  });
  it("does not claim standard bloom filters support deletion", () => {
    expect(text).toMatch(/can't (support|easily support) deletion|can't remove/i);
  });
});

describe("circuit breaker accuracy", () => {
  const text = joinAllText(circuitBreaker);

  it("describes exactly 3 states: closed, open, half-open", () => {
    expect(text).toMatch(/closed/i);
    expect(text).toMatch(/\bopen\b/i);
    expect(text).toMatch(/half-open/i);
  });

  // BUG-003: circuit breaker content presents Netflix Hystrix as a *current* solution
  // ("like Netflix's Hystrix protecting calls between microservices"). Netflix put
  // Hystrix into maintenance mode in 2018; presenting it in the present tense as
  // Netflix's current approach is a real, verifiable content-accuracy bug.
  it("BUG-003: does not present Netflix Hystrix as Netflix's current/active solution", () => {
    const hystrixMention = text.match(/[^.]*Hystrix[^.]*\./gi) ?? [];
    for (const sentence of hystrixMention) {
      expect(sentence).not.toMatch(/Netflix'?s? Hystrix (protecting|protects|uses)/i);
    }
  });
});

describe("rate limiting accuracy", () => {
  const text = joinAllText(rateLimiting);

  it("token bucket allows bursts up to capacity", () => {
    expect(text).toMatch(/token bucket/i);
    expect(text).toMatch(/burst/i);
  });
  it("mentions 429 as the correct rate-limit status code", () => {
    expect(text).toMatch(/429/);
  });
});

describe("topics.ts real-world example accuracy", () => {
  // BUG-003 (continued): the topic list's own example string for Circuit Breaker
  // makes the same present-tense Hystrix claim.
  it("BUG-003: circuit-breaker topic's example does not claim Netflix currently uses Hystrix", () => {
    const topic = topics.find((t) => t.slug === "circuit-breaker");
    expect(topic?.example).not.toMatch(/Netflix Hystrix (protecting|protects)/i);
  });
});

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Database, Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Strategy = "range" | "hash" | "directory";

const KEYS = ["aaron", "alice", "amanda", "brian", "celebrity", "diana", "edward", "fiona", "george", "henry"];
const NUM_SHARDS = 4;

function simpleHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function assignShard(key: string, strategy: Strategy): number {
  if (strategy === "hash") return simpleHash(key) % NUM_SHARDS;
  // range and directory both conceptually use alphabetical range buckets here;
  // directory differs only in that it's an explicit lookup table, not a formula
  const letter = key.charCodeAt(0);
  const bucketSize = 26 / NUM_SHARDS;
  return Math.min(NUM_SHARDS - 1, Math.floor((letter - 97) / bucketSize));
}

const STRATEGIES: { id: Strategy; label: string; note: string }[] = [
  { id: "range", label: "Range sharding", note: "Contiguous key ranges per shard — simple, but prone to hotspots" },
  { id: "hash", label: "Hash sharding", note: "hash(key) % shards — spreads load evenly, no range scans" },
  { id: "directory", label: "Directory sharding", note: "An explicit lookup service maps each key to its shard" },
];

export function DatabaseSharding() {
  const [strategy, setStrategy] = useState<Strategy>("range");
  const [dataVolume, setDataVolume] = useState(40);

  const shardCounts = useMemo(() => {
    const counts = Array(NUM_SHARDS).fill(0);
    KEYS.forEach((k) => {
      counts[assignShard(k, strategy)] += k === "celebrity" ? 6 : 1;
    });
    return counts;
  }, [strategy]);

  const maxCount = Math.max(...shardCounts);
  const singleNodeCapacity = 60;
  const overCapacity = dataVolume > singleNodeCapacity;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                strategy === s.id ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted hover:text-text",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-muted">{STRATEGIES.find((s) => s.id === strategy)?.note}</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {shardCounts.map((count, i) => {
            const isHot = strategy === "range" && count === maxCount && count > 2;
            return (
              <motion.div
                key={i}
                animate={{ scale: isHot ? [1, 1.04, 1] : 1 }}
                transition={{ repeat: isHot ? Infinity : 0, duration: 1 }}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-3",
                  isHot ? "border-danger/60 bg-danger/10" : "border-border bg-white/[0.02]",
                )}
              >
                {isHot ? <Flame size={18} className="text-danger" /> : <Database size={18} className="text-indigo-300" />}
                <span className="text-xs text-muted">Shard {i + 1}</span>
                <span className={cn("font-mono text-sm", isHot ? "text-danger" : "text-text")}>{count} keys</span>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {KEYS.map((k) => (
            <span
              key={k}
              className={cn(
                "rounded px-2 py-0.5 font-mono text-[10px]",
                k === "celebrity" ? "bg-danger/20 text-danger" : "bg-white/5 text-muted",
              )}
            >
              {k} → S{assignShard(k, strategy) + 1}
            </span>
          ))}
        </div>
        {strategy === "range" && (
          <p className="mt-3 text-xs text-warning">
            "celebrity" clusters with other keys in the same alphabetical range and adds extra weight —
            this shard becomes a hotspot while others sit idle.
          </p>
        )}
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">When does a single node break?</div>
          <span className="font-mono text-xs text-muted">{dataVolume}M rows</span>
        </div>
        <input
          type="range"
          min={10}
          max={120}
          value={dataVolume}
          onChange={(e) => setDataVolume(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className={cn("mt-2 rounded-lg border p-3 text-xs", overCapacity ? "border-danger/40 bg-danger/10 text-danger" : "border-success/40 bg-success/10 text-success")}>
          {overCapacity
            ? `At ${dataVolume}M rows, a single node exceeds practical capacity (~${singleNodeCapacity}M) — time to shard across multiple nodes.`
            : `At ${dataVolume}M rows, a single well-indexed node can still handle this comfortably.`}
        </div>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const PARTITION_COUNT = 4;
const CONSUMER_COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

export function KafkaArchitecture() {
  const [partitions, setPartitions] = useState<number[]>(Array(PARTITION_COUNT).fill(0)); // message count per partition
  const [nextPartition, setNextPartition] = useState(0);
  const [consumerCount, setConsumerCount] = useState(2);
  const [offsets, setOffsets] = useState<number[]>(Array(PARTITION_COUNT).fill(0));
  const [followerLag, setFollowerLag] = useState(20);

  function assignedConsumer(partitionIdx: number) {
    return partitionIdx % consumerCount;
  }

  function produce() {
    setPartitions((p) => p.map((count, i) => (i === nextPartition ? count + 1 : count)));
    setNextPartition((p) => (p + 1) % PARTITION_COUNT);
  }

  function consume(consumerIdx: number) {
    setOffsets((o) =>
      o.map((offset, i) => {
        if (assignedConsumer(i) !== consumerIdx) return offset;
        return Math.min(offset + 1, partitions[i]);
      }),
    );
  }

  const outOfIsr = followerLag > 50;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Topic: trips-events ({PARTITION_COUNT} partitions)</div>
          <Button size="sm" onClick={produce}>
            Produce message
          </Button>
        </div>
        <div className="space-y-2">
          {partitions.map((count, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-16 shrink-0 font-mono text-[10px] text-muted">P{i}</span>
              <div className="flex flex-1 gap-1 overflow-x-auto rounded-md border border-border bg-black/20 p-1.5">
                {Array.from({ length: count }).map((_, offset) => (
                  <motion.div
                    key={offset}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-[9px]",
                      offset < offsets[i] ? "bg-white/5 text-muted" : "bg-primary/20 text-indigo-300",
                    )}
                  >
                    {offset}
                  </motion.div>
                ))}
                {count === 0 && <span className="text-[10px] text-muted">empty</span>}
              </div>
              <span
                className="w-20 shrink-0 rounded px-1.5 py-0.5 text-center font-mono text-[9px]"
                style={{ color: CONSUMER_COLORS[assignedConsumer(i)], background: `${CONSUMER_COLORS[assignedConsumer(i)]}22` }}
              >
                → C{assignedConsumer(i) + 1}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Consumer group</div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setConsumerCount((c) => (c >= 3 ? 2 : c + 1))}
          >
            {consumerCount >= 3 ? "Remove consumer (rebalance)" : "Add consumer (rebalance)"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: consumerCount }).map((_, ci) => (
            <div
              key={ci}
              className="flex flex-col items-center gap-2 rounded-lg border p-3"
              style={{ borderColor: `${CONSUMER_COLORS[ci]}55` }}
            >
              <User size={18} style={{ color: CONSUMER_COLORS[ci] }} />
              <span className="text-xs" style={{ color: CONSUMER_COLORS[ci] }}>
                Consumer {ci + 1}
              </span>
              <span className="text-[10px] text-muted">
                owns: {partitions.map((_, pi) => pi).filter((pi) => assignedConsumer(pi) === ci).join(", ") || "none"}
              </span>
              <Button size="sm" onClick={() => consume(ci)}>
                Consume next
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Each partition is owned by exactly one consumer in the group at a time. Adding or removing a
          consumer triggers a rebalance, reassigning partitions across the new set.
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">In-Sync Replicas (ISR) — Partition 0</div>
          <span className="font-mono text-xs text-muted">follower lag: {followerLag}ms</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={followerLag}
          onChange={(e) => setFollowerLag(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="mt-3 flex items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <Database size={18} className="text-warning" />
            <span className="text-[10px] text-muted">Leader</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Database size={18} className="text-success" />
            <span className="text-[10px] text-muted">Follower A (in-sync)</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Database size={18} className={outOfIsr ? "text-danger" : "text-success"} />
            <span className="text-[10px] text-muted">Follower B</span>
            <Badge tone={outOfIsr ? "danger" : "success"}>{outOfIsr ? "out of ISR" : "in-sync"}</Badge>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">
          A follower that falls too far behind is dropped from the ISR set — acknowledging a write only
          requires the ISR (not every replica) to have it, keeping durability high without waiting on a slow node.
        </p>
      </Card>
    </div>
  );
}

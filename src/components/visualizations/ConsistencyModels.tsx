import { useState } from "react";
import { motion } from "framer-motion";
import { Database, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type Model = "strong" | "causal" | "read-your-writes" | "eventual";

const MODELS: { id: Model; label: string; delays: number[]; note: string }[] = [
  {
    id: "strong",
    label: "Strong",
    delays: [0, 0, 0],
    note: "The write isn't acknowledged until every replica has it — every read everywhere sees the latest value immediately.",
  },
  {
    id: "read-your-writes",
    label: "Read-your-writes",
    delays: [0, 2, 3],
    note: "Your own session (pinned to replica A) always sees your write instantly. Other users on other replicas catch up over time.",
  },
  {
    id: "causal",
    label: "Causal",
    delays: [1, 2, 3],
    note: "Propagation still takes time, but causally related writes (e.g. a comment after its photo) always arrive in the correct relative order at every replica.",
  },
  {
    id: "eventual",
    label: "Eventual",
    delays: [1, 3, 4],
    note: "No ordering or timing guarantee at all — replicas converge 'eventually' given no new writes, on their own schedule.",
  },
];

const MAX_TIME = 4;

export function ConsistencyModels() {
  const [model, setModel] = useState<Model>("strong");
  const [time, setTime] = useState(0);
  const current = MODELS.find((m) => m.id === model)!;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                model === m.id ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted hover:text-text",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-muted">{current.note}</p>

        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-white/[0.02] p-3 text-xs text-muted">
          <User size={14} className="text-indigo-300" /> Client writes <span className="font-mono text-text">value = "V2"</span> at t=0
        </div>

        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <span>Time since write</span>
          <span className="font-mono text-text">t = {time}</span>
        </div>
        <input
          type="range"
          min={0}
          max={MAX_TIME}
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <div className="mt-4 grid grid-cols-3 gap-3">
          {current.delays.map((delay, i) => {
            const fresh = time >= delay;
            return (
              <motion.div
                key={i}
                animate={{ borderColor: fresh ? "rgba(34,197,94,0.6)" : "rgba(30,30,46,1)" }}
                className="flex flex-col items-center gap-2 rounded-lg border bg-white/[0.02] p-3"
              >
                <Database size={20} className={fresh ? "text-success" : "text-muted"} />
                <span className="text-[10px] text-muted">
                  Replica {String.fromCharCode(65 + i)} {i === 0 && model === "read-your-writes" && "(your session)"}
                </span>
                <Badge tone={fresh ? "success" : "warning"}>{fresh ? "V2 (fresh)" : "V1 (stale)"}</Badge>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

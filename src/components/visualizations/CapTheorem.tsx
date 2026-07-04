import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Wifi, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Vertex = "C" | "A" | "P";

const VERTEX_INFO: Record<Vertex, { title: string; description: string; systems: string }> = {
  C: {
    title: "Consistency",
    description: "Every read receives the most recent write or an error — all nodes see the same data at the same time.",
    systems: "Traditional single-node SQL, HBase, MongoDB (CP mode)",
  },
  A: {
    title: "Availability",
    description: "Every request receives a (non-error) response — without guaranteeing it contains the most recent write.",
    systems: "Cassandra, DynamoDB, CouchDB",
  },
  P: {
    title: "Partition Tolerance",
    description: "The system continues operating despite network partitions between nodes — a fact of life in any distributed system.",
    systems: "Required by any multi-node distributed database",
  },
};

const VERTEX_POS: Record<Vertex, { x: number; y: number }> = {
  C: { x: 150, y: 20 },
  A: { x: 30, y: 190 },
  P: { x: 270, y: 190 },
};

const REAL_SYSTEMS: { name: string; x: number; y: number; type: "CP" | "AP" | "CA" }[] = [
  { name: "HBase", x: 190, y: 90, type: "CP" },
  { name: "MongoDB", x: 175, y: 105, type: "CP" },
  { name: "Cassandra", x: 110, y: 105, type: "AP" },
  { name: "DynamoDB", x: 95, y: 90, type: "AP" },
  { name: "Single-node SQL", x: 150, y: 130, type: "CA" },
];

export function CapTheorem() {
  const [selected, setSelected] = useState<Vertex | null>(null);
  const [partitioned, setPartitioned] = useState(false);
  const [choice, setChoice] = useState<"C" | "A" | null>(null);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Click a vertex to explore</div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <svg viewBox="0 0 300 210" className="w-full max-w-[300px]">
            <polygon
              points={`${VERTEX_POS.C.x},${VERTEX_POS.C.y} ${VERTEX_POS.A.x},${VERTEX_POS.A.y} ${VERTEX_POS.P.x},${VERTEX_POS.P.y}`}
              fill="rgba(99,102,241,0.06)"
              stroke="var(--color-border)"
              strokeWidth={1.5}
            />
            {REAL_SYSTEMS.map((s) => (
              <g key={s.name}>
                <circle cx={s.x} cy={s.y} r={4} fill="var(--color-warning)" />
                <text x={s.x} y={s.y - 8} textAnchor="middle" className="fill-muted" fontSize={9}>
                  {s.name}
                </text>
              </g>
            ))}
            {(Object.keys(VERTEX_POS) as Vertex[]).map((v) => (
              <g
                key={v}
                onClick={() => setSelected(v)}
                className="cursor-pointer"
                transform={`translate(${VERTEX_POS[v].x}, ${VERTEX_POS[v].y})`}
              >
                <circle
                  r={18}
                  fill={selected === v ? "var(--color-primary)" : "#13131a"}
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={16}
                  fontWeight={700}
                  fill={selected === v ? "white" : "var(--color-primary)"}
                >
                  {v}
                </text>
              </g>
            ))}
          </svg>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 rounded-lg border border-border bg-white/[0.02] p-4"
              >
                <div className="text-sm font-semibold text-text">{VERTEX_INFO[selected].title}</div>
                <p className="mt-1.5 text-xs text-muted">{VERTEX_INFO[selected].description}</p>
                <p className="mt-2 text-xs text-indigo-300">{VERTEX_INFO[selected].systems}</p>
              </motion.div>
            )}
            {!selected && (
              <div className="flex-1 rounded-lg border border-dashed border-border p-4 text-xs text-muted">
                Click C, A, or P above to see what it means and which real databases prioritize it.
              </div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Simulate a network partition</div>
          <Button
            size="sm"
            variant={partitioned ? "danger" : "secondary"}
            icon={partitioned ? <WifiOff size={14} /> : <Wifi size={14} />}
            onClick={() => {
              setPartitioned((p) => !p);
              setChoice(null);
            }}
          >
            {partitioned ? "Heal partition" : "Trigger partition"}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-6 rounded-lg border border-border bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-2">
            <Database size={24} className="text-indigo-300" />
            <span className="text-xs text-muted">Node A (region 1)</span>
          </div>
          <div className="relative h-0.5 w-20">
            <div className={cn("h-full w-full", partitioned ? "bg-danger/30" : "bg-success/50")} />
            {partitioned && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-danger"
              >
                ✕
              </motion.div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Database size={24} className="text-indigo-300" />
            <span className="text-xs text-muted">Node B (region 2)</span>
          </div>
        </div>

        {partitioned && (
          <div className="mt-4 space-y-3">
            <p className="text-xs text-muted">
              A write arrives at Node B while the link is down. What should Node B do?
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setChoice("C")}>
                Reject it (choose Consistency)
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setChoice("A")}>
                Accept it (choose Availability)
              </Button>
            </div>
            <AnimatePresence mode="wait">
              {choice && (
                <motion.div
                  key={choice}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-lg border p-3 text-xs",
                    choice === "C" ? "border-primary/30 bg-primary/5 text-text" : "border-warning/30 bg-warning/5 text-text",
                  )}
                >
                  {choice === "C"
                    ? "CP choice: Node B refuses the write until it can confirm with Node A. Clients on Node B's side see errors, but data never diverges — like HBase or MongoDB in a partition."
                    : "AP choice: Node B accepts the write locally. Both sides stay available, but the two nodes now hold different data and must be reconciled later — like Cassandra or DynamoDB."}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </div>
  );
}

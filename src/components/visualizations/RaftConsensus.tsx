import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Database, Search, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Role = "follower" | "candidate" | "leader" | "down";

interface NodeSnapshot {
  role: Role;
  term: number;
  log: ("committed" | "pending")[];
}

interface Step {
  caption: string;
  nodes: NodeSnapshot[];
  votingTo?: number; // index receiving votes from others
}

const STEPS: Step[] = [
  {
    caption: "All 5 nodes start as followers in term 0 with empty logs.",
    nodes: Array.from({ length: 5 }, () => ({ role: "follower", term: 0, log: [] })),
  },
  {
    caption: "Node 1's election timeout fires. It becomes a candidate, increments its term to 1, and requests votes from every other node.",
    nodes: [
      { role: "candidate", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
    ],
    votingTo: 0,
  },
  {
    caption: "A majority (3 of 5) grant their vote since they haven't voted this term. Node 1 becomes the leader for term 1.",
    nodes: [
      { role: "leader", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
    ],
  },
  {
    caption: "A client sends 'SET x=1'. The leader appends it to its own log as uncommitted, then sends AppendEntries to all followers.",
    nodes: [
      { role: "leader", term: 1, log: ["pending"] },
      { role: "follower", term: 1, log: ["pending"] },
      { role: "follower", term: 1, log: ["pending"] },
      { role: "follower", term: 1, log: [] },
      { role: "follower", term: 1, log: [] },
    ],
  },
  {
    caption: "Once a majority of followers acknowledge the entry, the leader commits it and applies it to its state machine.",
    nodes: [
      { role: "leader", term: 1, log: ["committed"] },
      { role: "follower", term: 1, log: ["committed"] },
      { role: "follower", term: 1, log: ["committed"] },
      { role: "follower", term: 1, log: ["pending"] },
      { role: "follower", term: 1, log: [] },
    ],
  },
  {
    caption: "The leader (node 1) crashes. The remaining followers stop receiving heartbeats.",
    nodes: [
      { role: "down", term: 1, log: ["committed"] },
      { role: "follower", term: 1, log: ["committed"] },
      { role: "follower", term: 1, log: ["committed"] },
      { role: "follower", term: 1, log: ["pending"] },
      { role: "follower", term: 1, log: [] },
    ],
  },
  {
    caption: "Node 3's election timeout fires first. It becomes a candidate for term 2 and wins a new majority vote.",
    nodes: [
      { role: "down", term: 1, log: ["committed"] },
      { role: "follower", term: 2, log: ["committed"] },
      { role: "leader", term: 2, log: ["committed"] },
      { role: "follower", term: 2, log: ["pending"] },
      { role: "follower", term: 2, log: [] },
    ],
  },
];

const ANGLES = [-90, -18, 54, 126, 198];

export function RaftConsensus() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];

  return (
    <div className="space-y-4">
      <Card>
        <div className="relative mx-auto h-72 w-72">
          {step.nodes.map((node, i) => {
            const rad = (ANGLES[i] * Math.PI) / 180;
            const x = 50 + 38 * Math.cos(rad);
            const y = 50 + 38 * Math.sin(rad);
            return (
              <motion.div
                key={i}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <motion.div
                  animate={{
                    scale: node.role === "leader" ? 1.15 : 1,
                    opacity: node.role === "down" ? 0.35 : 1,
                  }}
                  className={cn(
                    "relative flex h-12 w-12 items-center justify-center rounded-full border-2",
                    node.role === "leader" && "border-warning bg-warning/10 text-warning",
                    node.role === "candidate" && "border-primary bg-primary/10 text-indigo-300",
                    node.role === "follower" && "border-success/50 bg-success/5 text-success",
                    node.role === "down" && "border-danger/50 bg-danger/5 text-danger",
                  )}
                >
                  {node.role === "leader" && <Crown size={16} />}
                  {node.role === "candidate" && <Search size={16} />}
                  {node.role === "follower" && <Database size={14} />}
                  {node.role === "down" && <XCircle size={16} />}
                </motion.div>
                <span className="text-[9px] text-muted">
                  N{i + 1} · t{node.term}
                </span>
                <div className="flex gap-0.5">
                  {node.log.map((entry, li) => (
                    <span
                      key={li}
                      className={cn(
                        "h-2 w-2 rounded-sm",
                        entry === "committed" ? "bg-success" : "bg-warning/60",
                      )}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
          {step.votingTo !== undefined &&
            step.nodes.map((_, i) => {
              if (i === step.votingTo) return null;
              const radFrom = (ANGLES[step.votingTo!] * Math.PI) / 180;
              const radTo = (ANGLES[i] * Math.PI) / 180;
              const x1 = 50 + 38 * Math.cos(radFrom);
              const y1 = 50 + 38 * Math.sin(radFrom);
              const x2 = 50 + 38 * Math.cos(radTo);
              const y2 = 50 + 38 * Math.sin(radTo);
              return (
                <svg key={i} className="pointer-events-none absolute inset-0 h-full w-full">
                  <motion.line
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    stroke="var(--color-primary)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                </svg>
              );
            })}
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary" : "w-1.5 bg-border")}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="mb-1 font-mono text-xs text-indigo-300">Step {index + 1} / {STEPS.length}</div>
            <p className="text-sm text-muted">{step.caption}</p>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Prev
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))} disabled={index === STEPS.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}

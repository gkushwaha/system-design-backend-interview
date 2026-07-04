import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Database } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

interface Node {
  id: string;
  value: number;
  role: "leader" | "follower" | "dead" | "electing";
}

export function DatabaseReplication() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: "n1", value: 0, role: "leader" },
    { id: "n2", value: 0, role: "follower" },
    { id: "n3", value: 0, role: "follower" },
  ]);
  const [leaderValue, setLeaderValue] = useState(0);
  const [lagMs, setLagMs] = useState(600);

  function write() {
    const newValue = leaderValue + 1;
    setLeaderValue(newValue);
    setNodes((prev) => prev.map((n) => (n.role === "leader" ? { ...n, value: newValue } : n)));
    setTimeout(() => {
      setNodes((prev) => prev.map((n) => (n.role === "follower" ? { ...n, value: newValue } : n)));
    }, lagMs);
  }

  function killLeader() {
    setNodes((prev) => prev.map((n) => (n.role === "leader" ? { ...n, role: "dead" } : { ...n, role: "electing" })));
    setTimeout(() => {
      setNodes((prev) => {
        const candidate = prev.find((n) => n.role === "electing");
        if (!candidate) return prev;
        return prev.map((n) =>
          n.id === candidate.id ? { ...n, role: "leader" } : n.role === "electing" ? { ...n, role: "follower" } : n,
        );
      });
    }, 1200);
  }

  function reset() {
    setNodes([
      { id: "n1", value: leaderValue, role: "leader" },
      { id: "n2", value: leaderValue, role: "follower" },
      { id: "n3", value: leaderValue, role: "follower" },
    ]);
  }

  const hasDeadLeader = nodes.some((n) => n.role === "dead");

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Replication lag</div>
          <span className="font-mono text-xs text-muted">{lagMs} ms</span>
        </div>
        <input
          type="range"
          min={0}
          max={2000}
          step={100}
          value={lagMs}
          onChange={(e) => setLagMs(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
          {nodes.map((n) => (
            <div key={n.id} className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  borderColor:
                    n.role === "dead" ? "#ef4444" : n.role === "leader" ? "#6366f1" : "#1e1e2e",
                }}
                className={cn(
                  "relative flex h-16 w-16 items-center justify-center rounded-xl border-2 bg-white/[0.02]",
                  n.role === "dead" && "opacity-30",
                )}
              >
                {n.role === "leader" && <Crown size={14} className="absolute -top-2 -right-2 text-warning" />}
                <Database size={22} className={n.role === "dead" ? "text-danger" : "text-indigo-300"} />
              </motion.div>
              <span className="font-mono text-xs text-text">value: {n.value}</span>
              <AnimatePresence mode="wait">
                {n.role === "electing" ? (
                  <motion.div key="electing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Badge tone="warning">Electing…</Badge>
                  </motion.div>
                ) : n.role === "dead" ? (
                  <Badge tone="danger">Down</Badge>
                ) : n.role === "leader" ? (
                  <Badge tone="primary">Leader</Badge>
                ) : n.value !== leaderValue ? (
                  <Badge tone="warning">Stale read</Badge>
                ) : (
                  <Badge tone="success">In sync</Badge>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={write} disabled={hasDeadLeader}>
            Write to leader
          </Button>
          <Button size="sm" variant="danger" onClick={killLeader} disabled={hasDeadLeader}>
            Kill leader
          </Button>
          {hasDeadLeader && (
            <Button size="sm" variant="secondary" onClick={reset}>
              Reset cluster
            </Button>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          At {lagMs}ms lag, a client reading from a follower right after a write can see stale data for
          up to {lagMs}ms — this is why read-your-writes often route to the leader.
        </p>
      </Card>
    </div>
  );
}

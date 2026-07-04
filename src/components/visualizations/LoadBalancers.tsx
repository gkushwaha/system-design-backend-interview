import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Server, Monitor } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Algorithm = "round-robin" | "least-connections" | "weighted" | "ip-hash";

interface ServerState {
  id: number;
  alive: boolean;
  connections: number;
  weight: number;
}

const ALGORITHMS: { id: Algorithm; label: string }[] = [
  { id: "round-robin", label: "Round Robin" },
  { id: "least-connections", label: "Least Connections" },
  { id: "weighted", label: "Weighted" },
  { id: "ip-hash", label: "IP Hash" },
];

export function LoadBalancers() {
  // Packet-flight animates `left`/`top` (not x/y transforms), which MotionConfig's
  // reducedMotion="user" doesn't auto-suppress — so it's zeroed out explicitly here.
  const prefersReducedMotion = useReducedMotion();
  const [algorithm, setAlgorithm] = useState<Algorithm>("round-robin");
  const [servers, setServers] = useState<ServerState[]>([
    { id: 1, alive: true, connections: 0, weight: 1 },
    { id: 2, alive: true, connections: 0, weight: 2 },
    { id: 3, alive: true, connections: 0, weight: 1 },
  ]);
  const [rrIndex, setRrIndex] = useState(0);
  const [packets, setPackets] = useState<{ id: number; targetIdx: number }[]>([]);
  const [nextPacketId, setNextPacketId] = useState(0);

  function toggleAlive(id: number) {
    setServers((prev) => prev.map((s) => (s.id === id ? { ...s, alive: !s.alive } : s)));
  }

  function pickTarget(): number {
    const aliveIndices = servers.map((_, i) => i).filter((i) => servers[i].alive);
    if (aliveIndices.length === 0) return -1;

    if (algorithm === "round-robin" || algorithm === "ip-hash") {
      let idx = rrIndex;
      for (let tries = 0; tries < servers.length; tries++) {
        if (servers[idx % servers.length].alive) return idx % servers.length;
        idx++;
      }
      return aliveIndices[0];
    }
    if (algorithm === "least-connections") {
      return aliveIndices.reduce((best, i) =>
        servers[i].connections < servers[best].connections ? i : best,
      );
    }
    // weighted: pick proportionally to weight among alive
    const totalWeight = aliveIndices.reduce((sum, i) => sum + servers[i].weight, 0);
    let r = Math.random() * totalWeight;
    for (const i of aliveIndices) {
      r -= servers[i].weight;
      if (r <= 0) return i;
    }
    return aliveIndices[0];
  }

  function sendRequest() {
    const targetIdx = pickTarget();
    if (targetIdx === -1) return;
    const id = nextPacketId;
    setNextPacketId((n) => n + 1);
    setPackets((p) => [...p, { id, targetIdx }]);
    setServers((prev) =>
      prev.map((s, i) => (i === targetIdx ? { ...s, connections: s.connections + 1 } : s)),
    );
    setRrIndex((i) => (i + 1) % servers.length);
    setTimeout(() => {
      setPackets((p) => p.filter((pk) => pk.id !== id));
      setServers((prev) =>
        prev.map((s, i) => (i === targetIdx ? { ...s, connections: Math.max(0, s.connections - 1) } : s)),
      );
    }, 900);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          {ALGORITHMS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAlgorithm(a.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                algorithm === a.id
                  ? "border-primary/50 bg-primary/15 text-indigo-300"
                  : "border-border text-muted hover:text-text",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="relative flex items-center justify-between gap-4 rounded-lg border border-border bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-1 text-muted">
            <Monitor size={22} />
            <span className="text-xs">Client</span>
          </div>

          <div className="relative h-40 flex-1">
            <AnimatePresence>
              {packets.map((pk) => (
                <motion.div
                  key={pk.id}
                  initial={{ left: "0%", top: "50%", opacity: 1 }}
                  animate={{
                    left: "100%",
                    top: `${(pk.targetIdx / (servers.length - 1 || 1)) * 90 + 5}%`,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.8, ease: "easeInOut" }}
                  className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_2px_rgba(99,102,241,0.6)]"
                />
              ))}
            </AnimatePresence>
            <svg className="absolute inset-0 h-full w-full">
              {servers.map((_, i) => (
                <line
                  key={i}
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2={`${(i / (servers.length - 1 || 1)) * 90 + 5}%`}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
              ))}
            </svg>
          </div>

          <div className="flex flex-col gap-3">
            {servers.map((s, i) => (
              <button
                key={s.id}
                onClick={() => toggleAlive(s.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors",
                  s.alive
                    ? "border-success/40 bg-success/10 text-success"
                    : "border-danger/40 bg-danger/10 text-danger line-through",
                )}
                title="Click to toggle server health"
              >
                <Server size={14} />
                S{i + 1} · w{s.weight} · {s.connections}c
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button size="sm" onClick={sendRequest}>
            Send request
          </Button>
          <span className="text-xs text-muted">Click a server to simulate a health-check failure</span>
        </div>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Shield, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type Scenario = "penetration" | "avalanche" | "breakdown";

const SCENARIOS: { id: Scenario; label: string; description: string }[] = [
  {
    id: "penetration",
    label: "Penetration",
    description: "Requests for a key that doesn't exist in cache OR database — every request pointlessly hits the DB.",
  },
  {
    id: "avalanche",
    label: "Avalanche",
    description: "Many cache keys expire at the same instant, sending a simultaneous flood of requests to the DB.",
  },
  {
    id: "breakdown",
    label: "Breakdown (hot key)",
    description: "One extremely popular key expires, and thousands of concurrent requests all miss at once.",
  },
];

export function CachePenetrationAvalanche() {
  const [scenario, setScenario] = useState<Scenario>("penetration");
  const [protectionOn, setProtectionOn] = useState(false);
  const [requests, setRequests] = useState<{ id: number; blocked: boolean }[]>([]);
  const [dbHits, setDbHits] = useState(0);

  function fireRequests() {
    const batch = 8;
    const newDbHits: number[] = [];
    const newReqs = Array.from({ length: batch }, (_, i) => {
      let blocked = false;
      if (protectionOn) {
        if (scenario === "penetration") blocked = true; // bloom filter rejects unknown key
        if (scenario === "avalanche") blocked = i > 0; // jittered TTL means only 1 actually misses
        if (scenario === "breakdown") blocked = i > 0; // mutex/lock means only 1 rebuilds cache
      }
      if (!blocked) newDbHits.push(i);
      return { id: Date.now() + i, blocked };
    });
    setRequests(newReqs);
    setDbHits((n) => n + newDbHits.length);
  }

  function reset() {
    setRequests([]);
    setDbHits(0);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setScenario(s.id);
                reset();
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                scenario === s.id ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted hover:text-text",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-muted">{SCENARIOS.find((s) => s.id === scenario)?.description}</p>

        <button
          onClick={() => {
            setProtectionOn((p) => !p);
            reset();
          }}
          className={cn(
            "mb-4 flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
            protectionOn ? "border-success/40 bg-success/10 text-success" : "border-border text-muted",
          )}
        >
          <Shield size={12} />
          Protection: {protectionOn ? "ON" : "OFF"}
        </button>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-1 text-muted">
            <Zap size={20} />
            <span className="text-xs">8 concurrent requests</span>
          </div>
          <div className="flex flex-1 flex-wrap justify-center gap-2">
            <AnimatePresence>
              {requests.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "h-3 w-3 rounded-full",
                    r.blocked ? "bg-success" : "bg-danger shadow-[0_0_6px_2px_rgba(239,68,68,0.5)]",
                  )}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="flex flex-col items-center gap-1 text-muted">
            <Database size={20} />
            <span className="text-xs">Database</span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <Button size="sm" onClick={fireRequests}>
            Fire request burst
          </Button>
          <Badge tone={dbHits > 4 ? "danger" : "success"}>{dbHits} DB hits so far</Badge>
        </div>
      </Card>
    </div>
  );
}

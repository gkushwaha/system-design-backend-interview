import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, HardDrive, Layers } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Pattern = "cache-aside" | "write-through" | "write-back" | "read-through";

const PATTERNS: { id: Pattern; label: string; flow: string }[] = [
  { id: "cache-aside", label: "Cache-aside", flow: "App checks cache → miss → reads DB → populates cache" },
  { id: "write-through", label: "Write-through", flow: "App writes to cache → cache writes to DB synchronously" },
  { id: "write-back", label: "Write-back", flow: "App writes to cache → DB updated asynchronously later" },
  { id: "read-through", label: "Read-through", flow: "Cache library itself loads from DB transparently on miss" },
];

export function CachingPatterns() {
  const [pattern, setPattern] = useState<Pattern>("cache-aside");
  const [hitRate, setHitRate] = useState(70);
  const [lastResult, setLastResult] = useState<"hit" | "miss" | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  function simulateRequest() {
    const isHit = Math.random() * 100 < hitRate;
    setLastResult(isHit ? "hit" : "miss");
    setPulseKey((k) => k + 1);
  }

  const chartData = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const rate = i * 10;
        return { rate, dbLoad: Math.round(100 * (1 - rate / 100)) };
      }),
    [],
  );
  const currentDbLoad = Math.round(100 * (1 - hitRate / 100));

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          {PATTERNS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPattern(p.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                pattern === p.id
                  ? "border-primary/50 bg-primary/15 text-indigo-300"
                  : "border-border text-muted hover:text-text",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <p className="mb-4 text-xs text-muted">{PATTERNS.find((p) => p.id === pattern)?.flow}</p>

        <div className="relative flex items-center justify-between gap-4 rounded-lg border border-border bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-1 text-muted">
            <Layers size={20} />
            <span className="text-xs">App</span>
          </div>
          <div className="relative h-1 flex-1 bg-border">
            <AnimatePresence>
              {lastResult && (
                <motion.div
                  key={pulseKey}
                  initial={{ left: "0%", opacity: 1 }}
                  animate={{ left: lastResult === "hit" ? "50%" : "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className={cn(
                    "absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full",
                    lastResult === "hit" ? "bg-success shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" : "bg-danger shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]",
                  )}
                />
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col items-center gap-1 text-muted">
            <HardDrive size={20} />
            <span className="text-xs">Cache</span>
          </div>
          <div className="relative h-1 flex-1 bg-border">
            <AnimatePresence>
              {lastResult === "miss" && (
                <motion.div
                  key={`db-${pulseKey}`}
                  initial={{ left: "0%", opacity: 1 }}
                  animate={{ left: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]"
                />
              )}
            </AnimatePresence>
          </div>
          <div className="flex flex-col items-center gap-1 text-muted">
            <Database size={20} />
            <span className="text-xs">DB</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button size="sm" onClick={simulateRequest}>
            Simulate request
          </Button>
          {lastResult && (
            <span className={cn("text-xs font-medium", lastResult === "hit" ? "text-success" : "text-danger")}>
              {lastResult === "hit" ? "Cache HIT — fast" : "Cache MISS — slow, hit the DB"}
            </span>
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Cache hit rate vs DB load</div>
          <span className="font-mono text-xs text-muted">{hitRate}% hit rate</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={hitRate}
          onChange={(e) => setHitRate(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={chartData}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="rate" stroke="var(--color-muted)" fontSize={11} unit="%" />
            <YAxis stroke="var(--color-muted)" fontSize={11} unit="%" />
            <Tooltip contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }} />
            <Area type="monotone" dataKey="dbLoad" stroke="#ef4444" fill="#ef444422" />
          </AreaChart>
        </ResponsiveContainer>
        <p className="mt-1 text-xs text-muted">
          At {hitRate}% hit rate, only <span className="text-danger font-mono">{currentDbLoad}%</span> of requests
          reach the database — this is how Twitter keeps 95% of timeline reads out of the DB entirely.
        </p>
      </Card>
    </div>
  );
}

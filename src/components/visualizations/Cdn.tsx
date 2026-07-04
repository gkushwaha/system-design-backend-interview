import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Server } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface City {
  name: string;
  x: number;
  y: number;
  originLatency: number;
  edgeLatency: number;
}

const ORIGIN = { name: "Origin (Virginia, US)", x: 27, y: 38 };

const CITIES: City[] = [
  { name: "New York", x: 28, y: 36, originLatency: 8, edgeLatency: 4 },
  { name: "London", x: 48, y: 30, originLatency: 90, edgeLatency: 12 },
  { name: "São Paulo", x: 34, y: 72, originLatency: 130, edgeLatency: 18 },
  { name: "Mumbai", x: 66, y: 52, originLatency: 210, edgeLatency: 22 },
  { name: "Tokyo", x: 85, y: 40, originLatency: 175, edgeLatency: 15 },
  { name: "Sydney", x: 87, y: 78, originLatency: 220, edgeLatency: 20 },
];

export function Cdn() {
  const [selected, setSelected] = useState<City | null>(null);
  const [cacheHit, setCacheHit] = useState(true);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Click a city to route a request</div>
          <button
            onClick={() => setCacheHit((h) => !h)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              cacheHit ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger",
            )}
          >
            {cacheHit ? "Cache HIT at edge" : "Cache MISS — origin pull"}
          </button>
        </div>

        <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.08),transparent_60%)]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div
            className="absolute flex flex-col items-center gap-1 text-warning"
            style={{ left: `${ORIGIN.x}%`, top: `${ORIGIN.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <Server size={16} />
            <span className="whitespace-nowrap text-[9px]">Origin</span>
          </div>

          {CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelected(c)}
              className="absolute flex flex-col items-center gap-1"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: "translate(-50%, -50%)" }}
            >
              <motion.div
                whileHover={{ scale: 1.3 }}
                className={cn(
                  "h-3 w-3 rounded-full border-2",
                  selected?.name === c.name ? "border-primary bg-primary" : "border-primary/60 bg-primary/20",
                )}
              />
              <span className="whitespace-nowrap text-[9px] text-muted">{c.name}</span>
            </button>
          ))}

          <AnimatePresence>
            {selected && (
              <motion.div
                key={selected.name + cacheHit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute h-0.5 origin-left"
                style={{
                  left: `${cacheHit ? selected.x : ORIGIN.x}%`,
                  top: `${cacheHit ? selected.y : ORIGIN.y}%`,
                  width: cacheHit ? 0 : `${Math.hypot(selected.x - ORIGIN.x, selected.y - ORIGIN.y)}%`,
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {selected ? (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium text-text">{selected.name}</div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted">To origin</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-danger" style={{ width: `${Math.min(100, selected.originLatency / 2.5)}%` }} />
              </div>
              <span className="w-12 text-right font-mono text-xs text-danger">{selected.originLatency}ms</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-xs text-muted">To nearest PoP</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-success" style={{ width: `${Math.min(100, selected.edgeLatency / 2.5)}%` }} />
              </div>
              <span className="w-12 text-right font-mono text-xs text-success">{selected.edgeLatency}ms</span>
            </div>
            <Badge tone={cacheHit ? "success" : "danger"}>
              {cacheHit ? `Served from edge in ${selected.edgeLatency}ms` : `Origin pull adds ${selected.originLatency}ms, then cached at edge`}
            </Badge>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Globe size={14} />
            Click any city marker above to compare origin vs edge latency.
          </div>
        )}

        <Button size="sm" variant="secondary" className="mt-3" onClick={() => setSelected(null)}>
          Clear
        </Button>
      </Card>
    </div>
  );
}

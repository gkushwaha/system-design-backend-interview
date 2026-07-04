import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Server, ServerCrash } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const MAX_SERVERS = 8;
const MAX_TIER = 8;
const CAPACITY_PER_SERVER = 1000;

function verticalCapacity(tier: number) {
  // diminishing returns as tier grows
  return Math.round(1000 * Math.pow(tier, 0.8));
}

function verticalCost(tier: number) {
  // cost grows faster than linear — bigger machines are disproportionately pricier
  return Math.round(40 * Math.pow(tier, 1.9));
}

const chartData = Array.from({ length: MAX_TIER }, (_, i) => {
  const n = i + 1;
  return {
    units: n,
    horizontalCost: n * 50,
    verticalCost: verticalCost(n),
  };
});

export function HorizontalVsVerticalScaling() {
  const [servers, setServers] = useState(1);
  const [tier, setTier] = useState(1);

  const horizontalCapacity = servers * CAPACITY_PER_SERVER;
  const horizontalCost = servers * 50;
  const vCapacity = verticalCapacity(tier);
  const vCost = verticalCost(tier);

  const crossoverIndex = useMemo(
    () => chartData.findIndex((d) => d.verticalCost > d.horizontalCost),
    [],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-text">Horizontal — add servers</div>
            <span className="font-mono text-xs text-muted">${horizontalCost}/mo</span>
          </div>
          <div className="flex min-h-[92px] flex-wrap items-end gap-2">
            <AnimatePresence>
              {Array.from({ length: servers }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="flex h-12 w-9 flex-col items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-indigo-300"
                >
                  <Server size={16} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setServers((s) => Math.max(1, s - 1))}
              disabled={servers <= 1}
            >
              − Remove
            </Button>
            <Button
              size="sm"
              onClick={() => setServers((s) => Math.min(MAX_SERVERS, s + 1))}
              disabled={servers >= MAX_SERVERS}
            >
              + Add server
            </Button>
          </div>
          <div className="mt-3 text-xs text-muted">
            Capacity: <span className="font-mono text-text">{horizontalCapacity.toLocaleString()} req/s</span>
          </div>
          {servers >= MAX_SERVERS && (
            <div className="mt-2 text-xs text-warning">
              Coordination overhead grows — needs a load balancer + shared state.
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-text">Vertical — scale up one server</div>
            <span className="font-mono text-xs text-muted">${vCost}/mo</span>
          </div>
          <div className="flex min-h-[92px] items-center justify-center">
            <motion.div
              animate={{ width: 32 + tier * 10, height: 32 + tier * 7 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={cn(
                "flex items-center justify-center rounded-md border text-indigo-300",
                tier >= MAX_TIER
                  ? "border-danger/60 bg-danger/10 text-danger"
                  : "border-primary/40 bg-primary/10",
              )}
            >
              {tier >= MAX_TIER ? <ServerCrash size={20} /> : <Server size={20} />}
            </motion.div>
          </div>
          <input
            type="range"
            min={1}
            max={MAX_TIER}
            value={tier}
            onChange={(e) => setTier(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 text-xs text-muted">
            Instance tier: <span className="font-mono text-text">{tier} / {MAX_TIER}</span>
          </div>
          <div className="mt-2 text-xs text-muted">
            Capacity: <span className="font-mono text-text">{vCapacity.toLocaleString()} req/s</span>
          </div>
          {tier >= MAX_TIER && (
            <div className="mt-2 text-xs text-danger">
              Hardware ceiling reached — no bigger instance exists on this cloud.
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Cost curve as capacity needs grow</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="units"
              stroke="var(--color-muted)"
              fontSize={11}
              label={{ value: "Capacity units", position: "insideBottom", offset: -4, fill: "var(--color-muted)", fontSize: 11 }}
            />
            <YAxis stroke="var(--color-muted)" fontSize={11} />
            <Tooltip
              contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            {crossoverIndex > 0 && (
              <ReferenceLine
                x={chartData[crossoverIndex].units}
                stroke="var(--color-warning)"
                strokeDasharray="4 4"
                label={{ value: "crossover", fill: "var(--color-warning)", fontSize: 10, position: "top" }}
              />
            )}
            <Line type="monotone" dataKey="horizontalCost" name="Horizontal ($)" stroke="#6366f1" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="verticalCost" name="Vertical ($)" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-muted">
          Vertical scaling is cheaper at small scale but costs explode past the crossover point —
          this is why horizontal scaling dominates at internet scale.
        </p>
      </Card>
    </div>
  );
}

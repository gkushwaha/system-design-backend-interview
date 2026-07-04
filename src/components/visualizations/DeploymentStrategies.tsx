import { useState } from "react";
import { motion } from "framer-motion";
import { Server } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Strategy = "blue-green" | "canary" | "shadow";

export function DeploymentStrategies() {
  const [strategy, setStrategy] = useState<Strategy>("blue-green");
  const [switched, setSwitched] = useState(false);
  const [canaryPct, setCanaryPct] = useState(10);

  const newTrafficPct = strategy === "blue-green" ? (switched ? 100 : 0) : strategy === "canary" ? canaryPct : 0;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["blue-green", "canary", "shadow"] as Strategy[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStrategy(s);
                setSwitched(false);
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                strategy === s ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted",
              )}
            >
              {s.replace("-", "/")}
            </button>
          ))}
        </div>

        {strategy === "blue-green" && (
          <div className="space-y-3">
            <Button size="sm" onClick={() => setSwitched((s) => !s)}>
              {switched ? "Switch back to Blue" : "Cut over to Green"}
            </Button>
            <p className="text-xs text-muted">
              100% of traffic instantly points at {switched ? "the new Green environment" : "the old Blue environment"}.
              Rollback is just flipping the router back — instant, but any bug affects all users the moment you cut over.
            </p>
          </div>
        )}

        {strategy === "canary" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Traffic to new version</span>
              <span className="font-mono text-text">{canaryPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={canaryPct}
              onChange={(e) => setCanaryPct(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted">
              Traffic ramps gradually — start at a small percentage, watch error rates and metrics, and
              increase only if the new version looks healthy. A bug only affects {canaryPct}% of users, not everyone.
            </p>
          </div>
        )}

        {strategy === "shadow" && (
          <p className="text-xs text-muted">
            100% of real traffic is served by the old version as usual — but every request is also mirrored
            to the new version in parallel. The new version's responses are discarded (never shown to users)
            and only compared/logged, so you can validate real production behavior with zero user-facing risk.
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-6 rounded-lg border border-border bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-1 text-muted">
            <Server size={20} />
            <span className="text-xs">Client traffic</span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  animate={{ width: `${100 - newTrafficPct}%` }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
              <span className="w-24 text-xs text-muted">
                Old version {strategy !== "shadow" ? `(${100 - newTrafficPct}%)` : "(100%, live)"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  animate={{ width: strategy === "shadow" ? "100%" : `${newTrafficPct}%` }}
                  className="h-full rounded-full bg-success"
                />
              </div>
              <span className="w-24 text-xs text-muted">
                New version {strategy === "shadow" ? "(mirrored, discarded)" : `(${newTrafficPct}%)`}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

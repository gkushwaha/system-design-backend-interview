import { useState } from "react";
import { motion } from "framer-motion";
import { Database, GitBranch, Layers, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export function LambdaVsKappa() {
  const [arch, setArch] = useState<"lambda" | "kappa">("lambda");
  const [replaying, setReplaying] = useState(false);

  function simulateReprocess() {
    setReplaying(true);
    setTimeout(() => setReplaying(false), 1500);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setArch("lambda")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              arch === "lambda" ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted",
            )}
          >
            Lambda architecture
          </button>
          <button
            onClick={() => setArch("kappa")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              arch === "kappa" ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted",
            )}
          >
            Kappa architecture
          </button>
        </div>

        {arch === "lambda" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-24 items-center justify-center rounded-lg border border-border bg-white/[0.02] text-xs text-muted">
                Source data
              </div>
              <span className="text-muted">→</span>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/5 px-3 py-1.5 text-xs text-warning">
                  <Database size={14} /> Batch layer (slow, fully accurate)
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs text-indigo-300">
                  <Layers size={14} /> Speed layer (fast, approximate)
                </div>
              </div>
              <span className="text-muted">→</span>
              <div className="flex h-14 w-28 items-center justify-center rounded-lg border border-success/40 bg-success/5 text-center text-xs text-success">
                Serving layer (merged view)
              </div>
            </div>
            <p className="text-xs text-muted">
              Two separate pipelines process the same data: batch for correctness (recomputed
              periodically), speed for low-latency approximate results. The serving layer merges both
              views — this dual-pipeline complexity is Lambda's defining (and most criticized) tradeoff.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-24 items-center justify-center rounded-lg border border-border bg-white/[0.02] text-xs text-muted">
                Source log
              </div>
              <span className="text-muted">→</span>
              <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs text-indigo-300">
                <GitBranch size={14} /> Single stream processing layer
              </div>
              <span className="text-muted">→</span>
              <div className="flex h-14 w-28 items-center justify-center rounded-lg border border-success/40 bg-success/5 text-center text-xs text-success">
                Serving layer
              </div>
            </div>
            <Button size="sm" onClick={simulateReprocess}>
              Simulate reprocessing with fixed logic
            </Button>
            {replaying && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs text-warning">
                <RotateCw size={14} className="animate-spin" /> Replaying the log from the beginning through the updated stream processor…
              </motion.div>
            )}
            <p className="text-xs text-muted">
              Only one pipeline exists. When logic needs to change or a bug needs fixing, Kappa
              reprocesses history by replaying the durable log through the updated stream processing
              code — no separate batch layer needed.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

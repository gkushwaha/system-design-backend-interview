import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, CheckCircle2, Circle, Database } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const CAPACITY = 10;

export function RateLimiting() {
  const [tokens, setTokens] = useState(CAPACITY);
  const [refillRate, setRefillRate] = useState(2); // tokens per second
  const [lastResult, setLastResult] = useState<"ok" | "limited" | null>(null);
  const [distributed, setDistributed] = useState(false);
  const [nodeBuckets, setNodeBuckets] = useState([5, 5, 5]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens((t) => Math.min(CAPACITY, t + refillRate * 0.5));
      setNodeBuckets((nb) => nb.map((n) => Math.min(5, n + refillRate * 0.5)));
    }, 500);
    return () => clearInterval(interval);
  }, [refillRate]);

  function sendRequest() {
    if (tokens >= 1) {
      setTokens((t) => t - 1);
      setLastResult("ok");
    } else {
      setLastResult("limited");
    }
  }

  function sendToNode(idx: number) {
    setNodeBuckets((nb) => {
      const copy = [...nb];
      if (copy[idx] >= 1) copy[idx] -= 1;
      return copy;
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Token bucket</div>
          <span className="font-mono text-xs text-muted">refill: {refillRate}/s</span>
        </div>
        <input
          type="range"
          min={0.5}
          max={5}
          step={0.5}
          value={refillRate}
          onChange={(e) => setRefillRate(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: CAPACITY }).map((_, i) => (
            <div key={i}>
              {i < Math.floor(tokens) ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : (
                <Circle size={18} className="text-border" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-1 text-center font-mono text-xs text-muted">{Math.floor(tokens)} / {CAPACITY} tokens</div>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Button size="sm" onClick={sendRequest}>
            Send request
          </Button>
          <AnimatePresence mode="wait">
            {lastResult && (
              <motion.span
                key={lastResult + Math.random()}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  lastResult === "ok" ? "text-success" : "text-danger",
                )}
              >
                {lastResult === "ok" ? <CheckCircle2 size={14} /> : <Ban size={14} />}
                {lastResult === "ok" ? "200 OK" : "429 Too Many Requests"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Distributed rate limiting</div>
          <button
            onClick={() => setDistributed((d) => !d)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              distributed ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted",
            )}
          >
            {distributed ? "Redis-backed shared bucket" : "Naive per-node buckets"}
          </button>
        </div>

        {!distributed ? (
          <>
            <div className="flex justify-around gap-3">
              {nodeBuckets.map((b, i) => (
                <button
                  key={i}
                  onClick={() => sendToNode(i)}
                  className="flex flex-col items-center gap-1 rounded-lg border border-border bg-white/[0.02] px-4 py-3"
                >
                  <span className="text-xs text-muted">Server {i + 1}</span>
                  <span className="font-mono text-sm text-text">{Math.floor(b)} tokens</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-warning">
              Each node enforces its own limit independently — a client hitting all 3 servers can get
              3x the intended global rate limit.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-white/[0.02] px-3 py-2 text-xs text-muted">
                  Server {i + 1}
                </div>
              ))}
              <span className="text-muted">→</span>
              <div className="flex flex-col items-center gap-1 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3">
                <Database size={16} className="text-indigo-300" />
                <span className="text-xs text-indigo-300">Redis: shared counter</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted">
              All servers check and decrement the same atomic counter in Redis (via INCR + TTL, or a
              Lua script), so the limit is enforced globally regardless of which server handles the request.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

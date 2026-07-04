import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type State = "closed" | "open" | "half-open";

const FAILURE_THRESHOLD = 3;
const OPEN_DURATION_MS = 3000;

export function CircuitBreaker() {
  const [state, setState] = useState<State>("closed");
  const [failureRate, setFailureRate] = useState(60);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [log, setLog] = useState<{ id: number; ok: boolean; fastFail: boolean }[]>([]);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Authoritative, synchronous copy of state — avoids stale-closure races when
  // sendRequest fires multiple times before React commits a re-render.
  const breakerRef = useRef({ state, consecutiveFailures });
  breakerRef.current.state = state;
  breakerRef.current.consecutiveFailures = consecutiveFailures;

  useEffect(() => {
    if (state === "open") {
      openTimer.current = setTimeout(() => setState("half-open"), OPEN_DURATION_MS);
    }
    return () => {
      if (openTimer.current) clearTimeout(openTimer.current);
    };
  }, [state]);

  function sendRequest() {
    const id = Date.now();
    const current = breakerRef.current;

    if (current.state === "open") {
      setLog((l) => [{ id, ok: false, fastFail: true }, ...l].slice(0, 8));
      return;
    }

    const success = Math.random() * 100 >= failureRate;
    setLog((l) => [{ id, ok: success, fastFail: false }, ...l].slice(0, 8));

    if (current.state === "half-open") {
      breakerRef.current = { state: success ? "closed" : "open", consecutiveFailures: 0 };
      setState(success ? "closed" : "open");
      setConsecutiveFailures(0);
      return;
    }

    if (success) {
      breakerRef.current.consecutiveFailures = 0;
      setConsecutiveFailures(0);
    } else {
      const next = current.consecutiveFailures + 1;
      const tripped = next >= FAILURE_THRESHOLD;
      breakerRef.current = { state: tripped ? "open" : "closed", consecutiveFailures: next };
      setConsecutiveFailures(next);
      if (tripped) setState("open");
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Downstream failure rate</div>
          <span className="font-mono text-xs text-muted">{failureRate}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={failureRate}
          onChange={(e) => setFailureRate(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <div className="mt-4 flex items-center justify-center gap-6">
          {(["closed", "open", "half-open"] as State[]).map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  scale: state === s ? 1.1 : 1,
                  boxShadow: state === s ? "0 0 0 4px rgba(99,102,241,0.25)" : "none",
                }}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full border-2 text-xs font-semibold",
                  s === "closed" && "border-success/60 text-success",
                  s === "open" && "border-danger/60 text-danger",
                  s === "half-open" && "border-warning/60 text-warning",
                  state === s ? "bg-white/[0.04]" : "bg-transparent opacity-50",
                )}
              >
                {s === "closed" ? "Closed" : s === "open" ? "Open" : "Half"}
              </motion.div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-xs text-muted">
          {state === "closed" && `Consecutive failures: ${consecutiveFailures} / ${FAILURE_THRESHOLD}`}
          {state === "open" && "Circuit OPEN — failing fast, will probe again shortly"}
          {state === "half-open" && "Circuit HALF-OPEN — next request is a probe"}
        </div>

        <div className="mt-4 flex justify-center">
          <Button size="sm" onClick={sendRequest}>
            Send request
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {log.map((entry) => (
            <span
              key={entry.id}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1 text-[10px] font-mono",
                entry.fastFail
                  ? "bg-warning/15 text-warning"
                  : entry.ok
                    ? "bg-success/15 text-success"
                    : "bg-danger/15 text-danger",
              )}
            >
              {entry.fastFail ? <AlertTriangle size={10} /> : entry.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {entry.fastFail ? "fast-fail" : entry.ok ? "ok" : "fail"}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-danger/30">
          <Badge tone="danger">Without a circuit breaker</Badge>
          <p className="mt-2 text-xs text-muted">
            Every request still waits the full timeout on a failing downstream call, exhausting thread
            pools and connection limits — one broken dependency cascades into a total outage.
          </p>
        </Card>
        <Card className="border-success/30">
          <Badge tone="success">With a circuit breaker</Badge>
          <p className="mt-2 text-xs text-muted">
            Once the failure threshold trips, requests fail instantly without waiting on the downstream
            call — freeing resources to serve a fallback response and protecting the rest of the system.
          </p>
        </Card>
      </div>
    </div>
  );
}

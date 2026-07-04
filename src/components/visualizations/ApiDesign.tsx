import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

type Method = "GET" | "POST" | "PUT" | "DELETE";
type Scenario = "exists" | "missing" | "created" | "no-auth";

const SCENARIOS: { id: Scenario; label: string; method: Method; path: string; status: number; tone: "success" | "danger" | "warning" }[] = [
  { id: "exists", label: "Fetch existing user", method: "GET", path: "/users/42", status: 200, tone: "success" },
  { id: "missing", label: "Fetch missing user", method: "GET", path: "/users/9999", status: 404, tone: "danger" },
  { id: "created", label: "Create a new user", method: "POST", path: "/users", status: 201, tone: "success" },
  { id: "no-auth", label: "Missing auth token", method: "DELETE", path: "/users/42", status: 401, tone: "warning" },
];

export function ApiDesign() {
  const [scenario, setScenario] = useState<Scenario>("exists");
  const current = SCENARIOS.find((s) => s.id === scenario)!;

  const [page, setPage] = useState(1);
  const offsetCost = page * 5000; // simulated ms cost of skipping rows, grows linearly
  const cursorCost = 8; // constant

  const [idempotencyKey] = useState("idem_8f3a21");
  const [requestsSent, setRequestsSent] = useState(0);
  const [chargesMade, setChargesMade] = useState(0);
  const [processedKeys, setProcessedKeys] = useState<Set<string>>(new Set());

  function submitPayment() {
    setRequestsSent((n) => n + 1);
    if (!processedKeys.has(idempotencyKey)) {
      setChargesMade((n) => n + 1);
      setProcessedKeys((prev) => new Set(prev).add(idempotencyKey));
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Pick a request scenario</div>
        <div className="mb-3 flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                scenario === s.id ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted hover:text-text",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-border bg-black/30 p-4 font-mono text-xs">
          <div>
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-indigo-300">{current.method}</span>{" "}
            <span className="rounded bg-success/20 px-1.5 py-0.5 text-success">{current.path}</span>{" "}
            <span className="text-muted">HTTP/1.1</span>
          </div>
          <div className="mt-1 text-muted">Authorization: <span className="text-warning">Bearer ...</span></div>
        </div>

        <motion.div
          key={current.status}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <Badge tone={current.tone}>{current.status} {current.status === 200 ? "OK" : current.status === 201 ? "Created" : current.status === 404 ? "Not Found" : "Unauthorized"}</Badge>
        </motion.div>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Offset vs cursor pagination</div>
        <input type="range" min={1} max={200} value={page} onChange={(e) => setPage(Number(e.target.value))} className="w-full accent-primary" />
        <div className="mt-1 mb-3 text-xs text-muted">Requesting page {page} (~{(page * 20).toLocaleString()} rows in)</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-32 text-xs text-muted">OFFSET {page * 20}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-danger" style={{ width: `${Math.min(100, offsetCost / 100)}%` }} />
            </div>
            <span className="w-16 text-right font-mono text-xs text-danger">{offsetCost}ms</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-32 text-xs text-muted">WHERE id &gt; cursor</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-success" style={{ width: `${cursorCost}%` }} />
            </div>
            <span className="w-16 text-right font-mono text-xs text-success">{cursorCost}ms</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted">
          OFFSET forces the database to scan and discard every skipped row — cost grows with page depth.
          Cursor pagination jumps straight to the last-seen indexed id, staying constant-time.
        </p>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Idempotency keys prevent double charges</div>
        <p className="mb-2 font-mono text-xs text-muted">Idempotency-Key: {idempotencyKey}</p>
        <Button size="sm" onClick={submitPayment}>
          Submit payment (simulate retry)
        </Button>
        <div className="mt-3 flex gap-4 text-xs">
          <Badge tone="primary">Requests sent: {requestsSent}</Badge>
          <Badge tone="success">Charges made: {chargesMade}</Badge>
        </div>
        {requestsSent > 1 && chargesMade === 1 && (
          <p className="mt-2 text-xs text-success">
            Even though the client retried {requestsSent} times, the server recognized the repeated
            idempotency key and only charged once.
          </p>
        )}
      </Card>
    </div>
  );
}

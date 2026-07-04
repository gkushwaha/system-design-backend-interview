import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const ATTEMPTS = [1, 2, 3, 4, 5, 6];
const BASE_MS = 200;
const CAP_MS = 6400;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const delayData = ATTEMPTS.map((attempt) => {
  const fixed = 1000;
  const exponential = Math.min(CAP_MS, BASE_MS * Math.pow(2, attempt - 1));
  const jittered = exponential * (0.5 + seededRandom(attempt) * 0.5);
  return { attempt: `#${attempt}`, fixed, exponential, jittered: Math.round(jittered) };
});

const CLIENT_COUNT = 30;
const BUCKETS = 10;

function buildHerdData(mode: "fixed" | "jittered") {
  const counts = Array(BUCKETS).fill(0);
  for (let c = 0; c < CLIENT_COUNT; c++) {
    const bucket = mode === "fixed" ? 3 : Math.floor(seededRandom(c * 7.13) * BUCKETS);
    counts[bucket]++;
  }
  return counts.map((count, i) => ({ time: `${i}s`, requests: count }));
}

export function RetryBackoffJitter() {
  const [mode, setMode] = useState<"fixed" | "jittered">("fixed");
  const herdData = useMemo(() => buildHerdData(mode), [mode]);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Retry delay per attempt</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={delayData}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="attempt" stroke="var(--color-muted)" fontSize={11} />
            <YAxis stroke="var(--color-muted)" fontSize={11} unit="ms" />
            <Tooltip contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="fixed" name="Fixed delay" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="exponential" name="Exponential backoff" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="jittered" name="Exponential + jitter" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-muted">
          Fixed delay hammers the failing service at a constant rate. Exponential backoff gives it
          increasing breathing room. Jitter randomizes each client's exact delay to avoid synchronized retries.
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">
            {CLIENT_COUNT} clients retry after a shared outage — thundering herd?
          </div>
          <div className="flex gap-1">
            {(["fixed", "jittered"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  mode === m ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted",
                )}
              >
                {m === "fixed" ? "Fixed delay" : "Jittered backoff"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={herdData}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="var(--color-muted)" fontSize={11} />
            <YAxis stroke="var(--color-muted)" fontSize={11} />
            <Tooltip contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }} />
            <Bar dataKey="requests" fill={mode === "fixed" ? "#ef4444" : "#22c55e"} radius={4} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-muted">
          {mode === "fixed"
            ? "With a fixed delay, every client retries at the same instant — recreating the exact spike that just took the service down."
            : "With jitter, retries spread out over the window, giving the recovering service a manageable, gradual ramp in traffic."}
        </p>
      </Card>
    </div>
  );
}

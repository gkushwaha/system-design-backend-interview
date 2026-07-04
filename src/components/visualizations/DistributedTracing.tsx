import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

interface Span {
  name: string;
  start: number;
  duration: number;
  parent: string | null;
  spanId: string;
  color: string;
}

const SPANS: Span[] = [
  { name: "API Gateway", start: 0, duration: 120, parent: null, spanId: "a1", color: "#6366f1" },
  { name: "Auth Service", start: 10, duration: 30, parent: "a1", spanId: "b2", color: "#22c55e" },
  { name: "Order Service", start: 45, duration: 60, parent: "a1", spanId: "c3", color: "#f59e0b" },
  { name: "Payment Service", start: 55, duration: 35, parent: "c3", spanId: "d4", color: "#ef4444" },
  { name: "Inventory Service", start: 95, duration: 20, parent: "c3", spanId: "e5", color: "#06b6d4" },
];

const chartData = SPANS.map((s) => ({ name: s.name, offset: s.start, duration: s.duration, color: s.color }));

export function DistributedTracing() {
  const [selected, setSelected] = useState<Span | null>(null);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-1 text-sm font-semibold text-text">Trace waterfall</div>
        <div className="mb-3 font-mono text-xs text-muted">trace_id: 7f3a9c21-e8b4-...</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical" barCategoryGap={10}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="var(--color-muted)" fontSize={11} unit="ms" />
            <YAxis type="category" dataKey="name" stroke="var(--color-muted)" fontSize={11} width={110} />
            <Tooltip contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }} />
            <Bar dataKey="offset" stackId="a" fill="transparent" />
            <Bar
              dataKey="duration"
              stackId="a"
              radius={3}
              onClick={(data) => setSelected(SPANS.find((s) => s.name === data.name) ?? null)}
              cursor="pointer"
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-xs text-muted">Click a bar to inspect that span's details.</p>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Span details</div>
        {selected ? (
          <div className="space-y-1.5 rounded-lg border border-border bg-white/[0.02] p-4 font-mono text-xs">
            <div>
              <span className="text-muted">service: </span>
              <span style={{ color: selected.color }}>{selected.name}</span>
            </div>
            <div><span className="text-muted">span_id: </span><span className="text-text">{selected.spanId}</span></div>
            <div><span className="text-muted">parent_span_id: </span><span className="text-text">{selected.parent ?? "(root)"}</span></div>
            <div><span className="text-muted">start: </span><span className="text-text">{selected.start}ms</span></div>
            <div><span className="text-muted">duration: </span><span className="text-text">{selected.duration}ms</span></div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted">
            No span selected yet
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {SPANS.map((s) => (
            <button
              key={s.spanId}
              onClick={() => setSelected(s)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                selected?.spanId === s.spanId ? "border-primary/60 bg-primary/15" : "border-border",
              )}
              style={{ color: s.color }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </Card>

      <Card className="border-primary/25 bg-primary/5">
        <p className="text-xs text-text">
          Every span shares the same <Badge tone="primary">trace_id</Badge>, letting a tool like Jaeger
          reconstruct the full request path across services. The Payment and Inventory spans both list
          Order Service as their parent — showing they were called from within that span, in parallel or sequence.
        </p>
      </Card>
    </div>
  );
}

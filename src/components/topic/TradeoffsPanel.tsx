import { Check, X, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { TradeoffData } from "@/data/topicContent/types";

export function TradeoffsPanel({ data }: { data: TradeoffData }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-success/30">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-success">
            <Check size={14} /> Pros
          </div>
          <ul className="space-y-1.5 text-sm text-muted">
            {data.pros.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-success">+</span>
                {p}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-danger/30">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger">
            <X size={14} /> Cons
          </div>
          <ul className="space-y-1.5 text-sm text-muted">
            {data.cons.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-danger">−</span>
                {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">When to use</div>
          <ul className="space-y-1.5 text-sm text-muted">
            {data.whenToUse.map((w, i) => (
              <li key={i} className="flex gap-2">
                <ArrowRight size={14} className="mt-0.5 shrink-0 text-indigo-300" />
                {w}
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">When NOT to use</div>
          <ul className="space-y-1.5 text-sm text-muted">
            {data.whenNotToUse.map((w, i) => (
              <li key={i} className="flex gap-2">
                <ArrowRight size={14} className="mt-0.5 shrink-0 text-muted" />
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Alternatives compared</div>
        <div className="space-y-2">
          {data.alternatives.map((a) => (
            <div
              key={a.name}
              className="flex items-start gap-3 rounded-lg border border-border bg-white/[0.02] p-3"
            >
              <span className="shrink-0 rounded bg-primary/15 px-2 py-0.5 font-mono text-xs text-indigo-300">
                {a.name}
              </span>
              <span className="text-sm text-muted">{a.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

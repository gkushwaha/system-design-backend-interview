import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { KeyDecision } from "@/data/problemContent/types";

export function KeyDecisionsPanel({ decisions }: { decisions: KeyDecision[] }) {
  return (
    <div className="space-y-3">
      {decisions.map((d, i) => (
        <Card key={i} className="border-primary/25">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-indigo-300" />
            <div>
              <div className="text-sm font-semibold text-text">{d.decision}</div>
              <p className="mt-1 text-xs text-muted">{d.why}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

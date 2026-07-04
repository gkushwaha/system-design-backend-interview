import { CheckCircle2, Gauge } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { RequirementsData } from "@/data/problemContent/types";

export function RequirementsPanel({ data }: { data: RequirementsData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
          <CheckCircle2 size={14} className="text-indigo-300" /> Functional requirements
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          {data.functional.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-indigo-300">•</span>
              {f}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
          <Gauge size={14} className="text-warning" /> Non-functional requirements
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          {data.nonFunctional.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-warning">•</span>
              {f}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

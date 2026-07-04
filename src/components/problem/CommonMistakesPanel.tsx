import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function CommonMistakesPanel({ mistakes }: { mistakes: string[] }) {
  return (
    <Card className="border-danger/30">
      <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger">
        <AlertTriangle size={14} /> Common mistakes candidates make
      </div>
      <ul className="space-y-1.5 text-sm text-muted">
        {mistakes.map((m, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-danger">×</span>
            {m}
          </li>
        ))}
      </ul>
    </Card>
  );
}

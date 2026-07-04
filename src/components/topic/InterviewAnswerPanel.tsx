import { AlertTriangle, MessageCircleQuestion, Quote, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { InterviewAnswerData } from "@/data/topicContent/types";

export function InterviewAnswerPanel({ data }: { data: InterviewAnswerData }) {
  return (
    <div className="space-y-5">
      <Card className="border-primary/30 bg-primary/5">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-indigo-300">
          <Quote size={14} /> What to say
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-text">{data.script}</p>
      </Card>

      <Card className="border-danger/30">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger">
          <AlertTriangle size={14} /> Common mistakes
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          {data.mistakes.map((m, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-danger">×</span>
              {m}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
          <MessageCircleQuestion size={14} /> Follow-up questions to expect
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          {data.followUps.map((f, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-indigo-300">?</span>
              {f}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-warning/30">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-warning">
          <ShieldAlert size={14} /> Red flags to avoid
        </div>
        <ul className="space-y-1.5 text-sm text-muted">
          {data.redFlags.map((r, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-warning">!</span>
              {r}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

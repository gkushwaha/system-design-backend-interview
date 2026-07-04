import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

interface Answers {
  consistency: boolean;
  complexQueries: boolean;
  massiveScale: boolean;
  flexibleSchema: boolean;
}

function recommend(a: Answers): { db: string; reason: string } {
  let sqlScore = 0;
  let nosqlScore = 0;
  if (a.consistency) sqlScore += 2;
  else nosqlScore += 1;
  if (a.complexQueries) sqlScore += 2;
  else nosqlScore += 1;
  if (a.massiveScale) nosqlScore += 2;
  else sqlScore += 1;
  if (a.flexibleSchema) nosqlScore += 2;
  else sqlScore += 1;

  if (sqlScore >= nosqlScore + 1) {
    return { db: "SQL (PostgreSQL / MySQL)", reason: "Strong consistency and complex joins matter more here than raw horizontal scale." };
  }
  if (nosqlScore >= sqlScore + 1) {
    return { db: "NoSQL (Cassandra / MongoDB)", reason: "Scale and schema flexibility outweigh the need for joins or strict ACID guarantees." };
  }
  return { db: "Either — depends on team experience", reason: "Requirements are balanced; pick based on existing team expertise and operational maturity." };
}

const QUESTIONS: { key: keyof Answers; label: string }[] = [
  { key: "consistency", label: "Do you need strong ACID consistency (e.g. financial transactions)?" },
  { key: "complexQueries", label: "Will you run complex multi-table joins and ad-hoc queries?" },
  { key: "massiveScale", label: "Do you expect massive write throughput across many nodes?" },
  { key: "flexibleSchema", label: "Does your data shape change frequently / is it semi-structured?" },
];

export function SqlVsNoSql() {
  const [answers, setAnswers] = useState<Answers>({
    consistency: true,
    complexQueries: true,
    massiveScale: false,
    flexibleSchema: false,
  });

  const result = useMemo(() => recommend(answers), [answers]);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Answer a few questions</div>
        <div className="space-y-2">
          {QUESTIONS.map((q) => (
            <div
              key={q.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-white/[0.02] px-3 py-2.5"
            >
              <span className="text-xs text-muted">{q.label}</span>
              <div className="flex shrink-0 gap-1">
                {(["Yes", "No"] as const).map((opt) => {
                  const active = answers[q.key] === (opt === "Yes");
                  return (
                    <button
                      key={opt}
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.key]: opt === "Yes" }))}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                        active ? "bg-primary text-white" : "bg-white/5 text-muted hover:text-text",
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={result.db}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-primary/40 bg-primary/10 p-4"
          >
            <div className="flex items-center gap-2">
              <Badge tone="primary">Recommended</Badge>
              <span className="text-sm font-semibold text-text">{result.db}</span>
            </div>
            <p className="mt-1.5 text-xs text-muted">{result.reason}</p>
          </motion.div>
        </AnimatePresence>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">SQL — rigid schema, rows</div>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-white/[0.03] text-muted">
                  <th className="px-2 py-1.5 font-mono">id</th>
                  <th className="px-2 py-1.5 font-mono">name</th>
                  <th className="px-2 py-1.5 font-mono">email</th>
                  <th className="px-2 py-1.5 font-mono">plan_id</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border text-text">
                  <td className="px-2 py-1.5 font-mono">1</td>
                  <td className="px-2 py-1.5 font-mono">Ada</td>
                  <td className="px-2 py-1.5 font-mono">ada@x.com</td>
                  <td className="px-2 py-1.5 font-mono">2</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">Joins to a separate `plans` table via `plan_id`.</p>
        </Card>
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">NoSQL — flexible document</div>
          <pre className="overflow-x-auto rounded-md border border-border bg-black/40 p-3 font-mono text-xs text-text">
{`{
  "id": "1",
  "name": "Ada",
  "email": "ada@x.com",
  "plan": { "tier": "pro", "seats": 5 },
  "tags": ["beta-user"]
}`}
          </pre>
          <p className="mt-2 text-xs text-muted">Everything nested in one document — no join needed.</p>
        </Card>
      </div>
    </div>
  );
}

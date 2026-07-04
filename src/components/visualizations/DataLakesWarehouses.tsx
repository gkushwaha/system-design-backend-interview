import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Kind = "warehouse" | "lake" | "lakehouse";

const DATA: Record<Kind, { label: string; era: string; schema: string; formats: string; acid: boolean; querySpeed: string; cost: string; bestFor: string }> = {
  warehouse: {
    label: "Data Warehouse",
    era: "1980s",
    schema: "Schema-on-write (structured before loading)",
    formats: "Structured only (tables)",
    acid: true,
    querySpeed: "Fast, optimized for SQL analytics",
    cost: "Higher storage cost",
    bestFor: "BI dashboards, structured reporting",
  },
  lake: {
    label: "Data Lake",
    era: "2010s",
    schema: "Schema-on-read (structure applied at query time)",
    formats: "Any format — structured, semi-structured, raw",
    acid: false,
    querySpeed: "Slower, less optimized without extra tooling",
    cost: "Very cheap object storage",
    bestFor: "Raw data hoarding, ML training data, flexibility",
  },
  lakehouse: {
    label: "Lakehouse",
    era: "2020s",
    schema: "Schema enforced via a table format (Delta, Iceberg) on top of lake storage",
    formats: "Any format, with structured table layer on top",
    acid: true,
    querySpeed: "Fast, with lake-level flexibility",
    cost: "Cheap object storage + metadata layer",
    bestFor: "Unifying BI and ML workloads on one copy of data",
  },
};

export function DataLakesWarehouses() {
  const [selected, setSelected] = useState<Kind>("lakehouse");
  const current = DATA[selected];

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-4 flex items-center justify-center gap-6">
          {(Object.keys(DATA) as Kind[]).map((k) => (
            <button
              key={k}
              onClick={() => setSelected(k)}
              className="flex flex-col items-center gap-1"
            >
              <motion.div
                animate={{ scale: selected === k ? 1.1 : 1 }}
                className={cn(
                  "flex h-14 w-24 items-center justify-center rounded-lg border-2 text-center text-xs font-medium",
                  selected === k ? "border-primary bg-primary/10 text-indigo-300" : "border-border text-muted",
                )}
              >
                {DATA[k].label}
              </motion.div>
              <span className="text-[10px] text-muted">{DATA[k].era}</span>
            </button>
          ))}
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-white/[0.02] p-4">
          <Row label="Schema approach" value={current.schema} />
          <Row label="Format flexibility" value={current.formats} />
          <Row label="ACID transactions" value={current.acid} boolean />
          <Row label="Query speed" value={current.querySpeed} />
          <Row label="Storage cost" value={current.cost} />
          <Row label="Best for" value={current.bestFor} />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, boolean }: { label: string; value: string | boolean; boolean?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-1.5 text-xs last:border-0">
      <span className="w-32 shrink-0 text-muted">{label}</span>
      {boolean ? (
        value ? (
          <span className="flex items-center gap-1 text-success">
            <Check size={12} /> Yes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-danger">
            <X size={12} /> No
          </span>
        )
      ) : (
        <span className="text-right text-text">{value}</span>
      )}
    </div>
  );
}

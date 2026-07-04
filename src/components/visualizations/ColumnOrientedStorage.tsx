import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const COLUMNS = ["id", "name", "age", "city"];
const ROWS = [
  [1, "Ada", 34, "SF"],
  [2, "Grace", 41, "NYC"],
  [3, "Alan", 29, "London"],
  [4, "Linus", 52, "Helsinki"],
];

export function ColumnOrientedStorage() {
  const [layout, setLayout] = useState<"row" | "column">("row");
  const [queried, setQueried] = useState(false);

  function runQuery() {
    setQueried(true);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setLayout("row");
              setQueried(false);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              layout === "row" ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted",
            )}
          >
            Row store
          </button>
          <button
            onClick={() => {
              setLayout("column");
              setQueried(false);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              layout === "column" ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted",
            )}
          >
            Column store
          </button>
        </div>

        <div className="mb-4 text-xs text-muted">
          Physical disk layout for {ROWS.length} rows × {COLUMNS.length} columns:
        </div>

        {layout === "row" ? (
          <div className="space-y-2">
            {ROWS.map((row, ri) => {
              const isRelevant = queried;
              return (
                <div key={ri} className="flex gap-1">
                  {row.map((cell, ci) => (
                    <motion.div
                      key={ci}
                      animate={{
                        backgroundColor: isRelevant ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.03)",
                      }}
                      className="flex h-8 flex-1 items-center justify-center rounded font-mono text-[10px] text-text"
                    >
                      {cell}
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex gap-2">
            {COLUMNS.map((col, ci) => {
              const isRelevant = queried && col === "age";
              return (
                <div key={col} className="flex-1 space-y-1">
                  <div className="text-center text-[9px] text-muted">{col}</div>
                  {ROWS.map((row, ri) => (
                    <motion.div
                      key={ri}
                      animate={{
                        backgroundColor: isRelevant ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.03)",
                      }}
                      className="flex h-8 items-center justify-center rounded font-mono text-[10px] text-text"
                    >
                      {row[ci]}
                    </motion.div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" onClick={runQuery}>
            Run query: AVG(age)
          </Button>
          {queried && (
            <Badge tone={layout === "row" ? "danger" : "success"}>
              {layout === "row"
                ? `Read all ${ROWS.length * COLUMNS.length} cells (every column, every row)`
                : `Read only ${ROWS.length} cells (just the age column)`}
            </Badge>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          A row store must read every column of every row to extract just the ages. A column store
          reads only the age column's blocks — a huge I/O win for analytical aggregate queries.
        </p>
      </Card>
    </div>
  );
}

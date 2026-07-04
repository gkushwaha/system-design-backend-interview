import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ROW_OPTIONS = [100, 1_000, 10_000, 100_000, 1_000_000, 10_000_000];

function scanTimeMs(rows: number) {
  return rows * 0.005; // linear scan
}
function indexTimeMs(rows: number) {
  return Math.log2(Math.max(rows, 2)) * 0.02; // B-tree ~ log(n)
}

const chartData = ROW_OPTIONS.map((rows) => ({
  rows,
  label: rows >= 1_000_000 ? `${rows / 1_000_000}M` : rows >= 1000 ? `${rows / 1000}K` : `${rows}`,
  scan: Number(scanTimeMs(rows).toFixed(2)),
  index: Number(indexTimeMs(rows).toFixed(3)),
}));

export function DatabaseIndexing() {
  const [rowIdx, setRowIdx] = useState(3);
  const [playKey, setPlayKey] = useState(0);
  const rows = ROW_OPTIONS[rowIdx];
  const scanMs = scanTimeMs(rows);
  const idxMs = indexTimeMs(rows);
  const speedup = Math.round(scanMs / idxMs);

  const scanCells = 40;
  const treeDepth = Math.max(1, Math.ceil(Math.log2(rows) / 2));

  const cells = useMemo(() => Array.from({ length: scanCells }), []);

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Table size</div>
          <span className="font-mono text-xs text-muted">{rows.toLocaleString()} rows</span>
        </div>
        <input
          type="range"
          min={0}
          max={ROW_OPTIONS.length - 1}
          value={rowIdx}
          onChange={(e) => setRowIdx(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <Button size="sm" className="mt-3" onClick={() => setPlayKey((k) => k + 1)}>
          Run query: WHERE email = ?
        </Button>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">Without index — full table scan</div>
          <div className="grid grid-cols-10 gap-1">
            {cells.map((_, i) => (
              <motion.div
                key={`${playKey}-${i}`}
                initial={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                animate={{ backgroundColor: ["rgba(239,68,68,0.6)", "rgba(255,255,255,0.04)"] }}
                transition={{ delay: i * 0.02, duration: 0.4 }}
                className="h-4 rounded-sm"
              />
            ))}
          </div>
          <div className="mt-2 font-mono text-xs text-danger">~{scanMs.toFixed(1)} ms (checks every row)</div>
        </Card>

        <Card>
          <div className="mb-2 text-sm font-semibold text-text">With index — B-tree walk</div>
          <div className="flex flex-col items-center gap-3 py-2">
            {Array.from({ length: Math.min(treeDepth, 4) }).map((_, level) => (
              <motion.div
                key={`${playKey}-lvl-${level}`}
                initial={{ opacity: 0.2, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: level * 0.3, duration: 0.3 }}
                className="flex h-7 w-16 items-center justify-center rounded-md border border-success/50 bg-success/10 font-mono text-[10px] text-success"
              >
                node {level + 1}
              </motion.div>
            ))}
          </div>
          <div className="mt-2 font-mono text-xs text-success">~{idxMs.toFixed(3)} ms ({Math.min(treeDepth, 4)} node hops)</div>
        </Card>
      </div>

      <Card className="border-primary/30 bg-primary/5 text-center">
        <span className="text-sm text-text">
          Index is <strong className="font-mono text-indigo-300">{speedup.toLocaleString()}x</strong> faster at this table size
        </span>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Query time as the table grows</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="var(--color-muted)" fontSize={11} />
            <YAxis stroke="var(--color-muted)" fontSize={11} scale="log" domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }} />
            <Line type="monotone" dataKey="scan" name="Full scan (ms)" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="index" name="Indexed (ms)" stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-3 space-y-1 text-xs text-muted">
          <p><strong className="text-text">Covering index:</strong> includes every column the query needs, so the DB never touches the table itself.</p>
          <p><strong className="text-text">Composite index:</strong> indexes multiple columns together, e.g. (last_name, first_name) — only helps if queries filter by the leftmost column(s).</p>
        </div>
      </Card>
    </div>
  );
}

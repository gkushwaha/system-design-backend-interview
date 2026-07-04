import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const PAGE_COUNT = 20;

export function BtreeVsLsm() {
  const [randomWrites, setRandomWrites] = useState(0);
  const [hotPages, setHotPages] = useState<number[]>([]);

  const [memtable, setMemtable] = useState(0);
  const [level0, setLevel0] = useState<number[]>([]);
  const [level1, setLevel1] = useState(0);
  const [compacting, setCompacting] = useState(false);

  function writeBtree() {
    const page = Math.floor(Math.random() * PAGE_COUNT);
    setHotPages((h) => [...h, page].slice(-6));
    setRandomWrites((n) => n + 1);
  }

  function writeLsm() {
    setMemtable((m) => {
      const next = m + 1;
      if (next >= 4) {
        setLevel0((l0) => {
          const newL0 = [...l0, 1];
          if (newL0.length >= 3) {
            setCompacting(true);
            setTimeout(() => {
              setLevel1((l1) => l1 + 1);
              setLevel0([]);
              setCompacting(false);
            }, 700);
            return newL0;
          }
          return newL0;
        });
        return 0;
      }
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-text">B-tree — in-place writes</div>
            <Badge tone="danger">{randomWrites} random I/Os</Badge>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: PAGE_COUNT }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: hotPages.includes(i) ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.03)",
                }}
                transition={{ duration: 0.5 }}
                className="h-6 rounded-sm border border-border"
              />
            ))}
          </div>
          <Button size="sm" className="mt-3" onClick={writeBtree}>
            Write a row
          </Button>
          <p className="mt-2 text-xs text-muted">
            Each write updates a page wherever the key sorts to — scattered, random disk I/O.
          </p>
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-text">LSM-tree — sequential writes</div>
            {compacting && <Badge tone="warning">Compacting…</Badge>}
          </div>
          <div className="space-y-2">
            <div>
              <div className="mb-1 text-[10px] text-muted">Memtable (in-memory)</div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(memtable / 4) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[10px] text-muted">Level 0 (flushed SSTables)</div>
              <div className="flex gap-1">
                <AnimatePresence>
                  {level0.map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-7 w-9 items-center justify-center rounded bg-success/20 text-success"
                    >
                      <Layers size={12} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            <div>
              <div className="mb-1 text-[10px] text-muted">Level 1 (compacted)</div>
              <div className="flex gap-1">
                {Array.from({ length: level1 }).map((_, i) => (
                  <div key={i} className="flex h-7 w-9 items-center justify-center rounded bg-warning/20 text-warning">
                    <Layers size={12} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button size="sm" className="mt-3" onClick={writeLsm}>
            Write a row
          </Button>
          <p className="mt-2 text-xs text-muted">
            Writes append to an in-memory memtable, flushed sequentially to disk, then merged
            (compacted) into higher levels in the background.
          </p>
        </Card>
      </div>
    </div>
  );
}

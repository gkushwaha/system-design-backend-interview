import { useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const BIT_SIZE = 24;

const ITEMS: { name: string; bits: number[] }[] = [
  { name: "apple", bits: [1, 5, 14] },
  { name: "banana", bits: [3, 9, 14] },
  { name: "cherry", bits: [7, 12, 20] },
  { name: "date (never added)", bits: [5, 9, 12] },
  { name: "elderberry (never added)", bits: [2, 10, 22] },
];

export function BloomFilter() {
  const [bits, setBits] = useState<boolean[]>(Array(BIT_SIZE).fill(false));
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [checkResult, setCheckResult] = useState<{ name: string; verdict: "maybe" | "no"; falsePositive: boolean } | null>(null);

  function addItem(item: (typeof ITEMS)[number]) {
    setBits((prev) => {
      const next = [...prev];
      item.bits.forEach((b) => (next[b] = true));
      return next;
    });
    setAdded((prev) => new Set(prev).add(item.name));
  }

  function checkItem(item: (typeof ITEMS)[number]) {
    const allSet = item.bits.every((b) => bits[b]);
    setCheckResult({
      name: item.name,
      verdict: allSet ? "maybe" : "no",
      falsePositive: allSet && !added.has(item.name),
    });
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Bit array ({BIT_SIZE} bits, 3 hash functions per item)</div>
        <div className="grid grid-cols-8 gap-1.5">
          {bits.map((set, i) => (
            <motion.div
              key={i}
              animate={{ backgroundColor: set ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.04)" }}
              className="flex h-7 items-center justify-center rounded font-mono text-[9px] text-text"
            >
              {i}
            </motion.div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Items</div>
        <div className="space-y-2">
          {ITEMS.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-white/[0.02] px-3 py-2">
              <span className={cn("font-mono text-xs", added.has(item.name) ? "text-success" : "text-muted")}>
                {item.name}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => addItem(item)} disabled={added.has(item.name)}>
                  Add
                </Button>
                <Button size="sm" onClick={() => checkItem(item)}>
                  Check
                </Button>
              </div>
            </div>
          ))}
        </div>

        {checkResult && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 flex items-center gap-2 rounded-lg border p-3 text-xs",
              checkResult.verdict === "no" ? "border-success/30 bg-success/5 text-success" : "border-warning/30 bg-warning/5 text-warning",
            )}
          >
            {checkResult.verdict === "no" ? <X size={14} /> : <HelpCircle size={14} />}
            <span>
              "{checkResult.name}" is{" "}
              {checkResult.verdict === "no" ? "definitely NOT in the set" : "MAYBE in the set (all bits happen to be set)"}
              {checkResult.falsePositive && (
                <Badge tone="danger" className="ml-2">
                  false positive!
                </Badge>
              )}
            </span>
          </motion.div>
        )}
        <p className="mt-3 text-xs text-muted">
          A Bloom filter never has false negatives — if it says "not in the set," that's certain. But it
          can have false positives, as shown above when an item's bits happen to already be set by others.
        </p>
      </Card>
    </div>
  );
}

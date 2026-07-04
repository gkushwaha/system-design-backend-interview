import { useState } from "react";
import { motion } from "framer-motion";
import { Merge, WifiOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Vector {
  a: number;
  b: number;
}

export function Crdts() {
  const [replicaA, setReplicaA] = useState<Vector>({ a: 0, b: 0 });
  const [replicaB, setReplicaB] = useState<Vector>({ a: 0, b: 0 });
  const [partitioned, setPartitioned] = useState(true);
  const [merged, setMerged] = useState(false);

  function incrementA() {
    setReplicaA((v) => ({ ...v, a: v.a + 1 }));
    setMerged(false);
  }
  function incrementB() {
    setReplicaB((v) => ({ ...v, b: v.b + 1 }));
    setMerged(false);
  }

  function merge() {
    const mergedVec = { a: Math.max(replicaA.a, replicaB.a), b: Math.max(replicaA.b, replicaB.b) };
    setReplicaA(mergedVec);
    setReplicaB(mergedVec);
    setPartitioned(false);
    setMerged(true);
  }

  function reset() {
    setReplicaA({ a: 0, b: 0 });
    setReplicaB({ a: 0, b: 0 });
    setPartitioned(true);
    setMerged(false);
  }

  const total = (v: Vector) => v.a + v.b;

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Grow-only counter (G-Counter) CRDT — two offline replicas</div>
          {partitioned && (
            <Badge tone="warning">
              <WifiOff size={10} /> partitioned
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-white/[0.02] p-4">
            <div className="mb-2 text-xs font-semibold text-indigo-300">Replica A</div>
            <div className="font-mono text-xs text-muted">vector: {"{"} a: {replicaA.a}, b: {replicaA.b} {"}"}</div>
            <motion.div key={total(replicaA)} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="mt-2 text-2xl font-bold text-text">
              {total(replicaA)}
            </motion.div>
            <Button size="sm" className="mt-2" onClick={incrementA}>
              +1 like (local)
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-white/[0.02] p-4">
            <div className="mb-2 text-xs font-semibold text-success">Replica B</div>
            <div className="font-mono text-xs text-muted">vector: {"{"} a: {replicaB.a}, b: {replicaB.b} {"}"}</div>
            <motion.div key={total(replicaB)} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="mt-2 text-2xl font-bold text-text">
              {total(replicaB)}
            </motion.div>
            <Button size="sm" className="mt-2" onClick={incrementB}>
              +1 like (local)
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" variant="secondary" icon={<Merge size={14} />} onClick={merge}>
            Sync / merge replicas
          </Button>
          <Button size="sm" variant="secondary" onClick={reset}>
            Reset
          </Button>
          {merged && <Badge tone="success">Converged — both replicas agree, no conflict resolution needed</Badge>}
        </div>
        <p className="mt-3 text-xs text-muted">
          Each replica only ever increments its own slot in the vector. Merging takes the element-wise
          maximum — since neither replica ever decreases a slot, this merge is always safe, commutative,
          and idempotent, no matter how many times or in what order it happens.
        </p>
      </Card>
    </div>
  );
}

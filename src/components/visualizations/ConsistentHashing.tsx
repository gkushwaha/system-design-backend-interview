import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const NUM_KEYS = 16;
const RADIUS = 100;
const CENTER = 120;
const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];

function angleToPoint(angle: number, r = RADIUS) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

const keyAngles = Array.from({ length: NUM_KEYS }, (_, i) => (360 / NUM_KEYS) * i);

export function ConsistentHashing() {
  const [nodeAngles, setNodeAngles] = useState<number[]>([20, 110, 200, 300]);
  const [naiveMode, setNaiveMode] = useState(false);
  const [prevAssignment, setPrevAssignment] = useState<number[] | null>(null);

  const consistentAssignment = useMemo(() => {
    const sorted = [...nodeAngles].sort((a, b) => a - b);
    return keyAngles.map((ka) => {
      const target = sorted.find((na) => na >= ka) ?? sorted[0];
      return nodeAngles.indexOf(target);
    });
  }, [nodeAngles]);

  const naiveAssignment = useMemo(
    () => keyAngles.map((_, i) => i % nodeAngles.length),
    [nodeAngles.length],
  );

  const assignment = naiveMode ? naiveAssignment : consistentAssignment;

  const movedCount = prevAssignment
    ? assignment.filter((a, i) => prevAssignment[i] !== undefined && a !== prevAssignment[i]).length
    : 0;

  function addNode() {
    setPrevAssignment(assignment);
    const newAngle = Math.floor(Math.random() * 360);
    setNodeAngles((prev) => [...prev, newAngle]);
  }

  function removeNode() {
    if (nodeAngles.length <= 1) return;
    setPrevAssignment(assignment);
    setNodeAngles((prev) => prev.slice(0, -1));
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Hash ring</div>
          <button
            onClick={() => {
              setNaiveMode((m) => !m);
              setPrevAssignment(null);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              naiveMode ? "border-danger/40 bg-danger/10 text-danger" : "border-success/40 bg-success/10 text-success",
            )}
          >
            {naiveMode ? "Naive modulo hashing" : "Consistent hashing"}
          </button>
        </div>

        <div className="flex justify-center">
          <svg width={240} height={240} viewBox="0 0 240 240">
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth={1.5} />
            {keyAngles.map((ka, i) => {
              const p = angleToPoint(ka);
              const nodeIdx = assignment[i];
              const moved = prevAssignment ? prevAssignment[i] !== nodeIdx : false;
              return (
                <motion.circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={moved ? 5 : 3.5}
                  fill={COLORS[nodeIdx % COLORS.length]}
                  animate={moved ? { r: [3.5, 6, 3.5] } : {}}
                  transition={{ duration: 0.6 }}
                />
              );
            })}
            {nodeAngles.map((na, i) => {
              const p = angleToPoint(na);
              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r={9} fill="#13131a" stroke={COLORS[i % COLORS.length]} strokeWidth={2.5} />
                  <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize={8} fill={COLORS[i % COLORS.length]} fontWeight={700}>
                    N{i + 1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <Button size="sm" onClick={addNode}>
            + Add node
          </Button>
          <Button size="sm" variant="secondary" onClick={removeNode} disabled={nodeAngles.length <= 1}>
            − Remove node
          </Button>
        </div>

        {prevAssignment && (
          <div className="mt-3 flex justify-center">
            <Badge tone={naiveMode ? "danger" : "success"}>
              {movedCount} / {NUM_KEYS} keys remapped
            </Badge>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-muted">
          {naiveMode
            ? "Naive key % N hashing reshuffles almost every key when N changes — a cache stampede."
            : "Consistent hashing only remaps keys between the changed node and its neighbor — roughly 1/N of all keys."}
        </p>
      </Card>
    </div>
  );
}

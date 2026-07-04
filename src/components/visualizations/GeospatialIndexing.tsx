import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const QUAD_BITS = ["00", "01", "10", "11"];
const MAX_DEPTH = 5;

const POINTS = [
  { name: "Driver A", x: 0.22, y: 0.18 },
  { name: "Driver B", x: 0.3, y: 0.28 },
  { name: "Driver C", x: 0.78, y: 0.65 },
  { name: "Driver D", x: 0.85, y: 0.72 },
  { name: "Driver E", x: 0.55, y: 0.5 },
];

export function GeospatialIndexing() {
  const [path, setPath] = useState<number[]>([]);

  const bounds = useMemo(() => {
    let x0 = 0, y0 = 0, x1 = 1, y1 = 1;
    for (const quad of path) {
      const midX = (x0 + x1) / 2;
      const midY = (y0 + y1) / 2;
      const isRight = quad === 1 || quad === 3;
      const isBottom = quad === 2 || quad === 3;
      x0 = isRight ? midX : x0;
      x1 = isRight ? x1 : midX;
      y0 = isBottom ? midY : y0;
      y1 = isBottom ? y1 : midY;
    }
    return { x0, y0, x1, y1 };
  }, [path]);

  const geohash = path.map((q) => QUAD_BITS[q]).join("");

  const visiblePoints = POINTS.filter(
    (p) => p.x >= bounds.x0 && p.x <= bounds.x1 && p.y >= bounds.y0 && p.y <= bounds.y1,
  );

  function drillInto(quadIndex: number) {
    if (path.length >= MAX_DEPTH) return;
    setPath((p) => [...p, quadIndex]);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Click a quadrant to zoom in</div>
          <Button size="sm" variant="secondary" onClick={() => setPath((p) => p.slice(0, -1))} disabled={path.length === 0}>
            Zoom out
          </Button>
        </div>

        <div className="relative mx-auto grid aspect-square w-full max-w-sm grid-cols-2 grid-rows-2 gap-1 rounded-lg border border-border bg-black/20 p-1">
          {[0, 1, 2, 3].map((quad) => {
            const isRight = quad === 1 || quad === 3;
            const isBottom = quad === 2 || quad === 3;
            const qx0 = bounds.x0 + (isRight ? (bounds.x1 - bounds.x0) / 2 : 0);
            const qx1 = qx0 + (bounds.x1 - bounds.x0) / 2;
            const qy0 = bounds.y0 + (isBottom ? (bounds.y1 - bounds.y0) / 2 : 0);
            const qy1 = qy0 + (bounds.y1 - bounds.y0) / 2;
            const pointsHere = POINTS.filter((p) => p.x >= qx0 && p.x <= qx1 && p.y >= qy0 && p.y <= qy1);
            return (
              <button
                key={quad}
                onClick={() => drillInto(quad)}
                className="relative flex items-center justify-center rounded bg-primary/5 font-mono text-[10px] text-muted transition-colors hover:bg-primary/15 hover:text-indigo-300"
              >
                {QUAD_BITS[quad]}
                {pointsHere.map((p) => (
                  <motion.div
                    key={p.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute"
                    style={{
                      left: `${((p.x - qx0) / (qx1 - qx0)) * 100}%`,
                      top: `${((p.y - qy0) / (qy1 - qy0)) * 100}%`,
                    }}
                  >
                    <MapPin size={14} className="-translate-x-1/2 -translate-y-1/2 text-warning" />
                  </motion.div>
                ))}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs text-muted">
            Geohash prefix: <span className="text-indigo-300">{geohash || "(root)"}</span>
          </span>
          <Badge tone="primary">{visiblePoints.length} points in view</Badge>
        </div>
        <p className="mt-2 text-xs text-muted">
          Every zoom appends 2 bits to the geohash. Points sharing a longer common prefix are close
          together — a 'find nearby drivers' query becomes a cheap prefix match instead of scanning every point.
        </p>
      </Card>
    </div>
  );
}

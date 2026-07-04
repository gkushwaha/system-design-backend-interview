import { motion, useReducedMotion } from "framer-motion";
import { Database, HardDrive, Layers, Server, User, Zap, Globe } from "lucide-react";
import type { DiagramEdge, DiagramNode } from "@/data/problemContent/types";

const ICONS: Record<NonNullable<DiagramNode["kind"]>, typeof Server> = {
  client: User,
  server: Server,
  db: Database,
  cache: Zap,
  queue: Layers,
  storage: HardDrive,
  external: Globe,
};

export function ArchitectureCanvas({
  nodes,
  edges,
  visibleNodeIds,
  visibleEdgeIds,
}: {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  visibleNodeIds: Set<string>;
  visibleEdgeIds: Set<string>;
}) {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  // Opacity/scale-in fades aren't covered by MotionConfig's built-in reducedMotion
  // (that only zeroes transform values like x/y/scale on their own), so this canvas
  // must opt out of the fade explicitly to give a genuinely steady rest state.
  const prefersReducedMotion = useReducedMotion();
  const fadeDuration = prefersReducedMotion ? 0 : undefined;

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-lg border border-border bg-white/[0.02]">
      <svg className="absolute inset-0 h-full w-full">
        {edges.map((e) => {
          if (!visibleEdgeIds.has(e.id)) return null;
          const from = nodeById.get(e.from);
          const to = nodeById.get(e.to);
          if (!from || !to) return null;
          return (
            <motion.line
              key={e.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: fadeDuration ?? 0.4 }}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              strokeDasharray="4 3"
            />
          );
        })}
      </svg>

      {nodes.map((n) => {
        if (!visibleNodeIds.has(n.id)) return null;
        const Icon = ICONS[n.kind ?? "server"];
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.3, type: "spring", stiffness: 260, damping: 20 }
            }
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.15)]">
              <Icon size={18} />
            </div>
            <span className="block w-16 text-center text-[9px] leading-tight text-muted">{n.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}

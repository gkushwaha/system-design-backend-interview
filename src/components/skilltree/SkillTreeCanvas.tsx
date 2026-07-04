import { useRef, useState, type WheelEvent, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronsDown, Lock, Minus, Plus, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { topics, type Topic } from "@/data/topics";
import { useProgress } from "@/hooks/useProgress";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.4;

function TopicNode({
  topic,
  locked,
  done,
  current,
  size = "md",
}: {
  topic: Topic;
  locked: boolean;
  done: boolean;
  current: boolean;
  size?: "lg" | "md";
}) {
  const dims = size === "lg" ? "h-16 w-16" : "h-11 w-11";
  const iconSize = size === "lg" ? 20 : 14;

  const inner = (
    <div className="flex flex-col items-center gap-1.5" style={{ width: size === "lg" ? 96 : 76 }}>
      <motion.div
        animate={
          current
            ? { boxShadow: ["0 0 0 0 rgba(99,102,241,0.5)", "0 0 0 8px rgba(99,102,241,0)"] }
            : {}
        }
        transition={current ? { duration: 1.6, repeat: Infinity } : {}}
        className={cn(
          dims,
          "flex items-center justify-center rounded-full border-2 font-mono font-semibold transition-colors",
          locked && "border-border bg-white/[0.02] text-muted/50",
          !locked && done && "border-success/70 bg-success/10 text-success shadow-[0_0_14px_rgba(34,197,94,0.25)]",
          !locked && !done && "border-primary/50 bg-primary/10 text-indigo-300",
        )}
        style={{ fontSize: iconSize }}
      >
        {locked ? <Lock size={iconSize - 2} /> : done ? <CheckCircle2 size={iconSize} /> : topic.id}
      </motion.div>
      <span
        className={cn(
          "line-clamp-2 text-center text-[10px] leading-tight",
          locked ? "text-muted/40" : "text-muted",
        )}
      >
        {topic.title}
      </span>
    </div>
  );

  if (locked) return inner;
  return (
    <Link to={`/topics/${topic.slug}`} className="transition-transform hover:scale-105">
      {inner}
    </Link>
  );
}

function GateDivider({
  unlocked,
  label,
  progressLabel,
}: {
  unlocked: boolean;
  label: string;
  progressLabel: string;
}) {
  return (
    <div className="my-8 flex flex-col items-center gap-2">
      <motion.div
        animate={{ color: unlocked ? "var(--color-success)" : "var(--color-muted)" }}
        className="flex items-center gap-2 text-xs font-medium"
      >
        <ChevronsDown size={16} />
        {unlocked ? `${label} — unlocked` : `${label} — ${progressLabel}`}
      </motion.div>
      <div className={cn("h-px w-2/3 max-w-md", unlocked ? "bg-success/40" : "bg-border")} />
    </div>
  );
}

export function SkillTreeCanvas() {
  const { completedTopicIds, lastTopicId, advancedUnlocked, expertUnlocked, rings } = useProgress();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const mostAsked = topics.filter((t) => t.tier === "most-asked");
  const advancedGroups = [...new Set(topics.filter((t) => t.tier === "advanced").map((t) => t.group))];
  const expertGroups = [...new Set(topics.filter((t) => t.tier === "expert").map((t) => t.group))];

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
  }

  function onMouseDown(e: MouseEvent) {
    dragState.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
    setIsDragging(true);
  }

  function onMouseMove(e: MouseEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPan({ x: dragState.current.panX + dx, y: dragState.current.panY + dy });
  }

  function endDrag() {
    dragState.current = null;
    setIsDragging(false);
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  return (
    <div className="relative h-[640px] w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.06),transparent_60%)]">
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.15))}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.15))}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={resetView}
          aria-label="Reset zoom and pan"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:text-text"
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <div className="absolute left-3 top-3 z-10 text-[11px] text-muted">
        Scroll to zoom · drag to pan · click a node to open it
      </div>

      <div
        className={cn("h-full w-full", isDragging ? "cursor-grabbing" : "cursor-grab")}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        <div
          className="mx-auto flex w-fit flex-col items-center px-16 py-10"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top center",
            transition: dragState.current ? "none" : "transform 0.15s ease-out",
          }}
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-danger">
            🔥 Most Asked
            <span className="font-mono text-xs text-muted">
              {rings.mostAsked.done}/{rings.mostAsked.total}
            </span>
          </div>
          <div className="flex max-w-5xl flex-wrap justify-center gap-4">
            {mostAsked.map((t) => (
              <TopicNode
                key={t.id}
                topic={t}
                locked={false}
                done={completedTopicIds.includes(t.id)}
                current={lastTopicId === t.id}
                size="lg"
              />
            ))}
          </div>

          <GateDivider
            unlocked={advancedUnlocked}
            label="Advanced tier"
            progressLabel={`${rings.mostAsked.done}/8 Most Asked completed`}
          />

          <div className="flex items-center gap-2 self-start text-sm font-semibold text-warning">
            Advanced
            <span className="font-mono text-xs text-muted">
              {rings.advanced.done}/{rings.advanced.total}
            </span>
          </div>
          <div className="mt-3 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {advancedGroups.map((group) => (
              <div key={group} className="rounded-lg border border-border/70 bg-white/[0.015] p-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {group}
                </div>
                <div className="flex flex-wrap gap-3">
                  {topics
                    .filter((t) => t.tier === "advanced" && t.group === group)
                    .map((t) => (
                      <TopicNode
                        key={t.id}
                        topic={t}
                        locked={!advancedUnlocked}
                        done={completedTopicIds.includes(t.id)}
                        current={lastTopicId === t.id}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>

          <GateDivider
            unlocked={expertUnlocked}
            label="Expert tier"
            progressLabel={`${rings.advanced.done}/20 Advanced completed`}
          />

          <div className="flex items-center gap-2 self-start text-sm font-semibold text-indigo-300">
            Expert
            <span className="font-mono text-xs text-muted">
              {rings.expert.done}/{rings.expert.total}
            </span>
          </div>
          <div className="mt-3 grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {expertGroups.map((group) => (
              <div key={group} className="rounded-lg border border-border/70 bg-white/[0.015] p-3">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                  {group}
                </div>
                <div className="flex flex-wrap gap-3">
                  {topics
                    .filter((t) => t.tier === "expert" && t.group === group)
                    .map((t) => (
                      <TopicNode
                        key={t.id}
                        topic={t}
                        locked={!expertUnlocked}
                        done={completedTopicIds.includes(t.id)}
                        current={lastTopicId === t.id}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

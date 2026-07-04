import { useRef, useState } from "react";
import { ArrowRight, Eraser, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface Shape {
  id: string;
  x: number;
  y: number;
  label: string;
}

interface Arrow {
  id: string;
  from: string;
  to: string;
}

let nextId = 1;

export function Whiteboard() {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [arrows, setArrows] = useState<Arrow[]>([]);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const dragId = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  function addShape() {
    const id = `s${nextId++}`;
    setShapes((prev) => [
      ...prev,
      { id, x: 40 + (prev.length % 5) * 90, y: 40 + Math.floor(prev.length / 5) * 90, label: "Component" },
    ]);
  }

  function clearBoard() {
    setShapes([]);
    setArrows([]);
    setConnectFrom(null);
  }

  function onShapePointerDown(e: React.PointerEvent, id: string) {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(id);
      } else if (connectFrom !== id) {
        setArrows((prev) => [...prev, { id: `a${nextId++}`, from: connectFrom, to: id }]);
        setConnectFrom(null);
      }
      return;
    }
    const rect = canvasRef.current?.getBoundingClientRect();
    const shape = shapes.find((s) => s.id === id);
    if (!rect || !shape) return;
    dragId.current = id;
    dragOffset.current = { x: e.clientX - rect.left - shape.x, y: e.clientY - rect.top - shape.y };
  }

  function onCanvasPointerMove(e: React.PointerEvent) {
    if (!dragId.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - dragOffset.current.x;
    const y = e.clientY - rect.top - dragOffset.current.y;
    setShapes((prev) => prev.map((s) => (s.id === dragId.current ? { ...s, x, y } : s)));
  }

  function onCanvasPointerUp() {
    dragId.current = null;
  }

  function renameShape(id: string, label: string) {
    setShapes((prev) => prev.map((s) => (s.id === id ? { ...s, label } : s)));
  }

  const shapeById = new Map(shapes.map((s) => [s.id, s]));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addShape}>
          Add box
        </Button>
        <Button
          size="sm"
          variant={connectMode ? "primary" : "secondary"}
          icon={<ArrowRight size={14} />}
          onClick={() => {
            setConnectMode((m) => !m);
            setConnectFrom(null);
          }}
        >
          {connectMode ? "Click two boxes to connect" : "Draw arrow"}
        </Button>
        <Button size="sm" variant="secondary" icon={<Eraser size={14} />} onClick={clearBoard}>
          Clear
        </Button>
      </div>

      <div
        ref={canvasRef}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerLeave={onCanvasPointerUp}
        className="relative h-[420px] w-full touch-none overflow-hidden rounded-lg border border-border bg-white/[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {arrows.map((a) => {
            const from = shapeById.get(a.from);
            const to = shapeById.get(a.to);
            if (!from || !to) return null;
            return (
              <line
                key={a.id}
                x1={from.x + 40}
                y1={from.y + 20}
                x2={to.x + 40}
                y2={to.y + 20}
                stroke="var(--color-primary)"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 Z" fill="var(--color-primary)" />
            </marker>
          </defs>
        </svg>

        {shapes.map((s) => (
          <div
            key={s.id}
            onPointerDown={(e) => onShapePointerDown(e, s.id)}
            className={cn(
              "absolute flex h-10 w-20 cursor-move items-center justify-center rounded-md border-2 bg-surface px-1 text-center text-[10px] shadow",
              connectFrom === s.id ? "border-warning text-warning" : "border-primary/50 text-text",
            )}
            style={{ left: s.x, top: s.y }}
          >
            <input
              value={s.label}
              onChange={(e) => renameShape(s.id, e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-center text-[10px] outline-none"
            />
          </div>
        ))}

        {shapes.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            Add boxes for each component, then connect them to sketch your architecture.
          </div>
        )}
      </div>
    </div>
  );
}

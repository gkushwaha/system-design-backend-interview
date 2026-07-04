import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "primary" | "success" | "warning" | "danger" | "muted";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
}

// Text uses a lighter tint than the base theme color (e.g. indigo-300 instead of
// indigo-500) — the full-saturation theme colors only hit ~3.6:1 against their own
// 15%-opacity tinted background, failing WCAG AA's 4.5:1 minimum (found via axe-core).
const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-primary/15 text-indigo-300 border-primary/30",
  success: "bg-success/15 text-emerald-300 border-success/30",
  warning: "bg-warning/15 text-amber-300 border-warning/30",
  danger: "bg-danger/15 text-red-300 border-danger/30",
  muted: "bg-white/[0.04] text-muted border-border",
};

export function Badge({ children, tone = "muted", icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium font-mono uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function DifficultyBadge({ tier }: { tier: "most-asked" | "advanced" | "expert" }) {
  if (tier === "most-asked") return <Badge tone="danger">🔥 Most Asked</Badge>;
  if (tier === "advanced") return <Badge tone="warning">Advanced</Badge>;
  return <Badge tone="primary">Expert</Badge>;
}

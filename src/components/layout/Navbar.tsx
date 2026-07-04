import { Flame, Menu, Zap } from "lucide-react";
import { useXP } from "@/hooks/useXP";
import { useProgressStore } from "@/store/useProgressStore";
import { Badge } from "@/components/ui/Badge";

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { xp, level } = useXP();
  const streak = useProgressStore((s) => s.streak);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:text-text md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <div className="text-sm font-semibold text-text">{level}</div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Badge tone="warning" icon={<Flame size={12} />}>
          <span className="hidden sm:inline">{streak.count}-day streak</span>
          <span className="sm:hidden">{streak.count}d</span>
        </Badge>
        <Badge tone="primary" icon={<Zap size={12} />}>
          <span className="hidden sm:inline">{xp.toLocaleString()} XP</span>
          <span className="sm:hidden">{xp.toLocaleString()}</span>
        </Badge>
      </div>
    </header>
  );
}

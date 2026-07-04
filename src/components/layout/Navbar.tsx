import { Flame, Menu, Zap } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useXP } from "@/hooks/useXP";
import { useProgressStore } from "@/store/useProgressStore";
import { Badge } from "@/components/ui/Badge";
import { topicBySlug } from "@/data/topics";
import { problemBySlug } from "@/data/problems";

function usePageTitle(): string {
  const { pathname } = useLocation();
  const { slug } = useParams();

  if (pathname === "/") return "Home";
  if (pathname.startsWith("/map")) return "Skill Tree";
  if (pathname.startsWith("/reference")) return "Quick Reference";
  if (pathname.startsWith("/interview")) return "Interview Simulation";
  if (pathname.startsWith("/topics/")) return topicBySlug.get(slug ?? "")?.title ?? "Topic";
  if (pathname.startsWith("/problems/")) return problemBySlug.get(slug ?? "")?.title ?? "System Design";
  if (pathname.startsWith("/problems")) return "System Design";
  return "";
}

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { xp } = useXP();
  const streak = useProgressStore((s) => s.streak);
  const pageTitle = usePageTitle();

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
        {/* Shows what page you're on (not the XP level — that's redundant with
            the Home dashboard's own "Current Level" card and didn't help
            orient users on inner pages). */}
        <div className="truncate text-sm font-semibold text-text">{pageTitle}</div>
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

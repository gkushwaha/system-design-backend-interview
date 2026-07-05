import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Map,
  BookOpen,
  Swords,
  Clock,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { topics, topicsByTier } from "@/data/topics";
import { problemsByTier } from "@/data/problems";
import { useProgress } from "@/hooks/useProgress";

const mostAskedTopics = topicsByTier("most-asked");
const advancedTopics = topicsByTier("advanced");
const expertTopics = topicsByTier("expert");

const advancedGroupNames = [...new Set(advancedTopics.map((t) => t.group))];
const expertGroupNames = [...new Set(expertTopics.map((t) => t.group))];

const mostAskedProblems = problemsByTier("most-asked");
const advancedProblems = problemsByTier("advanced");
const expertProblems = problemsByTier("expert");

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary/15 text-indigo-300"
            : "text-muted hover:bg-white/[0.04] hover:text-text",
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

function TopicRow({
  id,
  title,
  slug,
  done,
  prominent,
  to,
}: {
  id: number;
  title: string;
  slug: string;
  done: boolean;
  prominent?: boolean;
  to?: string;
}) {
  return (
    <NavLink
      to={to ?? `/topics/${slug}`}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
          isActive ? "bg-primary/15 text-indigo-300" : "text-muted hover:bg-white/[0.04] hover:text-text",
          prominent && "text-[13px] font-medium",
        )
      }
    >
      {/* no opacity dimming — it was pushing already-muted text below the 4.5:1 WCAG AA contrast floor */}
      <span className="w-4 shrink-0 text-center font-mono text-[10px]">{id}</span>
      {done ? (
        <CheckCircle2 size={12} className="shrink-0 text-success" />
      ) : (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-40" />
      )}
      <span className="truncate">{title}</span>
    </NavLink>
  );
}

function CollapsibleGroup({
  label,
  defaultOpen = false,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted hover:text-text"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="truncate">{label}</span>
      </button>
      {open && <div className="mt-0.5 space-y-0.5 pl-1">{children}</div>}
    </div>
  );
}

export function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const { completedTopicIds, rings } = useProgress();
  const [isBelowMd, setIsBelowMd] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsBelowMd(mql.matches);
    const onChange = () => setIsBelowMd(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Below md, the drawer is only translated off-screen (not display:none) so it
  // can slide in/out — but that alone leaves its links keyboard/screen-reader
  // reachable while visually hidden. inert + aria-hidden close that gap.
  const offCanvasHidden = isBelowMd && !open;

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        inert={offCanvasHidden ? true : undefined}
        aria-hidden={offCanvasHidden ? true : undefined}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) onClose?.();
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col border-r border-border bg-bg transition-transform duration-200 md:static md:z-auto md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
          S
        </div>
        <div>
          <div className="text-sm font-semibold text-text">System Design</div>
          <div className="text-[11px] text-muted font-mono">Backend Interview Prep</div>
        </div>
      </div>

      <nav aria-label="Primary" className="space-y-1 border-b border-border px-3 py-3">
        <NavItem to="/" icon={<Home size={16} />} label="Home" />
        <NavItem to="/map" icon={<Map size={16} />} label="Skill Tree" />
        <NavItem to="/problems" icon={<Swords size={16} />} label="System Design" />
        <NavItem to="/interview" icon={<Clock size={16} />} label="Interview Sim" />
        <NavItem to="/reference" icon={<BookOpen size={16} />} label="Quick Reference" />
      </nav>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-danger">
            <Flame size={12} />
            Most Asked
            <span className="ml-auto font-mono text-muted normal-case">
              {rings.mostAsked.done}/{rings.mostAsked.total}
            </span>
          </div>
          <div className="space-y-0.5">
            {mostAskedTopics.map((t) => (
              <TopicRow
                key={t.id}
                id={t.id}
                title={t.title}
                slug={t.slug}
                done={completedTopicIds.includes(t.id)}
                prominent
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-warning">
            Advanced
            <span className="ml-auto font-mono text-muted normal-case">
              {rings.advanced.done}/{rings.advanced.total}
            </span>
          </div>
          <div className="space-y-1">
            {advancedGroupNames.map((group) => (
              <CollapsibleGroup key={group} label={group}>
                {topics
                  .filter((t) => t.tier === "advanced" && t.group === group)
                  .map((t) => (
                    <TopicRow
                      key={t.id}
                      id={t.id}
                      title={t.title}
                      slug={t.slug}
                      done={completedTopicIds.includes(t.id)}
                    />
                  ))}
              </CollapsibleGroup>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-indigo-300">
            Expert
            <span className="ml-auto font-mono text-muted normal-case">
              {rings.expert.done}/{rings.expert.total}
            </span>
          </div>
          <div className="space-y-1">
            {expertGroupNames.map((group) => (
              <CollapsibleGroup key={group} label={group}>
                {topics
                  .filter((t) => t.tier === "expert" && t.group === group)
                  .map((t) => (
                    <TopicRow
                      key={t.id}
                      id={t.id}
                      title={t.title}
                      slug={t.slug}
                      done={completedTopicIds.includes(t.id)}
                    />
                  ))}
              </CollapsibleGroup>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            System Design Problems
          </div>
          <div className="space-y-1">
            <CollapsibleGroup label="🔥 Most Asked" defaultOpen>
              {mostAskedProblems.map((p) => (
                <TopicRow key={p.id} id={p.order} title={p.title} slug={p.slug} to={`/problems/${p.slug}`} done={false} />
              ))}
            </CollapsibleGroup>
            <CollapsibleGroup label="Advanced">
              {advancedProblems.map((p) => (
                <TopicRow key={p.id} id={p.order} title={p.title} slug={p.slug} to={`/problems/${p.slug}`} done={false} />
              ))}
            </CollapsibleGroup>
            <CollapsibleGroup label="Expert">
              {expertProblems.map((p) => (
                <TopicRow key={p.id} id={p.order} title={p.title} slug={p.slug} to={`/problems/${p.slug}`} done={false} />
              ))}
            </CollapsibleGroup>
          </div>
        </div>
      </div>
      </aside>
    </>
  );
}

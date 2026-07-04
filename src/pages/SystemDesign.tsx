import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Calculator,
  ClipboardList,
  Lightbulb,
  Loader2,
  Route,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DifficultyBadge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { RequirementsPanel } from "@/components/problem/RequirementsPanel";
import { SolutionBuilder } from "@/components/problem/SolutionBuilder";
import { CapacityCalculator } from "@/components/problem/CapacityCalculator";
import { KeyDecisionsPanel } from "@/components/problem/KeyDecisionsPanel";
import { CommonMistakesPanel } from "@/components/problem/CommonMistakesPanel";
import { CompanyNote } from "@/components/problem/CompanyNote";
import { problems, problemBySlug, problemsByTier } from "@/data/problems";
import { hasProblemContent, loadProblemContent, type ProblemContent } from "@/data/problemContent";
import { useProgress } from "@/hooks/useProgress";
import { useXP } from "@/hooks/useXP";

function ProblemDetail({ slug }: { slug: string }) {
  const problem = problemBySlug.get(slug);
  const [content, setContent] = useState<ProblemContent | undefined>(undefined);
  const [contentLoading, setContentLoading] = useState(true);
  const { completeProblem, isProblemComplete } = useProgress();
  const { addXP, XP_REWARDS } = useXP();

  useEffect(() => {
    setContent(undefined);
    if (!hasProblemContent(slug)) {
      setContentLoading(false);
      return;
    }
    setContentLoading(true);
    let cancelled = false;
    loadProblemContent(slug)?.then((c) => {
      if (!cancelled) {
        setContent(c);
        setContentLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!problem) {
    return (
      <div className="text-sm text-muted">
        Problem not found.{" "}
        <Link to="/problems" className="text-indigo-300 hover:underline">
          Back to problems
        </Link>
      </div>
    );
  }

  const done = isProblemComplete(problem.id);

  function markComplete() {
    if (!problem || done) return;
    completeProblem(problem.id);
    addXP(XP_REWARDS.systemDesignProblem);
  }

  const tabs: TabItem[] = content
    ? [
        {
          id: "requirements",
          label: "Requirements",
          icon: <ClipboardList size={14} />,
          content: <RequirementsPanel data={content.requirements} />,
        },
        {
          id: "solution",
          label: "Solution",
          icon: <Route size={14} />,
          content: (
            <SolutionBuilder steps={content.solutionSteps} nodes={content.diagramNodes} edges={content.diagramEdges} />
          ),
        },
        {
          id: "capacity",
          label: "Capacity",
          icon: <Calculator size={14} />,
          content: <CapacityCalculator data={content.capacity} />,
        },
        {
          id: "decisions",
          label: "Key decisions",
          icon: <Lightbulb size={14} />,
          content: <KeyDecisionsPanel decisions={content.keyDecisions} />,
        },
        {
          id: "mistakes",
          label: "Mistakes",
          icon: <AlertTriangle size={14} />,
          content: <CommonMistakesPanel mistakes={content.commonMistakes} />,
        },
        {
          id: "real-world",
          label: "Real world",
          icon: <Building2 size={14} />,
          content: (
            <div className="space-y-4">
              <CompanyNote company={content.companyNote.company} note={content.companyNote.note} />
              <Card>
                <Button onClick={markComplete} disabled={done}>
                  {done ? "Completed ✓" : `Mark Complete (+${XP_REWARDS.systemDesignProblem} XP)`}
                </Button>
              </Card>
            </div>
          ),
        },
      ]
    : [
        {
          id: "placeholder",
          label: "Overview",
          content: (
            <Card>
              <p className="text-sm text-muted">
                Requirements panel, step-by-step solution builder, capacity estimation calculator, and
                animated architecture diagram land here soon.
              </p>
              <Button className="mt-4" onClick={markComplete} disabled={done}>
                {done ? "Completed ✓" : `Mark Complete (+${XP_REWARDS.systemDesignProblem} XP)`}
              </Button>
            </Card>
          ),
        },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <Breadcrumb
        items={[
          { label: "Home", to: "/" },
          { label: "System Design", to: "/problems" },
          { label: problem.title },
        ]}
      />
      <div>
        <DifficultyBadge tier={problem.tier} />
        <h1 className="mt-2 text-2xl font-semibold text-text">{problem.title}</h1>
        <p className="mt-1 text-sm text-muted">{problem.company}</p>
      </div>

      {contentLoading ? (
        <Card className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" />
          Loading problem…
        </Card>
      ) : (
        <Tabs tabs={tabs} />
      )}
    </motion.div>
  );
}

function ProblemList() {
  const mostAsked = problemsByTier("most-asked");
  const advanced = problemsByTier("advanced");
  const expert = problemsByTier("expert");
  const { isProblemComplete } = useProgress();

  const groups: [string, typeof problems][] = [
    ["🔥 Most Asked", mostAsked],
    ["Advanced", advanced],
    ["Expert", expert],
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-5xl space-y-8"
    >
      <div>
        <h1 className="text-2xl font-semibold text-text">System Design Problems</h1>
        <p className="mt-1 text-sm text-muted">
          30 real interview problems, ordered by interview frequency.
        </p>
      </div>

      {groups.map(([label, list]) => (
        <section key={label}>
          <div className="mb-3 text-sm font-semibold text-text">{label}</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Link key={p.id} to={`/problems/${p.slug}`}>
                <Card interactive className={isProblemComplete(p.id) ? "border-success/50" : undefined}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted">{p.id}</span>
                    {isProblemComplete(p.id) && <Trophy size={14} className="text-success" />}
                  </div>
                  <div className="mt-2 text-sm font-medium text-text">{p.title}</div>
                  <div className="mt-1 text-xs text-muted">{p.company}</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </motion.div>
  );
}

export function SystemDesign() {
  const { slug } = useParams<{ slug: string }>();
  return slug ? <ProblemDetail slug={slug} /> : <ProblemList />;
}

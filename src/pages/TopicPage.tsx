import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Eye, GitBranch, Loader2, MessageSquare, Scale, Trophy } from "lucide-react";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { DifficultyBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { HowItWorksStepper } from "@/components/topic/HowItWorksStepper";
import { TradeoffsPanel } from "@/components/topic/TradeoffsPanel";
import { InterviewAnswerPanel } from "@/components/topic/InterviewAnswerPanel";
import { MiniChallenge } from "@/components/topic/MiniChallenge";
import { topicBySlug } from "@/data/topics";
import { hasTopicContent, loadTopicContent, type TopicContent } from "@/data/topicContent";
import { useProgress } from "@/hooks/useProgress";
import { useProgressStore } from "@/store/useProgressStore";
import { useXP } from "@/hooks/useXP";

function timeAgo(iso: string | undefined): string {
  if (!iso) return "Never visited before";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function TopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const topic = slug ? topicBySlug.get(slug) : undefined;
  const [content, setContent] = useState<TopicContent | undefined>(undefined);
  const [contentLoading, setContentLoading] = useState(true);
  const { visitTopic, completeTopic, completeChallenge } = useProgress();
  const completedTopicIds = useProgressStore((s) => s.completedTopicIds);
  const lastVisitedAt = useProgressStore((s) => s.lastVisitedAt);
  const { addXP, XP_REWARDS } = useXP();
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["visual"]));

  const previousVisit = topic ? lastVisitedAt[topic.id] : undefined;

  useEffect(() => {
    if (topic) visitTopic(topic.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic?.id]);

  useEffect(() => {
    setContent(undefined);
    if (!slug || !hasTopicContent(slug)) {
      setContentLoading(false);
      return;
    }
    setContentLoading(true);
    let cancelled = false;
    loadTopicContent(slug)?.then((c) => {
      if (!cancelled) {
        setContent(c);
        setContentLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const isComplete = topic ? completedTopicIds.includes(topic.id) : false;
  const tabProgress = (visitedTabs.size / 5) * 100;

  function markComplete() {
    if (!topic || isComplete) return;
    completeTopic(topic.id);
    completeChallenge(topic.id);
    addXP(XP_REWARDS.topic + XP_REWARDS.miniChallenge);
  }

  const tabs: TabItem[] = !topic
    ? []
    : content
      ? [
          {
            id: "visual",
            label: "Visual",
            icon: <Eye size={14} />,
            content: (
              <div className="space-y-4">
                <content.visual />
                <Card className="bg-white/[0.02]">
                  <p className="text-xs text-muted">
                    Real-world example: <span className="text-text">{topic.example}</span>
                  </p>
                </Card>
              </div>
            ),
          },
          {
            id: "how",
            label: "How it works",
            icon: <GitBranch size={14} />,
            content: <HowItWorksStepper steps={content.howItWorks} />,
          },
          {
            id: "tradeoffs",
            label: "Tradeoffs",
            icon: <Scale size={14} />,
            content: <TradeoffsPanel data={content.tradeoffs} />,
          },
          {
            id: "interview",
            label: "Interview answer",
            icon: <MessageSquare size={14} />,
            content: <InterviewAnswerPanel data={content.interviewAnswer} />,
          },
          {
            id: "challenge",
            label: "Mini challenge",
            icon: <Trophy size={14} />,
            content: (
              <MiniChallenge
                questions={content.challenge}
                isComplete={isComplete}
                xpReward={XP_REWARDS.topic + XP_REWARDS.miniChallenge}
                onComplete={markComplete}
              />
            ),
          },
        ]
      : [
          {
            id: "visual",
            label: "Visual",
            icon: <Eye size={14} />,
            content: (
              <Card>
                <p className="text-sm text-muted">
                  An interactive animated diagram for <strong className="text-text">{topic.title}</strong>{" "}
                  lands here soon — sliders, toggles, and click-to-explore nodes specific to this topic.
                </p>
                <div className="mt-4 rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted">
                  Visual placeholder
                </div>
                <p className="mt-4 text-xs text-muted">
                  Real-world example: <span className="text-text">{topic.example}</span>
                </p>
              </Card>
            ),
          },
          {
            id: "how",
            label: "How it works",
            icon: <GitBranch size={14} />,
            content: (
              <Card>
                <p className="text-sm text-muted">
                  Step-by-step animated walkthrough with Next/Prev controls arrives soon.
                </p>
              </Card>
            ),
          },
          {
            id: "tradeoffs",
            label: "Tradeoffs",
            icon: <Scale size={14} />,
            content: (
              <Card>
                <p className="text-sm text-muted">
                  Pros vs cons, when to use vs when not to, and a decision flowchart land here soon.
                </p>
              </Card>
            ),
          },
          {
            id: "interview",
            label: "Interview answer",
            icon: <MessageSquare size={14} />,
            content: (
              <Card>
                <p className="text-sm text-muted">
                  A scripted interview answer, common mistakes, and follow-up questions arrive soon.
                </p>
              </Card>
            ),
          },
          {
            id: "challenge",
            label: "Mini challenge",
            icon: <Trophy size={14} />,
            content: (
              <Card>
                <p className="text-sm text-muted">
                  A real drag-and-drop / quiz challenge lands here soon. For now, mark this topic
                  complete to award XP and unlock progress.
                </p>
                <Button className="mt-4" onClick={markComplete} disabled={isComplete}>
                  {isComplete ? "Completed ✓" : `Mark Complete (+${XP_REWARDS.topic + XP_REWARDS.miniChallenge} XP)`}
                </Button>
              </Card>
            ),
          },
        ];

  if (!slug) return <Navigate to="/map" replace />;
  if (!topic) {
    return (
      <div className="text-sm text-muted">
        Topic not found. <Link to="/map" className="text-indigo-300 hover:underline">Back to skill tree</Link>
      </div>
    );
  }

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
          { label: "Skill Tree", to: "/map" },
          { label: topic.title },
        ]}
      />

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge tier={topic.tier} />
          <span className="flex items-center gap-1 text-xs text-muted font-mono">
            <Clock size={12} />
            {topic.estimatedMinutes} min
          </span>
          <span className="text-xs text-muted font-mono">{timeAgo(previousVisit)}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-text">{topic.title}</h1>
        <p className="mt-1 text-sm text-muted">{topic.group}</p>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted">
          <span>Topic progress</span>
          <span className="font-mono">{Math.round(tabProgress)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${tabProgress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {contentLoading ? (
        <Card className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <Loader2 size={16} className="animate-spin" />
          Loading topic…
        </Card>
      ) : (
        <Tabs tabs={tabs} onTabChange={(id) => setVisitedTabs((prev) => new Set(prev).add(id))} />
      )}
    </motion.div>
  );
}

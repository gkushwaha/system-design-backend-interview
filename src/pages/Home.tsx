import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useXP } from "@/hooks/useXP";
import { useProgress } from "@/hooks/useProgress";
import { useProgressStore } from "@/store/useProgressStore";
import { topicsById } from "@/data/topics";
import { problems } from "@/data/problems";

function dayOfYearIndex(length: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return dayOfYear % length;
}

export function Home() {
  const { xp, level, lastGain, nextThreshold, progressToNext } = useXP();
  const { rings, lastTopicId, recentTopicIds } = useProgress();
  const streak = useProgressStore((s) => s.streak);
  const [showGainToast, setShowGainToast] = useState(false);

  useEffect(() => {
    if (lastGain > 0) {
      setShowGainToast(true);
      const t = setTimeout(() => setShowGainToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [lastGain]);

  const todaysChallenge = problems[dayOfYearIndex(problems.length)];
  const lastTopic = lastTopicId ? topicsById.get(lastTopicId) : undefined;
  const recentTopics = recentTopicIds
    .map((id) => topicsById.get(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {showGainToast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed right-8 top-6 z-50 flex items-center gap-2 rounded-lg border border-primary/40 bg-surface px-4 py-2.5 shadow-lg shadow-primary/10"
        >
          <Sparkles size={16} className="text-indigo-300" />
          <span className="text-sm font-semibold text-text">+{lastGain} XP earned!</span>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-semibold text-text">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">
          Keep the streak alive — you're on day {streak.count}.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-muted">
                Current Level
              </div>
              <div className="mt-1 text-xl font-semibold text-text">{level}</div>
            </div>
            <Badge tone="primary" icon={<Zap size={12} />}>
              {xp.toLocaleString()} XP
            </Badge>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(progressToNext * 100)}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1.5 text-xs text-muted font-mono">
            {nextThreshold ? `${nextThreshold - xp} XP to next level` : "Max level reached"}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-warning/15 text-warning">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-xl font-semibold text-text">{streak.count} days</div>
              <div className="text-xs text-muted">Current streak</div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 text-sm font-semibold text-text">Progress</div>
        <div className="flex flex-wrap justify-around gap-6">
          <ProgressRing done={rings.mostAsked.done} total={rings.mostAsked.total} label="Most Asked" color="#ef4444" />
          <ProgressRing done={rings.advanced.done} total={rings.advanced.total} label="Advanced" color="#f59e0b" />
          <ProgressRing done={rings.expert.done} total={rings.expert.total} label="Expert" color="#6366f1" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Continue where you left off
          </div>
          {lastTopic ? (
            <Link to={`/topics/${lastTopic.slug}`} className="block">
              <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.02] p-4 transition-colors hover:border-primary/50">
                <div>
                  <DifficultyBadge tier={lastTopic.tier} />
                  <div className="mt-2 text-sm font-medium text-text">{lastTopic.title}</div>
                </div>
                <ArrowRight size={18} className="text-muted" />
              </div>
            </Link>
          ) : (
            <div className="text-sm text-muted">
              Nothing yet —{" "}
              <Link to="/map" className="text-indigo-300 hover:underline">
                start your first topic
              </Link>
              .
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
            Today's Challenge
            <Badge tone="danger">🔥</Badge>
          </div>
          <div className="rounded-lg border border-border bg-white/[0.02] p-4">
            <DifficultyBadge tier={todaysChallenge.tier} />
            <div className="mt-2 text-sm font-medium text-text">{todaysChallenge.title}</div>
            <div className="mt-1 text-xs text-muted">{todaysChallenge.company}</div>
            <Link to={`/problems/${todaysChallenge.slug}`}>
              <Button size="sm" className="mt-3">
                Start challenge
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Recently Visited
        </div>
        {recentTopics.length === 0 ? (
          <div className="text-sm text-muted">No topics visited yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTopics.map((t) => (
              <Link key={t.id} to={`/topics/${t.slug}`}>
                <div className="rounded-lg border border-border bg-white/[0.02] p-3 transition-colors hover:border-primary/50">
                  <DifficultyBadge tier={t.tier} />
                  <div className="mt-2 truncate text-sm font-medium text-text">{t.title}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

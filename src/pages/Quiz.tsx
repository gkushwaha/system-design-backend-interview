import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/ui/Badge";
import { topics } from "@/data/topics";
import { useProgress } from "@/hooks/useProgress";

export function Quiz() {
  const { completedTopicIds } = useProgress();
  const pending = topics.filter((t) => !completedTopicIds.includes(t.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-semibold text-text">Mini Challenges</h1>
        <p className="mt-1 text-sm text-muted">
          Pick a topic to complete its mini challenge and earn XP. Full drag-and-drop and quiz
          interactions land in Phase 2.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pending.slice(0, 12).map((t) => (
          <Link key={t.id} to={`/topics/${t.slug}`}>
            <Card interactive>
              <div className="flex items-center justify-between">
                <DifficultyBadge tier={t.tier} />
                <Trophy size={14} className="text-muted" />
              </div>
              <div className="mt-2 text-sm font-medium text-text">{t.title}</div>
            </Card>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

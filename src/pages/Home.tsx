import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Clock, Map as MapIcon, Swords } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MOST_ASKED_COUNT, ADVANCED_COUNT, EXPERT_COUNT } from "@/data/topics";
import { problems } from "@/data/problems";

const STEPS = [
  {
    title: "Skill Tree",
    body: "Start with the 15 “Most Asked” topics. Each one walks through the concept, how it works, its tradeoffs, and gives you an interview-ready spoken answer to practice.",
  },
  {
    title: "System Design Problems",
    body: "Once the fundamentals feel solid, work through full worked examples — “Design a URL shortener,” “Design Twitter's feed” — showing how to structure a real interview answer end to end.",
  },
  {
    title: "Interview Simulation",
    body: "Practice explaining a concept out loud, under time pressure, the way a real interview actually feels.",
  },
  {
    title: "Quick Reference",
    body: "Keep this open for a fast cheat-sheet: database comparisons, latency numbers, CAP theorem systems, HTTP status codes.",
  },
];

const QUICK_LINKS = [
  {
    to: "/map",
    icon: MapIcon,
    label: "Skill Tree",
    detail: `${MOST_ASKED_COUNT + ADVANCED_COUNT + EXPERT_COUNT} topics across Most Asked, Advanced, and Expert tiers`,
  },
  {
    to: "/problems",
    icon: Swords,
    label: "System Design Problems",
    detail: `${problems.length} real interview questions, worked end to end`,
  },
  {
    to: "/interview",
    icon: Clock,
    label: "Interview Simulation",
    detail: "Practice answering out loud, under time pressure",
  },
  {
    to: "/reference",
    icon: BookOpen,
    label: "Quick Reference",
    detail: "Comparison tables, latency numbers, and cheat-sheets",
  },
];

export function Home() {
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-3xl font-semibold text-text">Master system design interviews</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
          A free, self-contained curriculum covering the concepts, tradeoffs, and real interview
          questions backend engineers get asked — from load balancers and caching to designing
          Twitter's feed. No sign-up, no tracking. Just come, study a topic, and move on.
        </p>
      </motion.div>

      <Card>
        <div className="mb-4 text-sm font-semibold text-text">How to use this</div>
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3 text-sm text-muted">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs text-indigo-300">
                {i + 1}
              </span>
              <span>
                <strong className="text-text">{step.title}</strong> — {step.body}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {QUICK_LINKS.map(({ to, icon: Icon, label, detail }) => (
          <Link key={to} to={to}>
            <Card className="h-full transition-colors hover:border-primary/50">
              <Icon className="text-indigo-300" size={22} />
              <div className="mt-3 text-sm font-semibold text-text">{label}</div>
              <div className="mt-1 text-xs text-muted">{detail}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-center">
        <Link to="/map">
          <Button size="lg">Start with Most Asked topics</Button>
        </Link>
      </div>
    </div>
  );
}

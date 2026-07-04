import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  MessageCircleQuestion,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, DifficultyBadge } from "@/components/ui/Badge";
import { Whiteboard } from "@/components/interview/Whiteboard";
import { SolutionBuilder } from "@/components/problem/SolutionBuilder";
import { problems, type Problem } from "@/data/problems";
import { loadProblemContent, type ProblemContent } from "@/data/problemContent";
import { useXP } from "@/hooks/useXP";

const TIER_WEIGHT: Record<Problem["tier"], number> = { "most-asked": 3, advanced: 2, expert: 1 };

function pickWeightedProblem(): Problem {
  const pool = problems.flatMap((p) => Array(TIER_WEIGHT[p.tier]).fill(p));
  return pool[Math.floor(Math.random() * pool.length)];
}

const CHECKLIST_ITEMS = [
  "Clarified functional requirements",
  "Clarified non-functional requirements / scale",
  "Estimated capacity (QPS, storage)",
  "Sketched a high-level architecture",
  "Discussed the data model",
  "Discussed at least one tradeoff or bottleneck",
];

const INTERVIEWER_PROMPTS = [
  "What are your assumptions about scale — how many users, how much traffic?",
  "How would you estimate the storage and bandwidth this system needs?",
  "What database would you choose here, and why?",
  "Where's the single point of failure in your design, and how would you remove it?",
  "What tradeoffs are you making, and what would you do differently at 10x the scale?",
];

type Phase = "setup" | "active" | "ended";

export function InterviewSimulation() {
  const { addXP, XP_REWARDS } = useXP();
  const [phase, setPhase] = useState<Phase>("setup");
  const [problem, setProblem] = useState<Problem>(() => pickWeightedProblem());
  const [durationMin, setDurationMin] = useState(45);
  const [secondsLeft, setSecondsLeft] = useState(45 * 60);
  const [checked, setChecked] = useState<boolean[]>(Array(CHECKLIST_ITEMS.length).fill(false));
  const [promptsShown, setPromptsShown] = useState<number[]>([]);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [endedEarly, setEndedEarly] = useState(false);
  const xpAwarded = useRef(false);

  const totalSeconds = durationMin * 60;
  const elapsedSeconds = totalSeconds - secondsLeft;

  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setEndedEarly(false);
          setPhase("ended");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "active") return;
    const checkpoints = [0.25, 0.5, 0.75];
    const elapsedFrac = elapsedSeconds / totalSeconds;
    checkpoints.forEach((cp, i) => {
      if (elapsedFrac >= cp && !promptsShown.includes(i)) {
        setPromptsShown((prev) => [...prev, i]);
        setActivePrompt(INTERVIEWER_PROMPTS[i % INTERVIEWER_PROMPTS.length]);
      }
    });
  }, [elapsedSeconds, totalSeconds, phase, promptsShown]);

  useEffect(() => {
    if (phase === "ended" && !xpAwarded.current) {
      xpAwarded.current = true;
      addXP(XP_REWARDS.interviewSimulation);
    }
  }, [phase, addXP, XP_REWARDS]);

  const score = useMemo(() => {
    const covered = checked.filter(Boolean).length;
    return Math.round((covered / CHECKLIST_ITEMS.length) * 100);
  }, [checked]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeLow = secondsLeft < 300;

  function startInterview() {
    setSecondsLeft(durationMin * 60);
    setChecked(Array(CHECKLIST_ITEMS.length).fill(false));
    setPromptsShown([]);
    setActivePrompt(null);
    xpAwarded.current = false;
    setPhase("active");
  }

  function endInterview() {
    setEndedEarly(true);
    setPhase("ended");
  }

  function restart() {
    setProblem(pickWeightedProblem());
    setPhase("setup");
  }

  const [content, setContent] = useState<ProblemContent | undefined>(undefined);
  useEffect(() => {
    if (phase !== "ended") return;
    let cancelled = false;
    loadProblemContent(problem.slug)?.then((c) => {
      if (!cancelled) setContent(c);
    });
    return () => {
      cancelled = true;
    };
  }, [phase, problem.slug]);
  const speedDemon = endedEarly && durationMin >= 45 && elapsedSeconds < 30 * 60;

  if (phase === "setup") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-2xl space-y-6"
      >
        <div>
          <h1 className="text-2xl font-semibold text-text">Interview Simulation</h1>
          <p className="mt-1 text-sm text-muted">
            A random problem, a countdown timer, and a whiteboard — as close to the real thing as it gets.
          </p>
        </div>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-text">Today's problem</div>
            <Button size="sm" variant="secondary" icon={<Shuffle size={14} />} onClick={() => setProblem(pickWeightedProblem())}>
              Reshuffle
            </Button>
          </div>
          <DifficultyBadge tier={problem.tier} />
          <div className="mt-2 text-lg font-semibold text-text">{problem.title}</div>
          <div className="text-xs text-muted">{problem.company}</div>
        </Card>

        <Card>
          <div className="mb-3 text-sm font-semibold text-text">Time limit</div>
          <div className="flex gap-2">
            {[30, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => setDurationMin(m)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                  durationMin === m ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </Card>

        <Button size="lg" onClick={startInterview} className="w-full">
          Start interview
        </Button>
      </motion.div>
    );
  }

  if (phase === "active") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-5xl space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <DifficultyBadge tier={problem.tier} />
            <h1 className="mt-1 text-xl font-semibold text-text">{problem.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={timeLow ? "danger" : "primary"} icon={<Clock size={12} />}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </Badge>
            <Button size="sm" variant="danger" onClick={endInterview}>
              End interview
            </Button>
          </div>
        </div>

        {activePrompt && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-warning/40 bg-warning/5">
              <div className="flex items-start gap-2">
                <MessageCircleQuestion size={16} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <div className="text-xs font-semibold text-warning">Interviewer asks</div>
                  <p className="mt-1 text-sm text-text">{activePrompt}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Whiteboard />
          </div>
          <Card>
            <div className="mb-2 text-sm font-semibold text-text">Self-check as you go</div>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item, i) => (
                <button
                  key={item}
                  onClick={() =>
                    setChecked((prev) => prev.map((c, idx) => (idx === i ? !c : c)))
                  }
                  className="flex w-full items-start gap-2 text-left text-xs text-muted hover:text-text"
                >
                  {checked[i] ? (
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />
                  ) : (
                    <Circle size={14} className="mt-0.5 shrink-0" />
                  )}
                  {item}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div className="text-center">
        <Trophy size={32} className="mx-auto text-warning" />
        <h1 className="mt-2 text-2xl font-semibold text-text">Interview complete</h1>
        <p className="mt-1 text-sm text-muted">{problem.title}</p>
      </div>

      <Card className="text-center">
        <div className="text-4xl font-bold text-indigo-300">{score}%</div>
        <div className="mt-1 text-xs text-muted">components covered</div>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Badge tone="primary" icon={<Sparkles size={12} />}>
            +{XP_REWARDS.interviewSimulation} XP
          </Badge>
          {speedDemon && <Badge tone="success">⚡ Speed Demon — finished early</Badge>}
        </div>
      </Card>

      <Card>
        <div className="mb-2 text-sm font-semibold text-text">What you covered</div>
        <ul className="space-y-1.5 text-sm">
          {CHECKLIST_ITEMS.map((item, i) => (
            <li key={item} className={`flex items-center gap-2 ${checked[i] ? "text-success" : "text-muted"}`}>
              {checked[i] ? <CheckCircle2 size={14} /> : <Circle size={14} />}
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Replay: model answer</div>
        {content ? (
          <SolutionBuilder steps={content.solutionSteps} nodes={content.diagramNodes} edges={content.diagramEdges} />
        ) : (
          <p className="text-sm text-muted">
            A full model-answer walkthrough isn't built for this problem yet — check the problem's own
            page under System Design for what's available.
          </p>
        )}
      </Card>

      <Button size="lg" variant="secondary" icon={<RotateCcw size={14} />} onClick={restart} className="w-full">
        Try another problem
      </Button>
    </motion.div>
  );
}

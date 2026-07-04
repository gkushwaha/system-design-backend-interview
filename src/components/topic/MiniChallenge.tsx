import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { ChallengeQuestion } from "@/data/topicContent/types";

interface MiniChallengeProps {
  questions: ChallengeQuestion[];
  isComplete: boolean;
  xpReward: number;
  onComplete: () => void;
}

export function MiniChallenge({ questions, isComplete, xpReward, onComplete }: MiniChallengeProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);

  const question = questions[index];
  const isCorrect = selected === question.correctIndex;
  const isLast = index === questions.length - 1;

  function selectOption(i: number) {
    if (revealed && isCorrect) return;
    setSelected(i);
    setRevealed(true);
    if (i === question.correctIndex) {
      const newSolved = solvedCount + 1;
      setSolvedCount(newSolved);
      if (isLast && newSolved === questions.length) {
        // Delay onComplete so the "Correct!" feedback for the final question is
        // actually visible before the parent flips `isComplete` and this component
        // swaps to the "Challenge complete!" screen (BUG-004).
        setTimeout(onComplete, 900);
      }
    }
  }

  function next() {
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (isComplete) {
    return (
      <Card className="border-success/40 bg-success/5 text-center">
        <Trophy size={28} className="mx-auto text-success" />
        <div className="mt-2 text-sm font-semibold text-text">Challenge complete!</div>
        <p className="mt-1 text-xs text-muted">You've mastered this topic.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-muted font-mono">
        <span>
          Question {index + 1} / {questions.length}
        </span>
        <span>+{xpReward} XP on completion</span>
      </div>

      <Card>
        <p className="text-sm font-medium text-text">{question.question}</p>
        <div className="mt-4 space-y-2">
          {question.options.map((opt, i) => {
            const showCorrect = revealed && i === question.correctIndex;
            const showWrong = revealed && i === selected && i !== question.correctIndex;
            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                disabled={revealed && isCorrect}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors",
                  showCorrect && "border-success/60 bg-success/10 text-success",
                  showWrong && "border-danger/60 bg-danger/10 text-danger",
                  !showCorrect && !showWrong && "border-border bg-white/[0.02] text-text hover:border-primary/40",
                )}
              >
                {opt}
                {showCorrect && <Check size={16} />}
                {showWrong && <X size={16} />}
              </button>
            );
          })}
        </div>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "mt-4 rounded-lg border p-3 text-xs",
              isCorrect ? "border-success/30 bg-success/5 text-success" : "border-danger/30 bg-danger/5 text-danger",
            )}
          >
            {isCorrect ? "Correct! " : "Not quite. "}
            {question.explanation}
          </motion.div>
        )}

        {revealed && isCorrect && !isLast && (
          <Button className="mt-4" size="sm" onClick={next}>
            Next question
          </Button>
        )}
      </Card>
    </div>
  );
}

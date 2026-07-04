import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { HowItWorksStep } from "@/data/topicContent/types";

export function HowItWorksStepper({ steps }: { steps: HowItWorksStep[] }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted",
            )}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <div className="mb-1 font-mono text-xs text-indigo-300">
              Step {index + 1} / {steps.length}
            </div>
            <h3 className="text-base font-semibold text-text">{step.title}</h3>
            <p className="mt-2 text-sm text-muted">{step.description}</p>
            {step.code && (
              <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-black/40 p-4 font-mono text-xs text-text">
                <code>{step.code}</code>
              </pre>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          icon={<ChevronLeft size={14} />}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={index === steps.length - 1}
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

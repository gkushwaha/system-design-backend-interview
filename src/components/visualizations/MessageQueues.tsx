import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Server, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function MessageQueues() {
  const [queueEnabled, setQueueEnabled] = useState(true);
  const [queueDepth, setQueueDepth] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [processed, setProcessed] = useState(0);
  const processingRef = useRef(false);

  function processNext() {
    if (processingRef.current) return;
    processingRef.current = true;
    setTimeout(() => {
      setQueueDepth((d) => {
        if (d > 0) {
          setProcessed((p) => p + 1);
          return d - 1;
        }
        return d;
      });
      processingRef.current = false;
      setQueueDepth((d) => {
        if (d > 0) setTimeout(processNext, 0);
        return d;
      });
    }, 700);
  }

  function produceBurst() {
    const burst = 10;
    if (queueEnabled) {
      setQueueDepth((d) => d + burst);
      setTimeout(processNext, 0);
    } else {
      // no queue: consumer can only take ~2 before overload, rest dropped
      const capacity = 2;
      setProcessed((p) => p + capacity);
      setDropped((d) => d + (burst - capacity));
    }
  }

  function reset() {
    setQueueDepth(0);
    setDropped(0);
    setProcessed(0);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Producer → Queue → Consumer</div>
          <button
            onClick={() => {
              setQueueEnabled((q) => !q);
              reset();
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              queueEnabled ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger",
            )}
          >
            Queue: {queueEnabled ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-1 text-indigo-300">
            <Server size={22} />
            <span className="text-xs text-muted">Fast producer</span>
          </div>

          <div className="flex flex-1 items-center justify-center">
            {queueEnabled ? (
              <div className="flex items-center gap-1">
                <AnimatePresence>
                  {Array.from({ length: Math.min(queueDepth, 12) }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-8 w-6 items-center justify-center rounded bg-primary/20 text-indigo-300"
                    >
                      <Package size={12} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {queueDepth > 12 && <span className="ml-1 text-xs text-muted">+{queueDepth - 12}</span>}
              </div>
            ) : (
              <span className="text-xs text-danger">no buffer — direct connection</span>
            )}
          </div>

          <div className="flex flex-col items-center gap-1 text-muted">
            <User size={22} />
            <span className="text-xs">Slow consumer</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={produceBurst}>
            Produce burst of 10
          </Button>
          <Button size="sm" variant="secondary" onClick={reset}>
            Reset
          </Button>
        </div>

        <div className="mt-3 flex gap-4 text-xs">
          <Badge tone="success">Processed: {processed}</Badge>
          {queueEnabled && <Badge tone="primary">Queued: {queueDepth}</Badge>}
          {!queueEnabled && dropped > 0 && <Badge tone="danger">Dropped: {dropped}</Badge>}
        </div>
        <p className="mt-2 text-xs text-muted">
          {queueEnabled
            ? "The queue absorbs the burst — the consumer drains it at its own pace, nothing is lost."
            : "Without a buffer, the slow consumer can't keep up and excess messages are simply dropped."}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">Kafka — append-only log</div>
          <div className="flex gap-1 overflow-x-auto rounded-md border border-border bg-black/30 p-2">
            {[0, 1, 2, 3, 4, 5].map((offset) => (
              <div key={offset} className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/15 font-mono text-[10px] text-indigo-300">
                {offset}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            Messages are appended to a partition log with an offset. Consumers track their own offset —
            multiple consumer groups can re-read the same log independently.
          </p>
        </Card>
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">SQS — visibility timeout</div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-black/30 p-3">
            <Package size={16} className="text-warning" />
            <span className="text-xs text-muted">
              Message hidden for 30s while a consumer processes it — reappears automatically if not deleted in time.
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            No offsets — once a message is deleted (acknowledged), it's gone. If the consumer crashes
            before deleting it, it becomes visible again for another consumer to retry.
          </p>
        </Card>
      </div>
    </div>
  );
}

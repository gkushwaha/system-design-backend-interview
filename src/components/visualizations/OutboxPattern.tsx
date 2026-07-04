import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Database, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function OutboxPattern() {
  const [naiveState, setNaiveState] = useState<"idle" | "db-ok-mq-fail" | "done">("idle");
  const [outboxState, setOutboxState] = useState<"idle" | "written" | "relayed">("idle");

  function runNaive() {
    setNaiveState("db-ok-mq-fail");
  }

  function runOutbox() {
    setOutboxState("written");
    setTimeout(() => setOutboxState("relayed"), 1200);
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-danger/30">
          <div className="mb-2 text-sm font-semibold text-text">Naive dual write</div>
          <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-white/[0.02] p-4">
            <div className="flex flex-col items-center gap-1">
              <Database size={20} className="text-success" />
              <span className="text-[10px] text-muted">DB write</span>
              {naiveState !== "idle" && <CheckCircle2 size={12} className="text-success" />}
            </div>
            <span className="text-muted">+</span>
            <div className="flex flex-col items-center gap-1">
              <Send size={20} className={naiveState === "db-ok-mq-fail" ? "text-danger" : "text-muted"} />
              <span className="text-[10px] text-muted">Publish event</span>
              {naiveState === "db-ok-mq-fail" && <AlertTriangle size={12} className="text-danger" />}
            </div>
          </div>
          <Button size="sm" className="mt-3" onClick={runNaive}>
            Simulate order creation
          </Button>
          {naiveState === "db-ok-mq-fail" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-danger">
              The DB write committed, but the message broker call failed (network blip, broker down).
              The order exists — but no downstream service was ever notified. Silent data loss.
            </motion.p>
          )}
        </Card>

        <Card className="border-success/30">
          <div className="mb-2 text-sm font-semibold text-text">Transactional outbox</div>
          <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-white/[0.02] p-4">
            <div className="flex flex-col items-center gap-1">
              <Database size={20} className="text-success" />
              <span className="text-[10px] text-muted">DB + outbox row</span>
              {outboxState !== "idle" && <CheckCircle2 size={12} className="text-success" />}
            </div>
            <span className="text-muted">→</span>
            <div className="flex flex-col items-center gap-1">
              <Send size={20} className={outboxState === "relayed" ? "text-success" : "text-muted"} />
              <span className="text-[10px] text-muted">Relay publishes</span>
              <AnimatePresence>
                {outboxState === "relayed" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <CheckCircle2 size={12} className="text-success" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <Button size="sm" className="mt-3" onClick={runOutbox}>
            Simulate order creation
          </Button>
          {outboxState !== "idle" && (
            <div className="mt-3 space-y-1 text-xs">
              <Badge tone={outboxState === "relayed" ? "success" : "warning"}>
                {outboxState === "relayed" ? "Event relayed successfully" : "Order + outbox row written atomically…"}
              </Badge>
              <p className="text-muted">
                The order and an 'OrderCreated' outbox row are written in the <em>same</em> database
                transaction — so they either both happen or neither does. A separate relay process
                then reads unpublished outbox rows and publishes them, retrying until it succeeds.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

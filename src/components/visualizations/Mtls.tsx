import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, Server, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const STEPS = [
  "Service A initiates a connection and presents its client certificate.",
  "Service B verifies Service A's certificate against a trusted CA.",
  "Service B presents its own server certificate back to Service A.",
  "Service A verifies Service B's certificate against the same trusted CA.",
  "Both sides are now mutually authenticated — an encrypted channel is established.",
];

export function Mtls() {
  const [step, setStep] = useState(0);
  const [mtlsEnabled, setMtlsEnabled] = useState(true);
  const [rogueResult, setRogueResult] = useState<"blocked" | "allowed" | null>(null);

  function tryRogueConnection() {
    setRogueResult(mtlsEnabled ? "blocked" : "allowed");
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 text-sm font-semibold text-text">mTLS handshake between two services</div>
        <div className="flex items-center justify-center gap-8 rounded-lg border border-border bg-white/[0.02] p-6">
          <div className="flex flex-col items-center gap-1">
            <Server size={24} className="text-indigo-300" />
            <span className="text-xs text-muted">Service A</span>
          </div>
          <div className="relative h-1 w-32 bg-border">
            <motion.div
              key={step}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className="h-full origin-left bg-primary"
            />
          </div>
          <div className="flex flex-col items-center gap-1">
            <Server size={24} className="text-success" />
            <span className="text-xs text-muted">Service B</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-primary" : "w-1.5 bg-border")}
            />
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-border bg-white/[0.02] p-3 text-xs text-muted">
          Step {step + 1}: {STEPS[step]}
        </div>
        <div className="mt-3 flex justify-between">
          <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Prev
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}>
            Next
          </Button>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">A service with no valid certificate tries to connect</div>
          <button
            onClick={() => {
              setMtlsEnabled((m) => !m);
              setRogueResult(null);
            }}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              mtlsEnabled ? "border-success/40 bg-success/10 text-success" : "border-danger/40 bg-danger/10 text-danger",
            )}
          >
            mTLS: {mtlsEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <Button size="sm" onClick={tryRogueConnection}>
          Attempt rogue connection
        </Button>
        <AnimatePresence mode="wait">
          {rogueResult && (
            <motion.div
              key={rogueResult}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mt-3 flex items-center gap-2 rounded-lg border p-3 text-xs",
                rogueResult === "blocked" ? "border-success/30 bg-success/5 text-success" : "border-danger/30 bg-danger/5 text-danger",
              )}
            >
              {rogueResult === "blocked" ? <ShieldCheck size={14} /> : <Ban size={14} />}
              {rogueResult === "blocked"
                ? "Rejected — no valid client certificate presented, connection refused before any data is exchanged."
                : "Allowed through — without mTLS, network access alone was enough; the service never verified who was calling."}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}

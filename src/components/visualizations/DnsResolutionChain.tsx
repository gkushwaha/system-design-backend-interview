import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Monitor, Server } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NODES = [
  { id: "client", label: "Browser", x: 6 },
  { id: "resolver", label: "Recursive Resolver", x: 27 },
  { id: "root", label: "Root Server", x: 48 },
  { id: "tld", label: ".com TLD Server", x: 69 },
  { id: "auth", label: "Authoritative NS", x: 92 },
];

const STEPS_UNCACHED = [
  { caption: "Browser checks its own DNS cache first — empty this time.", highlight: ["client"] },
  { caption: "Query goes to the recursive resolver (e.g. your ISP or 8.8.8.8) — it has no cached answer either.", highlight: ["client", "resolver"] },
  { caption: "Resolver asks a root server: 'who handles .com?'", highlight: ["resolver", "root"] },
  { caption: "Root server refers the resolver to the .com TLD server.", highlight: ["resolver", "tld"] },
  { caption: "TLD server refers the resolver to example.com's authoritative name server.", highlight: ["resolver", "auth"] },
  { caption: "Authoritative server returns the actual IP address for example.com.", highlight: ["auth", "resolver"] },
  { caption: "Resolver caches the result and returns the IP to the browser, which opens a TCP connection.", highlight: ["resolver", "client"] },
];

const STEPS_CACHED = [
  { caption: "Browser checks its own DNS cache — empty.", highlight: ["client"] },
  { caption: "Resolver already has this domain cached from a recent lookup — it returns the IP immediately, skipping root/TLD/authoritative entirely.", highlight: ["client", "resolver"] },
];

export function DnsResolutionChain() {
  const [cached, setCached] = useState(false);
  const [index, setIndex] = useState(0);
  const steps = cached ? STEPS_CACHED : STEPS_UNCACHED;
  const step = steps[Math.min(index, steps.length - 1)];

  function toggleCached() {
    setCached((c) => !c);
    setIndex(0);
  }

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">DNS lookup for example.com</div>
          <button
            onClick={toggleCached}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              cached ? "border-success/40 bg-success/10 text-success" : "border-border text-muted",
            )}
          >
            Resolver cache: {cached ? "HIT" : "MISS"}
          </button>
        </div>

        <div className="relative h-28 w-full">
          <svg className="absolute inset-0 h-full w-full">
            {NODES.slice(0, -1).map((n, i) => (
              <line
                key={n.id}
                x1={`${n.x}%`}
                y1="50%"
                x2={`${NODES[i + 1].x}%`}
                y2="50%"
                stroke="var(--color-border)"
                strokeWidth={1.5}
              />
            ))}
          </svg>
          {NODES.map((n) => {
            const active = step.highlight.includes(n.id);
            const Icon = n.id === "client" ? Monitor : n.id === "resolver" ? Globe : Server;
            return (
              <div
                key={n.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{ left: `${n.x}%`, top: "50%" }}
              >
                <motion.div
                  animate={{
                    scale: active ? 1.15 : 1,
                    borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                  }}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-lg border-2 bg-white/[0.02]",
                    active ? "text-indigo-300" : "text-muted",
                  )}
                >
                  <Icon size={18} />
                </motion.div>
                <span className="w-20 text-center text-[9px] text-muted">{n.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary" : "w-1.5 bg-border")}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={index + (cached ? "c" : "u")} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="mb-1 font-mono text-xs text-indigo-300">
              Step {index + 1} / {steps.length}
            </div>
            <p className="text-sm text-muted">{step.caption}</p>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Prev
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))} disabled={index === steps.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
}

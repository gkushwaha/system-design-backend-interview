import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Monitor, Server, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface FlowStep {
  caption: string;
  activeEdge: string | null;
}

const STEPS: FlowStep[] = [
  { caption: "User clicks 'Sign in with Google' in the client app.", activeEdge: "user-client" },
  { caption: "The client redirects the user's browser to Google's authorization server.", activeEdge: "client-auth" },
  { caption: "The user logs in and approves the requested permissions (scopes).", activeEdge: "user-auth" },
  { caption: "Google redirects back to the client with a short-lived authorization code.", activeEdge: "auth-client" },
  { caption: "The client's backend exchanges the code (plus its client secret) for tokens — server-to-server, never exposed to the browser.", activeEdge: "client-auth-token" },
  { caption: "The client calls the resource API, presenting the access token / JWT as proof of identity.", activeEdge: "client-api" },
];

const NODE_POS = {
  user: { x: 10, y: 50, label: "User Browser", icon: Monitor },
  client: { x: 40, y: 25, label: "Client App", icon: Server },
  auth: { x: 70, y: 25, label: "Auth Server (Google)", icon: ShieldCheck },
  api: { x: 90, y: 75, label: "Resource API", icon: KeyRound },
};

export function JwtOauth2() {
  const [index, setIndex] = useState(0);
  const step = STEPS[index];

  return (
    <div className="space-y-5">
      <Card>
        <div className="relative h-64 w-full rounded-lg border border-border bg-white/[0.02]">
          <svg className="absolute inset-0 h-full w-full">
            <line x1="10%" y1="50%" x2="40%" y2="25%" stroke="var(--color-border)" strokeWidth={1.5} />
            <line x1="40%" y1="25%" x2="70%" y2="25%" stroke="var(--color-border)" strokeWidth={1.5} />
            <line x1="10%" y1="50%" x2="70%" y2="25%" stroke="var(--color-border)" strokeWidth={1.5} strokeDasharray="3 3" />
            <line x1="40%" y1="25%" x2="90%" y2="75%" stroke="var(--color-border)" strokeWidth={1.5} />
          </svg>
          {Object.entries(NODE_POS).map(([key, node]) => {
            const Icon = node.icon;
            return (
              <div
                key={key}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-indigo-300">
                  <Icon size={18} />
                </div>
                <span className="w-20 text-center text-[9px] text-muted">{node.label}</span>
              </div>
            );
          })}
          <AnimatePresence>
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute h-3 w-3 rounded-full bg-warning shadow-[0_0_10px_3px_rgba(245,158,11,0.5)]"
              style={
                step.activeEdge === "user-client"
                  ? { left: "25%", top: "37%" }
                  : step.activeEdge === "client-auth"
                    ? { left: "55%", top: "25%" }
                    : step.activeEdge === "user-auth"
                      ? { left: "40%", top: "37%" }
                      : step.activeEdge === "auth-client"
                        ? { left: "55%", top: "25%" }
                        : step.activeEdge === "client-auth-token"
                          ? { left: "55%", top: "25%" }
                          : { left: "65%", top: "50%" }
              }
            />
          </AnimatePresence>
        </div>
      </Card>

      <div className="flex items-center justify-center gap-2">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-primary" : "w-1.5 bg-border")}
          />
        ))}
      </div>

      <Card>
        <div className="mb-1 font-mono text-xs text-indigo-300">Step {index + 1} / {STEPS.length}</div>
        <p className="text-sm text-muted">{step.caption}</p>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
          Prev
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setIndex((i) => Math.min(STEPS.length - 1, i + 1))} disabled={index === STEPS.length - 1}>
          Next
        </Button>
      </div>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">JWT anatomy</div>
        <div className="overflow-x-auto rounded-lg border border-border bg-black/30 p-3 font-mono text-xs">
          <span className="text-danger">eyJhbGciOiJIUzI1NiJ9</span>
          <span className="text-muted">.</span>
          <span className="text-indigo-300">eyJzdWIiOiIxMjM0IiwibmFtZSI6IkFkYSJ9</span>
          <span className="text-muted">.</span>
          <span className="text-success">4f2a1c9b8e...</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs">
          <span className="text-danger">Header: algorithm + token type</span>
          <span className="text-indigo-300">Payload: claims (user id, expiry, scopes)</span>
          <span className="text-success">Signature: verifies it wasn't tampered with</span>
        </div>
      </Card>
    </div>
  );
}

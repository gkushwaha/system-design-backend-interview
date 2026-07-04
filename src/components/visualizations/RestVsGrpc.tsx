import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type StreamMode = "unary" | "server" | "client" | "bidi";

const MODES: { id: StreamMode; label: string; client: number; server: number }[] = [
  { id: "unary", label: "Unary", client: 1, server: 1 },
  { id: "server", label: "Server streaming", client: 1, server: 4 },
  { id: "client", label: "Client streaming", client: 4, server: 1 },
  { id: "bidi", label: "Bidirectional", client: 3, server: 3 },
];

const sizeData = [
  { name: "JSON (REST)", bytes: 142 },
  { name: "Protobuf (gRPC)", bytes: 48 },
];

export function RestVsGrpc() {
  const [mode, setMode] = useState<StreamMode>("unary");
  const current = MODES.find((m) => m.id === mode)!;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">REST — JSON over HTTP/1.1</div>
          <pre className="overflow-x-auto rounded-md border border-border bg-black/40 p-3 font-mono text-xs text-text">
{`{
  "userId": 42,
  "name": "Ada Lovelace",
  "active": true
}`}
          </pre>
          <p className="mt-2 font-mono text-xs text-muted">~142 bytes, human-readable</p>
        </Card>
        <Card>
          <div className="mb-2 text-sm font-semibold text-text">gRPC — Protobuf over HTTP/2</div>
          <div className="overflow-x-auto rounded-md border border-border bg-black/40 p-3 font-mono text-xs text-indigo-300">
            0x08 2A 12 0C 41 64 61 20 4C 6F 76 65 6C 61 63 65 18 01
          </div>
          <p className="mt-2 font-mono text-xs text-muted">~48 bytes, compact binary encoding</p>
        </Card>
      </div>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">Payload size comparison</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={sizeData} layout="vertical">
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" stroke="var(--color-muted)" fontSize={11} unit="B" />
            <YAxis type="category" dataKey="name" stroke="var(--color-muted)" fontSize={11} width={110} />
            <Tooltip contentStyle={{ background: "#13131a", border: "1px solid #1e1e2e", fontSize: 12 }} />
            <Bar dataKey="bytes" fill="#6366f1" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <div className="mb-3 text-sm font-semibold text-text">gRPC streaming modes</div>
        <div className="mb-4 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                mode === m.id ? "border-primary/50 bg-primary/15 text-indigo-300" : "border-border text-muted hover:text-text",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.02] p-6">
          <span className="text-xs text-muted">Client</span>
          <div className="relative h-10 flex-1">
            <AnimatePresence mode="popLayout">
              {Array.from({ length: current.client }).map((_, i) => (
                <motion.div
                  key={`c-${mode}-${i}`}
                  initial={{ left: "0%", opacity: 0 }}
                  animate={{ left: "100%", opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.25, repeat: Infinity, repeatDelay: 0.6 }}
                  className="absolute top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary"
                />
              ))}
            </AnimatePresence>
          </div>
          <span className="text-xs text-muted">Server</span>
          <div className="relative h-10 flex-1">
            <AnimatePresence mode="popLayout">
              {Array.from({ length: current.server }).map((_, i) => (
                <motion.div
                  key={`s-${mode}-${i}`}
                  initial={{ left: "100%", opacity: 0 }}
                  animate={{ left: "0%", opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.25 + 0.3, repeat: Infinity, repeatDelay: 0.6 }}
                  className="absolute bottom-2 h-2 w-2 -translate-x-1/2 rounded-full bg-success"
                />
              ))}
            </AnimatePresence>
          </div>
          <span className="text-xs text-muted">Client</span>
        </div>
        <p className="mt-2 text-xs text-muted">
          {mode === "unary" && "One request, one response — like a typical REST call."}
          {mode === "server" && "One request, a stream of responses — e.g. subscribing to live price updates."}
          {mode === "client" && "A stream of requests, one final response — e.g. uploading chunks of a large file."}
          {mode === "bidi" && "Both sides stream simultaneously — e.g. a real-time chat or collaborative editor."}
        </p>
      </Card>
    </div>
  );
}

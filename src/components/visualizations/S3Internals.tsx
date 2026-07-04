import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, File, RotateCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const PART_COUNT = 6;

type PartState = "idle" | "uploading" | "done" | "failed";

export function S3Internals() {
  const [parts, setParts] = useState<PartState[]>(Array(PART_COUNT).fill("idle"));
  const [assembled, setAssembled] = useState(false);

  function startUpload() {
    setAssembled(false);
    const failIdx = 2; // deliberately fail part 3 for the demo
    setParts(Array(PART_COUNT).fill("uploading"));
    parts.forEach((_, i) => {
      setTimeout(() => {
        setParts((prev) => {
          const next = [...prev];
          next[i] = i === failIdx ? "failed" : "done";
          return next;
        });
      }, 500 + i * 250);
    });
  }

  function retryPart(i: number) {
    setParts((prev) => {
      const next = [...prev];
      next[i] = "uploading";
      return next;
    });
    setTimeout(() => {
      setParts((prev) => {
        const next = [...prev];
        next[i] = "done";
        return next;
      });
    }, 700);
  }

  const allDone = parts.every((p) => p === "done");

  return (
    <div className="space-y-5">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Multipart upload — 6 parts in parallel</div>
          <Button size="sm" onClick={startUpload}>
            Start upload
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {parts.map((state, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-white/[0.02] p-2">
              <span className="text-[9px] text-muted">Part {i + 1}</span>
              <motion.div
                animate={{
                  backgroundColor:
                    state === "done" ? "rgba(34,197,94,0.2)" : state === "failed" ? "rgba(239,68,68,0.2)" : "rgba(99,102,241,0.15)",
                }}
                className="flex h-9 w-9 items-center justify-center rounded"
              >
                {state === "done" && <CheckCircle2 size={16} className="text-success" />}
                {state === "failed" && <RotateCw size={16} className="text-danger" />}
                {state === "uploading" && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent"
                  />
                )}
                {state === "idle" && <span className="h-2 w-2 rounded-full bg-border" />}
              </motion.div>
              {state === "failed" && (
                <Button size="sm" variant="secondary" onClick={() => retryPart(i)}>
                  Retry
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button size="sm" disabled={!allDone} onClick={() => setAssembled(true)}>
            Complete multipart upload
          </Button>
          {assembled && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
              <File size={18} className="text-success" />
              <Badge tone="success">Object assembled</Badge>
            </motion.div>
          )}
        </div>
        <p className="mt-3 text-xs text-muted">
          Only the failed part needs to be retried — not the whole file. This is why multipart upload
          is standard for large objects (video, backups): parallelism plus cheap partial retry.
        </p>
      </Card>

      <Card>
        <div className="mb-2 text-sm font-semibold text-text">Consistency model</div>
        <p className="text-xs text-muted">
          Since December 2020, S3 provides <strong className="text-text">strong read-after-write consistency</strong>{" "}
          for all operations — a read immediately after a PUT or DELETE always reflects the latest state.
          Before that, overwrite/delete operations were only eventually consistent, which is worth
          knowing since it's still commonly asked about historically.
        </p>
      </Card>
    </div>
  );
}

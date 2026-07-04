import { LambdaVsKappa } from "@/components/visualizations/LambdaVsKappa";
import type { TopicContent } from "./types";

export const lambdaVsKappa: TopicContent = {
  visual: LambdaVsKappa,
  howItWorks: [
    {
      title: "Lambda: two parallel pipelines",
      description:
        "Lambda architecture runs a batch layer (reprocesses all historical data periodically, slow but fully correct) alongside a speed layer (processes only recent data in real time, fast but approximate).",
    },
    {
      title: "Lambda: merge at the serving layer",
      description:
        "The serving layer combines the batch layer's accurate historical view with the speed layer's low-latency recent view, giving users both freshness and eventual correctness.",
    },
    {
      title: "Lambda's core criticism: maintaining two codebases",
      description:
        "The batch and speed layers usually implement similar logic in two different systems/languages (e.g. Spark for batch, Flink for streaming) — keeping them consistent as business logic evolves is a real operational burden.",
    },
    {
      title: "Kappa: a single stream processing pipeline",
      description:
        "Kappa architecture treats everything as a stream — even 'batch' processing is just replaying the durable log from the beginning through the same stream processing code, eliminating the second pipeline entirely.",
      code: "// reprocessing in Kappa = replay from offset 0 through updated logic\nconsumer.seekToBeginning()\nconsumer.poll() // reprocesses full history through the current code",
    },
    {
      title: "Kappa's requirement: a durable, replayable log",
      description:
        "Kappa only works if the underlying log (Kafka, etc.) retains history long enough to replay — this shifts complexity from 'maintain two pipelines' to 'manage long log retention and fast replay.'",
    },
  ],
  tradeoffs: {
    pros: [
      "Lambda: batch layer gives strong correctness guarantees even if the speed layer has bugs or approximations",
      "Kappa: single codebase to maintain, avoiding logic drift between batch and speed implementations",
    ],
    cons: [
      "Lambda: real operational cost of building and keeping two pipelines' logic consistent",
      "Kappa: requires the log to retain enough history to replay, and reprocessing large histories can still be slow",
    ],
    whenToUse: [
      "Lambda — when you need battle-tested strong correctness guarantees and can afford the dual-pipeline maintenance cost",
      "Kappa — when your processing logic can be expressed as a single stream, and you want to minimize architectural complexity",
    ],
    whenNotToUse: [
      "Kappa when the required historical replay window is enormous and reprocessing it fast enough on demand isn't feasible",
      "Lambda for simple pipelines that don't genuinely need separate real-time and batch correctness paths",
    ],
    alternatives: [
      { name: "Micro-batching (Spark Structured Streaming)", note: "Processes small batches frequently, blurring the line between batch and stream" },
      { name: "Materialized views on a stream", note: "Continuously updated views maintained directly by the stream processor, no separate serving layer merge" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd explain Lambda architecture as running two parallel pipelines — a batch layer for slow-but-correct historical processing, and a speed layer for fast-but-approximate real-time results — merged at a serving layer. The main criticism is maintaining consistent logic across two different systems. Kappa architecture simplifies this to a single stream processing pipeline: if business logic changes or a bug needs fixing, you replay the durable log from the beginning through the updated code, rather than maintaining a separate batch system. I'd pick Kappa by default for new systems where the log can be retained and replayed efficiently, and only reach for Lambda if I specifically need the belt-and-suspenders correctness of an independent batch recomputation.",
    mistakes: [
      "Not knowing the core criticism of Lambda (maintaining two codebases with consistent logic)",
      "Not understanding that Kappa's 'reprocessing' is literally replaying the log through updated code, not a separate mechanism",
      "Assuming Kappa has no tradeoffs — long replay windows and retention costs are real",
    ],
    followUps: [
      "How long would you retain data in the log for Kappa architecture to remain viable?",
      "What's a concrete example of a bug that would require reprocessing in each architecture?",
      "How do modern streaming frameworks blur the line between Lambda and Kappa?",
    ],
    redFlags: [
      "Not knowing what the 'speed layer' or 'batch layer' actually do in Lambda",
    ],
  },
  challenge: [
    {
      question: "What is the primary operational criticism of the Lambda architecture?",
      options: [
        "It's too fast",
        "Maintaining consistent logic across two separate pipelines (batch and speed layers) is a real burden",
        "It cannot process real-time data",
        "It requires no storage at all",
      ],
      correctIndex: 1,
      explanation:
        "Because batch and speed layers are typically implemented in different systems, keeping their processing logic consistent as requirements evolve is Lambda's most commonly cited drawback.",
    },
    {
      question: "How does Kappa architecture handle the need to 'reprocess' historical data with updated logic?",
      options: [
        "It maintains a separate batch pipeline just like Lambda",
        "It replays the durable log from the beginning through the current (updated) stream processing code",
        "It cannot reprocess historical data at all",
        "It deletes old data automatically",
      ],
      correctIndex: 1,
      explanation:
        "Kappa treats reprocessing as simply replaying the log from an earlier offset through the same, now-updated, stream processing pipeline — no second batch system required.",
    },
  ],
};

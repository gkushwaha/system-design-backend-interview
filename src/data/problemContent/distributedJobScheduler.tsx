import type { ProblemContent } from "./types";

export const distributedJobScheduler: ProblemContent = {
  requirements: {
    functional: [
      "Schedule one-off jobs to run at a specific time",
      "Schedule recurring jobs via a cron-like expression",
      "Retry failed jobs with backoff, up to a limit",
      "Guarantee a job never runs more than once per scheduled trigger",
    ],
    nonFunctional: [
      "The scheduler itself must be highly available — no single point of failure",
      "Effectively-once execution despite multiple scheduler and worker instances",
      "Scale to millions of scheduled jobs and executions",
      "Gracefully handle worker crashes mid-execution",
    ],
  },
  diagramNodes: [
    { id: "api", label: "Scheduling API", x: 6, y: 50, kind: "server" },
    { id: "jobstore", label: "Job Store (schedule + state)", x: 30, y: 20, kind: "db" },
    { id: "leader", label: "Scheduler Leader (elected)", x: 30, y: 80, kind: "server" },
    { id: "lock", label: "Distributed Lock (Redis/ZK)", x: 58, y: 50, kind: "cache" },
    { id: "workers", label: "Worker Pool", x: 86, y: 20, kind: "server" },
    { id: "dlq", label: "Dead Letter Queue", x: 86, y: 80, kind: "queue" },
  ],
  diagramEdges: [
    { id: "e1", from: "api", to: "jobstore" },
    { id: "e2", from: "jobstore", to: "leader" },
    { id: "e3", from: "leader", to: "lock" },
    { id: "e4", from: "leader", to: "workers" },
    { id: "e5", from: "workers", to: "dlq" },
  ],
  solutionSteps: [
    {
      title: "A job is registered via the scheduling API",
      description:
        "A client registers a job — either a one-off time or a cron expression for recurrence — which is durably stored in the job store along with its current state.",
      revealNodeIds: ["api", "jobstore"],
      revealEdgeIds: ["e1"],
    },
    {
      title: "A leader-elected scheduler polls for due jobs",
      description:
        "Multiple scheduler instances run for availability, but only the current leader (via leader election) actively polls the job store for jobs due to run — avoiding every instance independently triggering the same job.",
      revealNodeIds: ["leader"],
      revealEdgeIds: ["e2"],
    },
    {
      title: "A distributed lock guards each individual execution",
      description:
        "Before dispatching, the scheduler acquires a short-lived distributed lock keyed to that specific job execution — a second layer of protection against duplicate triggering, especially during a leadership handoff.",
      revealNodeIds: ["lock"],
      revealEdgeIds: ["e3"],
    },
    {
      title: "The job is dispatched to a worker pool",
      description:
        "Scheduling (deciding when) is kept separate from execution (doing the work) — a worker pool that scales independently actually runs the job logic.",
      revealNodeIds: ["workers"],
      revealEdgeIds: ["e4"],
    },
    {
      title: "Permanently failing jobs go to a dead-letter queue",
      description:
        "After exhausting a bounded number of retries with backoff, a failing job is routed to a dead-letter queue for investigation, rather than retried forever.",
      revealNodeIds: ["dlq"],
      revealEdgeIds: ["e5"],
    },
  ],
  capacity: {
    inputs: [
      { key: "scheduledJobs", label: "Total scheduled jobs", min: 10_000, max: 10_000_000, step: 10_000, default: 1_000_000, unit: "" },
      { key: "avgRunsPerDay", label: "Avg runs per job per day", min: 1, max: 24, step: 1, default: 4, unit: "" },
    ],
    compute: (v) => {
      const totalExecutionsPerDay = v.scheduledJobs * v.avgRunsPerDay;
      const executionsPerSec = totalExecutionsPerDay / 86_400;
      return [
        { label: "Executions / day", value: (totalExecutionsPerDay / 1e6).toFixed(1) + "M" },
        { label: "Executions / sec (avg)", value: executionsPerSec.toFixed(1) },
        { label: "Scheduled jobs", value: (v.scheduledJobs / 1e6).toFixed(2) + "M" },
      ];
    },
    chartData: (v) => {
      const totalExecutionsPerDay = v.scheduledJobs * v.avgRunsPerDay;
      const executionsPerSec = totalExecutionsPerDay / 86_400;
      return [{ name: "Executions/sec", value: Math.round(executionsPerSec) }];
    },
    chartUnit: "",
  },
  keyDecisions: [
    {
      decision: "Leader election for the active scheduler, with hot standbys",
      why: "Running multiple always-active scheduler instances without coordination would cause every due job to be triggered multiple times; leader election ensures exactly one instance dispatches at a time while still being highly available via failover.",
    },
    {
      decision: "A distributed lock per job execution, on top of leader election",
      why: "Leadership handoff has an inherent brief ambiguity window; a short-lived lock on the specific execution is a second, independent safeguard against duplicate triggering.",
    },
    {
      decision: "Separate scheduling from execution via a worker pool",
      why: "Deciding 'when to run' and actually 'doing the work' have very different scaling needs — decoupling them lets worker capacity scale independently of the scheduling logic.",
    },
    {
      decision: "A dead-letter queue instead of infinite retries",
      why: "A job that fails deterministically (bad input, permanent downstream outage) will never succeed on retry — capping retries and dead-lettering surfaces the failure for human investigation instead of silently looping forever.",
    },
  ],
  commonMistakes: [
    "Running multiple active scheduler instances with no coordination, causing duplicate job triggers",
    "Treating the scheduler as a single point of failure with no failover plan",
    "Retrying a permanently failing job indefinitely instead of dead-lettering it",
    "Conflating 'a job is scheduled' with 'a job is currently executing' as the same state",
  ],
  companyNote: {
    company: "Airbnb (Chronos) / Apache Airflow",
    note: "Production distributed schedulers like Airbnb's Chronos and Apache Airflow use exactly this leader-election-plus-distributed-lock pattern to guarantee jobs fire effectively once, even while running multiple scheduler replicas for availability.",
  },
};

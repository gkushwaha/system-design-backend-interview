import { Crdts } from "@/components/visualizations/Crdts";
import type { TopicContent } from "./types";

export const crdts: TopicContent = {
  visual: Crdts,
  howItWorks: [
    {
      title: "The problem: merging concurrent offline edits",
      description:
        "Two replicas (or two collaborators editing a doc offline) each make changes independently. When they reconnect, how do you merge their changes into one consistent result without a central coordinator or manual conflict resolution?",
    },
    {
      title: "CRDTs guarantee mathematically safe merges",
      description:
        "A Conflict-free Replicated Data Type is designed so that merging any two states — in any order, any number of times — always converges to the same correct result. This comes from the merge operation being commutative, associative, and idempotent.",
    },
    {
      title: "G-Counter: grow-only counter",
      description:
        "Each replica tracks its own slot in a vector and only ever increments its own slot. Merging takes the element-wise maximum across all replicas' vectors — since counts never decrease, this is always safe.",
      code: "merge(vecA, vecB) = { key: max(vecA[key], vecB[key]) for key in allKeys }",
    },
    {
      title: "OR-Set: handling add/remove",
      description:
        "For sets that need both additions and removals, an Observed-Remove Set tags each added element with a unique ID, so a concurrent add and remove of 'the same value' can be resolved deterministically based on which specific tagged instance was removed.",
    },
    {
      title: "The real-world payoff",
      description:
        "This is what lets Google Docs / Figma merge two people's concurrent edits without a central lock, and what lets Redis/Riak-style databases accept writes on multiple nodes during a partition and reconcile automatically afterward.",
    },
  ],
  tradeoffs: {
    pros: [
      "Enables true multi-master writes with automatic, mathematically guaranteed conflict resolution",
      "No central coordinator or locking required — great for offline-first and collaborative apps",
      "Merge order and duplication don't matter — network retries and message reordering are naturally handled",
    ],
    cons: [
      "Only certain data structures have well-known CRDT formulations (counters, sets, sequences, maps) — arbitrary business logic doesn't automatically get this property",
      "Some CRDTs (like sequence CRDTs for collaborative text) carry non-trivial memory overhead (tombstones for deleted elements)",
      "Designing a new CRDT for a novel data structure is genuinely hard and easy to get subtly wrong",
    ],
    whenToUse: [
      "Collaborative editing (documents, whiteboards) needing offline support and automatic merge",
      "Multi-region databases accepting writes in every region without cross-region locking",
    ],
    whenNotToUse: [
      "Data with complex invariants that can't be expressed as commutative/associative merges (e.g. 'balance must never go negative')",
      "Systems that can tolerate a single-leader/strongly-consistent design — CRDTs add complexity that isn't needed if you don't need multi-master writes",
    ],
    alternatives: [
      { name: "Operational Transformation (OT)", note: "Google Docs' original approach — transforms operations to merge, requires a central server to sequence them" },
      { name: "Last-write-wins (LWW)", note: "Much simpler conflict resolution, but silently discards one side's concurrent write" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd reach for CRDTs anywhere I need multiple replicas (or offline clients) to accept writes independently and merge automatically without a central coordinator — a collaborative whiteboard app, or a multi-region database accepting writes in every region. I'd explain the core guarantee: CRDT merges are commutative, associative, and idempotent, so no matter what order updates arrive in, or if they arrive more than once, every replica converges to the same state. For something like a 'like' counter, a simple G-Counter (each replica tracks its own increment slot, merge takes the max) already demonstrates this. For more complex structures like collaborative text, sequence CRDTs solve the same problem with more overhead.",
    mistakes: [
      "Not knowing the three properties (commutative, associative, idempotent) that make a merge function a valid CRDT",
      "Assuming CRDTs can solve any conflict, including ones with real business-logic invariants like non-negative balances",
      "Confusing CRDTs with simple last-write-wins conflict resolution",
    ],
    followUps: [
      "How would you design a CRDT for a shopping cart (add/remove items)?",
      "What's the tradeoff between CRDTs and Operational Transformation for collaborative editing?",
      "Why can't you build a CRDT for 'account balance must never go negative'?",
    ],
    redFlags: [
      "Not knowing what 'commutative' and 'idempotent' mean in this context",
      "Claiming CRDTs eliminate the need to think about conflicts entirely, for any data type",
    ],
  },
  challenge: [
    {
      question: "What three properties must a CRDT's merge function have to guarantee replicas converge correctly?",
      options: [
        "Fast, cheap, and simple",
        "Commutative, associative, and idempotent",
        "Encrypted, compressed, and versioned",
        "Synchronous, blocking, and ordered",
      ],
      correctIndex: 1,
      explanation:
        "These three mathematical properties guarantee that no matter what order merges happen in, or how many times the same merge is repeated, every replica converges to the identical final state.",
    },
    {
      question: "Why does a G-Counter CRDT have each replica increment only its own slot in a vector, rather than a single shared number?",
      options: [
        "It's just a stylistic choice with no real benefit",
        "It makes the merge operation (element-wise max) always safe, since no replica's own slot ever decreases",
        "It reduces memory usage",
        "Shared numbers are not supported by any programming language",
      ],
      correctIndex: 1,
      explanation:
        "By having each replica exclusively own one slot, the merge (taking the max per slot) can never lose an increment or double count one — this is what makes it a valid CRDT.",
    },
  ],
};

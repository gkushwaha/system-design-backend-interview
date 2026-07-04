import { BtreeVsLsm } from "@/components/visualizations/BtreeVsLsm";
import type { TopicContent } from "./types";

export const btreeVsLsm: TopicContent = {
  visual: BtreeVsLsm,
  howItWorks: [
    {
      title: "B-tree: update in place",
      description:
        "A B-tree write finds the correct sorted position on disk and updates that page directly. Reads are excellent (few page hops), but writes require random disk I/O — expensive if pages aren't already cached.",
    },
    {
      title: "LSM-tree: append, don't update",
      description:
        "A write to an LSM-tree first lands in an in-memory memtable — a fast, purely sequential operation with no disk seek at all.",
    },
    {
      title: "Flushing to immutable SSTables",
      description:
        "Once the memtable fills up, it's flushed to disk as a new, immutable, sorted string table (SSTable) file — again, a fast sequential write, never modifying existing files.",
      code: "memtable.flush() → level0/sstable_004.sst  (immutable, sorted)",
    },
    {
      title: "Background compaction merges levels",
      description:
        "Periodically, a background process merges multiple SSTables together, discarding overwritten/deleted keys and producing fewer, larger sorted files at the next level — this is where write amplification comes from.",
    },
    {
      title: "Reads must check multiple places",
      description:
        "A read may need to check the memtable, then each relevant SSTable level (often using a Bloom filter per SSTable to skip files that definitely don't contain the key) — this is the LSM-tree's read amplification tradeoff.",
    },
  ],
  tradeoffs: {
    pros: [
      "B-tree: excellent read performance, in-place updates, mature and predictable",
      "LSM-tree: excellent write throughput since writes are always sequential, never blocking on random disk seeks",
    ],
    cons: [
      "B-tree: writes require random I/O, which is slow on spinning disks and adds wear on SSDs",
      "LSM-tree: reads can be slower (must check multiple levels), and background compaction consumes I/O and CPU (write amplification)",
    ],
    whenToUse: [
      "B-tree — read-heavy workloads, traditional relational databases (Postgres, MySQL InnoDB)",
      "LSM-tree — write-heavy workloads: time series, event logging, Cassandra, RocksDB, LevelDB",
    ],
    whenNotToUse: [
      "Don't use a pure LSM-tree design for latency-critical point reads without a Bloom filter and good level tuning",
      "Don't use a B-tree for extremely high, sustained write throughput on spinning disks — random I/O becomes the bottleneck",
    ],
    alternatives: [
      { name: "B+ tree", note: "Variant used by most relational databases, storing all values in leaf nodes for efficient range scans" },
      { name: "Log-structured merge with tiered vs leveled compaction", note: "Different compaction strategies trade write vs read vs space amplification differently" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd choose based on the read/write ratio. For a read-heavy relational workload, like most OLTP applications, a B-tree (what Postgres and MySQL use) gives excellent read performance with in-place updates. For a write-heavy workload — ingesting time series data or event logs — an LSM-tree (what Cassandra and RocksDB use) is a better fit, since writes are always sequential appends rather than random in-place updates. I'd also mention the tradeoff explicitly: LSM-trees push cost into background compaction and slightly higher read amplification, in exchange for much better write throughput.",
    mistakes: [
      "Not knowing which real databases use which structure (Postgres/MySQL = B-tree, Cassandra/RocksDB = LSM-tree)",
      "Ignoring compaction entirely when discussing LSM-trees — it's a first-class operational concern, not a footnote",
      "Assuming LSM-trees are strictly 'better' rather than a different point on the read/write tradeoff curve",
    ],
    followUps: [
      "What is write amplification and why do LSM-trees have more of it?",
      "How does a Bloom filter help LSM-tree read performance?",
      "What operational concerns come with running an LSM-tree database (compaction storms, tombstones)?",
    ],
    redFlags: [
      "Not knowing what compaction is",
      "Claiming B-trees can't handle any meaningful write load",
    ],
  },
  challenge: [
    {
      question: "Why do LSM-trees generally offer better write throughput than B-trees?",
      options: [
        "LSM-trees never write to disk",
        "Writes are always sequential appends (memtable, then flushed SSTables) instead of random in-place page updates",
        "LSM-trees use less storage",
        "B-trees don't support writes at all",
      ],
      correctIndex: 1,
      explanation:
        "LSM-tree writes avoid random disk seeks entirely by always appending sequentially, which is dramatically faster than a B-tree's random in-place page updates, especially at high write volume.",
    },
    {
      question: "What is 'write amplification' in the context of an LSM-tree?",
      options: [
        "The fact that writes are encrypted",
        "The extra disk I/O caused by background compaction rewriting data across levels multiple times",
        "The process of duplicating writes across data centers",
        "A bug that causes duplicate writes",
      ],
      correctIndex: 1,
      explanation:
        "Because compaction repeatedly reads and rewrites data as it merges SSTables into higher levels, the same logical write ends up physically written to disk multiple times over its lifetime.",
    },
  ],
};

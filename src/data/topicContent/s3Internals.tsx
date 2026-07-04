import { S3Internals } from "@/components/visualizations/S3Internals";
import type { TopicContent } from "./types";

export const s3Internals: TopicContent = {
  visual: S3Internals,
  howItWorks: [
    {
      title: "Objects, not files or blocks",
      description:
        "S3 is object storage: every object is a blob of data plus metadata, addressed by a flat key within a bucket — there's no real directory hierarchy, just keys that look like paths.",
    },
    {
      title: "Multipart upload splits large objects",
      description:
        "For large files, the client splits the upload into multiple parts (5MB-5GB each) and uploads them in parallel, each independently, dramatically speeding up large uploads and allowing retry of just the failed part.",
      code: "createMultipartUpload() → uploadId\nuploadPart(uploadId, partNumber=1..N)  // in parallel\ncompleteMultipartUpload(uploadId, [partETags])",
    },
    {
      title: "Only failed parts need retry",
      description:
        "If one part fails to upload (network blip), only that part needs to be re-sent — not the entire multi-gigabyte file — which is the main practical benefit over a single monolithic upload.",
    },
    {
      title: "CompleteMultipartUpload assembles the object",
      description:
        "Once all parts are uploaded, a final API call tells S3 to assemble them into one logical object. The object doesn't become visible/downloadable until this completion step succeeds.",
    },
    {
      title: "Strong read-after-write consistency",
      description:
        "Since December 2020, S3 guarantees that a read immediately after a successful PUT, POST, or DELETE reflects that change — no more eventual consistency window to design around, though it's a commonly asked historical detail.",
    },
  ],
  tradeoffs: {
    pros: [
      "Multipart upload parallelizes large transfers and makes partial failure cheap to recover from",
      "Object storage scales effectively infinitely with no capacity planning from the user's side",
      "Strong consistency removes a whole historical class of 'why don't I see my upload yet' bugs",
    ],
    cons: [
      "Object storage isn't a filesystem — no atomic rename, no partial in-place edits, no real directories",
      "Multipart upload adds client-side complexity (tracking part ETags, orchestrating parallel uploads)",
      "Listing objects by prefix can be slower than a real filesystem directory listing at very large scale",
    ],
    whenToUse: [
      "Any object over ~100MB — AWS recommends multipart upload starting around this size",
      "User-generated content, backups, video, static assets — anything that doesn't need in-place mutation",
    ],
    whenNotToUse: [
      "Workloads needing a true POSIX filesystem with in-place edits and directory semantics (use EBS or EFS instead)",
      "Very small objects where multipart's coordination overhead outweighs the parallelism benefit",
    ],
    alternatives: [
      { name: "EBS", note: "Block storage — a virtual disk attached to one instance, supports in-place writes" },
      { name: "EFS", note: "Network file storage with POSIX semantics, shareable across many instances" },
    ],
  },
  interviewAnswer: {
    script:
      "For large file uploads — video, backups — I'd use multipart upload: split the file into parts, upload them in parallel for speed, and if any single part fails, only that part needs retrying instead of restarting the whole transfer. I'd call out that the object isn't visible until CompleteMultipartUpload succeeds, so partial uploads never leave a corrupt half-object visible to readers. On consistency, I'd mention that modern S3 gives strong read-after-write consistency for all operations — worth knowing explicitly since older material (and some interviewers) still reference the historical eventual consistency model for overwrites, which was fixed industry-wide in December 2020.",
    mistakes: [
      "Not knowing that S3 now provides strong consistency, citing outdated eventual-consistency behavior as current",
      "Treating S3 as if it supports in-place file edits like a real filesystem",
      "Not mentioning multipart upload for large file design questions",
    ],
    followUps: [
      "How would you resume a large upload that got interrupted partway through?",
      "What's the difference between object, block, and file storage?",
      "How would you handle generating a pre-signed URL so a client can upload directly to S3?",
    ],
    redFlags: [
      "Not knowing what an object store is, or confusing it with a traditional filesystem",
    ],
  },
  challenge: [
    {
      question: "What is the main practical benefit of multipart upload for a large file?",
      options: [
        "It compresses the file automatically",
        "Parts upload in parallel and only a failed part needs to be retried, not the entire file",
        "It encrypts the file in transit",
        "It reduces the total storage cost",
      ],
      correctIndex: 1,
      explanation:
        "Multipart upload speeds up large transfers via parallelism and makes partial failure cheap — you only re-upload the part that failed, not the whole object.",
    },
    {
      question: "As of the current S3 consistency model, what happens if you read an object immediately after successfully overwriting it?",
      options: [
        "You might see the old version for a while (eventual consistency)",
        "You always see the new version immediately (strong read-after-write consistency)",
        "The read fails until you wait 24 hours",
        "S3 does not support overwriting objects",
      ],
      correctIndex: 1,
      explanation:
        "Since December 2020, S3 provides strong read-after-write consistency for all operations, including overwrites — a read right after a successful write always reflects that write.",
    },
  ],
};

import { BloomFilter } from "@/components/visualizations/BloomFilter";
import type { TopicContent } from "./types";

export const bloomFilter: TopicContent = {
  visual: BloomFilter,
  howItWorks: [
    {
      title: "A bit array plus k hash functions",
      description:
        "A Bloom filter is a fixed-size array of bits, all initially 0. To add an item, it's run through k independent hash functions, and each resulting bit position is set to 1.",
    },
    {
      title: "Checking membership",
      description:
        "To check if an item might be in the set, hash it the same way and check all k bit positions. If any bit is 0, the item is definitely not in the set. If all bits are 1, it's probably in the set.",
      code: "def mightContain(item):\n    return all(bits[hash_i(item)] for i in range(k))",
    },
    {
      title: "False positives are possible, false negatives are not",
      description:
        "Because bits can be set by multiple different items, an item that was never added can still have all its bits happen to be set by others — a false positive. But a bit that's 0 is definitively 0, so 'not in the set' is always correct.",
    },
    {
      title: "Tuning the false positive rate",
      description:
        "The false positive rate depends on the bit array size, the number of hash functions, and the number of items added — bigger array and well-tuned k keep the false positive rate low even with millions of items.",
    },
    {
      title: "You can't remove items (without a counting variant)",
      description:
        "Because bits are shared across items, clearing a bit to 'remove' one item could break membership checks for other items that also set that bit. A Counting Bloom Filter solves this with counters instead of single bits.",
    },
  ],
  tradeoffs: {
    pros: [
      "Extremely space-efficient — a fraction of a byte per item, regardless of item size",
      "O(k) constant-time add and lookup, independent of the number of items stored",
      "No false negatives — a definitive 'not present' answer is always trustworthy",
    ],
    cons: [
      "False positives are possible and must be tolerated by the calling system",
      "Standard Bloom filters don't support deletion",
      "Doesn't store the actual items — only membership, no way to enumerate what's in the set",
    ],
    whenToUse: [
      "Preventing unnecessary lookups: checking a Bloom filter before hitting a database or a slow downstream service",
      "Malicious URL / spam filtering (Chrome's Safe Browsing), duplicate detection at scale",
    ],
    whenNotToUse: [
      "Anywhere a false positive is unacceptable and can't be double-checked against a source of truth",
      "When you need to enumerate or remove individual items frequently",
    ],
    alternatives: [
      { name: "Counting Bloom Filter", note: "Uses small counters instead of single bits, enabling deletion" },
      { name: "Cuckoo filter", note: "Similar space efficiency with support for deletion and often better false-positive rates" },
      { name: "HyperLogLog", note: "Solves a different problem — cardinality estimation rather than membership testing" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd use a Bloom filter as a cheap pre-check in front of an expensive lookup — for example, in the URL shortener design, checking whether a short code definitely doesn't exist before querying the database, to avoid cache/database penetration attacks. I'd be precise about the guarantee: no false negatives, so a 'definitely not present' answer can always be trusted and skip the expensive lookup; but false positives are possible, so a 'maybe present' answer still requires falling through to the real data store to confirm. I'd also mention that standard Bloom filters can't support deletion — if that's needed, a Counting Bloom Filter or Cuckoo filter would be the fix.",
    mistakes: [
      "Claiming a Bloom filter can definitively confirm an item IS in the set (it only gives 'maybe')",
      "Not knowing that standard Bloom filters can't support deletion",
      "Using a Bloom filter where the actual item values need to be retrieved or enumerated",
    ],
    followUps: [
      "How would you support deletion from a Bloom filter?",
      "How do you choose the bit array size and number of hash functions for a target false positive rate?",
      "What's the difference between a Bloom filter and a HyperLogLog?",
    ],
    redFlags: [
      "Not knowing what a false positive means in this context",
      "Confusing a Bloom filter with a hash set that stores actual values",
    ],
  },
  challenge: [
    {
      question: "If a Bloom filter says an item is 'definitely not in the set,' how confident can you be in that answer?",
      options: [
        "Not confident at all — it could still be a false negative",
        "Completely confident — Bloom filters never produce false negatives",
        "50/50 — it's a coin flip",
        "It depends on the number of hash functions",
      ],
      correctIndex: 1,
      explanation:
        "A Bloom filter's 'not in the set' answer is always correct — false negatives are impossible by construction, since a real item would have set all of its bits when added.",
    },
    {
      question: "Why can't a standard Bloom filter easily support removing an item?",
      options: [
        "Bloom filters don't use bits at all",
        "Clearing a bit for one item could incorrectly clear a bit that another item also depends on",
        "Removal requires re-hashing the entire filter",
        "It actually can, trivially",
      ],
      correctIndex: 1,
      explanation:
        "Because multiple items can share the same bit positions, clearing a bit to remove one item risks breaking membership checks for other items that also set that same bit.",
    },
  ],
};

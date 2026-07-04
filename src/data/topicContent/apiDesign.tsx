import { ApiDesign } from "@/components/visualizations/ApiDesign";
import type { TopicContent } from "./types";

export const apiDesign: TopicContent = {
  visual: ApiDesign,
  howItWorks: [
    {
      title: "Resources, verbs, and status codes",
      description:
        "A well-designed REST API models nouns as URLs (/users/42) and uses HTTP verbs (GET/POST/PUT/DELETE) for actions, returning a status code that accurately reflects the outcome — not always 200.",
      code: "GET /users/42     → 200 OK\nPOST /users       → 201 Created\nGET /users/9999   → 404 Not Found\nDELETE /users/42  → 204 No Content",
    },
    {
      title: "Offset pagination is simple but slow at depth",
      description:
        "LIMIT/OFFSET is easy to implement, but the database must scan and discard every skipped row — page 5,000 forces scanning ~100,000 rows just to throw them away.",
      code: "SELECT * FROM posts ORDER BY id LIMIT 20 OFFSET 100000; -- slow",
    },
    {
      title: "Cursor pagination stays constant-time",
      description:
        "Instead of an offset, the client sends the last-seen sort key. The database jumps straight there via an index — O(1) relative to page depth, at the cost of not supporting 'jump to page N' directly.",
      code: "SELECT * FROM posts WHERE id > :last_seen_id ORDER BY id LIMIT 20;",
    },
    {
      title: "Idempotency keys make retries safe",
      description:
        "A client generates a unique key per logical operation and sends it with the request. If the network drops the response and the client retries with the same key, the server recognizes it and returns the original result instead of processing it twice.",
      code: "POST /charges\nIdempotency-Key: idem_8f3a21\n\n-- server: if key seen before, return cached response, don't re-charge",
    },
    {
      title: "Versioning keeps old clients working",
      description:
        "As the API evolves, versioning (URL path, header, or media type) lets you make breaking changes without instantly breaking every existing client integration.",
    },
  ],
  tradeoffs: {
    pros: [
      "Well-designed status codes let clients handle errors programmatically instead of parsing error strings",
      "Cursor pagination scales to arbitrarily deep result sets without degrading",
      "Idempotency keys make network retries safe by default, critical for payments",
    ],
    cons: [
      "Cursor pagination can't jump directly to an arbitrary page number",
      "Idempotency key storage needs its own TTL/cleanup strategy",
      "Overly strict REST purism can slow down development for pragmatic use cases",
    ],
    whenToUse: [
      "Cursor pagination — any feed or list that can grow large (social feeds, search results)",
      "Idempotency keys — any financially or side-effect sensitive write endpoint (payments, order creation)",
    ],
    whenNotToUse: [
      "Offset pagination is fine for small, bounded lists (e.g. an admin table with a few hundred rows)",
      "Idempotency keys add unnecessary complexity for pure read (GET) endpoints, which should already be idempotent",
    ],
    alternatives: [
      { name: "GraphQL", note: "Client-specified fields and relay-style cursor connections built into the spec" },
      { name: "gRPC", note: "Strongly-typed contracts instead of REST conventions, common for internal APIs" },
    ],
  },
  interviewAnswer: {
    script:
      "For any endpoint returning a growing list, I'd default to cursor-based pagination over offset, since OFFSET's cost grows linearly with page depth — at scale that turns into a real performance cliff. For any endpoint with a side effect that costs money or is hard to undo, like a payment or order creation, I'd require an Idempotency-Key header so a client's network retry can't cause a double charge — the server stores the key with the response and replays it on a duplicate. I'd also make sure status codes are meaningful (404 vs 400 vs 401) so clients can handle errors programmatically instead of string-matching error messages.",
    mistakes: [
      "Using OFFSET pagination for a feed that can grow to millions of rows",
      "Not handling duplicate requests on payment/order endpoints",
      "Returning 200 OK for everything, including errors, with the real status buried in the response body",
    ],
    followUps: [
      "How long should an idempotency key be honored before expiring?",
      "How would you implement 'jump to page 50' with cursor pagination?",
      "What HTTP status code would you return for a validation error, and why?",
    ],
    redFlags: [
      "Not knowing what an idempotency key is",
      "Confusing 401 (unauthenticated) with 403 (unauthorized/forbidden)",
    ],
  },
  challenge: [
    {
      question: "Why does offset pagination (LIMIT/OFFSET) get slower as the page number increases?",
      options: [
        "It doesn't — it's always constant time",
        "The database must scan and discard every skipped row before returning the requested page",
        "It only works for the first page",
        "OFFSET automatically triggers a full table lock",
      ],
      correctIndex: 1,
      explanation:
        "The database has to walk through and discard all `OFFSET` rows before it can start returning results, so cost grows linearly with page depth.",
    },
    {
      question: "How does an idempotency key prevent a duplicate payment charge when a client retries a request?",
      options: [
        "It encrypts the payment amount",
        "The server remembers the key and returns the original cached result instead of processing the request again",
        "It slows down the client so they can't retry quickly",
        "It has no effect on duplicate requests",
      ],
      correctIndex: 1,
      explanation:
        "The server stores the outcome associated with each idempotency key; on a retry with the same key, it returns the stored result rather than re-executing the side effect.",
    },
  ],
};

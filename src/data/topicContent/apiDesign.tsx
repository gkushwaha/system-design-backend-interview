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
      title: "Resource naming — plural nouns, shallow nesting",
      description:
        "URLs should read as nouns, not actions: /orders not /getOrders. Nest resources one level deep at most (/users/42/orders is fine; /users/42/orders/7/items/3/reviews gets unwieldy) — reach for a query param or a top-level resource instead of deep nesting.",
      code: "GET /users/42/orders        -- good: one level of nesting\nGET /orders?userId=42        -- also fine, and flatter\nPOST /createNewOrder         -- bad: verb in the URL",
    },
    {
      title: "Statelessness — every request is self-contained",
      description:
        "The server holds no per-client session state between requests; each request carries everything needed to process it (auth token, pagination cursor, etc.). This is what lets you load-balance requests to any server interchangeably and scale horizontally without sticky sessions.",
    },
    {
      title: "Consistent error response shape",
      description:
        "Clients should be able to parse any error the same way regardless of which endpoint produced it — a stable JSON shape with a machine-readable code, a human message, and optional field-level detail, not a different ad-hoc format per endpoint.",
      code: '{\n  "error": {\n    "code": "validation_failed",\n    "message": "Email is already in use",\n    "field": "email"\n  }\n}',
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
      "Statelessness lets any request land on any server, so you can add/remove servers freely behind a load balancer",
      "A consistent error shape means one client-side error handler works for the whole API instead of per-endpoint parsing",
    ],
    cons: [
      "Cursor pagination can't jump directly to an arbitrary page number",
      "Idempotency key storage needs its own TTL/cleanup strategy",
      "Overly strict REST purism can slow down development for pragmatic use cases",
      "Statelessness pushes state to the client or a shared store (Redis, DB) — you lose the option of cheap in-memory server-side sessions",
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
      "I'd start from a few core principles: resources are nouns in the URL (/orders, not /getOrders), the server is stateless so any instance can handle any request, and every error comes back in the same shape (a machine-readable code plus a human message) so the client has one error handler for the whole API, not one per endpoint. For any endpoint returning a growing list, I'd default to cursor-based pagination over offset, since OFFSET's cost grows linearly with page depth — at scale that turns into a real performance cliff. For any endpoint with a side effect that costs money or is hard to undo, like a payment or order creation, I'd require an Idempotency-Key header so a client's network retry can't cause a double charge — the server stores the key with the response and replays it on a duplicate. I'd also make sure status codes are meaningful (404 vs 400 vs 401) so clients can handle errors programmatically instead of string-matching error messages, and I'd version the API from day one (usually a URL path prefix like /v1/) so I can make breaking changes later without instantly breaking every existing integration.",
    mistakes: [
      "Using OFFSET pagination for a feed that can grow to millions of rows",
      "Not handling duplicate requests on payment/order endpoints",
      "Returning 200 OK for everything, including errors, with the real status buried in the response body",
      "Putting verbs in URLs (/createOrder) instead of using HTTP methods on a noun resource (POST /orders)",
      "Storing session state on a specific server instance, which breaks horizontal scaling and load balancing",
    ],
    followUps: [
      "How long should an idempotency key be honored before expiring?",
      "How would you implement 'jump to page 50' with cursor pagination?",
      "What HTTP status code would you return for a validation error, and why?",
      "How would you version this API without breaking existing clients?",
      "Why does statelessness matter for horizontal scaling?",
    ],
    redFlags: [
      "Not knowing what an idempotency key is",
      "Confusing 401 (unauthenticated) with 403 (unauthorized/forbidden)",
      "Not having an opinion on API versioning at all",
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
    {
      question: "Why does a stateless API (no server-side session tied to a specific instance) make horizontal scaling easier?",
      options: [
        "It doesn't — statelessness has no effect on scaling",
        "Any request can be routed to any server instance, since no instance holds client-specific state the others lack",
        "It makes every request automatically cached",
        "It removes the need for authentication",
      ],
      correctIndex: 1,
      explanation:
        "Because each request is self-contained, a load balancer can send it to any healthy server — there's no 'sticky session' requirement pinning a client to one instance, so you can freely add or remove servers.",
    },
  ],
};

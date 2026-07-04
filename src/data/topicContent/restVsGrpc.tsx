import { RestVsGrpc } from "@/components/visualizations/RestVsGrpc";
import type { TopicContent } from "./types";

export const restVsGrpc: TopicContent = {
  visual: RestVsGrpc,
  howItWorks: [
    {
      title: "REST: resources over HTTP verbs",
      description:
        "REST models a system as resources addressed by URLs, manipulated with standard HTTP verbs (GET/POST/PUT/DELETE) and typically serialized as human-readable JSON.",
      code: "GET /users/42 HTTP/1.1\nAccept: application/json",
    },
    {
      title: "gRPC: typed RPC over HTTP/2",
      description:
        "gRPC defines services and messages in a .proto schema, generates strongly-typed client/server code, and serializes messages as compact binary Protobuf over HTTP/2.",
      code: "service UserService {\n  rpc GetUser(GetUserRequest) returns (User);\n}",
    },
    {
      title: "HTTP/2 enables multiplexing and streaming",
      description:
        "Because gRPC runs on HTTP/2, a single connection can carry many concurrent streams without head-of-line blocking, which is what makes the four RPC styles (unary, server/client/bidi streaming) possible.",
    },
    {
      title: "Schema-first contracts",
      description:
        "The .proto file is the single source of truth for the API contract — client and server code is generated from it, catching type mismatches at compile time instead of runtime.",
    },
    {
      title: "Browser support is the catch",
      description:
        "Browsers can't speak native gRPC directly (no HTTP/2 trailer support in fetch/XHR), so public-facing browser clients typically need gRPC-Web with a proxy, or a plain REST facade.",
    },
  ],
  tradeoffs: {
    pros: [
      "REST: universally supported, human-readable, simple to debug with curl/browser",
      "gRPC: smaller payloads, faster serialization, native streaming, strongly-typed contracts",
    ],
    cons: [
      "REST: larger payloads, no native streaming, looser contracts (easy to have client/server drift)",
      "gRPC: harder to debug (binary payloads), poor native browser support, steeper learning curve",
    ],
    whenToUse: [
      "REST — public-facing APIs consumed by third parties or browsers",
      "gRPC — internal service-to-service communication where performance and strict typing matter",
      "gRPC — streaming use cases like live updates or large file uploads",
    ],
    whenNotToUse: [
      "Don't use gRPC for a public API where broad client compatibility (including browsers) is critical",
      "Don't use REST for high-throughput internal microservice communication if serialization overhead is a bottleneck",
    ],
    alternatives: [
      { name: "GraphQL", note: "Client-specified queries over HTTP, good for flexible reads across many resource types" },
      { name: "gRPC-Web", note: "A proxy layer that lets browsers talk to gRPC services with some feature limitations" },
      { name: "WebSockets", note: "Lower-level bidirectional streaming without gRPC's schema/type enforcement" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd use REST for the public-facing API since it's universally understood, easy to debug, and works everywhere including browsers. For internal service-to-service calls, especially high-throughput or latency-sensitive paths, I'd reach for gRPC — the Protobuf payloads are smaller and faster to (de)serialize, and the .proto contract keeps services in sync at compile time. If a feature needs real-time server push, like live trip tracking, gRPC's server streaming is a natural fit; REST would need polling or a separate WebSocket.",
    mistakes: [
      "Suggesting gRPC for a public API without acknowledging the browser support gap",
      "Not knowing gRPC runs over HTTP/2, which is why it can multiplex streams",
      "Treating REST and gRPC as mutually exclusive rather than using both at different layers",
    ],
    followUps: [
      "How would you expose a gRPC service to a browser client?",
      "What happens to gRPC's schema contract when you need to evolve the API?",
      "Why is Protobuf smaller than JSON on the wire?",
    ],
    redFlags: [
      "Not knowing what Protobuf is",
      "Claiming gRPC works natively in all browsers today",
    ],
  },
  challenge: [
    {
      question: "Why is a gRPC/Protobuf payload typically smaller than the equivalent JSON payload?",
      options: [
        "Protobuf compresses text with gzip automatically",
        "Protobuf encodes data as compact binary with field numbers instead of repeating field names as text",
        "JSON always includes extra whitespace",
        "gRPC removes fields not needed by the client",
      ],
      correctIndex: 1,
      explanation:
        "Protobuf uses binary encoding with numeric field tags instead of repeating string field names like JSON does, resulting in significantly smaller payloads.",
    },
    {
      question: "Which gRPC streaming mode fits a real-time collaborative document editor where both sides continuously send updates?",
      options: ["Unary", "Server streaming", "Client streaming", "Bidirectional streaming"],
      correctIndex: 3,
      explanation:
        "Bidirectional streaming allows both the client and server to send a continuous stream of messages independently over the same connection.",
    },
  ],
};

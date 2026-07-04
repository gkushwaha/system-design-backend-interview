import { Mtls } from "@/components/visualizations/Mtls";
import type { TopicContent } from "./types";

export const mtls: TopicContent = {
  visual: Mtls,
  howItWorks: [
    {
      title: "Regular TLS only authenticates the server",
      description:
        "In a normal HTTPS connection, the server presents a certificate proving its identity, but the server has no cryptographic proof of who the client is — any client can connect.",
    },
    {
      title: "Mutual TLS authenticates both sides",
      description:
        "In mTLS, the client also presents a certificate during the handshake. Both sides verify each other's certificate against a trusted certificate authority before any application data is exchanged.",
      code: "ClientHello → ServerHello + server cert → client cert + verify → session keys agreed",
    },
    {
      title: "Certificates, not passwords, prove identity",
      description:
        "Each service is issued a certificate (often by an internal CA) tied to its identity. There's no shared secret to leak or rotate manually across every caller — the cryptographic proof is per-service.",
    },
    {
      title: "A service mesh often handles mTLS transparently",
      description:
        "Tools like Istio or Linkerd inject a sidecar proxy that automatically wraps every service-to-service call in mTLS, issuing and rotating short-lived certificates — so application code doesn't need to implement this itself.",
    },
    {
      title: "Rejects unauthorized services at the network layer",
      description:
        "Since the handshake itself fails for a caller without a valid certificate, an unauthorized or compromised service can be blocked before it ever reaches application-level authorization logic.",
    },
  ],
  tradeoffs: {
    pros: [
      "Provides strong, cryptographic service identity — not just network-location-based trust",
      "Blocks unauthorized callers at the connection level, before any application logic runs",
      "Removes the need to manage and rotate shared API keys/secrets between internal services",
    ],
    cons: [
      "Certificate issuance, rotation, and revocation add real operational complexity",
      "Debugging connection failures (expired/misconfigured certs) can be harder than a simple auth header",
      "Doesn't replace application-level authorization — it only proves identity, not what that identity is allowed to do",
    ],
    whenToUse: [
      "Service-to-service communication inside a zero-trust internal network",
      "Any environment where 'being on the internal network' is no longer considered sufficient trust",
    ],
    whenNotToUse: [
      "Public-facing client-to-server APIs where clients (browsers, mobile apps) can't reasonably hold a private certificate",
      "Very small, simple systems where the operational overhead of a full mTLS/CA setup isn't justified",
    ],
    alternatives: [
      { name: "API keys / bearer tokens", note: "Simpler shared-secret based auth, but the secret itself becomes something to protect and rotate" },
      { name: "Service mesh mTLS (Istio/Linkerd)", note: "Automates certificate issuance/rotation so services don't implement mTLS themselves" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd use mTLS for service-to-service communication inside a zero-trust network, where I don't want to rely on 'being inside the VPC' as a trust boundary. Instead of the server alone proving its identity like regular TLS, both sides present certificates and verify each other before any data is exchanged — so a compromised or rogue service without a valid certificate is rejected at the connection level. In practice, I'd avoid implementing this manually in every service and instead use a service mesh like Istio, which injects a sidecar that handles certificate issuance, rotation, and the mTLS handshake transparently.",
    mistakes: [
      "Confusing mTLS with regular TLS — the 'mutual' part (client also presenting a certificate) is the whole point",
      "Not mentioning that mTLS proves identity but doesn't replace application-level authorization",
      "Suggesting mTLS for public browser-facing APIs, where clients can't reasonably hold private certificates",
    ],
    followUps: [
      "How do you handle certificate rotation without downtime?",
      "What's the difference between mTLS and just using API keys between services?",
      "How does a service mesh like Istio implement mTLS transparently?",
    ],
    redFlags: [
      "Not knowing that regular TLS only authenticates the server, not the client",
    ],
  },
  challenge: [
    {
      question: "What is the key difference between mTLS and standard TLS?",
      options: [
        "mTLS is faster",
        "In mTLS, the client also presents a certificate and is verified, not just the server",
        "mTLS doesn't use certificates at all",
        "There is no real difference",
      ],
      correctIndex: 1,
      explanation:
        "Standard TLS only proves the server's identity to the client. mTLS adds mutual verification — the client also presents a certificate that the server verifies before proceeding.",
    },
    {
      question: "What happens to a service without a valid certificate when it tries to connect to an mTLS-protected service?",
      options: [
        "It connects normally but with a warning",
        "The TLS handshake itself fails, rejecting the connection before any application data is exchanged",
        "It's allowed through but logged for review later",
        "mTLS doesn't reject any connections",
      ],
      correctIndex: 1,
      explanation:
        "Because certificate verification happens during the handshake itself, an invalid or missing client certificate causes the connection to be rejected immediately, before reaching any application logic.",
    },
  ],
};

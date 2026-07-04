import { JwtOauth2 } from "@/components/visualizations/JwtOauth2";
import type { TopicContent } from "./types";

export const jwtOauth2: TopicContent = {
  visual: JwtOauth2,
  howItWorks: [
    {
      title: "JWT: a self-contained, signed token",
      description:
        "A JSON Web Token packs claims (like user ID and expiry) into a payload, signs it with a secret or private key, and encodes all three parts (header, payload, signature) as a compact string.",
      code: "header.payload.signature\n// signature = HMACSHA256(header + '.' + payload, secret)",
    },
    {
      title: "Verifying a JWT requires no database lookup",
      description:
        "Because the signature proves the token wasn't tampered with, a server can verify a JWT purely with cryptography — no need to check a session store, which is what makes JWTs attractive for stateless, horizontally scaled APIs.",
    },
    {
      title: "OAuth2 authorization code flow",
      description:
        "The user is redirected to the identity provider (Google, etc.), approves access, and is redirected back with a short-lived authorization code — never exposing credentials to the client app directly.",
    },
    {
      title: "Server-to-server code exchange",
      description:
        "The client's backend exchanges that code, plus its confidential client secret, for an access token (and often an ID token, which is a JWT) — this exchange happens server-to-server, invisible to the browser.",
      code: "POST /oauth/token\ngrant_type=authorization_code&code=...&client_secret=...",
    },
    {
      title: "Access tokens authorize API calls",
      description:
        "The client includes the access token (often a JWT) in the Authorization header of subsequent API requests; the resource server verifies it and extracts the user's identity/scopes from its claims.",
    },
  ],
  tradeoffs: {
    pros: [
      "JWTs are stateless — no server-side session store needed, ideal for horizontally scaled APIs",
      "OAuth2 lets users authenticate via a trusted provider without ever sharing their password with the client app",
      "Scopes let the user grant limited, specific permissions rather than all-or-nothing access",
    ],
    cons: [
      "A JWT can't be easily revoked before its expiry — invalidating a stolen JWT server-side is awkward without an extra check",
      "If the payload is large, JWTs add real overhead to every request compared to a lightweight session ID",
      "OAuth2 has many similar-looking flows (authorization code, implicit, client credentials, PKCE) that are easy to mix up or use incorrectly",
    ],
    whenToUse: [
      "JWT — stateless APIs, especially across multiple services that would otherwise need a shared session store",
      "OAuth2 authorization code flow — 'Sign in with X' features and third-party API access delegation",
    ],
    whenNotToUse: [
      "JWT for long-lived sessions storing sensitive claims that must be instantly revocable — pair with a short expiry and refresh token instead",
      "OAuth2 implicit flow for any new system — it's deprecated in favor of authorization code + PKCE",
    ],
    alternatives: [
      { name: "Opaque session tokens", note: "A random ID looked up server-side — trivially revocable, but requires a shared session store" },
      { name: "PKCE extension", note: "Adds protection against code interception for public clients (mobile/SPA apps) using OAuth2" },
    ],
  },
  interviewAnswer: {
    script:
      "I'd use OAuth2's authorization code flow for 'Sign in with Google'-style delegated authentication — the user approves access on Google's own page, Google redirects back with a short-lived code, and my backend exchanges that code plus a confidential client secret for tokens, all server-to-server so the secret is never exposed to the browser. For the token itself, I'd use a JWT so any of our stateless API servers can verify the user's identity and claims via signature check alone, without a shared session store. I'd flag the revocation tradeoff explicitly: since a JWT can't be un-signed, I'd keep access tokens short-lived and pair them with a revocable refresh token for renewing access.",
    mistakes: [
      "Confusing authentication (who you are) with authorization (what you're allowed to do) — OAuth2 is fundamentally about the latter",
      "Using the deprecated implicit flow instead of authorization code + PKCE for public clients",
      "Not having a plan for revoking a compromised JWT before its natural expiry",
    ],
    followUps: [
      "How would you revoke a JWT before it naturally expires?",
      "What's the difference between an access token and an ID token?",
      "Why does OAuth2 use a short-lived authorization code instead of returning tokens directly in the redirect?",
    ],
    redFlags: [
      "Not knowing the difference between authentication and authorization",
      "Suggesting the client secret should be embedded in a mobile app or browser JavaScript",
    ],
  },
  challenge: [
    {
      question: "Why does OAuth2's authorization code flow exchange a code for tokens via a separate server-to-server call, instead of returning tokens directly in the browser redirect?",
      options: [
        "It's an unnecessary extra step with no real benefit",
        "It keeps the client secret and tokens away from the browser and browser history/logs, reducing exposure risk",
        "Browsers can't handle redirects",
        "It makes the flow faster",
      ],
      correctIndex: 1,
      explanation:
        "Returning tokens directly in a browser redirect would expose them in browser history, referrer headers, and logs; the code-exchange step keeps the sensitive client secret and final tokens server-side.",
    },
    {
      question: "What allows a server to verify a JWT's authenticity without checking a database?",
      options: [
        "JWTs are never checked at all",
        "The cryptographic signature over the header and payload, verifiable with the signing secret/public key",
        "JWTs include a copy of the database",
        "The token's expiry date alone",
      ],
      correctIndex: 1,
      explanation:
        "The signature is what makes a JWT self-verifying — as long as the server holds the correct secret or public key, it can confirm the token wasn't tampered with, no lookup required.",
    },
  ],
};

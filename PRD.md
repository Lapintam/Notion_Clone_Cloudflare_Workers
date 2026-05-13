# Notion Clone — Cloudflare Workers Backend (Scaffold)

> One-page schema reference. Living document; refine as features harden.

## 1. Product

The AI-services backend for the Notion Clone front-end (sister repo:
[Lapintam/Notion_Clone](https://github.com/Lapintam/Notion_Clone)). A
single Hono-on-Workers app exposing two AI endpoints — **chat-with-document**
(OpenAI GPT-4o) and **translate-document** (Cloudflare Workers AI). Stateless,
edge-deployed, CORS-locked to the Notion Clone front-end origin.

## 2. Users & Roles

| Role | Capability |
|---|---|
| **Notion Clone front-end (origin-allowed)** | Calls `/chatToDocument` and `/translateDocument` with document JSON |

No user auth on this service — security relies on CORS origin allowlist + the
caller (front-end) authenticating users via Clerk. **Anyone who can spoof the
Origin header can call these endpoints**; consider adding a shared secret or
JWT verification if abuse becomes a concern.

## 3. Architecture

A single Cloudflare Worker built with Hono. Two AI bindings: `OPEN_AI_KEY`
secret + the platform `AI` binding for Workers AI models.

```
src/
  index.ts                  Hono app — CORS + two POST routes
test/                       Vitest tests
wrangler.toml               Worker config (compat 2024-10-22, AI binding,
                            Workers Logs enabled, nodejs_compat)
vitest.config.mts           @cloudflare/vitest-pool-workers harness
worker-configuration.d.ts   Auto-generated env types (`wrangler types`)
```

Deploy: `pnpm wrangler deploy`. Dev: `pnpm wrangler dev`.

## 4. Data Model

**Stateless service** — no DB, no KV, no R2, no D1, no Durable Objects, no
Queues. Persistence is the front-end's responsibility (Liveblocks +
Firebase in the sister repo).

**Request / response shapes:**

| Route | Method | Body | Response |
|---|---|---|---|
| `/chatToDocument` | POST | `{ documentData: string, question: string }` | `{ message: string }` |
| `/translateDocument` | POST | `{ documentData: string, targetLang: string }` | Raw translation result from `@cf/meta/m2m100-1.2b` |

**Environment bindings** (declared in [src/index.ts](src/index.ts) +
[wrangler.toml](wrangler.toml)):
- `OPEN_AI_KEY` — secret, OpenAI API key
- `AI` — Cloudflare Workers AI binding

## 5. Key Flows

1. **Chat to document:** Front-end POSTs document JSON + question →
   GPT-4o (temperature 0.5) with a system prompt that embeds the document →
   returns the assistant message.
2. **Translate document:** Front-end POSTs document text + target language →
   `@cf/facebook/bart-large-cnn` summarizes to ≤1000 chars → `@cf/meta/m2m100-1.2b`
   translates summary → returns translated payload.

## 6. Integrations

Hono · OpenAI Node SDK (GPT-4o) · Cloudflare Workers AI (`bart-large-cnn`,
`m2m100-1.2b`) · Cloudflare Workers Logs (observability enabled).

## 7. Non-Functional

- **CORS allowlist** is the only access control: production origin
  `notion-clone-lapintam-matthew-lapintas-projects.vercel.app` + `localhost:3000`.
- **No rate limiting**: an attacker who spoofs Origin (trivial server-side) can
  burn the OpenAI key. Add a Cloudflare Worker Rate-Limiting binding or
  per-user JWT verification.
- **Translation is lossy by design**: input is summarized to ≤1000 chars before
  translation. That's a feature for short docs and a bug for long ones —
  surface this to users in the UI.
- **Tests**: Vitest pool-workers harness configured but only the test scaffold
  exists; add coverage before hardening.

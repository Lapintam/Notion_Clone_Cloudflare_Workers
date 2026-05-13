# Application Schema PRD: Notion Clone Cloudflare Workers

## Purpose
Edge backend for Notion Clone document AI features: chat against document content and translate summarized document content.

## Runtime / Surfaces
- Runtime: Cloudflare Workers with Hono.
- AI providers: OpenAI chat completions and Cloudflare Workers AI.
- Public endpoints: `POST /chatToDocument` and `POST /translateDocument`.
- Security surface: CORS allowlist for production Vercel frontend and localhost.

## Core Schema
- `ChatToDocumentRequest`: `{ documentData, question }`.
- `ChatToDocumentResponse`: `{ message }` from OpenAI.
- `TranslateDocumentRequest`: `{ documentData, targetLang }`.
- `DocumentSummary`: summary produced by Workers AI BART model.
- `TranslationResponse`: translated summary returned by Workers AI M2M100.
- `WorkerConfig`: `OPEN_AI_KEY`, `AI` binding, CORS origins.
- `WorkerError`: status, message, provider, request id.

## Data Stores & Integrations
- Stateless by default; no durable storage, KV, D1, R2, or queue bindings are active.
- OpenAI handles chat-to-document.
- Cloudflare Workers AI handles summarization and translation.
- Wrangler config owns deployment metadata and AI binding.

## Future Edit Map
- Validate request bodies with a shared schema before calling providers.
- Add explicit error responses and provider timeouts.
- Consider request logging/analytics only after privacy requirements are defined.
- Keep CORS origins environment-specific so previews do not require code edits.

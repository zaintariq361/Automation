# Conviyo Clone — Conversational Commerce OS (Phase 1 MVP)

A working scaffold of a Conviyo-style conversational commerce platform: an AI sales agent
that answers questions and takes orders over WhatsApp (Instagram/Messenger are stubbed at
the data-model level), backed by a unified inbox, a RAG knowledge base, a product catalog,
human handoff, and revenue-tied analytics — all multi-tenant.

This is a **Phase 1 MVP**, scoped to the first buildable slice of a Conviyo-style product:
WhatsApp integration, shared inbox, AI knowledge base, human handoff, basic analytics, and
Shopify catalog sync. Instagram/Messenger, voice notes, customer scoring, broadcasts, and
billing are intentionally out of scope for this pass — the module boundaries below are built
so they slot in without a rewrite.

## Architecture

```
apps/
  api/    NestJS backend — REST API, Prisma/Postgres, pgvector RAG, Claude tool-calling agent
  web/    Next.js admin dashboard — inbox, knowledge base, catalog, analytics, settings
packages/
  shared/ Types/enums shared between api and web
```

### Backend modules (`apps/api/src`)

| Module | Responsibility |
| --- | --- |
| `auth` | Signup (creates a Tenant + owner User) and login, JWT-based |
| `tenants` (via `prisma`) | Multi-tenant isolation — every table is scoped by `tenantId` |
| `customers` | End-customer records, keyed by `(tenant, channel, externalId)` |
| `conversations` | Unified inbox: list/assign/close/notes/manual replies/handoff |
| `channels` | WhatsApp Cloud API client (send + webhook signature verification) |
| `whatsapp` | Webhook controller (verify handshake + inbound message receiver) |
| `engine` | Orchestrates inbound message → find/create conversation → run AI agent or wait for a human → send reply |
| `ai` | Claude-powered sales agent with tool calling (`search_catalog`, `search_knowledge_base`, `create_order`, `handoff_to_human`) |
| `knowledge` | RAG: chunking, embeddings (Voyage AI), pgvector similarity search |
| `catalog` | Product catalog + Shopify Admin API sync |
| `orders` | Order creation/status, produced by the AI agent or an agent |
| `handoff` | AI→human handoff state machine + audit log + escalation-keyword detection |
| `analytics` | Resolution rate, response time, handoff rate, conversion rate, revenue |
| `integrations` | Per-tenant channel/commerce credentials (WhatsApp, Shopify) |

### Data model

See `apps/api/prisma/schema.prisma`. Every business table carries a `tenantId` for isolation.
`KnowledgeChunk.embedding` is a pgvector `vector(1024)` column, queried directly via raw SQL
cosine-distance (`<=>`) since Prisma doesn't have first-class vector query support yet.

### AI agent loop

`AgentService.generateReply` runs the standard Anthropic tool-use loop: send the conversation
history + tool definitions to Claude, execute any `tool_use` blocks against real services
(catalog search, knowledge base search, order creation, handoff), feed `tool_result`s back,
repeat until Claude returns plain text. A `handoff_to_human` call short-circuits the loop and
flips the conversation to `HANDED_OFF` so the AI stops responding and a human sees full context.

## Getting started

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
docker compose up -d              # Postgres (with pgvector) + Redis
npm install
npm run prisma:generate
npm --workspace apps/api exec prisma migrate dev --name init
npm --workspace apps/api run seed  # demo tenant: owner@demo-bakery.test / password123

npm run dev:api   # http://localhost:4000/api
npm run dev:web   # http://localhost:3000
```

By default every external integration (WhatsApp, Claude, Voyage embeddings, Shopify) runs
against **stub credentials** — see `apps/api/.env.example`. Without real keys:
- The AI agent still runs the knowledge-base/catalog/order flow, but replies with a
  fallback message instead of calling Claude (`ANTHROPIC_API_KEY` unset).
- Embeddings fall back to a deterministic local hash so RAG search still returns *something*
  offline, though it's not semantically meaningful — set `VOYAGE_API_KEY` for real search.
- WhatsApp sends are logged, not delivered, until `WHATSAPP_ACCESS_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID`
  are set (either via env, for a single demo tenant, or per-tenant under Settings → Integrations).
- Shopify sync is a no-op until `SHOPIFY_STORE_DOMAIN`/`SHOPIFY_ADMIN_API_TOKEN` are set.

## Roadmap (from the product analysis)

- **Phase 1 (this repo):** WhatsApp, shared inbox, AI knowledge base, human handoff, basic
  analytics, Shopify integration.
- **Phase 2:** Instagram/Messenger, voice notes & image understanding, order tracking.
- **Phase 3:** Customer scoring (churn/LTV), broadcasts & segmentation, multi-language AI.
- **Phase 4:** Autonomous AI selling, advanced analytics, agent performance tracking, enterprise
  features (SSO, audit logs, SLAs).

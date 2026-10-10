# Autonomous Model Evaluator — Server (Express + MongoDB + RAG + LangGraph)

Real JWT auth + a **multi-agent, RAG-grounded** business-model evaluation pipeline that scores a submitted idea on **sustainability, scalability, and profitability**, plus unlimited follow-up Q&A grounded in that evaluation. No PDF export, no mock/demo data — every response is generated live from what the user actually submits, backed by real retrieved source material.

100% free stack — no paid API keys required:
- **LLM + embeddings**: [Ollama](https://ollama.com), running locally
- **RAG**: local vector store in MongoDB (`KnowledgeChunk` collection), cosine similarity computed in plain JS — no Atlas Search index or paid vector DB needed
- **Agent orchestration**: [LangGraph.js](https://langchain-ai.github.io/langgraphjs/) — a real 4-node state graph, not a single prompt

## How the evaluation pipeline actually works

`POST /api/validations` kicks off `runAgenticEvaluation()` (`src/services/langgraphPipeline.js`), a LangGraph state graph:

```
START -> marketResearch -> competitorAnalysis -> riskAssessment -> reportGenerator -> END
```

Each of the first three nodes is its own agent: it does a **RAG retrieval** (`src/services/ragService.js`) scoped to its own category (`market` / `competitor` / `risk`) against the `KnowledgeChunk` vector store, then reasons only over what it retrieved. The final node synthesizes all three agents' grounded analyses (not the raw idea alone) into the scored report, and evidence items are matched back to real retrieved chunks so citations aren't invented.

## Gemini free-tier limits and how the server copes

The Gemini free tier allows only ~5 requests/minute and roughly 20 requests/day **per model**, and models are sometimes overloaded (503). One evaluation makes 4 chat calls, so you can run out quickly. The server handles this automatically:
- **Pacing**: calls are spaced `AI_MIN_INTERVAL_MS` apart (default 13s) to avoid per-minute 429s.
- **Backup models**: on a 503 or 429, the client switches to the next model in `AI_FALLBACK_MODELS` (default `gemini-2.5-flash,gemini-3.5-flash-lite`). Each model has its own quota.
- **Backup provider** (most reliable): set `AI_FALLBACK_BASE_URL`, `AI_FALLBACK_API_KEY`, `AI_FALLBACK_MODEL` (e.g. a free Groq key, `llama-3.3-70b-versatile`). It is tried last.
- **Embedding cache**: the same idea text is embedded once per run, not three times.
- Gemini's suggested retry delay is parsed from the error body; daily-quota errors fail fast with a clear message instead of waiting for hours.

If your chat provider is not Gemini, keep `EMBEDDING_PROVIDER_API_KEY` set to your Gemini key (Groq has no embeddings). Restart the server after editing `.env`.

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET (AI/embedding defaults point at local Ollama)

# 1. Install Ollama: https://ollama.com
ollama pull llama3.1          # chat/reasoning model
ollama pull nomic-embed-text  # embeddings model, used for RAG

# 2. Seed the shared knowledge base (free public Wikipedia pages) so the
#    RAG pipeline has something to retrieve on day one — otherwise the
#    first few evaluations will note "knowledge base has no data on that".
npm run seed:knowledge

npm run dev
```

Server runs at `http://localhost:5000`. Health check: `GET /api/health`.

Add more sources anytime — either edit `SEED_SOURCES` in `src/scripts/seedKnowledge.js` and re-run `npm run seed:knowledge`, or hit the knowledge API directly:

- `POST /api/knowledge/url { url, category }` — scrapes a public page (Wikipedia, SEC EDGAR, a news article, G2/Product Hunt) and ingests it
- `POST /api/knowledge/text { text, source, category }` — paste in text directly (a report excerpt, a filing) instead of scraping
- `GET /api/knowledge` — see what's in the knowledge base so far

`category` is one of `market` / `competitor` / `risk` / `general` — matches the graph node that will retrieve it.

## What this evaluates

Every submitted idea is scored on three axes, each explained in plain English:

- **Sustainability** — can this keep operating and serving customers over years, not just survive launch?
- **Scalability** — can it grow significantly without a proportional increase in cost or effort?
- **Profitability** — does revenue realistically exceed cost, and on what timeline?

The evaluation also produces five written modules (`summary.revenueStreams`, `summary.costStructure`, `summary.marketScalability`, `summary.riskExposure`, `summary.profitabilityTimeline`) and 6-8 evidence items, each tagged with which score it's a signal for (`agentStep: 'sustainability' | 'scalability' | 'profitability' | 'general'`) — this is what powers the client's Explainability Dashboard.

## Continuous Q&A

`POST /api/validations/:id/chat` — the founder can ask unlimited follow-up questions about their model, and each answer is grounded in that model's own evaluation + evidence + the running conversation. `GET /api/validations/:id/chat` returns the full thread.

## API

| Route | Purpose |
|---|---|
| `POST /api/auth/register`, `/login`, `GET /me` | Auth |
| `POST /api/validations` | Submit a business model, kicks off evaluation |
| `GET /api/validations/:id/status` | Poll while evaluating |
| `GET /api/validations/:id` | Full evaluation (title, industry, scores, summary) |
| `GET /api/validations/:id/evidence` | Evidence/signals list |
| `GET /api/validations/:id/charts` | Chart data for the Explainability Dashboard |
| `GET /api/validations/:id/chat`, `POST .../chat` | Continuous Q&A (each answer does a fresh RAG lookup for that specific question) |
| `GET /api/reports` | List past evaluations |
| `GET /api/knowledge` | List what's in the RAG knowledge base |
| `POST /api/knowledge/url`, `/text` | Ingest a new source (scrape a URL, or paste text) into the knowledge base |

## Folder structure

```
server/
├── package.json
├── .env.example
├── server.js
└── src/
    ├── app.js
    ├── config/{db.js, env.js}
    ├── models/{User, Validation, Evidence, ChatMessage, Report, KnowledgeChunk}.js
    ├── middleware/{authMiddleware, errorHandler}.js
    ├── controllers/{authController, validationController, chatController, reportController, knowledgeController}.js
    ├── routes/{authRoutes, validationRoutes, reportRoutes, knowledgeRoutes}.js
    ├── services/
    │   ├── aiClient.js            # Ollama chat completions wrapper (retry/backoff)
    │   ├── embeddingClient.js     # Ollama embeddings + cosine similarity
    │   ├── ragService.js          # chunk / ingest / retrieve against KnowledgeChunk
    │   ├── scraperService.js      # fetch + cheerio -> ragService.ingestText
    │   ├── langgraphPipeline.js   # the real 4-node LangGraph agent graph
    │   └── validationPipeline.js  # orchestrates one Validation doc through the graph
    ├── scripts/seedKnowledge.js   # one-time/re-runnable knowledge base seeder
    └── utils/generateToken.js
```

Verified: `npm install` clean (after adding `@langchain/core`, `@langchain/langgraph`, `cheerio` to `package.json` — the RAG/LangGraph files needed them but they were missing), every touched file passes `node --check`, `validationPipeline.js` now actually calls the LangGraph graph instead of the old single-call `generateValidationJSON`. Live register→login→seed→evaluate→chat round trip needs a real MongoDB + Ollama running locally — test that on your machine.

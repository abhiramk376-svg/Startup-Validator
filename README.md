# Autonomous Model Evaluator

An AI-powered business-model evaluator. Describe a startup idea and a team of AI agents researches the market, studies competitors, assesses risks, and produces a scored report on **sustainability, scalability and profitability**, with an **Ask AI** chat grounded in that report.

Built with a **MERN stack**, **RAG** and a **LangGraph.js multi-agent workflow**.



## Features

- Multi-agent evaluation: Market Research, Competitor Analysis, Risk Assessment, Report Generator
- RAG-grounded answers: agents reason over retrieved sources, not just model memory
- Live results: each agent's output appears step by step as it finishes
- Scores for sustainability, scalability, profitability and overall
- Charts, key factors and an evidence list linked to real sources
- Ask AI chat for follow-up questions about your evaluation
- Automatic fallback between AI models/providers when free-tier limits are hit
- JWT authentication and saved evaluation history

## How it works

```
Idea -> Market Research -> Competitor Analysis -> Risk Assessment -> Report Generator
            (RAG)               (RAG)                 (RAG)
```

1. **LangGraph.js** runs four agent nodes in sequence, passing findings through shared state.
2. Each of the first three agents does a **RAG** lookup: the idea is embedded, compared (cosine similarity) against knowledge chunks stored in MongoDB, and the best matches are given to the LLM.
3. The Report Generator combines everything into scores, a summary, charts and evidence.
4. Progress is saved to MongoDB as each agent finishes, and the client polls to show it live.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas free tier works) |
| Agents | LangGraph.js |
| RAG | Gemini embeddings + cosine similarity over MongoDB |
| LLM | Gemini (free tier), with Groq (Llama 3.3 70B) as fallback |
| Auth | JWT |

## Getting started

### Prerequisites
- Node.js 18+
- A MongoDB database (local, or free MongoDB Atlas)
- A free Gemini API key: https://aistudio.google.com/apikey
-  A free Groq API key: https://console.groq.com/keys

### 1. Clone
```bash
git clone https://github.com/YOUR-USERNAME/autonomous-model-evaluator.git
cd autonomous-model-evaluator
```

### 2. Server
```bash
cd server
npm install
cp .env.example .env     # on Windows: copy .env.example .env
```
Edit `server/.env` and fill in `MONGO_URI`, `JWT_SECRET`, `AI_PROVIDER_API_KEY` and `EMBEDDING_PROVIDER_API_KEY` (your Gemini key). For the Groq fallback, also set `AI_FALLBACK_BASE_URL`, `AI_FALLBACK_API_KEY` and `AI_FALLBACK_MODEL`.

Seed the knowledge base (once), then start the server:
```bash
npm run seed:knowledge
npm run dev
```
The API runs on http://localhost:5000.

### 3. Client
In a second terminal:
```bash
cd client
npm install
npm run dev
```
Open http://localhost:5173.

## Environment variables (server)

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign login tokens |
| `AI_PROVIDER_API_KEY` | Gemini API key for chat/agents |
| `EMBEDDING_PROVIDER_API_KEY` | Gemini API key for embeddings (RAG) |
| `AI_FALLBACK_BASE_URL` / `AI_FALLBACK_API_KEY` / `AI_FALLBACK_MODEL` | Backup provider (e.g. Groq) |
| `AI_FALLBACK_MODELS` | Backup models on the same Gemini key (optional) |

See `server/.env.example` for the full list. Never commit your real `.env`.



## Project structure

```
server/
  src/
    services/    langgraphPipeline.js, aiClient.js, embeddingClient.js, ragService.js
    models/      Validation, KnowledgeChunk, ...
    controllers/ routes/ config/
client/
  src/
    pages/       Results.jsx, ...
    components/  results/, chat/, common/
```

## Screenshots

<img width="1888" height="900" alt="history" src="https://github.com/user-attachments/assets/47f2eea2-dbe8-42d1-89f9-06af9441e257" />
<img width="1888" height="900" alt="history" src="https://github.com/user-attachments/assets/90703df0-cded-4346-a22e-e8635a432412" />



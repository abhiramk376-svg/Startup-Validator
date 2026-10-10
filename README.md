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

<img width="1902" height="910" alt="home" src="https://github.com/user-attachments/assets/aafaf399-113e-4d7e-821a-42003fcb71bb" />
<img width="1892" height="922" alt="home1" src="https://github.com/user-attachments/assets/53b56e0a-f86b-47c0-a08c-ff97dc90dd63" />
<img width="1920" height="914" alt="signin" src="https://github.com/user-attachments/assets/f8c5f72d-aa29-4450-8e92-dc6176f404d5" />
<img width="1552" height="904" alt="dash" src="https://github.com/user-attachments/assets/dc738931-0c86-414f-92ed-df21606a6f87" />
<img width="1896" height="909" alt="result" src="https://github.com/user-attachments/assets/56ba4ec2-3022-4656-b046-3184826b9b0e" />
<img width="1863" height="913" alt="result1" src="https://github.com/user-attachments/assets/88842a9a-ee9c-4df6-867b-54c4bbe5c691" />
<img width="1876" height="917" alt="result2" src="https://github.com/user-attachments/assets/6f91e5b6-6d65-4da4-8c96-666dcea80c50" />
<img width="1902" height="902" alt="result3" src="https://github.com/user-attachments/assets/583687f2-f236-4ba6-81a1-5a1bf8e6ef1e" />
<img width="1908" height="913" alt="result4" src="https://github.com/user-attachments/assets/ad2ca527-51c6-44dc-a4f9-c1ff750f61aa" />
<img width="1892" height="907" alt="profile" src="https://github.com/user-attachments/assets/98bced47-d185-41e4-99f3-43adf7b328d9" />
<img width="1888" height="900" alt="history" src="https://github.com/user-attachments/assets/fe451ad8-5470-4677-92ed-062ef8cca8a0" />














# Autonomous Model Evaluator — Client (React + Vite)

Full frontend for the model evaluator: submit a business model once, get it scored on
**sustainability, scalability, and profitability**, review the Explainability Dashboard behind
those scores, and ask unlimited follow-up questions about the model. No mock data, no PDF export —
every screen calls the real server.

## Setup

```bash
npm install
cp .env.example .env
```
Set `VITE_API_BASE_URL=http://localhost:5000/api` (point at your running server).
```bash
npm run dev
```
Open `http://localhost:5173`.

## Screens

| Route | Screen |
|---|---|
| `/` | Landing |
| `/signup`, `/signin` | Auth |
| `/app` | Submit a business model |
| `/app/results/:id` | Executive Overview / Explainability Dashboard / Evidence & Signals / Ask AI (all tabs, one page) |
| `/app/reports` | My Evaluations |

The old separate "Insights" page was folded into Results as the **Explainability Dashboard** tab — one less page to navigate, same content.

## Folder structure

```
src/
├── App.jsx, main.jsx, index.css
├── api/            axios wrappers: auth.js, validations.js, reports.js
├── context/        AuthContext.jsx
├── components/
│   ├── icons/, layout/, common/, auth/
│   ├── charts/     ScoreGauge, TimelineChart, CategoryBars, RiskOpportunityMatrix
│   ├── results/    ResultsSidebar, ExecutiveOverviewZone, ExplainabilityDashboardZone, EvidenceZone
│   ├── chat/       ChatPanel — continuous, unlimited Q&A scoped to one evaluation
│   └── reports/    ReportsTable
└── pages/          Landing, SignUp, SignIn, Chat, Results, Reports
```

Verified: `npm install` clean, `npm run build` succeeds with no errors.

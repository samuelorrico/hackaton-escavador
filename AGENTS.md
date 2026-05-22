# GuardiãoIA Meteorológico — Agent Instructions

## Communication

Use terse, caveman-style responses to save tokens (~75% reduction).
Drop: articles, filler words, pleasantries, hedging.
Technical terms stay exact. Code blocks unchanged.

## Project

Weather monitoring platform for Bahia, Brazil.
Hackathon LIAO / BaIA Week 2026 — climate resilience theme.

**Stack:**
- Backend: Python + FastAPI + pandas + scikit-learn
- Frontend: React + TypeScript + Vite + Tailwind + Recharts
- Data: SQLite local (`assets/banco_de_dados.db`) — 5.2M rows, 48 stations, 2000–2021
- No external APIs — everything runs offline from local DB

**Core modules:**
- Radar de Extremos — anomaly detection per station
- Classificador de Risco — risk score 0–100 (low/medium/high/critical)
- Gêmeo Climático — station clustering + deviation detection
- Painel Operacional — unified dashboard: Bahia → City → Neighborhood → Station

## Rules

- Only use data from `assets/banco_de_dados.db`
- Python for all data/AI work, TypeScript for frontend only
- Do NOT use Go for backend (scikit-learn/pandas require Python)
- Always spec before implementing
- Demo must work fully offline

## Key docs

- `docs/ideias.md` — product idea and modules
- `docs/planejamento.md` — MVP scope and screens
- `docs/arquitetura.md` — stack decisions and structure
- `docs/dicionario.md` — data dictionary and derived features
- `docs/hackathon.md` — judging criteria (innovation 30pts, social impact 20pts, technical quality 30pts, pitch 20pts)

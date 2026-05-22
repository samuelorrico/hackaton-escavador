# GuardiãoIA Meteorológico

Plataforma de monitoramento climático inteligente para a Bahia.
**Hackathon LIAO / BaIA Week 2026 — Resiliência Climática e Cidades Inteligentes.**

Transforma 5,2 milhões de registros históricos de 48 estações INMET em alertas operacionais de risco climático — 100% offline, sem APIs externas.

---

## Módulos

| Módulo | Algoritmo | O que faz |
|---|---|---|
| **Radar de Extremos** | IsolationForest | Detecta leituras que se isolam do padrão histórico da estação |
| **Classificador de Risco** | Scoring por percentis | Score 0–100 comparando condições atuais com o pior histórico |
| **Gêmeo Climático** | KMeans | Agrupa estações por perfil climático e detecta desvios do grupo |
| **Painel Operacional** | — | Dashboard unificado: Bahia → Cidade → Estação |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Python 3.11 + FastAPI + pandas + scikit-learn |
| Banco de dados | SQLite (5,2M linhas · 48 estações · 2000–2021) |
| Cache | Parquet (pyarrow) — reinicialização em ~30s vs 3–5min sem cache |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + Recharts |
| IA | IsolationForest · KMeans · scoring por percentis históricos |

---

## Como rodar

### Requisitos

- Python 3.11+
- Node.js 18+
- O arquivo `assets/banco_de_dados.db` (fornecido separadamente — não versionado)

### Backend

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

python -m uvicorn backend.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend abre em `http://localhost:5173`.

Na **primeira inicialização**, o backend processa os dados (~3–5 min). As reinicializações seguintes usam cache parquet (~30s). Uma barra de progresso exibe o status em tempo real.

---

## Estrutura

```
assets/                   banco_de_dados.db (não versionado)
backend/
  data/
    loader.py             leitura SQLite + feature engineering
    features.py           acumulados de chuva, deltas, z-scores
    store.py              estado global dos dados em memória
  models/
    anomaly.py            IsolationForest por estação
    risk.py               scoring ponderado por percentis
    gemeo.py              KMeans + deviation score
  routes/                 endpoints FastAPI
  main.py                 lifespan async + pipeline em background
frontend/
  src/
    components/           layout/, ui/ (Card, FilterBar, InfoTooltip...)
    pages/                Dashboard, Radar, Classificador, Gêmeo, Station, City
    hooks/                useApi, useDashboardData, useBackendReady
    types/                tipos TypeScript da API
```

---

## Dados

- **Fonte:** INMET — Instituto Nacional de Meteorologia
- **Cobertura:** 48 estações automáticas do estado da Bahia
- **Período:** 2000–2021
- **Volume:** ~5,2 milhões de leituras horárias
- **Variáveis:** precipitação, temperatura, pressão, umidade, vento, radiação

---

## Decisões técnicas

**Score relativo à estação:** O classificador usa percentis históricos da própria estação — 100 = pior condição já registrada *naquela estação específica*. Isso calibra o sistema para o microclima local em vez de usar limites absolutos.

**Dados em memória:** Com 5,2M linhas pré-processadas, queries SQLite em tempo real seriam lentas demais. O pipeline roda uma vez no startup, tudo fica em RAM.

**Cache parquet:** Reduz cold start de 3–5 min para ~30s nas reinicializações após o primeiro boot.

**Startup assíncrono:** O pipeline roda em background thread via `asyncio.create_task` + `run_in_executor`, então o servidor aceita conexões em ~1s e a barra de progresso funciona desde o início.

---

## Licença

Projeto desenvolvido para o Hackathon BaIA Week 2026.

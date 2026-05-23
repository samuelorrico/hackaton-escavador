# Deploy — GuardiãoIA Meteorológico

Como publicar a plataforma com **URL pública, grátis e sem perder funcionalidade**.

## Por que não Vercel (para o backend)

A Vercel é serverless/stateless. O backend é stateful: o pipeline roda no boot e
mantém 5,2M leituras processadas **em RAM** (`DataStore`). Em serverless cada
invocação é um processo novo → o store volta vazio → 503 em tudo. Além disso o
parquet de features (137 MB) + 48 modelos estouram o limite de 250 MB de função.

→ **Frontend** roda liso na Vercel; **backend** precisa de processo persistente.

## Estratégia recomendada: Hugging Face Spaces (Docker), URL única

Um único container serve a API (`/api/*`) **e** o frontend React (todo o resto).
HF Spaces free dá **16 GB de RAM** — folgado para o pandas/scikit-learn (os hosts
free concorrentes dão 512 MB, apertado para esse pipeline).

| | Valor |
|---|---|
| Plataforma | Hugging Face Spaces — SDK **Docker** |
| RAM (free) | 16 GB |
| Porta | 7860 |
| Payload | ~164 MB de artefatos (sem o banco de 626 MB) |
| URL | `https://<user>-<space>.hf.space` |

### O que vai no deploy (e o que NÃO vai)

O banco `assets/banco_de_dados.db` (626 MB) **não** é necessário em runtime — ele só
**gera** os artefatos. O container só precisa de:

- `backend/models/artifacts/features_cache.parquet` (~137 MB)
- `backend/models/artifacts/isolation_forest/*.joblib` (48 modelos, ~30 MB)
- `backend/models/artifacts/clustering/kmeans.joblib`

Gere-os uma vez localmente (precisa do banco):

```bash
make train          # = python backend/scripts/train_models.py
```

> O `.gitignore` do projeto ignora `backend/models/artifacts/`. No repositório do
> Space eles **precisam** ser versionados via Git LFS (ver passo 3).

### Passo a passo (HF Spaces)

**1. Teste local com Docker** (valida a imagem antes de subir):

> **Antes de tudo: abra o Docker Desktop** e espere o ícone ficar verde (daemon
> ativo). Sem ele, `make docker-build` falha com
> `failed to connect to the docker API ... check if the daemon is running`.

```bash
make docker-build           # docker build -t guardiaoia .
make docker-run             # http://localhost:7860
```

Abra `http://localhost:7860` — a barra de progresso aparece e em ~30–60s o painel
carrega. (O primeiro acesso pode levar ~1 min enquanto o store popula.)

**2. Crie o Space** em huggingface.co → New Space → SDK **Docker** → Blank.

**3. Configure Git LFS e envie** (no diretório do projeto):

```bash
git lfs install
# o .gitattributes do projeto já rastreia *.parquet e *.joblib
git remote add space https://huggingface.co/spaces/<user>/<space>
git add -f backend/models/artifacts        # força, pois estão no .gitignore
git add .gitattributes Dockerfile
git commit -m "deploy: artefatos + Dockerfile"
git push space main
```

**4. Header do Space** — garanta que o `README.md` na raiz do Space comece com:

```yaml
---
title: GuardiãoIA Meteorológico
sdk: docker
app_port: 7860
---
```

O HF builda o `Dockerfile` automaticamente. Pronto: URL pública única.

## Alternativa: frontend separado (Vercel) + backend (HF Spaces)

Vantagem: o frontend num CDN global (mais rápido) e deploy independente. Custo:
2 URLs + configurar CORS.

**Backend (HF Spaces):** mesma imagem; defina a env `CORS_ORIGINS` com a URL da Vercel.

**Frontend (Vercel):**
- Root directory: `frontend`
- Build command: `npm run build` · Output: `dist`
- Env var: `VITE_API_URL=https://<user>-<space>.hf.space/api`

Como o backend serve a API sob `/api`, o `VITE_API_URL` aponta para `.../api`.

## Variáveis de ambiente (backend)

| Var | Default | Para quê |
|---|---|---|
| `PORT` | 7860 | Porta do uvicorn (Render/Railway injetam) |
| `FRONTEND_DIST` | `frontend/dist` | Pasta do SPA buildado; se não existir, API roda sozinha |
| `CORS_ORIGINS` | `http://localhost:5173` | Origens liberadas (frontend separado) |
| `DB_PATH` | `assets/banco_de_dados.db` | Só usado se faltar cache (re-treina) |
| `SKIP_STARTUP` | `0` | `1` pula o pipeline (usado em testes) |

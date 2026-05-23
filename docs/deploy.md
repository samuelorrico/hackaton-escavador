# Deploy — GuardiãoIA Meteorológico

Como publicar a plataforma com **URL pública, grátis e sem perder funcionalidade**.

> ✅ **No ar:** https://samuelorrico-guardiaoai.hf.space — Hugging Face Spaces, URL
> única (API + frontend no mesmo container). Este guia documenta como foi feito e
> como atualizar a demo.

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

**3. Crie um token de escrita** em huggingface.co/settings/tokens → **New token** →
Type **Write**. O git por HTTPS **não aceita a senha da conta**: no push, a "senha"
é esse token. (Alternativa: rodar `hf auth login` uma vez — `pip install -U huggingface_hub`.)

**4. Envie numa branch dedicada** — mantém o `main` do GitHub limpo, sem os 164 MB:

```bash
git lfs install
git remote add space https://huggingface.co/spaces/<user>/<space>

git checkout -b deploy-hf            # branch só para o deploy

# Adicione o cabeçalho YAML no TOPO do README.md (o Space precisa dele):
#   ---
#   title: <nome>
#   sdk: docker
#   app_port: 7860
#   ---
# edite e salve o README.md, então:

git add -f backend/models/artifacts  # força: estão no .gitignore. .gitattributes manda p/ LFS
git add README.md
git commit -m "deploy(hf): config do Space + artefatos via LFS"

# 1º deploy usa --force: o Space tem um commit inicial automático (história não-relacionada)
git push space deploy-hf:main --force
```

Ao pedir credencial: **usuário** = seu login HF · **senha** = o **token** (passo 3).
O HF detecta o `Dockerfile`, builda e publica em `https://<user>-<space>.hf.space`.

> ⚠️ Não rode `git push origin deploy-hf` — mandaria os 164 MB para o GitHub. A
> `deploy-hf` é só para o Space; seu `main` continua limpo. Para voltar ao trabalho
> normal: `git checkout main`.

### Atualizar a demo (após o 1º deploy)

A história já está alinhada — **sem `--force`** daqui pra frente:

```bash
git checkout deploy-hf
git merge main          # traz o que mudou no main
                        # (se README.md conflitar, mantenha o cabeçalho YAML do topo)
git add -f backend/models/artifacts   # só se rodou `make train` de novo
git push space deploy-hf:main
git checkout main       # volta ao trabalho normal
```

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

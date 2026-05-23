# =========================================================================
# GuardiãoIA Meteorológico — imagem de URL única (API + frontend juntos)
# Backend FastAPI serve a API sob /api/* e o SPA React buildado em todo o resto.
# Porta 7860 (padrão Hugging Face Spaces); honra $PORT em outros hosts.
# =========================================================================

# ---------- Stage 1: build do frontend ----------
FROM node:20-slim AS frontend
WORKDIR /fe
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
# VITE_API_URL não é definido de propósito: o default é /api (mesma origem).
# `npm run build` = tsc -b (type-check) + vite build (bundle).
RUN npm run build

# ---------- Stage 2: runtime Python ----------
FROM python:3.11-slim AS runtime

# Usuário não-root (padrão de Spaces); home gravável.
RUN useradd -m -u 1000 user
WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Código + artefatos pré-treinados (features_cache.parquet + *.joblib),
# versionados via Git LFS no repositório do Space. --chown garante que o
# boot consiga reescrever kmeans.joblib (train_clustering roda no startup).
COPY --chown=user:user backend/ ./backend/
COPY --chown=user:user --from=frontend /fe/dist ./frontend/dist

ENV FRONTEND_DIST=/app/frontend/dist \
    PORT=7860 \
    PYTHONUNBUFFERED=1

USER user
EXPOSE 7860
CMD ["sh", "-c", "python -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

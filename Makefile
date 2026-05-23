.PHONY: help setup setup-back setup-front dev dev-back dev-front test test-back test-front lint build train clean docker-build docker-run

# Alvo padrão: lista os comandos disponíveis
help:
	@echo GuardiaoIA Meteorologico - comandos disponiveis:
	@echo.
	@echo   make setup        Instala dependencias (backend + frontend)
	@echo   make setup-back   Instala dependencias do backend
	@echo   make setup-front  Instala dependencias do frontend
	@echo   make dev          Sobe back + front juntos (2 janelas)
	@echo   make dev-back     Sobe a API FastAPI (uvicorn --reload)
	@echo   make dev-front    Sobe o frontend Vite (localhost:5173)
	@echo   make test         Roda todos os testes (backend + frontend)
	@echo   make test-back    Roda os testes do backend (pytest)
	@echo   make test-front   Roda os testes do frontend (vitest)
	@echo   make lint         Roda o eslint no frontend
	@echo   make build        Build de producao do frontend (tsc + vite)
	@echo   make train        Treina os modelos de IA
	@echo   make docker-build Builda a imagem de URL unica (API + frontend)
	@echo   make docker-run   Roda a imagem localmente em http://localhost:7860
	@echo.
	@echo Nota: 'make dev' abre back e front em janelas separadas (Windows).

# --- Setup ---
setup: setup-back setup-front

setup-back:
	pip install -r backend/requirements.txt

setup-front:
	cd frontend && npm install

# --- Desenvolvimento ---
# 'make dev' abre back e front em janelas separadas (Windows / cmd).
# Em git-bash/WSL use 'make dev-back' e 'make dev-front' em terminais separados.
dev:
	start "GuardiaoIA Backend" cmd /k python -m uvicorn backend.main:app --reload
	start "GuardiaoIA Frontend" cmd /k "cd frontend && npm run dev"

dev-back:
	python -m uvicorn backend.main:app --reload

dev-front:
	cd frontend && npm run dev

# --- Testes ---
test: test-back test-front

test-back:
	pytest

test-front:
	cd frontend && npm test

# --- Qualidade ---
lint:
	cd frontend && npm run lint

# --- Build / IA ---
build:
	cd frontend && npm run build

train:
	python backend/scripts/train_models.py

# --- Docker (deploy de URL unica: API FastAPI + frontend no mesmo container) ---
docker-build:
	docker build -t guardiaoia .

docker-run:
	docker run --rm -p 7860:7860 guardiaoia

# --- Limpeza ---
clean:
	cd frontend && rmdir /s /q dist 2>nul || exit 0

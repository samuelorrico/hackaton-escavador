# Spec: Setup do Backend

**Este arquivo:** specs/backend/setup.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## Critérios de aceite

- [ ] [`backend/`](../../backend/) criado com estrutura de pastas definida
- [ ] [`backend/requirements.txt`](../../backend/requirements.txt) com todas as dependências fixadas
- [ ] Servidor sobe com `uvicorn backend.main:app --reload`
- [ ] [`backend/tests/`](../../backend/tests/) configurado com `pytest`
- [ ] `pytest` roda sem erro em projeto vazio

## Estrutura

```
backend/
  main.py                  FastAPI app + startup
  data/
    pipeline.py            load_raw_data, validate_schema
    features.py            build_feature_matrix e funções auxiliares
  models/
    anomaly.py             train + predict anomaly
    risk.py                compute_risk_score
    gemeo.py               train_clustering, get_station_cluster_info
    artifacts/             modelos .joblib salvos (gitignore banco)
  routes/
    dashboard.py
    stations.py
    cities.py
    radar.py
    risk.py
    clusters.py
  schemas/                 Pydantic response models
  tests/
    conftest.py            fixtures (sample df, mock data)
    test_data_pipeline.py
    test_feature_engineering.py
    test_anomaly.py
    test_risk.py
    test_gemeo.py
    test_api_*.py
```

## requirements.txt

```
fastapi==0.111.0
uvicorn[standard]==0.29.0
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.4.2
joblib==1.4.0
pytest==8.2.0
httpx==0.27.0
```

## Tasks

- [ ] **T1** Criar estrutura de pastas
- [ ] **T2** Criar [`backend/requirements.txt`](../../backend/requirements.txt)
- [ ] **T3** Criar [`backend/main.py`](../../backend/main.py) com app vazia + health check
- [ ] **T4** Criar [`backend/tests/conftest.py`](../../backend/tests/conftest.py) com fixture de sample DataFrame
- [ ] **T5** Confirmar `pytest` roda sem erro
- [ ] **T6** Commit: `chore(backend): initial project structure and dependencies`

## Workflow

```
Spec → Test → Code → Review → Commit
```
1. Ler este spec completo
2. Escrever testes (ver path de testes acima) — rodar: devem falhar
3. Implementar até testes passarem
4. `/caveman-review` — code review
5. `git commit` com mensagem do formato especificado
6. Marcar tasks como ✅ em [specs/MASTER.md](../MASTER.md)

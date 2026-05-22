# Spec: API Endpoints (FastAPI)

**Este arquivo:** specs/backend/api-endpoints.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Camada de API que expõe todos os dados processados para o frontend.
FastAPI + dados pré-computados carregados em memória na inicialização.

## Por quê

Frontend precisa de dados via HTTP JSON. API deve ser rápida — dados já processados, sem cálculo on-demand.

## Critérios de aceite

- [ ] Servidor sobe com `uvicorn backend.main:app`
- [ ] Todos os dados carregados em memória no startup (sem query pesada por request)
- [ ] CORS habilitado para `localhost:5173` (Vite dev server)
- [ ] Todos os endpoints retornam JSON válido
- [ ] Endpoints de lista têm paginação ou limite configurável
- [ ] Erros retornam `{ "error": "mensagem" }` com HTTP status correto
- [ ] Sem autenticação (MVP offline)
- [ ] Health check endpoint
- [ ] Tempo de resposta < 200ms para qualquer endpoint (dados em memória)

## Endpoints

### Sistema

```
GET /health
→ { "status": "ok", "stations_loaded": 48, "records_loaded": 5200000 }
```

### Dashboard

```
GET /dashboard/summary
→ {
    "total_stations": 48,
    "critical_stations": 3,
    "high_risk_stations": 7,
    "top_risk_station": { station_id, risk_score, risk_level },
    "most_anomalous_station": { station_id, anomaly_score },
    "cities_with_alert": 5
  }

GET /dashboard/risk-ranking?limit=10
→ [ { station_id, city, risk_score, risk_level, anomaly_score } ]
```

### Estações

```
GET /stations
→ [ { station_id, city, lat?, lon?, cluster_label, risk_level } ]

GET /stations/{station_id}
→ {
    station_id, city, risk_score, risk_level, anomaly_score, anomaly_label,
    climate_cluster, cluster_label, cluster_deviation_score,
    current_readings: { rain_1h_mm, pressure_mb, air_temp_c, humidity_pct, wind_gust_ms },
    risk_factors: [ { factor, contribution, value, label } ]
  }

GET /stations/{station_id}/history?days=30
→ [ { timestamp, risk_score, rain_1h_mm, pressure_mb, air_temp_c, humidity_pct, wind_gust_ms } ]

GET /stations/{station_id}/anomaly-history?days=30
→ [ { timestamp, anomaly_score, anomaly_label, main_driver } ]
```

### Cidades

```
GET /cities
→ [ { city, station_count, avg_risk_score, max_risk_level, stations: [station_id] } ]

GET /cities/{city_slug}
→ {
    city, stations: [...],
    avg_risk_score, dominant_risk_level,
    most_critical_station: { station_id, risk_score }
  }
```

### Radar de Extremos

```
GET /radar/ranking?limit=10
→ [ { station_id, city, anomaly_score, anomaly_label, main_driver, driver_value } ]

GET /radar/station/{station_id}
→ {
    station_id,
    current_anomaly_score,
    anomaly_label,
    main_driver,
    history: [ { timestamp, anomaly_score } ]
  }
```

### Classificador de Risco

```
GET /risk/distribution
→ { baixo: 20, medio: 15, alto: 8, critico: 5 }

GET /risk/station/{station_id}
→ {
    station_id, risk_score, risk_level,
    risk_factors: [...],
    history: [ { timestamp, risk_score, risk_level } ]
  }
```

### Gêmeo Climático

```
GET /clusters
→ [ { cluster_id, label, station_count, stations: [station_id] } ]

GET /clusters/{cluster_id}
→ {
    cluster_id, label, station_count,
    profile: { avg_rain, avg_temp, avg_humidity, avg_pressure },
    stations: [ { station_id, city, deviation_score } ]
  }

GET /clusters/station/{station_id}
→ {
    station_id,
    climate_cluster, cluster_label,
    cluster_deviation_score,
    similar_stations: [ { station_id, city } ],
    profile_comparison: { station: {...}, cluster_avg: {...} }
  }
```

## Tasks

- [ ] **T1** Escrever teste: `test_health_returns_200`
- [ ] **T2** Escrever teste: `test_dashboard_summary_has_required_fields`
- [ ] **T3** Escrever teste: `test_stations_list_returns_all_48`
- [ ] **T4** Escrever teste: `test_station_detail_has_risk_factors`
- [ ] **T5** Escrever teste: `test_history_respects_days_param`
- [ ] **T6** Escrever teste: `test_invalid_station_returns_404`
- [ ] **T7** Escrever teste: `test_all_endpoints_respond_under_200ms`
- [ ] **T8** Implementar [`backend/main.py`](../../backend/main.py) com startup data loading
- [ ] **T9** Implementar roteadores: [`backend/routes/dashboard.py`](../../backend/routes/dashboard.py), [`backend/routes/stations.py`](../../backend/routes/stations.py), [`backend/routes/cities.py`](../../backend/routes/cities.py), [`backend/routes/radar.py`](../../backend/routes/radar.py), [`backend/routes/risk.py`](../../backend/routes/risk.py), [`backend/routes/clusters.py`](../../backend/routes/clusters.py)
- [ ] **T10** Implementar `city_slug` — normalização de nome de cidade para URL
- [ ] **T11** Implementar CORS middleware
- [ ] **T12** Implementar handlers de erro (404, 500)
- [ ] **T13** Implementar paginação com `limit` e `offset` nos endpoints de lista
- [ ] **T14** Rodar todos os testes — verde
- [ ] **T15** Code review
- [ ] **T16** Commit: `feat(api): implement all FastAPI endpoints`

## Dependências

- [backend/classificador-risco.md](classificador-risco.md) completo
- [backend/radar-anomaly.md](radar-anomaly.md) completo
- [backend/gemeo-climatico.md](gemeo-climatico.md) completo

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

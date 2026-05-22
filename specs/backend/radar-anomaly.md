# Spec: Radar de Extremos Climáticos

**Este arquivo:** specs/backend/radar-anomaly.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Módulo de detecção de anomalias meteorológicas por estação.
Usa `IsolationForest` treinado no histórico de cada estação para calcular `anomaly_score`.
Saída: score de anomalia por leitura + ranking de estações mais anômalas.

## Por quê

Identifica quando uma estação está em comportamento incomum — base para alertas operacionais.
Banca avalia IA no núcleo: precisa ser modelo real, não só threshold manual.

## Critérios de aceite

- [ ] Modelo treinado por estação individualmente (não um modelo global)
- [ ] Features de entrada: `rain_24h_mm`, `pressure_delta_1h`, `temp_delta_1h`, `humidity_delta_1h`, `rain_zscore`, `pressure_zscore`
- [ ] `anomaly_score` normalizado para range [0, 1] (0 = normal, 1 = extremo)
- [ ] Modelos persistidos com `joblib` em [`backend/models/isolation_forest/`](../../backend/models/isolation_forest/)
- [ ] Função de predição carrega modelo já treinado (sem retreinar na API)
- [ ] Ranking retorna top N estações com maior `anomaly_score` atual
- [ ] `anomaly_label`: `normal` (score < 0.4), `atípico` (0.4–0.7), `extremo` (> 0.7)
- [ ] Tipo de extremo detectado: identifica qual variável mais contribuiu

## Fora de escopo

- Retreinamento automático em produção
- Streaming em tempo real
- Alertas por push/WhatsApp/email

## Interface esperada

```python
# backend/models/anomaly.py

def train_anomaly_models(feature_df: pd.DataFrame, output_dir: str) -> dict:
    """Treina IsolationForest por estação. Salva modelos em output_dir."""

def predict_anomaly_score(
    feature_df: pd.DataFrame,
    models_dir: str
) -> pd.DataFrame:
    """Carrega modelos e calcula anomaly_score por linha. Adiciona anomaly_label."""

def get_extremes_ranking(
    scored_df: pd.DataFrame,
    top_n: int = 10,
    reference_timestamp: str = None
) -> list[dict]:
    """Retorna top_n estações com maior anomaly_score no timestamp mais recente."""
```

## Schema de saída

```json
{
  "station_id": "A401",
  "timestamp": "2021-01-31T18:00:00",
  "anomaly_score": 0.82,
  "anomaly_label": "extremo",
  "main_driver": "rain_24h_mm",
  "driver_value": 142.5,
  "driver_zscore": 4.1
}
```

## Tasks

- [ ] **T1** Escrever teste: `test_train_creates_model_per_station` — verifica arquivo por estação
- [ ] **T2** Escrever teste: `test_anomaly_score_range_0_to_1` — score sempre [0,1]
- [ ] **T3** Escrever teste: `test_anomaly_label_boundaries` — threshold correto
- [ ] **T4** Escrever teste: `test_ranking_returns_top_n` — tamanho e ordem
- [ ] **T5** Escrever teste: `test_predict_uses_saved_model_not_retrain` — mock de joblib.load
- [ ] **T6** Implementar `train_anomaly_models` com `IsolationForest(contamination=0.05)`
- [ ] **T7** Implementar normalização do score para [0,1] via `min-max` por estação
- [ ] **T8** Implementar `predict_anomaly_score` carregando modelos salvos
- [ ] **T9** Implementar lógica de `anomaly_label` com os thresholds definidos
- [ ] **T10** Implementar detecção de `main_driver` via SHAP ou feature importance aproximada
- [ ] **T11** Implementar `get_extremes_ranking` com agregação por timestamp
- [ ] **T12** Script [`backend/scripts/train_models.py`](../../backend/scripts/train_models.py) para treinar e salvar todos os modelos
- [ ] **T13** Rodar todos os testes — verde
- [ ] **T14** Code review
- [ ] **T15** Commit: `feat(radar): implement anomaly detection with IsolationForest`

## Dependências

- [backend/feature-engineering.md](feature-engineering.md) completo

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

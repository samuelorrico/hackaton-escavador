# Spec: Classificador de Risco Meteorológico

**Este arquivo:** specs/backend/classificador-risco.md
**Workflow obrigatório:** Spec → Test → Code → Review → Commit — ver [specs/WORKFLOW.md](../WORKFLOW.md)

## O quê

Módulo que calcula `risk_score` (0–100) e `risk_level` por estação.
Usa regras derivadas do histórico + features de anomalia para produzir score interpretável.
Abordagem: scoring ponderado + calibração por percentil histórico.

## Por quê

Traduz sinais técnicos em decisão operacional simples.
30pts de Qualidade Técnica dependem de IA real e interpretável no núcleo.

## Critérios de aceite

- [ ] `risk_score` no range [0, 100] para toda estação e timestamp
- [ ] `risk_level`: `baixo` (0–25), `médio` (26–50), `alto` (51–75), `crítico` (76–100)
- [ ] Score baseado em pelo menos 4 fatores: chuva acumulada, delta pressão, anomaly_score, umidade
- [ ] Cada fator tem peso documentado e justificado
- [ ] Pesos calibrados usando percentis do histórico da estação (não valores absolutos fixos)
- [ ] `risk_factors`: lista dos 3 fatores que mais contribuíram para o score
- [ ] Função de scoring é determinística e testável (sem randomness)
- [ ] Score calculado para snapshot mais recente por estação (para API)
- [ ] Score histórico calculável para qualquer timestamp (para gráficos)

## Fora de escopo

- Previsão de desastre (não há target de desastre no banco)
- Modelo supervisionado clássico (sem labels de evento)
- Alertas automáticos

## Interface esperada

```python
# backend/models/risk.py

def compute_risk_score(
    feature_df: pd.DataFrame,
    scored_df: pd.DataFrame,  # com anomaly_score
    weights: dict = None
) -> pd.DataFrame:
    """Calcula risk_score, risk_level e risk_factors por linha."""

def get_current_risk_snapshot(
    risk_df: pd.DataFrame
) -> pd.DataFrame:
    """Retorna última leitura de cada estação com risk_score atual."""

def get_risk_history(
    risk_df: pd.DataFrame,
    station_id: str,
    days: int = 30
) -> pd.DataFrame:
    """Retorna histórico de risk_score para uma estação nos últimos N dias."""
```

## Schema de saída

```json
{
  "station_id": "A401",
  "timestamp": "2021-01-31T18:00:00",
  "risk_score": 78,
  "risk_level": "crítico",
  "risk_factors": [
    {"factor": "rain_72h_mm", "contribution": 35, "value": 180.2, "label": "Chuva acumulada 72h"},
    {"factor": "pressure_delta_1h", "contribution": 28, "value": -4.2, "label": "Queda de pressão"},
    {"factor": "anomaly_score", "contribution": 15, "value": 0.82, "label": "Comportamento atípico"}
  ]
}
```

## Pesos padrão sugeridos

| Fator | Peso | Justificativa |
|---|---|---|
| `rain_72h_mm` (percentil) | 35% | Principal sinal de enchente |
| `pressure_delta_1h` (percentil) | 25% | Instabilidade atmosférica |
| `anomaly_score` | 20% | Comportamento geral fora do padrão |
| `humidity_pct` (percentil) | 10% | Saturação do ar |
| `wind_gust_ms` (percentil) | 10% | Risco de dano físico |

## Tasks

- [ ] **T1** Escrever teste: `test_risk_score_range_0_to_100`
- [ ] **T2** Escrever teste: `test_risk_level_boundaries` — cada faixa
- [ ] **T3** Escrever teste: `test_risk_factors_has_3_items`
- [ ] **T4** Escrever teste: `test_deterministic_same_input_same_output`
- [ ] **T5** Escrever teste: `test_current_snapshot_one_row_per_station`
- [ ] **T6** Implementar cálculo de percentis históricos por estação por variável
- [ ] **T7** Implementar scoring ponderado via percentis normalizados [0,100]
- [ ] **T8** Implementar mapeamento `risk_score` → `risk_level`
- [ ] **T9** Implementar `risk_factors` com contribuição percentual de cada fator
- [ ] **T10** Implementar `get_current_risk_snapshot`
- [ ] **T11** Implementar `get_risk_history`
- [ ] **T12** Rodar todos os testes — verde
- [ ] **T13** Code review
- [ ] **T14** Commit: `feat(classificador): implement risk score with weighted percentile model`

## Dependências

- [backend/radar-anomaly.md](radar-anomaly.md) completo (precisa do `anomaly_score`)

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
